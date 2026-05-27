import type { RequestHandler } from './$types';
import { TransactionService } from '$lib/services/transactionService';
import { ok, fail, handle } from '$lib/server/api';

function rangeOrLast30(startDate: string | null, endDate: string | null) {
	const start = startDate
		? new Date(startDate)
		: new Date(new Date().setDate(new Date().getDate() - 30));
	const end = endDate ? new Date(endDate) : new Date();
	return { start, end };
}

// GET /api/transactions — type, category, barberId, startDate, endDate, byCategory, dailyTotals
export const GET: RequestHandler = handle(async ({ url }) => {
	const p = url.searchParams;
	const startDate = p.get('startDate');
	const endDate = p.get('endDate');

	if (p.get('byCategory')) {
		const { start, end } = rangeOrLast30(startDate, endDate);
		return ok(await TransactionService.getByCategory(start, end));
	}

	if (p.get('dailyTotals')) {
		const { start, end } = rangeOrLast30(startDate, endDate);
		return ok(await TransactionService.getDailyTotals(start, end));
	}

	const filters: any = {};
	const type = p.get('type');
	const category = p.get('category');
	const barberId = p.get('barberId');
	if (type) filters.type = type;
	if (category) filters.category = category;
	if (barberId) filters.barberId = barberId;
	if (startDate) filters.startDate = new Date(startDate);
	if (endDate) filters.endDate = new Date(endDate);

	return ok(await TransactionService.getAllTransactions(filters));
});

export const POST: RequestHandler = handle(async ({ request }) => {
	const data = await request.json();

	if (!data.type || !data.category || data.amount === undefined || !data.description) {
		return fail('Campi obbligatori mancanti', 400);
	}
	if (!['income', 'expense'].includes(data.type)) {
		return fail('Tipo transazione non valido', 400);
	}

	const transaction = await TransactionService.createTransaction({
		...data,
		date: data.date ? new Date(data.date) : new Date()
	});
	return ok(transaction, 201);
});

export const PATCH: RequestHandler = handle(async ({ request }) => {
	const data = await request.json();
	if (!data._id) return fail('ID transazione obbligatorio', 400);

	if (data.date) data.date = new Date(data.date);

	const transaction = await TransactionService.updateTransaction(data._id, data);
	return ok(transaction);
});

export const DELETE: RequestHandler = handle(async ({ url }) => {
	const id = url.searchParams.get('id');
	if (!id) return fail('ID transazione obbligatorio', 400);

	await TransactionService.deleteTransaction(id);
	return ok();
});
