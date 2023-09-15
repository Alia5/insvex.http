import adapterNode from '@sveltejs/adapter-node';
import adapterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';


/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: process.env.INSVEX_BUILDCONFIG_SPA === 'true'
            ? adapterStatic({
                fallback: 'index.html',
            })
            : adapterNode(), // keep adapter-node; is bun compatible
        env: {
            privatePrefix: 'INSVEX_',
            publicPrefix: 'INSVEX_PUBLIC_'
        },
	},
    package: {
        emitTypes: true,
    }
};

if (process.env.INSVEX_BUILDCONFIG_SPA !== 'true' && process.env.INSVEX_BUILDCONFIG_DIRECTORY_INDEX_NAME) {
    console.error('INSVEX_BUILDCONFIG_DIRECTORY_INDEX_NAME is only compatible with SPA mode.')
    process.exit(1);
}

export default config;
