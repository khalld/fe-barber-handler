<script lang="ts">
	import { onMount } from 'svelte';
	import Layout from '$lib/components/Layout.svelte';
	import AppointmentRow from '$lib/components/AppointmentRow.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { appointments, barbers } from '$lib/stores';
	import {
		getAppointments,
		getBarbers,
		createAppointment,
		updateAppointment,
		completeAppointment,
		cancelAppointment,
		getBarberAvailability,
		exportToCSV
	} from '$lib/api-client';
	import type { IAppointment, IBarber } from '$lib/types';

	let appointmentsList: IAppointment[] = $state([]);
	let barbersList: IBarber[] = $state([]);
	let loading: boolean = $state(true);
	let error: string | null = $state(null);
	let toastMessage: string | null = $state(null);
	let toastType: 'success' | 'danger' | 'warning' | 'info' = $state('info');

	let showModal: boolean = $state(false);
	let editingAppointment: IAppointment | null = $state(null);
	let formData = $state({
		barberId: '',
		clientName: '',
		clientEmail: '',
		clientPhone: '',
		service: '',
		duration: 30,
		startTime: '',
		price: 0
	});

	let availableSlots: any[] = $state([]);
	let selectedDate = $state(new Date().toISOString().split('T')[0]);

	onMount(async () => {
		loading = true;
		const [aptsResult, barbersResult] = await Promise.all([
			getAppointments(),
			getBarbers()
		]);

		if (aptsResult.success) {
			appointmentsList = aptsResult.data || [];
			appointments.setItems(appointmentsList);
		} else {
			error = aptsResult.error ?? null;
		}

		if (barbersResult.success) {
			barbersList = barbersResult.data || [];
			barbers.setItems(barbersList);
		}

		loading = false;
	});

	async function loadAvailableSlots() {
		if (!formData.barberId || !selectedDate) return;

		const result = await getBarberAvailability(
			formData.barberId,
			new Date(selectedDate)
		);

		if (result.success) {
			availableSlots = result.data?.availableSlots || [];
		}
	}

	$effect(() => {
		formData.barberId; // Dipendenza
		selectedDate;
		if (formData.barberId && selectedDate) {
			loadAvailableSlots();
		}
	});

	async function handleSubmit(e: any) {
		const formDataObj = new FormData(e.target);
		const data: any = {
			barberId: formDataObj.get('barberId'),
			clientName: formDataObj.get('clientName'),
			clientEmail: formDataObj.get('clientEmail'),
			clientPhone: formDataObj.get('clientPhone'),
			service: formDataObj.get('service'),
			duration: parseInt(formDataObj.get('duration') as string),
			startTime: new Date(formDataObj.get('startTime') as string),
			endTime: new Date(
				new Date(formDataObj.get('startTime') as string).getTime() +
					parseInt(formDataObj.get('duration') as string) * 60000
			),
			price: parseFloat(formDataObj.get('price') as string)
		};

		let result;
		if (editingAppointment?._id) {
			result = await updateAppointment(editingAppointment._id, data);
		} else {
			result = await createAppointment(data);
		}

		if (result.success) {
			toastMessage = editingAppointment ? 'Prenotazione aggiornata!' : 'Prenotazione creata!';
			toastType = 'success';
			showModal = false;
			editingAppointment = null;
			const aptsResult = await getAppointments();
			if (aptsResult.success) {
				appointmentsList = aptsResult.data || [];
				appointments.setItems(appointmentsList);
			}
		} else {
			toastMessage = result.error ?? null;
			toastType = 'danger';
		}
	}

	async function handleCompleteAppointment(id: string) {
		if (!confirm('Completare la prenotazione?')) return;

		const result = await completeAppointment(id);
		if (result.success) {
			toastMessage = 'Prenotazione completata!';
			toastType = 'success';
			const aptsResult = await getAppointments();
			if (aptsResult.success) {
				appointmentsList = aptsResult.data || [];
				appointments.setItems(appointmentsList);
			}
		} else {
			toastMessage = result.error ?? null;
			toastType = 'danger';
		}
	}

	async function handleCancelAppointment(id: string) {
		if (!confirm('Annullare la prenotazione?')) return;

		const result = await cancelAppointment(id);
		if (result.success) {
			toastMessage = 'Prenotazione annullata!';
			toastType = 'success';
			const aptsResult = await getAppointments();
			if (aptsResult.success) {
				appointmentsList = aptsResult.data || [];
				appointments.setItems(appointmentsList);
			}
		} else {
			toastMessage = result.error ?? null;
			toastType = 'danger';
		}
	}

	function handleExport() {
		if (appointmentsList.length === 0) {
			toastMessage = 'Nessun dato da esportare';
			toastType = 'warning';
			return;
		}

		const exportData = appointmentsList.map(a => ({
			Cliente: a.clientName,
			Servizio: a.service,
			Data: new Date(a.startTime).toLocaleDateString('it-IT'),
			Ora: new Date(a.startTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
			Barbiere: barbersList.find(b => b._id === a.barberId)?.name || '-',
			Durata: a.duration + ' min',
			Stato: a.status,
			Prezzo: '€' + a.price.toFixed(2)
		}));

		exportToCSV(exportData, 'prenotazioni');
		toastMessage = 'Dati esportati con successo!';
		toastType = 'success';
	}

	function openModal(apt?: IAppointment) {
		editingAppointment = apt || null;
		if (apt) {
			formData = {
				barberId: apt.barberId as string,
				clientName: apt.clientName,
				clientEmail: apt.clientEmail || '',
				clientPhone: apt.clientPhone,
				service: apt.service,
				duration: apt.duration,
				startTime: new Date(apt.startTime).toISOString().slice(0, 16),
				price: apt.price
			};
		} else {
			formData = {
				barberId: '',
				clientName: '',
				clientEmail: '',
				clientPhone: '',
				service: '',
				duration: 30,
				startTime: '',
				price: 0
			};
		}
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingAppointment = null;
	}
</script>

<Layout>
	<div class="container-fluid">
		<div class="d-flex justify-content-between align-items-center mb-4">
			<div>
				<h1 class="h3 mb-1">
					<i class="bi bi-calendar-check me-2"></i>
					Prenotazioni
				</h1>
				<p class="text-muted">Gestisci tutte le prenotazioni</p>
			</div>
			<div class="d-flex gap-2">
				<button class="btn btn-primary" onclick={() => openModal()}>
					<i class="bi bi-plus me-2"></i>
					Nuova Prenotazione
				</button>
				<button class="btn btn-outline-secondary" onclick={handleExport}>
					<i class="bi bi-download me-2"></i>
					Esporta
				</button>
			</div>
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
		{:else}
			<div class="card">
				<div class="table-responsive">
					<table class="table table-hover mb-0">
						<thead class="table-light">
							<tr>
								<th>Cliente</th>
								<th>Servizio</th>
								<th>Data e Ora</th>
								<th>Stato</th>
								<th>Prezzo</th>
								<th>Azioni</th>
							</tr>
						</thead>
						<tbody>
							{#each appointmentsList as apt}
								<AppointmentRow
									appointment={apt}
									onEdit={openModal}
									onComplete={handleCompleteAppointment}
									onCancel={handleCancelAppointment}
								/>
							{/each}
						</tbody>
					</table>
				</div>
				{#if appointmentsList.length === 0}
					<div class="text-center py-5">
						<p class="text-muted">Nessuna prenotazione trovata</p>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Modal -->
	<Modal
		id="appointmentModal"
		title={editingAppointment ? 'Modifica Prenotazione' : 'Nuova Prenotazione'}
		visible={showModal}
		onClose={closeModal}
		onSubmit={handleSubmit}
	>
		<div class="mb-3">
			<label for="barberId" class="form-label">Barbiere</label>
			<select
				id="barberId"
				name="barberId"
				class="form-select"
				bind:value={formData.barberId}
				required
			>
				<option value="">Seleziona un barbiere</option>
				{#each barbersList as barber}
					<option value={barber._id}>{barber.name}</option>
				{/each}
			</select>
		</div>

		<div class="row">
			<div class="col-md-6 mb-3">
				<label for="clientName" class="form-label">Nome Cliente</label>
				<input
					type="text"
					id="clientName"
					name="clientName"
					class="form-control"
					bind:value={formData.clientName}
					required
				/>
			</div>
			<div class="col-md-6 mb-3">
				<label for="clientPhone" class="form-label">Telefono</label>
				<input
					type="tel"
					id="clientPhone"
					name="clientPhone"
					class="form-control"
					bind:value={formData.clientPhone}
					required
				/>
			</div>
		</div>

		<div class="mb-3">
			<label for="clientEmail" class="form-label">Email (opzionale)</label>
			<input
				type="email"
				id="clientEmail"
				name="clientEmail"
				class="form-control"
				bind:value={formData.clientEmail}
			/>
		</div>

		<div class="row">
			<div class="col-md-6 mb-3">
				<label for="service" class="form-label">Servizio</label>
				<input
					type="text"
					id="service"
					name="service"
					class="form-control"
					bind:value={formData.service}
					placeholder="es. Taglio, Barba"
					required
				/>
			</div>
			<div class="col-md-6 mb-3">
				<label for="duration" class="form-label">Durata (minuti)</label>
				<input
					type="number"
					id="duration"
					name="duration"
					class="form-control"
					bind:value={formData.duration}
					min="15"
					step="15"
					required
				/>
			</div>
		</div>

		<div class="mb-3">
			<label for="date" class="form-label">Data</label>
			<input
				type="date"
				id="date"
				class="form-control"
				bind:value={selectedDate}
				required
			/>
		</div>

		<div class="row">
			<div class="col-md-6 mb-3">
				<label for="startTime" class="form-label">Orario Inizio</label>
				<input
					type="datetime-local"
					id="startTime"
					name="startTime"
					class="form-control"
					bind:value={formData.startTime}
					required
				/>
				{#if availableSlots.length > 0}
					<small class="text-muted d-block mt-2">Slot disponibili:</small>
					<div class="mt-2">
						{#each availableSlots.slice(0, 5) as slot}
							<button
								type="button"
								class="btn btn-sm btn-outline-primary me-1 mb-1"
								onclick={() => {
									formData.startTime = slot.start.slice(0, 16);
								}}
							>
								{new Date(slot.start).toLocaleTimeString('it-IT', {
									hour: '2-digit',
									minute: '2-digit'
								})}
							</button>
						{/each}
					</div>
				{/if}
			</div>
			<div class="col-md-6 mb-3">
				<label for="price" class="form-label">Prezzo (€)</label>
				<input
					type="number"
					id="price"
					name="price"
					class="form-control"
					bind:value={formData.price}
					min="0"
					step="0.01"
					required
				/>
			</div>
		</div>
	</Modal>

	<Toast message={toastMessage} type={toastType} />
</Layout>
