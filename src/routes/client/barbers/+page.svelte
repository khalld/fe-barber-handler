<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import ClientLayout from '$lib/components/ClientLayout.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { getAvailableBarbers, getAvailableSlots } from '$lib/api-client';
	import type { IBarber } from '$lib/types';

	let barbers: IBarber[] = $state([]);
	let loading: boolean = $state(true);
	let error: string | null = $state(null);
	let toastMessage: string = $state('');
	let toastType: 'success' | 'danger' | 'warning' | 'info' = $state('info');

	let selectedBarber: IBarber | null = $state(null);
	let selectedDate: string = $state('');
	let availableSlots: any[] = $state([]);
	let showBookingModal: boolean = $state(false);
	let slotsLoading: boolean = $state(false);

	// Form booking
	let bookingForm = $state({
		selectedSlot: '',
		serviceType: '',
		duration: 30,
		totalPrice: 0
	});

	const services = [
		{ name: 'Taglio', duration: 30, price: 15 },
		{ name: 'Barba', duration: 20, price: 10 },
		{ name: 'Taglio + Barba', duration: 50, price: 25 },
		{ name: 'Colore', duration: 60, price: 40 }
	];

	onMount(async () => {
		// Check if user is logged in
		const userId = localStorage.getItem('userId');
		if (!userId) {
			goto('/client/login');
			return;
		}

		loading = true;
		const result = await getAvailableBarbers();
		if (result.success) {
			barbers = result.data || [];
		} else {
			error = result.error || 'Errore nel caricamento barbieri';
		}
		loading = false;
	});

	function selectBarber(barber: IBarber) {
		selectedBarber = barber;
		selectedDate = '';
		availableSlots = [];
		showBookingModal = true;
	}

	async function handleDateChange(event: any) {
		const date = event.target.value;
		if (!date) return;

		selectedDate = date;
		slotsLoading = true;

		const result = await getAvailableSlots(selectedBarber?._id || '', date);
		if (result.success) {
			availableSlots = result.data || [];
		} else {
			toastMessage = 'Errore nel caricamento orari disponibili';
			toastType = 'danger';
		}
		slotsLoading = false;
	}

	function onServiceSelect(event: any) {
		const serviceName = event.target.value;
		const service = services.find(s => s.name === serviceName);
		if (service) {
			bookingForm.serviceType = service.name;
			bookingForm.duration = service.duration;
			bookingForm.totalPrice = service.price;
		}
	}

	async function handleBooking() {
		if (!selectedBarber || !selectedDate || !bookingForm.selectedSlot || !bookingForm.serviceType) {
			toastMessage = 'Completa tutti i campi';
			toastType = 'warning';
			return;
		}

		// Redirect to booking confirmation page with data
		const bookingData = {
			barberId: selectedBarber._id,
			barberName: selectedBarber.name,
			selectedDate,
			selectedSlot: bookingForm.selectedSlot,
			serviceType: bookingForm.serviceType,
			duration: bookingForm.duration,
			totalPrice: bookingForm.totalPrice
		};

		localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
		goto('/client/confirm-booking');
	}

	function getTodayDate(): string {
		const today = new Date();
		return today.toISOString().split('T')[0];
	}

	function getMaxDate(): string {
		const maxDate = new Date();
		maxDate.setDate(maxDate.getDate() + 30);
		return maxDate.toISOString().split('T')[0];
	}
</script>

