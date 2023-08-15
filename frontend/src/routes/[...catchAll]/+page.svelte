<script lang="ts">
import { env } from '$env/dynamic/public';
import type { PageData } from './$types';
export let data: PageData;
const apiHost = env.INSVEX_PUBLIC_HOST || import.meta.env.INSVEX_PUBLIC_HOST;
const apiPort = env.INSVEX_PUBLIC_PORT || import.meta.env.INSVEX_PUBLIC_PORT;

// in SPA mode thumbs need to be fetched from api
// in SSR more, internal url-handling handles api-fetching
const thumbHost = import.meta.env.INSVEX_BUILDCONFIG_SPA === 'true' ? `http://${apiHost}:${apiPort}` : '';
$: thumbPrefixPath = `${thumbHost}${data.currentPath === '/' ? '' : data.currentPath}`;
</script>

<svelte:head>
    <title>Home</title>
    <meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
    <ul no-js-shown>
        {#each data.files as file}
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
    <div no-js-hidden class="file-grid">
        {#each data.files as file}
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
                <button class="item-card" on:click="{() => console.log('meh!')}">
                    <div class="thumb-container">
                        <object
                            title="thumbnail"
                            data="{thumbPrefixPath}/?thumb={file.path}"
                            type="image/png">
                            <!-- <img
                                src="https://via.placeholder.com/256x256?text=No+thumb"
                                alt="default-thumbnail" /> -->
                            <span> err </span>
                        </object>
                    </div>
                    <span>{file.path}</span>
                </button>
            {/if}
        {/each}
    </div>
</section>

<style lang="postcss">
.file-grid {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(auto-fill, minmax(256px, 1fr));
    gap: 1em;
}

.item-card {
    overflow: hidden;
    min-height: 4em;
    position: relative;
    background-color: firebrick;
    place-items: center;
    aspect-ratio: 1/1;
    padding: 0;
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
    display: grid;
    place-items: center;
    position: absolute;
    & > * {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}
</style>
