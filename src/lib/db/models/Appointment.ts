import mongoose, { Schema, Document } from 'mongoose';
import type { IAppointment } from '../../types';

const AppointmentSchema = new Schema(
	{
		barberId: { type: Schema.Types.ObjectId, ref: 'Barber', required: true },
		clientName: { type: String, required: true },
		clientEmail: { type: String },
		clientPhone: { type: String, required: true },
		service: { type: String, required: true },
		duration: { type: Number, required: true }, // minuti
		startTime: { type: Date, required: true },
		endTime: { type: Date, required: true },
		price: { type: Number, required: true, min: 0 },
		notes: { type: String },
		status: {
			type: String,
			enum: ['pending', 'confirmed', 'completed', 'cancelled'],
			default: 'pending'
		},
		paymentStatus: {
			type: String,
			enum: ['pending', 'paid', 'refunded'],
			default: 'pending'
		},
		paymentMethod: {
			type: String,
			enum: ['cash', 'card', 'transfer'],
			sparse: true
		}
	},
	{ timestamps: true }
);

// Indici per ricerche veloci
AppointmentSchema.index({ barberId: 1, startTime: 1 });
AppointmentSchema.index({ startTime: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ createdAt: -1 });

export const Appointment = mongoose.models.Appointment || mongoose.model<IAppointment & Document>('Appointment', AppointmentSchema);
