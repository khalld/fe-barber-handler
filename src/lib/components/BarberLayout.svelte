<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Toast from './Toast.svelte';

	interface Props {
		children?: import('svelte').Snippet;
		barberName?: string;
	}

	let { children, barberName = 'Barbiere' }: Props = $props();

	let showMobileMenu = $state(false);
	let toastMessage: string | null = $state(null);
	let toastType: 'success' | 'danger' | 'warning' | 'info' = $state('info');

	const navItems = [
		{ label: 'Dashboard', href: '/barber-dashboard', icon: 'grid' },
		{ label: 'Profilo', href: '/barber-profile', icon: 'person-circle' }
	];

	function isActive(href: string): boolean {
		return $page.url.pathname === href;
	}

	async function handleLogout() {
		if (!confirm('Sei sicuro di voler uscire?')) return;
		try {
			const res = await fetch('/api/barbers/logout', { method: 'POST' });
			const data = await res.json();
			if (data.success) {
				goto('/login');
			} else {
				toastMessage = 'Errore durante il logout';
				toastType = 'danger';
			}
		} catch {
			toastMessage = 'Errore di connessione';
			toastType = 'danger';
		}
	}
</script>

<div class="d-flex" style="min-height:100vh">
	<!-- Sidebar (desktop) -->
	<nav class="barber-sidebar bg-dark text-white d-none d-lg-flex flex-column">
		<div class="p-4 border-bottom border-secondary">
			<div class="d-flex align-items-center gap-2">
				<i class="bi bi-scissors fs-4 text-warning"></i>
				<div>
					<div class="fw-bold">Area Barbiere</div>
					<small class="text-muted">Pannello personale</small>
				</div>
			</div>
		</div>

		<ul class="nav flex-column mt-3 flex-grow-1 px-2">
			{#each navItems as item}
				<li class="nav-item mb-1">
					<a
						href={item.href}
						class="nav-link rounded px-3 py-2 {isActive(item.href) ? 'active-link' : 'text-secondary'}"
					>
						<i class="bi bi-{item.icon} me-2"></i>{item.label}
					</a>
				</li>
			{/each}
		</ul>

		<div class="p-4 border-top border-secondary">
			<div class="mb-3">
				<small class="text-muted d-block">Connesso come</small>
				<div class="d-flex align-items-center gap-2 mt-1">
					<div
						class="rounded-circle d-flex align-items-center justify-content-center text-dark fw-bold"
						style="width:32px;height:32px;background:#ffc107;font-size:.85rem;flex-shrink:0"
					>
						{barberName[0]?.toUpperCase() ?? 'B'}
					</div>
					<strong class="text-white text-truncate">{barberName}</strong>
				</div>
			</div>
			<button class="btn btn-outline-danger btn-sm w-100" onclick={handleLogout}>
				<i class="bi bi-box-arrow-right me-1"></i>Logout
			</button>
		</div>
	</nav>

	<!-- Main area -->
	<div class="flex-grow-1 d-flex flex-column">
		<!-- Mobile header -->
		<div class="d-lg-none bg-dark text-white p-3 d-flex justify-content-between align-items-center">
			<div class="d-flex align-items-center gap-2">
				<i class="bi bi-scissors text-warning"></i>
				<span class="fw-bold">Area Barbiere</span>
			</div>
			<button
				class="btn btn-outline-light btn-sm"
				onclick={() => (showMobileMenu = !showMobileMenu)}
			>
				<i class="bi bi-list"></i>
			</button>
		</div>

		<!-- Mobile menu -->
		{#if showMobileMenu}
			<div class="bg-dark text-white p-3 d-lg-none">
				<ul class="nav flex-column">
					{#each navItems as item}
						<li class="nav-item">
							<a
								href={item.href}
								class="nav-link {isActive(item.href) ? 'text-warning' : 'text-secondary'}"
								onclick={() => (showMobileMenu = false)}
							>
								<i class="bi bi-{item.icon} me-2"></i>{item.label}
							</a>
						</li>
					{/each}
					<hr class="border-secondary" />
					<li>
						<button class="btn btn-link nav-link text-danger w-100 text-start" onclick={handleLogout}>
							<i class="bi bi-box-arrow-right me-2"></i>Logout
						</button>
					</li>
				</ul>
			</div>
		{/if}

		<!-- Page content -->
		<main class="flex-grow-1 overflow-auto p-0" style="background:#f8f9fa">
			{@render children?.()}
		</main>
	</div>
</div>

{#if toastMessage}
	<Toast message={toastMessage} type={toastType} />
{/if}

<style>
	.barber-sidebar {
		width: 240px;
		min-height: 100vh;
	}

	:global(.active-link) {
		color: #ffc107 !important;
		background: rgba(255, 193, 7, 0.1);
		font-weight: 600;
	}

	:global(.nav-link:hover:not(.active-link)) {
		color: #fff !important;
		background: rgba(255, 255, 255, 0.08);
	}
</style>
