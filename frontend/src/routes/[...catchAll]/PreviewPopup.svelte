<script context="module" lang="ts">
import { isText as isTextCheck, mimeAdditions } from './mime-patches';
export const SUPPORTED_MIMES = ['image', 'video', 'text', 'pdf'];
// eslint-disable-next-line no-shadow
export const supportsMimeType = (mime: string) => {
    if (isTextCheck(mime)) {
        return true;
    }
    return SUPPORTED_MIMES.some((m) => mime.includes(m));
};
</script>

<script lang="ts">
import { browser } from '$app/environment';
import { lookup } from 'mime-types';
import { fade } from 'svelte/transition';
import { scaleFromId } from './transition.svelte';
import { page } from '$app/stores';
import LoadingSpinner from '../LoadingSpinner.svelte';

import CloseIcon from '~icons/material-symbols/close';
import DownloadIcon from '~icons/material-symbols/download';
import FullscreenIcon from '~icons/material-symbols/fullscreen';
import FullscreenExitIcon from '~icons/material-symbols/fullscreen-exit';
import ChevronLeft from '~icons/material-symbols/chevron-left';
import ChevronRight from '~icons/material-symbols/chevron-right';

import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark-reasonable.css';
import { onMount } from 'svelte';

// eslint-disable-next-line prefer-const
let { file = $bindable(), previewableItems = [] }: { file?: string; previewableItems?: string[] } = $props();

const currentItemIdx = $derived(previewableItems.indexOf(file || ''));

let isFullscreen = $state(false);

// TODO: fix after eslint-plugin-svelte as been updated
// eslint-disable-next-line svelte/valid-compile
const fileUrl = $derived(`${$page.url.pathname}${$page.url.pathname === '/' ? '' : '/'}${file}`);

const mime = $derived(mimeAdditions(file || '') || lookup((file || '').split('.')?.pop() || ''));
// svelte doesn't have switch blocks, so I instead opt for a bunch of separate blocks.....
const isImage = $derived(mime && mime?.includes('image'));
const isVideo = $derived(mime && mime?.includes('video'));

const isText = $derived(mime && isTextCheck(mime));
const idPdf = $derived(mime && mime?.includes('pdf'));

let isPortrait = $state(browser ? (window?.screen?.height > window?.screen?.width ? true : false) : false);

$inspect(isPortrait);

