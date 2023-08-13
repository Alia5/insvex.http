<script lang="ts">
import { browser } from '$app/environment';
import IconMenu from '~icons/ic/baseline-menu';

export let host: string;
export let path: string;

const defaultDarkMode = !browser
    ? false
    : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const toggleMode = () => {
    if (!browser) {
        return;
    }
    const body = document.querySelector('body');
    const hasTheme = body?.classList.contains('theme-dark') || body?.classList.contains('theme-light');
    const isDark = hasTheme ? body?.classList.contains('theme-dark') : defaultDarkMode;
    body?.classList.remove(isDark ? 'theme-dark' : 'theme-light');
    body?.classList.add(isDark ? 'theme-light' : 'theme-dark');
};

console.log(
    'path',
    path
        .split('/')
        .filter((p) => !!p)
        .map((p, idx, arr) => {
            const parts = arr.slice(0, idx + 1);
            return parts.join('/');
        })
);
</script>

<header>
    <button><IconMenu /></button>
    <div class="breadcrumbs">
        <a href="/">{host}</a>
        {#each path
            .split('/')
            .filter((p) => !!p)
            .map((p, idx, arr) => {
                const parts = arr.slice(0, idx + 1);
                return parts.join('/');
            }) as part}
            <a href="/{part}">{part.split('/').pop()}</a>
        {/each}
    </div>
    <button on:click="{toggleMode}">ColorMode</button>
</header>

<style lang="postcss">
header {
    height: 5em;
    background-color: var(--cardColor);
    box-shadow: 0 1em 1em 1em var(--shadowColor);
    display: grid;
    padding: 1em;
    grid-template-columns: min-content auto min-content;
    gap: 1em;
}

.breadcrumbs {
    display: flex;
    align-items: center;
    gap: 0.5em;
    flex-direction: row;
}
</style>
