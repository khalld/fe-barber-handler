import { apiResponse } from '$lib/server/api';
import type { RequestHandler } from './$types';
import { DashboardService } from '$lib/services/dashboardService';
import { DEMO_BARBER_ID, getDemoBarberDashboard } from '$lib/server/demoAuth';
import type { IDashboardStats } from '$lib/types';

// GET /api/dashboard
// Query params: stats, barber=id, report=YYYY-MM-DD
export const GET: RequestHandler = async ({ url }) => {
	try {
		const barberId = url.searchParams.get('barber');
		const reportDate = url.searchParams.get('report');

		// Rapporto giornaliero
		if (reportDate) {
			const date = new Date(reportDate);
			const report = await DashboardService.getDailyReport(date);
			return apiResponse<any>({ success: true, data: report });
		}

		// Dashboard di un barbiere specifico
		if (barberId) {
			// Demo barber: synthetic data, no MongoDB.
			if (barberId === DEMO_BARBER_ID) {
				return apiResponse<any>({ success: true, data: getDemoBarberDashboard() });
			}
			const daysRange = parseInt(url.searchParams.get('daysRange') || '30');
			const data = await DashboardService.getBarberDashboard(barberId, daysRange);
			return apiResponse<any>({ success: true, data });
		}

		// Dashboard generale (oggi)
		const stats = await DashboardService.getTodayStats();
		return apiResponse<IDashboardStats>({ success: true, data: stats });
	} catch (error) {
		console.error('[Dashboard API] Errore:', error);
		return apiResponse<null>(
			{ success: false, error: error instanceof Error ? error.message : 'Errore del server' },
			{ status: 500 }
		);
	}
};
