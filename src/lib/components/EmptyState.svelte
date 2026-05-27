<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		icon?: string;
		message: string;
		/** Azione opzionale (es. un pulsante) mostrata sotto al messaggio. */
		action?: Snippet;
	}
	let { icon = 'bi-inbox', message, action }: Props = $props();
</script>

<div class="text-center py-5">
	<i class="bi {icon} display-4 text-muted d-block mb-3"></i>
	<p class="text-muted">{message}</p>
	{#if action}
		{@render action()}
	{/if}
</div>
