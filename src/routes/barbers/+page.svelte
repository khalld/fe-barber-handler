<script lang="ts">
	import { onMount } from 'svelte';
	import Layout from '$lib/components/Layout.svelte';
	import BarberCard from '$lib/components/BarberCard.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { barbers } from '$lib/stores';
	import {
		getBarbers,
		createBarber,
		updateBarber,
		deleteBarber,
		exportToCSV
	} from '$lib/api-client';
	import type { IBarber } from '$lib/types';

	let barbersList: IBarber[] = $state([]);
	let loading: boolean = $state(true);
	let error: string | null = $state(null);
	let toastMessage: string | null = $state(null);
	let toastType: 'success' | 'danger' | 'warning' | 'info' = $state('info');

	let showModal: boolean = $state(false);
	let editingBarber: IBarber | null = $state(null);
	let formData = $state({
		name: '',
		username: '',
		email: '',
		phone: '',
		password: '',
		specializations: [] as string[],
		bio: '',
		hourlyRate: 25,
		workingHours: {
			monday: { start: '09:00', end: '19:00' },
			tuesday: { start: '09:00', end: '19:00' },
			wednesday: { start: '09:00', end: '19:00' },
			thursday: { start: '09:00', end: '19:00' },
			friday: { start: '09:00', end: '19:00' },
			saturday: { start: '09:00', end: '14:00' },
			sunday: { start: '', end: '' }
		}
	});

	let specializationInput: string = $state('');

	onMount(async () => {
		loading = true;
		const result = await getBarbers();

		if (result.success) {
			barbersList = result.data || [];
			barbers.setItems(barbersList);
		} else {
			error = result.error ?? null;
		}

		loading = false;
	});

	async function handleSubmit(e: any) {
		const formDataObj = new FormData(e.target);
		const data: any = {
			name: formDataObj.get('name'),
			username: formDataObj.get('username'),
			email: formDataObj.get('email') || undefined,
			phone: formDataObj.get('phone'),
			specializations: formData.specializations,
			bio: formDataObj.get('bio'),
			hourlyRate: parseFloat(formDataObj.get('hourlyRate') as string),
			workingHours: formData.workingHours,
			isActive: true
		};

		// Password è obbligatoria solo alla creazione
		if (!editingBarber) {
			const password = formDataObj.get('password') as string;
			if (!password || password.length < 6) {
				toastMessage = 'La password deve avere almeno 6 caratteri';
				toastType = 'warning';
				return;
			}
			data.password = password;
		}

		let result;
		if (editingBarber?._id) {
			result = await updateBarber(editingBarber._id, data);
		} else {
			result = await createBarber(data);
		}

		if (result.success) {
			toastMessage = editingBarber ? 'Barbiere aggiornato!' : 'Barbiere creato!';
			toastType = 'success';
			showModal = false;
			editingBarber = null;
			const barbersResult = await getBarbers();
			if (barbersResult.success) {
				barbersList = barbersResult.data || [];
				barbers.setItems(barbersList);
			}
		} else {
			toastMessage = result.error ?? null;
			toastType = 'danger';
		}
	}

	async function handleDeleteBarber(id: string) {
		if (!confirm('Disattivare il barbiere?')) return;

		const result = await deleteBarber(id);
		if (result.success) {
			toastMessage = 'Barbiere disattivato!';
			toastType = 'success';
			const barbersResult = await getBarbers();
			if (barbersResult.success) {
				barbersList = barbersResult.data || [];
				barbers.setItems(barbersList);
			}
		} else {
			toastMessage = result.error ?? null;
			toastType = 'danger';
		}
	}

	function openModal(barber?: IBarber) {
		editingBarber = barber || null;
		if (barber) {
			formData = {
				name: barber.name,
				username: barber.username,
				email: barber.email || '',
				password: '',
				phone: barber.phone || '',
				specializations: [...(barber.specializations || [])],
				bio: barber.bio || '',
				hourlyRate: barber.hourlyRate,
				workingHours: (barber.workingHours as typeof formData.workingHours) || formData.workingHours
			};
		} else {
			formData = {
				name: '',
				username: '',
				email: '',
				phone: '',
				password: '',
				specializations: [],
				bio: '',
				hourlyRate: 25,
				workingHours: {
					monday: { start: '09:00', end: '19:00' },
					tuesday: { start: '09:00', end: '19:00' },
					wednesday: { start: '09:00', end: '19:00' },
					thursday: { start: '09:00', end: '19:00' },
					friday: { start: '09:00', end: '19:00' },
					saturday: { start: '09:00', end: '14:00' },
					sunday: { start: '', end: '' }
				}
			};
		}
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingBarber = null;
		specializationInput = '';
	}

	function handleExport() {
		if (barbersList.length === 0) {
			toastMessage = 'Nessun dato da esportare';
			toastType = 'warning';
			return;
		}

		const exportData = barbersList.map(b => ({
			Nome: b.name,
			Username: b.username,
			Email: b.email || '-',
			Telefono: b.phone || '-',
			Specializzazioni: b.specializations?.join(', ') || '-',
			Stato: b.isActive ? 'Attivo' : 'Disattivo'
		}));

		exportToCSV(exportData, 'barbieri');
		toastMessage = 'Dati esportati con successo!';
		toastType = 'success';
	}

	function addSpecialization() {
		if (specializationInput && !formData.specializations.includes(specializationInput)) {
			formData.specializations = [...formData.specializations, specializationInput];
			specializationInput = '';
		}
	}

	function removeSpecialization(spec: string) {
		formData.specializations = formData.specializations.filter(s => s !== spec);
	}
