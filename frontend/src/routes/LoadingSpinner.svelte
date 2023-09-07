<script lang="ts">
export let strokeWidth: number | string = 4;
export let color = 'var(--textColor)';
</script>

<svg class="circular">
    <circle
        class="path"
        cx="50%"
        cy="50%"
        r="20%"
        fill="none"
        stroke-width="{typeof strokeWidth === 'string' ? strokeWidth : `${strokeWidth}px`}"
        stroke-miterlimit="10"
        style="{`--color: ${color};`}"></circle>
</svg>

<style lang="postcss">
.circular {
    animation: rotate 2s linear infinite;
    height: 6em;
    position: relative;
    width: 6em;
}

.path {
    stroke-dasharray: 1%, 200%;
    stroke-dashoffset: 0%;
    animation: dash 1.5s ease-in-out infinite;
    stroke-linecap: round;
    stroke: var(--color);
}

@keyframes rotate {
    100% {
        transform: rotate(360deg);
    }
}
@keyframes dash {
    0% {
        stroke-dasharray: 1%, 200%;
        stroke-dashoffset: 0%;
    }
    50% {
        stroke-dasharray: 89%, 200%;
        stroke-dashoffset: -35%;
    }
    100% {
        stroke-dasharray: 89%, 200%;
        stroke-dashoffset: -124%;
    }
}
</style>
