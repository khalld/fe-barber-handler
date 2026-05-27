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

	let { labels, data, title, color = 'rgb(40, 167, 69)', canvasId = 'barChart' }: Props = $props();
	let canvas: HTMLCanvasElement | undefined = $state();
	let chart: Chart | null = $state(null);

	onMount(() => {
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		chart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels,
				datasets: [
					{
						label: title,
						data,
						backgroundColor: [
							'rgb(13, 110, 253)',
							'rgb(40, 167, 69)',
							'rgb(255, 193, 7)',
							'rgb(23, 162, 184)',
							'rgb(220, 53, 69)',
							'rgb(111, 66, 193)'
						],
						borderColor: [
							'rgb(10, 88, 202)',
							'rgb(32, 133, 55)',
							'rgb(204, 154, 5)',
							'rgb(18, 130, 147)',
							'rgb(176, 42, 55)',
							'rgb(88, 52, 154)'
						],
						borderWidth: 1,
						borderRadius: 4
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: true,
				indexAxis: 'y',
				plugins: {
					legend: {
						display: true,
						position: 'top'
					}
				},
				scales: {
					x: {
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
