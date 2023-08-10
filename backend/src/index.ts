import { Logger } from "fliessheck";

const main = async () => {

};

main().catch((e) => {
    Logger.Fatal('Main', 'Failed to start server', e);
});