<ClientLayout>
	<div class="container-fluid p-4">
		<!-- Header -->
		<div class="mb-4">
			<h1 class="h3 mb-1">
				<i class="bi bi-person-badge me-2"></i>
				Scegli il tuo Barbiere
			</h1>
			<p class="text-muted">Seleziona un barbiere e prenota il tuo slot</p>
		</div>

		{#if loading}
			<div class="text-center py-5">
				<div class="spinner-border text-primary" role="status">
					<span class="visually-hidden">Caricamento...</span>
				</div>
			</div>
		{:else if error}
			<div class="alert alert-danger alert-dismissible fade show" role="alert">
				<i class="bi bi-exclamation-circle me-2"></i>
				{error}
				<button type="button" class="btn-close" data-bs-dismiss="alert"></button>
			</div>
		{:else if barbers.length === 0}
			<div class="alert alert-info">
				<i class="bi bi-info-circle me-2"></i>
				Nessun barbiere disponibile al momento
			</div>
		{:else}
			<div class="row g-4">
				{#each barbers as barber}
					<div class="col-md-6 col-lg-4">
						<div class="card h-100 shadow-sm border-0 transition">
							<div class="card-body">
								<div class="d-flex justify-content-between align-items-start mb-3">
									<h5 class="card-title mb-0">{barber.name}</h5>
									<span class="badge bg-success">
										<i class="bi bi-check-circle me-1"></i>
										Disponibile
									</span>
								</div>

								{#if barber.specializations && barber.specializations.length > 0}
									<div class="mb-3">
										<strong class="small text-muted">Specializzazioni:</strong>
										<div>
											{#each barber.specializations as spec}
												<span class="badge bg-light text-dark me-1 mb-2">{spec}</span>
											{/each}
										</div>
									</div>
								{/if}

								{#if barber.bio}
									<p class="text-muted small mb-3">{barber.bio}</p>
								{/if}

								<div class="mb-3">
									<small class="text-muted d-block">
										<i class="bi bi-telephone me-1"></i>
										{barber.phone || 'N/A'}
									</small>
									<small class="text-muted d-block">
										<i class="bi bi-envelope me-1"></i>
										{barber.email}
									</small>
								</div>

								<button
									class="btn btn-primary w-100"
									onclick={() => selectBarber(barber)}
								>
									<i class="bi bi-calendar-check me-2"></i>
									Prenota Ora
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</ClientLayout>

<!-- Booking Modal -->
<Modal
	id="bookingModal"
	title={selectedBarber ? `Prenota con ${selectedBarber.name}` : 'Prenotazione'}
	visible={showBookingModal}
	onClose={() => (showBookingModal = false)}
	onSubmit={handleBooking}
>
	<div class="mb-3">
		<label for="bookingDate" class="form-label">
			<strong>Data Prenotazione</strong>
		</label>
		<input
			type="date"
			id="bookingDate"
			class="form-control"
			bind:value={selectedDate}
			onchange={handleDateChange}
			min={getTodayDate()}
			max={getMaxDate()}
			required
		/>
	</div>

	{#if selectedDate}
		<div class="mb-3">
			<label for="serviceType" class="form-label">
				<strong>Servizio</strong>
			</label>
			<select
				id="serviceType"
				class="form-select"
				bind:value={bookingForm.serviceType}
				onchange={onServiceSelect}
				required
			>
				<option value="">Seleziona un servizio</option>
				{#each services as service}
					<option value={service.name}>{service.name} - €{service.price} ({service.duration} min)</option>
				{/each}
			</select>
		</div>

		{#if slotsLoading}
			<div class="alert alert-info">
				<div class="spinner-border spinner-border-sm me-2" role="status">
					<span class="visually-hidden">Caricamento...</span>
				</div>
				Caricamento orari disponibili...
			</div>
		{:else if availableSlots.length === 0}
			<div class="alert alert-warning">
				<i class="bi bi-exclamation-triangle me-2"></i>
				Nessun orario disponibile per questa data
			</div>
		{:else}
			<div class="mb-3">
				<label for="selectedSlot" class="form-label">
					<strong>Orario</strong>
				</label>
				<select
					id="selectedSlot"
					class="form-select"
					bind:value={bookingForm.selectedSlot}
					required
				>
					<option value="">Seleziona un orario</option>
					{#each availableSlots as slot}
						<option value={slot.time}>
							{slot.time} - {slot.endTime || 'N/A'}
						</option>
					{/each}
				</select>
			</div>

			{#if bookingForm.serviceType}
				<div class="alert alert-light">
					<div class="row">
						<div class="col-6">
							<small class="text-muted">Durata</small>
							<strong>{bookingForm.duration} minuti</strong>
						</div>
						<div class="col-6 text-end">
							<small class="text-muted">Prezzo</small>
							<strong>€{bookingForm.totalPrice.toFixed(2)}</strong>
						</div>
					</div>
				</div>
			{/if}
		{/if}
	{/if}
</Modal>

{#if toastMessage}
	<Toast message={toastMessage} type={toastType} />
{/if}

<style>
	.transition {
		transition: all 0.3s ease;
	}

	.card:hover {
		transform: translateY(-5px);
		box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.15) !important;
	}
</style>
