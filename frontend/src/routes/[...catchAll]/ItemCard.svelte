<script lang="ts">
import { page } from '$app/stores';
import type { DirList } from '$lib/api/fetchDirListOrFile';
import Thumb from './Thumb.svelte';

page;

const {
    link = false,
    file,
    isScrolling = false,
    thumbPrefixPath,
    currentPath,
    onclick
}: {
    link?: boolean;
    file: DirList[number];
    isScrolling?: boolean;
    thumbPrefixPath: string;
    currentPath: string;
    onclick?: () => void;
} = $props();
</script>

{#if link}
    <a
        class="item-card"
        style="{isScrolling ? 'pointer-events: none' : ''}"
        href="{currentPath.endsWith('/') ? currentPath : currentPath + '/'}{file.path}"
        data-sveltekit-reload="{file.isDir ? 'off' : true}">
        <Thumb file="{file.path}" prefixPath="{thumbPrefixPath}" isDir="{file.isDir}" />
        <span
            >{file.path === '..'
                ? $page.url?.toString()?.split('/')?.slice(-2, -1)?.[0] || '..'
                : file.path}</span>
    </a>
{:else}
    <button
        no-js-hidden
        class="item-card"
        style="{isScrolling ? 'pointer-events: none' : ''}"
        onclick="{() => {
            onclick?.();
        }}">
        <Thumb file="{file.path}" prefixPath="{thumbPrefixPath}" />
        <span>{file.path}</span>
    </button>

    <a
        no-js-shown
        class="item-card"
        style="{isScrolling ? 'pointer-events: none' : ''}"
        href="{currentPath.endsWith('/') ? currentPath : currentPath + '/'}{file.path}"
        data-sveltekit-reload="{file.isDir ? 'off' : true}">
        <Thumb file="{file.path}" prefixPath="{thumbPrefixPath}" isDir="{file.isDir}" />
        <span>{file.path}</span>
    </a>
{/if}

<style lang="postcss">
.item-card {
    --card-background: var(--cardColor);
    overflow: hidden;
    min-height: 4em;
    position: relative;
    background-color: var(--card-background);
    place-items: center;
    aspect-ratio: 1/1;
    padding: 0;
    border: none;
    outline: none;
    border-radius: 1em;
    box-shadow: 0 1px 4px 0 var(--shadowColor);
    transition-duration: 100ms;
    & > span {
        width: 100%;
        text-align: center;
        overflow: hidden;
        padding: 1em;
        white-space: nowrap;
        text-overflow: ellipsis;
        position: absolute;
        bottom: 0;
        color: var(--textColorLight);
        background-color: #000000be;
    }
    &:hover {
        scale: 1.033;
        box-shadow: 0 1px 16px 4px #0000008b;
        z-index: 1;
    }
}
</style>
