import { Controller } from 'fliessheck';
import { InsvexConfig, getConfig } from '../../config';
import { fullResolve } from '../../utils';
import { existsSync, mkdirSync, statSync, writeFileSync, readFileSync, unlink } from 'fs';
import { watch } from 'chokidar';
import { resolve } from 'path';
import process, { addProcessor } from 'thumbnailator';
import { writeFile } from 'fs/promises';

export class ThumbController extends Controller {

    private static readonly THUMB_INDEX_NAME = 'thumbs.json';
    private mappedDirs: string[];
    private config: InsvexConfig;

    private thumbIndex: { [key: string]: string } = {};

    public constructor() {
        super(undefined, undefined);
        this.config = getConfig();
        this.mappedDirs = Object.values(this.config.hostDirMap).map(
            (dir) => fullResolve(dir)
        );
        mkdirSync(resolve(fullResolve(this.config.thumbDir)), { recursive: true });

        const dbPath = resolve(fullResolve(this.config.thumbDir), ThumbController.THUMB_INDEX_NAME);
        if (existsSync(dbPath)) {
            try {
                this.thumbIndex = (JSON.parse(readFileSync(dbPath).toString()) || {}) as { [key: string]: string };
            } catch (e) {
                this.logger.error('Couldn\'t read thumb index');
            }
        }

        this.installWatchers();

        // TODO: hack! remove this
        setInterval(() => {
            void this.writeThumbIndex(false);
        }, 10000);


    }

    private writeThumbIndex(sync = true) {
        if (sync) {
            writeFileSync(
                resolve(fullResolve(this.config.thumbDir), ThumbController.THUMB_INDEX_NAME),
                JSON.stringify(this.thumbIndex)
            );
        } else {
            return writeFile(
                resolve(fullResolve(this.config.thumbDir), ThumbController.THUMB_INDEX_NAME),
                JSON.stringify(this.thumbIndex)
            );
        }
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
                    case 'unlink':
                        if (this.thumbIndex[path] !== undefined) {
                            this.logger.info('File', path, 'was deleted, removing thumb');
                            unlink(this.thumbIndex[path], () => undefined);
                            delete this.thumbIndex[path];
                        }
                        break;
                    case 'change': {
                        if (this.thumbIndex[path] !== undefined) {
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
        const thumbFileName = Buffer.from(path).toString('base64');
        const thumbPath = resolve(fullResolve(this.config.thumbDir), thumbFileName + '.png');
        if (this.thumbIndex[path] === 'error') {
            throw new Error('Thumb generation not possible');
        }
        if (this.thumbIndex[path] && existsSync(this.thumbIndex[path])) {
            this.logger.info('Thumb already exists, returning cached path', this.thumbIndex[path]);
            return this.thumbIndex[path];
        }
        try {
            this.logger.debug('Generating thumb for', path);
            await process(path, thumbPath, {
                width: this.config.thumbSize,
                height: this.config.thumbSize,
                ignoreAspect: false,
                crop: true,
                thumbnail: true
            });
        } catch (e) {
            this.logger.error(e);
            this.thumbIndex[path] = 'error';
            throw e;
        }

        this.thumbIndex[path] = thumbPath;
        return thumbPath;
    }

}
