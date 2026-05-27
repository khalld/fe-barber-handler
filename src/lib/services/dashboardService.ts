import { connectDB } from '../db/mongodb';
import { Appointment } from '../db/models/Appointment';
import { Barber } from '../db/models/Barber';
import { Transaction } from '../db/models/Transaction';
import type { IDashboardStats } from '../types';

export class DashboardService {
	// Ottiene le statistiche della dashboard per un giorno specifico
	static async getTodayStats(): Promise<IDashboardStats> {
		try {
			await connectDB();

			const today = new Date();
			today.setHours(0, 0, 0, 0);

			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);

			// Prenotazioni di oggi
			const totalAppointmentsToday = await Appointment.countDocuments({
				startTime: { $gte: today, $lt: tomorrow },
				status: { $ne: 'cancelled' }
			});

			const completedAppointmentsToday = await Appointment.countDocuments({
				startTime: { $gte: today, $lt: tomorrow },
				status: 'completed'
			});

			// Revenue di oggi
			const todayRevenue = await Transaction.aggregate([
				{
					$match: {
						type: 'income',
						date: { $gte: today, $lt: tomorrow }
					}
				},
				{
					$group: {
						_id: null,
						total: { $sum: '$amount' }
					}
				}
			]);

			const totalRevenueToday = todayRevenue[0]?.total || 0;

			// Spese del mese
			const monthStart = new Date();
			monthStart.setDate(1);
			monthStart.setHours(0, 0, 0, 0);

			const monthlyExpenses = await Transaction.aggregate([
				{
					$match: {
						type: 'expense',
						date: { $gte: monthStart, $lt: tomorrow }
					}
				},
				{
					$group: {
						_id: null,
						total: { $sum: '$amount' }
					}
				}
			]);

			const totalExpensesMonth = monthlyExpenses[0]?.total || 0;

			// Barbieri attivi oggi
			const activeBarbers = await Appointment.distinct('barberId', {
				startTime: { $gte: today, $lt: tomorrow },
				status: { $ne: 'cancelled' }
			});

			// Prossime prenotazioni (entro le prossime 2 ore)
			const now = new Date();
			const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

			const upcomingAppointments = await Appointment.find({
				startTime: { $gte: now, $lte: in2Hours },
				status: { $in: ['pending', 'confirmed'] }
			})
				.populate('barberId', 'name')
				.sort({ startTime: 1 })
				.lean();

			// Top barbieri (ultimi 30 giorni)
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

			const topBarbers = await Appointment.aggregate([
				{
					$match: {
						status: 'completed',
						createdAt: { $gte: thirtyDaysAgo }
					}
				},
				{
					$group: {
						_id: '$barberId',
						appointmentsCount: { $sum: 1 },
						revenue: { $sum: '$price' }
					}
				},
				{ $sort: { revenue: -1 } },
				{ $limit: 5 },
				{
					$lookup: {
						from: 'barbers',
						localField: '_id',
						foreignField: '_id',
						as: 'barber'
					}
				}
			]);

			const topBarbersFormatted = await Promise.all(
				topBarbers.map(async (b: any) => ({
					barberId: b._id.toString(),
					name: b.barber[0]?.name || 'Sconosciuto',
					appointmentsCount: b.appointmentsCount,
					revenue: b.revenue
				}))
			);

			// Revenue mensile (ultimi 12 mesi)
			const monthlyRevenue = await Transaction.aggregate([
				{
					$match: {
						type: 'income',
						date: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }
					}
				},
				{
					$group: {
						_id: {
							$dateToString: { format: '%Y-%m', date: '$date' }
						},
						amount: { $sum: '$amount' }
					}
				},
				{ $sort: { _id: 1 } }
			]);

			// Prenotazioni per servizio
			const appointmentsByService = await Appointment.aggregate([
				{
					$match: {
						status: { $ne: 'cancelled' },
						createdAt: { $gte: thirtyDaysAgo }
					}
				},
				{
					$group: {
						_id: '$service',
						count: { $sum: 1 }
					}
				},
				{ $sort: { count: -1 } }
			]);

