import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AppointmentService } from '$lib/services/appointmentService';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { barberId, clientName, clientPhone, clientEmail, service, duration, startTime, price } =
			body;

		if (!barberId || !clientName || !clientPhone || !service || !duration || !startTime) {
			return json({ success: false, error: 'Campi obbligatori mancanti' }, { status: 400 });
		}

		const start = new Date(startTime);
		const end = new Date(start.getTime() + Number(duration) * 60000);

		const appointment = await AppointmentService.createAppointment({
			barberId,
			clientName,
			clientEmail: clientEmail || '',
			clientPhone,
			service,
			duration: Number(duration),
			startTime: start,
			endTime: end,
			price: Number(price) || 0,
			status: 'pending',
			paymentStatus: 'pending'
		});

		return json({ success: true, data: appointment }, { status: 201 });
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'Errore nella prenotazione';
		return json({ success: false, error: msg }, { status: 400 });
	}
};
