import { apiResponse } from '$lib/server/api';
import type { RequestHandler } from './$types';

// POST /api/barbers/logout - Logout per i barbieri
export const POST: RequestHandler = async ({ cookies }) => {
	try {
		// Elimina i cookie di sessione del barbiere
		cookies.delete('barber_session_id', { path: '/' });
		cookies.delete('barber_id', { path: '/' });

		return apiResponse<null>({
			success: true,
			message: 'Logout effettuato con successo'
		});
	} catch (error) {
		console.error('Errore nel logout del barbiere:', error);
		return apiResponse<null>(
			{ success: false, error: error instanceof Error ? error.message : 'Errore nel logout' },
			{ status: 500 }
		);
	}
};
