import { apiResponse } from '$lib/server/api';
import type { RequestHandler } from './$types';

// POST /api/users/logout - Logout utente
export const POST: RequestHandler = async ({ cookies }) => {
	try {
		// Elimina i cookie di sessione dell'utente
		cookies.delete('user_session_id', { path: '/' });
		cookies.delete('user_id', { path: '/' });

		return apiResponse<null>({
			success: true,
			message: 'Logout effettuato con successo'
		});
	} catch (error) {
		console.error('Errore nel logout:', error);
		return apiResponse<null>(
			{ success: false, error: error instanceof Error ? error.message : 'Errore nel logout' },
			{ status: 500 }
		);
	}
};
