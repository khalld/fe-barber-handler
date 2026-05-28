import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatTime, formatDateTime, toDateParam } from './utils';

describe('formatCurrency', () => {
	it('formatta un numero con due decimali', () => {
		expect(formatCurrency(12.5)).toBe('€12.50');
		expect(formatCurrency(0)).toBe('€0.00');
		expect(formatCurrency(1234.567)).toBe('€1234.57');
	});

	it('gestisce null/undefined come zero', () => {
		expect(formatCurrency(null)).toBe('€0.00');
		expect(formatCurrency(undefined)).toBe('€0.00');
	});

	it('gestisce valori non finiti come zero', () => {
		expect(formatCurrency(NaN)).toBe('€0.00');
		expect(formatCurrency(Infinity)).toBe('€0.00');
	});

	it('mantiene il segno per valori negativi', () => {
		expect(formatCurrency(-5)).toBe('€-5.00');
	});
});

describe('formatDate', () => {
	it('formatta una data valida nel locale italiano (gg/mm/aaaa)', () => {
		expect(formatDate('2026-05-28')).toMatch(/^28\/0?5\/2026$/);
	});

	it('restituisce "-" per input nullo/vuoto/non valido', () => {
		expect(formatDate(null)).toBe('-');
		expect(formatDate(undefined)).toBe('-');
		expect(formatDate('')).toBe('-');
		expect(formatDate('not-a-date')).toBe('-');
	});
});

describe('formatTime', () => {
	it('formatta un orario in HH:mm', () => {
		expect(formatTime('2026-05-28T09:05:00Z')).toMatch(/^\d{2}:\d{2}$/);
	});

	it('restituisce "-" per input nullo/non valido', () => {
		expect(formatTime(null)).toBe('-');
		expect(formatTime('boom')).toBe('-');
	});
});

describe('formatDateTime', () => {
	it('combina data e orario', () => {
		const out = formatDateTime('2026-05-28T09:05:00Z');
		expect(out).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4} \d{2}:\d{2}$/);
	});

	it('restituisce "-" per input invalido', () => {
		expect(formatDateTime(null)).toBe('-');
		expect(formatDateTime('nope')).toBe('-');
	});
});

describe('toDateParam', () => {
	it('produce YYYY-MM-DD per una data esplicita', () => {
		expect(toDateParam('2026-05-28T15:00:00Z')).toBe('2026-05-28');
	});

	it('usa la data odierna come default', () => {
		const today = new Date().toISOString().split('T')[0];
		expect(toDateParam()).toBe(today);
	});
});
