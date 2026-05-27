import { connectDB } from '../db/mongodb';
import { Transaction } from '../db/models/Transaction';
import { ActivityLog } from '../db/models/ActivityLog';
import type { ITransaction } from '../types';

export class TransactionService {
	// Crea una nuova transazione
	static async createTransaction(transactionData: Omit<ITransaction, '_id' | 'createdAt' | 'updatedAt'>): Promise<ITransaction> {
		try {
			await connectDB();
			const transaction = new Transaction({
				...transactionData,
				date: transactionData.date || new Date()
			});
			await transaction.save();

			// Registra l'attività
			if (transactionData.barberId) {
				await ActivityLog.create({
					barberId: transactionData.barberId,
					transactionId: transaction._id,
					activityType: 'transaction_recorded',
					description: `${transactionData.type === 'income' ? 'Entrata' : 'Uscita'}: ${transactionData.description}`,
					details: {
						amount: transactionData.amount,
						category: transactionData.category
					},
					timestamp: new Date()
				});
			}

			return transaction.toObject() as ITransaction;
		} catch (error) {
			throw new Error(`Errore nella creazione della transazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Ottiene tutte le transazioni
	static async getAllTransactions(filters?: {
		type?: 'income' | 'expense';
		category?: string;
		barberId?: string;
		startDate?: Date;
		endDate?: Date;
	}): Promise<ITransaction[]> {
		try {
			await connectDB();

			let query: any = {};

			if (filters?.type) query.type = filters.type;
			if (filters?.category) query.category = filters.category;
			if (filters?.barberId) query.barberId = filters.barberId;

			if (filters?.startDate || filters?.endDate) {
				query.date = {};
				if (filters.startDate) query.date.$gte = filters.startDate;
				if (filters.endDate) query.date.$lte = filters.endDate;
			}

			const transactions = await Transaction.find(query)
				.populate('barberId', 'name')
				.populate('appointmentId', 'clientName')
				.sort({ date: -1 })
				.lean();

			return transactions as unknown as ITransaction[];
		} catch (error) {
			throw new Error(`Errore nel recupero delle transazioni: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Ottiene una transazione per ID
	static async getTransactionById(id: string): Promise<ITransaction | null> {
		try {
			await connectDB();
			const transaction = await Transaction.findById(id)
				.populate('barberId', 'name')
				.populate('appointmentId')
				.lean();
			return transaction as ITransaction | null;
		} catch (error) {
			throw new Error(`Errore nel recupero della transazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Aggiorna una transazione
	static async updateTransaction(id: string, updateData: Partial<ITransaction>): Promise<ITransaction> {
		try {
			await connectDB();
			const transaction = await Transaction.findByIdAndUpdate(id, updateData, { new: true }).lean();

			if (!transaction) {
				throw new Error('Transazione non trovata');
			}

			return transaction as unknown as ITransaction;
		} catch (error) {
			throw new Error(`Errore nell'aggiornamento della transazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Elimina una transazione
	static async deleteTransaction(id: string): Promise<void> {
		try {
			await connectDB();
			await Transaction.findByIdAndDelete(id);
		} catch (error) {
			throw new Error(`Errore nell'eliminazione della transazione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Ottiene il totale entrate/uscite per un periodo
	static async getTotalByPeriod(
		startDate: Date,
		endDate: Date,
		type?: 'income' | 'expense'
	): Promise<{ income: number; expense: number; net: number }> {
		try {
			await connectDB();

			const query: any = {
				date: { $gte: startDate, $lte: endDate }
			};

			if (type) {
				query.type = type;
			}

			const results = await Transaction.aggregate([
				{ $match: query },
				{
					$group: {
						_id: '$type',
						total: { $sum: '$amount' }
					}
				}
			]);

			const income = results.find((r: any) => r._id === 'income')?.total || 0;
			const expense = results.find((r: any) => r._id === 'expense')?.total || 0;

			return {
				income,
				expense,
				net: income - expense
			};
		} catch (error) {
			throw new Error(`Errore nel calcolo totali: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Ottiene le transazioni per categoria
	static async getByCategory(startDate: Date, endDate: Date): Promise<Array<{ category: string; count: number; total: number }>> {
		try {
			await connectDB();

			const results = await Transaction.aggregate([
				{
					$match: {
						date: { $gte: startDate, $lte: endDate }
					}
				},
				{
					$group: {
						_id: '$category',
						count: { $sum: 1 },
						total: { $sum: '$amount' }
					}
				},
				{ $sort: { total: -1 } }
			]);

			return results.map((r: any) => ({
				category: r._id,
				count: r.count,
				total: r.total
			}));
		} catch (error) {
			throw new Error(`Errore nel recupero per categoria: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}

	// Ottiene il totale giornaliero
	static async getDailyTotals(startDate: Date, endDate: Date): Promise<Array<{ date: string; income: number; expense: number; net: number }>> {
		try {
			await connectDB();

			const results = await Transaction.aggregate([
				{
					$match: {
						date: { $gte: startDate, $lte: endDate }
					}
				},
				{
					$group: {
						_id: {
							date: {
								$dateToString: { format: '%Y-%m-%d', date: '$date' }
							},
							type: '$type'
						},
						total: { $sum: '$amount' }
					}
				},
				{ $sort: { '_id.date': 1 } }
			]);

			const dailyMap = new Map<string, { income: number; expense: number }>();

			results.forEach((r: any) => {
				const date = r._id.date;
				if (!dailyMap.has(date)) {
					dailyMap.set(date, { income: 0, expense: 0 });
				}
				const daily = dailyMap.get(date)!;
				if (r._id.type === 'income') {
					daily.income = r.total;
				} else {
					daily.expense = r.total;
				}
			});

			return Array.from(dailyMap.entries()).map(([date, { income, expense }]) => ({
				date,
				income,
				expense,
				net: income - expense
			}));
		} catch (error) {
			throw new Error(`Errore nel recupero totali giornalieri: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
		}
	}
}
