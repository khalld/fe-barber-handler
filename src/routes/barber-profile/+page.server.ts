import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BarberService } from '$lib/services/barberService';

export const load: PageServerLoad = async ({ cookies }) => {
	const barberSessionId = cookies.get('barber_session_id');
	const barberId = cookies.get('barber_id');

	if (!barberSessionId || !barberId) {
		throw redirect(303, '/login');
	}

	const barber = await BarberService.getBarberById(barberId);
	if (!barber) {
		cookies.delete('barber_session_id', { path: '/' });
		cookies.delete('barber_id', { path: '/' });
		throw redirect(303, '/login');
	}

	return { barber: JSON.parse(JSON.stringify(barber)) };
};
