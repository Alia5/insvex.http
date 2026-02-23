import {
    BadRequestError,
    decodeJwt,
    ForbiddenError,
    HeaderAccessor,
    HttpAdapter,
    jwtAuth,
    Middleware,
    NotFoundError,
    RequestParams
} from 'fliessheck';
import { FilesController } from './FilesController';
import { getConfig } from '../../config';
import { DirectoryNotAllowed, HostNotRegistered, IsDirError, NotFileError } from './Errors';

export class FilesHttpAdapter extends HttpAdapter<FilesController, unknown> {

    @Middleware((req, res, next) => {
        const config = getConfig();
        if (config.auth) {

            const host = req.params.host
                || req.headers.host || '';

            if (config.auth['*'] || config.auth[host]) {

                const jwt = decodeJwt(req.headers.authorization || '', {});
                if (jwt && typeof jwt !== 'string' && jwt?.host !== host) {
                    throw new ForbiddenError('Invalid JWT');
                }

                return jwtAuth({
                    algorithms: ['HS256'],
                    maxAge: '5d'
                })(req, res, next);
            }
            return next();
        }
        return next();
    })
    public override async find(params: RequestParams, header: HeaderAccessor) {
        const host = params.url.host
            || header.get('host')
            || getConfig().hostDirMap?.[0]
            || 'localhost';
        return this.getForHost(host, params);
    }

    private async getForHost(host: string, params: RequestParams) {

        const page = params.query.page ? Number.parseInt(`${params.query.page}`, 10) : 1;
        if (Number.isNaN(page)) {
            throw new BadRequestError('page must be a number');
        }
        if (params.url.path || params.query.thumb !== undefined) {
            if (params.query.thumb !== undefined) {
                const thumb = Array.isArray(params.query.thumb) ? params.query.thumb.join('') : params.query.thumb;
                if (typeof thumb === 'string' && thumb.length > 0) {
                    const thumbPath = params.url.path?.endsWith('/')
                        ? params.url.path + thumb
                        : (params.url.path ?? '') + '/' + thumb;
                    return this.serveThumb(host, thumbPath.startsWith('/') ? thumbPath.slice(1) : thumbPath);
                }
                if (params.url.path) {
                    return this.serveThumb(host, params.url.path);
                }
            }
            if (params.url.path) {
                return this.serveFileOrList(host, params.url.path, page);
            }
        }
        return this.listDirForHost(host, page);
    }

    private async serveFileOrList(host: string, path: string, page = 1) {

        this.logger.debug('serving file for', host, '; file:', path, '; page:', page);
        return this.controller.serveFileOrList(
            host,
            path,
            (file, opts) =>
                this.sendFile(file, opts),
            page
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


    private async listDirForHost(host: string, page = 1) {
        this.logger.debug('Listing dir for host', host, '; page:', page);
        try {
            return this.controller.listDirForHost(host, undefined, page);
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
