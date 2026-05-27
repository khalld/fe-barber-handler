<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Toast from '$lib/components/Toast.svelte';
	import { loginUser } from '$lib/api-client';
	import { env } from '$env/dynamic/public';

	const showDemoPanel = !!(env.PUBLIC_DEMO_CLIENT_USERNAME && env.PUBLIC_DEMO_CLIENT_PASSWORD);

	let loading: boolean = $state(false);
	let toastMessage: string = $state('');
	let toastType: 'success' | 'danger' | 'warning' | 'info' = $state('info');

	let formData = $state({
		username: '',
		password: ''
	});

	onMount(() => {
		// Check if user is already logged in
		const userId = localStorage.getItem('userId');
		if (userId) {
			goto('/client/appointments');
		}
	});

	async function handleLogin() {
		if (!formData.username || !formData.password) {
			toastMessage = 'Username e password sono obbligatori';
			toastType = 'warning';
			return;
		}

		loading = true;
		try {
			const result = await loginUser(formData.username, formData.password);

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
		} finally {
			loading = false;
		}
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleLogin();
		}
	}

	function fillDemoClient() {
		formData.username = env.PUBLIC_DEMO_CLIENT_USERNAME ?? '';
		formData.password = env.PUBLIC_DEMO_CLIENT_PASSWORD ?? '';
		handleLogin();
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
							<p class="text-muted text-sm">Accedi con il tuo account</p>
						</div>

						<!-- Form -->
						<div class="mb-4">
							<input
								type="text"
								class="form-control form-control-lg mb-3"
								placeholder="Username"
								autocomplete="username"
								bind:value={formData.username}
								disabled={loading}
								required
							/>

							<input
								type="password"
								class="form-control form-control-lg"
								placeholder="Password"
								autocomplete="current-password"
								bind:value={formData.password}
								disabled={loading}
								required
							/>
						</div>

						<!-- Submit Button -->
						<button
							class="btn btn-primary btn-lg w-100 mb-3"
							onclick={handleLogin}
							disabled={loading}
						>
							{#if loading}
								<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
								Accesso...
							{:else}
								<i class="bi bi-box-arrow-in-right me-2"></i>
								Accedi
							{/if}
						</button>

						<!-- Info Text -->
						<p class="text-muted text-center small mb-3">
							Non hai un account? Contatta il negozio: l'accesso viene creato dal gestore.
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
</style>
