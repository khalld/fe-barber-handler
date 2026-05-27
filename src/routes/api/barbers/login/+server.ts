import { apiResponse } from '$lib/server/api';
import type { RequestHandler } from './$types';
import { BarberService } from '$lib/services/barberService';
import { verifyDemoBarber, isDemoBarberEmail } from '$lib/server/demoAuth';
import type { IBarber } from '$lib/types';

// POST /api/barbers/login - Login per i barbieri
export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const data = await request.json();
		const { email, password } = data;

		if (!email || !password) {
			return apiResponse<null>(
				{ success: false, error: 'Email e password sono obbligatori' },
				{ status: 400 }
			);
		}

		// Demo barber login: verified in-memory (no MongoDB), password "demo123".
		// Demo emails never touch the DB; real accounts use the DB-backed service.
		const barber = isDemoBarberEmail(email)
			? verifyDemoBarber(email, password)
			: await BarberService.loginBarber(email, password);

		if (barber) {
			// Crea una sessione per il barbiere
			const sessionId = Math.random().toString(36).substring(2, 15);
			cookies.set('barber_session_id', sessionId, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7 // 7 giorni
			});

			// Salva anche il barbier ID nella sessione
			cookies.set('barber_id', barber._id || '', {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7
			});

			return apiResponse<IBarber>({
				success: true,
				data: barber,
				message: 'Login effettuato con successo'
			});
		}

		return apiResponse<null>(
			{ success: false, error: 'Email o password non validi' },
			{ status: 401 }
		);
	} catch (error) {
		console.error('Errore nel login del barbiere:', error);
		return apiResponse<null>(
			{ success: false, error: error instanceof Error ? error.message : 'Errore nel login' },
			{ status: 500 }
		);
	}
};
