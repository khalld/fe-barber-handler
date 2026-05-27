/**
 * Helper di formattazione condivisi tra le pagine.
 * Centralizza valuta e date per evitare duplicazione.
 */

const LOCALE = 'it-IT';

/** Formatta un importo come "€12.50" (coerente con la formattazione esistente). */
export function formatCurrency(value: number | null | undefined): string {
	const n = Number(value ?? 0);
	return `€${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
}

/** Data in formato locale italiano (gg/mm/aaaa). Restituisce "-" se assente/non valida. */
export function formatDate(value: string | number | Date | null | undefined): string {
	if (!value) return '-';
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString(LOCALE);
}

/** Orario in formato HH:mm. */
export function formatTime(value: string | number | Date | null | undefined): string {
	if (!value) return '-';
	const d = new Date(value);
	return Number.isNaN(d.getTime())
		? '-'
		: d.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
}

/** Data e ora combinate (gg/mm/aaaa HH:mm). */
export function formatDateTime(value: string | number | Date | null | undefined): string {
	if (!value) return '-';
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return '-';
	return `${formatDate(d)} ${formatTime(d)}`;
}

/** Converte una data nel parametro "YYYY-MM-DD" usato nelle query API. */
export function toDateParam(value: string | number | Date = new Date()): string {
	return new Date(value).toISOString().split('T')[0];
}
