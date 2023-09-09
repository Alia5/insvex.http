<script lang="ts">
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { env } from '$env/dynamic/public';
import type { PageData } from './$types';
import { lookup } from 'mime-types';
import PreviewPopup, { supportsMimeType as previewSupportsType } from './PreviewPopup.svelte';
import LoadingSpinner from '../LoadingSpinner.svelte';
import { onMount } from 'svelte';
import ItemCard from './ItemCard.svelte';
import { mimeAdditions } from './mime-patches';
import type { DirList } from '$lib/api/fetchDirListOrFile';

export let data: PageData;
const apiHost = env.INSVEX_PUBLIC_HOST || import.meta.env.INSVEX_PUBLIC_HOST;
const apiPort = env.INSVEX_PUBLIC_PORT || import.meta.env.INSVEX_PUBLIC_PORT;

// in SPA mode thumbs need to be fetched from api
// in SSR more, internal url-handling handles api-fetching
let thumbHost = '';
if (import.meta.env.INSVEX_BUILDCONFIG_SPA) {
    thumbHost = `${!apiHost || apiHost?.startsWith('http') ? '' : 'http://'}${apiHost}${
        apiPort ? ':' : ''
    }${apiPort}`;
}

$: thumbPrefixPath = `${thumbHost}${data.currentPath === '/' ? '' : data.currentPath}`;

let files: DirList = data.dirList.files || [];
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

const getMime = (file: string) => {
    const addition = mimeAdditions(file);
    return addition || lookup(file.split('.')?.pop() || '');
};

let currentFile: string | undefined;

let isScrolling = false;
onMount(() => {
    window.onscroll = () => (isScrolling = true);

    setInterval(() => {
        if (isScrolling) {
            isScrolling = false;
        }
    }, 100);
});
</script>

<svelte:head>
    <title>Home</title>
    <meta name="description" content="Insvex.http" />
</svelte:head>

<section on:scroll="{handleInfScroll}">
    <div class="file-grid">
        {#each files as file (file.path)}
            {#if file.isDir || !previewSupportsType(getMime(file.path) || '')}
                <ItemCard
                    link
                    file="{file}"
                    isScrolling="{isScrolling}"
                    thumbPrefixPath="{thumbPrefixPath}"
                    currentPath="{data.currentPath}" />
            {:else}
                <ItemCard
                    file="{file}"
                    isScrolling="{isScrolling}"
                    thumbPrefixPath="{thumbPrefixPath}"
                    currentPath="{data.currentPath}"
                    on:click="{() => {
                        currentFile = file.path;
                    }}" />
            {/if}
        {/each}
    </div>
    <div class="load-more-container" no-js-hidden>
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
    <div class="pager" no-js-shown>
        <div>
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
    <!-- eslint-disable prettier/prettier -->
    <PreviewPopup
        bind:file="{currentFile}"
        previewableItems="{files
            .filter((f) => !f.isDir && previewSupportsType(getMime(f.path) || ''))
            .map((f) => f.path)
        }" />
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

.pager {
    width: 100%;
    & > div {
        padding: 1em;
        display: flex;
        justify-content: space-between;
        & a {
            color: var(--textColor);
            text-decoration: none;
            font-weight: bold;
            padding: 1em 0.6em 1em 0.6em;
            border-radius: 0.5em;
            &:hover {
                text-decoration: none;
                background-color: color-mix(in srgb, var(--textColor), transparent 80%);
            }
        }
    }
}

.load-more-container {
    padding: 1em;
    display: grid;
    place-items: center;
}
</style>
