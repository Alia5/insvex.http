<script lang="ts">
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { env } from '$env/dynamic/public';
import type { PageData } from './$types';
import { lookup } from 'mime-types';
import PreviewPopup from './PreviewPopup.svelte';
export let data: PageData;
const apiHost = env.INSVEX_PUBLIC_HOST || import.meta.env.INSVEX_PUBLIC_HOST;
const apiPort = env.INSVEX_PUBLIC_PORT || import.meta.env.INSVEX_PUBLIC_PORT;

// in SPA mode thumbs need to be fetched from api
// in SSR more, internal url-handling handles api-fetching
const thumbHost = import.meta.env.INSVEX_BUILDCONFIG_SPA === 'true' ? `http://${apiHost}:${apiPort}` : '';
$: thumbPrefixPath = `${thumbHost}${data.currentPath === '/' ? '' : data.currentPath}`;

// $: files = (() => {
//     console.log($page.url);
//     return data.dirList.files;
// })();

let files = data.dirList.files || [];
let path: string | undefined = data.currentPath;
let page = data.dirList.page;
$: {
    if (path === data.currentPath) {
        if (page > data.dirList.page) {
            files = data.dirList.files;
            files = files;
        }
        files.push(...data.dirList.files.filter((file) => !files.includes(file)));
        files = files;
    } else {
        files = data.dirList.files;
        path = data.currentPath;
    }
    page = data.dirList.page;
}
if (browser) {
    if (files.length <= 100 && data.dirList.page > 1) {
        void goto('?page=1', {
            replaceState: true,
            invalidateAll: true
        });
    }
}

const handleInfScroll = (e: Event) => {
    const tgt = e.target as HTMLElement;
    if (tgt?.scrollTop >= tgt?.scrollHeight - tgt?.offsetHeight - 2 * 256) {
        void goto(`?page=${data.dirList.page + 1}`, {
            replaceState: true,
            noScroll: true
        });
    }
};

const isImage = (file: string) => {
    const mime = lookup(file.split('.')?.pop() || '');
    if (mime) {
        if (mime.startsWith('image')) {
            return true;
        }
    }
    return false;
};

let currentFile: string | undefined;
</script>

<svelte:head>
    <title>Home</title>
    <meta name="description" content="Svelte demo app" />
</svelte:head>

<section on:scroll="{handleInfScroll}">
    <div no-js-shown>
        <ul no-js-shown>
            {#each files as file}
                <li>
                    <a
                        href="{data.currentPath.endsWith('/')
                            ? data.currentPath
                            : data.currentPath + '/'}{file.path}"
                        data-sveltekit-reload="{file.isDir ? 'off' : true}">
                        {file.path}
                    </a>
                </li>
            {/each}
        </ul>
        <div class="pager">
            {#if data.dirList.page > 1}
                <a href="?page={data.dirList.page - 1}">Previous Page</a>
            {:else}
                <span></span>
            {/if}
            {#if data.dirList.page < data.dirList.totalPages}
                <a href="?page={data.dirList.page + 1}">Next Page</a>
            {:else}
                <span></span>
            {/if}
        </div>
    </div>
    <div no-js-hidden>
        <div class="file-grid">
            {#each files as file}
                {#if file.isDir}
                    <a
                        class="item-card"
                        href="{data.currentPath.endsWith('/')
                            ? data.currentPath
                            : data.currentPath + '/'}{file.path}">
                        <div class="thumb-container"></div>
                        <span>{file.path}</span>
                    </a>
                {:else}
                    <button
                        class="item-card"
                        on:click="{() => {
                            isImage(file.path);
                            currentFile = file.path;
                        }}">
                        <div class="thumb-container">
                            <img
                                id="{file.path}"
                                loading="lazy"
                                src="{thumbPrefixPath}/?thumb={file.path}"
                                alt="default-thumbnail"
                                class="thumb-img" />
                        </div>
                        <span>{file.path}</span>
                    </button>
                {/if}
            {/each}
        </div>
        <div class="load-more-container">
            {#if data.dirList.page < data.dirList.totalPages}
                <!-- <a href="?page={data.dirList.page + 1}">Load more</a> -->
                <button
                    on:click="{() => {
                        void goto(`?page=${data.dirList.page + 1}`, {
                            replaceState: true,
                            noScroll: true
                        });
                    }}">
                    Load more
                </button>
            {:else}
                <span>You've reached the end</span>
            {/if}
        </div>
    </div>
    <PreviewPopup bind:file="{currentFile}" />
</section>

<style lang="postcss">
section {
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 1em;
}

img:after {
    content: '';
    position: absolute;
    inset: 0;
    width: inherit;
    height: inherit;
    background: var(--card-background) url('http://via.placeholder.com/100?text=PlaceHolder') no-repeat center;
    color: transparent;
}

.file-grid {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(auto-fill, minmax(256px, 1fr));
    gap: 1em;
}

.item-card {
    --card-background: firebrick;
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
    & > span {
        width: 100%;
        text-align: center;
        overflow: hidden;
        padding: 1em;
        white-space: nowrap;
        text-overflow: ellipsis;
        position: absolute;
        bottom: 0;
        background-color: #000000be;
    }
}

.thumb-container {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    position: absolute;
    & > * {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}

.pager {
    width: 100%;
    padding: 1em;
    display: flex;
    justify-content: space-between;
}

.load-more-container {
    padding: 1em;
    display: grid;
    place-items: center;
}
</style>
