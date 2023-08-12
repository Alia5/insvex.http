import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { Logger, initServices, setJwtOptions, setJwtSecrets } from 'fliessheck';
import * as http from 'http';
import folderListService from './Services/FilesList';
import thumbService from './Services/Thumbnail';
import { getConfig } from './config';
dotenv.config();

const main = async () => {
    const config = getConfig();
    const frontend = await import('insvex.http-frontend/handler');

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


    initServices([folderListService, thumbService], expressApp);

    expressApp.use(frontend.handler);

    httpServer.listen(port, () => {
        Logger.Info('HTTPserver', `Server listening on port ${port}`);
    });

    return httpServer;
};

main().catch((e) => {
    Logger.Fatal('Main', 'Failed to start server', e);
});
