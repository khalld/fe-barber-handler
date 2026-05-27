<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	interface Props {
		labels: string[];
		data: number[];
		title: string;
		color?: string;
		canvasId?: string;
	}

	let { labels, data, title, color = 'rgb(13, 110, 253)', canvasId = 'lineChart' }: Props = $props();
	let canvas: HTMLCanvasElement | undefined = $state();
	let chart: Chart | null = $state(null);

	onMount(() => {
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						label: title,
						data,
						borderColor: color,
						backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
						borderWidth: 3,
						fill: true,
						tension: 0.4,
						pointRadius: 5,
						pointBackgroundColor: color,
						pointBorderColor: '#fff',
						pointBorderWidth: 2,
						pointHoverRadius: 7
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: true,
				plugins: {
					legend: {
						display: true,
						position: 'top',
						labels: {
							usePointStyle: true,
							padding: 15,
							font: { size: 12, weight: 'bold' }
						}
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						ticks: {
							callback: function(value) {
								return '€' + value.toLocaleString('it-IT');
							}
						}
					}
				}
			}
		});

		return () => {
			chart?.destroy();
		};
	});
</script>

<canvas bind:this={canvas} id={canvasId}></canvas>

<style>
	:global(canvas) {
		max-height: 300px;
	}
</style>
