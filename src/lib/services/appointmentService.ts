import { connectDB } from '../db/mongodb';
import { Appointment } from '../db/models/Appointment';
import { ActivityLog } from '../db/models/ActivityLog';
import type { IAppointment, IBarber } from '../types';

export class AppointmentService {
	// Crea una nuova prenotazione
	static async createAppointment(appointmentData: Omit<IAppointment, '_id' | 'createdAt' | 'updatedAt'>): Promise<IAppointment> {
		try {
			await connectDB();

			// Verifica che il barbiere non abbia conflitti
			const conflict = await Appointment.findOne({
				barberId: appointmentData.barberId,
				status: { $ne: 'cancelled' },
				$or: [
					{
						startTime: { $lt: appointmentData.endTime },
						endTime: { $gt: appointmentData.startTime }
					}
				]
			});

			if (conflict) {
				throw new Error('Il barbiere non è disponibile in questo orario');
			}

			const appointment = new Appointment(appointmentData);
			await appointment.save();

			// Registra l'attività
			await ActivityLog.create({
				barberId: appointmentData.barberId,
				appointmentId: appointment._id,
				activityType: 'appointment_created',
				description: `Nuova prenotazione per ${appointmentData.clientName}`,
				details: {
					service: appointmentData.service,
					price: appointmentData.price
				},
				timestamp: new Date()
			});

			return appointment.toObject() as IAppointment;
		} catch (error) {
			throw new Error(`Errore nella creazione della prenotazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Ottiene tutte le prenotazioni
	static async getAllAppointments(filters?: {
		barberId?: string;
		status?: string;
		startDate?: Date;
		endDate?: Date;
	}): Promise<IAppointment[]> {
		try {
			await connectDB();

			let query: any = {};

			if (filters?.barberId) query.barberId = filters.barberId;
			if (filters?.status) query.status = filters.status;

			if (filters?.startDate || filters?.endDate) {
				query.startTime = {};
				if (filters.startDate) query.startTime.$gte = filters.startDate;
				if (filters.endDate) query.startTime.$lte = filters.endDate;
			}

			const appointments = await Appointment.find(query)
				.populate('barberId', 'name email')
				.lean();

			return appointments as unknown as IAppointment[];
		} catch (error) {
			throw new Error(`Errore nel recupero delle prenotazioni: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Ottiene una prenotazione per ID
	static async getAppointmentById(id: string): Promise<IAppointment | null> {
		try {
			await connectDB();
			const appointment = await Appointment.findById(id)
				.populate('barberId', 'name email')
				.lean();
			return appointment as IAppointment | null;
		} catch (error) {
			throw new Error(`Errore nel recupero della prenotazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Ottiene le prenotazioni di un barbiere
	static async getBarberAppointments(barberId: string, startDate?: Date, endDate?: Date): Promise<IAppointment[]> {
		try {
			await connectDB();

			let query: any = { barberId, status: { $ne: 'cancelled' } };

			if (startDate || endDate) {
				query.startTime = {};
				if (startDate) query.startTime.$gte = startDate;
				if (endDate) query.startTime.$lte = endDate;
			}

			const appointments = await Appointment.find(query)
				.sort({ startTime: 1 })
				.lean();

			return appointments as unknown as IAppointment[];
		} catch (error) {
			throw new Error(`Errore nel recupero delle prenotazioni del barbiere: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Aggiorna una prenotazione
	static async updateAppointment(id: string, updateData: Partial<IAppointment>): Promise<IAppointment> {
		try {
			await connectDB();
			const appointment = await Appointment.findByIdAndUpdate(id, updateData, { new: true }).lean();

			if (!appointment) {
				throw new Error('Prenotazione non trovata');
			}

			return appointment as unknown as IAppointment;
		} catch (error) {
			throw new Error(`Errore nell'aggiornamento della prenotazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Completa una prenotazione
	static async completeAppointment(id: string): Promise<IAppointment> {
		try {
			await connectDB();
			const appointment = await Appointment.findByIdAndUpdate(
				id,
				{ status: 'completed', paymentStatus: 'paid' },
				{ new: true }
			).lean() as unknown as IAppointment | null;

			if (!appointment) {
				throw new Error('Prenotazione non trovata');
			}

			// Registra l'attività
			await ActivityLog.create({
				barberId: appointment.barberId,
				appointmentId: id,
				activityType: 'appointment_completed',
				description: `Prenotazione completata per ${appointment.clientName}`,
				timestamp: new Date()
			});

			return appointment as unknown as IAppointment;
		} catch (error) {
			throw new Error(`Errore nel completamento della prenotazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Elimina (cancella) una prenotazione — usato dal portale clienti
	static async deleteAppointment(id: string): Promise<void> {
		try {
			await connectDB();
			await Appointment.findByIdAndUpdate(id, {
				status: 'cancelled',
				paymentStatus: 'refunded'
			});
		} catch (error) {
			throw new Error(`Errore nella cancellazione della prenotazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Cancella una prenotazione
	static async cancelAppointment(id: string, reason?: string): Promise<IAppointment> {
		try {
			await connectDB();
			const appointment = await Appointment.findByIdAndUpdate(
				id,
				{ status: 'cancelled', paymentStatus: 'refunded' },
				{ new: true }
			).lean() as unknown as IAppointment | null;

			if (!appointment) {
				throw new Error('Prenotazione non trovata');
			}

			// Registra l'attività
			await ActivityLog.create({
				barberId: appointment.barberId,
				appointmentId: id,
				activityType: 'appointment_cancelled',
				description: `Prenotazione cancellata per ${appointment.clientName}`,
				details: { reason: reason || 'Non specificato' },
				timestamp: new Date()
			});

			return appointment as unknown as IAppointment;
		} catch (error) {
			throw new Error(`Errore nella cancellazione della prenotazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Ottiene le prenotazioni per una data specifica
	static async getAppointmentsByDate(date: Date): Promise<IAppointment[]> {
		try {
			await connectDB();

			const startOfDay = new Date(date);
			startOfDay.setHours(0, 0, 0, 0);

			const endOfDay = new Date(date);
			endOfDay.setHours(23, 59, 59, 999);

			const appointments = await Appointment.find({
				startTime: { $gte: startOfDay, $lte: endOfDay },
				status: { $ne: 'cancelled' }
			})
				.populate('barberId', 'name')
				.sort({ startTime: 1 })
				.lean();

			return appointments as unknown as IAppointment[];
		} catch (error) {
			throw new Error(`Errore nel recupero delle prenotazioni della data: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Ottiene gli slot disponibili per un barbiere in un dato giorno
	static async getAvailableSlots(
		barberId: string,
		date: Date,
		slotDuration: number = 30
	): Promise<{ time: string; endTime: string }[]> {
		try {
			await connectDB();

			const Barber = (await import('../db/models/Barber')).Barber;
			const barber = await Barber.findById(barberId).lean() as unknown as IBarber | null;
			if (!barber) throw new Error('Barbiere non trovato');

			const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
			const dayName = dayNames[date.getDay()];
			const workingHours = (barber.workingHours as any)?.[dayName];

			// No working hours or empty strings (e.g. closed day)
			if (!workingHours?.start || !workingHours?.end) return [];

			const [startH, startM] = workingHours.start.split(':').map(Number);
			const [endH, endM] = workingHours.end.split(':').map(Number);
			if (isNaN(startH) || isNaN(endH)) return [];

			const startOfDay = new Date(date);
			startOfDay.setHours(0, 0, 0, 0);
			const endOfDay = new Date(date);
			endOfDay.setHours(23, 59, 59, 999);

			const booked = await Appointment.find({
				barberId,
				startTime: { $gte: startOfDay, $lte: endOfDay },
				status: { $ne: 'cancelled' }
			}).lean();

			const pad = (n: number) => String(n).padStart(2, '0');
			const fmt = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

			const slots: { time: string; endTime: string }[] = [];
			const now = new Date();

			let current = new Date(date);
			current.setHours(startH, startM, 0, 0);

			const dayEnd = new Date(date);
			dayEnd.setHours(endH, endM, 0, 0);

			while (current < dayEnd) {
				const slotEnd = new Date(current.getTime() + slotDuration * 60000);
				if (slotEnd > dayEnd) break;

				// Skip past slots
				if (current > now) {
					const conflict = booked.some(
						(apt: any) =>
							current < new Date(apt.endTime) && slotEnd > new Date(apt.startTime)
					);
					if (!conflict) {
						slots.push({ time: fmt(current), endTime: fmt(slotEnd) });
					}
				}

				current = new Date(current.getTime() + slotDuration * 60000);
			}

			return slots;
		} catch (error) {
			throw new Error(
				`Errore nel recupero degli slot: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
			);
		}
	}

	// Ottiene la disponibilità di un barbiere
	static async getBarberAvailability(barberId: string, date: Date): Promise<{ start: string; end: string }[]> {
		try {
			await connectDB();

			const Barber = (await import('../db/models/Barber')).Barber;

			const barber = await Barber.findById(barberId).lean() as unknown as IBarber | null;
			if (!barber) throw new Error('Barbiere non trovato');

			// Ottieni il giorno della settimana
			const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
			const workingHours = (barber.workingHours as any)[dayName];

			if (!workingHours) {
				return [];
			}

			// Ottieni le prenotazioni di quel giorno
			const startOfDay = new Date(date);
			startOfDay.setHours(0, 0, 0, 0);

			const endOfDay = new Date(date);
			endOfDay.setHours(23, 59, 59, 999);

			const appointments = await Appointment.find({
				barberId,
				startTime: { $gte: startOfDay, $lte: endOfDay },
				status: { $ne: 'cancelled' }
			}).lean();

			// Calcola gli slot liberi
			const availableSlots: { start: string; end: string }[] = [];
			const [startHour, startMin] = workingHours.start.split(':').map(Number);
			const [endHour, endMin] = workingHours.end.split(':').map(Number);

			let currentTime = new Date(date);
			currentTime.setHours(startHour, startMin, 0);

			const endTime = new Date(date);
			endTime.setHours(endHour, endMin, 0);

			while (currentTime < endTime) {
				const slotEnd = new Date(currentTime.getTime() + 30 * 60000); // Slot di 30 minuti

				const hasConflict = appointments.some((apt: any) => {
					return currentTime < apt.endTime && slotEnd > apt.startTime;
				});

				if (!hasConflict) {
					availableSlots.push({
						start: currentTime.toISOString(),
						end: slotEnd.toISOString()
					});
				}

				currentTime = slotEnd;
			}

			return availableSlots;
		} catch (error) {
			throw new Error(`Errore nel recupero della disponibilità: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}
}
