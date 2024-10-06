import { env } from '$env/dynamic/public';
import { error } from '@sveltejs/kit';
export type DirList = {

    path: string;
    isDir: boolean;
}[];

export interface PagedDirList {
    page: number;
    totalPages: number;
    totalFiles: number;
    files: DirList;
}

export const fetchDirListOrFile = async (fetchFn: typeof fetch, forHost: string, path: string, thumbName?: string, page?: string, JWT?: string) => {

    const host = env.INSVEX_PUBLIC_HOST || import.meta.env.INSVEX_PUBLIC_HOST || process?.env?.INSVEX_PUBLIC_HOST
    || env.INSVEX_HOST || import.meta.env.INSVEX_HOST || process?.env?.INSVEX_HOST || 'localhost';
    const port = env.INSVEX_PUBLIC_PORT || import.meta.env.INSVEX_PUBLIC_PORT || process?.env?.INSVEX_PUBLIC_PORT
    || env.INSVEX_PORT || import.meta.env.INSVEX_PORT || process?.env?.INSVEX_PORT || '7069';

    let fetchUrl = '';
    if (import.meta.env.INSVEX_BUILDCONFIG_DIRECTORY_INDEX_NAME)
    {
        if (thumbName) {
            return undefined;
        }
        fetchUrl = `${
            !host || host?.startsWith('http') ? '' : 'http://'
        }${host || ''}${port ? ':' : ''}${port || ''}${path === '/' ? '' : path}/${
            import.meta.env.INSVEX_BUILDCONFIG_DIRECTORY_INDEX_NAME
        }`;
    } else {
        fetchUrl = `${
            !host || host?.startsWith('http') ? '' : 'http://'
        }${host || ''}${port ? ':' : ''}${port || ''}/api/files/${forHost}${path}${
            thumbName ? `?thumb=${thumbName}` : ''
        }${
            page ? `?page=${page}` : ''
        }`;
    }
    const fetchResponse = await fetchFn(fetchUrl, {
        headers: {
            Authorization: JWT ? `Bearer ${JWT}` : ''
        }
    });

    if (fetchResponse?.status < 200 || fetchResponse?.status >= 300) {
        let isJson = false;
        if (fetchResponse.headers.has('content-type')) {
            // stupid workaround
            fetchResponse.headers.values().forEach((v) => {
                if (v.includes('application/json')) {
                    isJson = true;
                }
            });
            // isJson = fetchResponse.headers.get('content-type')?.includes('application/json') || false;
        }
        throw error(
            fetchResponse.status,
            isJson
                ? await fetchResponse.json()
                : await fetchResponse.text()
        );
    }

    return fetchResponse;

};
