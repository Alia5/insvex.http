import express from "express";
import cors from "cors";
import { Logger, initServices, setJwtOptions, setJwtSecrets } from "fliessheck";
import * as http from 'http';
import { handler as frontendHandler } from "insvex.http-frontend/handler";
import folderListService from "./Services/FolderList";

const main = async () => {
    const port = 3000 as const;
    const expressApp = express();
    const httpServer = http.createServer(expressApp);
    expressApp.use(cors({
        origin: '*'
    }));
    expressApp.use(express.urlencoded({ extended: false }));
    expressApp.use(express.json());
    setJwtSecrets('ChangeMySuperDuperSecret');
    setJwtOptions({  expiresIn: '1d' });

    
    initServices([folderListService], expressApp)
    
    expressApp.use(frontendHandler);
    
    httpServer.listen(port, () => {
        Logger.Info('HTTPserver', `Server listening on port ${port}`);
    });

    return httpServer;
};

main().catch((e) => {
    Logger.Fatal('Main', 'Failed to start server', e);
});
