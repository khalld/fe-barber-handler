import { apiResponse } from '$lib/server/api';
import type { RequestHandler } from './$types';
import { UserClientService } from '$lib/services/userClientService';
import { verifyDemoClient, isDemoClientEmail } from '$lib/server/demoAuth';
import type { IUser } from '$lib/types';

// POST /api/users/login - Login utente
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

		// Demo client login: verified in-memory (no MongoDB), password "demo123".
		// Demo emails never touch the DB; real accounts use the DB-backed service.
		const user = isDemoClientEmail(email)
			? verifyDemoClient(email, password)
			: await UserClientService.loginUser(email, password);

		if (user) {
			// Crea una sessione per l'utente
			const sessionId = Math.random().toString(36).substring(2, 15);
			cookies.set('user_session_id', sessionId, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 30 // 30 giorni
			});

			// Salva anche l'user ID nella sessione
			cookies.set('user_id', user._id || '', {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 30
			});

			// Ritorna dati senza password
			const { password, ...userWithoutPassword } = user;
			return apiResponse<Omit<IUser, 'password'>>({
				success: true,
				data: userWithoutPassword as Omit<IUser, 'password'>,
				message: 'Login effettuato con successo'
			});
		}

		return apiResponse<null>(
			{ success: false, error: 'Email o password non validi' },
			{ status: 401 }
		);
	} catch (error: any) {
		console.error('Errore nel login:', error);
		return apiResponse<null>(
			{ success: false, error: error.message || 'Errore nel login' },
			{ status: 500 }
		);
	}
};
