import type { LoadEvent } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchDirListOrFile, type PagedDirList } from '../../lib/api/fetchDirListOrFile';

type NginXDirList = {
    name: string;
    type: 'directory'|'file';
}[];

const SPA_EXCLUDES: string[] = [
    'index.html',
    'favicon.ico',
    'favicon.png',
    'favicon.jpg',
    'robots.txt',
    'ads.txt',
    '_app'
];
const excludedFiles: string[] = [];

const safeParseJSON = (str: string | undefined): unknown => {
    if (str === undefined) {
        return undefined;
    }
    try {
        return JSON.parse(str);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
        return undefined;
    }
};

if (import.meta.env.INSVEX_BUILDCONFIG_DIRECTORY_INDEX_NAME) {
    excludedFiles.push(
        ...SPA_EXCLUDES,
        ...(
            safeParseJSON(import.meta.env.INSVEX_BUILDCONFIG_SPA_EXCLUDED_FILES) as string[]
            || []
        )
    );
}

export const load: PageLoad = async (event: LoadEvent) => {
    try {
        let dirList = (event.data as { dirList: Promise<PagedDirList>}|undefined)?.dirList;

        if (!dirList) {
            const fetchResponse = (await fetchDirListOrFile(
                event.fetch,
                event.url.host,
                event.url.pathname,
                undefined,
                event.url.searchParams.get('page') || undefined,
                event.data?.JWT
            ));

            if (fetchResponse) {
                if (import.meta.env.INSVEX_BUILDCONFIG_DIRECTORY_INDEX_NAME) {
                    dirList = fetchResponse.json().then((r: NginXDirList) => ({
                        page: 1,
                        totalPages: 1,
                        totalFiles: r.length,
                        files: r.filter(
                            (f) =>
                                !excludedFiles.includes(f.name) && !f.name.startsWith('.')
                        ).map((f) => ({
                            path: f.name,
                            isDir: f.type === 'directory'
                        }))
                    } satisfies PagedDirList ));
                } else {
                    dirList = (fetchResponse.json()) as Promise<PagedDirList>;
                }
            }
        }

        return {
            dirList: await dirList ||  {
                page: 1,
                totalPages: 1,
                totalFiles: 0,
                files: []
            } satisfies PagedDirList,
            currentPath: event.url.pathname,
            unauthorized: false
        };
    } catch (e) {
        if ((e as Record<string, unknown>).status === 401) {
            return {
                dirList: {
                    page: 1,
                    totalPages: 1,
                    totalFiles: 0,
                    files: []
                } satisfies PagedDirList,
                currentPath: event.url.pathname,
                unauthorized: true
            };
        }
        throw e;
    }
};
