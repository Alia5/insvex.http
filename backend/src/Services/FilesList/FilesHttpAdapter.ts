import { BadRequestError, ForbiddenError, HeaderAccessor, HttpAdapter, NotFoundError, RequestParams } from 'fliessheck';
import { FilesController } from './FilesController';
import { getConfig } from '../../config';
import { DirectoryNotAllowed, HostNotRegistered, IsDirError, NotFileError } from './Errors';

export class FilesHttpAdapter extends HttpAdapter<FilesController, unknown> {

    public override async find(params: RequestParams, header: HeaderAccessor) {
        const host = params.url.host
        || header.get('host')
        || getConfig().hostDirMap?.[0]
        || 'localhost';
        return this.getForHost(host, params);
    }

    private async getForHost(host: string, params: RequestParams) {
        if (params.url.path) {
            if (params.query.thumb !== undefined) {
                return this.serveThumb(host, params.url.path);
            }
            return this.serveFile(host, params.url.path);
        }
        return this.listDirForHost(host);
    }

    private async serveFile(host: string, path: string) {

        this.logger.debug('serving file for', host, '; file:', path);
        return this.controller.serveFile(
            host,
            path,
            (file, opts) =>
                this.sendFile(file, opts)
        ).catch((e) => {
            if (e instanceof DirectoryNotAllowed) {
                throw new ForbiddenError(`${e.constructor.name}: ${e.message}`);
            }
            if (e instanceof HostNotRegistered) {
                throw new BadRequestError(`${e.constructor.name}: ${e.message}`);
            }
            if (e instanceof IsDirError) {
                throw new BadRequestError(`${e.constructor.name}: ${e.message}`);
            }
            if (e instanceof NotFileError) {
                throw new NotFoundError(`${e.constructor.name}: ${e.message}`);
            }
            throw e;
        });
    }

    private async serveThumb(host: string, path: string) {
        this.logger.debug('serving thumb for', host, '; file:', path);
        return this.controller.serveThumb(
            host,
            path,
            (file, opts) =>
                this.sendFile(file, opts)
        ).catch((e) => {
            if (e instanceof DirectoryNotAllowed) {
                throw new ForbiddenError(`${e.constructor.name}: ${e.message}`);
            }
            if (e instanceof HostNotRegistered) {
                throw new BadRequestError(`${e.constructor.name}: ${e.message}`);
            }
            if (e instanceof IsDirError) {
                throw new BadRequestError(`${e.constructor.name}: ${e.message}`);
            }
            if (e instanceof NotFileError) {
                throw new NotFoundError(`${e.constructor.name}: ${e.message}`);
            }
            throw e;
        });
    }

    private async listDirForHost(host: string): Promise<string[]> {
        this.logger.debug('Listing dir for host', host);
        try {
            return this.controller.listDirForHost(host);
        } catch (e) {
            if (e instanceof DirectoryNotAllowed) {
                throw new ForbiddenError(`${e.constructor.name}: ${e.message}`);
            }
            if (e instanceof HostNotRegistered) {
                throw new BadRequestError(`${e.constructor.name}: ${e.message}`);
            }
            throw e;
        }
    }

}
