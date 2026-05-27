<script lang="ts">
	import { onMount } from 'svelte';
	import Layout from '$lib/components/Layout.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { exportToCSV, getAdminUsers, createAdminUser, deleteAdminUser } from '$lib/api-client';
	import { toast } from '$lib/stores/toast';
	import { formatDate } from '$lib/utils';

	interface UserRecord {
		_id: string;
		name: string;
		username: string;
		email?: string;
		phone: string;
		appointments: string[];
		createdAt?: string;
	}

	let usersList: UserRecord[] = $state([]);
	let loading: boolean = $state(true);
	let error: string | null = $state(null);

	let showModal: boolean = $state(false);
	let searchQuery: string = $state('');

	let formData = $state({ name: '', username: '', email: '', phone: '', password: '' });

	let filteredUsers = $derived(
		usersList.filter(
			(u) =>
				u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(u.email ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
				u.phone.includes(searchQuery)
		)
	);

	onMount(loadUsers);

	async function loadUsers() {
		loading = true;
		error = null;
		const res = await getAdminUsers();
		if (res.success) {
			usersList = (res.data as UserRecord[]) || [];
		} else {
			error = res.error || 'Errore nel caricamento utenti';
		}
		loading = false;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		const { name, username, phone, password } = formData;

		if (!name || !username || !phone || !password) {
			toast.warning('Nome, username, telefono e password sono obbligatori');
			return;
		}
		if (password.length < 6) {
			toast.warning('Password minimo 6 caratteri');
			return;
		}

		const res = await createAdminUser({
			name: formData.name,
			username: formData.username,
			email: formData.email || undefined,
			phone: formData.phone,
			password: formData.password
		});
		if (res.success) {
			toast.success('Utente creato con successo!');
			showModal = false;
			formData = { name: '', username: '', email: '', phone: '', password: '' };
			await loadUsers();
		} else {
			toast.error(res.error || 'Errore nella creazione');
		}
	}

	async function handleDelete(id: string, name: string) {
		if (!confirm(`Eliminare l'utente "${name}"?`)) return;
		const res = await deleteAdminUser(id);
		if (res.success) {
			toast.success('Utente eliminato');
			await loadUsers();
		} else {
			toast.error(res.error || 'Errore nella cancellazione');
		}
	}

	function handleExport() {
		if (usersList.length === 0) {
			toast.warning('Nessun dato da esportare');
			return;
		}
		const data = usersList.map((u) => ({
			Nome: u.name,
			Username: u.username,
			Email: u.email || '-',
			Telefono: u.phone,
			Prenotazioni: u.appointments?.length ?? 0,
			Registrato: formatDate(u.createdAt)
		}));
		exportToCSV(data, 'utenti');
		toast.success('Dati esportati!');
	}
</script>

<Layout>
	<div class="container-fluid">
		<div class="d-flex justify-content-between align-items-center mb-4">
			<div>
				<h1 class="h3 mb-1">
					<i class="bi bi-people me-2"></i>Utenti
				</h1>
				<p class="text-muted">Gestisci gli account clienti</p>
			</div>
			<div class="d-flex gap-2">
				<button class="btn btn-primary" onclick={() => (showModal = true)}>
					<i class="bi bi-plus me-2"></i>Nuovo Utente
				</button>
				<button class="btn btn-outline-secondary" onclick={handleExport}>
					<i class="bi bi-download me-2"></i>Esporta
				</button>
			</div>
		</div>

		<!-- Search -->
		<div class="mb-3">
			<input
				type="search"
				class="form-control"
				placeholder="Cerca per nome, email o telefono..."
				bind:value={searchQuery}
			/>
		</div>

		{#if loading}
			<LoadingSpinner />
		{:else if error}
			<ErrorAlert message={error} onRetry={loadUsers} />
		{:else}
			<div class="card">
				<div class="card-body p-0">
					{#if filteredUsers.length === 0}
						<EmptyState
							icon="bi-people"
							message={searchQuery
								? 'Nessun utente trovato per la ricerca'
								: 'Nessun utente registrato'}
						>
							{#snippet action()}
								{#if !searchQuery}
									<button class="btn btn-primary" onclick={() => (showModal = true)}>
										<i class="bi bi-plus me-2"></i>Aggiungi il primo utente
									</button>
								{/if}
							{/snippet}
						</EmptyState>
					{:else}
						<div class="table-responsive">
							<table class="table table-hover mb-0">
								<thead class="table-light">
									<tr>
										<th>Nome</th>
										<th>Username</th>
										<th>Email</th>
										<th>Telefono</th>
										<th>Prenotazioni</th>
										<th>Registrato</th>
										<th></th>
									</tr>
								</thead>
								<tbody>
									{#each filteredUsers as user}
										<tr>
											<td>
												<div class="d-flex align-items-center gap-2">
													<div
														class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
														style="width:36px;height:36px;font-size:.9rem;flex-shrink:0"
													>
														{user.name[0].toUpperCase()}
													</div>
													{user.name}
												</div>
											</td>
											<td>{user.username}</td>
											<td>{user.email || '-'}</td>
											<td>{user.phone}</td>
											<td>
												<span class="badge bg-secondary">{user.appointments?.length ?? 0}</span>
											</td>
											<td>{formatDate(user.createdAt)}</td>
											<td>
												<button
													class="btn btn-sm btn-outline-danger"
													onclick={() => handleDelete(user._id, user.name)}
												>
													<i class="bi bi-trash"></i>
												</button>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						<div class="p-3 text-muted small border-top">
							{filteredUsers.length} utent{filteredUsers.length === 1 ? 'e' : 'i'}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<Modal
		id="userModal"
		title="Nuovo Utente"
		visible={showModal}
		onClose={() => {
			showModal = false;
			formData = { name: '', username: '', email: '', phone: '', password: '' };
		}}
		onSubmit={handleSubmit}
	>
		<div class="row">
			<div class="col-md-6 mb-3">
				<label for="userName" class="form-label">Nome</label>
				<input
					type="text"
					id="userName"
					class="form-control"
					bind:value={formData.name}
					required
				/>
			</div>
			<div class="col-md-6 mb-3">
				<label for="userUsername" class="form-label">Username</label>
				<input
					type="text"
					id="userUsername"
					class="form-control"
					bind:value={formData.username}
					autocomplete="off"
					required
				/>
				<div class="form-text">Identificativo univoco per l'accesso.</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-6 mb-3">
				<label for="userEmail" class="form-label">Email <span class="text-muted">(opzionale)</span></label>
				<input
					type="email"
					id="userEmail"
					class="form-control"
					bind:value={formData.email}
				/>
			</div>
			<div class="col-md-6 mb-3">
				<label for="userPhone" class="form-label">Telefono</label>
				<input
					type="tel"
					id="userPhone"
					class="form-control"
					bind:value={formData.phone}
					required
				/>
			</div>
			<div class="col-md-6 mb-3">
				<label for="userPassword" class="form-label">Password</label>
				<input
					type="password"
					id="userPassword"
					class="form-control"
					bind:value={formData.password}
					placeholder="Minimo 6 caratteri"
					required
				/>
			</div>
		</div>
	</Modal>
</Layout>
