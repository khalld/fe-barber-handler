import type { RequestHandler } from './$types';
import { WarehouseService } from '$lib/services/warehouseService';
import { ok, fail, handle } from '$lib/server/api';

export const GET: RequestHandler = handle(async ({ url }) => {
	const lowStock = url.searchParams.get('lowStock');
	const items = lowStock
		? await WarehouseService.getLowStockItems()
		: await WarehouseService.getAllItems();
	return ok(items);
});

export const POST: RequestHandler = handle(async ({ request }) => {
	const body = await request.json();
	const { name, category, quantity, minQuantity, unit, purchasePrice, supplier, notes } = body;

	if (!name || !category || quantity == null || !unit || purchasePrice == null) {
		return fail('Campi obbligatori mancanti', 400);
	}

	const item = await WarehouseService.createItem({
		name,
		category,
		quantity: Number(quantity),
		minQuantity: Number(minQuantity ?? 0),
		unit,
		purchasePrice: Number(purchasePrice),
		supplier,
		notes
	});

	return ok(item, 201);
});

export const PATCH: RequestHandler = handle(async ({ request }) => {
	const { _id, ...updates } = await request.json();
	if (!_id) return fail('ID mancante', 400);

	const item = await WarehouseService.updateItem(_id, updates);
	return ok(item);
});

export const DELETE: RequestHandler = handle(async ({ url }) => {
	const id = url.searchParams.get('id');
	if (!id) return fail('ID mancante', 400);

	await WarehouseService.deleteItem(id);
	return ok();
});
