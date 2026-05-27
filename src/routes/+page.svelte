<script lang="ts">
	import { onMount } from 'svelte';
	import Layout from '$lib/components/Layout.svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import LineChart from '$lib/components/LineChart.svelte';
	import BarChart from '$lib/components/BarChart.svelte';
	import DoughnutChart from '$lib/components/DoughnutChart.svelte';
	import { dashboard, appointments } from '$lib/stores';
	import { getDashboardStats, getAppointments } from '$lib/api-client';
	import type { IDashboardStats } from '$lib/types';

	let stats: IDashboardStats | null = $state(null);
	let loading: boolean = $state(true);
	let error: string | null = $state(null);

	onMount(async () => {
		loading = true;
		const result = await getDashboardStats();
		if (result.success && result.data) {
			stats = result.data;
			dashboard.setStats(result.data);
		} else {
			error = result.error ?? null;
		}
		loading = false;
	});

	function formatCurrency(value: number): string {
		return value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
	}
</script>

<Layout>
	<div class="container-fluid">
		<!-- Header -->
		<div class="mb-4">
			<h1 class="h3 mb-1">
				<i class="bi bi-graph-up me-2"></i>
				Dashboard
			</h1>
			<p class="text-muted">Panoramica dell'attività di oggi</p>
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
		{:else if stats}
			<!-- Stats Row 1 -->
			<div class="row mb-4">
				<div class="col-md-3 mb-3">
					<StatCard
						title="Prenotazioni Oggi"
						value={stats.totalAppointmentsToday}
						icon="bi-calendar-check"
						color="primary"
					/>
				</div>
				<div class="col-md-3 mb-3">
					<StatCard
						title="Completate"
						value={stats.completedAppointmentsToday}
						icon="bi-check-circle"
						color="success"
					/>
				</div>
				<div class="col-md-3 mb-3">
					<StatCard
						title="Revenue Oggi"
						value={formatCurrency(stats.totalRevenueToday)}
						icon="bi-cash-coin"
						color="success"
					/>
				</div>
				<div class="col-md-3 mb-3">
					<StatCard
						title="Barbieri Attivi"
						value={stats.activeBarbers}
						icon="bi-person-badge"
						color="info"
					/>
				</div>
			</div>

			<!-- Upcoming Appointments -->
			<div class="row mb-4">
				<div class="col-lg-6">
					<div class="card">
						<div class="card-header bg-light">
							<h5 class="mb-0">
								<i class="bi bi-clock me-2"></i>
								Prossime Prenotazioni
							</h5>
						</div>
						<div class="card-body">
							{#if stats.upcomingAppointments.length === 0}
								<p class="text-muted text-center py-3">Nessuna prenotazione imminente</p>
							{:else}
								<div class="list-group list-group-flush">
									{#each stats.upcomingAppointments as apt}
										<div class="list-group-item d-flex justify-content-between align-items-center">
											<div>
												<h6 class="mb-1">{apt.clientName}</h6>
												<small class="text-muted">{apt.service}</small>
											</div>
											<div class="text-end">
												<small class="d-block">
													{new Date(apt.startTime).toLocaleTimeString('it-IT', {
														hour: '2-digit',
														minute: '2-digit'
													})}
												</small>
												<span class="badge bg-primary">€{apt.price}</span>
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				</div>

				<!-- Top Barbers -->
				<div class="col-lg-6">
					<div class="card">
						<div class="card-header bg-light">
							<h5 class="mb-0">
								<i class="bi bi-star me-2"></i>
								Top Barbieri
							</h5>
						</div>
						<div class="card-body">
							{#if stats.topBarbers.length === 0}
								<p class="text-muted text-center py-3">Nessun dato disponibile</p>
							{:else}
								<div class="list-group list-group-flush">
									{#each stats.topBarbers as barber}
										<div class="list-group-item d-flex justify-content-between align-items-center">
											<div>
												<h6 class="mb-1">{barber.name}</h6>
												<small class="text-muted">{barber.appointmentsCount} prenotazioni</small>
											</div>
											<span class="badge bg-success">{formatCurrency(barber.revenue)}</span>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Services Chart -->
			<div class="row mb-4">
				<div class="col-lg-6">
					<div class="card">
						<div class="card-header bg-light">
							<h5 class="mb-0">
								<i class="bi bi-scissors me-2"></i>
								Servizi Più Richiesti
							</h5>
						</div>
						<div class="card-body">
							{#if stats.appointmentsByService.length === 0}
								<p class="text-muted text-center py-3">Nessun dato disponibile</p>
							{:else}
								<DoughnutChart
									labels={stats.appointmentsByService.map(s => s.service)}
									data={stats.appointmentsByService.map(s => s.count)}
									title="Servizi"
									canvasId="servicesChart"
								/>
							{/if}
						</div>
					</div>
				</div>

				<!-- Monthly Revenue Chart -->
				<div class="col-lg-6">
					<div class="card">
						<div class="card-header bg-light">
							<h5 class="mb-0">
								<i class="bi bi-graph-up me-2"></i>
								Revenue Mensile
							</h5>
						</div>
						<div class="card-body">
							{#if stats.monthlyRevenue.length === 0}
								<p class="text-muted text-center py-3">Nessun dato disponibile</p>
							{:else}
								<LineChart
									labels={stats.monthlyRevenue.map(m => m.date)}
									data={stats.monthlyRevenue.map(m => m.amount)}
									title="Revenue (€)"
									color="rgb(40, 167, 69)"
									canvasId="revenueChart"
								/>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Barber Performance Chart -->
			<div class="row">
				<div class="col-lg-12">
					<div class="card">
						<div class="card-header bg-light">
							<h5 class="mb-0">
								<i class="bi bi-bar-chart me-2"></i>
								Performance Barbieri
							</h5>
						</div>
						<div class="card-body">
							{#if stats.topBarbers.length === 0}
								<p class="text-muted text-center py-3">Nessun dato disponibile</p>
							{:else}
								<BarChart
									labels={stats.topBarbers.map(b => b.name)}
									data={stats.topBarbers.map(b => b.revenue)}
									title="Revenue per Barbiere (€)"
									color="rgb(13, 110, 253)"
									canvasId="barberChart"
								/>
							{/if}
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</Layout>
