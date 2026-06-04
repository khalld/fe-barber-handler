/**
 * Create a default barber account if missing.
 * Run with: npm run create-barber
 *
 * Idempotent — safe to run multiple times. If a barber with the given
 * username already exists, this script leaves it untouched (no password
 * reset). Run it after wiping the DB or as a post-deploy safety net.
 *
 * Credentials are read from the environment (no hardcoded values):
 *   BARBER_USERNAME   (optional, default: "barber")
 *   BARBER_PASSWORD   (required, min 6 chars)
 *   BARBER_NAME       (optional, default: "Barbiere Demo")
 *   MONGODB_URI       (required)
 *
 * CLI override (handy for a one-off bootstrap):
 *   npm run create-barber -- <username> <password>
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

const username = (process.argv[2] || process.env.BARBER_USERNAME || 'barber').toLowerCase().trim();
const password = process.argv[3] || process.env.BARBER_PASSWORD;
const name = process.env.BARBER_NAME || 'Barbiere Demo';

if (!password) {
  console.error('❌  Password mancante. Imposta BARBER_PASSWORD nel file .env oppure passala come argomento:');
  console.error('    npm run create-barber -- <username> <password>');
  process.exit(1);
}
if (password.length < 6) {
  console.error('❌  La password deve avere almeno 6 caratteri.');
  process.exit(1);
}

// Schema mirrored from src/lib/db/models/Barber.ts to keep this script self-contained.
const barberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, select: false },
  phone: { type: String },
  specializations: { type: [String], default: [] },
  bio: { type: String },
  profileImage: { type: String },
  isActive: { type: Boolean, default: true },
  hourlyRate: { type: Number, required: true, min: 0 },
  workingHours: {
    monday:    { start: String, end: String },
    tuesday:   { start: String, end: String },
    wednesday: { start: String, end: String },
    thursday:  { start: String, end: String },
    friday:    { start: String, end: String },
    saturday:  { start: String, end: String },
    sunday:    { start: String, end: String }
  },
  daysOff: { type: [Date], default: [] }
}, { timestamps: true });

const Barber = mongoose.models.Barber || mongoose.model('Barber', barberSchema);

const defaultHours = {
  monday:    { start: '09:00', end: '18:00' },
  tuesday:   { start: '09:00', end: '18:00' },
  wednesday: { start: '09:00', end: '18:00' },
  thursday:  { start: '09:00', end: '18:00' },
  friday:    { start: '09:00', end: '18:00' },
  saturday:  { start: '09:00', end: '14:00' },
  sunday:    { start: null,    end: null    }  // chiuso
};

async function run() {
  console.log('🔗  Connessione a MongoDB…');
  await mongoose.connect(MONGODB_URI);
  console.log('✅  Connesso.\n');

  const existing = await Barber.findOne({ username });
  if (existing) {
    console.log(`ℹ️   Barbiere "${username}" già presente — nessuna modifica.`);
    console.log('    (Per resettare la password elimina il barbiere o esegui un update manuale.)');
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const barber = await Barber.create({
    name,
    username,
    password: hashedPassword,
    isActive: true,
    hourlyRate: 30,
    specializations: ['Taglio', 'Barba'],
    workingHours: defaultHours
  });

  console.log('✂️   Barbiere creato:');
  console.log(`   • nome: ${barber.name}`);
  console.log(`   • username: ${barber.username}\n`);
  console.log('Ora il barbiere può accedere dalla pagina /login (modalità Barbiere).');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('❌  Errore durante la creazione del barbiere:', err);
  process.exit(1);
});
