import { Controller, signJwt, UnauthorizedError } from 'fliessheck';
import { getConfig } from '../../config';

export class AuthController extends Controller {

    private config = getConfig();

    public async login(host: string, user: string, password: string): Promise<{JWT: string}> {
        if (user === this.config.auth?.[host]?.username && password === this.config.auth?.[host]?.password) {
            return {
                JWT: signJwt({ user, host }, { expiresIn: '5d', algorithm: 'HS256' })
            };
        }
        if (user === this.config.auth?.['*']?.username && password === this.config.auth?.['*']?.password) {
            return {
                JWT: signJwt({ user, host }, { expiresIn: '5d', algorithm: 'HS256' })
            };
        }


        throw new UnauthorizedError();
    }

}
