import { logger } from '../util/logging.js';
import { 
    createOrCleanDir, 
    createDir, 
    writeFile 
} from '../util/filesystem.js';
import { 
    getCurrentDate,
    populateSecuritySchemes, 
    replaceSchemaRefs, 
    processParameters, 
    populatePaths,
    tagOperations,
} from '../helper/functions.js';
import * as path from 'path';
import fetch from 'node-fetch';
import * as yaml from 'js-yaml';

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

/*
*  service processing function
*/

async function processService(serviceName, serviceData, serviceDir, debug){
    try {

        // init openapi doc
        let openApiDoc = baseOpenApiDoc;

        // populate service info
        debug ? logger.debug('populating service info...') : null;
        openApiDoc['info']['title'] = serviceData.title;
        openApiDoc['info']['description'] = serviceData.description;
        openApiDoc['info']['version'] = serviceData.version;
        openApiDoc['info']['x-discovery-doc-revision'] = serviceData.revision; 
        openApiDoc['info']['x-generated-date'] = getCurrentDate();

        // populate external docs
        debug ? logger.debug('populating external docs..') : null;
        openApiDoc['externalDocs']['url'] = serviceData.documentationLink;

        // populate servers
        debug ? logger.debug('populating servers..') : null;
        let serverUrl = `${serviceData.rootUrl}${serviceData.servicePath}`;
        if(serverUrl.endsWith('/')){
            serverUrl = serverUrl.slice(0, -1);
        }
        openApiDoc['servers'] = [];
        openApiDoc['servers'].push({'url': serverUrl});        
        
        // populate securitySchemes
        debug ? logger.debug('populating securitySchemes..') : null;
        
        if(serviceData.auth){
            openApiDoc['components']['securitySchemes'] = populateSecuritySchemes(serviceData.auth);
            // console.log(serviceData.auth);
        }
    
        // populate schemas
        debug ? logger.debug('populating schemas..') : null;
        openApiDoc['components']['schemas'] = replaceSchemaRefs(serviceData.schemas);

        // populate parameters
        debug ? logger.debug('populating parameters..') : null;
        let paramRefList = [];
        if(serviceData.parameters){
            const [paramsObj, retParamsRefList] = processParameters(serviceData.parameters);
            paramRefList = retParamsRefList;
            openApiDoc['components']['parameters'] = paramsObj;
        }

        // populate paths (most of the action happens here)
        debug ? logger.debug('populating paths..') : null;
        openApiDoc['paths'] = populatePaths({}, serviceData.resources, paramRefList, debug);

        // tag operations
        debug ? logger.debug('tagging operations..') : null;
        openApiDoc = tagOperations(openApiDoc, serviceName);

        // write out openapi doc as yaml
        const openApiDocYaml = yaml.dump(openApiDoc);
        await writeFile(path.join(serviceDir, `${serviceName}.yaml`), openApiDocYaml, debug);

        return
    } catch (err) {
        logger.error(err);
    }
}

/*
*  main routine
*/

export async function generateSpecs(options, rootDir) {
    const debug = options.debug;
    const preferred = options.preferred;
    let outputDir = options.output;
    const service = options.service; // TODO: implement single service processing option 

    logger.info('generate called...');
    debug ? logger.debug({rootDir: rootDir, ...options}) : null;

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
        let betaServices = [];
        betaServices = rootData.items;
        betaServices.forEach(service => {
            // if service.id does not contain the words beta or alpha, delete the service
            if(service.id.includes('beta') || service.id.includes('alpha')){
                service.name = service.id.replace(':', '_');
                services.push(service);
            }
        });
    }

    logger.info(`processing: ${services.length} services...`);
    debug ? logger.debug(`services to be processed:`) : null;
    if(debug){
        services.forEach(service => {
            logger.debug(service.name);
        });
    }

    // get document for each service, check if oauth2.scopes includes a key named "https://www.googleapis.com/auth/cloud-platform"
    let cloudDir = path.join(outputDir, 'google', 'v00.00.00000', 'services');
    let firebaseDir = path.join(outputDir, 'firebase', 'v00.00.00000', 'services');
    
    if(!preferred){
        cloudDir = path.join(outputDir, 'google_beta', 'v00.00.00000', 'services');
        firebaseDir = path.join(outputDir, 'firebase_beta', 'v00.00.00000', 'services');
    }
    
    createOrCleanDir(outputDir, debug);
    createOrCleanDir(cloudDir, debug);
    createOrCleanDir(firebaseDir, debug);

    logger.info('Checking OAuth scopes...');
    for(let service of services){
        try {       
            logger.info(`checking ${service.name}...`);
            const svcResp = await fetch(service.discoveryRestUrl);
            const svcData = await svcResp.json();

            let svcDir = path.join(cloudDir, service.name);

            // check if svcData.oauth2.scopes includes a key named "https://www.googleapis.com/auth/cloud-platform"
            if(svcData['auth']){
                if(svcData['auth']['oauth2']){
                    if(svcData['auth']['oauth2']['scopes']){
                        if(svcData['auth']['oauth2']['scopes']['https://www.googleapis.com/auth/cloud-platform']){
                            logger.info(`service ${service.name} has required scope, processing...`);
                            
                            if(service.name.includes('firebase') || service.name.includes('toolresults') || service.name.includes('fcm')){
                                logger.info(`service ${service.name} is a firebase service, writing to firebase directory...`);
                                svcDir = path.join(firebaseDir, service.name);
                            } else {
                                logger.info(`service ${service.name} is a cloud service, writing to cloud directory...`);
                            }
                            createDir(svcDir, debug);
                            await processService(service.name, svcData, svcDir, debug)
                        }
                    }
                }
            } else {
                logger.info(`service ${service.name} has no auth, skipping...`);
            }
        } catch (err) {
            logger.error(err);
        }
    }

    const runtime = Math.round(process.uptime() * 100) / 100;
    logger.info(`generate completed in ${runtime}s. ${services.length} files generated.`);
 
}