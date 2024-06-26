import { cubicIn } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

let lastId = $state('');

export const scaleFromId = (
    node: HTMLElement,
    params: {
        id?: string;
        delay?: number;
        duration?: number | ((dn: number) => number);
        easing?: (t: number) => number;
    } = {}
) => {
    if (params.id) {
        lastId = params.id;
    }
    const fromEl = document.querySelector(`#${CSS.escape(params.id || lastId) || 'main'}`);

    const rootEl = document.querySelector('.app');

    const dXY = {
        x:
            (fromEl?.getBoundingClientRect().x || 0) -
            (rootEl?.getBoundingClientRect().width || 0) / 2 +
            (fromEl?.getBoundingClientRect().width || 0) / 2,
        y:
            (fromEl?.getBoundingClientRect().y || 0) -
            (rootEl?.getBoundingClientRect().height || 0) / 2 +
            (fromEl?.getBoundingClientRect().height || 0) / 2
    };

    const style = getComputedStyle(node);
    const transform = style.transform === 'none' ? '' : style.transform;
    const opacity = +style.opacity;

    const d = Math.sqrt(dXY.x * dXY.x + dXY.y * dXY.y);

    return {
        delay: params.delay || 0,
        duration:
            typeof params.duration === 'function' ? params.duration(d) : params.duration || Math.sqrt(d) * 30,
        easing: params.easing || cubicIn,
        css: (t, u) => `
        opacity: ${t * opacity};
        transform: ${transform} translate(${u * dXY.x}px, ${u * dXY.y}px) scale(${t});
    `
    } satisfies TransitionConfig;
};
