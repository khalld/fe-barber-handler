import mongoose, { Schema, Document } from 'mongoose';
import type { IBarber } from '../../types';

const BarberSchema = new Schema(
	{
		name: { type: String, required: true },
		username: { type: String, required: true, unique: true, lowercase: true, trim: true },
		email: { type: String, unique: true, sparse: true },
		password: { type: String, select: false },
		phone: { type: String },
		specializations: { type: [String], default: [] },
		bio: { type: String },
		profileImage: { type: String },
		isActive: { type: Boolean, default: true },
		hourlyRate: { type: Number, required: true, min: 0 },
		workingHours: {
			monday: { start: String, end: String },
			tuesday: { start: String, end: String },
			wednesday: { start: String, end: String },
			thursday: { start: String, end: String },
			friday: { start: String, end: String },
			saturday: { start: String, end: String },
			sunday: { start: String, end: String }
		},
		daysOff: { type: [Date], default: [] }
	},
	{ timestamps: true }
);

// Indici per ricerche veloci
BarberSchema.index({ username: 1 });
BarberSchema.index({ isActive: 1 });

export const Barber = mongoose.models.Barber || mongoose.model<IBarber & Document>('Barber', BarberSchema);
