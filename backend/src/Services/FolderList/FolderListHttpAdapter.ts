import { HeaderAccessor, HttpAdapter, QueryParams } from "fliessheck";
import { FolderListController } from "./FolderListController";

export class FolderListHttpAdapter extends HttpAdapter<FolderListController, unknown> {
    override async find(query: QueryParams, header: HeaderAccessor): Promise<unknown> {
        return this.controller.listDir();
    }
}