import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { ApiResponse } from '$lib/types';

/**
 * Risposta API tipizzata. SvelteKit `json()` non è generico, quindi questo
 * wrapper garantisce a compile-time che il body rispetti la forma
 * { success, data?, error?, message? }.
 */
export function apiResponse<T>(body: ApiResponse<T>, init?: ResponseInit): Response {
	return json(body, init);
}

/** Errore applicativo con codice HTTP, lanciabile dai service/handler. */
export class ApiError extends Error {
	constructor(
		message: string,
		public status: number = 400
	) {
		super(message);
		this.name = 'ApiError';
	}
}

/** Risposta di successo standard: { success: true, data? }. */
export function ok<T>(data?: T, status: number = 200): Response {
	return json(data === undefined ? { success: true } : { success: true, data }, { status });
}

/** Risposta di errore standard: { success: false, error }. */
export function fail(error: string, status: number = 400): Response {
	return json({ success: false, error }, { status });
}

/**
 * Avvolge un RequestHandler con la gestione errori condivisa: un ApiError
 * mantiene il suo status, ogni altro errore diventa un 500.
 */
export function handle(fn: RequestHandler): RequestHandler {
	return async (event) => {
		try {
			return await fn(event);
		} catch (error) {
			if (error instanceof ApiError) return fail(error.message, error.status);
			const message = error instanceof Error ? error.message : 'Errore interno del server';
			return fail(message, 500);
		}
	};
}
