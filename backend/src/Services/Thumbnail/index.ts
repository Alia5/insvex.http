import type { ServiceConfig } from 'fliessheck';
import { ThumbController } from './ThumbController';
import { ThumbDbAdapter } from './DataBaseAdapter';
const serviceConfig: ServiceConfig<ThumbController> = {
    controller: ThumbController,
    databaseAdapter: ThumbDbAdapter
};

export default serviceConfig;
