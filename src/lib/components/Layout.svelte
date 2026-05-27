<script lang="ts">
	import { goto } from '$app/navigation';
	import { ui } from '$lib/stores';
	import { page } from '$app/stores';

	let loggingOut = $state(false);

	async function handleLogout() {
		loggingOut = true;
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
		} finally {
			loggingOut = false;
			goto('/login');
		}
	}

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	interface NavItem {
		label: string;
		href: string;
		icon: string;
	}

	const navItems: NavItem[] = [
		{ label: 'Dashboard', href: '/', icon: 'bi-graph-up' },
		{ label: 'Prenotazioni', href: '/appointments', icon: 'bi-calendar-check' },
		{ label: 'Barbieri', href: '/barbers', icon: 'bi-person-badge' },
		{ label: 'Transazioni', href: '/transactions', icon: 'bi-cash-coin' },
		{ label: 'Utenti', href: '/users', icon: 'bi-people' },
		{ label: 'Magazzino', href: '/warehouse', icon: 'bi-box-seam' },
		{ label: 'API Docs', href: '/api-docs', icon: 'bi-code-square' }
	];

	function isActive(href: string): boolean {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
	}

	function toggleSidebar() {
		ui.toggleSidebar();
	}
</script>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark p-0">
	<div class="container-fluid p-2 d-flex justify-content-between align-items-center">
		<div class="d-flex align-items-center gap-2">
			<button
				class="navbar-toggler border-0"
				type="button"
				onclick={toggleSidebar}
				aria-label="Toggle sidebar"
			>
				<span class="navbar-toggler-icon"></span>
			</button>
			<a class="navbar-brand mb-0 text-white text-decoration-none" href="/">
				<i class="bi bi-scissors me-1"></i>Barbershop
			</a>
		</div>

		<ul class="nav d-none d-lg-flex me-auto ms-3 gap-1">
			{#each navItems as item}
				<li class="nav-item">
					<a
						href={item.href}
						class="nav-link px-2 py-1 rounded {isActive(item.href) ? 'text-white fw-semibold bg-primary bg-opacity-25' : 'text-light'}"
					>
						<i class="bi {item.icon} me-1"></i>{item.label}
					</a>
				</li>
			{/each}
		</ul>

		<button
			class="btn btn-outline-danger btn-sm"
			onclick={handleLogout}
			disabled={loggingOut}
		>
			<i class="bi bi-box-arrow-right me-1"></i>
			{loggingOut ? 'Uscita...' : 'Logout'}
		</button>
	</div>
</nav>

{#if $ui.sidebarOpen}
	<div class="sidebar-overlay" onclick={toggleSidebar} role="button" tabindex="0"></div>
{/if}

<div class="d-flex">
	<!-- Sidebar -->
	<nav class="sidebar bg-dark" style="width: {$ui.sidebarOpen ? '250px' : '0'}; transition: width 0.3s;">
		<div class="sidebar-content" style="color: #fff;">
			{#each navItems as item}
				<a
					href={item.href}
					class="nav-link-item {isActive(item.href) ? 'active' : ''}"
				>
					<i class="bi {item.icon}"></i>
					<span>{item.label}</span>
				</a>
			{/each}
		</div>
	</nav>

	<!-- Main Content -->
	<main class="flex-grow-1">
		{@render children?.()}
	</main>
</div>

<style>
	.sidebar-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 999;
		display: none;
	}

	@media (max-width: 991px) {
		.sidebar-overlay {
			display: block;
		}
	}

	.sidebar {
		max-width: 250px;
		height: calc(100vh - 44px);
		overflow-y: auto;
		border-right: 1px solid #495057;
	}

	.sidebar::-webkit-scrollbar {
		width: 6px;
	}

	.sidebar::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
	}

	.sidebar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 3px;
	}

	.sidebar::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.sidebar-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.5rem;
	}

	:global(.nav-link-item) {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		transition: all 0.2s ease;
		color: #adb5bd;
		text-decoration: none;
		font-size: 0.95rem;
		cursor: pointer;
	}

	:global(.nav-link-item:hover) {
		background-color: rgba(255, 255, 255, 0.1);
		color: #fff;
		padding-left: 1.25rem;
	}

	:global(.nav-link-item.active) {
		background-color: rgba(13, 110, 253, 0.25);
		color: #0d6efd;
		border-left: 3px solid #0d6efd;
		padding-left: 0.75rem;
		font-weight: 500;
	}

	:global(.nav-link-item i) {
		font-size: 1.1rem;
		width: 20px;
		text-align: center;
	}

	main {
		padding: 1rem;
		background-color: #f8f9fa;
		min-height: calc(100vh - 44px);
		width: 100%;
	}
</style>
