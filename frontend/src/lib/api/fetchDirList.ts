import { env } from '$env/dynamic/public';
import { error, type LoadEvent, type RequestEvent } from '@sveltejs/kit';
export type DirList = {

    path: string;
    isDir: boolean;
}[];

export const fetchDirList = async (event: RequestEvent|LoadEvent) => {

    const host = env.INSVEX_PUBLIC_HOST || import.meta.env.INSVEX_PUBLIC_HOST;
    const port = env.INSVEX_PUBLIC_PORT || import.meta.env.INSVEX_PUBLIC_PORT;

    const fetchUrl = `http://${host}:${port}/api/files/${event.url.host}${event.url.pathname}`;
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
