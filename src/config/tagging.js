import { logger } from '../util/logging.js';
import { 
    resourceNameOverridesByOperationId,
    resourceNameOverridesByResourceName,
    sqlVerbOverrides,
    objectKeyByOperationId,
    methodNameOverrides,
 } from './overrides.js';
 import jsonpointer from 'jsonpointer';

//
// constant declarations
//

const exceptions = ['gitlab', 'github', 'dotcom'];

const googleSelectMethods = [
    'aggregatedList',
    'get',
    'batchGet',
    'list',
    'query',
    'fetch',
    'retrieve',
];

const googleSelectPOSTMethods = [
    'get',
    'list',
    'fetch',
];

const googleInsertMethods = [
    'insert',
    'create',
    'add',
    'batchCreate',
    'bulkInsert',
];

const googleDeleteMethods = [
    'delete',
    'remove',
];

const googleDeletePOSTMethods = [
    'delete',
    'destroy',
    'batchDelete',
    'bulkDelete',
    'remove',
];

const googleUpdateMethods = [
    'update',
    'patch',
];

const googleUpdatePOSTMethods = [
    'update',
    'patch',
    'batchUpdate',
];

const googleReplaceMethods = [
    'update',
    'replace',
];

const googleReplacePOSTMethods = [
    'replace',
];


//
// utility functions
//

function camelToSnake(name) {
    // Replace exceptions in string regardless of case
    for (const exception of exceptions) {
        const regex = new RegExp(exception, 'ig'); // 'i' for case insensitive and 'g' for global
        name = name.replace(regex, exception);
    }

    // Then convert the rest to snake case
    name = name.replace(/([a-z0-9])([A-Z])/g, '$1_$2');
    return name.toLowerCase();
}

function getResourceNameOverrideByOperationId(service, operationId) {
    // return the resource name or false
    return resourceNameOverridesByOperationId[service] && resourceNameOverridesByOperationId[service][operationId];
}

function getResourceNameOverrideByName(service, resource) {
    // return the new resource name or the original
    const override = resourceNameOverridesByResourceName[service] && resourceNameOverridesByResourceName[service][resource];
    
    if (override) {
        return override;
    }

    return resource;
}

function getSqlVerbOverride(service, verb, operationId) {
    // return the new sql verb or the original
    const override = sqlVerbOverrides[service] && sqlVerbOverrides[service][operationId];
    
    if (override) {
        return override;
    }

    return verb;
}

function getResourceNameFromOperationId(operationId) {

    const opTokens = operationId.split('.');
    // return 2d last token
    return camelToSnake(opTokens[opTokens.length - 2]);

}

function ifStartsWithOrEquals(str, substr) {
    return str.startsWith(substr) || str === substr;
}

function checkAdditionalProperties(moperationObj, schemasObj) {
    const schema = moperationObj.responses?.['200']?.content?.['application/json']?.schema?.['$ref'];
    const schemaObj = schemasObj[schema.split('/').pop()];

    if (schemaObj.properties) {
        const hasAdditionalProperties = Object.values(schemaObj.properties).some(field => 'additionalProperties' in field);
        return hasAdditionalProperties ? 'exec' : 'select';
    } else {
        logger.warn(`schemaObj.properties not found for ${schema}`);
        return 'exec';
    }
}

//
// exported functions
//

export function getMethodName(service, operationId, debug) {

    const override = methodNameOverrides[service] && methodNameOverrides[service][operationId];
    
    if (override) {
        return override;
    }

    const fullyQualifiedMethodNameServices = [
        // 'iam',
        'accessapproval',
        'analyticshub',
        'apigee',
        'apigeeregistry',
        'beyondcorp',
        'bigquerydatatransfer',
        'cloudbuild',
        'container',
        'containeranalysis',
        'datacatalog',
        'dataflow',
        'datalabeling',
        'dataplex',
        'dataproc',
        'dialogflow',
        'discoveryengine',
        'dlp',
        'documentai',
        'essentialcontacts',
        'gkehub',
        'gkeonprem',
        'integrations',
        'logging',
        'ml',
        'monitoring',
        'networksecurity',
        'orgpolicy',
        'policysimulator',
        'prod_tt_sasportal',
        'pubsub',
        'pubsublite',
        'recommendationengine',
        'recommender',
        'resourcesettings',
        'retail',
        'sasportal',
        'securitycenter',
        'spanner',
        'translate',
        'videointelligence',
        'vision',
    ];

    const action = operationId.split('.')[operationId.split('.').length - 1];
    const opTokens = operationId.split('.').slice(1);

    if (fullyQualifiedMethodNameServices.includes(service)) {
        return camelToSnake(opTokens.join('_'));
    } else {
        return camelToSnake(action);
    }
}

