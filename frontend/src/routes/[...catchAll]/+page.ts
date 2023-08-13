import type { LoadEvent } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchDirList, type DirList } from '../../lib/api/fetchDirList';


export const load: PageLoad = async (event: LoadEvent) => {
    const files = (event.data as { files: Promise<DirList>}|undefined)?.files
        || (await fetchDirList(event)).json() as Promise<DirList>;

    return {
        files: files,
        currentPath: event.url.pathname
    };
};
