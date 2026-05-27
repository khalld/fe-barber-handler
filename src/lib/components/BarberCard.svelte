<script lang="ts">
	import type { IBarber } from '$lib/types';

	interface Props {
		barber: IBarber;
		onEdit?: (barber: IBarber) => void;
		onDelete?: (id: string) => void;
	}

	let { barber, onEdit, onDelete }: Props = $props();
</script>

<div class="card">
	<div class="card-body">
		<div class="d-flex justify-content-between align-items-start">
			<div>
				<h5 class="card-title">{barber.name}</h5>
				<p class="text-muted mb-2">{barber.email}</p>
				{#if barber.phone}
					<p class="text-muted mb-2">
						<i class="bi bi-telephone"></i>
						{barber.phone}
					</p>
				{/if}
			</div>
			<span class="badge {barber.isActive ? 'bg-success' : 'bg-danger'}">
				{barber.isActive ? 'Attivo' : 'Disattivo'}
			</span>
		</div>

		{#if barber.specializations && barber.specializations.length > 0}
			<div class="mt-3">
				<strong>Specializzazioni:</strong>
				<div class="mt-2">
					{#each barber.specializations as spec}
						<span class="badge bg-primary me-1">{spec}</span>
					{/each}
				</div>
			</div>
		{/if}

		{#if barber.bio}
			<p class="mt-3 mb-0 text-muted">{barber.bio}</p>
		{/if}

		<div class="mt-3 d-flex gap-2">
			<a href="/barber-dashboard?id={barber._id}" class="btn btn-sm btn-outline-info">
				<i class="bi bi-graph-up"></i> Dashboard
			</a>
			{#if onEdit}
				<button class="btn btn-sm btn-outline-primary" onclick={() => onEdit(barber)}>
					<i class="bi bi-pencil"></i> Modifica
				</button>
			{/if}
			{#if onDelete}
				<button
					class="btn btn-sm btn-outline-danger"
					onclick={() => onDelete(barber._id || '')}
				>
					<i class="bi bi-trash"></i> Disattiva
				</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.card {
		border: 1px solid #dee2e6;
		border-radius: 0.5rem;
		transition: all 0.3s ease;
	}

	.card:hover {
		box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
	}
</style>
