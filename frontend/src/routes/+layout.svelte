<script lang="ts">
import { onNavigate } from '$app/navigation';
import type { LayoutData } from './$types';
import Header from './Header.svelte';
import './styles.pcss';

export let data: LayoutData;

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

<div class="app">
    <noscript style="display: none;">
        <style>
        *[no-js-hidden] {
            display: none;
        }
        *[no-js-shown] {
            display: inherit;
        }
        </style>
    </noscript>
    <Header host="{data.host}" path="{data.path}" />
    <main>
        <slot />
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
