import mongoose, { Schema, Document } from 'mongoose';
import type { IActivityLog } from '../../types';

const ActivityLogSchema = new Schema(
	{
		barberId: { type: Schema.Types.ObjectId, ref: 'Barber' },
		activityType: {
			type: String,
			enum: ['appointment_created', 'appointment_completed', 'appointment_cancelled', 'transaction_recorded', 'barber_login', 'barber_logout'],
			required: true
		},
		description: { type: String, required: true },
		details: { type: Schema.Types.Mixed },
		appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
		transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
		timestamp: { type: Date, required: true, default: Date.now },
		duration: { type: Number } // in minuti
	},
	{ timestamps: true }
);

// Indici per ricerche veloci
ActivityLogSchema.index({ barberId: 1, timestamp: -1 });
ActivityLogSchema.index({ activityType: 1 });
ActivityLogSchema.index({ timestamp: -1 });

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model<IActivityLog & Document>('ActivityLog', ActivityLogSchema);
