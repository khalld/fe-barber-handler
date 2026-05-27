/**
 * Index file - Esporta tutti i servizi e le interfacce
 * Facilita l'importazione nei componenti Svelte
 */

// ==================== Services ====================
export { BarberService } from './services/barberService';
export { AppointmentService } from './services/appointmentService';
export { TransactionService } from './services/transactionService';
export { DashboardService } from './services/dashboardService';

// ==================== Types ====================
export type {
	ApiResponse,
	IBarber,
	IAppointment,
	ITransaction,
	IActivityLog,
	IDashboardStats,
	AppointmentStatus,
	TransactionType,
	TransactionCategory,
	ActivityType
} from './types';

// ==================== Models ====================
export { User } from './db/models/User';
export { Barber } from './db/models/Barber';
export { Appointment } from './db/models/Appointment';
export { Transaction } from './db/models/Transaction';
export { ActivityLog } from './db/models/ActivityLog';

// ==================== Database ====================
export { connectDB } from './db/mongodb';
