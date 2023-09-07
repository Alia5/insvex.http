<script lang="ts">
import { browser } from '$app/environment';
import { getIcon } from 'material-file-icons';
import { onMount } from 'svelte';

export let file: string;
export let prefixPath: string;
export let isDir = false;

$: iconSvg = getIcon(file).svg;

let thisImgEl: HTMLImageElement;
let thumbLoaded = !browser;
onMount(() => {
    if (thisImgEl.complete && thisImgEl.naturalHeight > 1) {
        thumbLoaded = true;
    }
});
</script>

<div class="thumb-container">
    <picture>
        <img
            id="{file}"
            loading="lazy"
            src="{prefixPath}/?thumb={file}"
            alt=""
            class="thumb-img"
            style="{`opacity: ${thumbLoaded ? 1 : 0};`}"
            on:load="{() => {
                thumbLoaded = true;
            }}"
            bind:this="{thisImgEl}" />
        <div
            class="default-thumb-container"
            style="{browser ? (thumbLoaded ? 'opacity: 0;' : 'opacity: 1;') : 'opacity: 1;'}">
            {#if isDir}
                <div class="dir-thumb"></div>
            {:else}
                <div class="file-thumb">
                    <div>
                        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                        {@html iconSvg}
                    </div>
                    <span>{(file.split('.')?.pop() || '').toUpperCase()}</span>
                </div>
            {/if}
        </div>
    </picture>
</div>

<style lang="postcss">
.thumb-container {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    position: absolute;
    isolation: isolate;
}

picture {
    position: relative;
    display: grid;
    place-items: center;
    isolation: isolate;
    width: 100%;
    height: 100%;
}

.default-thumb-container {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    translate: 0 -1em;
    z-index: 1;
}

.dir-thumb {
    --width: 5.5em;
    --height: 4em;
    --color: #cfcfcf;
    --border-radius: 0.5em;
    --shadow: 0.2em 0.2em 0.2em var(--shadowColor);
    position: relative;
    width: var(--width);
    height: var(--height);
    &::before {
        content: '';
        position: absolute;
        width: calc(var(--width) * 0.45);
        height: var(--height);
        left: 0;
        top: calc(var(--border-radius) * -1.2);
        background: var(--color);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
    }
    &::after {
        content: '';
        position: absolute;
        width: var(--width);
        height: var(--height);
        background: var(--color);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
    }
}

.file-thumb {
    --color: #cfcfcf;
    --shadow: 0.2em 0.2em 0.2em var(--shadowColor);
    width: 5.5em;
    height: 7em;
    position: relative;
    display: grid;
    place-items: center;
    grid-template-rows: auto min-content;
    border-radius: 0.5em 0.5em 0.5em 0.5em;
    overflow: hidden;
    filter: drop-shadow(var(--shadow));

    background-image: linear-gradient(to bottom left, transparent 50%, white 50%),
        linear-gradient(var(--color), var(--color)), linear-gradient(var(--color), var(--color));
    background-size:
        25px 25px,
        100% 100%,
        100% 100%;
    background-position:
        100% 0%,
        -25px 0%,
        100% 25px;
    background-repeat: no-repeat;

    & > div {
        padding: 1.5em 1.5em 0 1.5em;
    }

    & > span {
        color: var(--textColorLight);
        background: #627bf8;
        width: 100%;
        padding: 0.25rem;
        text-align: center;
        font-weight: bold;
        letter-spacing: 0.15em;
        line-height: 1.5em;
        overflow: hidden;
        font-size: 1em;
        text-overflow: ellipsis;
    }
}

.thumb-img {
    color: transparent;
    object-fit: auto;
    z-index: 2;
    width: 100%;
    height: 100%;
    text-indent: -100vh;
}
</style>
