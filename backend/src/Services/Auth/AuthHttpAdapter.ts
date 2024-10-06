import { BadRequestError, HttpAdapter, RequestParams } from 'fliessheck';
import { AuthController } from './AuthController';

type DataType = {user: string; password: string}|{JWT: string};

export class AuthHttpAdapter extends HttpAdapter<AuthController, DataType> {

    public override async create(
        params: RequestParams,
        data: DataType | undefined
    ): Promise<{JWT: string}> {

        const host = params.url.host;
        if (!host) {
            throw new BadRequestError();
        }

        if (!data) {
            throw new BadRequestError();
        }

        if ('user' in data && 'password' in data) {
            return this.controller.login(host, data.user, data.password);
        }

        throw new BadRequestError();
    }

}
