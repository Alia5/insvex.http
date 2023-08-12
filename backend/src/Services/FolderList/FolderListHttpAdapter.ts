import { HeaderAccessor, HttpAdapter, QueryParams } from 'fliessheck';
import { FolderListController } from './FolderListController';

export class FolderListHttpAdapter extends HttpAdapter<FolderListController, unknown> {
    public override async get(id: string, query: QueryParams, header: HeaderAccessor): Promise<unknown> {
        this.logger.debug('id', id);
        return this.controller.listDir();
    }
}
