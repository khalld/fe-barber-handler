import mongoose, { Schema, Document } from 'mongoose';
import type { ITransaction } from '../../types';

const TransactionSchema = new Schema(
	{
		type: {
			type: String,
			enum: ['income', 'expense'],
			required: true
		},
		category: {
			type: String,
			enum: [
				'appointment_payment',
				'product_sale',
				'salary',
				'supplies',
				'rent',
				'utilities',
				'maintenance',
				'other'
			],
			required: true
		},
		amount: { type: Number, required: true, min: 0 },
		description: { type: String, required: true },
		barberId: { type: Schema.Types.ObjectId, ref: 'Barber' },
		appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
		paymentMethod: {
			type: String,
			enum: ['cash', 'card', 'transfer'],
			sparse: true
		},
		notes: { type: String },
		date: { type: Date, required: true, default: Date.now }
	},
	{ timestamps: true }
);

// Indici per ricerche veloci
TransactionSchema.index({ type: 1, date: -1 });
TransactionSchema.index({ category: 1 });
TransactionSchema.index({ barberId: 1 });
TransactionSchema.index({ date: -1 });

export const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction & Document>('Transaction', TransactionSchema);
