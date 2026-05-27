import { apiResponse } from '$lib/server/api';
import type { RequestHandler } from './$types';
import { BarberService } from '$lib/services/barberService';
import type { IBarber } from '$lib/types';

// GET /api/users/available-barbers - Ottiene barbieri disponibili
export const GET: RequestHandler = async () => {
	try {
		const barbers = await BarberService.getAllBarbers();
		const activeBarbers = barbers.filter(b => b.isActive);
		
		return apiResponse<IBarber[]>({
			success: true,
			data: activeBarbers
		});
	} catch (error) {
		console.error('Errore nel recupero barbieri:', error);
		return apiResponse<null>(
			{ success: false, error: error instanceof Error ? error.message : 'Errore del server' },
			{ status: 500 }
		);
	}
};
