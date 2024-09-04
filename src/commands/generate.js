import { logger } from '../util/logging.js';
import { 
    createOrCleanDir, 
    removeProviderIndexFile,
    createDir, 
    writeFile 
} from '../util/filesystem.js';
import { 
    getCurrentDate,
    populateSecuritySchemes, 
    replaceSchemaRefs, 
    processParameters, 
    populatePaths,
    generateStackQLResources,
} from '../helper/functions.js';
import * as path from 'path';
import fetch from 'node-fetch';
import * as yaml from 'js-yaml';

import fs from 'fs';


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
*  provider index creation function
*/

const configObj = {
    auth: {
        credentialsenvvar: 'GOOGLE_CREDENTIALS',
        type: 'service_account'
    }
};

async function generateProviderIndex(provider, servicesDir, providerDir, configObj, debug) {

    logger.info(`generating provider index for ${provider}...`);

    const version = 'v00.00.00000';
    const providerServices = {};

    const providerName = provider === 'googleapis.com' ? 'google' : provider;

    // Read all YAML files in the servicesDir directory
    const files = fs.readdirSync(servicesDir);

    for (const file of files) {
        try {			
            debug ? logger.debug(`processing: ${file}`) : null;
            if (path.extname(file) === '.yaml') {
                const filePath = path.join(servicesDir, file);
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const apiSpec = yaml.load(fileContent);
    
                const serviceName = path.basename(file, '.yaml');
                const info = apiSpec.info;
    
                providerServices[serviceName] = {
                    id: `${serviceName}:${version}`,
                    name: serviceName,
                    preferred: true,
                    service: {
                        $ref: `${provider}/${version}/services/${serviceName}.yaml`
                    },
                    title: info.title,
                    version: version,
                    description: info.description,
                };
            }
        } catch (err) {
            logger.error(`Error processing file ${file}: ${err.message}`);
        }
    }

    const providerYaml = {
        id: providerName,
        name: providerName,
        version: version,
        providerServices: providerServices,
        config: configObj
    };

    // Ensure the provider directory exists
    if (!fs.existsSync(providerDir)) {
        debug ? logger.debug(`${providerDir} does not exist, creating...`) : null;
        fs.mkdirSync(providerDir, { recursive: true });
    }

    // Write the provider YAML to the provider.yaml file
    const outputFilePath = path.join(providerDir, 'provider.yaml');
    debug ? logger.debug(`writing file to: ${outputFilePath}...`) : null;
    await writeFile(outputFilePath, yaml.dump(providerYaml), debug);
    debug ? logger.debug(`provider index generated at: ${outputFilePath}`) : null;
}

/*
*  service processing function
*/

