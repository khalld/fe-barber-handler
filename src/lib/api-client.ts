import type {
	ApiResponse,
	IBarber,
	IAppointment,
	ITransaction,
	IWarehouseItem,
	IDashboardStats,
	IUser
} from '$lib/types';

const API_BASE = '/api';

interface RequestOptions extends RequestInit {
	params?: Record<string, string | number | boolean>;
}

/**
 * Helper per le chiamate API
 * Gestisce errori, query params, e type safety
 */
export async function apiCall<T>(
	endpoint: string,
	options: RequestOptions = {}
): Promise<ApiResponse<T>> {
	const { params, ...fetchOptions } = options;

	// Costruisci URL con query params
	let url = `${API_BASE}${endpoint}`;
	if (params) {
		const searchParams = new URLSearchParams();
		Object.entries(params).forEach(([key, value]) => {
			if (value !== null && value !== undefined) {
				searchParams.append(key, String(value));
			}
		});
		const query = searchParams.toString();
		if (query) url += `?${query}`;
	}

	try {
		const response = await fetch(url, {
			headers: { 'Content-Type': 'application/json' },
			...fetchOptions
		});

		const data = await response.json();

		if (!response.ok) {
			return {
				success: false,
				error: data.error || `HTTP ${response.status}`
			};
		}

		return data;
	} catch (error) {
		console.error('[API Error]', endpoint, error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Errore sconosciuto'
		};
	}
}

/** Slot di disponibilità restituiti dagli endpoint di booking. */
interface AvailabilityData {
	availableSlots: string[];
}

// ==================== BARBER API ====================
export async function getBarbers() {
	return apiCall<IBarber[]>('/barbers');
}

export async function getBarberById(id: string) {
	return apiCall<IBarber>(`/barbers`, { params: { id } });
}

