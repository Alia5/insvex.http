<script context="module" lang="ts">
export const SUPPORTED_MIMES = ['image', 'video', 'text'];
// eslint-disable-next-line no-shadow, prettier/prettier
export const supportsMimeType = (mime: string) => (
    SUPPORTED_MIMES.some((m) => mime.includes(m))
);
</script>

<script lang="ts">
import { browser } from '$app/environment';
import { lookup } from 'mime-types';
import { fade } from 'svelte/transition';
import { scaleFromId } from './transition';
import { page } from '$app/stores';

export let file = '';

$: mime = lookup(file.split('.')?.pop() || '');
// svelte doesn't have switch blocks, so I instead opt for a bunch of separate blocks.....
$: isImage = mime && mime?.includes('image');
$: isVideo = mime && mime?.includes('video');
$: isText = mime && mime?.includes('text');

if (browser) {
    window.onkeydown = (event) => {
        if (event.key === 'Escape') {
            file = '';
        }
    };
}
</script>

<div class="popup-container">
    {#if file && file.length > 0}
        <button
            transition:fade="{{ duration: 200 }}"
            class="scrim"
            on:click="{() => (file = '')}"
            on:keydown="{(event) => {
                if (event.key === 'Escape') {
                    file = '';
                }
            }}"></button>
        <div class="container" transition:scaleFromId="{{ id: file, duration: 250 }}">
            {#if isImage}
                <img src="{file}" alt="preview" />
            {/if}
            {#if isVideo}
                <!-- svelte-ignore a11y-media-has-caption -->
                <video controls>
                    <source src="{file}" type="{mime || ''}" />
                    Your browser does not support the video tag.
                </video>
            {/if}
            {#if isText}
                {#await fetch(`${$page.url.pathname}${$page.url.pathname === '/' ? '' : '/'}${file}`)}
                    Loading...
                {:then t}
                    {#if t.ok}
                        {#await t.text()}
                            Loading...
                        {:then text}
                            <textarea readonly>{text}</textarea>
                        {:catch}
                            Error
                        {/await}
                    {:else}
                        Error
                    {/if}
                {/await}
            {/if}
        </div>
    {/if}
</div>

<style lang="postcss">
.popup-container {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    margin: 0;
    padding: 0;
    outline: none;
    border-radius: 0;
    border: none;
    pointer-events: none;
    isolation: isolate;
    z-index: 2;
}

.container {
    display: grid;
    place-items: center;
    max-width: calc(100% - 10em);
    max-height: calc(100% - 5em);
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    & > * {
        max-width: 100%;
        max-height: 100%;
        pointer-events: all;
    }
}

textarea {
    resize: none;
    width: 100%;
    height: 100%;
    padding: 1.5em;
}

.scrim {
    position: absolute;
    inset: 0;
    background-color: #000000da;
    border: none;
    outline: none;
    cursor: unset;
    margin: 0;
    pading: 0;
    z-index: 0;
    border-radius: 0;
    pointer-events: all;
}
</style>
