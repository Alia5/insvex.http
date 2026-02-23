<script lang="ts">
  import { browser } from "$app/environment";
  import { getIcon } from "material-file-icons";
  import { mimeAdditions } from "./mime-patches";
  import { lookup } from "mime-types";

  import BackArrow from "~icons/material-symbols/subdirectory-arrow-left";
  import { onMount } from "svelte";

  const {
    file,
    prefixPath,
    isDir = false,
  }: { file: string; prefixPath: string; isDir?: boolean } = $props();

  const icon = $derived.by(() => getIcon(file));

  let thisImgEl: HTMLImageElement | undefined = $state();
  let thumbLoaded = $state(!browser);
  onMount(() => {
    if (thisImgEl?.complete && thisImgEl?.naturalHeight > 1) {
      thumbLoaded = true;
    }
  });

  let maybeIconColor = $derived.by(() => {
    let res = icon.svg.match(/fill="([^"]+)"/)?.[1];
    if (res === "none") {
      return icon.svg.match(/stroke="([^"]+)"/)?.[1];
    }
    return res;
  });
  const fileIconColor = $derived(
    maybeIconColor && maybeIconColor !== "none" ? maybeIconColor : "#000000af",
  );

  const fullImageThumbs =
    import.meta.env.INSVEX_BUILDCONFIG_SPA_FULL_IMAGE_THUMBS === "true";
  /* eslint-disable prettier/prettier */

  const shouldShowThumbImg = $state(
    import.meta.env.INSVEX_BUILDCONFIG_SPA === "true" &&
      import.meta.env.INSVEX_BUILDCONFIG_DIRECTORY_INDEX_NAME
      ? // NginX directory index mode
        false
      : true,
  );
  /* eslint-enable prettier/prettier */

  const mime = $derived(
    mimeAdditions(file) || lookup(file.split(".")?.pop() || ""),
  );
  const isImage = $derived(mime && mime?.includes("image"));
</script>

<div class="thumb-container">
  <picture>
    {#if shouldShowThumbImg || (fullImageThumbs && isImage)}
      <img
        id={file}
        loading="lazy"
        src={fullImageThumbs ? `/${file}` : `${prefixPath}/?thumb=${file}`}
        alt=""
        class="thumb-img"
        style={`opacity: ${thumbLoaded ? 1 : 0};`}
        onload={() => {
          thumbLoaded = true;
        }}
        bind:this={thisImgEl}
      />
    {/if}
    <div
      class="default-thumb-container"
      style={browser
        ? thumbLoaded
          ? "opacity: 0;"
          : "opacity: 1;"
        : "opacity: 1;"}
    >
      {#if isDir}
        <div class="dir-thumb">
          {#if file === ".."}
            <BackArrow class="backarrow" />
          {/if}
        </div>
      {:else}
        <div class="file-thumb">
          <div class={`file-icon-${icon.name}`}>
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html icon.svg}
          </div>
          <span style={`--color: ${fileIconColor};`}
            >{(file.split(".")?.pop() || "").toUpperCase()}</span
          >
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
      content: "";
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
      content: "";
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

    background-image:
      linear-gradient(to bottom left, transparent 50%, white 50%),
      linear-gradient(var(--color), var(--color)),
      linear-gradient(var(--color), var(--color));
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
      background: var(--color);
      width: 100%;
      padding: 0.25rem;
      text-align: center;
      font-weight: bold;
      overflow: hidden;
      text-overflow: ellipsis;
      transition-property: none;
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

  :global(.backarrow) {
    width: 100%;
    height: 100%;
    padding: 0.5em;
    position: absolute;
    z-index: 1;
    inset: 0;
    color: var(--textColorDark);
    opacity: 0.6;
  }
</style>
