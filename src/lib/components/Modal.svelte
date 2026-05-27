<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		id?: string;
		title: string;
		visible: boolean;
		onClose: () => void;
		onSubmit?: (e: Event) => void;
		isLoading?: boolean;
	}

	let { id, title, visible, onClose, onSubmit, isLoading = false }: Props = $props();
	let modal: any;

	onMount(() => {
		if (typeof window !== 'undefined') {
			const { Modal } = (window as any).bootstrap || {};
			if (Modal) {
				modal = new Modal(`#${id}`);
			}
		}
	});

	function handleSubmit(e: Event) {
		e.preventDefault();
		onSubmit?.(e);
	}

	$effect(() => {
		if (!modal) return;
		if (visible) {
			modal.show();
		} else {
			modal.hide();
		}
	});

	$effect(() => {
		if (!modal || !id) return;
		const modalElement = document.getElementById(id);
		if (!modalElement) return;

		const handleHidden = () => {
			onClose();
		};

		modalElement.addEventListener('hidden.bs.modal', handleHidden);

		return () => {
			modalElement.removeEventListener('hidden.bs.modal', handleHidden);
		};
	});
</script>

<div class="modal fade" {id} tabindex="-1">
	<div class="modal-dialog modal-dialog-centered">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title">{title}</h5>
				<button
					type="button"
					class="btn-close"
					data-bs-dismiss="modal"
					aria-label="Close"
				></button>
			</div>
			<form onsubmit={handleSubmit}>
				<div class="modal-body">
					<slot />
				</div>
				<div class="modal-footer">
					<button
						type="button"
						class="btn btn-secondary"
						data-bs-dismiss="modal"
						disabled={isLoading}
					>
						Chiudi
					</button>
					<button type="submit" class="btn btn-primary" disabled={isLoading}>
						{#if isLoading}
							<span class="spinner-border spinner-border-sm me-2"></span>
						{/if}
						Salva
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
