import { fetchDirListOrFile } from '$lib/api/fetchDirListOrFile';
import type { Handle } from '@sveltejs/kit';

export const catchAllHandle: Handle = async (input) => {

    const thumbName = input.event.url.searchParams.get('thumb');
    const pageNum = input.event.url.searchParams.get('page');
    const JWT = input.event.cookies?.get('JWT');
    try {
        const fetchResponse = await fetchDirListOrFile(
            input.event.fetch,
            input.event.url.host,
            input.event.url.pathname,
            thumbName || undefined,
            pageNum || undefined,
            JWT
        );


        if (!fetchResponse) {
            return input.resolve(input.event);
        }
        // DirList is actually file...
        if (
            !fetchResponse.headers.get('Content-Type')?.includes('application/json')
        || input.event.url.pathname.endsWith('.json')
        ) {
            return new Response(
                fetchResponse.body,
                {
                    status: fetchResponse.status,
                    headers: fetchResponse.headers
                }
            );
        }

        Object.assign(input.event.locals, {
            dirList: fetchResponse.json(),
            JWT: JWT
        });

        return input.resolve(input.event);
    } catch (e) {
        if ((e as Record<string, unknown>).status === 401) {
            return input.resolve(input.event);
        }
        throw e;
    }
};