async function processService(provider, serviceName, serviceData, serviceDir, debug){
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

        // add stackql resources
        debug ? logger.debug('adding stackQL resources...') : null;
        openApiDoc = generateStackQLResources(provider, openApiDoc, serviceName, debug);

        // remove problematic operations
        debug ? logger.debug('removing problem paths..') : null;
        const pathsToRemove = [
            '/v1alpha/projects/{projectsId}/locations/{locationsId}/integrations/{integrationsId}:executeEvent'
        ];

        pathsToRemove.forEach(path => {
            delete openApiDoc['paths'][path];
        });

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
    
    const requiredGCPScope = 'https://www.googleapis.com/auth/cloud-platform';

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
        outputDir = path.join(rootDir, outputDir, 'src');
    }
    logger.info(`output directory: ${outputDir}`);

    // create spec directory
    const providerDir = path.join(outputDir, provider, 'v00.00.00000'); 
    let servicesDir = path.join(providerDir, 'services');
    if(!preferred && provider != 'googleadmin'){
        servicesDir = path.join(outputDir, provider == 'googleapis.com' ? 'google_beta' : `${provider}_beta`, 'v00.00.00000', 'services');
    }
    createOrCleanDir(servicesDir, debug);
    removeProviderIndexFile(providerDir, debug);
    
    // get root discovery document
    logger.info('Getting root discovery document...');
    const rootResp = await fetch(rootDiscoveryUrl[provider]);
    const rootData = await rootResp.json();

    if(provider != 'googleadmin'){
        //
        // only for googleapis.com and firebase
        //

        const additionalServiceData = [
            {
                name: "cloudcommerceprocurement",
                id: "cloudcommerceprocurement:v1",
                version: "v1",
                title: "Cloud Commerce Partner Procurement API",
                description: "Partner API for the Cloud Commerce Procurement Service.",
                discoveryRestUrl: "https://cloudcommerceprocurement.googleapis.com/$discovery/rest?version=v1",
                icons: {
                    x16: "http://www.google.com/images/icons/product/search-32.gif",
                    x32: "http://www.google.com/images/icons/product/search-16.gif"
                  },
                documentationLink: "https://cloud.google.com/marketplace/docs/partners/",
                preferred: true
            },
            {
                id: "iam:v2beta",
                name: "iamv2beta",
                version: "v2beta",
                title: "Identity and Access Management (IAM) API",
                description: "Manages identity and access control for Google Cloud resources, including the creation of service accounts, which you can use to authenticate to Google and make API calls. Enabling this API also enables the IAM Service Account Credentials API (iamcredentials.googleapis.com). However, disabling this API doesn't disable the IAM Service Account Credentials API.",
                discoveryRestUrl: "https://iam.googleapis.com/$discovery/rest?version=v2beta",
                icons: {
                  x16: "https://www.gstatic.com/images/branding/product/1x/googleg_16dp.png",
                  x32: "https://www.gstatic.com/images/branding/product/1x/googleg_32dp.png"
                },
                documentationLink: "https://cloud.google.com/iam/",
                preferred: false
              },
              {
                id: "iam:v1",
                name: "iam",
                version: "v1",
                title: "Identity and Access Management (IAM) API",
                description: "Manages identity and access control for Google Cloud resources, including the creation of service accounts, which you can use to authenticate to Google and make API calls. Enabling this API also enables the IAM Service Account Credentials API (iamcredentials.googleapis.com). However, disabling this API doesn't disable the IAM Service Account Credentials API.",
                discoveryRestUrl: "https://iam.googleapis.com/$discovery/rest?version=v1",
                icons: {
                  x16: "https://www.gstatic.com/images/branding/product/1x/googleg_16dp.png",
                  x32: "https://www.gstatic.com/images/branding/product/1x/googleg_32dp.png"
                },
                documentationLink: "https://cloud.google.com/iam/",
                preferred: false
              },
              {
                id: "iam:v2",
                name: "iamv2",
                version: "v2",
                title: "Identity and Access Management (IAM) API",
                description: "Manages identity and access control for Google Cloud resources, including the creation of service accounts, which you can use to authenticate to Google and make API calls. Enabling this API also enables the IAM Service Account Credentials API (iamcredentials.googleapis.com). However, disabling this API doesn't disable the IAM Service Account Credentials API.",
                discoveryRestUrl: "https://iam.googleapis.com/$discovery/rest?version=v2",
                icons: {
                  x16: "https://www.gstatic.com/images/branding/product/1x/googleg_16dp.png",
                  x32: "https://www.gstatic.com/images/branding/product/1x/googleg_32dp.png"
                },
                documentationLink: "https://cloud.google.com/iam/",
                preferred: true
              },            
        ];
        
        const excludedServices = ["iam"];

        // filter services by preferred
        let services = [];
        if(preferred){
            services = rootData.items.filter(item => 
                item.preferred === true && !excludedServices.includes(item.name)
            );
            services = services.concat(additionalServiceData);
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

                // if(service.name != 'serviceusage' && service.name != 'iam' && service.name != 'iamv2' && service.name != 'iamv2beta'){
                //     continue;
                // }

                const svcResp = await fetch(service.discoveryRestUrl);
                const svcData = await svcResp.json();

                // check if svcData.auth.oauth2.scopes includes any key
                if(svcData['auth'] && svcData['auth']['oauth2'] && svcData['auth']['oauth2']['scopes']){
                    if(Object.keys(svcData['auth']['oauth2']['scopes']).length > 0){
                        if(service.name.includes('firebase') || service.name.includes('toolresults') || service.name.includes('fcm')){
                            // its a firebase service
                            if(provider === 'firebase'){
                                logger.info(`--------------------------------------`);
                                logger.info(`processing service ${service.name} ...`);
                                logger.info(`--------------------------------------`);
                                await processService(provider, service.name, svcData, servicesDir, debug);                                        
                            }
                        } else {
                            if(provider === 'googleapis.com'){
                                if (Object.keys(svcData.auth.oauth2.scopes).includes(requiredGCPScope)) {
                                    logger.info(`--------------------------------------`);
                                    logger.info(`processing service ${service.name} ...`);
                                    logger.info(`--------------------------------------`);
                                    await processService('google', service.name, svcData, servicesDir, debug);                                   
                                } else {
                                    logger.info(`service ${service.name} does not have required GCP scope, skipping...`);
                                }
                            }
                        }
                    }
                } else {
                    logger.info(`service ${service.name} has no auth, skipping...`);
                }
            } catch (err) {
                // crash program if error
                logger.error(err);
                if(service.name != 'poly'){
                    process.exit(1);
                }
           }
        }

    } else {
        //
        // googleadmin
        //
        logger.info(`processing googleadmin.directory...`);
        await processService('googleadmin', 'directory', rootData, servicesDir, debug);
    }

    // add provider.yaml file
    await generateProviderIndex(provider, servicesDir, providerDir, configObj, debug);

    const runtime = Math.round(process.uptime() * 100) / 100;
    logger.info(`generate completed in ${runtime}s. ${services.length} files generated.`);
 
}
