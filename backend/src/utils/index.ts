import { homedir } from 'os';
import { resolve } from 'path';
import { getConfig } from '../config';

export const fullResolve = (path: string) => resolve(path.replace('~', homedir()));

export const relativePath = (path: string, base: string) => {
    const resolvedBase = fullResolve(base);
    return path.replace(resolvedBase + '/', '');
};

export const configRelative = (path: string) => {
    const dirs = Object.values(getConfig().hostDirMap);
    const dir = dirs.find((d) => path.startsWith(fullResolve(d)));
    return relativePath(path, dir || '');
};

