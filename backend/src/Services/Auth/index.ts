import type { ServiceConfig } from 'fliessheck';
import { AuthController } from './AuthController';
import { AuthHttpAdapter } from './AuthHttpAdapter';


const serviceConfig: ServiceConfig<AuthController> = {
    controller: AuthController,
    httpAdapter: {
        path: 'api/auth/:host',
        adapter: AuthHttpAdapter
    }
};

export default serviceConfig;
