<script lang="ts">
	import { apiCall } from '$lib/api-client';
	import BarberLayout from '$lib/components/BarberLayout.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Toast from '$lib/components/Toast.svelte';

	let { data } = $props();

	let barber = $state({ ...data.barber });
	let editing = $state(false);
	let saving = $state(false);
	let toastMessage = $state('');
	let toastType: 'success' | 'danger' | 'warning' | 'info' = $state('info');

	let name = $state(data.barber.name || '');
	let email = $state(data.barber.email || '');
	let phone = $state(data.barber.phone || '');
	let bio = $state(data.barber.bio || '');
	let specializations = $state((data.barber.specializations || []).join(', '));

	let showPasswordModal = $state(false);
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	function cancelEdit() {
		editing = false;
		name = barber.name || '';
		email = barber.email || '';
		phone = barber.phone || '';
		bio = barber.bio || '';
		specializations = (barber.specializations || []).join(', ');
	}

	async function handleSaveProfile(e: Event) {
		e.preventDefault();
		if (!name || !email) {
			toastMessage = 'Nome ed email sono obbligatori';
			toastType = 'warning';
			return;
		}

		saving = true;
		try {
			const specs = specializations
				.split(',')
				.map((s: string) => s.trim())
				.filter(Boolean);

			const result = await apiCall(`/barbers/${barber._id}`, {
				method: 'PUT',
				body: JSON.stringify({ name, email, phone, bio, specializations: specs })
			});

			if (result.success) {
				toastMessage = 'Profilo aggiornato con successo!';
				toastType = 'success';
				editing = false;
				barber = { ...barber, name, email, phone, bio, specializations: specs };
			} else {
				toastMessage = result.error || "Errore nell'aggiornamento";
				toastType = 'danger';
			}
		} catch {
			toastMessage = "Errore nell'aggiornamento del profilo";
			toastType = 'danger';
		} finally {
			saving = false;
		}
	}

	async function handleChangePassword(e: Event) {
		e.preventDefault();
		if (!currentPassword || !newPassword || !confirmPassword) {
			toastMessage = 'Compila tutti i campi';
			toastType = 'warning';
			return;
		}
		if (newPassword !== confirmPassword) {
			toastMessage = 'Le password non corrispondono';
			toastType = 'danger';
			return;
		}
		if (newPassword.length < 6) {
			toastMessage = 'La password deve avere almeno 6 caratteri';
			toastType = 'warning';
			return;
		}

		saving = true;
		try {
			const result = await apiCall(`/barbers/${barber._id}/change-password`, {
				method: 'POST',
				body: JSON.stringify({ currentPassword, newPassword })
			});

			if (result.success) {
				toastMessage = 'Password modificata con successo!';
				toastType = 'success';
				showPasswordModal = false;
				currentPassword = '';
				newPassword = '';
				confirmPassword = '';
			} else {
				toastMessage = result.error || 'Errore nella modifica della password';
				toastType = 'danger';
			}
		} catch {
			toastMessage = 'Errore nella modifica della password';
			toastType = 'danger';
		} finally {
			saving = false;
		}
	}
</script>

