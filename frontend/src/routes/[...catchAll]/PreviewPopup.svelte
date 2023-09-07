<script lang="ts">
import { browser } from '$app/environment';
import { lookup } from 'mime-types';
import { fade, scale } from 'svelte/transition';
import { scaleFromId } from './transition';

export let file = '';

$: mime = lookup(file.split('.')?.pop() || '');
$: isImage = mime && mime?.startsWith('image');
$: isVideo = mime && mime?.startsWith('video');

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
        <div class="container" transition:scaleFromId="{{ id: file, duration: 200 }}">
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
    & > * {
        pointer-events: all;
    }
}

.container {
    display: grid;
    place-items: center;
    max-width: calc(100% - 10em);
    max-height: calc(100% - 5em);
    z-index: 1;
    & > * {
        max-width: 100%;
        max-height: 100%;
    }
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
}
</style>