export function getResource(service, operationId, debug){

    const action = operationId.split('.')[operationId.split('.').length - 1];

    // check for an explicit map by operationId
    if(getResourceNameOverrideByOperationId(service, operationId)){
        return [getResourceNameOverrideByOperationId(service, operationId), action];
    }

    // derive the resource name from the operationId    
    let resource = getResourceNameFromOperationId(operationId);
    
    const specialTokens = [
        'organizations', 
        'folders', 
        'projects', 
        'locations',
    ];
    const verbs = [
        'get', 
        'list',
        'delete',
        'batchGet',
        'remove',
        'create',
        'add',
        'update',
        'fetch',
        'retrieve',
    ];

    // update resource name based on action
    const processAction = (action, resource) => {
        if (['getIamPolicy', 'setIamPolicy', 'testIamPermissions', 'analyzeIamPolicy', 'analyzeIamPolicyLongrunning', 'searchAllIamPolicies'].includes(action)) {
            return `${resource}_iam_policies`;
        } 
        else {
            for (let verb of verbs) {
                if (action.startsWith(verb) && action !== verb) {
                    const suffix = camelToSnake(action.slice(verb.length));
                    if (specialTokens.includes(resource)) {
                        return `${suffix}`;
                    } else {
                        return `${resource}_${suffix}`;
                    }
                }
            }
        }
        // return original resource if no special conditions apply
        return resource;
    };
    
    resource = processAction(action, resource);

    // replace double underscores in resource name with single underscore
    resource = resource.replace(/__/g, '_');

    // resource should never start with an underscore
    if (resource.startsWith('_')) {
        resource = resource.slice(1);
    }

    // final update based upon resource name
    resource = getResourceNameOverrideByName(service, resource);

    return [resource, action];
}

export function getObjectKey(openapiDoc, service, operationId, debug) {

    // Check if the service exists in the objectKeyByOperationId object
    if (objectKeyByOperationId[service]) {
        // Check if the operationId exists for the given service
        if (objectKeyByOperationId[service][operationId]) {
            return objectKeyByOperationId[service][operationId] === 'skip' ? false : objectKeyByOperationId[service][operationId];
        }
    }
    // service or operationId doesn't exist, keep going

    // If the last token of the operationId is getIamPolicy, return '$.bindings'.
    if (operationId.endsWith('.getIamPolicy')) {
        return '$.bindings';
    }

    // its not a getIamPolicy operation, keep going

    // If the last token of the operationId is NOT "list" or "aggregatedList" or does not start with "list", return false.
    const lastToken = operationId.split('.').pop();

    if (lastToken != 'list' && !lastToken.startsWith('list') && lastToken != 'aggregatedList') {
        return false;
    }

    // is is a compute resource
    if (service === 'compute') {
        // get the second to last token of operationId
        const secondToLastToken = operationId.split('.')[operationId.split('.').length - 2];
        if (lastToken === 'aggregatedList') {
            return `$.items[*].${secondToLastToken}[*]`;
        } else {
            return false;
        }
    };

    // its not a compute resource, keep going

    // Retrieve the response schema reference for a successful response.
    let schemaRef;
    for (const path of Object.keys(openapiDoc.paths)) {
        for (const verb of Object.keys(openapiDoc.paths[path])) {
            if (verb === 'get' && openapiDoc.paths[path][verb].operationId === operationId) {
                const responseContent = openapiDoc.paths[path][verb]['responses']['200']['content'];
                if (responseContent && responseContent['application/json'] && responseContent['application/json']['schema']) {
                    schemaRef = responseContent['application/json']['schema']['$ref'];
                }
            }
        }
    }

    if (!schemaRef) {
        return false;  // No valid schema reference found.
    }

    // Convert the schemaRef (which looks like "#/components/schemas/MySchema") to a JSON Pointer.
    const jsonPointerPath = schemaRef.replace('#', '');

    // Use the pointer to get the desired object.
    const schemaObj = jsonpointer.get(openapiDoc, jsonPointerPath);

    if (!schemaObj) {
        logger.error(`Could not find schema object for pointer '${jsonPointerPath}' from schemaRef '${schemaRef}'`);
        return false;
    }

    // Check for presence of "nextPageToken".
    if (!schemaObj.properties || !schemaObj.properties['nextPageToken']) {
        return false;
    }

    // Find array properties sibling to "nextPageToken".
    const arrayProperties = [];
    for (const propName of Object.keys(schemaObj.properties)) {
        if (schemaObj.properties[propName].type === 'array' && propName !== 'nextPageToken') {
            arrayProperties.push(propName);
        }
    }

    if (arrayProperties.length === 0) {
        return false;
    } else if (arrayProperties.length > 1) {
        // Log a warning if multiple array types are found.
        logger.warn(`multiple array types found for operationId : ${operationId}, arrayProperties : ${JSON.stringify(arrayProperties)}`);
    }

    // Return the name of the array, prefixed with "$.".
    const xStackQLObjectKey = `$.${arrayProperties[0]}`;
    return xStackQLObjectKey;

}

