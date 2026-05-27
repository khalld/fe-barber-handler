<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Toast from '$lib/components/Toast.svelte';
	import { registerUser, loginUser } from '$lib/api-client';
	import { env } from '$env/dynamic/public';

	const showDemoPanel = !!(env.PUBLIC_DEMO_CLIENT_EMAIL && env.PUBLIC_DEMO_CLIENT_PASSWORD);

	let mode: 'register' | 'login' = $state('login');
	let loading: boolean = $state(false);
	let toastMessage: string = $state('');
	let toastType: 'success' | 'danger' | 'warning' | 'info' = $state('info');

	// Form data
	let formData = $state({
		name: '',
		email: '',
		phone: '',
		password: '',
		confirmPassword: ''
	});

	onMount(() => {
		// Check if user is already logged in
		const userId = localStorage.getItem('userId');
		if (userId) {
			goto('/client/appointments');
		}
	});

	async function handleSubmit() {
		loading = true;

		try {
			if (mode === 'register') {
				await handleRegister();
			} else {
				await handleLogin();
			}
		} finally {
			loading = false;
		}
	}

	async function handleRegister() {
		if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
			toastMessage = 'Tutti i campi sono obbligatori';
			toastType = 'warning';
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			toastMessage = 'Le password non coincidono';
			toastType = 'danger';
			return;
		}

		if (formData.password.length < 6) {
			toastMessage = 'La password deve contenere almeno 6 caratteri';
			toastType = 'warning';
			return;
		}

		const result = await registerUser({
			name: formData.name,
			email: formData.email,
			phone: formData.phone,
			password: formData.password,
			confirmPassword: formData.confirmPassword
		});

		if (result.success) {
			toastMessage = 'Registrazione completata! Accedi per continuare.';
			toastType = 'success';
			mode = 'login';
			formData = {
				name: '',
				email: formData.email,
				phone: '',
				password: '',
				confirmPassword: ''
			};
		} else {
			toastMessage = result.error || 'Errore nella registrazione';
			toastType = 'danger';
		}
	}

	async function handleLogin() {
		if (!formData.email || !formData.password) {
			toastMessage = 'Email e password sono obbligatori';
			toastType = 'warning';
			return;
		}

		const result = await loginUser(formData.email, formData.password);

		if (result.success && result.data) {
			localStorage.setItem('userId', result.data._id || '');
			localStorage.setItem('userName', result.data.name || '');
			localStorage.setItem('userEmail', result.data.email || '');

			toastMessage = 'Accesso effettuato!';
			toastType = 'success';

			setTimeout(() => {
				goto('/client/appointments');
			}, 500);
		} else {
			toastMessage = result.error || 'Credenziali non valide';
			toastType = 'danger';
		}
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleSubmit();
		}
	}

	function fillDemoClient() {
		mode = 'login';
		formData.email = env.PUBLIC_DEMO_CLIENT_EMAIL ?? '';
		formData.password = env.PUBLIC_DEMO_CLIENT_PASSWORD ?? '';
		handleSubmit();
	}
</script>

<svelte:window on:keydown={handleKeyPress} />

