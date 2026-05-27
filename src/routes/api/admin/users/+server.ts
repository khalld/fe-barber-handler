import type { RequestHandler } from './$types';
import { UserClientService } from '$lib/services/userClientService';
import { connectDB } from '$lib/db/mongodb';
import { UserClient } from '$lib/db/models/UserClient';
import { ok, fail, handle } from '$lib/server/api';

export const GET: RequestHandler = handle(async () => {
	await connectDB();
	const users = await UserClient.find({}, { password: 0 }).sort({ createdAt: -1 }).lean();
	return ok(users);
});

export const POST: RequestHandler = handle(async ({ request }) => {
	const { name, email, phone, password } = await request.json();

	if (!name || !email || !phone || !password) {
		return fail('Tutti i campi sono obbligatori', 400);
	}
	if (password.length < 6) {
		return fail('Password minimo 6 caratteri', 400);
	}

	const user = await UserClientService.registerUser({ name, email, phone, password });
	return ok(user, 201);
});

export const DELETE: RequestHandler = handle(async ({ url }) => {
	const id = url.searchParams.get('id');
	if (!id) return fail('ID mancante', 400);

	await UserClientService.deleteUser(id);
	return ok();
});
