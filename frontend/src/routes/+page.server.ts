import type { PageLoad } from './$types';
import { readdirSync } from 'node:fs';

export const load: PageLoad = ({ params }) => {

    return {
        files:["meh"]
    };

};