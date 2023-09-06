import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import Icons from 'unplugin-icons/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';


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
            }),
            nodePolyfills({
                include: ['path']
            })
        ],
        envPrefix: 'INSVEX_'
    };
});

process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
        process.exit(1);
    })
    .on('uncaughtException', (err) => {
        console.error(err, 'Uncaught Exception thrown');
        process.exit(1);
    });
