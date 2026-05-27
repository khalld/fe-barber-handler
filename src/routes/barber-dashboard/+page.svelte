<script lang="ts">
	import { onMount } from 'svelte';
	import BarberLayout from '$lib/components/BarberLayout.svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import LineChart from '$lib/components/LineChart.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { getBarberDashboard } from '$lib/api-client';
	import type { IBarber } from '$lib/types';

	let { data } = $props();

	const barber: IBarber = data.barber;
	let dashboardData: any = $state(null);
	let loading: boolean = $state(true);
	let error: string | null = $state(null);
	let toastMessage: string = $state('');
	let toastType: 'success' | 'danger' | 'warning' | 'info' = $state('info');

	onMount(async () => {
		loading = true;
		try {
			const dashResult = await getBarberDashboard(barber._id!);
			if (dashResult.success) {
				dashboardData = dashResult.data;
			} else {
				error = dashResult.error || 'Errore nel caricamento';
			}
		} catch (err) {
			error = 'Errore nel caricamento dei dati';
			console.error(err);
		} finally {
			loading = false;
		}
	});

	function formatCurrency(value: number): string {
		return value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
	}
</script>

<BarberLayout barberName={barber.name}>
	<div class="container-fluid p-4">
		<!-- Header -->
		<div class="mb-4">
			<h1 class="h3 mb-1">
				<i class="bi bi-grid me-2"></i>La mia Dashboard
			</h1>
			<p class="text-muted">@{barber.username}</p>
		</div>

		{#if loading}
			<div class="text-center py-5">
				<div class="spinner-border text-primary" role="status">
					<span class="visually-hidden">Caricamento...</span>
				</div>
			</div>
		{:else if error}
			<div class="alert alert-danger alert-dismissible fade show" role="alert">
				<i class="bi bi-exclamation-circle me-2"></i>{error}
				<button type="button" class="btn-close" data-bs-dismiss="alert"></button>
			</div>
		{:else if dashboardData}
			<!-- Stats Row -->
			<div class="row mb-4">
				<div class="col-md-3 mb-3">
					<StatCard
						title="Prenotazioni Oggi"
						value={dashboardData.appointmentsToday || 0}
						icon="bi-calendar-check"
						color="primary"
					/>
				</div>
				<div class="col-md-3 mb-3">
					<StatCard
						title="Completate Oggi"
						value={dashboardData.completedToday || 0}
						icon="bi-check-circle"
						color="success"
					/>
				</div>
				<div class="col-md-3 mb-3">
					<StatCard
						title="Revenue Oggi"
						value={formatCurrency(dashboardData.revenueToday || 0)}
						icon="bi-cash-coin"
						color="success"
					/>
				</div>
				<div class="col-md-3 mb-3">
					<StatCard
						title="Totale (30gg)"
						value={formatCurrency(dashboardData.totalRevenue || 0)}
						icon="bi-graph-up"
						color="warning"
					/>
				</div>
			</div>

			<!-- Revenue Trend -->
			<div class="row mb-4">
				<div class="col-12">
					<div class="card border-0 shadow-sm">
						<div class="card-header bg-light">
							<h5 class="mb-0">
								<i class="bi bi-graph-up me-2"></i>Trend Revenue (Ultimi 30 giorni)
							</h5>
						</div>
						<div class="card-body">
							{#if dashboardData.revenueHistory?.length > 0}
								<LineChart
									labels={dashboardData.revenueHistory.map((r: any) => r.date)}
									data={dashboardData.revenueHistory.map((r: any) => r.amount)}
									title="Revenue Giornaliero (€)"
									color="rgb(40, 167, 69)"
									canvasId="barberRevenueChart"
								/>
							{:else}
								<p class="text-muted text-center py-3">Nessun dato disponibile</p>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Appointments Today + Stats -->
			<div class="row mb-4">
				<div class="col-lg-6 mb-3">
					<div class="card border-0 shadow-sm h-100">
						<div class="card-header bg-light">
							<h5 class="mb-0">
								<i class="bi bi-calendar me-2"></i>Prenotazioni di Oggi
							</h5>
						</div>
						<div class="card-body p-0">
							{#if dashboardData.todayAppointments?.length > 0}
								<div class="list-group list-group-flush">
									{#each dashboardData.todayAppointments as apt}
										<div class="list-group-item">
											<div class="d-flex justify-content-between align-items-start">
												<div>
													<h6 class="mb-1">{apt.clientName}</h6>
													<small class="text-muted">{apt.service}</small><br />
													<small class="text-muted">
														<i class="bi bi-clock me-1"></i>
														{new Date(apt.startTime).toLocaleTimeString('it-IT', {
															hour: '2-digit',
															minute: '2-digit'
														})}
													</small>
												</div>
												<span
													class="badge bg-{apt.status === 'completed'
														? 'success'
														: apt.status === 'pending'
															? 'warning'
															: 'secondary'}"
												>
													{apt.status}
												</span>
											</div>
											<div class="mt-2">
												<span class="badge bg-info">{formatCurrency(apt.price)}</span>
											</div>
										</div>
									{/each}
								</div>
							{:else}
								<p class="text-muted text-center py-4">Nessuna prenotazione oggi</p>
							{/if}
						</div>
					</div>
				</div>

				<div class="col-lg-6 mb-3">
					<div class="card border-0 shadow-sm h-100">
						<div class="card-header bg-light">
							<h5 class="mb-0">
								<i class="bi bi-bar-chart me-2"></i>Statistiche (30 giorni)
							</h5>
						</div>
						<div class="card-body">
							<div class="row g-3">
								<div class="col-6">
									<small class="text-muted d-block">Prenotazioni Totali</small>
									<h5 class="mb-0">{dashboardData.totalAppointments || 0}</h5>
								</div>
								<div class="col-6">
									<small class="text-muted d-block">Revenue Totale</small>
									<h5 class="mb-0">{formatCurrency(dashboardData.totalRevenue || 0)}</h5>
								</div>
								<div class="col-6">
									<small class="text-muted d-block">Completate</small>
									<h5 class="mb-0">{dashboardData.completedAppointments || 0}</h5>
								</div>
								<div class="col-6">
									<small class="text-muted d-block">Tasso Completamento</small>
									<h5 class="mb-0">
										{dashboardData.totalAppointments
											? (
													(dashboardData.completedAppointments /
														dashboardData.totalAppointments) *
													100
												).toFixed(0)
											: 0}%
									</h5>
								</div>
								<div class="col-6">
									<small class="text-muted d-block">Media per Prenotazione</small>
									<h5 class="mb-0">
										{dashboardData.totalAppointments
											? formatCurrency(
													dashboardData.totalRevenue / dashboardData.totalAppointments
												)
											: '€0,00'}
									</h5>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Top Services -->
			{#if dashboardData.topServices?.length > 0}
				<div class="card border-0 shadow-sm">
					<div class="card-header bg-light">
						<h5 class="mb-0">
							<i class="bi bi-scissors me-2"></i>Servizi Più Richiesti
						</h5>
					</div>
					<div class="card-body p-0">
						<div class="table-responsive">
							<table class="table table-hover mb-0">
								<thead class="table-light">
									<tr>
										<th>Servizio</th>
										<th class="text-end">Prenotazioni</th>
										<th class="text-end">Revenue</th>
										<th class="text-end">Media</th>
									</tr>
								</thead>
								<tbody>
									{#each dashboardData.topServices as service}
										<tr>
											<td>{service.name}</td>
											<td class="text-end">{service.count}</td>
											<td class="text-end">{formatCurrency(service.revenue)}</td>
											<td class="text-end"
												>{formatCurrency(service.revenue / service.count)}</td
											>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</BarberLayout>

{#if toastMessage}
	<Toast message={toastMessage} type={toastType} />
{/if}
