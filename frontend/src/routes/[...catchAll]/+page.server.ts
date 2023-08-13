import type { DirList } from '$lib/api/fetchDirListOrFile';
import { fetchThumbs } from '$lib/api/fetchThumbs';
import type { ServerLoad, ServerLoadEvent } from '@sveltejs/kit';

export const load: ServerLoad|undefined = import.meta.env.INSVEX_BUILDCONFIG_SPA === 'true'
    ? undefined
    : async (event: ServerLoadEvent) => {
        const locals = event.locals as { files: Promise<DirList>}|undefined;

        const getThumbs = async () => {
            if (!locals?.files) {
                return undefined;
            }
            const fileNames = (await locals.files)
                .filter((f) => !f.isDir)
                .map((f) => f.path);
            return fetchThumbs(event.url.host, event.url.pathname, fileNames);
        };

        return {
            files: locals?.files || undefined,
            currentPath: event.url.pathname,
            thumbs: locals?.files ? getThumbs()  : undefined
        };
    };
