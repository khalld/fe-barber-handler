import mongoose, { Schema, Document } from 'mongoose';
import type { IWarehouseItem } from '../../types';

const WarehouseItemSchema = new Schema(
	{
		name: { type: String, required: true },
		category: {
			type: String,
			required: true,
			enum: ['shampoo', 'tools', 'disposables', 'color', 'other'],
			default: 'other'
		},
		quantity: { type: Number, required: true, min: 0, default: 0 },
		minQuantity: { type: Number, required: true, min: 0, default: 0 },
		unit: { type: String, required: true, default: 'pz' },
		purchasePrice: { type: Number, required: true, min: 0, default: 0 },
		supplier: { type: String },
		notes: { type: String }
	},
	{ timestamps: true }
);

WarehouseItemSchema.index({ category: 1 });
WarehouseItemSchema.index({ name: 1 });

export const WarehouseItem =
	mongoose.models.WarehouseItem ||
	mongoose.model<IWarehouseItem & Document>('WarehouseItem', WarehouseItemSchema);
