import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import type { IUser } from '$lib/types';

interface IUserDocument extends Omit<IUser, '_id'>, mongoose.Document {
	comparePassword(plainPassword: string): Promise<boolean>;
}

const userClientSchema = new mongoose.Schema<IUserDocument>(
	{
		name: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true
		},
		phone: {
			type: String,
			required: true
		},
		password: {
			type: String,
			required: true
		},
		appointments: {
			type: [String],
			default: []
		},
		registeredAt: {
			type: Date,
			default: () => new Date()
		},
		updatedAt: {
			type: Date,
			default: () => new Date()
		}
	},
	{ timestamps: true }
);

// Index per email per ricerche veloci
userClientSchema.index({ email: 1 });

// Metodo per comparare password
userClientSchema.methods.comparePassword = async function (plainPassword: string): Promise<boolean> {
	return bcrypt.compare(plainPassword, this.password);
};

export const UserClient = mongoose.models.UserClient || mongoose.model<IUserDocument>('UserClient', userClientSchema);
