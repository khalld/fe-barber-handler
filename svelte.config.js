import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			// Puoi lasciare vuoto per le opzioni di default
			// out: 'build'  // cartella di output (default: build)
		})
	}
};

export default config;