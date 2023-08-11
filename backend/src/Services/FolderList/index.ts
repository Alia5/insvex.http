import type { ServiceConfig } from 'fliessheck';
import { FolderListController } from './FolderListController';
import { FolderListHttpAdapter } from './FolderListHttpAdapter';
const serviceConfig: ServiceConfig<FolderListController> = {
    controller: FolderListController,
    httpAdapter: {
        path: 'api/files',
        adapter: FolderListHttpAdapter
    }
};

export default serviceConfig;