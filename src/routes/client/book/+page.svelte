<script lang="ts">
	import { goto } from '$app/navigation';
	import Toast from '$lib/components/Toast.svelte';
	import type { IBarber } from '$lib/types';

	// ---- State ----
	let step = $state(1); // 1: barber | 2: service+slot | 3: details | 4: success

	// Step 1
	let barbers: IBarber[] = $state([]);
	let loadingBarbers = $state(true);
	let barbersError: string | null = $state(null);
	let selectedBarber: IBarber | null = $state(null);

	// Step 2
	let selectedService = $state('');
	let selectedDate = $state('');
	let selectedSlot = $state('');
	let availableSlots: { time: string; endTime: string }[] = $state([]);
	let loadingSlots = $state(false);

	// Step 3
	let clientName = $state('');
	let clientPhone = $state('');
	let clientEmail = $state('');
	let clientNotes = $state('');

	// Step 4
	let bookedAppointment: any = $state(null);

	// Misc
	let submitting = $state(false);
	let toastMessage: string | null = $state(null);
	let toastType: 'success' | 'danger' | 'warning' | 'info' = $state('info');

	const services = [
		{ name: 'Taglio', duration: 30, price: 15 },
		{ name: 'Barba', duration: 20, price: 10 },
		{ name: 'Taglio + Barba', duration: 50, price: 25 },
		{ name: 'Colore', duration: 60, price: 40 }
	];

	let currentService = $derived(services.find((s) => s.name === selectedService) ?? null);

	// Helpers
	function todayISO() {
		return new Date().toISOString().split('T')[0];
	}
	function maxDateISO() {
		const d = new Date();
		d.setDate(d.getDate() + 30);
		return d.toISOString().split('T')[0];
	}

	function showToast(msg: string, type: typeof toastType) {
		toastMessage = msg;
		toastType = type;
	}

	// ---- Step 1: load barbers on mount ----
	$effect(() => {
		fetch('/api/users/available-barbers')
			.then((r) => r.json())
			.then((d) => {
				if (d.success) barbers = d.data || [];
				else barbersError = d.error;
			})
			.catch(() => (barbersError = 'Errore di connessione'))
			.finally(() => (loadingBarbers = false));
	});

	function pickBarber(barber: IBarber) {
		selectedBarber = barber;
		selectedService = '';
		selectedDate = '';
		selectedSlot = '';
		availableSlots = [];
		step = 2;
	}

	// ---- Step 2: load slots when date changes ----
	async function onDateChange(e: Event) {
		selectedDate = (e.target as HTMLInputElement).value;
		selectedSlot = '';
		availableSlots = [];
		if (!selectedDate || !selectedBarber?._id) return;

		loadingSlots = true;
		try {
			const r = await fetch(
				`/api/users/available-slots?barberId=${selectedBarber._id}&date=${selectedDate}`
			);
			const d = await r.json();
			if (d.success) availableSlots = d.data || [];
			else showToast('Nessun orario disponibile per questa data', 'warning');
		} catch {
			showToast('Errore nel caricamento orari', 'danger');
		}
		loadingSlots = false;
	}

	function step2Valid() {
		return selectedService && selectedDate && selectedSlot;
	}

	// ---- Step 3: validate details ----
	function step3Valid() {
		return clientName.trim().length >= 2 && clientPhone.trim().length >= 6;
	}

	// ---- Step 4: submit ----
	async function handleConfirm() {
		if (!step3Valid()) {
			showToast('Inserisci nome e telefono validi', 'warning');
			return;
		}
		submitting = true;

		const startTime = new Date(`${selectedDate}T${selectedSlot}`).toISOString();

		try {
			const res = await fetch('/api/book', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					barberId: selectedBarber!._id,
					clientName: clientName.trim(),
					clientPhone: clientPhone.trim(),
					clientEmail: clientEmail.trim(),
					service: selectedService,
					duration: currentService!.duration,
					startTime,
					price: currentService!.price
				})
			});

			const data = await res.json();
			if (data.success) {
				bookedAppointment = data.data;
				step = 4;
			} else {
				showToast(data.error || 'Errore nella prenotazione', 'danger');
			}
		} catch {
			showToast('Errore di connessione', 'danger');
		}

		submitting = false;
	}
</script>

<svelte:head>
	<title>Prenota — Barbershop</title>
</svelte:head>

