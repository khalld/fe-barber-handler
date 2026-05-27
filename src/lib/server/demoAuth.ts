import bcrypt from 'bcryptjs';
import 'dotenv/config';
import type { IBarber, IUser } from '$lib/types';

// Demo authentication: lets admin, barber and client log in WITHOUT touching
// MongoDB. Credentials are verified in-memory so the demo works even when the
// database is unreachable. The password for every demo account is "demo123",
// compared with bcrypt against a hash generated at module load.
const DEMO_PASSWORD = 'demo123';
const DEMO_PASSWORD_HASH = bcrypt.hashSync(DEMO_PASSWORD, 10);

const DEMO_ADMIN_USERNAME = process.env.PUBLIC_DEMO_ADMIN_USERNAME || process.env.ADMIN_USERNAME || 'admin';
const DEMO_BARBER_EMAIL = (process.env.PUBLIC_DEMO_BARBER_EMAIL || 'marco@barbershop.demo').toLowerCase();
const DEMO_CLIENT_EMAIL = (process.env.PUBLIC_DEMO_CLIENT_EMAIL || 'cliente@demo.it').toLowerCase();

export const DEMO_BARBER_ID = 'demo-barber-001';
export const DEMO_CLIENT_ID = 'demo-client-001';

const DEMO_BARBER: IBarber = {
	_id: DEMO_BARBER_ID,
	name: 'Marco Demo',
	email: DEMO_BARBER_EMAIL,
	phone: '+39 333 0000000',
	specializations: ['Taglio', 'Barba'],
	bio: 'Barbiere demo',
	isActive: true,
	hourlyRate: 30,
	workingHours: {
		monday: { start: '09:00', end: '18:00' },
		tuesday: { start: '09:00', end: '18:00' },
		wednesday: { start: '09:00', end: '18:00' },
		thursday: { start: '09:00', end: '18:00' },
		friday: { start: '09:00', end: '18:00' },
		saturday: { start: '09:00', end: '13:00' }
	}
};

const DEMO_CLIENT: IUser = {
	_id: DEMO_CLIENT_ID,
	name: 'Cliente Demo',
	email: DEMO_CLIENT_EMAIL,
	phone: '+39 333 1111111',
	appointments: []
};

function passwordMatches(password: string): boolean {
	return bcrypt.compareSync(password, DEMO_PASSWORD_HASH);
}

export function isDemoBarberEmail(email: string): boolean {
	return email.toLowerCase() === DEMO_BARBER_EMAIL;
}

export function isDemoClientEmail(email: string): boolean {
	return email.toLowerCase() === DEMO_CLIENT_EMAIL;
}

export function verifyDemoAdmin(username: string, password: string): boolean {
	return username === DEMO_ADMIN_USERNAME && passwordMatches(password);
}

export function verifyDemoBarber(email: string, password: string): IBarber | null {
	if (!isDemoBarberEmail(email) || !passwordMatches(password)) return null;
	return { ...DEMO_BARBER };
}

export function verifyDemoClient(email: string, password: string): IUser | null {
	if (!isDemoClientEmail(email) || !passwordMatches(password)) return null;
	return { ...DEMO_CLIENT };
}

export function getDemoBarberById(id: string): IBarber | null {
	return id === DEMO_BARBER_ID ? { ...DEMO_BARBER } : null;
}

export function getDemoClientById(id: string): IUser | null {
	return id === DEMO_CLIENT_ID ? { ...DEMO_CLIENT } : null;
}

// Synthetic dashboard for the demo barber so the dashboard renders without a DB.
export function getDemoBarberDashboard() {
	const at = (hour: number, minute = 0) => {
		const d = new Date();
		d.setHours(hour, minute, 0, 0);
		return d.toISOString();
	};

	const revenueHistory = Array.from({ length: 30 }, (_, i) => {
		const d = new Date();
		d.setDate(d.getDate() - (29 - i));
		return { date: d.toISOString().split('T')[0], amount: 80 + Math.round(Math.sin(i) * 40 + i * 3) };
	});

	return {
		totalAppointments: 86,
		completedAppointments: 72,
		appointmentsToday: 4,
		completedToday: 2,
		revenueToday: 95,
		totalRevenue: 3420,
		hoursWorked: 72,
		averageRating: 4.8,
		todayAppointments: [
			{ clientName: 'Luca Bianchi', service: 'Taglio', startTime: at(9, 30), status: 'completed', price: 25 },
			{ clientName: 'Andrea Verdi', service: 'Taglio + Barba', startTime: at(11, 0), status: 'completed', price: 35 },
			{ clientName: 'Marco Neri', service: 'Barba', startTime: at(15, 0), status: 'confirmed', price: 15 },
			{ clientName: 'Giulia Rossi', service: 'Colore', startTime: at(17, 0), status: 'pending', price: 45 }
		],
		topServices: [
			{ name: 'Taglio', count: 38, revenue: 950 },
			{ name: 'Taglio + Barba', count: 21, revenue: 735 },
			{ name: 'Barba', count: 18, revenue: 270 },
			{ name: 'Colore', count: 9, revenue: 405 }
		],
		revenueHistory
	};
}