export function getSQLVerb(service, resource, action, operationId, httpPath, httpVerb, operationObj, schemasObj, debug) {
    
    // default sql verb to 'exec'
    let sqlVerb = 'exec';

    //
    // iam_policies
    //

    // if resource ends with '_iam_policies' and last token of 'operationId' is 'getIamPolicy' return 'select'
    if (resource.endsWith('_iam_policies') && operationId.endsWith('.getIamPolicy')) {
        return 'select';
    }

    // if resource ends with '_iam_policies' and last token of 'operationId' is 'setIamPolicy' return 'replace'
    if (resource.endsWith('_iam_policies') && operationId.endsWith('.setIamPolicy')) {
        return 'replace';
    }    

    //
    // insert methods
    //

    // check if action equals or starts with an insert method
    if (googleInsertMethods.some(method => ifStartsWithOrEquals(action, method)) && httpVerb === 'post') {
        sqlVerb = 'insert';
    }
    
    //
    // update methods
    //

    // check if action equals or starts with an update method
    if (googleUpdateMethods.some(method => ifStartsWithOrEquals(action, method)) && httpVerb === 'patch') {
        sqlVerb = 'update';
    }

    // update POST exceptions
    if (googleUpdatePOSTMethods.some(method => ifStartsWithOrEquals(action, method)) && httpVerb === 'post') {
        sqlVerb = 'update';
    }

    //  
    // replace methods
    //

    // check if action equals or starts with a replace method
    if (googleReplaceMethods.some(method => ifStartsWithOrEquals(action, method)) && httpVerb === 'put') {
        sqlVerb = 'replace';
    }

    // replace POST exceptions
    if (googleReplacePOSTMethods.some(method => ifStartsWithOrEquals(action, method)) && httpVerb === 'post') {
        sqlVerb = 'replace';
    }

    //
    // delete methods
    //

    // check if action equals or starts with a delete method
    if (googleDeleteMethods.some(method => ifStartsWithOrEquals(action, method)) && httpVerb === 'delete') {
        sqlVerb = 'delete';
    }

    // delete POST exceptions
    if (googleDeletePOSTMethods.some(method => ifStartsWithOrEquals(action, method)) && httpVerb === 'post') {
        sqlVerb = 'delete';
    }

    //
    // select methods
    //

    // check if action equals or starts with a select method
    if (googleSelectMethods.some(method => ifStartsWithOrEquals(action, method)) && httpVerb === 'get') {
        sqlVerb = 'select';
    }

    // select POST exceptions
    if (googleSelectPOSTMethods.some(method => ifStartsWithOrEquals(action, method)) && httpVerb === 'post') {
        sqlVerb = 'select';
    }

    // sqlVerb = sqlVerb === 'select' ? checkAdditionalProperties(operationObj, schemasObj) : sqlVerb;    

    // override by exception by service
    sqlVerb = getSqlVerbOverride(service, sqlVerb, operationId);

    return sqlVerb;
}

  