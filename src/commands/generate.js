import { logger } from '../util/logging.js';

import * as path from 'path';

export async function generateSpecs(options, rootDir) {
    const debug = options.debug;
    const preferred = options.preferred;
    let output = options.output;
    const service = options.service;
    const category = options.category;

    logger.info('generate called...');
    debug ? logger.debug({rootDir: rootDir, ...options}) : null;

    if(output.startsWith('/') || output.startsWith('C:\\')){
        debug ? logger.debug('absolute path supplied for output directory') : null;
    } else {
        output = path.join(rootDir, output);
    }

    logger.info(`output directory: ${output}`);




    return
}