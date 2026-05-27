<script lang="ts">
	interface Props {
		message: string | null;
		onRetry?: () => void;
	}
	let { message, onRetry }: Props = $props();
</script>

{#if message}
	<div class="alert alert-danger d-flex align-items-center justify-content-between">
		<span><i class="bi bi-exclamation-circle me-2"></i>{message}</span>
		{#if onRetry}
			<button class="btn btn-sm btn-outline-danger" onclick={onRetry}>
				<i class="bi bi-arrow-clockwise me-1"></i>Riprova
			</button>
		{/if}
	</div>
{/if}
