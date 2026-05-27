import { apiResponse } from '$lib/server/api';
import type { RequestHandler } from './$types';
import { UserClientService } from '$lib/services/userClientService';
import type { IUser } from '$lib/types';

// POST /api/users/register - Registra un nuovo utente
export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const { name, email, phone, password, confirmPassword } = data;

		// Validazione base
		if (!name || !email || !phone || !password) {
			return apiResponse<null>(
				{ success: false, error: 'Tutti i campi sono obbligatori' },
				{ status: 400 }
			);
		}

		if (password !== confirmPassword) {
			return apiResponse<null>(
				{ success: false, error: 'Le password non coincidono' },
				{ status: 400 }
			);
		}

		// Validazione email formato
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return apiResponse<null>(
				{ success: false, error: 'Email non valida' },
				{ status: 400 }
			);
		}

		// Registra utente
		const user = await UserClientService.registerUser({
			name,
			email,
			phone,
			password
		});

		return apiResponse<Omit<IUser, 'password'>>(
			{
				success: true,
				data: {
					_id: user?._id,
					name: user?.name || '',
					email: user?.email || '',
					phone: user?.phone || '',
					appointments: user?.appointments || [],
					registeredAt: user?.registeredAt,
					updatedAt: user?.updatedAt
				},
				message: 'Registrazione completata con successo'
			},
			{ status: 201 }
		);
	} catch (error: any) {
		console.error('Errore nella registrazione:', error);
		return apiResponse<null>(
			{ success: false, error: error.message || 'Errore nella registrazione' },
			{ status: 500 }
		);
	}
};
