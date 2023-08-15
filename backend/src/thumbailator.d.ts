declare module 'thumbnailator' {
    export interface ProcessorOptions {
        width?: number;
        height?: number;
        scale?: number;
        crop?: string|boolean;
        ignoreAspect?: boolean;
        oversize?: boolean;
        shrink?: boolean;
        enlarge?: boolean;
        thumbnail?: boolean;
        quality?: number;
        density?: number;
        background?: string;
    }
    export interface AbstractProcessor {
        // /**
        //  * @param {string} input
        //  * @param {string} output
        //  * @param {ProcessorOptions} options
        //  * @returns {Promise<void>}
        //  */
        // async _root(input: string, output: string, options: ProcessorOptions);

        /**
         * @param {string} input
         * @param {string} output
         * @param {ProcessorOptions} options
         * @returns {Promise<void|string>}
         */
        process: (input: string, output: string, options: ProcessorOptions) => Promise<void>;

        /**
         * @returns {string[]}
         */
        getSupportedMimeTypes();
    }
    export default async function process(input: string, output: string, options: ProcessorOptions = {});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export function addProcessor(processor: any);


}
