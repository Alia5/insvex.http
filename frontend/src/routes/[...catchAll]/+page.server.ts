import type { LoadEvent } from '@sveltejs/kit';
import type { PageLoad } from './$types';

interface HookLokals {
    files: {
        path: string;
        isDir: boolean;
    }[];
}
export const load: PageLoad = async (event: LoadEvent) => {
    const locals = (event as LoadEvent & { locals: HookLokals }).locals;
    return {
        files: locals.files,
        currentPath: event.url.pathname
    };
};
