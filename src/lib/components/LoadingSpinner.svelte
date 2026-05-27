<script lang="ts">
	interface Props {
		label?: string;
		color?: string;
	}
	let { label = 'Caricamento...', color = 'primary' }: Props = $props();
</script>

<div class="text-center py-5">
	<div class="spinner-border text-{color}" role="status">
		<span class="visually-hidden">{label}</span>
	</div>
</div>
