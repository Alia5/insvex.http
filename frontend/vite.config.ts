import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
    plugins: [
        sveltekit(),
        Icons({
            autoInstall: true,
            compiler: 'svelte'
        })
    ],
    envPrefix: 'INSVEX_'
});