</script>

<Layout>
	<div class="container-fluid">
		<div class="d-flex justify-content-between align-items-center mb-4">
			<div>
				<h1 class="h3 mb-1">
					<i class="bi bi-person-badge me-2"></i>
					Barbieri
				</h1>
				<p class="text-muted">Gestisci i tuoi operatori</p>
			</div>
			<div class="d-flex gap-2">
				<button class="btn btn-primary" onclick={() => openModal()}>
					<i class="bi bi-plus me-2"></i>
					Nuovo Barbiere
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
			<div class="row">
				{#each barbersList as barber}
					<div class="col-md-6 col-lg-4 mb-4">
						<BarberCard
							{barber}
							onEdit={openModal}
							onDelete={handleDeleteBarber}
						/>
					</div>
				{/each}
			</div>
			{#if barbersList.length === 0}
				<div class="text-center py-5">
					<p class="text-muted mb-3">Nessun barbiere trovato</p>
					<button class="btn btn-primary" onclick={() => openModal()}>
						<i class="bi bi-plus me-2"></i>
						Aggiungi il primo barbiere
					</button>
				</div>
			{/if}
		{/if}
	</div>

	<!-- Modal -->
	<Modal
		id="barberModal"
		title={editingBarber ? 'Modifica Barbiere' : 'Nuovo Barbiere'}
		visible={showModal}
		onClose={closeModal}
		onSubmit={handleSubmit}
	>
		<div class="row">
			<div class="col-md-6 mb-3">
				<label for="name" class="form-label">Nome</label>
				<input
					type="text"
					id="name"
					name="name"
					class="form-control"
					bind:value={formData.name}
					required
				/>
			</div>
			<div class="col-md-6 mb-3">
				<label for="username" class="form-label">Username</label>
				<input
					type="text"
					id="username"
					name="username"
					class="form-control"
					bind:value={formData.username}
					autocomplete="off"
					required
				/>
				<div class="form-text">Identificativo univoco per l'accesso.</div>
			</div>
		</div>

		<div class="mb-3">
			<label for="email" class="form-label">Email <span class="text-muted">(opzionale)</span></label>
			<input
				type="email"
				id="email"
				name="email"
				class="form-control"
				bind:value={formData.email}
			/>
		</div>

		{#if !editingBarber}
			<div class="mb-3">
				<label for="password" class="form-label">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					class="form-control"
					bind:value={formData.password}
					placeholder="Minimo 6 caratteri"
					required
				/>
				<div class="form-text">Il barbiere userà questa password per accedere.</div>
			</div>
		{/if}

		<div class="row">
			<div class="col-md-6 mb-3">
				<label for="phone" class="form-label">Telefono</label>
				<input
					type="tel"
					id="phone"
					name="phone"
					class="form-control"
					bind:value={formData.phone}
				/>
			</div>
			<div class="col-md-6 mb-3">
				<label for="hourlyRate" class="form-label">Tariffa Oraria (€)</label>
				<input
					type="number"
					id="hourlyRate"
					name="hourlyRate"
					class="form-control"
					bind:value={formData.hourlyRate}
					min="0"
					step="0.01"
					required
				/>
			</div>
		</div>

		<div class="mb-3">
			<label for="bio" class="form-label">Biografia</label>
			<textarea
				id="bio"
				name="bio"
				class="form-control"
				bind:value={formData.bio}
				rows="3"
			></textarea>
		</div>

		<div class="mb-3">
			<label class="form-label">Specializzazioni</label>
			<div class="input-group mb-2">
				<input
					type="text"
					class="form-control"
					bind:value={specializationInput}
					placeholder="es. Taglio, Barba, Colore"
					onkeypress={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							addSpecialization();
						}
					}}
				/>
				<button
					type="button"
					class="btn btn-outline-secondary"
					onclick={addSpecialization}
				>
					Aggiungi
				</button>
			</div>
			<div>
				{#each formData.specializations as spec}
					<span class="badge bg-primary me-1 mb-1">
						{spec}
						<button
							type="button"
							class="btn-close btn-close-white ms-1"
							onclick={() => removeSpecialization(spec)}
							style="font-size: 0.6rem;"
						></button>
					</span>
				{/each}
			</div>
		</div>

		<!-- Working Hours -->
		<div class="mb-3">
			<label class="form-label">Orari di Lavoro</label>
			<div class="table-responsive">
				<table class="table table-sm">
					<thead>
						<tr>
							<th>Giorno</th>
							<th>Inizio</th>
							<th>Fine</th>
						</tr>
					</thead>
					<tbody>
						{#each ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as Array<keyof typeof formData.workingHours> as day}
							<tr>
								<td>
									{['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'][
										['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].indexOf(
											day
										)
									]}
								</td>
								<td>
									<input
										type="time"
										class="form-control form-control-sm"
										bind:value={formData.workingHours[day].start}
									/>
								</td>
								<td>
									<input
										type="time"
										class="form-control form-control-sm"
										bind:value={formData.workingHours[day].end}
									/>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</Modal>

	<Toast message={toastMessage} type={toastType} />
</Layout>
