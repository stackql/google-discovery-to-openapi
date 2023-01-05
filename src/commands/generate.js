import { logger } from '../util/logging.js';
import { createOrCleanDir, createDir, writeFile } from '../util/filesystem.js';
import { serviceCategories } from '../config/servicecategories.js';
import * as path from 'path';
import fetch from 'node-fetch';
import * as yaml from 'js-yaml';

function getCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}
  
const rootDiscoveryUrl = 'https://discovery.googleapis.com/discovery/v1/apis';
const baseOpenApiDoc = {
    openapi: '3.1.0', 
    info: {
        contact: {
            name: 'StackQL Studios',
            url: 'https://github.com/stackql/google-discovery-to-openapi',
            email: 'info@stackql.io'
        },
    }, 
    externalDocs: {}, 
    servers: [], 
    components: {},
    paths: {}
};

async function processService(serviceName, serviceCategory, serviceData, outputDir, debug){
    try {
        // create output folder for service
        createDir(path.join(outputDir, serviceCategory, serviceName), debug);

        // init openapi doc
        let openApiDoc = baseOpenApiDoc;

        // get service info
        openApiDoc['info']['title'] = serviceData.title;
        openApiDoc['info']['description'] = serviceData.description;
        openApiDoc['info']['version'] = serviceData.version;
        openApiDoc['info']['x-discovery-doc-revision'] = serviceData.revision; 
        openApiDoc['info']['x-generated-date'] = getCurrentDate();

        // write out openapi doc as yaml
        const openApiDocYaml = yaml.dump(openApiDoc);
        await writeFile(path.join(outputDir, serviceCategory, serviceName, `${serviceName}.yaml`), openApiDocYaml, debug);

        return
    } catch (err) {
        logger.error(err);
    }
}

export async function generateSpecs(options, rootDir) {
    const debug = options.debug;
    const preferred = options.preferred;
    let outputDir = options.output;
    const service = options.service;
    const inputCategory = options.category;

    logger.info('generate called...');
    debug ? logger.debug({rootDir: rootDir, ...options}) : null;

    // pre flight checks
    if(inputCategory != 'all'){
        if(!serviceCategories[inputCategory]){
            logger.error(`invalid category: ${inputCategory}`);
            return;
        }
        if(service != 'all'){
            logger.error(`category OR service can be specified NOT both`);
            return;            
        }
    }

    // get output directory
    if(outputDir.startsWith('/') || outputDir.startsWith('C:\\')){
        debug ? logger.debug('absolute path supplied for output directory') : null;
    } else {
        outputDir = path.join(rootDir, outputDir);
    }
    logger.info(`output directory: ${outputDir}`);

    // get root discovery document
    logger.info('Getting root discovery document...');
    const rootResp = await fetch(rootDiscoveryUrl);
    const rootData = await rootResp.json();

    // filter services by preferred
    let services = [];
    if(preferred){
        services = rootData.items.filter(item => item.preferred === true);
    } else {
        // TODO implement support for nonpreferred APIs
        services = rootData.items;
    }

    // filter services by category or service if specified
    if(inputCategory != 'all'){
        const categoryServices = serviceCategories[inputCategory];
        services = services.filter(item => categoryServices.includes(item.name));
    } else if (service != 'all'){
        services = services.filter(item => item.name == service);
        if(services.length == 0){
            logger.error(`service not found: ${service}`);
            return;
        }
    }

    logger.info(`processing: ${services.length} services...`);
    debug ? logger.debug(`services to be processed:`) : null;
    if(debug){
        services.forEach(service => {
            logger.debug(service.name);
        });
    }
 
    // create output category subdirectories
    createOrCleanDir(outputDir, debug);
    let categorySubDirs = [];
    inputCategory === 'all' ? Object.keys(serviceCategories).forEach(category => {categorySubDirs.push(category)}) : categorySubDirs.push(inputCategory);
    debug ? logger.debug(`creating subdirs for: ${categorySubDirs}`) : null;
    for (let dir of categorySubDirs){
        createDir(path.join(outputDir, dir), debug);
    }
    
    // lets go
    for(let service of services){
        logger.info(`processing ${service.name}...`);
        // get category for service
        let svcCategory = 'lostandfound';
        Object.keys(serviceCategories).forEach(cat => {
            if(serviceCategories[cat].includes(service.name)){
                svcCategory = cat;
            }
        });
        svcCategory == 'lostandfound' ? logger.warn(`service ${service.name} not found in any category`) : null;
        debug ? logger.debug(`service category: ${svcCategory}`) : null;
        debug ? logger.debug(`getting data for ${service.name} from : ${service.discoveryRestUrl}`) : null;
        try {       
            const svcResp = await fetch(service.discoveryRestUrl);
            const svcData = await svcResp.json();
            await processService(service.name, svcCategory, svcData, outputDir, debug)
        } catch (err) {
            logger.error(err);
        }
    }

    const runtime = Math.round(process.uptime() * 100) / 100;
    logger.info(`generate completed in ${runtime}s. ${services.length} files generated.`);

}