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
    {#if data.error}
        <p class="error">{data.error.message}</p>
    {:else}
        <ul>
            {#each data.files as file}
                <li>{file}</li>
            {/each}
        </ul>
    {/if}
</section>
<style>
</style>
