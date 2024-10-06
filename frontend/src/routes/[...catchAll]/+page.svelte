<script lang="ts">
import { browser } from '$app/environment';
import { goto, invalidateAll } from '$app/navigation';
import { env } from '$env/dynamic/public';
import type { PageData } from './$types';
import { lookup } from 'mime-types';
import PreviewPopup, { supportsMimeType as previewSupportsType } from './PreviewPopup.svelte';
import LoadingSpinner from '../LoadingSpinner.svelte';
import { onMount } from 'svelte';
import ItemCard from './ItemCard.svelte';
import { mimeAdditions } from './mime-patches';
import type { DirList } from '$lib/api/fetchDirListOrFile';
import { applyAction, enhance } from '$app/forms';

const { data }: { data: PageData } = $props();

const apiHost = env.INSVEX_PUBLIC_HOST || import.meta.env.INSVEX_PUBLIC_HOST;
const apiPort = env.INSVEX_PUBLIC_PORT || import.meta.env.INSVEX_PUBLIC_PORT;

// in SPA mode thumbs need to be fetched from api
// in SSR more, internal url-handling handles api-fetching
/* eslint-disable prettier/prettier */
const thumbHost = $state(
    import.meta.env.INSVEX_BUILDCONFIG_SPA
        ? (
            `${!apiHost || apiHost?.startsWith('http') ? '' : 'http://'}${apiHost}${
                apiPort ? ':' : ''
            }${apiPort}`
        )
        : ''
);
/* eslint-enable prettier/prettier */

const thumbPrefixPath = $derived(`${thumbHost}${data.currentPath === '/' ? '' : data.currentPath}`);

let files: DirList = $state(data.dirList.files || []);
let path: string | undefined = $state(data.currentPath);
let page = $state(data.dirList.page);
const unauthorized = $state(data.unauthorized || false);
let loading = $state(false);

$effect(() => {
    if (path === data.currentPath) {
        if (page > data.dirList.page) {
            files = data.dirList.files;
            files = files;
        }
        files.push(...(data.dirList.files || []).filter((file) => !files.includes(file)));
        files = files;
    } else {
        files = data.dirList.files;
        path = data.currentPath;
    }
    page = data.dirList.page;
});

onMount(() => {
    if (browser) {
        if (files.length <= 100 && data.dirList.page > 1) {
            void goto('?page=1', {
                replaceState: true,
                invalidateAll: true
            });
        }
    }
});
let loadingMore = $state(false);

const handleInfScroll = (e: Event) => {
    const tgt = e.target as HTMLElement;
    if (tgt?.scrollTop >= tgt?.scrollHeight - tgt?.offsetHeight - 2 * 256) {
        if (data.dirList.page >= data.dirList.totalPages) return;
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

let currentFile: string | undefined = $state();

let isScrolling = $state(false);
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
    <meta name="description" content="Insvex.http" />
</svelte:head>

{#if unauthorized}
    <section>
        <div class="centered">
            <form
                method="post"
                use:enhance="{async () => {
                    loading = true;
                    return async ({ update, result }) => {
                        await update({ reset: false });
                        loading = false;
                        await applyAction(result);
                        // data-loading workaround...
                        await window.location.reload();
                    };
                }}">
                <h1>Login Required</h1>
                <input type="text" name="user" placeholder="Username" />
                <input type="password" name="password" placeholder="Password" />
                {#if loading}
                    <LoadingSpinner />
                {:else}
                    <button>Login</button>
                {/if}
            </form>
        </div>
    </section>
{:else}
    <section onscroll="{handleInfScroll}">
        <div class="file-grid">
            {#if data.path !== '/'}
                {#key '..'}
                    <ItemCard
                        link
                        file="{{
                            isDir: true,
                            path: '..'
                        }}"
                        isScrolling="{isScrolling}"
                        thumbPrefixPath="{thumbPrefixPath}"
                        currentPath="{data.currentPath}" />
                {/key}
            {/if}
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
                        onclick="{() => {
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
                        onclick="{() => {
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
        previewableItems="{(files || [])
            .filter((f) => !f.isDir && previewSupportsType(getMime(f.path) || ''))
            .map((f) => f.path)
        }" />
</section>
{/if}

<style lang="postcss">
section {
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 1em;
}

.centered {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    & > :first-child {
        display: grid;
        gap: 1em;
        & > :first-child {
            font-size: 2em;
        }
    }
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
