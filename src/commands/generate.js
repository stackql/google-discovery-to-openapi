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

const rootDiscoveryUrl = {
    'googleapis.com': 'https://discovery.googleapis.com/discovery/v1/apis',
    firebase: 'https://discovery.googleapis.com/discovery/v1/apis',
    googleadmin: 'https://admin.googleapis.com/$discovery/rest?version=directory_v1'
};

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
        openApiDoc = tagOperations(openApiDoc, serviceName, debug);

        // write out openapi doc as yaml
        const openApiDocYaml = yaml.dump(openApiDoc);
        await writeFile(path.join(serviceDir, `${serviceName}.yaml`), openApiDocYaml, debug);

        return
    } catch (err) {
        logger.error(err);
        process.exit(1);
    }
}

/*
*  main routine
*/

export async function generateSpecs(options, rootDir) {
    const debug = options.debug;
    const preferred = options.preferred;
    let outputDir = options.output;
    const provider = options.provider;
    
    // make sure provider is one of 'googleapis.com', 'firebase', or 'googleadmin'
    if(provider !== 'googleapis.com' && provider !== 'firebase' && provider !== 'googleadmin'){
        logger.error('invalid service specified, exiting...');
        return;
    }

    logger.info(`generate called for ${provider}...`);
    debug ? logger.debug({rootDir: rootDir, ...options}) : null;

    // get output directory
    if(outputDir.startsWith('/') || outputDir.startsWith('C:\\')){
        debug ? logger.debug('absolute path supplied for output directory') : null;
    } else {
        outputDir = path.join(rootDir, outputDir);
    }
    logger.info(`output directory: ${outputDir}`);

    // create spec directory
    let providerDir = path.join(outputDir, provider, 'v00.00.00000', 'services');
    if(!preferred && provider != 'googleadmin'){
        providerDir = path.join(outputDir, provider == 'googleapis.com' ? 'google_beta' : `${provider}_beta`, 'v00.00.00000', 'services');
    }
    createOrCleanDir(providerDir, debug);

    // get root discovery document
    logger.info('Getting root discovery document...');
    const rootResp = await fetch(rootDiscoveryUrl[provider]);
    const rootData = await rootResp.json();

    if(provider != 'googleadmin'){
        //
        // only for googleapis.com and firebase
        //

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
        logger.info('Checking OAuth scopes...');
        for(let service of services){
            try {       
                logger.info(`checking ${service.name}...`);
                const svcResp = await fetch(service.discoveryRestUrl);
                const svcData = await svcResp.json();

                let svcDir = path.join(providerDir, service.name);

                // check if svcData.oauth2.scopes includes a key named "https://www.googleapis.com/auth/cloud-platform"
                if(svcData['auth']){
                    if(svcData['auth']['oauth2']){
                        if(svcData['auth']['oauth2']['scopes']){
                            if(svcData['auth']['oauth2']['scopes']['https://www.googleapis.com/auth/cloud-platform']){
                                if(service.name.includes('firebase') || service.name.includes('toolresults') || service.name.includes('fcm')){
                                    // its a firebase service
                                    if(provider === 'firebase'){
                                        logger.info(`--------------------------------------`);
                                        logger.info(`processing service ${service.name} ...`);
                                        logger.info(`--------------------------------------`);
                                        createDir(svcDir, debug);
                                        await processService(service.name, svcData, svcDir, debug);                                        
                                    }
                                } else {
                                    if(provider === 'googleapis.com'){
                                        logger.info(`--------------------------------------`);
                                        logger.info(`processing service ${service.name} ...`);
                                        logger.info(`--------------------------------------`);
                                        createDir(svcDir, debug);
                                        await processService(service.name, svcData, svcDir, debug);                                        
                                    }
                                }
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

    } else {
        //
        // googleadmin
        //

        logger.info(`processing googleadmin.directory...`);

        let svcDir = path.join(providerDir, 'directory');
        createDir(svcDir, debug);
        await processService('directory', rootData, svcDir, debug);

    }

    const runtime = Math.round(process.uptime() * 100) / 100;
    logger.info(`generate completed in ${runtime}s. ${services.length} files generated.`);
 
}