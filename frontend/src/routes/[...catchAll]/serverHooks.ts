import { fetchDirListOrFile } from '$lib/api/fetchDirListOrFile';
import type { Handle } from '@sveltejs/kit';

export const catchAllHandle: Handle = async (input) => {

    const thumbName = input.event.url.searchParams.get('thumb');
    const fetchResponse = await fetchDirListOrFile(input.event.url.host, input.event.url.pathname, thumbName || undefined);

    // DirList is actually file...
    if (!fetchResponse.headers.get('Content-Type')?.includes('application/json')) {
        return new Response(
            fetchResponse.body,
            {
                status: fetchResponse.status,
                headers: fetchResponse.headers
            }
        );
    }

    Object.assign(input.event.locals, {
        files: fetchResponse.json()
    });

    return input.resolve(input.event);
};
