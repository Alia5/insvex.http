<script lang="ts">
import { onNavigate } from '$app/navigation';
import type { Snippet } from 'svelte';
import type { LayoutData } from './$types';
import Header from './Header.svelte';
import './styles.pcss';
import 'unfonts.css';
// import { links } from 'unplugin-fonts/head';

const { data, children }: { data: LayoutData; children: Snippet } = $props();

onNavigate((navigation) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(document as any).startViewTransition) return;

    return new Promise((resolve) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (document as any).startViewTransition(async () => {
            resolve();
            await navigation.complete;
        });
    });
});
</script>

<svelte:head>
    <!-- TODO: Fix after  https://github.com/sveltejs/kit/issues/10089 is fixed -->
    <!-- {#each links as link (link)}
        <link {...link?.attrs || {}} />
    {/each} -->
    <title>index of {data.host}</title>
</svelte:head>
<div class="app">
    <noscript style="display: none;">
        <style>
        *[no-js-hidden] {
            display: none !important;
            &* {
                display: none !important;
            }
        }
        *[no-js-shown] {
            display: inherit !important;
        }
        </style>
    </noscript>
    <Header host={data.host} path={data.path} />
    <main>
        {@render children()}
    </main>
</div>

<style lang="postcss">
.app {
    position: absolute;
    inset: 0;
    overflow: hidden;
    display: grid;
    grid-template-rows: min-content 1fr;
}

main {
    padding: 0em;
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: grid;
}
</style>
