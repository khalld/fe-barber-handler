<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.png';
	import Toast from '$lib/components/Toast.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<!-- Toast globale guidato dallo store (src/lib/stores/toast.ts) -->
<Toast />
