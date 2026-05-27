<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import ClientLayout from '$lib/components/ClientLayout.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { createUserAppointment } from '$lib/api-client';

	let booking: any = $state(null);
	let userId: string = $state('');
	let userName: string = $state('');
	let userEmail: string = $state('');
	let userPhone: string = $state('');
	let loading: boolean = $state(false);
	let toastMessage: string = $state('');
	let toastType: 'success' | 'danger' | 'warning' | 'info' = $state('info');

	// Form edit
	let editedData = $state({
		name: '',
		email: '',
		phone: ''
	});

	onMount(() => {
		// Check if user is logged in
		const storedUserId = localStorage.getItem('userId');
		if (!storedUserId) {
			goto('/client/login');
			return;
		}

		userId = storedUserId;
		userName = localStorage.getItem('userName') || '';
		userEmail = localStorage.getItem('userEmail') || '';
		userPhone = '';

		// Get pending booking data
		const pendingBooking = localStorage.getItem('pendingBooking');
		if (!pendingBooking) {
			toastMessage = 'Nessuna prenotazione in sospeso';
			toastType = 'warning';
			setTimeout(() => goto('/client/barbers'), 2000);
			return;
		}

		booking = JSON.parse(pendingBooking);

		// Populate form with user data
		editedData = {
			name: userName,
			email: userEmail,
			phone: userPhone
		};
	});

	async function handleConfirmBooking() {
		if (!editedData.name || !editedData.phone) {
			toastMessage = 'Nome e telefono sono obbligatori';
			toastType = 'warning';
			return;
		}

		loading = true;

		try {
			// Format datetime
			const dateTime = new Date(booking.selectedDate + 'T' + booking.selectedSlot);

			const result = await createUserAppointment({
				userId,
				barberId: booking.barberId,
				clientName: editedData.name,
				clientEmail: editedData.email,
				clientPhone: editedData.phone,
				serviceType: booking.serviceType,
				duration: booking.duration,
				dateTime: dateTime.toISOString(),
				totalPrice: booking.totalPrice
			});

			if (result.success) {
				// Clear pending booking
				localStorage.removeItem('pendingBooking');

				toastMessage = 'Prenotazione confermata!';
				toastType = 'success';

				setTimeout(() => {
					goto('/client/appointments');
				}, 1500);
			} else {
				toastMessage = result.error || 'Errore nella prenotazione';
				toastType = 'danger';
			}
		} catch (error) {
			console.error('Booking error:', error);
			toastMessage = 'Errore durante la prenotazione';
			toastType = 'danger';
		} finally {
			loading = false;
		}
	}

	function goBack() {
		goto('/client/barbers');
	}
</script>

<ClientLayout>
	<div class="container py-4">
		{#if booking}
			<div class="row justify-content-center">
				<div class="col-lg-8">
					<!-- Booking Summary -->
					<div class="card shadow-sm border-0 mb-4">
						<div class="card-header bg-primary text-white">
							<h5 class="mb-0">
								<i class="bi bi-check-circle me-2"></i>
								Riepilogo Prenotazione
							</h5>
						</div>
						<div class="card-body">
							<div class="row g-4">
								<div class="col-md-6">
									<div class="mb-3">
										<small class="text-muted">Barbiere</small>
										<h6 class="mb-0">{booking.barberName}</h6>
									</div>
									<div class="mb-3">
										<small class="text-muted">Data</small>
										<h6 class="mb-0">{new Date(booking.selectedDate).toLocaleDateString('it-IT')}</h6>
									</div>
									<div class="mb-3">
										<small class="text-muted">Orario</small>
										<h6 class="mb-0">{booking.selectedSlot}</h6>
									</div>
								</div>
								<div class="col-md-6">
									<div class="mb-3">
										<small class="text-muted">Servizio</small>
										<h6 class="mb-0">{booking.serviceType}</h6>
									</div>
									<div class="mb-3">
										<small class="text-muted">Durata</small>
										<h6 class="mb-0">{booking.duration} minuti</h6>
									</div>
									<div class="mb-3">
										<small class="text-muted">Prezzo</small>
										<h6 class="mb-0 text-success"><strong>€{booking.totalPrice.toFixed(2)}</strong></h6>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Personal Details Form -->
					<div class="card shadow-sm border-0 mb-4">
						<div class="card-header bg-light">
							<h5 class="mb-0">
								<i class="bi bi-person me-2"></i>
								Dati Personali
							</h5>
						</div>
						<div class="card-body">
							<div class="mb-3">
								<label for="name" class="form-label">Nome Completo</label>
								<input
									type="text"
									id="name"
									class="form-control"
									bind:value={editedData.name}
									required
								/>
							</div>
							<div class="mb-3">
								<label for="email" class="form-label">Email <span class="text-muted">(opzionale)</span></label>
								<input
									type="email"
									id="email"
									class="form-control"
									bind:value={editedData.email}
								/>
							</div>
							<div class="mb-3">
								<label for="phone" class="form-label">Telefono</label>
								<input
									type="tel"
									id="phone"
									class="form-control"
									bind:value={editedData.phone}
									required
								/>
							</div>
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="d-flex gap-3 mb-4">
						<button
							class="btn btn-primary btn-lg flex-grow-1"
							onclick={handleConfirmBooking}
							disabled={loading}
						>
							{#if loading}
								<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
								Elaborazione...
							{:else}
								<i class="bi bi-check-circle me-2"></i>
								Conferma Prenotazione
							{/if}
						</button>
						<button
							class="btn btn-outline-secondary btn-lg"
							onclick={goBack}
							disabled={loading}
						>
							<i class="bi bi-arrow-left me-2"></i>
							Indietro
						</button>
					</div>

					<!-- Info -->
					<div class="alert alert-info">
						<i class="bi bi-info-circle me-2"></i>
						<strong>Nota:</strong> La prenotazione è in sospeso finché il barbiere non la conferma.
						Riceverai una conferma via email.
					</div>
				</div>
			</div>
		{/if}
	</div>
</ClientLayout>

{#if toastMessage}
	<Toast message={toastMessage} type={toastType} />
{/if}

<style>
	:global(body) {
		background-color: #f8f9fa;
	}
</style>
