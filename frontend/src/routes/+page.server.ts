import axios, { AxiosError } from 'axios';
import type { PageLoad } from './$types';
import { env } from '$env/dynamic/private';
import type { LoadEvent } from '@sveltejs/kit';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const load: PageLoad = async (event: LoadEvent) => {

    console.log('Frontend', env.INSVEX_HOST, env.INSVEX_PORT, event.url, env);

    const axiosResponse: { files: string[]; error?: AxiosError } = (
        await axios.get<string[]>(
            `http://${env.INSVEX_HOST}:${env.INSVEX_PORT}/api/files`
        )
            .then((res) => ({
                files: res.data,
                error: undefined
            }))
            .catch((err: AxiosError) => ({
                files: [],
                error: JSON.parse(JSON.stringify(err)) as AxiosError
            }))
    );

    return {
        files: axiosResponse.files,
        error: axiosResponse.error
    };

};
