// ==================== API Response ====================
export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

// ==================== Barber/Operator ====================
export interface IBarber {
	_id?: string;
	name: string;
	username: string; // Identificativo univoco per il login
	email?: string; // Contatto opzionale (non usato per il login)
	password?: string; // Hash della password — escluso dalle risposte API
	phone?: string;
	specializations: string[]; // es: "Taglio", "Barba", "Colore"
	bio?: string;
	profileImage?: string;
	isActive: boolean;
	hourlyRate: number; // Tarifa oraria
	workingHours: {
		monday?: { start: string; end: string };
		tuesday?: { start: string; end: string };
		wednesday?: { start: string; end: string };
		thursday?: { start: string; end: string };
		friday?: { start: string; end: string };
		saturday?: { start: string; end: string };
		sunday?: { start: string; end: string };
	};
	daysOff?: Date[];
	createdAt?: Date;
	updatedAt?: Date;
}

// ==================== Appointment/Booking ====================
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface IAppointment {
	_id?: string;
	barberId: string; // Riferimento a Barber
	clientName: string;
	clientEmail?: string;
	clientPhone: string;
	service: string; // es: "Taglio", "Barba", "Colore"
	duration: number; // in minuti
	startTime: Date;
	endTime: Date;
	price: number;
	notes?: string;
	status: AppointmentStatus;
	paymentStatus: 'pending' | 'paid' | 'refunded';
	paymentMethod?: 'cash' | 'card' | 'transfer';
	createdAt?: Date;
	updatedAt?: Date;
}

// ==================== Transaction (Entrate/Uscite) ====================
export type TransactionType = 'income' | 'expense';
export type TransactionCategory = 
	| 'appointment_payment'
	| 'product_sale'
	| 'salary'
	| 'supplies'
	| 'rent'
	| 'utilities'
	| 'maintenance'
	| 'other';

export interface ITransaction {
	_id?: string;
	type: TransactionType; // income o expense
	category: TransactionCategory;
	amount: number;
	description: string;
	barberId?: string; // Per colloqui legati a un barbiere
	appointmentId?: string; // Per transazioni legate a una prenotazione
	paymentMethod?: 'cash' | 'card' | 'transfer';
	notes?: string;
	date: Date;
	createdAt?: Date;
	updatedAt?: Date;
}

// ==================== Activity Log (Monitoraggio Attività) ====================
export type ActivityType = 'appointment_created' | 'appointment_completed' | 'appointment_cancelled' | 'transaction_recorded' | 'barber_login' | 'barber_logout';

export interface IActivityLog {
	_id?: string;
	barberId?: string;
	activityType: ActivityType;
	description: string;
	details?: Record<string, any>;
	appointmentId?: string;
	transactionId?: string;
	timestamp: Date;
	duration?: number; // in minuti, per login/logout
	createdAt?: Date;
}

// ==================== User (Client) ====================
export interface IUser {
	_id?: string;
	name: string;
	username: string; // Identificativo univoco per il login
	email?: string; // Contatto opzionale (non usato per il login)
	phone: string;
	password?: string; // Hash della password
	appointments: string[]; // IDs delle prenotazioni
	registeredAt?: Date;
	updatedAt?: Date;
}

// ==================== Warehouse ====================
export type WarehouseCategory = 'shampoo' | 'tools' | 'disposables' | 'color' | 'other';

export interface IWarehouseItem {
	_id?: string;
	name: string;
	category: WarehouseCategory;
	quantity: number;
	minQuantity: number;
	unit: string;
	purchasePrice: number;
	supplier?: string;
	notes?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

// ==================== Dashboard Stats ====================
export interface IDashboardStats {
	totalAppointmentsToday: number;
	completedAppointmentsToday: number;
	totalRevenueToday: number;
	totalExpensesMonth: number;
	activeBarbers: number;
	upcomingAppointments: IAppointment[];
	topBarbers: Array<{
		barberId: string;
		name: string;
		appointmentsCount: number;
		revenue: number;
	}>;
	monthlyRevenue: Array<{ date: string; amount: number }>;
	appointmentsByService: Array<{ service: string; count: number }>;
}
