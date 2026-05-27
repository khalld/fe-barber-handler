<script lang="ts">
	import { goto } from '$app/navigation';
	import { logoutUser } from '$lib/api-client';
	import Toast from './Toast.svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	let userName: string = $state('');
	let toastMessage: string = $state('');
	let toastType: 'success' | 'danger' | 'warning' | 'info' = $state('info');
	let showMobileMenu: boolean = $state(false);

	$effect(() => {
		userName = localStorage.getItem('userName') || 'Utente';
	});

	const navItems = [
		{ label: 'Prenota', href: '/client/barbers', icon: 'calendar-plus' },
		{ label: 'Le mie prenotazioni', href: '/client/appointments', icon: 'calendar-check' },
		{ label: 'Guida', href: '/docs', icon: 'book' }
	];

	async function handleLogout() {
		if (!confirm('Sei sicuro di voler uscire?')) return;

		const result = await logoutUser();
		if (result.success) {
			localStorage.removeItem('userId');
			localStorage.removeItem('userName');
			localStorage.removeItem('userEmail');

			toastMessage = 'Logout effettuato!';
			toastType = 'success';

			setTimeout(() => {
				goto('/client/login');
			}, 500);
		} else {
			toastMessage = 'Errore durante il logout';
			toastType = 'danger';
		}
	}
</script>

<div class="d-flex">
	<!-- Sidebar -->
	<nav class="bg-dark text-white sidebar d-none d-lg-flex flex-column">
		<div class="p-4 border-bottom border-secondary">
			<h5 class="mb-0">
				<i class="bi bi-scissors me-2"></i>
				Barbiere
			</h5>
		</div>

		<ul class="nav flex-column mt-4 flex-grow-1">
			{#each navItems as item}
				<li class="nav-item">
					<a href={item.href} class="nav-link text-white">
						<i class="bi bi-{item.icon} me-2"></i>
						{item.label}
					</a>
				</li>
			{/each}
		</ul>

		<div class="p-4 border-top border-secondary mt-auto">
			<div class="mb-3">
				<small class="text-muted d-block">Utente</small>
				<strong class="text-white text-truncate">{userName}</strong>
			</div>
			<button class="btn btn-outline-danger btn-sm w-100" onclick={handleLogout}>
				<i class="bi bi-box-arrow-right me-1"></i>
				Logout
			</button>
		</div>
	</nav>

	<!-- Main Content -->
	<div class="flex-grow-1 d-flex flex-column">
		<!-- Mobile Header -->
		<div class="d-lg-none bg-dark text-white p-3 d-flex justify-content-between align-items-center">
			<h5 class="mb-0">
				<i class="bi bi-scissors me-2"></i>
				Barbiere
			</h5>
			<button class="btn btn-outline-light btn-sm" onclick={() => (showMobileMenu = !showMobileMenu)}>
				<i class="bi bi-list"></i>
			</button>
		</div>

		<!-- Mobile Menu -->
		{#if showMobileMenu}
			<div class="bg-dark text-white p-3">
				<ul class="nav flex-column">
					{#each navItems as item}
						<li class="nav-item">
							<a href={item.href} class="nav-link text-white" onclick={() => (showMobileMenu = false)}>
								<i class="bi bi-{item.icon} me-2"></i>
								{item.label}
							</a>
						</li>
					{/each}
					<hr class="border-secondary" />
					<li class="nav-item">
						<button class="nav-link btn btn-link text-danger w-100 text-start" onclick={handleLogout}>
							<i class="bi bi-box-arrow-right me-2"></i>
							Logout
						</button>
					</li>
				</ul>
			</div>
		{/if}

		<!-- Page Content -->
		<main class="flex-grow-1 overflow-auto">
			{@render children?.()}
		</main>
	</div>
</div>

{#if toastMessage}
	<Toast message={toastMessage} type={toastType} />
{/if}

<style>
	.sidebar {
		width: 250px;
		min-height: 100vh;
		background-color: #212529;
	}

	.nav-link {
		color: rgba(255, 255, 255, 0.7) !important;
		transition: all 0.3s ease;
		padding: 0.75rem 1rem;
	}

	.nav-link:hover {
		color: white !important;
		background-color: rgba(102, 126, 234, 0.2);
	}

	main {
		background-color: #f8f9fa;
	}
</style>
