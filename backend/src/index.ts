import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { Logger, initServices, setJwtOptions, setJwtSecrets } from 'fliessheck';
import * as http from 'http';
import folderListService from './Services/FilesList';
import thumbService from './Services/Thumbnail';
import { getConfig } from './config';
import type { Database as BetterSqLite3Database } from 'better-sqlite3';

dotenv.config();

const main = async () => {
    const config = getConfig();

    const database = (
        (typeof Bun !== 'undefined')
            ? await import('bun:sqlite').catch((e) => {
                Logger.Error(
                    'Main',
                    'Failed to load bun:sqlite\n',
                    e
                );
            }).then((m) => {
                if (m) {
                    return m.default;
                }
                return undefined;
            })
            : await import('better-sqlite3').catch((e) => {
                Logger.Error(
                    'Main',
                    'Failed to load better-sqlite3\n'
                + 'Run npm i if running on node.js\n',
                    e
                );
            }).then((m) => {
                if (m) {
                    return m.default;
                }
                return undefined;
            })
    );

    if (database === undefined) {
        throw new Error('No database lib found!');
    }


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

    const db = new database('thumbs.db');
    if ((db as BetterSqLite3Database).pragma) {
        (db as BetterSqLite3Database).pragma('journal_mode = WAL');
    }


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