<!-- Minimal top bar -->
<nav class="navbar navbar-dark" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
	<div class="container">
		<a class="navbar-brand fw-bold" href="/client/login">
			<i class="bi bi-scissors me-2"></i>Barbershop
		</a>
		<a href="/client/login" class="btn btn-outline-light btn-sm">
			<i class="bi bi-box-arrow-in-right me-1"></i>Accedi
		</a>
	</div>
</nav>

<div class="min-vh-100 bg-light py-4">
	<div class="container" style="max-width: 760px;">

		{#if step < 4}
			<!-- Progress indicator -->
			<div class="d-flex align-items-center gap-2 mb-4 px-1">
				{#each [
					{ n: 1, label: 'Barbiere' },
					{ n: 2, label: 'Orario' },
					{ n: 3, label: 'Dati' }
				] as s}
					<div
						class="d-flex align-items-center justify-content-center rounded-circle fw-bold"
						style="width:32px;height:32px;font-size:.85rem;flex-shrink:0;
							background:{step >= s.n ? '#0d6efd' : '#dee2e6'};
							color:{step >= s.n ? '#fff' : '#6c757d'}"
					>
						{#if step > s.n}
							<i class="bi bi-check-lg"></i>
						{:else}
							{s.n}
						{/if}
					</div>
					<span class="small fw-semibold {step === s.n ? 'text-primary' : 'text-muted'}">{s.label}</span>
					{#if s.n < 3}
						<div class="flex-grow-1" style="height:2px;background:{step > s.n ? '#0d6efd' : '#dee2e6'};border-radius:1px"></div>
					{/if}
				{/each}
			</div>
		{/if}

		<!-- ===== STEP 1: Choose barber ===== -->
		{#if step === 1}
			<h2 class="h4 mb-1 fw-bold">Scegli il barbiere</h2>
			<p class="text-muted mb-4">Seleziona chi ti preferisci</p>

			{#if loadingBarbers}
				<div class="text-center py-5">
					<div class="spinner-border text-primary" role="status">
						<span class="visually-hidden">Caricamento...</span>
					</div>
				</div>
			{:else if barbersError}
				<div class="alert alert-danger">{barbersError}</div>
			{:else if barbers.length === 0}
				<div class="alert alert-info">
					<i class="bi bi-info-circle me-2"></i>Nessun barbiere disponibile al momento.
				</div>
			{:else}
				<div class="row g-3">
					{#each barbers as barber}
						<div class="col-md-6">
							<button
								class="card border-0 shadow-sm w-100 text-start h-100 booking-card"
								onclick={() => pickBarber(barber)}
							>
								<div class="card-body p-4">
									<div class="d-flex align-items-center gap-3 mb-3">
										<div
											class="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-5"
											style="width:52px;height:52px;flex-shrink:0;background:linear-gradient(135deg,#667eea,#764ba2)"
										>
											{barber.name[0].toUpperCase()}
										</div>
										<div>
											<h5 class="mb-0 fw-bold">{barber.name}</h5>
											{#if barber.email}
												<small class="text-muted">{barber.email}</small>
											{/if}
										</div>
										<span class="badge bg-success ms-auto">Disponibile</span>
									</div>

									{#if barber.specializations?.length}
										<div class="mb-2">
											{#each barber.specializations as spec}
												<span class="badge bg-light text-dark border me-1 mb-1">{spec}</span>
											{/each}
										</div>
									{/if}

									{#if barber.bio}
										<p class="text-muted small mb-0">{barber.bio}</p>
									{/if}
								</div>
							</button>
						</div>
					{/each}
				</div>
			{/if}

			<div class="mt-4 text-center">
				<span class="text-muted small">Hai già un account? </span>
				<a href="/client/login" class="small fw-semibold">Accedi</a>
			</div>
		{/if}

		<!-- ===== STEP 2: Service + date + slot ===== -->
		{#if step === 2}
			<div class="d-flex align-items-center gap-2 mb-4">
				<button class="btn btn-link p-0 text-decoration-none text-muted" onclick={() => (step = 1)}>
					<i class="bi bi-arrow-left me-1"></i>Indietro
				</button>
				<span class="text-muted">—</span>
				<div class="d-flex align-items-center gap-2">
					<div
						class="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
						style="width:32px;height:32px;background:linear-gradient(135deg,#667eea,#764ba2)"
					>
						{selectedBarber!.name[0].toUpperCase()}
					</div>
					<strong>{selectedBarber!.name}</strong>
				</div>
			</div>

			<h2 class="h4 mb-1 fw-bold">Scegli servizio e orario</h2>
			<p class="text-muted mb-4">Seleziona cosa vuoi fare e quando</p>

			<div class="card border-0 shadow-sm mb-3">
				<div class="card-body p-4">
					<h6 class="fw-bold mb-3">Servizio</h6>
					<div class="row g-2">
						{#each services as svc}
							<div class="col-sm-6">
								<button
									class="btn w-100 text-start p-3 service-btn {selectedService === svc.name ? 'btn-primary' : 'btn-outline-secondary'}"
									onclick={() => { selectedService = svc.name; selectedSlot = ''; }}
								>
									<div class="fw-semibold">{svc.name}</div>
									<div class="small opacity-75">
										<i class="bi bi-clock me-1"></i>{svc.duration} min &nbsp;|&nbsp;
										<i class="bi bi-tag me-1"></i>€{svc.price}
									</div>
								</button>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<div class="card border-0 shadow-sm mb-3">
				<div class="card-body p-4">
					<h6 class="fw-bold mb-3">Data</h6>
					<input
						type="date"
						class="form-control"
						min={todayISO()}
						max={maxDateISO()}
						value={selectedDate}
						onchange={onDateChange}
					/>
				</div>
			</div>

			{#if selectedDate}
				<div class="card border-0 shadow-sm mb-4">
					<div class="card-body p-4">
						<h6 class="fw-bold mb-3">Orario disponibile</h6>

						{#if loadingSlots}
							<div class="text-center py-3">
								<div class="spinner-border spinner-border-sm text-primary" role="status">
									<span class="visually-hidden">Caricamento...</span>
								</div>
								<span class="ms-2 text-muted small">Caricamento orari...</span>
							</div>
						{:else if availableSlots.length === 0}
							<p class="text-muted mb-0">
								<i class="bi bi-calendar-x me-1"></i>Nessun orario disponibile per questa data.
							</p>
						{:else}
							<div class="d-flex flex-wrap gap-2">
								{#each availableSlots as slot}
									<button
										class="btn btn-sm {selectedSlot === slot.time ? 'btn-primary' : 'btn-outline-secondary'}"
										onclick={() => (selectedSlot = slot.time)}
									>
										{slot.time}
									</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<div class="d-flex justify-content-end">
				<button
					class="btn btn-primary btn-lg px-5"
					disabled={!step2Valid()}
					onclick={() => (step = 3)}
				>
					Avanti <i class="bi bi-arrow-right ms-1"></i>
				</button>
			</div>
		{/if}

		<!-- ===== STEP 3: Personal details ===== -->
		{#if step === 3}
			<button class="btn btn-link p-0 text-decoration-none text-muted mb-4" onclick={() => (step = 2)}>
				<i class="bi bi-arrow-left me-1"></i>Indietro
			</button>

			<h2 class="h4 mb-1 fw-bold">I tuoi dati</h2>
			<p class="text-muted mb-4">Inserisci i tuoi dati di contatto per confermare la prenotazione</p>

			<!-- Booking recap -->
			<div class="card border-0 bg-primary bg-opacity-10 mb-4">
				<div class="card-body p-3">
					<div class="row g-2 small">
						<div class="col-6">
							<span class="text-muted d-block">Barbiere</span>
							<strong>{selectedBarber!.name}</strong>
						</div>
						<div class="col-6">
							<span class="text-muted d-block">Servizio</span>
							<strong>{selectedService}</strong>
						</div>
						<div class="col-6">
							<span class="text-muted d-block">Data</span>
							<strong>{new Date(selectedDate).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'long' })}</strong>
						</div>
						<div class="col-6">
							<span class="text-muted d-block">Orario</span>
							<strong>{selectedSlot} &nbsp;·&nbsp; €{currentService?.price}</strong>
						</div>
					</div>
				</div>
			</div>

			<div class="card border-0 shadow-sm">
				<div class="card-body p-4">
					<div class="mb-3">
						<label for="clientName" class="form-label fw-semibold">
							Nome completo <span class="text-danger">*</span>
						</label>
						<input
							type="text"
							id="clientName"
							class="form-control form-control-lg"
							placeholder="Mario Rossi"
							bind:value={clientName}
							autocomplete="name"
						/>
					</div>
					<div class="mb-3">
						<label for="clientPhone" class="form-label fw-semibold">
							Telefono <span class="text-danger">*</span>
						</label>
						<input
							type="tel"
							id="clientPhone"
							class="form-control form-control-lg"
							placeholder="+39 333 1234567"
							bind:value={clientPhone}
							autocomplete="tel"
						/>
					</div>
					<div class="mb-3">
						<label for="clientEmail" class="form-label fw-semibold">
							Email <span class="text-muted small fw-normal">(opzionale)</span>
						</label>
						<input
							type="email"
							id="clientEmail"
							class="form-control form-control-lg"
							placeholder="mario@esempio.it"
							bind:value={clientEmail}
							autocomplete="email"
						/>
					</div>
				</div>
			</div>

			<div class="d-flex justify-content-end mt-3">
				<button
					class="btn btn-primary btn-lg px-5"
					disabled={!step3Valid() || submitting}
					onclick={handleConfirm}
				>
					{#if submitting}
						<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
						Prenotazione in corso...
					{:else}
						<i class="bi bi-check-circle me-2"></i>Conferma Prenotazione
					{/if}
				</button>
			</div>

			<p class="text-muted text-center small mt-3">
				Hai un account?
				<a href="/client/login" class="fw-semibold">Accedi</a>
				per gestire le tue prenotazioni
			</p>
		{/if}

		<!-- ===== STEP 4: Success ===== -->
		{#if step === 4}
			<div class="text-center py-4">
				<div
					class="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
					style="width:80px;height:80px;background:#d1fae5"
				>
					<i class="bi bi-check-circle-fill text-success" style="font-size:2.5rem"></i>
				</div>

				<h2 class="h3 fw-bold mb-2">Prenotazione confermata!</h2>
				<p class="text-muted mb-4">
					Ti aspettiamo. Il barbiere riceverà la tua richiesta e la confermerà a breve.
				</p>

				<div class="card border-0 shadow-sm mx-auto mb-4" style="max-width:420px">
					<div class="card-body p-4 text-start">
						<h6 class="fw-bold mb-3 text-muted text-uppercase small">Riepilogo</h6>
						<div class="mb-2 d-flex justify-content-between">
							<span class="text-muted">Barbiere</span>
							<strong>{selectedBarber!.name}</strong>
						</div>
						<div class="mb-2 d-flex justify-content-between">
							<span class="text-muted">Servizio</span>
							<strong>{selectedService}</strong>
						</div>
						<div class="mb-2 d-flex justify-content-between">
							<span class="text-muted">Data e ora</span>
							<strong>
								{new Date(selectedDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}
								alle {selectedSlot}
							</strong>
						</div>
						<div class="d-flex justify-content-between">
							<span class="text-muted">Prezzo</span>
							<strong class="text-success">€{currentService?.price}</strong>
						</div>
					</div>
				</div>

				<div class="alert alert-info d-inline-block text-start" style="max-width:420px">
					<i class="bi bi-bell me-2"></i>
					<strong>Nota:</strong> La prenotazione è in attesa di conferma da parte del barbiere.
					{#if clientEmail}
						Riceverai aggiornamenti all'indirizzo <strong>{clientEmail}</strong>.
					{/if}
				</div>

				<div class="d-flex flex-column flex-sm-row justify-content-center gap-3 mt-4">
					<button
						class="btn btn-outline-secondary"
						onclick={() => {
							step = 1;
							selectedBarber = null;
							selectedService = '';
							selectedDate = '';
							selectedSlot = '';
							clientName = '';
							clientPhone = '';
							clientEmail = '';
							bookedAppointment = null;
						}}
					>
						<i class="bi bi-plus me-2"></i>Nuova prenotazione
					</button>
					<a href="/client/login" class="btn btn-primary">
						<i class="bi bi-person me-2"></i>Crea account o accedi
					</a>
				</div>
			</div>
		{/if}
	</div>
</div>

<Toast message={toastMessage} type={toastType} />

<style>
	.booking-card {
		background: white;
		cursor: pointer;
		transition: transform 0.15s ease, box-shadow 0.15s ease;
		border-radius: 0.75rem !important;
	}

	.booking-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.12) !important;
	}

	.service-btn {
		border-radius: 0.5rem !important;
		transition: all 0.15s ease;
	}
</style>
