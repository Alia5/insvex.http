<script lang="ts">
import { browser } from '$app/environment';

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
</script>

<header>
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
</style>
