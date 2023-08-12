import type { Handle } from '@sveltejs/kit';
import { catchAllHandle } from './routes/[...catchAll]/hooks.server';

export const handle: Handle = async (input) => {
    if (input.event.route.id === '/[...catchAll]') {
        return catchAllHandle(input);
    }

    return input.resolve(input.event);
};
