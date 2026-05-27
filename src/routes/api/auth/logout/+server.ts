import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { ApiResponse } from '$lib/types';

export const POST: RequestHandler = async ({ cookies }) => {
	try {
		cookies.delete('session_id', { path: '/' });

		return json({
			success: true,
			message: 'Logout effettuato con successo'
		} as ApiResponse<null>);
	} catch (error: any) {
		console.error('Errore nel logout:', error);
		return json(
			{
				success: false,
				error: error.message || 'Errore nel logout'
			},
			{ status: 500 }
		);
	}
};
