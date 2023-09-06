import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { Logger, initServices, setJwtOptions, setJwtSecrets } from 'fliessheck';
import * as http from 'http';
import folderListService from './Services/FilesList';
import thumbService from './Services/Thumbnail';
import { getConfig } from './config';
import Database from 'better-sqlite3';
dotenv.config();

const main = async () => {
    const config = getConfig();

    const frontend = await import('insvex.http-frontend/handler').catch(() => {
        Logger.Warn('Main',
            'SSR frontend not found!\n'
            + 'This API need to be publicly accessible!\n'
            + 'You also need to place the Frontend files into a (the) webroot and configure your webserver accordingly\n'
        );
        return undefined;
    });

    const port = config.port;
    const expressApp = express();
    const httpServer = http.createServer(expressApp);
    expressApp.use(cors({
        origin: '*'
    }));
    expressApp.use(express.urlencoded({ extended: false }));
    expressApp.use(express.json());
    setJwtSecrets('ChangeMySuperDuperSecret');
    setJwtOptions({  expiresIn: '1d' });

    const db = new Database('thumbs.db');
    db.pragma('journal_mode = WAL');


    initServices([folderListService, thumbService], expressApp, undefined, db);

    if (frontend) {
        expressApp.use(frontend.handler);
        expressApp.use(express.static('frontend/client'));
    }

    httpServer.listen(port, () => {
        Logger.Info('HTTPserver', `Server listening on port ${port}`);
    });

    return httpServer;
};

main().catch((e) => {
    Logger.Fatal('Main', 'Failed to start server', e);
});
