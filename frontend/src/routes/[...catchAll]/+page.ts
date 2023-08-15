import type { LoadEvent } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchDirListOrFile, type PagedDirList } from '../../lib/api/fetchDirListOrFile';


export const load: PageLoad = async (event: LoadEvent) => {
    const dirList = (event.data as { dirList: Promise<PagedDirList>}|undefined)?.dirList
        || (await fetchDirListOrFile(
            event.url.host,
            event.url.pathname,
            undefined,
            event.url.searchParams.get('page') || undefined
        )).json() as Promise<PagedDirList>;

    return {
        dirList: dirList,
        currentPath: event.url.pathname
    };
};
