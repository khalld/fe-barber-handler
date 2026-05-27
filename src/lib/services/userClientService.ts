import bcrypt from 'bcryptjs';
import { UserClient } from '../db/models/UserClient';
import { Appointment } from '../db/models/Appointment';
import type { IUser, IAppointment } from '../types';
import { connectDB } from '../db/mongodb';

export class UserClientService {
	static async registerUser(userData: {
		name: string;
		email: string;
		phone: string;
		password: string;
	}): Promise<IUser | null> {
		await connectDB();

		try {
			// Check if user already exists
			const existingUser = await UserClient.findOne({ email: userData.email });
			if (existingUser) {
				throw new Error('Email già registrata');
			}

			// Hash password
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(userData.password, salt);

			// Create new user
			const user = new UserClient({
				name: userData.name,
				email: userData.email,
				phone: userData.phone,
				password: hashedPassword,
				appointments: [],
				registeredAt: new Date(),
				updatedAt: new Date()
			});

			await user.save();
			return user.toObject();
		} catch (error) {
			console.error('Errore nella registrazione:', error);
			throw error;
		}
	}

	static async loginUser(email: string, password: string): Promise<IUser | null> {
		await connectDB();

		try {
			const user = await UserClient.findOne({ email: email.toLowerCase() });
			if (!user) {
				return null;
			}

			const isPasswordValid = await user.comparePassword(password);
			if (!isPasswordValid) {
				return null;
			}

			return user.toObject();
		} catch (error) {
			console.error('Errore nel login:', error);
			throw error;
		}
	}

	static async getUserById(userId: string): Promise<IUser | null> {
		await connectDB();

		try {
			const user = await UserClient.findById(userId);
			return user ? user.toObject() : null;
		} catch (error) {
			console.error('Errore nel recupero utente:', error);
			throw error;
		}
	}

	static async getUserByEmail(email: string): Promise<IUser | null> {
		await connectDB();

		try {
			const user = await UserClient.findOne({ email: email.toLowerCase() });
			return user ? user.toObject() : null;
		} catch (error) {
			console.error('Errore nel recupero utente:', error);
			throw error;
		}
	}

	static async getUserAppointments(userId: string): Promise<IAppointment[]> {
		await connectDB();

		try {
			const appointments = await Appointment.find({
				_id: { $in: (await UserClient.findById(userId))?.appointments || [] }
			});
			return appointments.map(a => a.toObject());
		} catch (error) {
			console.error('Errore nel recupero prenotazioni:', error);
			throw error;
		}
	}

	static async addAppointmentToUser(userId: string, appointmentId: string): Promise<IUser | null> {
		await connectDB();

		try {
			const user = await UserClient.findByIdAndUpdate(
				userId,
				{
					$addToSet: { appointments: appointmentId },
					updatedAt: new Date()
				},
				{ new: true }
			);
			return user ? user.toObject() : null;
		} catch (error) {
			console.error('Errore nell\'aggiunta prenotazione:', error);
			throw error;
		}
	}

	static async removeAppointmentFromUser(userId: string, appointmentId: string): Promise<IUser | null> {
		await connectDB();

		try {
			const user = await UserClient.findByIdAndUpdate(
				userId,
				{
					$pull: { appointments: appointmentId },
					updatedAt: new Date()
				},
				{ new: true }
			);
			return user ? user.toObject() : null;
		} catch (error) {
			console.error('Errore nella rimozione prenotazione:', error);
			throw error;
		}
	}

	static async updateUser(userId: string, updates: Partial<IUser>): Promise<IUser | null> {
		await connectDB();

		try {
			const user = await UserClient.findByIdAndUpdate(
				userId,
				{
					...updates,
					updatedAt: new Date()
				},
				{ new: true }
			);
			return user ? user.toObject() : null;
		} catch (error) {
			console.error('Errore nell\'aggiornamento utente:', error);
			throw error;
		}
	}

	static async deleteUser(userId: string): Promise<void> {
		await connectDB();

		try {
			await UserClient.findByIdAndDelete(userId);
		} catch (error) {
			console.error('Errore nella cancellazione utente:', error);
			throw error;
		}
	}
}
