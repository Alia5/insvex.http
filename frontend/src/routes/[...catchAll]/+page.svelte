<script lang="ts">
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { env } from '$env/dynamic/public';
import type { PageData } from './$types';
import { lookup } from 'mime-types';
import PreviewPopup, { SUPPORTED_MIMES } from './PreviewPopup.svelte';
import Thumb from './Thumb.svelte';
import LoadingSpinner from '../LoadingSpinner.svelte';
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
let loadingMore = false;

const handleInfScroll = (e: Event) => {
    const tgt = e.target as HTMLElement;
    if (tgt?.scrollTop >= tgt?.scrollHeight - tgt?.offsetHeight - 2 * 256) {
        if (loadingMore) return;
        loadingMore = true;
        void goto(`?page=${data.dirList.page + 1}`, {
            replaceState: true,
            noScroll: true
        }).finally(() => {
            loadingMore = false;
        });
    }
};

const getMimeStart = (file: string) => {
    const mime = lookup(file.split('.')?.pop() || '');
    if (mime) {
        return mime.split('/')[0];
    }
    return '';
};

const isImage = (file: string) => {
    const mimeStart = getMimeStart(file);
    return mimeStart === 'image';
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
                {#if file.isDir || !SUPPORTED_MIMES.includes(getMimeStart(file.path))}
                    <a
                        class="item-card"
                        href="{data.currentPath.endsWith('/')
                            ? data.currentPath
                            : data.currentPath + '/'}{file.path}"
                        data-sveltekit-reload="{file.isDir ? 'off' : true}">
                        <Thumb file="{file.path}" prefixPath="{thumbPrefixPath}" isDir="{file.isDir}" />
                        <span>{file.path}</span>
                    </a>
                {:else}
                    <button
                        class="item-card"
                        on:click="{() => {
                            isImage(file.path);
                            currentFile = file.path;
                        }}">
                        <Thumb file="{file.path}" prefixPath="{thumbPrefixPath}" />
                        <span>{file.path}</span>
                    </button>
                {/if}
            {/each}
        </div>
        <div class="load-more-container">
            {#if data.dirList.page < data.dirList.totalPages}
                <!-- <a href="?page={data.dirList.page + 1}">Load more</a> -->
                {#if !loadingMore}
                    <button
                        on:click="{() => {
                            loadingMore = true;
                            void goto(`?page=${data.dirList.page + 1}`, {
                                replaceState: true,
                                noScroll: true
                            }).finally(() => {
                                loadingMore = false;
                            });
                        }}">
                        Load more
                    </button>
                {:else}
                    <LoadingSpinner />
                {/if}
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

.file-grid {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(auto-fill, minmax(256px, 1fr));
    gap: 1em;
}

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
