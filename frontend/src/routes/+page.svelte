<script lang="ts">
import type { PageData } from './$types';

export let data: PageData;

</script>

<svelte:head>
    <title>Home</title>
    <meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
    <ul>
        {#each data.files as file}
            <li>{file}</li>
        {/each}
    </ul>   
</section>

<style>
</style>
