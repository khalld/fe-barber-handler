import { apiResponse } from '$lib/server/api';
import type { RequestHandler } from './$types';
import { AppointmentService } from '$lib/services/appointmentService';
import type { IAppointment } from '$lib/types';

// GET /api/appointments - Ottiene prenotazioni
// Query params: barberId, status, startDate, endDate, availability
export const GET: RequestHandler = async ({ url }) => {
	try {
		const barberId = url.searchParams.get('barberId');
		const status = url.searchParams.get('status');
		const startDate = url.searchParams.get('startDate');
		const endDate = url.searchParams.get('endDate');
		const date = url.searchParams.get('date');
		const availability = url.searchParams.get('availability');

		// Disponibilità di un barbiere
		if (availability && barberId && date) {
			const slots = await AppointmentService.getBarberAvailability(
				barberId,
				new Date(date)
			);
			return apiResponse<any>({ success: true, data: { availableSlots: slots } });
		}

		// Prenotazioni di una data specifica
		if (date) {
			const appointments = await AppointmentService.getAppointmentsByDate(new Date(date));
			return apiResponse<IAppointment[]>({ success: true, data: appointments });
		}

		// Prenotazioni di un barbiere
		if (barberId) {
			const appointments = await AppointmentService.getBarberAppointments(
				barberId,
				startDate ? new Date(startDate) : undefined,
				endDate ? new Date(endDate) : undefined
			);
			return apiResponse<IAppointment[]>({ success: true, data: appointments });
		}

		// Tutte le prenotazioni con filtri
		const filters: any = {};
		if (status) filters.status = status;
		if (startDate) filters.startDate = new Date(startDate);
		if (endDate) filters.endDate = new Date(endDate);

		const appointments = await AppointmentService.getAllAppointments(Object.keys(filters).length > 0 ? filters : undefined);
		return apiResponse<IAppointment[]>({ success: true, data: appointments });
	} catch (error) {
		return apiResponse<null>(
			{ success: false, error: error instanceof Error ? error.message : 'Errore del server' },
			{ status: 500 }
		);
	}
};

// POST /api/appointments - Crea una nuova prenotazione
export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();

		// Validazione base
		if (!data.barberId || !data.clientName || !data.clientPhone || !data.startTime || !data.endTime || !data.price) {
			return apiResponse<null>(
				{ success: false, error: 'Campi obbligatori mancanti' },
				{ status: 400 }
			);
		}

		const appointment = await AppointmentService.createAppointment({
			...data,
			startTime: new Date(data.startTime),
			endTime: new Date(data.endTime)
		});

		return apiResponse<IAppointment>(
			{ success: true, data: appointment, message: 'Prenotazione creata con successo' },
			{ status: 201 }
		);
	} catch (error) {
		return apiResponse<null>(
			{ success: false, error: error instanceof Error ? error.message : 'Errore del server' },
			{ status: 500 }
		);
	}
};

// PATCH /api/appointments - Aggiorna una prenotazione
export const PATCH: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();

		if (!data._id) {
			return apiResponse<null>(
				{ success: false, error: 'ID prenotazione obbligatorio' },
				{ status: 400 }
			);
		}

		// Se ci sono date, convertile
		if (data.startTime) data.startTime = new Date(data.startTime);
		if (data.endTime) data.endTime = new Date(data.endTime);

		const appointment = await AppointmentService.updateAppointment(data._id, data);
		return apiResponse<IAppointment>(
			{ success: true, data: appointment, message: 'Prenotazione aggiornata con successo' }
		);
	} catch (error) {
		return apiResponse<null>(
			{ success: false, error: error instanceof Error ? error.message : 'Errore del server' },
			{ status: 500 }
		);
	}
};

// DELETE /api/appointments?id=xxx&action=complete|cancel - Completa o cancella una prenotazione
export const DELETE: RequestHandler = async ({ url }) => {
	try {
		const id = url.searchParams.get('id');
		const action = url.searchParams.get('action') || 'cancel';

		if (!id) {
			return apiResponse<null>(
				{ success: false, error: 'ID prenotazione obbligatorio' },
				{ status: 400 }
			);
		}

		let appointment;
		if (action === 'complete') {
			appointment = await AppointmentService.completeAppointment(id);
		} else {
			appointment = await AppointmentService.cancelAppointment(id);
		}

		return apiResponse<IAppointment>(
			{ success: true, data: appointment, message: 'Prenotazione aggiornata con successo' }
		);
	} catch (error) {
		return apiResponse<null>(
			{ success: false, error: error instanceof Error ? error.message : 'Errore del server' },
			{ status: 500 }
		);
	}
};
