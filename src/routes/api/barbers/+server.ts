import { apiResponse } from '$lib/server/api';
import type { RequestHandler } from './$types';
import { BarberService } from '$lib/services/barberService';
import type { IBarber } from '$lib/types';

// GET /api/barbers - Ottiene tutti i barbieri
// GET /api/barbers?id=xxx - Ottiene un barbiere specifico
export const GET: RequestHandler = async ({ url }) => {
	try {
		const id = url.searchParams.get('id');

		if (id) {
			const barber = await BarberService.getBarberById(id);
			if (!barber) {
				return apiResponse<null>(
					{ success: false, error: 'Barbiere non trovato' },
					{ status: 404 }
				);
			}
			return apiResponse<IBarber>({ success: true, data: barber });
		}

		const barbers = await BarberService.getAllBarbers();
		return apiResponse<IBarber[]>({ success: true, data: barbers });
	} catch (error) {
		return apiResponse<null>(
			{ success: false, error: error instanceof Error ? error.message : 'Errore del server' },
			{ status: 500 }
		);
	}
};

// POST /api/barbers - Crea un nuovo barbiere
export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();

		// Validazione base
		if (!data.name || !data.username || data.hourlyRate === undefined) {
			return apiResponse<null>(
				{ success: false, error: 'Nome, username e tariffa oraria sono obbligatori' },
				{ status: 400 }
			);
		}

		const barber = await BarberService.createBarber(data);
		return apiResponse<IBarber>({ success: true, data: barber, message: 'Barbiere creato con successo' }, { status: 201 });
	} catch (error) {
		return apiResponse<null>(
			{ success: false, error: error instanceof Error ? error.message : 'Errore del server' },
			{ status: 500 }
		);
	}
};

// PATCH /api/barbers - Aggiorna un barbiere
export const PATCH: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();

		if (!data._id) {
			return apiResponse<null>(
				{ success: false, error: 'ID barbiere obbligatorio' },
				{ status: 400 }
			);
		}

		const barber = await BarberService.updateBarber(data._id, data);
		return apiResponse<IBarber>({ success: true, data: barber, message: 'Barbiere aggiornato con successo' });
	} catch (error) {
		return apiResponse<null>(
			{ success: false, error: error instanceof Error ? error.message : 'Errore del server' },
			{ status: 500 }
		);
	}
};

// DELETE /api/barbers?id=xxx - Disattiva un barbiere
export const DELETE: RequestHandler = async ({ url }) => {
	try {
		const id = url.searchParams.get('id');

		if (!id) {
			return apiResponse<null>(
				{ success: false, error: 'ID barbiere obbligatorio' },
				{ status: 400 }
			);
		}

		await BarberService.deactivateBarber(id);
		return apiResponse<null>({ success: true, message: 'Barbiere disattivato con successo' });
	} catch (error) {
		return apiResponse<null>(
			{ success: false, error: error instanceof Error ? error.message : 'Errore del server' },
			{ status: 500 }
		);
	}
};
