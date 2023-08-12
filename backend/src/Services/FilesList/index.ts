import type { ServiceConfig } from 'fliessheck';
import { FilesController } from './FilesController';
import { FilesHttpAdapter } from './FilesHttpAdapter';
const serviceConfig: ServiceConfig<FilesController> = {
    controller: FilesController,
    httpAdapter: {
        path: 'api/files/:host?/:path(*)?',
        adapter: FilesHttpAdapter
    }
};

export default serviceConfig;
