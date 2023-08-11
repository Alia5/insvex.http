import axios, { AxiosError } from 'axios';
import type { PageLoad } from './$types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const load: PageLoad = async ({ params }: { params: Record<string, unknown> }) => {

    const axiosResponse: { files: string[]; error?: AxiosError } = await axios.get<string[]>('http://localhost:3000/api/files')
        .then((res) => ({
            files: res.data,
            error: undefined
        }))
        .catch((err) => ({
            files: [],
            error: JSON.parse(JSON.stringify(err)) as AxiosError
        }));

    return {
        files: axiosResponse.files,
        error: axiosResponse.error
    };

};