<BarberLayout barberName={barber.name}>
	<div class="container-fluid p-4">
		<div class="mb-4">
			<h1 class="h3 mb-1">
				<i class="bi bi-person-circle me-2"></i>Il mio Profilo
			</h1>
			<p class="text-muted">Gestisci le tue informazioni personali</p>
		</div>

		<div class="row">
			<div class="col-lg-8">
				<div class="card border-0 shadow-sm">
					<div class="card-header bg-light d-flex justify-content-between align-items-center">
						<h5 class="mb-0">
							<i class="bi bi-person-badge me-2"></i>Dati Personali
						</h5>
						{#if !editing}
							<button class="btn btn-sm btn-primary" onclick={() => (editing = true)}>
								<i class="bi bi-pencil me-1"></i>Modifica
							</button>
						{/if}
					</div>

					<div class="card-body p-4">
						{#if !editing}
							<!-- View mode -->
							<div class="row g-3">
								<div class="col-md-6">
									<label class="text-muted small fw-semibold">Nome</label>
									<p class="mb-0 fw-semibold">{name}</p>
								</div>
								<div class="col-md-6">
									<label class="text-muted small fw-semibold">Email</label>
									<p class="mb-0">{email}</p>
								</div>
								<div class="col-md-6">
									<label class="text-muted small fw-semibold">Telefono</label>
									<p class="mb-0">{phone || 'Non specificato'}</p>
								</div>
								<div class="col-md-6">
									<label class="text-muted small fw-semibold">Specializzazioni</label>
									<p class="mb-0">
										{#if barber.specializations?.length}
											{#each barber.specializations as spec}
												<span class="badge bg-primary me-1">{spec}</span>
											{/each}
										{:else}
											<span class="text-muted">Non specificate</span>
										{/if}
									</p>
								</div>
								<div class="col-12">
									<label class="text-muted small fw-semibold">Biografia</label>
									<p class="mb-0">{bio || 'Non specificata'}</p>
								</div>
							</div>

							<hr class="my-4" />

							<button class="btn btn-warning" onclick={() => (showPasswordModal = true)}>
								<i class="bi bi-lock me-1"></i>Cambia Password
							</button>
						{:else}
							<!-- Edit mode -->
							<form onsubmit={handleSaveProfile}>
								<div class="row g-3 mb-3">
									<div class="col-md-6">
										<label for="profName" class="form-label fw-semibold">Nome</label>
										<input
											type="text"
											id="profName"
											class="form-control"
											bind:value={name}
											required
										/>
									</div>
									<div class="col-md-6">
										<label for="profEmail" class="form-label fw-semibold">Email</label>
										<input
											type="email"
											id="profEmail"
											class="form-control"
											bind:value={email}
											required
										/>
									</div>
									<div class="col-md-6">
										<label for="profPhone" class="form-label fw-semibold">Telefono</label>
										<input
											type="tel"
											id="profPhone"
											class="form-control"
											bind:value={phone}
										/>
									</div>
									<div class="col-md-6">
										<label for="profSpec" class="form-label fw-semibold">
											Specializzazioni
											<small class="text-muted fw-normal">(separate da virgola)</small>
										</label>
										<input
											type="text"
											id="profSpec"
											class="form-control"
											bind:value={specializations}
											placeholder="Taglio, Barba, Colore"
										/>
									</div>
									<div class="col-12">
										<label for="profBio" class="form-label fw-semibold">Biografia</label>
										<textarea
											id="profBio"
											class="form-control"
											bind:value={bio}
											rows="3"
										></textarea>
									</div>
								</div>

								<div class="d-flex gap-2">
									<button type="submit" class="btn btn-success" disabled={saving}>
										{#if saving}
											<span
												class="spinner-border spinner-border-sm me-2"
												role="status"
												aria-hidden="true"
											></span>
										{/if}
										Salva
									</button>
									<button
										type="button"
										class="btn btn-secondary"
										onclick={cancelEdit}
										disabled={saving}
									>
										Annulla
									</button>
								</div>
							</form>
						{/if}
					</div>
				</div>
			</div>

			<!-- Info card -->
			<div class="col-lg-4 mt-3 mt-lg-0">
				<div class="card border-0 shadow-sm">
					<div class="card-body p-4 text-center">
						<div
							class="rounded-circle d-inline-flex align-items-center justify-content-center text-dark fw-bold mb-3"
							style="width:72px;height:72px;background:#ffc107;font-size:2rem"
						>
							{name[0]?.toUpperCase() ?? 'B'}
						</div>
						<h5 class="mb-0">{name}</h5>
						<p class="text-muted small mb-3">{email}</p>
						{#if barber.hourlyRate}
							<div class="badge bg-light text-dark border fs-6 mb-2">
								€{barber.hourlyRate}/h
							</div>
						{/if}
						{#if barber.isActive !== undefined}
							<div>
								<span class="badge {barber.isActive ? 'bg-success' : 'bg-secondary'}">
									{barber.isActive ? 'Attivo' : 'Non attivo'}
								</span>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</BarberLayout>

<!-- Change Password Modal -->
<Modal
	id="changePasswordModal"
	title="Cambia Password"
	visible={showPasswordModal}
	onClose={() => (showPasswordModal = false)}
	onSubmit={handleChangePassword}
	isLoading={saving}
>
	<div class="mb-3">
		<label for="currentPassword" class="form-label">Password Attuale</label>
		<input
			type="password"
			id="currentPassword"
			class="form-control"
			bind:value={currentPassword}
			required
		/>
	</div>
	<div class="mb-3">
		<label for="newPassword" class="form-label">Nuova Password</label>
		<input
			type="password"
			id="newPassword"
			class="form-control"
			bind:value={newPassword}
			required
		/>
	</div>
	<div class="mb-3">
		<label for="confirmPassword" class="form-label">Conferma Password</label>
		<input
			type="password"
			id="confirmPassword"
			class="form-control"
			bind:value={confirmPassword}
			required
		/>
	</div>
</Modal>

{#if toastMessage}
	<Toast message={toastMessage} type={toastType} />
{/if}