export async function createBarber(data: Partial<IBarber>) {
	return apiCall<IBarber>('/barbers', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateBarber(id: string, data: Partial<IBarber>) {
	return apiCall<IBarber>('/barbers', {
		method: 'PATCH',
		body: JSON.stringify({ ...data, _id: id })
	});
}

export async function deleteBarber(id: string) {
	return apiCall<null>('/barbers', { method: 'DELETE', params: { id } });
}

// ==================== APPOINTMENT API ====================
export async function getAppointments(filters?: Record<string, string | number | boolean>) {
	return apiCall<IAppointment[]>('/appointments', { params: filters });
}

export async function getAppointmentsByDate(date: Date) {
	return apiCall<IAppointment[]>('/appointments', {
		params: { date: date.toISOString().split('T')[0] }
	});
}

export async function getBarberAvailability(barberId: string, date: Date) {
	return apiCall<AvailabilityData>('/appointments', {
		params: {
			availability: true,
			barberId,
			date: date.toISOString().split('T')[0]
		}
	});
}

export async function createAppointment(data: Partial<IAppointment>) {
	return apiCall<IAppointment>('/appointments', {
		method: 'POST',
		body: JSON.stringify(data)
	});
}

export async function updateAppointment(id: string, data: Partial<IAppointment>) {
	return apiCall<IAppointment>('/appointments', {
		method: 'PATCH',
		body: JSON.stringify({ ...data, _id: id })
	});
}

export async function completeAppointment(id: string) {
	return apiCall<IAppointment>('/appointments', {
		method: 'DELETE',
		params: { id, action: 'complete' }
	});
}

export async function cancelAppointment(id: string) {
	return apiCall<IAppointment>('/appointments', {
		method: 'DELETE',
		params: { id, action: 'cancel' }
	});
}

// ==================== TRANSACTION API ====================
export async function getTransactions(filters?: Record<string, string | number | boolean>) {
	return apiCall<ITransaction[]>('/transactions', { params: filters });
}

export async function getTransactionsByCategory(startDate: Date, endDate: Date) {
	return apiCall<Record<string, number>>('/transactions', {
		params: {
			byCategory: true,
			startDate: startDate.toISOString().split('T')[0],
			endDate: endDate.toISOString().split('T')[0]
		}
	});
}

export async function getDailyTransactionTotals(startDate: Date, endDate: Date) {
	return apiCall<Array<{ date: string; income: number; expense: number }>>('/transactions', {
		params: {
			dailyTotals: true,
			startDate: startDate.toISOString().split('T')[0],
			endDate: endDate.toISOString().split('T')[0]
		}
	});
}

export async function createTransaction(data: Partial<ITransaction>) {
	return apiCall<ITransaction>('/transactions', {
		method: 'POST',
		body: JSON.stringify(data)
	});
}

export async function updateTransaction(id: string, data: Partial<ITransaction>) {
	return apiCall<ITransaction>('/transactions', {
		method: 'PATCH',
		body: JSON.stringify({ ...data, _id: id })
	});
}

export async function deleteTransaction(id: string) {
	return apiCall<null>('/transactions', { method: 'DELETE', params: { id } });
}

// ==================== DASHBOARD API ====================
export async function getDashboardStats() {
	return apiCall<IDashboardStats>('/dashboard');
}

export async function getBarberDashboard(barberId: string, daysRange: number = 30) {
	return apiCall<IDashboardStats>('/dashboard', {
		params: { barber: barberId, daysRange }
	});
}

export async function getDailyReport(date: Date) {
	return apiCall<IDashboardStats>('/dashboard', {
		params: { report: date.toISOString().split('T')[0] }
	});
}

export function exportToCSV(data: any[], filename: string): void {
	if (!data || data.length === 0) {
		console.error('Nessun dato da esportare');
		return;
	}

	// Get headers from first object
	const headers = Object.keys(data[0]);

	// Create CSV content
	let csvContent = headers.join(',') + '\n';

	data.forEach(row => {
		const values = headers.map(header => {
			const value = row[header];
			// Escape quotes and wrap in quotes if contains comma
			if (value === null || value === undefined) return '';
			const stringValue = String(value);
			if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
				return '"' + stringValue.replace(/"/g, '""') + '"';
			}
			return stringValue;
		});
		csvContent += values.join(',') + '\n';
	});

	// Create blob and download
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	const url = URL.createObjectURL(blob);

	link.setAttribute('href', url);
	link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
	link.style.visibility = 'hidden';

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

// ==================== ADMIN USER MANAGEMENT ====================
export async function getAdminUsers() {
	return apiCall<IUser[]>('/admin/users');
}

export async function createAdminUser(data: {
	name: string;
	email: string;
	phone: string;
	password: string;
}) {
	return apiCall<IUser>('/admin/users', { method: 'POST', body: JSON.stringify(data) });
}

export async function deleteAdminUser(id: string) {
	return apiCall<null>('/admin/users', { method: 'DELETE', params: { id } });
}

// ==================== WAREHOUSE ====================
export async function getWarehouseItems(lowStock?: boolean) {
	return apiCall<IWarehouseItem[]>('/warehouse', lowStock ? { params: { lowStock: true } } : {});
}

export async function createWarehouseItem(data: Partial<IWarehouseItem>) {
	return apiCall<IWarehouseItem>('/warehouse', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateWarehouseItem(id: string, data: Partial<IWarehouseItem>) {
	return apiCall<IWarehouseItem>('/warehouse', { method: 'PATCH', body: JSON.stringify({ ...data, _id: id }) });
}

export async function deleteWarehouseItem(id: string) {
	return apiCall<null>('/warehouse', { method: 'DELETE', params: { id } });
}

// ==================== USER CLIENT ENDPOINTS ====================

export async function registerUser(userData: {
	name: string;
	email: string;
	phone: string;
	password: string;
	confirmPassword: string;
}) {
	return apiCall<IUser>('/users/register', {
		method: 'POST',
		body: JSON.stringify(userData)
	});
}

export async function loginUser(email: string, password: string) {
	return apiCall<IUser>('/users/login', {
		method: 'POST',
		body: JSON.stringify({ email, password })
	});
}

export async function logoutUser() {
	return apiCall<null>('/users/logout', {
		method: 'POST'
	});
}

export async function getAvailableBarbers() {
	return apiCall<IBarber[]>('/users/available-barbers');
}

export async function getAvailableSlots(barberId: string, date: string) {
	return apiCall<string[]>('/users/available-slots', {
		params: { barberId, date }
	});
}

export async function getUserAppointments(userId: string) {
	return apiCall<IAppointment[]>('/users/appointments', {
		params: { userId }
	});
}

export async function createUserAppointment(appointmentData: {
	userId: string;
	barberId: string;
	clientName: string;
	clientEmail: string;
	clientPhone: string;
	serviceType: string;
	duration: number;
	dateTime: string;
	totalPrice: number;
}) {
	return apiCall<IAppointment>('/users/appointments', {
		method: 'POST',
		body: JSON.stringify(appointmentData)
	});
}

export async function cancelUserAppointment(appointmentId: string, userId: string) {
	return apiCall<null>('/users/appointments', {
		method: 'DELETE',
		params: { appointmentId, userId }
	});
}
