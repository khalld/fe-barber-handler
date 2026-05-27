import { apiResponse } from '$lib/server/api';
import type { RequestHandler } from './$types';
import { BarberService } from '$lib/services/barberService';
import type { IBarber } from '$lib/types';

// PUT /api/barbers/[id] - Aggiorna il profilo del barbiere
export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const { id } = params;
		const data = await request.json();

		if (!id) {
			return apiResponse<null>(
				{ success: false, error: 'ID barbiere obbligatorio' },
				{ status: 400 }
			);
		}

		// Esclude campi non modificabili
		delete data._id;
		delete data.password;
		delete data.createdAt;
		delete data.updatedAt;

		const barber = await BarberService.updateBarber(id, data);
		return apiResponse<IBarber>({ 
			success: true, 
			data: barber, 
			message: 'Profilo aggiornato con successo' 
		});
	} catch (error) {
		return apiResponse<null>(
			{ success: false, error: error instanceof Error ? error.message : 'Errore del server' },
			{ status: 500 }
		);
	}
};
