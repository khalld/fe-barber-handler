import { connectDB } from '../db/mongodb';
import { WarehouseItem } from '../db/models/WarehouseItem';
import type { IWarehouseItem } from '../types';

export class WarehouseService {
	static async getAllItems(): Promise<IWarehouseItem[]> {
		await connectDB();
		return (await WarehouseItem.find({}).sort({ name: 1 }).lean()) as unknown as IWarehouseItem[];
	}

	static async getItemById(id: string): Promise<IWarehouseItem | null> {
		await connectDB();
		return (await WarehouseItem.findById(id).lean()) as IWarehouseItem | null;
	}

	static async createItem(data: Omit<IWarehouseItem, '_id' | 'createdAt' | 'updatedAt'>): Promise<IWarehouseItem> {
		await connectDB();
		const item = new WarehouseItem(data);
		await item.save();
		return item.toObject() as IWarehouseItem;
	}

	static async updateItem(id: string, data: Partial<IWarehouseItem>): Promise<IWarehouseItem> {
		await connectDB();
		const item = await WarehouseItem.findByIdAndUpdate(id, data, { new: true }).lean();
		if (!item) throw new Error('Articolo non trovato');
		return item as unknown as IWarehouseItem;
	}

	static async deleteItem(id: string): Promise<void> {
		await connectDB();
		await WarehouseItem.findByIdAndDelete(id);
	}

	static async getLowStockItems(): Promise<IWarehouseItem[]> {
		await connectDB();
		const items = await WarehouseItem.find({
			$expr: { $lte: ['$quantity', '$minQuantity'] }
		})
			.sort({ name: 1 })
			.lean();
		return items as unknown as IWarehouseItem[];
	}
}
