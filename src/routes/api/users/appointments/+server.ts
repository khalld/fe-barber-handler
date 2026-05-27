import { apiResponse } from '$lib/server/api';
import type { RequestHandler } from './$types';
import { AppointmentService } from '$lib/services/appointmentService';
import { UserClientService } from '$lib/services/userClientService';
import { DEMO_CLIENT_ID } from '$lib/server/demoAuth';
import type { IAppointment } from '$lib/types';

// GET /api/users/appointments?userId=xxx - Ottiene prenotazioni dell'utente
export const GET: RequestHandler = async ({ url }) => {
	try {
		const userId = url.searchParams.get('userId');

		if (!userId) {
			return apiResponse<null>(
				{ success: false, error: 'userId obbligatorio' },
				{ status: 400 }
			);
		}

		// Demo client is an in-memory account with no DB record; it has no appointments.
		if (userId === DEMO_CLIENT_ID) {
			return apiResponse<IAppointment[]>({ success: true, data: [] });
		}

		const appointments = await UserClientService.getUserAppointments(userId);
		return apiResponse<IAppointment[]>({
			success: true,
			data: appointments
		});
	} catch (error) {
		console.error('Errore nel recupero prenotazioni:', error);
		return apiResponse<null>(
			{ success: false, error: error instanceof Error ? error.message : 'Errore del server' },
			{ status: 500 }
		);
	}
};

// POST /api/users/appointments - Crea una nuova prenotazione
export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const { userId, barberId, clientName, clientEmail, clientPhone, serviceType, duration, dateTime, totalPrice } = data;

		// Validazione
		if (!userId || !barberId || !clientName || !clientPhone || !serviceType || !duration || !dateTime) {
			return apiResponse<null>(
				{ success: false, error: 'Campi obbligatori mancanti' },
				{ status: 400 }
			);
		}

		// Crea appuntamento mappando i campi del portale clienti al modello DB
		const startTime = new Date(dateTime);
		const endTime = new Date(startTime.getTime() + parseInt(duration) * 60000);

		const appointment = await AppointmentService.createAppointment({
			barberId,
			clientName,
			clientEmail: clientEmail || '',
			clientPhone,
			service: serviceType,
			duration: parseInt(duration),
			startTime,
			endTime,
			price: totalPrice || 0,
			status: 'pending',
			paymentStatus: 'pending'
		});

		// Aggiungi alla lista prenotazioni dell'utente (il client demo non ha record DB)
		if (userId !== DEMO_CLIENT_ID) {
			await UserClientService.addAppointmentToUser(userId, appointment?._id || '');
		}

		return apiResponse<IAppointment>(
			{
				success: true,
				data: appointment,
				message: 'Prenotazione creata con successo'
			},
			{ status: 201 }
		);
	} catch (error: any) {
		console.error('Errore nella creazione prenotazione:', error);
		return apiResponse<null>(
			{ success: false, error: error.message || 'Errore nella creazione prenotazione' },
			{ status: 500 }
		);
	}
};

// DELETE /api/users/appointments?appointmentId=xxx&userId=xxx - Cancella una prenotazione
export const DELETE: RequestHandler = async ({ url }) => {
	try {
		const appointmentId = url.searchParams.get('appointmentId');
		const userId = url.searchParams.get('userId');

		if (!appointmentId || !userId) {
			return apiResponse<null>(
				{ success: false, error: 'appointmentId e userId obbligatori' },
				{ status: 400 }
			);
		}

		// Cancella la prenotazione
		await AppointmentService.deleteAppointment(appointmentId);

		// Rimuovi dalla lista prenotazioni dell'utente (il client demo non ha record DB)
		if (userId !== DEMO_CLIENT_ID) {
			await UserClientService.removeAppointmentFromUser(userId, appointmentId);
		}

		return apiResponse<null>({
			success: true,
			message: 'Prenotazione cancellata con successo'
		});
	} catch (error) {
		console.error('Errore nella cancellazione prenotazione:', error);
		return apiResponse<null>(
			{ success: false, error: error instanceof Error ? error.message : 'Errore del server' },
			{ status: 500 }
		);
	}
};
