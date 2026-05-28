/**
 * Create the admin/gestore account if missing.
 * Run with: npm run create-admin
 *
 * Idempotent — safe to run multiple times. If an account with the given
 * username already exists, this script leaves it untouched (no password
 * reset). Run it after wiping the DB or as a post-deploy safety net.
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
  if (existing) {
    console.log(`ℹ️   Account "${username}" già presente — nessuna modifica.`);
    console.log('    (Per resettare la password elimina l\'utente o esegui un update manuale.)');
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await User.create({ username, password: hashedPassword, isAdmin: true });

  console.log('🛡️   Account gestore creato:');
  console.log(`   • username: ${admin.username}\n`);
  console.log('Ora puoi accedere dalla pagina /login.');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('❌  Errore durante la creazione admin:', err);
  process.exit(1);
});
