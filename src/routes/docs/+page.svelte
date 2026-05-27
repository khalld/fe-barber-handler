<svelte:head>
	<title>Guida Utente — Barbershop Handler</title>
</svelte:head>

<!-- Top bar -->
<nav class="navbar navbar-dark sticky-top" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); z-index: 1030;">
	<div class="container-xl d-flex align-items-center justify-content-between">
		<a class="navbar-brand fw-bold fs-5" href="/">
			<i class="bi bi-scissors me-2"></i>Barbershop Handler
		</a>
		<span class="badge bg-secondary">Guida Utente v1.0</span>
	</div>
</nav>

<div class="bg-light min-vh-100">

	<!-- Hero -->
	<div class="py-5" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);">
		<div class="container-xl text-center text-white py-3">
			<div class="mb-3">
				<span class="badge bg-warning text-dark fw-semibold px-3 py-2 rounded-pill">
					<i class="bi bi-book me-1"></i>Documentazione
				</span>
			</div>
			<h1 class="display-5 fw-bold mb-3">Guida alla Piattaforma</h1>
			<p class="lead text-white-50 mb-4" style="max-width: 600px; margin: 0 auto;">
				Tutto quello che serve sapere per gestire la tua barberia, organizzare i turni
				dei collaboratori e permettere ai clienti di prenotare online.
			</p>
			<!-- Quick links -->
			<div class="d-flex flex-wrap justify-content-center gap-2">
				<a href="#gestore" class="btn btn-outline-light btn-sm rounded-pill">
					<i class="bi bi-shield-lock me-1"></i>Portale Gestore
				</a>
				<a href="#barbiere" class="btn btn-outline-light btn-sm rounded-pill">
					<i class="bi bi-person-badge me-1"></i>Portale Barbiere
				</a>
				<a href="#cliente" class="btn btn-outline-light btn-sm rounded-pill">
					<i class="bi bi-people me-1"></i>Portale Clienti
				</a>
				<a href="#servizi" class="btn btn-outline-light btn-sm rounded-pill">
					<i class="bi bi-scissors me-1"></i>Servizi
				</a>
			</div>
		</div>
	</div>

	<div class="container-xl py-5">

		<!-- ─── PANORAMICA ─────────────────────────────────────────── -->
		<section class="mb-5">
			<h2 class="h4 fw-bold mb-4 d-flex align-items-center gap-2">
				<i class="bi bi-grid-3x3-gap text-primary"></i>Panoramica della Piattaforma
			</h2>
			<div class="row g-3">
				<div class="col-md-4">
					<div class="card border-0 shadow-sm h-100">
						<div class="card-body p-4">
							<div class="rounded-3 p-3 d-inline-flex mb-3" style="background:#e9f0ff">
								<i class="bi bi-shield-lock fs-4 text-primary"></i>
							</div>
							<h5 class="fw-bold">Portale Gestore</h5>
							<p class="text-muted small mb-0">
								Accesso completo alla gestione del negozio: barbieri, prenotazioni,
								transazioni, utenti e magazzino.
							</p>
						</div>
						<div class="card-footer bg-transparent border-0 px-4 pb-4">
							<code class="small text-muted">/login → tab Admin</code>
						</div>
					</div>
				</div>
				<div class="col-md-4">
					<div class="card border-0 shadow-sm h-100">
						<div class="card-body p-4">
							<div class="rounded-3 p-3 d-inline-flex mb-3" style="background:#fff3cd">
								<i class="bi bi-person-badge fs-4 text-warning"></i>
							</div>
							<h5 class="fw-bold">Portale Barbiere</h5>
							<p class="text-muted small mb-0">
								Dashboard personale con le proprie prenotazioni, statistiche di guadagno
								e gestione del profilo.
							</p>
						</div>
						<div class="card-footer bg-transparent border-0 px-4 pb-4">
							<code class="small text-muted">/login → tab Barbiere</code>
						</div>
					</div>
				</div>
				<div class="col-md-4">
					<div class="card border-0 shadow-sm h-100">
						<div class="card-body p-4">
							<div class="rounded-3 p-3 d-inline-flex mb-3" style="background:#d1f2eb">
								<i class="bi bi-people fs-4 text-success"></i>
							</div>
							<h5 class="fw-bold">Portale Clienti</h5>
							<p class="text-muted small mb-0">
								I clienti possono prenotare un appuntamento con o senza registrazione,
								e gestire le proprie prenotazioni.
							</p>
						</div>
						<div class="card-footer bg-transparent border-0 px-4 pb-4">
							<code class="small text-muted">/client/login &nbsp;|&nbsp; /client/book</code>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- ─── PORTALE GESTORE ───────────────────────────────────── -->
		<section id="gestore" class="mb-5 scroll-mt">
			<div class="d-flex align-items-center gap-2 mb-4">
				<div class="rounded-3 p-2" style="background:#e9f0ff">
					<i class="bi bi-shield-lock fs-5 text-primary"></i>
				</div>
				<h2 class="h4 fw-bold mb-0">Portale Gestore (Admin)</h2>
			</div>

			<div class="alert alert-primary border-0 mb-4" style="background:#e9f0ff">
				<i class="bi bi-info-circle me-2"></i>
				Accedi da <strong>/login</strong>, seleziona il tab <strong>Admin</strong> e inserisci le credenziali configurate nel file <code>.env</code>.
			</div>

			<!-- Dashboard -->
			<div class="card border-0 shadow-sm mb-3">
				<div class="card-header bg-white border-bottom py-3">
					<div class="d-flex align-items-center gap-2">
						<i class="bi bi-graph-up text-primary fs-5"></i>
						<h5 class="mb-0 fw-semibold">Dashboard</h5>
						<span class="badge bg-primary ms-auto">/ (home)</span>
					</div>
				</div>
				<div class="card-body p-4">
					<p class="text-muted mb-3">Panoramica immediata dell'attività giornaliera del negozio.</p>
					<div class="row g-3">
						<div class="col-sm-6 col-lg-3">
							<div class="p-3 rounded-3 bg-light text-center">
								<i class="bi bi-calendar-check text-primary fs-4 d-block mb-1"></i>
								<div class="small fw-semibold">Prenotazioni Oggi</div>
								<div class="text-muted" style="font-size:.75rem">Totali e completate</div>
							</div>
						</div>
						<div class="col-sm-6 col-lg-3">
							<div class="p-3 rounded-3 bg-light text-center">
								<i class="bi bi-cash-coin text-success fs-4 d-block mb-1"></i>
								<div class="small fw-semibold">Revenue &amp; Spese</div>
								<div class="text-muted" style="font-size:.75rem">Entrate e uscite del mese</div>
							</div>
						</div>
						<div class="col-sm-6 col-lg-3">
							<div class="p-3 rounded-3 bg-light text-center">
								<i class="bi bi-bar-chart text-warning fs-4 d-block mb-1"></i>
								<div class="small fw-semibold">Grafici Trend</div>
								<div class="text-muted" style="font-size:.75rem">Revenue, prenotazioni, servizi</div>
							</div>
						</div>
						<div class="col-sm-6 col-lg-3">
							<div class="p-3 rounded-3 bg-light text-center">
								<i class="bi bi-trophy text-danger fs-4 d-block mb-1"></i>
								<div class="small fw-semibold">Top Barbieri</div>
								<div class="text-muted" style="font-size:.75rem">Classifica per guadagno</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Prenotazioni -->
			<div class="card border-0 shadow-sm mb-3">
				<div class="card-header bg-white border-bottom py-3">
					<div class="d-flex align-items-center gap-2">
						<i class="bi bi-calendar-check text-primary fs-5"></i>
						<h5 class="mb-0 fw-semibold">Prenotazioni</h5>
						<span class="badge bg-primary ms-auto">/appointments</span>
					</div>
				</div>
				<div class="card-body p-4">
					<p class="text-muted mb-3">Gestione completa di tutti gli appuntamenti del negozio.</p>
					<ul class="list-unstyled mb-0">
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Visualizza tutte le prenotazioni con filtri per barbiere, data e stato</span></li>
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Crea nuove prenotazioni scegliendo barbiere, servizio, data e slot liberi</span></li>
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Modifica una prenotazione esistente</span></li>
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Segna una prenotazione come <strong>Completata</strong> (pagamento registrato automaticamente)</span></li>
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Cancella una prenotazione (stato aggiornato a <em>cancelled</em>)</span></li>
						<li class="d-flex gap-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Esporta l'elenco in <strong>CSV</strong></span></li>
					</ul>
				</div>
			</div>

			<!-- Barbieri -->
			<div class="card border-0 shadow-sm mb-3">
				<div class="card-header bg-white border-bottom py-3">
					<div class="d-flex align-items-center gap-2">
						<i class="bi bi-person-badge text-primary fs-5"></i>
						<h5 class="mb-0 fw-semibold">Barbieri</h5>
						<span class="badge bg-primary ms-auto">/barbers</span>
					</div>
				</div>
				<div class="card-body p-4">
					<p class="text-muted mb-3">Anagrafica dei collaboratori con tutti i dati operativi.</p>
					<ul class="list-unstyled mb-0">
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Elenco barbieri con stato attivo/inattivo e specializzazioni</span></li>
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Crea un nuovo barbiere con email, password, tariffa oraria e bio</span></li>
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Imposta gli <strong>orari di lavoro</strong> per ogni giorno della settimana (o chiusura)</span></li>
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Modifica dati e orari in qualsiasi momento</span></li>
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Disattiva un barbiere (non appare più ai clienti) senza cancellarlo</span></li>
						<li class="d-flex gap-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Esporta l'elenco in <strong>CSV</strong></span></li>
					</ul>
				</div>
			</div>

			<!-- Transazioni -->
			<div class="card border-0 shadow-sm mb-3">
				<div class="card-header bg-white border-bottom py-3">
					<div class="d-flex align-items-center gap-2">
						<i class="bi bi-cash-coin text-primary fs-5"></i>
						<h5 class="mb-0 fw-semibold">Transazioni</h5>
						<span class="badge bg-primary ms-auto">/transactions</span>
					</div>
				</div>
				<div class="card-body p-4">
					<p class="text-muted mb-3">Registro finanziario di tutte le entrate e uscite del negozio.</p>
					<div class="row g-3 mb-3">
						<div class="col-sm-6">
							<div class="p-3 rounded-3 border">
								<div class="small fw-semibold text-success mb-1"><i class="bi bi-arrow-up-circle me-1"></i>Entrate</div>
								<ul class="list-unstyled small text-muted mb-0">
									<li>Pagamento prenotazione</li>
									<li>Vendita prodotto</li>
								</ul>
							</div>
						</div>
						<div class="col-sm-6">
							<div class="p-3 rounded-3 border">
								<div class="small fw-semibold text-danger mb-1"><i class="bi bi-arrow-down-circle me-1"></i>Uscite</div>
								<ul class="list-unstyled small text-muted mb-0">
									<li>Stipendi, Forniture, Affitto</li>
									<li>Utenze, Manutenzione, Altro</li>
								</ul>
							</div>
						</div>
					</div>
					<ul class="list-unstyled mb-0">
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Filtra per tipo (entrata/uscita), categoria, barbiere e intervallo di date</span></li>
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Crea, modifica ed elimina qualsiasi transazione</span></li>
						<li class="d-flex gap-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Esporta in <strong>CSV</strong></span></li>
					</ul>
				</div>
			</div>

			<!-- Utenti -->
			<div class="card border-0 shadow-sm mb-3">
				<div class="card-header bg-white border-bottom py-3">
					<div class="d-flex align-items-center gap-2">
						<i class="bi bi-people text-primary fs-5"></i>
						<h5 class="mb-0 fw-semibold">Utenti (Clienti Registrati)</h5>
						<span class="badge bg-primary ms-auto">/users</span>
					</div>
				</div>
				<div class="card-body p-4">
					<p class="text-muted mb-3">Rubrica dei clienti che hanno creato un account sulla piattaforma.</p>
					<ul class="list-unstyled mb-0">
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Elenco con nome, email, telefono, numero di prenotazioni effettuate e data registrazione</span></li>
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Ricerca rapida per nome, email o telefono</span></li>
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Crea manualmente un account cliente (utile per clienti fissi)</span></li>
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Elimina un account</span></li>
						<li class="d-flex gap-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Esporta l'elenco in <strong>CSV</strong></span></li>
					</ul>
				</div>
			</div>

			<!-- Magazzino -->
			<div class="card border-0 shadow-sm mb-3">
				<div class="card-header bg-white border-bottom py-3">
					<div class="d-flex align-items-center gap-2">
						<i class="bi bi-box-seam text-primary fs-5"></i>
						<h5 class="mb-0 fw-semibold">Magazzino</h5>
						<span class="badge bg-primary ms-auto">/warehouse</span>
					</div>
				</div>
				<div class="card-body p-4">
					<p class="text-muted mb-3">Inventario dei prodotti e materiali del negozio con alert automatico sulle scorte basse.</p>
					<div class="row g-2 mb-3">
						{#each [['shampoo','Shampoo / Prodotti','primary'],['tools','Attrezzi','secondary'],['disposables','Monouso','info'],['color','Colori','warning'],['other','Altro','dark']] as [,label,color]}
							<div class="col-auto">
								<span class="badge bg-{color} bg-opacity-75">{label}</span>
							</div>
						{/each}
					</div>
					<ul class="list-unstyled mb-0">
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Riepilogo: numero articoli, articoli sotto scorta minima, valore totale inventario</span></li>
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Indicatore colorato: <span class="text-success fw-semibold">verde</span> (OK), <span class="text-warning fw-semibold">giallo</span> (scorta bassa), <span class="text-danger fw-semibold">rosso</span> (esaurito)</span></li>
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Filtra per categoria o cerca per nome</span></li>
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Aggiungi articolo con quantità, soglia minima, prezzo d'acquisto e fornitore</span></li>
						<li class="d-flex gap-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Modifica quantità e dati o elimina un articolo</span></li>
					</ul>
				</div>
			</div>
		</section>

		<!-- ─── PORTALE BARBIERE ───────────────────────────────────── -->
		<section id="barbiere" class="mb-5 scroll-mt">
			<div class="d-flex align-items-center gap-2 mb-4">
				<div class="rounded-3 p-2" style="background:#fff3cd">
					<i class="bi bi-person-badge fs-5 text-warning"></i>
				</div>
				<h2 class="h4 fw-bold mb-0">Portale Barbiere</h2>
			</div>

			<div class="alert border-0 mb-4" style="background:#fff3cd">
				<i class="bi bi-info-circle me-2"></i>
				Accedi da <strong>/login</strong>, seleziona il tab <strong>Barbiere</strong> e usa le credenziali personali (email + password impostata dal gestore).
			</div>

			<div class="row g-3">
				<div class="col-md-6">
					<div class="card border-0 shadow-sm h-100">
						<div class="card-header bg-white border-bottom py-3">
							<div class="d-flex align-items-center gap-2">
								<i class="bi bi-grid text-warning fs-5"></i>
								<h5 class="mb-0 fw-semibold">Dashboard Personale</h5>
								<span class="badge bg-warning text-dark ms-auto">/barber-dashboard</span>
							</div>
						</div>
						<div class="card-body p-4">
							<ul class="list-unstyled mb-0">
								<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Prenotazioni di oggi con orario, cliente e servizio</span></li>
								<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Revenue del giorno e degli ultimi 30 giorni</span></li>
								<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Grafico trend guadagni giornalieri</span></li>
								<li class="d-flex gap-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Classifica dei servizi più richiesti (numero e revenue)</span></li>
							</ul>
						</div>
					</div>
				</div>
				<div class="col-md-6">
					<div class="card border-0 shadow-sm h-100">
						<div class="card-header bg-white border-bottom py-3">
							<div class="d-flex align-items-center gap-2">
								<i class="bi bi-person-circle text-warning fs-5"></i>
								<h5 class="mb-0 fw-semibold">Profilo</h5>
								<span class="badge bg-warning text-dark ms-auto">/barber-profile</span>
							</div>
						</div>
						<div class="card-body p-4">
							<ul class="list-unstyled mb-0">
								<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Visualizza e modifica nome, email e telefono</span></li>
								<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Aggiorna la bio (testo di presentazione per i clienti)</span></li>
								<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Gestisci le specializzazioni (es. Taglio, Barba, Colore)</span></li>
								<li class="d-flex gap-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Cambia la password in modo sicuro (verifica password attuale)</span></li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- ─── PORTALE CLIENTI ────────────────────────────────────── -->
		<section id="cliente" class="mb-5 scroll-mt">
			<div class="d-flex align-items-center gap-2 mb-4">
				<div class="rounded-3 p-2" style="background:#d1f2eb">
					<i class="bi bi-people fs-5 text-success"></i>
				</div>
				<h2 class="h4 fw-bold mb-0">Portale Clienti</h2>
			</div>

			<!-- Prenotazione ospite -->
			<div class="card border-0 shadow-sm mb-3">
				<div class="card-header bg-white border-bottom py-3">
					<div class="d-flex align-items-center gap-2">
						<i class="bi bi-calendar-plus text-success fs-5"></i>
						<h5 class="mb-0 fw-semibold">Prenotazione senza account</h5>
						<span class="badge bg-success ms-auto">/client/book</span>
					</div>
				</div>
				<div class="card-body p-4">
					<p class="text-muted mb-3">
						Chiunque può prenotare senza registrarsi, seguendo una procedura guidata in 3 passi.
					</p>
					<div class="row g-3">
						<div class="col-sm-4">
							<div class="d-flex align-items-start gap-3 p-3 rounded-3 border h-100">
								<div class="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
									style="width:36px;height:36px;background:#0d6efd;font-size:.9rem">1</div>
								<div>
									<div class="fw-semibold small">Scegli il barbiere</div>
									<div class="text-muted" style="font-size:.8rem">Schede con specializzazioni e bio</div>
								</div>
							</div>
						</div>
						<div class="col-sm-4">
							<div class="d-flex align-items-start gap-3 p-3 rounded-3 border h-100">
								<div class="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
									style="width:36px;height:36px;background:#0d6efd;font-size:.9rem">2</div>
								<div>
									<div class="fw-semibold small">Servizio, data e orario</div>
									<div class="text-muted" style="font-size:.8rem">Solo slot liberi disponibili</div>
								</div>
							</div>
						</div>
						<div class="col-sm-4">
							<div class="d-flex align-items-start gap-3 p-3 rounded-3 border h-100">
								<div class="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
									style="width:36px;height:36px;background:#0d6efd;font-size:.9rem">3</div>
								<div>
									<div class="fw-semibold small">Dati di contatto</div>
									<div class="text-muted" style="font-size:.8rem">Nome e telefono (email opzionale)</div>
								</div>
							</div>
						</div>
					</div>
					<p class="text-muted small mt-3 mb-0">
						<i class="bi bi-shield-check me-1 text-success"></i>
						La prenotazione viene salvata con stato <strong>In attesa</strong> e il gestore la vedrà nella sezione Prenotazioni.
					</p>
				</div>
			</div>

			<!-- Registrazione e login -->
			<div class="card border-0 shadow-sm mb-3">
				<div class="card-header bg-white border-bottom py-3">
					<div class="d-flex align-items-center gap-2">
						<i class="bi bi-person-plus text-success fs-5"></i>
						<h5 class="mb-0 fw-semibold">Registrazione e Login</h5>
						<span class="badge bg-success ms-auto">/client/login</span>
					</div>
				</div>
				<div class="card-body p-4">
					<div class="row g-3">
						<div class="col-md-6">
							<h6 class="fw-semibold">Registrazione</h6>
							<p class="text-muted small mb-2">Crea un account con:</p>
							<ul class="text-muted small mb-0">
								<li>Nome completo</li>
								<li>Email (usata per accedere)</li>
								<li>Numero di telefono</li>
								<li>Password (minimo 6 caratteri)</li>
							</ul>
						</div>
						<div class="col-md-6">
							<h6 class="fw-semibold">Vantaggi dell'account</h6>
							<ul class="list-unstyled text-muted small mb-0">
								<li class="d-flex gap-2 mb-1"><i class="bi bi-check-circle-fill text-success"></i><span>Storico di tutte le prenotazioni</span></li>
								<li class="d-flex gap-2 mb-1"><i class="bi bi-check-circle-fill text-success"></i><span>Cancellazione in autonomia</span></li>
								<li class="d-flex gap-2"><i class="bi bi-check-circle-fill text-success"></i><span>Prenotazioni future sempre visibili</span></li>
							</ul>
						</div>
					</div>
				</div>
			</div>

			<!-- Prenota con account -->
			<div class="card border-0 shadow-sm mb-3">
				<div class="card-header bg-white border-bottom py-3">
					<div class="d-flex align-items-center gap-2">
						<i class="bi bi-scissors text-success fs-5"></i>
						<h5 class="mb-0 fw-semibold">Prenota con account</h5>
						<span class="badge bg-success ms-auto">/client/barbers</span>
					</div>
				</div>
				<div class="card-body p-4">
					<p class="text-muted mb-3">Dopo aver effettuato il login, il cliente sceglie il barbiere e prenota tramite una modale.</p>
					<ul class="list-unstyled mb-0">
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Elenco dei barbieri attivi con specializzazioni</span></li>
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Selezione servizio, data e slot libero</span></li>
						<li class="d-flex gap-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Prenotazione collegata al proprio account</span></li>
					</ul>
				</div>
			</div>

			<!-- Le mie prenotazioni -->
			<div class="card border-0 shadow-sm">
				<div class="card-header bg-white border-bottom py-3">
					<div class="d-flex align-items-center gap-2">
						<i class="bi bi-list-check text-success fs-5"></i>
						<h5 class="mb-0 fw-semibold">Le mie prenotazioni</h5>
						<span class="badge bg-success ms-auto">/client/appointments</span>
					</div>
				</div>
				<div class="card-body p-4">
					<ul class="list-unstyled mb-0">
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Elenco di tutte le prenotazioni personali con stato aggiornato</span></li>
						<li class="d-flex gap-2 mb-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Visualizza dettagli: barbiere, servizio, data, orario e prezzo</span></li>
						<li class="d-flex gap-2"><i class="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i><span>Cancella una prenotazione ancora in stato <em>In attesa</em> o <em>Confermata</em></span></li>
					</ul>
				</div>
			</div>
		</section>

		<!-- ─── SERVIZI ────────────────────────────────────────────── -->
		<section id="servizi" class="mb-5 scroll-mt">
			<div class="d-flex align-items-center gap-2 mb-4">
				<div class="rounded-3 p-2" style="background:#f8d7da">
					<i class="bi bi-scissors fs-5 text-danger"></i>
				</div>
				<h2 class="h4 fw-bold mb-0">Servizi Disponibili</h2>
			</div>

			<div class="card border-0 shadow-sm">
				<div class="card-body p-0">
					<div class="table-responsive">
						<table class="table table-hover mb-0 align-middle">
							<thead class="table-light">
								<tr>
									<th class="ps-4">Servizio</th>
									<th>Durata</th>
									<th>Prezzo</th>
									<th class="pe-4">Note</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td class="ps-4 fw-semibold"><i class="bi bi-scissors me-2 text-primary"></i>Taglio</td>
									<td><span class="badge bg-light text-dark border"><i class="bi bi-clock me-1"></i>30 min</span></td>
									<td><span class="fw-bold text-success">€ 15,00</span></td>
									<td class="pe-4 text-muted small">Taglio classico o moderno</td>
								</tr>
								<tr>
									<td class="ps-4 fw-semibold"><i class="bi bi-scissors me-2 text-primary"></i>Barba</td>
									<td><span class="badge bg-light text-dark border"><i class="bi bi-clock me-1"></i>20 min</span></td>
									<td><span class="fw-bold text-success">€ 10,00</span></td>
									<td class="pe-4 text-muted small">Rifinitura o rasatura</td>
								</tr>
								<tr>
									<td class="ps-4 fw-semibold"><i class="bi bi-scissors me-2 text-primary"></i>Taglio + Barba</td>
									<td><span class="badge bg-light text-dark border"><i class="bi bi-clock me-1"></i>50 min</span></td>
									<td><span class="fw-bold text-success">€ 25,00</span></td>
									<td class="pe-4 text-muted small">Servizio completo</td>
								</tr>
								<tr>
									<td class="ps-4 fw-semibold"><i class="bi bi-scissors me-2 text-primary"></i>Colore</td>
									<td><span class="badge bg-light text-dark border"><i class="bi bi-clock me-1"></i>60 min</span></td>
									<td><span class="fw-bold text-success">€ 40,00</span></td>
									<td class="pe-4 text-muted small">Colorazione professionale</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div class="card-footer bg-transparent text-muted small p-3 px-4">
					<i class="bi bi-info-circle me-1"></i>
					Gli slot sono generati automaticamente in blocchi da 30 minuti all'interno degli orari di lavoro del barbiere.
				</div>
			</div>
		</section>

		<!-- ─── STATI PRENOTAZIONE ────────────────────────────────── -->
		<section class="mb-5">
			<h2 class="h4 fw-bold mb-4 d-flex align-items-center gap-2">
				<i class="bi bi-diagram-3 text-primary"></i>Stati di una Prenotazione
			</h2>
			<div class="card border-0 shadow-sm">
				<div class="card-body p-4">
					<div class="row g-3">
						<div class="col-sm-6 col-lg-3">
							<div class="d-flex gap-3 align-items-start p-3 rounded-3 border">
								<span class="badge bg-warning text-dark mt-1 flex-shrink-0" style="font-size:.7rem">In attesa</span>
								<div class="small text-muted">Prenotazione creata, in attesa di conferma da parte del gestore.</div>
							</div>
						</div>
						<div class="col-sm-6 col-lg-3">
							<div class="d-flex gap-3 align-items-start p-3 rounded-3 border">
								<span class="badge bg-primary mt-1 flex-shrink-0" style="font-size:.7rem">Confermata</span>
								<div class="small text-muted">Il gestore ha confermato l'appuntamento.</div>
							</div>
						</div>
						<div class="col-sm-6 col-lg-3">
							<div class="d-flex gap-3 align-items-start p-3 rounded-3 border">
								<span class="badge bg-success mt-1 flex-shrink-0" style="font-size:.7rem">Completata</span>
								<div class="small text-muted">Servizio eseguito e pagamento registrato.</div>
							</div>
						</div>
						<div class="col-sm-6 col-lg-3">
							<div class="d-flex gap-3 align-items-start p-3 rounded-3 border">
								<span class="badge bg-secondary mt-1 flex-shrink-0" style="font-size:.7rem">Cancellata</span>
								<div class="small text-muted">Prenotazione annullata dal cliente o dal gestore.</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- ─── ACCESSI RAPIDI ─────────────────────────────────────── -->
		<section class="mb-5">
			<h2 class="h4 fw-bold mb-4 d-flex align-items-center gap-2">
				<i class="bi bi-link-45deg text-primary"></i>Riepilogo URL
			</h2>
			<div class="card border-0 shadow-sm">
				<div class="card-body p-0">
					<div class="table-responsive">
						<table class="table table-hover align-middle mb-0">
							<thead class="table-light">
								<tr>
									<th class="ps-4">URL</th>
									<th>Chi lo usa</th>
									<th class="pe-4">Descrizione</th>
								</tr>
							</thead>
							<tbody>
								{#each [
									['/login','Admin / Barbiere','Pagina di accesso unificata (tab Admin o Barbiere)'],
									['/','Gestore','Dashboard globale del negozio'],
									['/appointments','Gestore','Gestione prenotazioni'],
									['/barbers','Gestore','Gestione barbieri'],
									['/transactions','Gestore','Registro finanziario'],
									['/users','Gestore','Gestione clienti registrati'],
									['/warehouse','Gestore','Inventario magazzino'],
									['/barber-dashboard','Barbiere','Dashboard personale'],
									['/barber-profile','Barbiere','Profilo personale'],
									['/client/login','Cliente','Login e registrazione cliente'],
									['/client/book','Cliente / Ospite','Prenotazione senza account (wizard)'],
									['/client/barbers','Cliente','Prenota con account'],
									['/client/appointments','Cliente','Le mie prenotazioni'],
									['/api-docs','Sviluppatori','Documentazione API (Swagger UI)'],
								] as [url, who, desc]}
									<tr>
										<td class="ps-4"><code class="small text-primary">{url}</code></td>
										<td><span class="badge bg-light text-dark border small">{who}</span></td>
										<td class="pe-4 text-muted small">{desc}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</section>

	</div>

	<!-- Footer -->
	<footer class="py-4 text-center text-muted small" style="border-top:1px solid #dee2e6; background:#fff;">
		<i class="bi bi-scissors me-1"></i>
		<strong>Barbershop Handler</strong> &nbsp;·&nbsp; Documentazione v1.0 &nbsp;·&nbsp;
		<a href="/api-docs" class="text-muted">API Docs</a>
	</footer>

</div>

<style>
	.scroll-mt {
		scroll-margin-top: 70px;
	}
</style>
