import { connectDB } from '../db/mongodb';
import { User } from '../db/models/User';

export interface AdminAccount {
	_id: string;
	username: string;
	email?: string;
}

export class AdminService {
	// Login gestore: verifica username + password sul modello User (isAdmin).
	static async loginAdmin(username: string, password: string): Promise<AdminAccount | null> {
		await connectDB();

		const admin = await User.findOne({ username: username.toLowerCase().trim(), isAdmin: true });
		if (!admin) return null;

		const isValid = await admin.comparePassword(password);
		if (!isValid) return null;

		return { _id: String(admin._id), username: admin.username, email: admin.email };
	}
}
