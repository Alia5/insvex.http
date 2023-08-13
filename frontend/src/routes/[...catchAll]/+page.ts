import type { LoadEvent } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchDirListOrFile, type DirList } from '../../lib/api/fetchDirListOrFile';


export const load: PageLoad = async (event: LoadEvent) => {
    const files = (event.data as { files: Promise<DirList>}|undefined)?.files
        || (await fetchDirListOrFile(event)).json() as Promise<DirList>;

    return {
        files: files,
        currentPath: event.url.pathname
    };
};
