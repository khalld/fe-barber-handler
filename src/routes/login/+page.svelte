<script lang="ts">
	import { goto } from '$app/navigation';
	import Toast from '$lib/components/Toast.svelte';
	import { apiCall } from '$lib/api-client';
	import { env } from '$env/dynamic/public';

	let identifier = $state('');
	let password = $state('');
	let loading = $state(false);
	let toastMessage = $state('');
	let toastType: 'success' | 'danger' | 'warning' | 'info' = $state('info');
	let loginMode: 'admin' | 'barber' = $state('admin');

	const showDemoPanel =
		!!(env.PUBLIC_DEMO_ADMIN_USERNAME && env.PUBLIC_DEMO_ADMIN_PASSWORD) ||
		!!(env.PUBLIC_DEMO_BARBER_USERNAME && env.PUBLIC_DEMO_BARBER_PASSWORD);

	function fillDemo(mode: 'admin' | 'barber') {
		loginMode = mode;
		if (mode === 'admin') {
			identifier = env.PUBLIC_DEMO_ADMIN_USERNAME ?? '';
			password = env.PUBLIC_DEMO_ADMIN_PASSWORD ?? '';
		} else {
			identifier = env.PUBLIC_DEMO_BARBER_USERNAME ?? '';
			password = env.PUBLIC_DEMO_BARBER_PASSWORD ?? '';
		}
		handleLogin();
	}

	async function handleAdminLogin() {
		if (!identifier || !password) {
			toastMessage = 'Inserisci username e password';
			toastType = 'warning';
			return;
		}
		loading = true;
		try {
			const result = await apiCall('/auth/login', {
				method: 'POST',
				body: JSON.stringify({ username: identifier, password })
			});
			if (result.success) {
				toastMessage = 'Accesso effettuato!';
				toastType = 'success';
				setTimeout(() => goto('/'), 500);
			} else {
				toastMessage = result.error || 'Credenziali non valide';
				toastType = 'danger';
			}
		} finally {
			loading = false;
		}
	}

	async function handleBarberLogin() {
		if (!identifier || !password) {
			toastMessage = 'Inserisci username e password';
			toastType = 'warning';
			return;
		}
		loading = true;
		try {
			const result = await apiCall('/barbers/login', {
				method: 'POST',
				body: JSON.stringify({ username: identifier, password })
			});
			if (result.success) {
				toastMessage = 'Accesso effettuato!';
				toastType = 'success';
				setTimeout(() => goto('/barber-dashboard'), 500);
			} else {
				toastMessage = result.error || 'Credenziali non valide';
				toastType = 'danger';
			}
		} finally {
			loading = false;
		}
	}

	function handleLogin() {
		if (loginMode === 'admin') handleAdminLogin();
		else handleBarberLogin();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') handleLogin();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="app-gradient-bg d-flex align-items-center justify-content-center">
	<div class="container">
		<div class="row justify-content-center g-4">

			<!-- Login card -->
			<div class="col-md-5 col-lg-4">
				<div class="card shadow-lg border-0" style="border-radius:1rem;overflow:hidden">
					<div class="card-body p-5">
						<div class="text-center mb-4">
							<i class="bi bi-scissors" style="font-size:2.5rem;color:#667eea"></i>
							<h1 class="h4 mt-3 mb-1 fw-bold">Gestionale Barbiere</h1>
							<p class="text-muted small">Accedi alla tua area personale</p>
						</div>

						<!-- Mode selector -->
						<div class="btn-group w-100 mb-4" role="group">
							<input
								type="radio"
								class="btn-check"
								name="loginMode"
								id="adminMode"
								value="admin"
								bind:group={loginMode}
							/>
							<label class="btn btn-outline-primary" for="adminMode">
								<i class="bi bi-shield-lock me-1"></i>Admin
							</label>
							<input
								type="radio"
								class="btn-check"
								name="loginMode"
								id="barberMode"
								value="barber"
								bind:group={loginMode}
							/>
							<label class="btn btn-outline-primary" for="barberMode">
								<i class="bi bi-person-badge me-1"></i>Barbiere
							</label>
						</div>

						<!-- Fields -->
						<div class="mb-3">
							<input
								type="text"
								class="form-control form-control-lg mb-3"
								placeholder="Username"
								bind:value={identifier}
								disabled={loading}
								autocomplete="username"
							/>
							<input
								type="password"
								class="form-control form-control-lg"
								placeholder="Password"
								bind:value={password}
								disabled={loading}
								autocomplete="current-password"
							/>
						</div>

						<button
							class="btn btn-primary btn-lg w-100 mb-4"
							onclick={handleLogin}
							disabled={loading}
						>
							{#if loading}
								<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"
								></span>Accesso in corso...
							{:else}
								<i class="bi bi-box-arrow-in-right me-2"></i>Accedi
							{/if}
						</button>

						<div class="border-top pt-3 text-center">
							<p class="text-muted small mb-2">Sei un cliente?</p>
							<a href="/client/login" class="btn btn-outline-secondary btn-sm w-100 mb-2">
								<i class="bi bi-person me-1"></i>Accedi come cliente
							</a>
							<a href="/client/book" class="btn btn-outline-success btn-sm w-100">
								<i class="bi bi-calendar-plus me-1"></i>Prenota senza account
							</a>
						</div>

						{#if showDemoPanel}
							<div class="border-top pt-3 mt-2">
								<p class="text-muted small text-center mb-2">
									<i class="bi bi-lightning-charge me-1 text-warning"></i>Accesso rapido demo
								</p>
								<div class="d-flex gap-2">
									{#if env.PUBLIC_DEMO_ADMIN_USERNAME && env.PUBLIC_DEMO_ADMIN_PASSWORD}
										<button
											class="btn btn-outline-warning btn-sm flex-fill"
											onclick={() => fillDemo('admin')}
											disabled={loading}
										>
											<i class="bi bi-shield-lock me-1"></i>Admin
										</button>
									{/if}
									{#if env.PUBLIC_DEMO_BARBER_USERNAME && env.PUBLIC_DEMO_BARBER_PASSWORD}
										<button
											class="btn btn-outline-warning btn-sm flex-fill"
											onclick={() => fillDemo('barber')}
											disabled={loading}
										>
											<i class="bi bi-person-badge me-1"></i>Barbiere
										</button>
									{/if}
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Portal cards (informational) -->
			<div class="col-md-5 col-lg-4 d-none d-md-flex flex-column justify-content-center gap-3">
				<div class="card border-0 bg-white bg-opacity-10 text-white" style="border-radius:.75rem">
					<div class="card-body p-3">
						<div class="d-flex align-items-center gap-3">
							<div
								class="rounded-circle d-flex align-items-center justify-content-center"
								style="width:44px;height:44px;background:rgba(102,126,234,.3);flex-shrink:0"
							>
								<i class="bi bi-shield-lock fs-5"></i>
							</div>
							<div>
								<div class="fw-bold">Area Admin</div>
								<small class="opacity-75">Dashboard, prenotazioni, barbieri, magazzino</small>
							</div>
						</div>
					</div>
				</div>

				<div class="card border-0 bg-white bg-opacity-10 text-white" style="border-radius:.75rem">
					<div class="card-body p-3">
						<div class="d-flex align-items-center gap-3">
							<div
								class="rounded-circle d-flex align-items-center justify-content-center"
								style="width:44px;height:44px;background:rgba(255,193,7,.2);flex-shrink:0"
							>
								<i class="bi bi-person-badge fs-5 text-warning"></i>
							</div>
							<div>
								<div class="fw-bold">Area Barbiere</div>
								<small class="opacity-75">La tua dashboard personale e le tue prenotazioni</small>
							</div>
						</div>
					</div>
				</div>

				<div class="card border-0 bg-white bg-opacity-10 text-white" style="border-radius:.75rem">
					<div class="card-body p-3">
						<div class="d-flex align-items-center gap-3">
							<div
								class="rounded-circle d-flex align-items-center justify-content-center"
								style="width:44px;height:44px;background:rgba(40,167,69,.2);flex-shrink:0"
							>
								<i class="bi bi-people fs-5 text-success"></i>
							</div>
							<div>
								<div class="fw-bold">Portale Clienti</div>
								<small class="opacity-75">Prenota un servizio, vedi le tue prenotazioni</small>
							</div>
						</div>
					</div>
				</div>
			</div>

		</div>
	</div>
</div>

{#if toastMessage}
	<Toast message={toastMessage} type={toastType} />
{/if}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}

	input.form-control {
		border-radius: 0.5rem;
		border: 1px solid #e0e0e0;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	input.form-control:focus {
		border-color: #667eea;
		box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none;
		transition: transform 0.15s ease, box-shadow 0.15s ease;
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 0.4rem 0.8rem rgba(102, 126, 234, 0.4);
	}

	.btn-primary:disabled {
		opacity: 0.7;
	}
</style>
