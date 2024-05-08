import type { PagedDirList } from '$lib/api/fetchDirListOrFile';
import type { ServerLoad, ServerLoadEvent } from '@sveltejs/kit';

export const load: ServerLoad|undefined = import.meta.env.INSVEX_BUILDCONFIG_SPA === 'true'
    ? undefined
    : async (event: ServerLoadEvent) => {
        const locals = event.locals as { dirList: Promise<PagedDirList>}|undefined;

        return {
            dirList: await locals?.dirList || undefined,
            currentPath: event.url.pathname
        };
    };
