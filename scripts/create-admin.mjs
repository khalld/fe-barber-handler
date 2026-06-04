/**
 * Create the admin/gestore account if missing.
 * Run with: npm run create-admin
 *
 * Idempotent upsert — safe to run multiple times. Creates the account if
 * missing, otherwise resets its password to the configured value so the
 * login credentials always match the secrets after every deploy.
 *
 * Credentials are read from the environment (no hardcoded values):
 *   ADMIN_USERNAME   (optional, default: "admin")
 *   ADMIN_PASSWORD   (required, min 6 chars)
 *   MONGODB_URI      (required)
 *
 * CLI override (handy for a one-off bootstrap):
 *   npm run create-admin -- <username> <password>
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI non definita nel file .env');
  process.exit(1);
}

const username = (process.argv[2] || process.env.ADMIN_USERNAME || 'admin').toLowerCase().trim();
const password = process.argv[3] || process.env.ADMIN_PASSWORD;

if (!password) {
  console.error('❌  Password mancante. Imposta ADMIN_PASSWORD nel file .env oppure passala come argomento:');
  console.error('    npm run create-admin -- <username> <password>');
  process.exit(1);
}
if (password.length < 6) {
  console.error('❌  La password deve avere almeno 6 caratteri.');
  process.exit(1);
}

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function run() {
  console.log('🔗  Connessione a MongoDB…');
  await mongoose.connect(MONGODB_URI);
  console.log('✅  Connesso.\n');

  const existing = await User.findOne({ username });
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await User.findOneAndUpdate(
    { username },
    { $set: { password: hashedPassword, isAdmin: true } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(existing
    ? `🛡️   Account gestore "${admin.username}" aggiornato (password reimpostata).`
    : `🛡️   Account gestore "${admin.username}" creato.`);
  console.log('\nOra puoi accedere dalla pagina /login.');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('❌  Errore durante la creazione admin:', err);
  process.exit(1);
});
