import type { Handle } from '@sveltejs/kit';
import { catchAllHandle } from './routes/[...catchAll]/serverHooks';
import { sequence } from '@sveltejs/kit/hooks';


const hooks: Handle[] = [
    async (input) => {
        const urlTheme = input.event.url.searchParams.get('theme');
        if (urlTheme === 'dark' || urlTheme === 'light') {
            return input.resolve(input.event, {
                transformPageChunk: ({ html }) =>
                    html.replace(/<body (.*)?>/g, (match) => match.replace(/>/g, ` class="theme-${urlTheme}">`))
            });
        }
        return input.resolve(input.event);
    },
    async (input) => {
        if (input.event.route.id === '/[...catchAll]') {
            return catchAllHandle(input);
        }
        return input.resolve(input.event);
    }
];


export const handle = sequence(...hooks);

