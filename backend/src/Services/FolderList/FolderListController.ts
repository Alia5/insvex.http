import { Controller } from "fliessheck";
import { readdir } from "fs/promises";
import { resolve } from "node:path";

export class FolderListController extends Controller {

    public listDir() {
        return readdir(resolve('/home/alia5'));
    }

}