import type { ServerLoad, ServerLoadEvent } from '@sveltejs/kit';

export const load: ServerLoad|undefined = import.meta.env.INSVEX_BUILDCONFIG_SPA === 'true'
    ? undefined
    : async (event: ServerLoadEvent) => {
        const locals = event.locals as Record<string, unknown>;
        return {
            files: locals?.files || undefined,
            currentPath: event.url.pathname
        };
    };
