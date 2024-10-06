import type { PagedDirList } from '$lib/api/fetchDirListOrFile';
import { error, type Actions, type ServerLoad, type ServerLoadEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';


export const load: ServerLoad|undefined = import.meta.env.INSVEX_BUILDCONFIG_SPA === 'true'
    ? undefined
    : async (event: ServerLoadEvent) => {
        const locals = event.locals as { dirList: Promise<PagedDirList>}|undefined;

        return {
            dirList: await locals?.dirList || undefined,
            currentPath: event.url.pathname,
            JWT: locals?.JWT || event.cookies.get('JWT')
        };
    };


export const actions = {
    default: async ( event ) => {
        const data = await event.request.formData();
        const user = data.get('user');
        const pass = data.get('password');


        const host = env.INSVEX_PUBLIC_HOST || import.meta.env.INSVEX_PUBLIC_HOST || process?.env?.INSVEX_PUBLIC_HOST
        || env.INSVEX_HOST || import.meta.env.INSVEX_HOST || process?.env?.INSVEX_HOST || 'localhost';
        const port = env.INSVEX_PUBLIC_PORT || import.meta.env.INSVEX_PUBLIC_PORT || process?.env?.INSVEX_PUBLIC_PORT
        || env.INSVEX_PORT || import.meta.env.INSVEX_PORT || process?.env?.INSVEX_PORT || '7069';


        const authResponse = await event.fetch(`${
            !host || host?.startsWith('http') ? '' : 'http://'
        }${host || ''}${port ? ':' : ''}${port || ''}/api/auth/${event.url.hostname}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user,
                password: pass
            })
        });

        if (authResponse.status !== 201) {
            return error(401, 'Unauthorized');
        }
        const token = (await authResponse.json()).JWT as string;
        event.cookies.set('JWT', token, {
            path: '/',
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5)
        });
        return token;
    }
} satisfies Actions;
