# Barbershop Handler — Funzionalità

Piattaforma per la gestione di una barberia. Tre aree distinte: **Gestore**, **Barbiere** e **Cliente**.

---

## Area Gestore

Accesso riservato al titolare del negozio. Visione completa su tutta l'attività.

### Dashboard
- Numero di prenotazioni del giorno, quante completate e quante ancora in attesa
- Incasso del giorno e spese del mese corrente
- Numero di barbieri attivi
- Prossimi appuntamenti in programma
- Grafici: andamento degli incassi, prenotazioni per tipo di servizio, classifica barbieri per guadagno

### Prenotazioni
- Elenco di tutti gli appuntamenti, filtrabile per barbiere, data e stato
- Creazione di una nuova prenotazione: scelta del barbiere, del servizio, della data e dello slot orario libero
- Modifica di una prenotazione esistente
- Segna un appuntamento come **Completato** (il pagamento viene registrato automaticamente)
- Cancellazione di un appuntamento
- Esportazione dell'elenco in formato CSV (apribile con Excel)

### Barbieri
- Elenco dei collaboratori con stato attivo o inattivo
- Aggiunta di un nuovo barbiere: nome, username (per l'accesso), password, telefono, email (opzionale), tariffa oraria, bio e specializzazioni
- Impostazione degli orari di lavoro per ogni giorno della settimana (con possibilità di indicare giorno di chiusura)
- Modifica dei dati in qualsiasi momento
- Disattivazione di un barbiere (non appare più ai clienti, ma i dati vengono conservati)
- Esportazione dell'elenco in formato CSV (apribile con Excel)

### Transazioni
- Registro di tutte le entrate e le uscite del negozio
- **Entrate:** pagamenti prenotazioni, vendita prodotti
- **Uscite:** stipendi, forniture, affitto, utenze, manutenzione
- Filtri per tipo (entrata/uscita), categoria, barbiere e intervallo di date
- Aggiunta, modifica ed eliminazione di qualsiasi voce
- Esportazione in formato CSV (apribile con Excel)

### Utenti (Clienti)
- Elenco dei clienti, con nome, username, email (opzionale), telefono e numero di prenotazioni
- Ricerca rapida per nome, username, email o telefono
- Creazione manuale di un account cliente (nome, username, password, telefono ed email opzionale) — **non esiste auto-registrazione**
- Eliminazione di un account
- Esportazione in formato CSV (apribile con Excel)

### Magazzino
- Inventario dei prodotti e materiali suddiviso per categoria: shampoo/prodotti, attrezzi, monouso, colori, altro
- Riepilogo: totale articoli, quanti sono sotto la soglia minima, valore complessivo dell'inventario
- Indicatore visivo per ogni articolo: verde (scorta OK), giallo (scorta bassa), rosso (esaurito)
- Ricerca per nome e filtro per categoria
- Aggiunta di un articolo con quantità, soglia minima di riordino, prezzo d'acquisto e fornitore
- Modifica della quantità e degli altri dati
- Eliminazione di un articolo

---

## Area Barbiere

Accesso personale per ogni collaboratore. Visualizza solo i propri dati.

### Dashboard Personale
- Prenotazioni di oggi: cliente, servizio e orario
- Incasso del giorno e degli ultimi 30 giorni
- Grafico andamento guadagni giornalieri
- Classifica dei servizi più richiesti con numero di prenotazioni e relativo guadagno

### Profilo
- Modifica di nome, email (opzionale) e telefono — lo username di accesso non è modificabile
- Aggiornamento della bio (testo di presentazione visibile ai clienti)
- Gestione delle specializzazioni (es. Taglio, Barba, Colore)
- Cambio password (richiede la password attuale per conferma)

---

## Area Clienti

Accessibile a chiunque, con o senza account.

### Prenotazione senza account
Il cliente può prenotare in 3 passi senza dover registrarsi:
1. Scelta del barbiere (con bio e specializzazioni visibili)
2. Scelta del servizio, della data e dello slot orario disponibile
3. Inserimento di nome e telefono (email opzionale)

La prenotazione viene salvata e appare nell'area del gestore.

### Login
- Accesso con **username e password**
- L'account viene creato dal gestore: **non è disponibile l'auto-registrazione**

### Prenota con Account
- Stessa procedura della prenotazione ospite, ma la prenotazione viene collegata all'account del cliente

### Le Mie Prenotazioni
- Elenco di tutte le prenotazioni personali con stato aggiornato
- Dettaglio di ogni appuntamento: barbiere, servizio, data, orario e prezzo
- Cancellazione in autonomia di un appuntamento non ancora completato

---

## Servizi Disponibili

| Servizio | Durata | Prezzo |
|---|---|---|
| Taglio | 30 min | € 15,00 |
| Barba | 20 min | € 10,00 |
| Taglio + Barba | 50 min | € 25,00 |
| Colore | 60 min | € 40,00 |

Gli slot disponibili vengono calcolati automaticamente in base agli orari di lavoro del barbiere e alle prenotazioni già presenti.

---

## Stati di una Prenotazione

| Stato | Significato |
|---|---|
| **In attesa** | Prenotazione ricevuta, in attesa di conferma |
| **Confermata** | Appuntamento confermato dal gestore |
| **Completata** | Servizio eseguito, pagamento registrato |
| **Cancellata** | Annullata dal cliente o dal gestore |

> **Nota sulla versione attuale:** lo stato **Confermata** è previsto a sistema, ma l'azione di conferma manuale da parte del gestore è in arrivo (vedi Roadmap). Oggi una prenotazione passa da *In attesa* direttamente a *Completata* oppure *Cancellata*.

---

## Funzionalità in arrivo (Roadmap)

Funzioni non ancora presenti nella demo, in ordine di priorità indicativa.

| Funzionalità | Stato | Descrizione |
|---|---|---|
| **Notifiche email** | Prioritaria | Conferma della prenotazione al cliente, promemoria dell'appuntamento e avviso al barbiere a ogni nuova richiesta. *(Oggi non viene inviata alcuna email.)* |
| **Conferma manuale prenotazioni** | Prioritaria | Azione per gestore/barbiere per portare una prenotazione da *In attesa* a *Confermata*. |
| **Attiva/disattiva prenotazioni online** | Pianificata | Interruttore per sospendere temporaneamente le prenotazioni dei clienti esterni (ferie, agenda piena, chiusura). |
| **Promemoria SMS / WhatsApp** | Pianificata | Promemoria automatico il giorno prima dell'appuntamento. |
| **Recupero password** | Pianificata | Reset autonomo della password via email per clienti e barbieri. |
| **Ferie e chiusure straordinarie** | Pianificata | Blocco di singoli giorni o periodi, oltre agli orari settimanali. |
| **Export Excel (.xlsx)** | Pianificata | Esportazione nativa in formato Excel, in aggiunta al CSV attuale. |
| **Pagamenti online / acconto** | In valutazione | Incasso o caparra al momento della prenotazione (es. Stripe/PayPal). |
| **Recensioni e valutazioni** | In valutazione | I clienti valutano il servizio; media visibile sul profilo del barbiere. |
| **Vista calendario / agenda** | In valutazione | Agenda settimanale degli appuntamenti, oltre all'elenco attuale. |
| **Auto-registrazione cliente** | In valutazione | Possibilità, attivabile dal gestore, che il cliente crei da sé l'account. |
| **Storico attività (audit log)** | In sviluppo | Le azioni su prenotazioni, transazioni e barbieri sono già registrate a backend: manca la pagina per consultarle. |

La stessa roadmap è consultabile dall'app nella pagina **Guida** (`/docs`, sezione *Funzionalità in arrivo*).