<div class="min-vh-100 d-flex align-items-center justify-content-center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
	<div class="container">
		<div class="row justify-content-center">
			<div class="col-md-6 col-lg-4">
				<div class="card shadow-lg border-0">
					<!-- Header -->
					<div class="card-body p-5">
						<div class="text-center mb-4">
							<i class="bi bi-scissors" style="font-size: 3rem; color: #667eea;"></i>
							<h1 class="h3 mt-3 mb-1">Prenotazioni Barbiere</h1>
							<p class="text-muted text-sm">Prenota il tuo slot</p>
						</div>

						<!-- Mode Selector -->
						<div class="btn-group w-100 mb-4" role="group">
							<input
								type="radio"
								class="btn-check"
								name="mode"
								id="loginMode"
								value="login"
								bind:group={mode}
							/>
							<label class="btn btn-outline-primary" for="loginMode">
								<i class="bi bi-box-arrow-in-right me-1"></i>
								Accedi
							</label>

							<input
								type="radio"
								class="btn-check"
								name="mode"
								id="registerMode"
								value="register"
								bind:group={mode}
							/>
							<label class="btn btn-outline-primary" for="registerMode">
								<i class="bi bi-person-plus me-1"></i>
								Registrati
							</label>
						</div>

						<!-- Form -->
						<div class="mb-4">
							{#if mode === 'register'}
								<input
									type="text"
									class="form-control form-control-lg mb-3"
									placeholder="Nome completo"
									bind:value={formData.name}
									disabled={loading}
									required
								/>
							{/if}

							<input
								type="email"
								class="form-control form-control-lg mb-3"
								placeholder="Email"
								bind:value={formData.email}
								disabled={loading}
								required
							/>

							{#if mode === 'register'}
								<input
									type="tel"
									class="form-control form-control-lg mb-3"
									placeholder="Telefono"
									bind:value={formData.phone}
									disabled={loading}
									required
								/>
							{/if}

							<input
								type="password"
								class="form-control form-control-lg mb-3"
								placeholder="Password"
								bind:value={formData.password}
								disabled={loading}
								required
							/>

							{#if mode === 'register'}
								<input
									type="password"
									class="form-control form-control-lg"
									placeholder="Conferma Password"
									bind:value={formData.confirmPassword}
									disabled={loading}
									required
								/>
							{/if}
						</div>

						<!-- Submit Button -->
						<button
							class="btn btn-primary btn-lg w-100 mb-3"
							onclick={handleSubmit}
							disabled={loading}
						>
							{#if loading}
								<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
								{mode === 'register' ? 'Registrazione...' : 'Accesso...'}
							{:else}
								<i class="bi bi-{mode === 'register' ? 'person-plus' : 'box-arrow-in-right'} me-2"></i>
								{mode === 'register' ? 'Registrati' : 'Accedi'}
							{/if}
						</button>

						<!-- Info Text -->
						<p class="text-muted text-center small mb-3">
							{#if mode === 'register'}
								Già registrato? <button
									class="btn btn-link p-0 text-decoration-none"
									onclick={() => (mode = 'login')}
								>
									Accedi qui
								</button>
							{:else}
								Non hai un account? <button
									class="btn btn-link p-0 text-decoration-none"
									onclick={() => (mode = 'register')}
								>
									Registrati
								</button>
							{/if}
						</p>
						<div class="border-top pt-3">
							<a href="/client/book" class="btn btn-outline-secondary btn-sm w-100">
								<i class="bi bi-calendar-plus me-1"></i>Prenota senza account
							</a>
						</div>

						{#if showDemoPanel}
							<div class="border-top pt-3 mt-2 text-center">
								<p class="text-muted small mb-2">
									<i class="bi bi-lightning-charge me-1 text-warning"></i>Accesso rapido demo
								</p>
								<button
									class="btn btn-outline-warning btn-sm w-100"
									onclick={fillDemoClient}
									disabled={loading}
								>
									<i class="bi bi-person me-1"></i>Accedi come cliente demo
								</button>
							</div>
						{/if}
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

	.min-vh-100 {
		min-height: 100vh;
	}

	.card {
		border-radius: 1rem;
		overflow: hidden;
	}

	input {
		border-radius: 0.5rem;
		border: 1px solid #e0e0e0;
		transition: all 0.3s ease;
	}

	input:focus {
		border-color: #667eea;
		box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none;
		transition: all 0.3s ease;
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 0.5rem 1rem rgba(102, 126, 234, 0.4);
	}

	.btn-primary:disabled {
		opacity: 0.7;
	}

	.btn-link {
		color: #667eea;
		font-weight: 600;
	}

	.btn-link:hover {
		color: #764ba2;
	}
</style>
