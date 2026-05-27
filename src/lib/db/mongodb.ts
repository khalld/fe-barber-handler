import mongoose from 'mongoose';

let cached = global as any;

if (!cached.mongoose) {
	cached.mongoose = { conn: null, promise: null };
}

function getMongoDBUri(): string {
	// La connection string viene letta esclusivamente dalle variabili d'ambiente (.env).
	// Nessuna credenziale hardcoded nel codice.
	const uri = process.env.MONGODB_URI;

	if (!uri) {
		throw new Error(
			'❌ MONGODB_URI non è configurata! Impostala nel file .env (o nelle variabili d\'ambiente).'
		);
	}

	console.log('[MongoDB] Connecting to:', uri.replace(/:[^:]*@/, ':****@'));
	return uri;
}

export async function connectDB() {
	if (cached.mongoose.conn) {
		console.log('[MongoDB] Using cached connection');
		return cached.mongoose.conn;
	}

	if (!cached.mongoose.promise) {
		const mongoUri = getMongoDBUri();
		const opts = {
			bufferCommands: false,
			serverSelectionTimeoutMS: 10000,
			socketTimeoutMS: 45000
		};

		cached.mongoose.promise = mongoose
			.connect(mongoUri, opts)
			.then((mongoose) => {
				console.log('[MongoDB] ✅ Connected successfully');
				return mongoose;
			})
			.catch((err) => {
				console.error('[MongoDB] ❌ Connection error:', err.message);
				cached.mongoose.promise = null;
				throw err;
			});
	}

	try {
		cached.mongoose.conn = await cached.mongoose.promise;
	} catch (e) {
		cached.mongoose.promise = null;
		throw e;
	}

	return cached.mongoose.conn;
}
