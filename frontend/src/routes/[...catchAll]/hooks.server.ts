
import { env } from '$env/dynamic/private';
import { error, type Handle } from '@sveltejs/kit';

export const catchAllHandle: Handle = async ({ event, resolve }) => {

    const fetchUrl = `http://${env.INSVEX_HOST}:${env.INSVEX_PORT}/api/files/${event.url.host}${event.url.pathname}`;
    const fetchResponse = await fetch(fetchUrl);

    if (fetchResponse?.status < 200 || fetchResponse?.status >= 300) {
        throw error(
            fetchResponse.status,
            fetchResponse.headers.get('Content-Type')?.includes('application/json')
                ? await fetchResponse.json()
                : await fetchResponse.text()
        );
    }

    if (!fetchResponse.headers.get('Content-Type')?.includes('application/json')) {
        return new Response(
            fetchResponse.body,
            {
                status: fetchResponse.status,
                headers: fetchResponse.headers
            }
        );
    }

    Object.assign(event.locals, {
        files: await fetchResponse.json()
    });

    Object.assign(event.params, { keeps: 'maybe' });

    return resolve(event);
};
