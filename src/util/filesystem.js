import { logger } from './logging.js';
import * as fs from 'fs';

export async function writeFile(path, data, debug){
    debug ? logger.debug(`writing file ${path}...`): null;
    try {
        fs.writeFileSync(path, data, 'utf8');
        return true;
    } catch (err) {
        logger.error(err);
    }
}

export async function createDir(dir, debug){
    debug ? logger.debug(`creating ${dir}...`): null;
    try {
        fs.mkdirSync(dir, { recursive: true });
        return true;
    } catch (err) {
        logger.error(err);
    }
}

export async function createOrCleanDir(dir, debug){
    try {
        if (!fs.existsSync(dir)){
            createDir(dir, debug);
        } else {
            // delete dir and recreate
            debug ? logger.debug(`${dir} exists, cleaning...`): null;
            fs.rmSync(dir, { recursive: true, force: true });
            createDir(dir, debug);
        }
        return true;
    } catch (err) {
        logger.error(err);
    }        
}

export async function removeProviderIndexFile(dir, debug){
    try {
        const path = `${dir}/provider.yaml`;
        if (fs.existsSync(path )){
            debug ? logger.debug(`removing ${path}...`): null;
            fs.rmSync(path, { force : true });
        }
        return true;
    }
    catch (err) {
        logger.error(err);
    }
}
