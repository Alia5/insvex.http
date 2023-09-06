import { Controller } from 'fliessheck';
import { InsvexConfig, getConfig } from '../../config';
import { fullResolve } from '../../utils';
import { existsSync, mkdirSync, statSync, unlink } from 'fs';
import { watch } from 'chokidar';
import { resolve } from 'path';
import process from 'thumbnailator';
import { ThumbDbAdapter } from './DataBaseAdapter';
import { lookup } from 'mime-types';

export class ThumbController extends Controller<undefined, ThumbDbAdapter> {

    private mappedDirs: string[];
    private config: InsvexConfig;

    public constructor(eventAdapter: undefined, databaseAdapter: ThumbDbAdapter) {
        super(undefined, databaseAdapter);
        this.config = getConfig();
        this.mappedDirs = Object.values(this.config.hostDirMap).map(
            (dir) => fullResolve(dir)
        );
        mkdirSync(resolve(fullResolve(this.config.thumbDir)), { recursive: true });

        this.installWatchers();
    }

    private installWatchers() {
        this.mappedDirs.forEach((dir) => {
            if (!existsSync(dir)) {
                this.logger.error(`Directory ${dir} does not exist`);
                return;
            }
            if (!statSync(dir).isDirectory()) {
                this.logger.error(`Path ${dir} is not a directory`);
                return;
            }
            this.logger.debug('Installing watcher for directory ', dir);
            watch(dir, { ignoreInitial: true, alwaysStat: false, usePolling: true, interval: 30000 }).on('all', (event, path) => {
                // this.logger.debug(`File ${path} changed, event: ${event}`);
                switch (event) {
                    case 'unlink': {
                        const thumbPath = this.databaseAdapter.getThumb(path);
                        if (thumbPath !== undefined) {
                            this.logger.info('File', path, 'was deleted, removing thumb');
                            unlink(thumbPath, () => undefined);
                            this.databaseAdapter.removeThumb(path);
                        }
                    }
                        break;
                    case 'change': {
                        const thumbPath = this.databaseAdapter.getThumb(path);
                        if (thumbPath !== undefined) {
                            this.getThumb(path)
                                .then(() => undefined)
                                .catch(() => {
                                    undefined;
                                });
                        }
                    }
                }
            });
        });
    }

    public getThumbDir(): string {
        return fullResolve(this.config.thumbDir);
    }

    public async getThumb(path: string): Promise<string> {

        const existingThumb = this.databaseAdapter.getThumb(path);
        if (existingThumb && existingThumb !== 'error') {
            this.logger.debug('using cached thumb path for', path);
            return existingThumb;
        }
        // if (existingThumb === 'error') {
        //     throw new Error('Thumb generation not possible');
        // }


        const shouldCrop = () => {
            const mime = lookup(path.split('.')?.pop() || '');
            const noCrop = mime && mime.startsWith('video');
            return !noCrop;
        };

        const thumbFileName = Buffer.from(path).toString('base64');
        const thumbPath = resolve(fullResolve(this.config.thumbDir), thumbFileName + '.png');
        try {
            this.logger.debug('Generating thumb for', path);
            await process(path, thumbPath, {
                width: this.config.thumbSize,
                height: this.config.thumbSize,
                ignoreAspect: false,
                crop: shouldCrop(),
                thumbnail: true
            });
        } catch (e) {
            this.logger.error(e);
            void this.databaseAdapter.addThumb(path, 'error');
            throw e;
        }
        this.databaseAdapter.addThumb(path, thumbPath);
        return thumbPath;
    }

}
