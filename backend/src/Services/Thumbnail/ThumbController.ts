import { Controller } from 'fliessheck';
import { InsvexConfig, getConfig } from '../../config';
import { configRelative, fullResolve } from '../../utils';
import { existsSync, mkdirSync, statSync, writeFileSync, readFileSync } from 'fs';
import { watch } from 'chokidar';
import { resolve } from 'path';
import { generateAsync } from 'filepreview_ts';

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
    }

    private writeThumbIndex() {
        writeFileSync(
            resolve(fullResolve(this.config.thumbDir), ThumbController.THUMB_INDEX_NAME),
            JSON.stringify(this.thumbIndex)
        );
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
            watch(dir, { ignoreInitial: true }).on('all', (event, path) => {
                this.logger.debug(`File ${path} changed, event: ${event}`);
                switch (event) {
                    case 'unlink':
                        if (this.thumbIndex[path] !== undefined) {
                            delete this.thumbIndex[path];
                            this.writeThumbIndex();
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
        const relativeFile = configRelative(path).replace(/\//g, '_');
        const thumbPath = resolve(fullResolve(this.config.thumbDir), relativeFile + '.png');
        if (this.thumbIndex[path] && existsSync(this.thumbIndex[path])) {
            this.logger.debug('Thumb already exists, returning cached path');
            return this.thumbIndex[path];
        }
        try {
            this.logger.debug('Generating thumb for', path);
            await generateAsync(path, thumbPath, {
                width: 256,
                height: 256
            });
        } catch (e) {
            this.logger.error(e);
            throw e;
        }

        this.thumbIndex[path] = thumbPath;
        this.writeThumbIndex();
        return thumbPath;
    }

}
