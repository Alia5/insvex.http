import { Controller, NotFoundError, SendFileOptions, ServiceRegistry } from 'fliessheck';
import { stat } from 'fs/promises';
import { resolve } from 'node:path';
import { getConfig } from '../../config';
import { DirectoryNotAllowed, HostNotRegistered, IsDirError, NotFileError } from './Errors';
import { existsSync, readdirSync } from 'fs';
import { fullResolve, relativePath } from '../../utils';
import { ThumbController } from '../Thumbnail/ThumbController';

export type DirList = {path: string; isDir: boolean; files?: DirList }[];

export class FilesController extends Controller {

    private config = getConfig();

    private isDirAllowed(absolutePath: string) {
        const allowedDirs = this.config.allowedDirs;
        return allowedDirs === '*'
            || allowedDirs.some(
                (allowedDir) => allowedDir === '*' || absolutePath.startsWith(fullResolve(allowedDir))
            );
    }

    private getAbsolutePathForHost(host: string) {
        const mappedDir = this.config.hostDirMap[host] ?? this.config.hostDirMap['*'];
        if (!mappedDir) {
            throw new HostNotRegistered(host);
        }
        const absolutePath = fullResolve(mappedDir);
        if (!this.isDirAllowed(absolutePath)) {
            throw new DirectoryNotAllowed(mappedDir);
        }
        return absolutePath;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public  listDirForHost(host: string, path?: string): DirList {
        const absolutePath = this.getAbsolutePathForHost(host);
        return readdirSync(resolve(absolutePath, path || ''), { withFileTypes: true, recursive: false })
            .map((f) => ({
                path: f.name,
                isDir: f.isDirectory()
            }));
    }

    public async serveFile(
        host: string,
        path: string,
        sendFileFn: (file: string, options?: SendFileOptions) => void
    ) {
        const basePath = this.getAbsolutePathForHost(host);
        const filePath = resolve(basePath, path);
        if (!existsSync(filePath)) {
            throw new NotFoundError(`${path} not found`);
        }
        const fStat = await stat(filePath);
        if (fStat.isDirectory() ) {
            // throw new IsDirError(`${path} is dir`);
            return this.listDirForHost(host, path);
        }
        if (!fStat.isFile() ) {
            throw new NotFileError(`${path} is not a file`);
        }
        return sendFileFn(path, {
            root: basePath,
            dotfiles: 'allow'
        });
    }

    public async serveThumb(
        host: string,
        path: string,
        sendFileFn: (file: string, options?: SendFileOptions) => void
    ) {

        const basePath = this.getAbsolutePathForHost(host);
        const filePath = resolve(basePath, path);
        if (!existsSync(filePath)) {
            throw new NotFoundError(`${path} not found`);
        }
        const fStat = await stat(filePath);
        if (fStat.isDirectory() ) {
            throw new IsDirError(`${path} is dir`);
        }
        if (!fStat.isFile() ) {
            throw new NotFileError(`${path} is not a file`);
        }


        const thumbService = ServiceRegistry.Get(ThumbController);
        if (!thumbService) {
            throw new Error('ThumbService not found');
        }

        const thumbPath = await thumbService.getThumb(filePath);
        const thumbDir = thumbService.getThumbDir();

        // serve original file for now
        return sendFileFn(relativePath(thumbPath, thumbDir), {
            root: thumbDir,
            dotfiles: 'allow'
        });

    }

}
