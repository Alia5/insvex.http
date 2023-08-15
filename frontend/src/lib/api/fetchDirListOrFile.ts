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

export const fetchDirListOrFile = async (forHost: string, path: string, thumbName?: string, page?: string) => {

    const host = env.INSVEX_PUBLIC_HOST || import.meta.env.INSVEX_PUBLIC_HOST;
    const port = env.INSVEX_PUBLIC_PORT || import.meta.env.INSVEX_PUBLIC_PORT;

    const fetchUrl = `http://${host}:${port}/api/files/${forHost}${path}${
        thumbName ? `?thumb=${thumbName}` : ''
    }${
        page ? `?page=${page}` : ''
    }`;
    const fetchResponse = await fetch(fetchUrl);

    if (fetchResponse?.status < 200 || fetchResponse?.status >= 300) {
        throw error(
            fetchResponse.status,
            fetchResponse.headers.get('Content-Type')?.includes('application/json')
                ? await fetchResponse.json()
                : await fetchResponse.text()
        );
    }

    return fetchResponse;

};
