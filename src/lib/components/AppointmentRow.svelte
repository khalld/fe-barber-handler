<script lang="ts">
	import type { IAppointment } from '$lib/types';

	interface Props {
		appointment: IAppointment;
		onEdit?: (apt: IAppointment) => void;
		onComplete?: (id: string) => void;
		onCancel?: (id: string) => void;
	}

	let { appointment, onEdit, onComplete, onCancel }: Props = $props();

	function formatDateTime(date: Date | string) {
		const d = new Date(date);
		return d.toLocaleString('it-IT', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getStatusBadge(status: string) {
		const badges: Record<string, string> = {
			pending: 'bg-warning',
			confirmed: 'bg-info',
			completed: 'bg-success',
			cancelled: 'bg-danger'
		};
		return badges[status] || 'bg-secondary';
	}

	function getStatusLabel(status: string) {
		const labels: Record<string, string> = {
			pending: 'In Sospeso',
			confirmed: 'Confermata',
			completed: 'Completata',
			cancelled: 'Cancellata'
		};
		return labels[status] || status;
	}
</script>

<tr>
	<td class="fw-bold">{appointment.clientName}</td>
	<td>{appointment.service}</td>
	<td>{formatDateTime(appointment.startTime)}</td>
	<td>
		<span class="badge {getStatusBadge(appointment.status)}">
			{getStatusLabel(appointment.status)}
		</span>
	</td>
	<td>€{appointment.price.toFixed(2)}</td>
	<td>
		<div class="btn-group btn-group-sm" role="group">
			{#if appointment.status !== 'completed' && appointment.status !== 'cancelled'}
				{#if onComplete}
					<button
						type="button"
						class="btn btn-success btn-sm"
						title="Completa"
						onclick={() => onComplete(appointment._id || '')}
					>
						<i class="bi bi-check"></i>
					</button>
				{/if}
				{#if onCancel}
					<button
						type="button"
						class="btn btn-danger btn-sm"
						title="Cancella"
						onclick={() => onCancel(appointment._id || '')}
					>
						<i class="bi bi-x"></i>
					</button>
				{/if}
			{/if}
			{#if onEdit}
				<button
					type="button"
					class="btn btn-primary btn-sm"
					title="Modifica"
					onclick={() => onEdit(appointment)}
				>
					<i class="bi bi-pencil"></i>
				</button>
			{/if}
		</div>
	</td>
</tr>
