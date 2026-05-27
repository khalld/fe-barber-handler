import { writable } from 'svelte/store';

export type ToastType = 'success' | 'danger' | 'warning' | 'info';
export interface ToastState {
	message: string;
	type: ToastType;
}

function createToast() {
	const { subscribe, set } = writable<ToastState | null>(null);
	let timer: ReturnType<typeof setTimeout> | undefined;

	function show(message: string, type: ToastType = 'info', duration = 3500) {
		if (timer) clearTimeout(timer);
		set({ message, type });
		if (duration > 0) timer = setTimeout(() => set(null), duration);
	}

	return {
		subscribe,
		show,
		success: (message: string) => show(message, 'success'),
		error: (message: string) => show(message, 'danger'),
		warning: (message: string) => show(message, 'warning'),
		info: (message: string) => show(message, 'info'),
		clear: () => {
			if (timer) clearTimeout(timer);
			set(null);
		}
	};
}

/** Store globale per le notifiche toast. Usa `toast.success(...)`, `toast.error(...)`, ecc. */
export const toast = createToast();