			return {
				totalAppointmentsToday,
				completedAppointmentsToday,
				totalRevenueToday,
				totalExpensesMonth,
				activeBarbers: activeBarbers.length,
				upcomingAppointments: upcomingAppointments as any,
				topBarbers: topBarbersFormatted,
				monthlyRevenue: monthlyRevenue.map((m: any) => ({
					date: m._id,
					amount: m.amount
				})),
				appointmentsByService: appointmentsByService.map((a: any) => ({
					service: a._id,
					count: a.count
				}))
			};
		} catch (error) {
			throw new Error(`Errore nel recupero delle statistiche: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Ottiene le statistiche per un barbiere specifico
	static async getBarberDashboard(barberId: string, daysRange: number = 30): Promise<any> {
		try {
			await connectDB();

			const startDate = new Date();
			startDate.setDate(startDate.getDate() - daysRange);

			const todayStart = new Date();
			todayStart.setHours(0, 0, 0, 0);
			const todayEnd = new Date();
			todayEnd.setHours(23, 59, 59, 999);

			// Prenotazioni totali nel periodo
			const totalAppointments = await Appointment.countDocuments({
				barberId,
				createdAt: { $gte: startDate }
			});

			// Prenotazioni completate nel periodo
			const completedAppointments = await Appointment.countDocuments({
				barberId,
				status: 'completed',
				createdAt: { $gte: startDate }
			});

			// Prenotazioni di oggi (conteggio)
			const appointmentsToday = await Appointment.countDocuments({
				barberId,
				startTime: { $gte: todayStart, $lte: todayEnd },
				status: { $ne: 'cancelled' }
			});

			// Completate oggi
			const completedToday = await Appointment.countDocuments({
				barberId,
				startTime: { $gte: todayStart, $lte: todayEnd },
				status: 'completed'
			});

			// Prenotazioni di oggi (lista)
			const todayAppointments = await Appointment.find({
				barberId,
				startTime: { $gte: todayStart, $lte: todayEnd },
				status: { $ne: 'cancelled' }
			})
				.sort({ startTime: 1 })
				.lean();

			// Revenue totale nel periodo
			const revenue = await Transaction.aggregate([
				{
					$match: {
						barberId,
						type: 'income',
						date: { $gte: startDate }
					}
				},
				{
					$group: {
						_id: null,
						total: { $sum: '$amount' }
					}
				}
			]);

			// Revenue di oggi
			const todayRevenueAgg = await Transaction.aggregate([
				{
					$match: {
						barberId,
						type: 'income',
						date: { $gte: todayStart, $lte: todayEnd }
					}
				},
				{ $group: { _id: null, total: { $sum: '$amount' } } }
			]);

			// Sessioni lavorate nel periodo
			const hoursWorked = await Transaction.countDocuments({
				barberId,
				type: 'income',
				date: { $gte: startDate }
			});

			// Servizi più richiesti
			const topServices = await Appointment.aggregate([
				{
					$match: {
						barberId,
						status: 'completed',
						createdAt: { $gte: startDate }
					}
				},
				{
					$group: {
						_id: '$service',
						count: { $sum: 1 },
						revenue: { $sum: '$price' }
					}
				},
				{ $sort: { revenue: -1 } },
				{ $limit: 5 }
			]);

			// Revenue giornaliero (storico)
			const revenueHistory = await Transaction.aggregate([
				{
					$match: {
						barberId,
						type: 'income',
						date: { $gte: startDate }
					}
				},
				{
					$group: {
						_id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
						amount: { $sum: '$amount' }
					}
				},
				{ $sort: { _id: 1 } }
			]);

			return {
				totalAppointments,
				completedAppointments,
				appointmentsToday,
				completedToday,
				revenueToday: todayRevenueAgg[0]?.total || 0,
				totalRevenue: revenue[0]?.total || 0,
				hoursWorked,
				averageRating: 0,
				todayAppointments,
				topServices: topServices.map((s: any) => ({
					name: s._id,
					count: s.count,
					revenue: s.revenue
				})),
				revenueHistory: revenueHistory.map((d: any) => ({
					date: d._id,
					amount: d.amount
				}))
			};
		} catch (error) {
			throw new Error(`Errore nel recupero della dashboard del barbiere: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Ottiene il rapporto giornaliero
	static async getDailyReport(date: Date): Promise<any> {
		try {
			await connectDB();

			const startOfDay = new Date(date);
			startOfDay.setHours(0, 0, 0, 0);

			const endOfDay = new Date(date);
			endOfDay.setHours(23, 59, 59, 999);

			// Prenotazioni
			const appointments = await Appointment.find({
				startTime: { $gte: startOfDay, $lte: endOfDay },
				status: { $ne: 'cancelled' }
			})
				.populate('barberId', 'name')
				.sort({ startTime: 1 });

			// Entrate
			const income = await Transaction.aggregate([
				{
					$match: {
						type: 'income',
						date: { $gte: startOfDay, $lte: endOfDay }
					}
				},
				{
					$group: {
						_id: null,
						total: { $sum: '$amount' }
					}
				}
			]);

			// Uscite
			const expenses = await Transaction.aggregate([
				{
					$match: {
						type: 'expense',
						date: { $gte: startOfDay, $lte: endOfDay }
					}
				},
				{
					$group: {
						_id: null,
						total: { $sum: '$amount' }
					}
				}
			]);

			const totalIncome = income[0]?.total || 0;
			const totalExpenses = expenses[0]?.total || 0;

			return {
				date: date.toISOString().split('T')[0],
				appointmentsCount: appointments.length,
				completedCount: appointments.filter((a: any) => a.status === 'completed').length,
				totalIncome,
				totalExpenses,
				net: totalIncome - totalExpenses,
				appointments: appointments,
				appointmentsByBarber: appointments.reduce((acc: any, apt: any) => {
					const barberName = apt.barberId?.name || 'Sconosciuto';
					if (!acc[barberName]) {
						acc[barberName] = [];
					}
					acc[barberName].push(apt);
					return acc;
				}, {})
			};
		} catch (error) {
			throw new Error(`Errore nel recupero del rapporto giornaliero: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}
}
