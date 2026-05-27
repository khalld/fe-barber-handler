<script lang="ts">
	import type { ITransaction } from '$lib/types';

	interface Props {
		transaction: ITransaction;
		onEdit?: (t: ITransaction) => void;
		onDelete?: (id: string) => void;
	}

	let { transaction, onEdit, onDelete }: Props = $props();

	function formatDate(date: Date | string) {
		const d = new Date(date);
		return d.toLocaleString('it-IT', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	function getCategoryLabel(category: string) {
		const labels: Record<string, string> = {
			appointment_payment: 'Pagamento Prenotazione',
			product_sale: 'Vendita Prodotto',
			salary: 'Stipendio',
			supplies: 'Forniture',
			rent: 'Affitto',
			utilities: 'Utenze',
			maintenance: 'Manutenzione',
			other: 'Altro'
		};
		return labels[category] || category;
	}

	function getTypeClass(type: string) {
		return type === 'income' ? 'text-success fw-bold' : 'text-danger fw-bold';
	}

	function getTypeIcon(type: string) {
		return type === 'income' ? '↑' : '↓';
	}
</script>

<tr>
	<td>{formatDate(transaction.date)}</td>
	<td>{getCategoryLabel(transaction.category)}</td>
	<td class="text-truncate" title={transaction.description}>{transaction.description}</td>
	<td class={getTypeClass(transaction.type)}>
		{getTypeIcon(transaction.type)}
		€{transaction.amount.toFixed(2)}
	</td>
	<td>
		<span class="badge bg-secondary">{transaction.paymentMethod || 'N/D'}</span>
	</td>
	<td>
		<div class="btn-group btn-group-sm" role="group">
			{#if onEdit}
				<button
					type="button"
					class="btn btn-primary btn-sm"
					title="Modifica"
					onclick={() => onEdit(transaction)}
				>
					<i class="bi bi-pencil"></i>
				</button>
			{/if}
			{#if onDelete}
				<button
					type="button"
					class="btn btn-danger btn-sm"
					title="Elimina"
					onclick={() => onDelete(transaction._id || '')}
				>
					<i class="bi bi-trash"></i>
				</button>
			{/if}
		</div>
	</td>
</tr>
