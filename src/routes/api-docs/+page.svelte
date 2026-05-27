<script lang="ts">
	import { onMount } from 'svelte';

	onMount(() => {
		const loadScript = (src: string): Promise<void> =>
			new Promise((resolve, reject) => {
				const el = document.createElement('script');
				el.src = src;
				el.onload = () => resolve();
				el.onerror = reject;
				document.head.appendChild(el);
			});

		const CDN = 'https://unpkg.com/swagger-ui-dist@5.17.14';

		loadScript(`${CDN}/swagger-ui-bundle.js`)
			.then(() => loadScript(`${CDN}/swagger-ui-standalone-preset.js`))
			.then(() => {
				const win = window as any;
				win.SwaggerUIBundle({
					url: '/openapi.json',
					dom_id: '#swagger-ui',
					presets: [win.SwaggerUIBundle.presets.apis, win.SwaggerUIStandalonePreset],
					layout: 'StandaloneLayout',
					deepLinking: true,
					displayRequestDuration: true,
					filter: true,
					tryItOutEnabled: true,
					defaultModelsExpandDepth: 1,
					defaultModelExpandDepth: 2,
					docExpansion: 'list'
				});
			});
	});
</script>

<svelte:head>
	<title>API Docs — Barbershop</title>
	<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
</svelte:head>

<div id="swagger-ui"></div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}

	#swagger-ui {
		min-height: 100vh;
	}

	:global(.swagger-ui .topbar) {
		background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
	}

	:global(.swagger-ui .topbar .download-url-wrapper) {
		display: none;
	}

	:global(.swagger-ui .topbar-wrapper .link span) {
		display: none;
	}

	:global(.swagger-ui .topbar-wrapper .link::after) {
		content: 'Barbershop API';
		color: #fff;
		font-size: 1.1rem;
		font-weight: 700;
	}

	:global(.swagger-ui .topbar-wrapper img) {
		display: none;
	}
</style>
