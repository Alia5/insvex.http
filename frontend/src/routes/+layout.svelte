<script lang="ts">
import type { LayoutData } from './$types';
import Header from '../lib/components/Header.svelte';
import './styles.pcss';

export let data: LayoutData;
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
    grid-template-rows: min-content auto;
    gap: 1em;
}

main {
    padding: 1em;
    overflow: auto;
}
</style>
