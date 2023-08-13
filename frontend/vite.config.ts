import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import Icons from 'unplugin-icons/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    env.INSVEX_PUBLIC_HOST = env.INSVEX_HOST;
    env.INSVEX_PUBLIC_PORT = env.INSVEX_PORT;
    // load .env file to process.env to have access in svelte.config.js
    process.env = { ...process.env, ...env };

    return {
        plugins: [
            sveltekit(),
            Icons({
                autoInstall: true,
                compiler: 'svelte'
            })
        ],
        envPrefix: 'INSVEX_'
    };
});
