import { writable, derived } from 'svelte/store';
import type { IBarber, IAppointment, ITransaction, IDashboardStats } from '$lib/types';

// ==================== Generic Collection Store ====================
interface CollectionState<T> {
	items: T[];
	loading: boolean;
	error: string | null;
}

/**
 * Factory per uno store di collezione con stato { items, loading, error }.
 * Sostituisce i factory quasi identici di barbers/appointments/transactions.
 */
function createCollectionStore<T extends { _id?: string }>() {
	const { subscribe, update } = writable<CollectionState<T>>({
		items: [],
		loading: false,
		error: null
	});

	return {
		subscribe,
		setItems: (items: T[]) => update((s) => ({ ...s, items })),
		addItem: (item: T) => update((s) => ({ ...s, items: [...s.items, item] })),
		updateItem: (id: string, updates: Partial<T>) =>
			update((s) => ({
				...s,
				items: s.items.map((i) => (i._id === id ? { ...i, ...updates } : i))
			})),
		removeItem: (id: string) =>
			update((s) => ({ ...s, items: s.items.filter((i) => i._id !== id) })),
		setLoading: (loading: boolean) => update((s) => ({ ...s, loading })),
		setError: (error: string | null) => update((s) => ({ ...s, error }))
	};
}

// ==================== Dashboard Store ====================
function createDashboardStore() {
	const { subscribe, update } = writable<{
		stats: IDashboardStats | null;
		loading: boolean;
		error: string | null;
	}>({
		stats: null,
		loading: false,
		error: null
	});

	return {
		subscribe,
		setStats: (stats: IDashboardStats) => update((s) => ({ ...s, stats })),
		setLoading: (loading: boolean) => update((s) => ({ ...s, loading })),
		setError: (error: string | null) => update((s) => ({ ...s, error }))
	};
}

// ==================== UI Store ====================
function createUIStore() {
	const { subscribe, update } = writable<{
		sidebarOpen: boolean;
		selectedTab: string;
		toastMessage: string | null;
	}>({
		sidebarOpen: true,
		selectedTab: 'dashboard',
		toastMessage: null
	});

	return {
		subscribe,
		toggleSidebar: () => update((s) => ({ ...s, sidebarOpen: !s.sidebarOpen })),
		setSidebarOpen: (open: boolean) => update((s) => ({ ...s, sidebarOpen: open })),
		setSelectedTab: (tab: string) => update((s) => ({ ...s, selectedTab: tab })),
		showToast: (message: string) => update((s) => ({ ...s, toastMessage: message })),
		clearToast: () => update((s) => ({ ...s, toastMessage: null }))
	};
}

// ==================== Export Stores ====================
export const barbers = createCollectionStore<IBarber>();
export const appointments = createCollectionStore<IAppointment>();
export const transactions = createCollectionStore<ITransaction>();
export const dashboard = createDashboardStore();
export const ui = createUIStore();

// ==================== Derived Stores ====================
export const activeBarbersCount = derived(barbers, ($barbers) =>
	$barbers.items.filter((b) => b.isActive).length
);

export const todayAppointmentsCount = derived(appointments, ($appointments) =>
	$appointments.items.filter((a) => {
		const today = new Date();
		const aptDate = new Date(a.startTime);
		return (
			aptDate.getDate() === today.getDate() &&
			aptDate.getMonth() === today.getMonth() &&
			aptDate.getFullYear() === today.getFullYear()
		);
	}).length
);

export const todayRevenue = derived(transactions, ($transactions) =>
	$transactions.items
		.filter((t) => {
			const today = new Date();
			const tDate = new Date(t.date);
			return (
				t.type === 'income' &&
				tDate.getDate() === today.getDate() &&
				tDate.getMonth() === today.getMonth() &&
				tDate.getFullYear() === today.getFullYear()
			);
		})
		.reduce((sum, t) => sum + t.amount, 0)
);

export const totalExpenses = derived(transactions, ($transactions) =>
	$transactions.items.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
);
