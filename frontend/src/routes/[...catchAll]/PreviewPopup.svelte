<script context="module" lang="ts">
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

import CloseIcon from '~icons/material-symbols/close';
import DownloadIcon from '~icons/material-symbols/download';
import FullscreenIcon from '~icons/material-symbols/fullscreen';
import FullscreenExitIcon from '~icons/material-symbols/fullscreen-exit';
import LoadingSpinner from '../LoadingSpinner.svelte';

import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark-reasonable.css';

export let file = '';

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
    };
}
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
                <img src="{fileUrl}" alt="preview" />
            {/if}
            {#if isVideo}
                <!-- svelte-ignore a11y-media-has-caption -->
                <video controls>
                    <source src="{fileUrl}" type="{mime || ''}" />
                    Your browser does not support the video tag.
                </video>
            {/if}
            {#if idPdf}
                <!-- svelte-ignore a11y-missing-attribute -->
                <object data="{`${fileUrl}#toolbar=1`}" type="application/pdf" width="100%" height="100%">
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
                    <div class="code-container {isFullscreen ? 'fullscreen' : ''}">
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
            <div></div>
            <div>
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
    grid-template-rows: auto min-content;
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
    padding: 2rem 8em 2rem 8em;
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

    &.fullscreen {
        --textColor: var(--textColorLight);
        position: absolute;
        bottom: 0;
        background-color: #000000bd;
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
