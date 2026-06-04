/**
 * Seed script: populates MongoDB with demo data for testing/staging.
 * Run with: npm run seed
 *
 * Idempotent — safe to run multiple times. Uses upsert on username.
 * All demo passwords default to "password" (override with DEMO_PASSWORD).
 *
 * Creates real DB accounts (admin, barbers, clients) so there are no
 * in-memory/mocked users: every login is verified against MongoDB.
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

// ---------------------------------------------------------------------------
// Schema definitions (mirrored from src/lib/db/models to keep seed self-contained)
// ---------------------------------------------------------------------------

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

const barberSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true, lowercase: true, trim: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, select: false },
  phone: String,
  specializations: [String],
  bio: String,
  isActive: { type: Boolean, default: true },
  hourlyRate: Number,
  workingHours: {
    monday:    { start: String, end: String },
    tuesday:   { start: String, end: String },
    wednesday: { start: String, end: String },
    thursday:  { start: String, end: String },
    friday:    { start: String, end: String },
    saturday:  { start: String, end: String },
    sunday:    { start: String, end: String }
  }
}, { timestamps: true });

const userClientSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true, lowercase: true, trim: true },
  email: { type: String, unique: true, sparse: true, lowercase: true },
  phone: String,
  password: String,
  appointments: { type: [String], default: [] }
}, { timestamps: true });

const User       = mongoose.models.User       || mongoose.model('User',       userSchema);
const Barber     = mongoose.models.Barber     || mongoose.model('Barber',     barberSchema);
const UserClient = mongoose.models.UserClient || mongoose.model('UserClient', userClientSchema);

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

// Password demo condivisa (override con DEMO_PASSWORD). Le credenziali di admin
// e barbiere sono allineate ai pulsanti "Accesso rapido demo" della pagina /login.
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'password';
const ADMIN_USERNAME = (process.env.PUBLIC_DEMO_ADMIN_USERNAME || process.env.ADMIN_USERNAME || 'admin').toLowerCase();
const ADMIN_PASSWORD = process.env.PUBLIC_DEMO_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || DEMO_PASSWORD;
const BARBER_USERNAME = (process.env.PUBLIC_DEMO_BARBER_USERNAME || process.env.BARBER_USERNAME || 'barber').toLowerCase();
const BARBER_PASSWORD = process.env.PUBLIC_DEMO_BARBER_PASSWORD || process.env.BARBER_PASSWORD || DEMO_PASSWORD;

const defaultHours = {
  monday:    { start: '09:00', end: '18:00' },
  tuesday:   { start: '09:00', end: '18:00' },
  wednesday: { start: '09:00', end: '18:00' },
  thursday:  { start: '09:00', end: '18:00' },
  friday:    { start: '09:00', end: '18:00' },
  saturday:  { start: '09:00', end: '14:00' },
  sunday:    { start: null,    end: null    }  // chiuso
};

const barbers = [
  {
    name: 'Barbiere Demo',
    username: BARBER_USERNAME,
    email: 'barber@barbershop.demo',
    phone: '+39 300 0000000',
    bio: 'Barbiere demo per l\'accesso rapido dalla pagina di login.',
    specializations: ['Taglio', 'Barba'],
    hourlyRate: 30,
    workingHours: defaultHours,
    password: BARBER_PASSWORD
  },
  {
    name: 'Marco Rossi',
    username: 'marco',
    email: 'marco@barbershop.demo',
    phone: '+39 320 1234567',
    bio: 'Barbiere con 10 anni di esperienza. Specializzato in tagli classici e barba tradizionale.',
    specializations: ['Taglio', 'Barba', 'Taglio + Barba'],
    hourlyRate: 30,
    workingHours: defaultHours
  },
  {
    name: 'Luca Ferrari',
    username: 'luca',
    email: 'luca@barbershop.demo',
    phone: '+39 340 7654321',
    bio: 'Esperto in colorazioni e trattamenti moderni. Sempre aggiornato sulle ultime tendenze.',
    specializations: ['Taglio', 'Colore', 'Taglio + Barba'],
    hourlyRate: 35,
    workingHours: {
      ...defaultHours,
      wednesday: { start: null, end: null }  // giorno libero
    }
  }
];

const clients = [
  {
    name: 'Cliente Demo',
    username: 'cliente',
    email: 'cliente@demo.it',
    phone: '+39 333 0000001'
  },
  {
    name: 'Mario Bianchi',
    username: 'mario',
    email: 'mario.bianchi@demo.it',
    phone: '+39 333 0000002'
  }
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function seed() {
  console.log('🔗  Connessione a MongoDB…');
  await mongoose.connect(MONGODB_URI);
  console.log('✅  Connesso.\n');

  const demoHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const adminHash = ADMIN_PASSWORD === DEMO_PASSWORD ? demoHash : await bcrypt.hash(ADMIN_PASSWORD, 10);

  // Seed admin (gestore)
  console.log('🛡️   Creazione gestore demo…');
  const admin = await User.findOneAndUpdate(
    { username: ADMIN_USERNAME },
    { username: ADMIN_USERNAME, password: adminHash, isAdmin: true },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`   • ${admin.username} (admin)`);

  // Seed barbers
  console.log('\n👤  Creazione barbieri demo…');
  for (const b of barbers) {
    const { password: rawPassword, ...rest } = b;
    const password = rawPassword ? await bcrypt.hash(rawPassword, 10) : demoHash;
    const result = await Barber.findOneAndUpdate(
      { username: b.username },
      { ...rest, password, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`   • ${result.name} (@${result.username})`);
  }

  // Seed client users
  console.log('\n👥  Creazione utenti clienti demo…');
  for (const c of clients) {
    const result = await UserClient.findOneAndUpdate(
      { username: c.username },
      { ...c, password: demoHash },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`   • ${result.name} (@${result.username})`);
  }

  console.log('\n✅  Seed completato!\n');
  console.log('┌──────────────────┬────────────┬──────────┐');
  console.log('│ Ruolo            │ Username   │ Password │');
  console.log('├──────────────────┼────────────┼──────────┤');
  console.log(`│ Gestore (admin)  │ ${ADMIN_USERNAME.padEnd(10)} │ ${ADMIN_PASSWORD.padEnd(8)} │`);
  console.log(`│ Barbiere (demo)  │ ${BARBER_USERNAME.padEnd(10)} │ ${BARBER_PASSWORD.padEnd(8)} │`);
  console.log(`│ Barbiere 1       │ marco      │ ${DEMO_PASSWORD.padEnd(8)} │`);
  console.log(`│ Barbiere 2       │ luca       │ ${DEMO_PASSWORD.padEnd(8)} │`);
  console.log(`│ Cliente 1        │ cliente    │ ${DEMO_PASSWORD.padEnd(8)} │`);
  console.log(`│ Cliente 2        │ mario      │ ${DEMO_PASSWORD.padEnd(8)} │`);
  console.log('└──────────────────┴────────────┴──────────┘');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌  Errore durante il seed:', err);
  process.exit(1);
});
