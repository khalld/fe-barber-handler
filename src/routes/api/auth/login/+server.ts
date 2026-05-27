import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { ApiResponse } from '$lib/types';
import { verifyDemoAdmin } from '$lib/server/demoAuth';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const data = await request.json();
		const { username, password } = data;

		if (!username || !password) {
			return json(
				{
					success: false,
					error: 'Username e password sono obbligatori'
				},
				{ status: 400 }
			);
		}

		// Demo admin login: verified in-memory (no MongoDB), password "demo123".
		if (verifyDemoAdmin(username, password)) {
			{
				// Crea sessione
				const sessionId = Math.random().toString(36).substring(2, 15);
				cookies.set('session_id', sessionId, {
					path: '/',
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'lax',
					maxAge: 60 * 60 * 24 * 7 // 7 giorni
				});

				return json({
					success: true,
					message: 'Login effettuato con successo',
					data: { username, isAdmin: true }
				} as ApiResponse<any>);
			}
		}

		return json(
			{
				success: false,
				error: 'Username o password non validi'
			},
			{ status: 401 }
		);
	} catch (error: any) {
		console.error('Errore nel login:', error);
		return json(
			{
				success: false,
				error: error.message || 'Errore nel login'
			},
			{ status: 500 }
		);
	}
};
