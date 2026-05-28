import { describe, it, expect } from 'vitest';
import { ok, fail, ApiError, handle } from './api';
import type { RequestEvent } from '@sveltejs/kit';

describe('ok()', () => {
	it('restituisce { success: true } senza data', async () => {
		const res = ok();
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ success: true });
	});

	it('include data quando fornito', async () => {
		const res = ok({ id: '1', name: 'Marco' });
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ success: true, data: { id: '1', name: 'Marco' } });
	});

	it('rispetta uno status custom', async () => {
		const res = ok({ id: '1' }, 201);
		expect(res.status).toBe(201);
	});
});

describe('fail()', () => {
	it('restituisce { success: false, error } con status 400 di default', async () => {
		const res = fail('Username obbligatorio');
		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ success: false, error: 'Username obbligatorio' });
	});

	it('rispetta uno status custom', async () => {
		const res = fail('Non trovato', 404);
		expect(res.status).toBe(404);
	});
});

describe('ApiError', () => {
	it('porta con sé un messaggio e uno status', () => {
		const err = new ApiError('boom', 418);
		expect(err.message).toBe('boom');
		expect(err.status).toBe(418);
		expect(err).toBeInstanceOf(Error);
	});

	it('default status è 400', () => {
		expect(new ApiError('x').status).toBe(400);
	});
});

describe('handle()', () => {
	const fakeEvent = {} as RequestEvent;

	it('inoltra la risposta dell handler quando tutto ok', async () => {
		const wrapped = handle(async () => ok({ hello: 'world' }));
		const res = await wrapped(fakeEvent);
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ success: true, data: { hello: 'world' } });
	});

	it('mappa ApiError preservando il suo status', async () => {
		const wrapped = handle(async () => {
			throw new ApiError('Risorsa mancante', 404);
		});
		const res = await wrapped(fakeEvent);
		expect(res.status).toBe(404);
		expect(await res.json()).toEqual({ success: false, error: 'Risorsa mancante' });
	});

	it('mappa errori generici a 500 mantenendo il messaggio', async () => {
		const wrapped = handle(async () => {
			throw new Error('database giù');
		});
		const res = await wrapped(fakeEvent);
		expect(res.status).toBe(500);
		expect(await res.json()).toEqual({ success: false, error: 'database giù' });
	});

	it('fallback su messaggio generico quando l errore non è un Error', async () => {
		const wrapped = handle(async () => {
			throw 'qualcosa di strano';
		});
		const res = await wrapped(fakeEvent);
		expect(res.status).toBe(500);
		expect(await res.json()).toEqual({ success: false, error: 'Errore interno del server' });
	});
});
