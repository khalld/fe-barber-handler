import bcrypt from 'bcryptjs';
import { connectDB } from '../db/mongodb';
import { Barber } from '../db/models/Barber';
import { ActivityLog } from '../db/models/ActivityLog';
import type { IBarber } from '../types';

export class BarberService {
	// Crea un nuovo barbiere (con hashing della password)
	static async createBarber(barberData: Omit<IBarber, '_id' | 'createdAt' | 'updatedAt'>): Promise<IBarber> {
		try {
			await connectDB();

			if (!barberData.password) {
				throw new Error('La password è obbligatoria per creare un barbiere');
			}

			const hashedPassword = await bcrypt.hash(barberData.password, 10);
			const barber = new Barber({ ...barberData, password: hashedPassword });
			await barber.save();

			const obj = barber.toObject() as IBarber;
			delete obj.password;
			return obj;
		} catch (error) {
			throw new Error(`Errore nella creazione del barbiere: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Login barbiere: verifica username e password
	static async loginBarber(username: string, password: string): Promise<IBarber | null> {
		try {
			await connectDB();
			const barber = await Barber.findOne({ username: username.toLowerCase().trim(), isActive: true }).select('+password');
			if (!barber) return null;

			const isValid = await bcrypt.compare(password, barber.password || '');
			if (!isValid) return null;

			const obj = barber.toObject() as IBarber;
			delete obj.password;
			return obj;
		} catch (error) {
			throw new Error(`Errore nel login del barbiere: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Ottiene tutti i barbieri
	static async getAllBarbers(): Promise<IBarber[]> {
		try {
			await connectDB();
			const barbers = await Barber.find({ isActive: true }).lean();
			return barbers as unknown as IBarber[];
		} catch (error) {
			throw new Error(`Errore nel recupero dei barbieri: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Ottiene un barbiere per ID
	static async getBarberById(id: string): Promise<IBarber | null> {
		if (!/^[0-9a-fA-F]{24}$/.test(id)) return null;
		try {
			await connectDB();
			const barber = await Barber.findById(id).lean();
			return barber as IBarber | null;
		} catch (error) {
			throw new Error(`Errore nel recupero del barbiere: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Aggiorna un barbiere
	static async updateBarber(id: string, updateData: Partial<IBarber>): Promise<IBarber> {
		try {
			await connectDB();
			const barber = await Barber.findByIdAndUpdate(id, updateData, { new: true }).lean();
			if (!barber) {
				throw new Error('Barbiere non trovato');
			}
			return barber as unknown as IBarber;
		} catch (error) {
			throw new Error(`Errore nell'aggiornamento del barbiere: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Disattiva un barbiere
	static async deactivateBarber(id: string): Promise<IBarber> {
		try {
			await connectDB();
			const barber = await Barber.findByIdAndUpdate(id, { isActive: false }, { new: true }).lean();
			if (!barber) {
				throw new Error('Barbiere non trovato');
			}
			return barber as unknown as IBarber;
		} catch (error) {
			throw new Error(`Errore nella disattivazione del barbiere: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Registra il login di un barbiere
	static async recordLogin(barberId: string): Promise<void> {
		try {
			await connectDB();
			await ActivityLog.create({
				barberId,
				activityType: 'barber_login',
				description: `Barbiere entrato nel sistema`,
				timestamp: new Date()
			});
		} catch (error) {
			throw new Error(`Errore nella registrazione del login: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Registra il logout di un barbiere
	static async recordLogout(barberId: string): Promise<void> {
		try {
			await connectDB();
			// Calcola la durata della sessione
			const lastLogin = await ActivityLog.findOne(
				{ barberId, activityType: 'barber_login' },
				{},
				{ sort: { timestamp: -1 } }
			);

			let duration = 0;
			if (lastLogin) {
				duration = Math.floor((new Date().getTime() - lastLogin.timestamp.getTime()) / 60000); // in minuti
			}

			await ActivityLog.create({
				barberId,
				activityType: 'barber_logout',
				description: `Barbiere uscito dal sistema`,
				duration,
				timestamp: new Date()
			});
		} catch (error) {
			throw new Error(`Errore nella registrazione del logout: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Ottiene le statistiche di un barbiere
	static async getBarberStats(barberId: string, days: number = 30): Promise<{
		totalAppointments: number;
		completedAppointments: number;
		totalRevenue: number;
		averageRating: number;
	}> {
		try {
			await connectDB();
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - days);

			const Appointment = (await import('../db/models/Appointment')).Appointment;
			const Transaction = (await import('../db/models/Transaction')).Transaction;

			const appointments = await Appointment.countDocuments({
				barberId,
				createdAt: { $gte: startDate }
			});

			const completedAppointments = await Appointment.countDocuments({
				barberId,
				status: 'completed',
				createdAt: { $gte: startDate }
			});

			const transactions = await Transaction.aggregate([
				{
					$match: {
						barberId,
						type: 'income',
						date: { $gte: startDate }
					}
				},
				{
					$group: {
						_id: null,
						total: { $sum: '$amount' }
					}
				}
			]);

			const totalRevenue = transactions[0]?.total || 0;

			return {
				totalAppointments: appointments,
				completedAppointments,
				totalRevenue,
				averageRating: 0 // Implementare il sistema di rating in futuro
			};
		} catch (error) {
			throw new Error(`Errore nel recupero delle statistiche: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}
}
