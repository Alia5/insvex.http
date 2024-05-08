<script lang="ts">
import { browser } from '$app/environment';
import { onMount } from 'svelte';
import IconMenu from '~icons/material-symbols/menu';

const { host, path }: { host: string; path: string } = $props();

const defaultDarkMode = !browser
    ? false
    : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

let darkMode = $state(defaultDarkMode);

const toggleTheme = () => {
    const body = document.querySelector('body');
    const hasTheme = body?.classList.contains('theme-dark') || body?.classList.contains('theme-light');
    const isDark = hasTheme ? body?.classList.contains('theme-dark') : defaultDarkMode;
    body?.classList.remove(isDark ? 'theme-dark' : 'theme-light');
    body?.classList.add(isDark ? 'theme-light' : 'theme-dark');
    window.localStorage.setItem('theme', isDark ? 'light' : 'dark');
};
onMount(() => {
    const userPrefTheme = window.localStorage.getItem('theme');
    if (userPrefTheme === 'light') {
        darkMode = false;
    } else {
        darkMode = defaultDarkMode;
    }
    if (defaultDarkMode && userPrefTheme === 'light') {
        toggleTheme();
    }
    if (!defaultDarkMode && userPrefTheme === 'dark') {
        toggleTheme();
    }
});
</script>

<header>
    <button no-js-hidden style="width: 0; padding: 0;"><IconMenu /></button>
    <div no-js-shown></div>
    <div class="breadcrumbs">
        <a href="/">{host}</a>
        {#each path
            .split('/')
            .filter((p) => !!p)
            .map((p, idx, arr) => {
                const parts = arr.slice(0, idx + 1);
                return parts.join('/');
            }) as part (part)}
            <span>/</span>
            <a href="/{part}">{part.split('/').pop()}</a>
        {/each}
    </div>

    <input
        no-js-hidden
        type="checkbox"
        class="toggle"
        checked="{!darkMode}"
        onchange="{() => toggleTheme()}" />
    <div no-js-shown class="no-js-hint">
        <span>Works best with Javascript enabled</span>
    </div>
    <a class="powered-by" href="https://github.com/Alia5/insvex.http" target="_blank"
        >Powered by<br />Insvex.http</a>
</header>

<style lang="postcss">
header {
    height: 5em;
    background-color: var(--cardColor);
    box-shadow: 0 0.1em 0.3em 0em var(--shadowColor);
    display: grid;
    padding-right: 1em;
    grid-template-columns: min-content auto min-content min-content;
    gap: 1em;
}

.powered-by {
    white-space: nowrap;
    align-self: center;
    text-align: center;
    color: var(--textColor);
    text-decoration: none;
    padding: 0.5em 1em;
    border-radius: 0.5em;
    &:hover {
        text-decoration: none;
        background-color: color-mix(in srgb, var(--textColor), transparent 80%);
    }
}

.breadcrumbs {
    display: flex;
    align-items: center;
    flex-direction: row;
    overflow: hidden;

    white-space: nowrap;

    & > span {
        padding: 0.25em;
        z-index: 2;
        font-weight: bold;
    }
    & > :first-child {
        font-size: 1.25em;
        padding: calc(1em * 0.75) 0.6em calc(1em * 0.75) 0.6em;
    }

    & > :last-child {
        white-space: nowrap;
    }
    & > :first-child {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    & > :not(:first-child, :last-child) {
        overflow: hidden;
    }

    & a {
        color: var(--textColor);
        text-decoration: none;
        font-weight: bold;
        padding: 1em 0.6em 1em 0.6em;
        border-radius: 0.5em;
        text-overflow: ellipsis;
        &:hover {
            text-decoration: none;
            background-color: color-mix(in srgb, var(--textColor), transparent 80%);
        }
    }
}

button {
    margin: 0;
    height: 100%;
    border: none;
    box-shadow: none;
    border-radius: 0;
    &:is(:hover, :focus, :active) {
        border: none;
        box-shadow: none;
    }
    &:hover {
        background-color: color-mix(in srgb, var(--textColor), transparent 80%);
    }
    & :global(svg) {
        height: 100%;
        width: auto;
    }
}

input[type='checkbox']:is(.toggle) {
    &:hover {
        &::before {
            border: 1px solid color-mix(in srgb, var(--textColor), transparent 30%);
        }
    }
    &::after {
        content: '🌙';
        background-color: color-mix(in srgb, var(--cardColor), white 20%);
    }
    &:checked {
        &::after {
            content: '☀️';
            left: calc(var(--toggle-width) - var(--toggle-height) + (var(--indicator-padding) / 2));
        }
    }
}

.no-js-hint {
    display: grid;
    place-items: center;
    & > span {
        white-space: nowrap;
    }
}
</style>
