import type { LoadEvent } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }: LoadEvent) =>
    ({
        host: url.host,
        path: url.pathname
    });
