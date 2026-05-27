import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { ApiResponse } from '$lib/types';

export const GET: RequestHandler = async ({ cookies }) => {
	try {
		const sessionId = cookies.get('session_id');

		if (!sessionId) {
			return json({
				success: false,
				data: null,
				error: 'Non autenticato'
			} as ApiResponse<any>);
		}

		return json({
			success: true,
			data: { isAuthenticated: true, isAdmin: true, username: 'admin' }
		} as ApiResponse<any>);
	} catch (error: any) {
		console.error('Errore nel check sessione:', error);
		return json(
			{
				success: false,
				error: error.message || 'Errore nel check sessione'
			},
			{ status: 500 }
		);
	}
};
