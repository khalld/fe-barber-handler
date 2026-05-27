<script lang="ts">
	import { toast as toastStore, type ToastType, type ToastState } from '$lib/stores/toast';

	interface Props {
		message?: string | null;
		type?: ToastType;
	}

	// Se "message" è passato esplicitamente → modalità prop (legacy).
	// Se non è passato → il componente segue il toast store globale.
	let { message = undefined, type = 'info' }: Props = $props();

	const active = $derived<ToastState | null>(
		message !== undefined ? (message ? { message, type } : null) : $toastStore
	);

	const bgClass: Record<ToastType, string> = {
		success: 'bg-success',
		danger: 'bg-danger',
		warning: 'bg-warning',
		info: 'bg-info'
	};

	const iconClass: Record<ToastType, string> = {
		success: 'bi-check-circle',
		danger: 'bi-exclamation-circle',
		warning: 'bi-exclamation-triangle',
		info: 'bi-info-circle'
	};
</script>

{#if active}
	<div class="toast show position-fixed bottom-0 end-0 m-3" role="alert">
		<div class="toast-header {bgClass[active.type]} text-white">
			<i class="bi {iconClass[active.type]} me-2"></i>
			<strong class="me-auto">Notifica</strong>
			<small>ora</small>
			<button
				type="button"
				class="btn-close btn-close-white"
				data-bs-dismiss="toast"
				aria-label="Close"
				onclick={() => toastStore.clear()}
			></button>
		</div>
		<div class="toast-body">
			{active.message}
		</div>
	</div>
{/if}

<style>
	.toast {
		min-width: 300px;
		z-index: 1050;
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			transform: translateX(400px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>
