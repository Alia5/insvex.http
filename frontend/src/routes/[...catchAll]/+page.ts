import type { LoadEvent } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchDirListOrFile, type DirList } from '../../lib/api/fetchDirListOrFile';
import { fetchThumbs } from '$lib/api/fetchThumbs';


export const load: PageLoad = async (event: LoadEvent) => {
    const files = (event.data as { files: Promise<DirList>}|undefined)?.files
        || (await fetchDirListOrFile(event.url.host, event.url.pathname)).json() as Promise<DirList>;

    const thumbs = (event.data as { thumbs: Promise<Record<string, string>>}|undefined)?.thumbs;

    const getThumbs = async () => {
        const fileNames = (await files)
            .filter((f) => !f.isDir)
            .map((f) => f.path);
        return fetchThumbs(event.url.host, event.url.pathname, fileNames);
    };

    return {
        files: files,
        currentPath: event.url.pathname,
        thumbs: thumbs ? thumbs : getThumbs()
    };
};
