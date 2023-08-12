import { Logger } from 'fliessheck';
import { existsSync, readFileSync, writeFileSync } from 'fs';

export interface InsvexConfig {
    port: number;
    host: string;
    allowedDirs: string[]|'*';
    hostDirMap: Record<string, string>;
}

const safeParseJSON = (str: string | undefined): unknown => {
    if (str === undefined) {
        return undefined;
    }
    try {
        return JSON.parse(str);
    } catch (e) {
        Logger.Error('Config', 'Failed to parse JSON\n', (e as Error).message);
        return undefined;
    }
};

const fileConfig = safeParseJSON(
    existsSync('config.json')
        ?  readFileSync('config.json')?.toString() || '{}'
        : '{}'
) as InsvexConfig;

export const config: InsvexConfig = {
    port: parseInt(process.env.INSVEX_PORT || `${fileConfig.port}` || '3000'),
    host: process.env.INSVEX_HOST || fileConfig.host || 'localhost',
    allowedDirs: safeParseJSON(process.env.INSVEX_ALLOWED_DIRS) as string[] || fileConfig.allowedDirs || ['*'],
    hostDirMap: safeParseJSON(process.env.INSVEX_HOST_DIR_MAP) as Record<string, string> || fileConfig.hostDirMap || {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '*': '.'
    }
};

writeFileSync('config.json', JSON.stringify(config, undefined, 4));

process.env.INSVEX_PORT = config.port.toString();
process.env.INSVEX_HOST = config.host;
process.env.INSVEX_ALLOWED_DIRS = JSON.stringify(config.allowedDirs);
process.env.INSVEX_HOST_DIR_MAP = JSON.stringify(config.hostDirMap);
