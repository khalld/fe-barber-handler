<script lang="ts">
	interface Props {
		title: string;
		value: string | number;
		icon?: string;
		color?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
		trend?: number;
	}

	let { title, value, icon = 'bi-graph-up', color = 'primary', trend }: Props = $props();

	function getTrendColor(trend: number) {
		if (!trend) return '';
		return trend > 0 ? 'text-success' : 'text-danger';
	}

	function getTrendIcon(trend: number) {
		if (!trend) return '';
		return trend > 0 ? '↑' : '↓';
	}
</script>

<div class="card bg-light h-100">
	<div class="card-body">
		<div class="d-flex justify-content-between align-items-start">
			<div>
				<p class="text-muted mb-2">{title}</p>
				<h3 class="mb-0">{value}</h3>
				{#if trend !== undefined && trend !== 0}
					<small class={getTrendColor(trend)}>
						{getTrendIcon(trend)}
						{Math.abs(trend)}%
					</small>
				{/if}
			</div>
			{#if icon}
				<i class="bi {icon} text-{color} fs-3"></i>
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
		transform: translateY(-2px);
		box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
	}
</style>
