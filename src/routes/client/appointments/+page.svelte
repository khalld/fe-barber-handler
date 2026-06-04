<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import ClientLayout from '$lib/components/ClientLayout.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { getUserAppointments, cancelUserAppointment } from '$lib/api-client';
	import type { IAppointment } from '$lib/types';

	let appointments: IAppointment[] = $state([]);
	let userId: string = $state('');
	let loading: boolean = $state(true);
	let error: string | null = $state(null);
	let toastMessage: string = $state('');
	let toastType: 'success' | 'danger' | 'warning' | 'info' = $state('info');
	let showDetails: boolean = $state(false);
	let selectedAppointment: IAppointment | null = $state(null);

	onMount(async () => {
		// Check if user is logged in
		const storedUserId = localStorage.getItem('userId');
		if (!storedUserId) {
			goto('/client/login');
			return;
		}

		userId = storedUserId;
		loading = true;

		const result = await getUserAppointments(userId);
		if (result.success) {
			appointments = result.data || [];
		} else {
			error = result.error || 'Errore nel caricamento prenotazioni';
		}
		loading = false;
	});

	function showAppointmentDetails(appointment: IAppointment) {
		selectedAppointment = appointment;
		showDetails = true;
	}

	async function handleCancelAppointment(appointmentId: string) {
		if (!confirm('Sei sicuro di voler cancellare questa prenotazione?')) return;

		const result = await cancelUserAppointment(appointmentId, userId);
		if (result.success) {
			toastMessage = 'Prenotazione cancellata!';
			toastType = 'success';

			// Ricarica prenotazioni
			const refreshResult = await getUserAppointments(userId);
			if (refreshResult.success) {
				appointments = refreshResult.data || [];
			}
			showDetails = false;
		} else {
			toastMessage = result.error || 'Errore nella cancellazione';
			toastType = 'danger';
		}
	}

	function getStatusBadgeClass(status: string): string {
		switch (status) {
			case 'confirmed':
				return 'bg-success';
			case 'completed':
				return 'bg-info';
			case 'cancelled':
				return 'bg-danger';
			case 'pending':
			default:
				return 'bg-warning';
		}
	}

	function getStatusLabel(status: string): string {
		switch (status) {
			case 'confirmed':
				return 'Confermata';
			case 'completed':
				return 'Completata';
			case 'cancelled':
				return 'Annullata';
			case 'pending':
			default:
				return 'In attesa';
		}
	}

	function isUpcoming(dateTime: Date): boolean {
		return new Date(dateTime) > new Date();
	}

	function formatDateTime(date: Date | string): string {
		const d = new Date(date);
		return d.toLocaleString('it-IT', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	const upcomingAppointments = $derived(
		appointments.filter(a => isUpcoming(a.startTime))
	);
	const pastAppointments = $derived(
		appointments.filter(a => !isUpcoming(a.startTime))
	);
</script>

<ClientLayout>
	<div class="container-fluid p-4">
		<!-- Header -->
		<div class="mb-4 d-flex justify-content-between align-items-center">
			<div>
				<h1 class="h3 mb-1">
					<i class="bi bi-calendar-check me-2"></i>
					Le Mie Prenotazioni
				</h1>
				<p class="text-muted">Visualizza e gestisci le tue prenotazioni</p>
			</div>
			<a href="/client/barbers" class="btn btn-primary">
				<i class="bi bi-plus me-2"></i>
				Nuova Prenotazione
			</a>
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
		{:else if appointments.length === 0}
			<div class="alert alert-info text-center py-5">
				<i class="bi bi-info-circle me-2"></i>
				<strong>Nessuna prenotazione</strong>
				<p class="mb-0">Prenota il tuo primo slot <a href="/client/barbers">qui</a></p>
			</div>
		{:else}
			<!-- Upcoming Appointments -->
			{#if upcomingAppointments.length > 0}
				<div class="mb-5">
					<h5 class="mb-3">
						<i class="bi bi-clock me-2"></i>
						Prenotazioni in Arrivo
					</h5>
					<div class="row g-3">
						{#each upcomingAppointments as appointment}
							<div class="col-lg-6">
								<div class="card border-left-primary h-100">
									<div class="card-body">
										<div class="d-flex justify-content-between align-items-start mb-3">
											<h6 class="card-title mb-0">{appointment.clientName}</h6>
											<span class="badge {getStatusBadgeClass(appointment.status)}">
												{getStatusLabel(appointment.status)}
											</span>
										</div>

										<div class="mb-3">
											<small class="text-muted d-block">
												<i class="bi bi-scissors me-1"></i>
												{appointment.service}
											</small>
											<small class="text-muted d-block">
												<i class="bi bi-calendar me-1"></i>
												{formatDateTime(appointment.startTime)}
											</small>
											<small class="text-muted d-block">
												<i class="bi bi-hourglass me-1"></i>
												{appointment.duration} minuti
											</small>
										</div>

										<div class="d-flex gap-2">
											<button
												class="btn btn-sm btn-outline-primary flex-grow-1"
												onclick={() => showAppointmentDetails(appointment)}
											>
												<i class="bi bi-eye me-1"></i>
												Dettagli
											</button>
											{#if appointment.status !== 'completed' && appointment.status !== 'cancelled'}
												<button
													class="btn btn-sm btn-outline-danger"
													onclick={() => handleCancelAppointment(appointment._id || '')}
												>
													<i class="bi bi-x"></i>
												</button>
											{/if}
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Past Appointments -->
			{#if pastAppointments.length > 0}
				<div>
					<h5 class="mb-3">
						<i class="bi bi-check-circle me-2"></i>
						Prenotazioni Passate
					</h5>
					<div class="row g-3">
						{#each pastAppointments as appointment}
							<div class="col-lg-6">
								<div class="card border-left-secondary h-100 opacity-75">
									<div class="card-body">
										<div class="d-flex justify-content-between align-items-start mb-3">
											<h6 class="card-title mb-0">{appointment.clientName}</h6>
											<span class="badge {getStatusBadgeClass(appointment.status)}">
												{getStatusLabel(appointment.status)}
											</span>
										</div>

										<div class="mb-3">
											<small class="text-muted d-block">
												<i class="bi bi-scissors me-1"></i>
												{appointment.service}
											</small>
											<small class="text-muted d-block">
												<i class="bi bi-calendar me-1"></i>
												{formatDateTime(appointment.startTime)}
											</small>
											<small class="text-muted d-block">
												<i class="bi bi-hourglass me-1"></i>
												{appointment.duration} minuti
											</small>
										</div>

										<button
											class="btn btn-sm btn-outline-secondary w-100"
											onclick={() => showAppointmentDetails(appointment)}
										>
											<i class="bi bi-eye me-1"></i>
											Dettagli
										</button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	</div>
</ClientLayout>

<!-- Details Modal -->
<Modal
	id="appointmentDetailsModal"
	title="Dettagli Prenotazione"
	visible={showDetails}
	onClose={() => (showDetails = false)}
>
	{#if selectedAppointment}
		<div class="mb-3">
			<small class="text-muted">Cliente</small>
			<h6 class="mb-0">{selectedAppointment.clientName}</h6>
		</div>
		<div class="mb-3">
			<small class="text-muted">Servizio</small>
			<h6 class="mb-0">{selectedAppointment.service}</h6>
		</div>
		<div class="mb-3">
			<small class="text-muted">Data e Ora</small>
			<h6 class="mb-0">{formatDateTime(selectedAppointment.startTime)}</h6>
		</div>
		<div class="mb-3">
			<small class="text-muted">Durata</small>
			<h6 class="mb-0">{selectedAppointment.duration} minuti</h6>
		</div>
		<div class="mb-3">
			<small class="text-muted">Prezzo</small>
			<h6 class="mb-0">€{selectedAppointment.price.toFixed(2)}</h6>
		</div>
		<div class="mb-3">
			<small class="text-muted">Stato</small>
			<h6 class="mb-0">
				<span class="badge {getStatusBadgeClass(selectedAppointment.status)}">
					{getStatusLabel(selectedAppointment.status)}
				</span>
			</h6>
		</div>
		{#if selectedAppointment.notes}
			<div class="mb-3">
				<small class="text-muted">Note</small>
				<p class="mb-0">{selectedAppointment.notes}</p>
			</div>
		{/if}

		{#if selectedAppointment.status !== 'completed' && selectedAppointment.status !== 'cancelled' && isUpcoming(selectedAppointment.startTime)}
			<button
				class="btn btn-danger w-100"
				onclick={() => {
					if (selectedAppointment) {
						handleCancelAppointment(selectedAppointment._id || '');
					}
				}}
			>
				<i class="bi bi-trash me-2"></i>
				Cancella Prenotazione
			</button>
		{/if}
	{/if}
</Modal>

{#if toastMessage}
	<Toast message={toastMessage} type={toastType} />
{/if}

<style>
	.border-left-primary {
		border-left: 4px solid #667eea !important;
	}

	.border-left-secondary {
		border-left: 4px solid #6c757d !important;
	}

	.card {
		transition: all 0.3s ease;
	}

	.card:hover:not(.opacity-75) {
		transform: translateY(-2px);
		box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
	}
</style>
