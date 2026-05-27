# Barbershop Handler — Guida Tecnica

Piattaforma web per la gestione di una barberia, con tre aree distinte: **Gestore**, **Barbiere** e **Cliente**.

Stack: **SvelteKit 5** + **TypeScript**, **Bootstrap 5.3**, **MongoDB** (Mongoose), adattatore **Node.js**.

> Per l'elenco completo delle funzionalità lato utente vedi **[FUNZIONALITA.md](./FUNZIONALITA.md)**.

---

## Indice

1. [Avvio locale (sviluppo)](#avvio-locale-sviluppo)
2. [Variabili d'ambiente](#variabili-dambiente)
3. [Credenziali di test](#credenziali-di-test)
4. [Docker](#docker)
5. [Comandi utili](#comandi-utili)
6. [Struttura del progetto](#struttura-del-progetto)
7. [Architettura](#architettura)
8. [API REST](#api-rest)
9. [Esempi di test (curl)](#esempi-di-test-curl)
10. [Utilizzo dei servizi](#utilizzo-dei-servizi-typescript)
11. [Note tecniche e validazioni](#note-tecniche-e-validazioni)
12. [Roadmap](#roadmap)

---

## Avvio locale (sviluppo)

```bash
# 1. Clona il repo e installa le dipendenze
git clone <repo-url>
cd fe-barber-handler
npm install

# 2. Crea il file di configurazione .env
# → imposta almeno MONGODB_URI (Atlas o locale)

# 3. Avvia il server di sviluppo
npm run dev
```

L'app sarà disponibile su `http://localhost:5173`.

Due pagine di documentazione sono servite dall'app stessa:

- **`/docs`** — guida utente (per gestore, barbiere e cliente)
- **`/api-docs`** — Swagger UI interattivo basato su `static/openapi.json`

---

## Variabili d'ambiente

| Variabile            | Obbligatoria | Descrizione                                                   |
|----------------------|:---:|---------------------------------------------------------------|
| `MONGODB_URI`        | ✅  | Connection string MongoDB (Atlas o locale)                    |
| `NODE_ENV`           |     | `development` / `production` (default: `development`)         |
| `PORT`               |     | Porta del server Node (default: `3000`)                       |
| `HOST`               |     | Indirizzo di ascolto (default: `0.0.0.0`)                     |
| `APP_PORT`           |     | Porta host mappata sul container (default: `3000`)            |
| `PUBLIC_DEMO_*`      |     | Credenziali demo per i pulsanti di accesso rapido: `PUBLIC_DEMO_ADMIN_USERNAME`/`_PASSWORD`, `PUBLIC_DEMO_BARBER_USERNAME`/`_PASSWORD`, `PUBLIC_DEMO_CLIENT_USERNAME`/`_PASSWORD` |
| `ADMIN_USERNAME`     |     | Username del gestore creato dal seed (default: `admin`)        |

---

## Credenziali di test

Dopo il primo deploy, esegui il seed per creare gli utenti demo (tutti con password `demo123`):

```bash
npm run seed
# oppure dentro Docker:
docker compose exec app npm run seed
```

Il seed è **idempotente** (upsert per username): può essere eseguito più volte senza creare duplicati.
Tutti gli account (gestore, barbieri, clienti) sono **reali record MongoDB**: non esistono utenti mockati in memoria, ogni login è verificato sul database.

L'accesso avviene sempre tramite **username** (non email). L'email è un campo di contatto opzionale.

| Ruolo      | URL di accesso   | Username    | Password   |
|------------|------------------|-------------|------------|
| Gestore    | `/login`         | `admin`     | `demo123`  |
| Barbiere 1 | `/login`         | `marco`     | `demo123`  |
| Barbiere 2 | `/login`         | `luca`      | `demo123`  |
| Cliente 1  | `/client/login`  | `cliente`   | `demo123`  |
| Cliente 2  | `/client/login`  | `mario`     | `demo123`  |

> Non esiste auto-registrazione per i clienti: gli account vengono creati dal gestore dalla pagina **Utenti** (`/users`), così come i barbieri da **Barbieri** (`/barbers`).

---

## Docker

### Build e avvio

```bash
# crea un file .env con MONGODB_URI e le altre variabili, poi:
docker compose up --build -d
```

### Comandi Docker

```bash
docker compose logs -f app                    # segui i log
docker compose exec app npm run seed          # popola i dati demo
docker compose down                           # ferma il servizio
```

---

## Comandi utili

```bash
npm run dev        # dev server (porta 5173)
npm run build      # build produzione
npm run preview    # anteprima build (porta 4173)
npm run check      # type-check TypeScript + Svelte
npm run seed       # inserisce dati demo in MongoDB
```

---

## Struttura del progetto

```
src/
├── lib/
│   ├── api-client.ts        # client HTTP per le API
│   ├── components/          # layout e componenti riutilizzabili
│   ├── db/
│   │   ├── mongodb.ts       # connessione Mongoose
│   │   └── models/          # schemi Mongoose
│   │       ├── Barber.ts
│   │       ├── Appointment.ts
│   │       ├── Transaction.ts
│   │       ├── ActivityLog.ts
│   │       ├── User.ts
│   │       ├── UserClient.ts
│   │       └── WarehouseItem.ts
│   ├── services/            # logica di business
│   │   ├── barberService.ts
│   │   ├── appointmentService.ts
│   │   ├── transactionService.ts
│   │   ├── dashboardService.ts
│   │   ├── userClientService.ts
│   │   └── warehouseService.ts
│   ├── stores.ts            # store Svelte (stato globale)
│   ├── types.ts             # interfacce TypeScript condivise
│   └── utils.ts             # helper vari
├── routes/
│   ├── api/                 # endpoint REST (vedi sezione API)
│   ├── login/               # login gestore
│   ├── barber-*/            # area barbiere (dashboard, profilo)
│   ├── client/              # area cliente (login, prenotazione, appuntamenti)
│   ├── appointments/        # gestione prenotazioni (gestore)
│   ├── barbers/             # gestione barbieri (gestore)
│   ├── transactions/        # contabilità (gestore)
│   ├── users/               # clienti registrati (gestore)
│   ├── warehouse/           # magazzino (gestore)
│   ├── docs/                # guida utente in-app
│   └── api-docs/            # Swagger UI
scripts/
└── seed.mjs                 # script seed dati demo
static/
└── openapi.json             # specifica OpenAPI 3.0
```

---

## Architettura

Il flusso dei dati è stratificato: i componenti Svelte chiamano le route server (`+server.ts`), che delegano la logica di business ai **service**, che a loro volta operano sui **modelli Mongoose**.

```
Componente Svelte
      │  fetch()
      ▼
Route server SvelteKit (+server.ts)
      │  import Service
      ▼
Service layer (logica, validazioni, aggregazioni MongoDB)
      │  Model.query()
      ▼
Modelli Mongoose  →  MongoDB
```

### Interfacce TypeScript (`src/lib/types.ts`)

| Interfaccia       | Descrizione                                  |
|-------------------|----------------------------------------------|
| `ApiResponse<T>`  | Risposta standard delle API                  |
| `IBarber`         | Profilo barbiere con orari di lavoro         |
| `IAppointment`    | Prenotazione con stato e pagamento           |
| `ITransaction`    | Entrata/uscita categorizzata                 |
| `IActivityLog`    | Log delle attività (audit trail)             |
| `IDashboardStats` | Statistiche aggregate per la dashboard       |

### Service

| Service              | Responsabilità                                       |
|----------------------|------------------------------------------------------|
| `BarberService`      | CRUD barbieri, statistiche, login/logout             |
| `AppointmentService` | CRUD prenotazioni, calendario, calcolo disponibilità |
| `TransactionService` | CRUD transazioni, analitiche finanziarie             |
| `DashboardService`   | Report e statistiche aggregate                       |
| `UserClientService`  | Account clienti, prenotazioni collegate              |
| `WarehouseService`   | Inventario magazzino                                 |

---

## API REST

Tutte le risposte seguono il formato `{ "success": boolean, "data"?: ..., "error"?: string }`.

La specifica completa e interrogabile è disponibile su **`/api-docs`** (Swagger UI) e nel file **`static/openapi.json`**.

### Autenticazione

| Metodo | Endpoint                | Descrizione                          |
|--------|-------------------------|--------------------------------------|
| POST   | `/api/auth/login`       | Login gestore (`username` + `password`) |
| POST   | `/api/auth/logout`      | Logout gestore                       |
| GET    | `/api/auth/session`     | Sessione corrente                    |
| POST   | `/api/barbers/login`    | Login barbiere (`username` + `password`) |
| POST   | `/api/barbers/logout`   | Logout barbiere                      |
| POST   | `/api/users/login`      | Login cliente (`username` + `password`) |
| POST   | `/api/users/logout`     | Logout cliente                       |

> Non esiste un endpoint di registrazione pubblica: gli account cliente si creano via `POST /api/admin/users` (area gestore).

### Barbieri (`/api/barbers`)

| Metodo | Endpoint                                  | Descrizione                       |
|--------|-------------------------------------------|-----------------------------------|
| GET    | `/api/barbers`                            | Elenco barbieri (`?id=` per uno)  |
| POST   | `/api/barbers`                            | Crea barbiere                     |
| PATCH  | `/api/barbers`                            | Aggiorna barbiere                 |
| DELETE | `/api/barbers?id=...`                     | Disattiva barbiere                |
| PUT    | `/api/barbers/{id}`                        | Sostituisce i dati del barbiere   |
| POST   | `/api/barbers/{id}/change-password`        | Cambio password barbiere          |

Esempio creazione:

```http
POST /api/barbers
Content-Type: application/json

{
  "name": "Marco Rossi",
  "username": "marco",
  "password": "demo123",
  "email": "marco@barber.it",
  "phone": "3201234567",
  "specializations": ["Taglio", "Barba", "Colore"],
  "bio": "Barbiere esperto con 10 anni di esperienza",
  "hourlyRate": 25,
  "isActive": true,
  "workingHours": {
    "monday":    { "start": "09:00", "end": "19:00" },
    "tuesday":   { "start": "09:00", "end": "19:00" },
    "wednesday": { "start": "09:00", "end": "19:00" },
    "thursday":  { "start": "09:00", "end": "19:00" },
    "friday":    { "start": "09:00", "end": "19:00" },
    "saturday":  { "start": "09:00", "end": "14:00" }
  }
}
```

### Prenotazioni (`/api/appointments`)

| Metodo | Endpoint                                          | Descrizione                         |
|--------|---------------------------------------------------|-------------------------------------|
| GET    | `/api/appointments`                               | Elenco (filtri sotto)               |
| POST   | `/api/appointments`                               | Crea prenotazione                   |
| PATCH  | `/api/appointments`                               | Aggiorna prenotazione               |
| DELETE | `/api/appointments?id=...&action=complete\|cancel`| Completa o cancella                 |

Filtri GET: `?status=confirmed`, `?barberId=...`, `?date=2026-04-27`, `?startDate=...&endDate=...`.

### Prenotazione lato cliente / pubblica

| Metodo | Endpoint                          | Descrizione                                       |
|--------|-----------------------------------|---------------------------------------------------|
| POST   | `/api/book`                       | Prenotazione pubblica (ospite, senza account)     |
| GET    | `/api/users/available-barbers`    | Barbieri disponibili per la prenotazione          |
| GET    | `/api/users/available-slots`      | Slot orari liberi per barbiere/data               |
| GET    | `/api/users/appointments`         | Prenotazioni del cliente loggato                  |
| POST   | `/api/users/appointments`         | Crea prenotazione collegata all'account           |
| DELETE | `/api/users/appointments?id=...`  | Cancella una propria prenotazione                 |

Lo slot disponibile viene calcolato in base agli orari di lavoro del barbiere e alle prenotazioni esistenti:

```http
GET /api/users/available-slots?barberId=507f...&date=2026-04-27
```
```json
{
  "success": true,
  "data": { "availableSlots": [
    { "start": "2026-04-27T09:00:00Z", "end": "2026-04-27T09:30:00Z" },
    { "start": "2026-04-27T09:30:00Z", "end": "2026-04-27T10:00:00Z" }
  ] }
}
```

### Transazioni (`/api/transactions`)

| Metodo | Endpoint                                                | Descrizione                  |
|--------|---------------------------------------------------------|------------------------------|
| GET    | `/api/transactions`                                     | Elenco (filtri sotto)        |
| POST   | `/api/transactions`                                     | Crea transazione             |
| PATCH  | `/api/transactions`                                     | Aggiorna transazione         |
| DELETE | `/api/transactions?id=...`                              | Elimina transazione          |

Filtri GET: `?type=income|expense`, `?category=...`, `?startDate=...&endDate=...`, `?byCategory=true`, `?dailyTotals=true`.

**Categorie:** entrate → `appointment_payment`, `product_sale`; uscite → `salary`, `supplies`, `rent`, `utilities`, `maintenance`, `other`.

### Dashboard (`/api/dashboard`)

| Metodo | Endpoint                                  | Descrizione                         |
|--------|-------------------------------------------|-------------------------------------|
| GET    | `/api/dashboard`                          | Statistiche generali (oggi)         |
| GET    | `/api/dashboard?barber=ID&daysRange=30`   | Dashboard di un singolo barbiere    |
| GET    | `/api/dashboard?report=2026-04-27`        | Rapporto giornaliero                |

### Magazzino (`/api/warehouse`)

| Metodo | Endpoint                    | Descrizione            |
|--------|-----------------------------|------------------------|
| GET    | `/api/warehouse`            | Elenco articoli        |
| POST   | `/api/warehouse`            | Aggiungi articolo      |
| PATCH  | `/api/warehouse`            | Aggiorna articolo      |
| DELETE | `/api/warehouse?id=...`     | Elimina articolo       |

### Clienti registrati — gestione gestore (`/api/admin/users`)

| Metodo | Endpoint                  | Descrizione                  |
|--------|---------------------------|------------------------------|
| GET    | `/api/admin/users`        | Elenco clienti registrati    |
| POST   | `/api/admin/users`        | Crea manualmente un account  |
| DELETE | `/api/admin/users?id=...` | Elimina un account           |

---

## Esempi di test (curl)

> In sviluppo le API rispondono sulla porta `5173`.

```bash
# Crea un barbiere
curl -X POST http://localhost:5173/api/barbers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Marco Rossi",
    "username": "marco",
    "password": "demo123",
    "email": "marco@barber.it",
    "phone": "3201234567",
    "specializations": ["Taglio", "Barba"],
    "hourlyRate": 25,
    "workingHours": { "monday": { "start": "09:00", "end": "19:00" } }
  }'

# Disponibilità di un barbiere
curl 'http://localhost:5173/api/users/available-slots?barberId=ID&date=2026-04-27'

# Crea una prenotazione
curl -X POST http://localhost:5173/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "barberId": "ID",
    "clientName": "Luca Bianchi",
    "clientPhone": "3207654321",
    "service": "Taglio",
    "duration": 30,
    "startTime": "2026-04-27T10:00:00Z",
    "endTime": "2026-04-27T10:30:00Z",
    "price": 15
  }'

# Completa una prenotazione (registra il pagamento)
curl -X DELETE 'http://localhost:5173/api/appointments?id=ID&action=complete'

# Statistiche dashboard
curl http://localhost:5173/api/dashboard | jq '.data'
```

---

## Utilizzo dei servizi (TypeScript)

I service sono richiamabili direttamente dalle route server.

```typescript
// Route server
import { AppointmentService } from '$lib/services/appointmentService';
import { json } from '@sveltejs/kit';

export const GET = async () => {
  const appointments = await AppointmentService.getAllAppointments();
  return json({ success: true, data: appointments });
};
```

```typescript
// AppointmentService
const appointment = await AppointmentService.createAppointment({
  barberId, clientName: 'Luca',
  startTime: new Date(),
  endTime: new Date(Date.now() + 30 * 60000),
  price: 15
});
const slots = await AppointmentService.getBarberAvailability(barberId, new Date());
await AppointmentService.completeAppointment(appointmentId);
await AppointmentService.cancelAppointment(appointmentId, 'Cliente assente');

// DashboardService
const stats     = await DashboardService.getTodayStats();
const barberDash = await DashboardService.getBarberDashboard(barberId, 30);
const report    = await DashboardService.getDailyReport(new Date());

// TransactionService
const totals = await TransactionService.getTotalByPeriod(start, end);
const daily  = await TransactionService.getDailyTotals(start, end);
```

---

## Note tecniche e validazioni

- **Database:** MongoDB con Mongoose (validazione a livello di schema).
- **Indici:** creati per ricerche veloci — `barberId`+`startTime` (Appointments), `type`+`date` (Transactions), `timestamp` (ActivityLog).
- **Timezone:** UTC nel database, formattazione lato client.
- **Aggregazioni:** pipeline MongoDB per le statistiche complesse.
- **Stati prenotazione:** `pending`, `confirmed`, `completed`, `cancelled`.
- **Validazioni:** verifica disponibilità barbiere (niente sovrapposizioni), campi obbligatori, enum (stati/tipi/categorie), validazione date, integrità referenziale.

### Errori comuni

| Messaggio                                       | Causa / soluzione                                              |
|-------------------------------------------------|----------------------------------------------------------------|
| `Il barbiere non è disponibile in questo orario`| Slot già occupato — interroga prima la disponibilità           |
| `MONGODB_URI non è configurata`                 | Aggiungi la variabile nel `.env`                               |
| `ID prenotazione obbligatorio`                  | Passa l'`_id` nei parametri della richiesta                    |

---

## Roadmap

Possibili sviluppi futuri (non ancora implementati):

1. Notifiche SMS/Email (reminder prenotazioni)
2. Sistema di rating e feedback clienti
3. Integrazione pagamenti (Stripe/PayPal)
4. Aggiornamenti real-time (WebSocket) per le dashboard
5. Export PDF dei report
6. Supporto multi-sede