const getHighlightedText = async (url: string) => {
    try {
        const fetchRes = await fetch(url);
        if (fetchRes.ok) {
            const text = await fetchRes.text();
            let highlighted = text;
            try {
                const lang = url.split('.')?.pop();
                highlighted =
                    lang && lang
                        ? hljs.highlight(text, { language: lang }).value
                        : hljs.highlightAuto(text).value;
            } catch (e) {
                highlighted = hljs.highlightAuto(text).value;
            }
            return highlighted;
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
    }
    // eslint-disable-next-line prettier/prettier
    return 'error; can\'t fetch';
};

const close = () => {
    file = '';
    isFullscreen = false;
};
if (browser) {
    window.onkeydown = (event) => {
        if (event.key === 'Escape') {
            if (isFullscreen) {
                isFullscreen = false;
                return;
            }
            file = '';
        }
        if (event.key === 'ArrowLeft') {
            if (currentItemIdx <= 0) {
                return;
            }
            file = previewableItems[currentItemIdx - 1];
        }
        if (event.key === 'ArrowRight') {
            if (currentItemIdx + 1 >= previewableItems.length) {
                return;
            }
            file = previewableItems[currentItemIdx + 1];
        }
    };
}

onMount(() => {
    window.onresize = () => {
        isPortrait = window?.screen?.height > window?.screen?.width ? true : false;
    };
});

let previewElement: HTMLElement | undefined = $state();

let itemSizeStr = $state('');
let itemSizePrcnt = $state('');

const calculateSizePrcnt = () => {
    const fullSize = itemSizeStr.split(' x ').map((s) => parseInt(s, 10));
    const elementSize = [previewElement?.clientWidth || 0, previewElement?.clientHeight || 0];
    if (fullSize[0] && fullSize[1]) {
        const sizePrcnt = [elementSize[0] / fullSize[0], elementSize[1] / fullSize[1]];
        const minPrcnt = Math.min(...sizePrcnt);
        itemSizePrcnt = `${Math.round(100 * minPrcnt)}%`;
    }
};

const previewElementObserver = browser ? new ResizeObserver(calculateSizePrcnt) : undefined;

$effect(() => {
    if (previewElement?.tagName === 'IMG') {
        previewElement.onload = () => {
            itemSizeStr = `${(previewElement as HTMLImageElement).naturalWidth} x ${
                (previewElement as HTMLImageElement).naturalHeight
            }`;
        };
    }
    if (previewElement?.tagName === 'VIDEO' && browser) {
        previewElement.onloadedmetadata = () => {
            itemSizeStr = `${(previewElement as HTMLVideoElement).videoWidth} x ${
                (previewElement as HTMLVideoElement).videoHeight
            }`;
        };
    }

    calculateSizePrcnt();
    if (previewElement) {
        previewElementObserver?.observe(previewElement);
    }
});
</script>

<div class="popup-container {isFullscreen ? 'fullscreen' : ''}">
    {#if file && file.length > 0}
        <button
            transition:fade="{{ duration: 200 }}"
            class="scrim"
            onclick="{() => {
                if (isFullscreen) {
                    return;
                }
                file = '';
            }}"></button>
        <div
            class="container {isFullscreen ? 'fullscreen' : ''} {isPortrait ? 'portrait' : ''}"
            transition:scaleFromId|local="{{ id: file, duration: 250 }}">
            {#if isImage}
                {#key file}
                    <img src="{fileUrl}" alt="preview" bind:this="{previewElement}" transition:fade />
                {/key}
            {/if}
            {#if isVideo}
                {#key file}
                    <!-- svelte-ignore a11y_media_has_caption -->
                    <video controls bind:this="{previewElement}" transition:fade>
                        <source src="{fileUrl}" type="{mime || ''}" />
                        Your browser does not support the video tag.
                    </video>
                {/key}
            {/if}
            {#if idPdf}
                {#key file}
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <object
                        title="pdf"
                        transition:fade
                        bind:this="{previewElement}"
                        data="{`${fileUrl}#toolbar=1`}"
                        type="application/pdf"
                        width="100%"
                        height="100%">
                        <p class="no-pdf-support">
                            This browser does not support PDFs. <a
                                data-sveltekit-reload
                                target="_blank"
                                href="{`${fileUrl}`}">Download PDF</a>
                        </p>
                    </object>
                {/key}
            {/if}
            {#if isText}
                {#key file}
                    {#await getHighlightedText(fileUrl)}
                        <div transition:fade style="z-index: 0;">
                            <LoadingSpinner color="white" />
                        </div>
                    {:then res}
                        <div
                            style="z-index: 1;"
                            transition:fade
                            bind:this="{previewElement}"
                            class="code-container {isFullscreen ? 'fullscreen' : ''}">
                            <!-- eslint-disable svelte/no-at-html-tags -->
                            <pre><code
                                    class="hljs"
                                    contenteditable="true"
                                    style="outline: transparent;"
                                    onkeypress="{(e) => {
                                        e.preventDefault();
                                    }}">{@html res}</code></pre>
                        </div>
                    {:catch err}
                        <span transition:fade>
                            Error: {err}
                        </span>
                    {/await}
                {/key}
            {/if}
        </div>
        <div class="infobox {isFullscreen ? 'fullscreen' : ''}">
            <div class="file-info-container">
                <span>{file}</span>
                {#if previewElement && (isImage || isVideo)}
                    <span>{itemSizeStr}</span>
                    <span>{itemSizePrcnt}</span>
                {/if}
            </div>
            {#if previewableItems.length > 0}
                <div class="item-cycler">
                    <button
                        class="bar-button"
                        disabled="{currentItemIdx <= 0}"
                        onclick="{() => {
                            file = previewableItems[currentItemIdx - 1];
                        }}"><ChevronLeft /></button>
                    <span>{currentItemIdx + 1} / {previewableItems.length}</span>
                    <button
                        class="bar-button"
                        disabled="{currentItemIdx + 1 >= previewableItems.length}"
                        onclick="{() => {
                            file = previewableItems[currentItemIdx + 1];
                        }}"><ChevronRight /></button>
                </div>
            {/if}
            <div>
                <button class="bar-button" onclick="{() => (isFullscreen = !isFullscreen)}">
                    {#if isFullscreen}
                        <div class="icon-wrapper" transition:fade="{{ duration: 100 }}">
                            <FullscreenExitIcon />
                        </div>
                    {:else}
                        <div class="icon-wrapper" transition:fade="{{ duration: 100 }}">
                            <FullscreenIcon />
                        </div>
                    {/if}
                </button>
                <a class="bar-button" data-sveltekit-reload target="_blank" href="{fileUrl}"
                    ><DownloadIcon /></a>
                <button class="bar-button" onclick="{close}"><CloseIcon /></button>
            </div>
        </div>
    {/if}
</div>

<style lang="postcss">
.popup-container {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-rows: auto;
    place-items: center;
    margin: 0;
    padding: 0;
    outline: none;
    border-radius: 0;
    border: none;
    pointer-events: none;
    isolation: isolate;
    overflow: hidden;
    z-index: 10;

    &.fullscreen {
        grid-template-rows: auto;
    }
}

.container {
    display: grid;
    place-items: center;
    padding: 5rem 8em 5rem 8em;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
    position: relative;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    & > * {
        max-width: 100%;
        max-height: 100%;
        position: absolute;
        grid-column: 1 / span 1;
        grid-row: 1 / span 1;
    }
    & * {
        pointer-events: all;
    }

    &.fullscreen {
        padding: 0;
        background-color: black;
    }
    &.portrait {
        padding: 0;
    }
}

.code-container {
    min-width: 50%;
    overflow: auto;
    background: #282c34;
    min-height: 5em;
    display: grid;
    align-items: center;
    & > pre {
        font-size: 1.25em;
        padding: 3em;
        width: 100%;
    }
    &.fullscreen {
        min-height: 100%;
        min-width: 100%;
    }
}

.icon-wrapper {
    display: grid;
    place-items: center;
}

.infobox {
    pointer-events: all;
    width: 100%;
    background-color: var(--cardColor);
    box-shadow: 0 -0.1em 0.3em 0em var(--shadowColor);
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    white-space: nowrap;
    position: absolute;
    bottom: 0;
    z-index: 9;

    &.fullscreen {
        --textColor: var(--textColorLight);
        background-color: #00000096;
    }

    & > div {
        display: flex;
        flex-direction: row;
    }
    & > :first-child {
        justify-content: space-evenly;
    }
    & > :last-child {
        justify-content: end;
        flex-wrap: wrap;
    }

    & a {
        padding: 0 1em 0 1em;
    }
    & .bar-button {
        &[disabled] {
            opacity: 0.5;
            pointer-events: none;
        }
        margin: 0;
        height: 100%;
        border: none;
        box-shadow: none;
        border-radius: 0;
        color: var(--textColor);
        display: grid;
        place-items: center;
        & > * {
            grid-row: 1 / span 1;
            grid-column: 1 / span 1;
        }
        &:is(:hover, :focus, :active) {
            border: none;
            box-shadow: none;
        }
        &:hover {
            background-color: color-mix(in srgb, var(--textColor), transparent 80%);
        }
        & :global(svg) {
            height: 100%;
            width: 1.5em;
        }
    }
}

.item-cycler {
    display: grid;
    grid-auto-flow: column;
    place-items: center;
    flex: 1;
    justify-content: end;

    & > span {
        padding: 0 1em 0 1em;
    }
}

.file-info-container {
    display: grid;
    place-items: center;
    padding: 1em;
    gap: 2em;
    grid-auto-flow: column;
}

.no-pdf-support {
    background-color: var(--cardColor);
    position: absolute;
    padding: 1em;
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
}

.scrim {
    position: absolute;
    inset: 0;
    background-color: #000000bd;
    border: none;
    outline: none;
    cursor: unset;
    margin: 0;
    padding: 0;
    z-index: -1;
    border-radius: 0;
    pointer-events: all;
}
</style>
