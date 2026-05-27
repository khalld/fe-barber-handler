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
- Esportazione dell'elenco in formato Excel/CSV

### Barbieri
- Elenco dei collaboratori con stato attivo o inattivo
- Aggiunta di un nuovo barbiere: nome, email, telefono, password, tariffa oraria, bio e specializzazioni
- Impostazione degli orari di lavoro per ogni giorno della settimana (con possibilità di indicare giorno di chiusura)
- Modifica dei dati in qualsiasi momento
- Disattivazione di un barbiere (non appare più ai clienti, ma i dati vengono conservati)
- Esportazione dell'elenco in formato Excel/CSV

### Transazioni
- Registro di tutte le entrate e le uscite del negozio
- **Entrate:** pagamenti prenotazioni, vendita prodotti
- **Uscite:** stipendi, forniture, affitto, utenze, manutenzione
- Filtri per tipo (entrata/uscita), categoria, barbiere e intervallo di date
- Aggiunta, modifica ed eliminazione di qualsiasi voce
- Esportazione in formato Excel/CSV

### Utenti (Clienti Registrati)
- Elenco dei clienti che hanno creato un account, con nome, email, telefono e numero di prenotazioni
- Ricerca rapida per nome, email o telefono
- Creazione manuale di un account cliente
- Eliminazione di un account
- Esportazione in formato Excel/CSV

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
- Modifica di nome, email e telefono
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

### Registrazione e Login
- Creazione di un account con nome, email, telefono e password
- Accesso con email e password

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
