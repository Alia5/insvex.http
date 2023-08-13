<script>
import Header from './Header.svelte';
import './styles.pcss';
</script>

<div class="app">
    <Header />
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
