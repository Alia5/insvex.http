import { fetchDirListOrFile } from './fetchDirListOrFile';

export const fetchThumbs = (forHost: string, path: string, files: string|string[]) => {
    const fileList = Array.isArray(files) ? files : [files];

    return fileList.reduce<Record<string, string>>((acc, file) => Object.assign(acc, {
        [file]: fetchDirListOrFile(
            forHost,
            `${path}${path.endsWith('/') ? '' : '/'}${file}`,
            true
        )
            .then(
                (response) => response.arrayBuffer()
                    .then((buffer) => 'data:image/png;base64, ' + Buffer.from(buffer).toString('base64'))
            )
    }), {});

};
