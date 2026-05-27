/**
 * Seed script: populates MongoDB with demo data for testing/staging.
 * Run with: npm run seed
 *
 * Idempotent — safe to run multiple times. Uses upsert on email.
 * All demo passwords: demo123
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

const barberSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
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
  email: { type: String, unique: true, lowercase: true },
  phone: String,
  password: String,
  appointments: { type: [String], default: [] }
}, { timestamps: true });

const Barber    = mongoose.models.Barber     || mongoose.model('Barber',     barberSchema);
const UserClient = mongoose.models.UserClient || mongoose.model('UserClient', userClientSchema);

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const DEMO_PASSWORD = 'demo123';

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
    name: 'Marco Rossi',
    email: 'marco@barbershop.demo',
    phone: '+39 320 1234567',
    bio: 'Barbiere con 10 anni di esperienza. Specializzato in tagli classici e barba tradizionale.',
    specializations: ['Taglio', 'Barba', 'Taglio + Barba'],
    hourlyRate: 30,
    workingHours: defaultHours
  },
  {
    name: 'Luca Ferrari',
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
    email: 'cliente@demo.it',
    phone: '+39 333 0000001'
  },
  {
    name: 'Mario Bianchi',
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

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  // Seed barbers
  console.log('👤  Creazione barbieri demo…');
  for (const b of barbers) {
    const result = await Barber.findOneAndUpdate(
      { email: b.email },
      { ...b, password: hashedPassword, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`   • ${result.name} <${result.email}>`);
  }

  // Seed client users
  console.log('\n👥  Creazione utenti clienti demo…');
  for (const c of clients) {
    const result = await UserClient.findOneAndUpdate(
      { email: c.email },
      { ...c, password: hashedPassword },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`   • ${result.name} <${result.email}>`);
  }

  console.log('\n✅  Seed completato!\n');
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│         CREDENZIALI DI TEST                 │');
  console.log('├────────────────────┬──────────────────────┬─┤');
  console.log('│ Ruolo              │ Email                │ Password │');
  console.log('├────────────────────┼──────────────────────┼──────────┤');
  console.log('│ Gestore (admin)    │ (da ENV)             │ admin    │');
  console.log('│ Barbiere 1         │ marco@barbershop.demo│ demo123  │');
  console.log('│ Barbiere 2         │ luca@barbershop.demo │ demo123  │');
  console.log('│ Cliente 1          │ cliente@demo.it      │ demo123  │');
  console.log('│ Cliente 2          │ mario.bianchi@demo.it│ demo123  │');
  console.log('└────────────────────┴──────────────────────┴──────────┘');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌  Errore durante il seed:', err);
  process.exit(1);
});
