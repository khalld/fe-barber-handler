import { apiResponse } from '$lib/server/api';
import type { RequestHandler } from './$types';
import { BarberService } from '$lib/services/barberService';
import bcrypt from 'bcryptjs';
import { Barber } from '$lib/db/models/Barber';

// POST /api/barbers/[id]/change-password - Cambia la password del barbiere
export const POST: RequestHandler = async ({ params, request }) => {
	try {
		const { id } = params;
		const { currentPassword, newPassword } = await request.json();

		if (!id || !currentPassword || !newPassword) {
			return apiResponse<null>(
				{ success: false, error: 'ID, password attuale e nuova password sono obbligatori' },
				{ status: 400 }
			);
		}

		// Ottieni il barbiere dal database
		const barber = await Barber.findById(id);
		if (!barber) {
			return apiResponse<null>(
				{ success: false, error: 'Barbiere non trovato' },
				{ status: 404 }
			);
		}

		// Verifica la password attuale
		const isPasswordValid = await bcrypt.compare(currentPassword, barber.password);
		if (!isPasswordValid) {
			return apiResponse<null>(
				{ success: false, error: 'Password attuale non corretta' },
				{ status: 401 }
			);
		}

		// Hash della nuova password
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		barber.password = hashedPassword;
		await barber.save();

		return apiResponse<null>({ 
			success: true, 
			message: 'Password modificata con successo' 
		});
	} catch (error) {
		return apiResponse<null>(
			{ success: false, error: error instanceof Error ? error.message : 'Errore del server' },
			{ status: 500 }
		);
	}
};
