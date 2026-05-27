<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	interface Props {
		labels: string[];
		data: number[];
		title: string;
		canvasId?: string;
	}

	let { labels, data, title, canvasId = 'doughnutChart' }: Props = $props();
	let canvas: HTMLCanvasElement | undefined = $state();
	let chart: Chart | null = $state(null);

	const colors = [
		'rgb(13, 110, 253)',
		'rgb(40, 167, 69)',
		'rgb(255, 193, 7)',
		'rgb(23, 162, 184)',
		'rgb(220, 53, 69)',
		'rgb(111, 66, 193)',
		'rgb(253, 126, 20)',
		'rgb(32, 201, 201)'
	];

	onMount(() => {
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		chart = new Chart(ctx, {
			type: 'doughnut',
			data: {
				labels,
				datasets: [
					{
						label: title,
						data,
						backgroundColor: colors.slice(0, labels.length),
						borderColor: '#fff',
						borderWidth: 2
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: true,
				plugins: {
					legend: {
						display: true,
						position: 'bottom',
						labels: {
							padding: 20,
							font: { size: 12 }
						}
					},
					tooltip: {
						callbacks: {
							label: function(context) {
								const total = context.dataset.data.reduce((a: number, b: any) => a + b, 0);
								const percentage = ((context.parsed as number) / total * 100).toFixed(1);
								return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
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
