<script context="module" lang="ts">
/* eslint-disable max-lines */
import { isText as isTextCheck, mimeAdditions } from './mime-patches';
export const SUPPORTED_MIMES = ['image', 'video', 'text', 'pdf'];
// eslint-disable-next-line no-shadow, prettier/prettier
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
import { scaleFromId } from './transition';
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

export let file = '';
export let previewableItems: string[] = [];
$: currentItemIdx = previewableItems.indexOf(file);

let isFullscreen = false;

$: fileUrl = `${$page.url.pathname}${$page.url.pathname === '/' ? '' : '/'}${file}`;

$: mime = mimeAdditions(file) || lookup(file.split('.')?.pop() || '');
// svelte doesn't have switch blocks, so I instead opt for a bunch of separate blocks.....
$: isImage = mime && mime?.includes('image');
$: isVideo = mime && mime?.includes('video');
// eslint-disable-next-line prettier/prettier
$: isText = mime && isTextCheck(mime);
$: idPdf = mime && mime?.includes('pdf');

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

let previewElement: HTMLElement | undefined;

let itemSizeStr = '';
let itemSizePrcnt = '';

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
/* eslint-disable prettier/prettier */
$: {
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
};


</script>

<div class="popup-container {isFullscreen ? 'fullscreen' : ''}">
    {#if file && file.length > 0}
        <button
            transition:fade="{{ duration: 200 }}"
            class="scrim"
            on:click="{() => {
                if (isFullscreen) {
                    return;
                }
                file = '';
            }}"></button>
        <div
            class="container {isFullscreen ? 'fullscreen' : ''}"
            transition:scaleFromId="{{ id: file, duration: 250 }}">
            {#if isImage}
                <img src="{fileUrl}" alt="preview" bind:this="{previewElement}" />
            {/if}
            {#if isVideo}
                <!-- svelte-ignore a11y-media-has-caption -->
                <video controls bind:this="{previewElement}">
                    <source src="{fileUrl}" type="{mime || ''}" />
                    Your browser does not support the video tag.
                </video>
            {/if}
            {#if idPdf}
                <!-- svelte-ignore a11y-missing-attribute -->
                <object
                    bind:this="{previewElement}"
                    data="{`${fileUrl}#toolbar=1`}"
                    type="application/pdf"
                    width="100%"
                    height="100%">
                    <p>
                        This browser does not support PDFs. <a
                            data-sveltekit-reload
                            target="_blank"
                            href="{`${fileUrl}`}">Download PDF</a>
                    </p>
                </object>
            {/if}
            {#if isText}
                {#await getHighlightedText(fileUrl)}
                    <LoadingSpinner color="white" />
                {:then res}
                    <div
                        bind:this="{previewElement}"
                        class="code-container {isFullscreen ? 'fullscreen' : ''}">
                        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                        <pre><code class="hljs">{@html res}</code></pre>
                    </div>
                {:catch err}
                    <span>
                        Error: {err}
                    </span>
                {/await}
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
            <div>
                {#if previewableItems.length > 0}
                <div class="item-cycler">
                    <button class="bar-button" disabled={currentItemIdx <= 0} on:click={() => {
                        file = previewableItems[currentItemIdx-1];
                    }}><ChevronLeft /></button>
                    <span>{currentItemIdx + 1} / {previewableItems.length}</span>
                    <button class="bar-button" disabled={currentItemIdx+1 >= previewableItems.length} on:click={() => {
                        file = previewableItems[currentItemIdx+1];
                    }}><ChevronRight /></button>
                </div>
                {/if}
                <button class="bar-button" on:click="{() => (isFullscreen = !isFullscreen)}">
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
                <button class="bar-button" on:click="{close}"><CloseIcon /></button>
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
    & > * {
        max-width: 100%;
        max-height: 100%;
        overflow: hidden;
    }
    & * {
        pointer-events: all;
    }

    &.fullscreen {
        padding: 0;
        background-color: black;
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
    display: grid;
    grid-template-columns: min-content auto min-content;
    white-space: nowrap;
    position: absolute;
    bottom: 0;

    &.fullscreen {
        --textColor: var(--textColorLight);
        background-color: #00000096;
    }

    & > div {
        display: flex;
        flex-direction: row;
    }
    & > :first-child {
        grid-column: 1 / span 1;
    }
    & > :last-child {
        grid-column: 3 / span 1;
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

.scrim {
    position: absolute;
    inset: 0;
    background-color: #000000bd;
    border: none;
    outline: none;
    cursor: unset;
    margin: 0;
    pading: 0;
    z-index: -1;
    border-radius: 0;
    pointer-events: all;
}
</style>
