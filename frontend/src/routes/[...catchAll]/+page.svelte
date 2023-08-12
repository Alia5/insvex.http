<script lang="ts">
import type { PageData } from './$types';

export let data: PageData;

console.log(import.meta.env.INSVEX_HOST);
</script>

<svelte:head>
    <title>Home</title>
    <meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
    <ul>
        {#each data.files as file}
            <li>
                <a
                    href="{data.currentPath.endsWith('/')
                        ? data.currentPath
                        : data.currentPath + '/'}{file.path}"
                    data-sveltekit-reload="{file.isDir ? 'off' : true}">
                    {file.path}
                </a>
            </li>
        {/each}
    </ul>
</section>

<style>
</style>
