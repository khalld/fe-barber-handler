import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
	username: string;
	password: string;
	email?: string;
	isAdmin: boolean;
	createdAt: Date;
	updatedAt: Date;
	comparePassword(plainPassword: string): Promise<boolean>;
}

const UserSchema = new Schema(
	{
		username: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		email: { type: String, unique: true, sparse: true },
		isAdmin: { type: Boolean, default: false }
	},
	{ timestamps: true }
);

// Metodo per comparare password
UserSchema.methods.comparePassword = async function (plainPassword: string): Promise<boolean> {
	return bcrypt.compare(plainPassword, this.password);
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
