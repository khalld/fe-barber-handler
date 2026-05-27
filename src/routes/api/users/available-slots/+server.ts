import { apiResponse } from '$lib/server/api';
import type { RequestHandler } from './$types';
import { AppointmentService } from '$lib/services/appointmentService';

// GET /api/users/available-slots?barberId=xxx&date=YYYY-MM-DD - Ottiene slot disponibili
export const GET: RequestHandler = async ({ url }) => {
	try {
		const barberId = url.searchParams.get('barberId');
		const date = url.searchParams.get('date');

		if (!barberId || !date) {
			return apiResponse<null>(
				{ success: false, error: 'barberId e date obbligatori' },
				{ status: 400 }
			);
		}

		// Ottiene gli slot disponibili
		const availableSlots = await AppointmentService.getAvailableSlots(barberId, new Date(date), 30);

		return apiResponse<any>({
			success: true,
			data: availableSlots
		});
	} catch (error) {
		console.error('Errore nel recupero slot disponibili:', error);
		return apiResponse<null>(
			{ success: false, error: error instanceof Error ? error.message : 'Errore del server' },
			{ status: 500 }
		);
	}
};
