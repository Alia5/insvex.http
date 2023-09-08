const ENDINING_MAP: Record<string, string> = {
    patch: 'text/x-diff',
    ts: 'application/typescript',
    svelte: 'application/svelte',
    gcode: 'application/gcode'
};

const TEXT_ARRAY = [
    'text/x-diff',
    'application/typescript',
    'application/json',
    'application/javascript',
    'application/svelte',
    'application/xml',
    'application/gcode'
];

export const isText = (mime: string) => {
    if (mime.includes('text')) {
        return true;
    }
    return TEXT_ARRAY.includes(mime);
};

export const mimeAdditions = (file: string) => {
    const ending = file?.split('.')?.pop();
    if (!ending) return false;
    return ENDINING_MAP[ending] || false;
};
