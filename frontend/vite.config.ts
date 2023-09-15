/* eslint-disable no-console */
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import Icons from 'unplugin-icons/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import Unfonts from 'unplugin-fonts/vite';


export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    env.INSVEX_PUBLIC_HOST = env.INSVEX_HOST;
    env.INSVEX_PUBLIC_PORT = env.INSVEX_PORT;
    // load .env file to process.env to have access in svelte.config.js
    process.env = { ...process.env, ...env };

    return {
        plugins: [
            sveltekit(),
            Unfonts({
                google: {
                    families: [
                        {
                            name: 'Noto Sans',
                            styles: 'ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900'
                            ,defer: false
                        },
                        'Noto Color Emoji'
                    ]
                }
            }),
            Icons({
                autoInstall: true,
                compiler: 'svelte',
                scale: 1.2,
                transform: (svg) => svg.replace(/^<svg /, '<svg ')
            }),
            nodePolyfills({
                include: ['path']
            })
        ],
        envPrefix: 'INSVEX_',
        build: {
            sourcemap: true
        }
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
