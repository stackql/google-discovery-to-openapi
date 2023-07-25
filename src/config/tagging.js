import { logger } from '../util/logging.js';
import { 
    resourceNameOverridesByOperationId,
    resourceNameOverridesByResourceName,
    // genericResourceNameOverrides,
    sqlVerbOverrides,
 } from './overrides.js';

const exceptions = ['gitlab', 'github', 'dotcom'];

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

function getResourceNameOverride(service, resource, operationId) {
    let newResource = resourceNameOverridesByOperationId[service] && resourceNameOverridesByOperationId[service][operationId];
    
    if (newResource) {
        return newResource;
    } else {
        // apply generic overrides
        if(resource.startsWith('projects_locations_')){
            newResource = resource.slice('projects_locations_'.length);
        } else if (resource.startsWith('organizations_locations_')) {
            newResource = resource.slice('organizations_locations_'.length);
        } else if(resource === 'projects_locations'){
            newResource = 'locations';
        } else if(resource === 'organizations_locations'){
            newResource = 'locations';
        } else {
            newResource = resource;
        }
        // apply resource specific overrides by service
        let resourceOverrideFunc = resourceNameOverridesByResourceName[service];
        if (resourceOverrideFunc) {
            let override = resourceOverrideFunc(newResource);
            if (override) {
                return override;
            }
        }
    }

    return newResource;
}

function getSqlVerbOverride(service, verb, operationId) {
    const override = sqlVerbOverrides[service] && sqlVerbOverrides[service][operationId];
    
    if (override) {
        return override;
    }

    return verb;
}

export function getResource(service, operationId, debug){

    let resource = service;
    const action = operationId.split('.')[operationId.split('.').length - 1];

    const resTokens = [];
    for (const token of operationId.split('.').slice(1, -1)) {
    resTokens.push(camelToSnake(token));
    }

    // error and exit if resTokens is empty
    if (resTokens.length === 0) {
        logger.warn(`resTokens is empty for ${operationId}`);
    }

    resource = resTokens.join('_');

    // general action based rules
    if (['getIamPolicy', 'setIamPolicy', 'testIamPermissions', 'analyzeIamPolicy', 'analyzeIamPolicyLongrunning', 'searchAllIamPolicies'].includes(action)) {
        resource = `${resource}_iam_policies`;
    } else if (action.startsWith('get') && action !== 'get') {
        resource = `${resource}${camelToSnake(action.slice(3))}`;
    } else if (action.startsWith('list') && action !== 'list') {
        resource = `${resource}${camelToSnake(action.slice(4))}`;
    } else if (action.startsWith('delete') && action !== 'delete') {
        resource = `${resource}${camelToSnake(action.slice(6))}`;
    } else if (action.startsWith('batchGet') && action !== 'batchGet') {
        resource = `${resource}${camelToSnake(action.slice(8))}`;
    } else if (action.startsWith('remove') && action !== 'remove') {
        resource = `${resource}${camelToSnake(action.slice(6))}`;
    } else if (action.startsWith('create') && action !== 'create') {
        resource = `${resource}${camelToSnake(action.slice(6))}`;
    } else if (action.startsWith('add') && action !== 'add') {
        resource = `${resource}${camelToSnake(action.slice(3))}`;
    } else if (action.startsWith('fetch') && action !== 'fetch') {
        resource = `${resource}${camelToSnake(action.slice(5))}`;
    } else if (action.startsWith('retrieve') && action !== 'retrieve') {
        resource = `${resource}${camelToSnake(action.slice(8))}`;
    }

    // replace double underscores in resource name with single underscore
    resource = resource.replace(/__/g, '_');

    const preChangedResourceName = resource;

    resource = getResourceNameOverride(service, resource, operationId);

    console.log(`${preChangedResourceName} => ${resource}`);

    // resource should never start with an underscore
    if (resource.startsWith('_')) {
        resource = resource.slice(1);
    }

    return [resource, action];
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

// export function getSQLVerb(service, resource, action, operationId, httpPath, httpVerb, operationObj, schemasObj, debug) {

//     // default sql verb to 'exec'
//     let sqlVerb = 'exec';

//     const actionToVerb = {
//         'add': 'insert',
//         'create': 'insert',
//         'insert': 'insert',
//         'get': 'select',
//         'list': 'select',
//         'aggregated': 'select',
//         'fetch': 'select',
//         'read': 'select',
//         'retrieve': 'select',
//         'delete': 'delete',
//         'remove': 'delete',
//         'destroy': 'delete',
//         'dropDatabase': 'delete',
//     };

//     const verbAction = Object.keys(actionToVerb).find(actionStart => action.startsWith(actionStart));
//     if (verbAction) {
//         sqlVerb = actionToVerb[verbAction];
//         if (sqlVerb === 'delete' && action === 'removeProject') {
//             sqlVerb = 'exec';
//         }
//     }

//     // safeguard
//     if (sqlVerb === 'select' && httpVerb !== 'get') {
//         sqlVerb === 'exec';
//     }

//     sqlVerb = sqlVerb === 'select' ? checkAdditionalProperties(operationObj, schemasObj) : sqlVerb;

//     // override by exception by service
//     sqlVerb = getSqlVerbOverride(service, sqlVerb, operationId);

//     return sqlVerb;
// }

export function getSQLVerb(service, resource, action, operationId, httpPath, httpVerb, operationObj, schemasObj, debug) {
    
    console.log(`Checking verb for resource: ${resource}, action ${action}`); // Debug line

    // default sql verb to 'exec'
    let sqlVerb = 'exec';

    const actionToVerb = {
        'add': 'insert',
        'create': 'insert',
        'insert': 'insert',
        'get': 'select',
        'list': 'select',
        'aggregated': 'select',
        'fetch': 'select',
        'read': 'select',
        'retrieve': 'select',
        'delete': 'delete',
        'remove': 'delete',
        'destroy': 'delete',
        'dropDatabase': 'delete',
    };

    const verbAction = Object.keys(actionToVerb).find(actionStart => action.startsWith(actionStart));

    if (verbAction) {
        console.log(`Matched verbAction: ${verbAction}`); // Debug line
        sqlVerb = actionToVerb[verbAction];
        if (sqlVerb === 'delete' && action === 'removeProject') {
            sqlVerb = 'exec';
        }
    }

    console.log(`sqlVerb after actionToVerb: ${sqlVerb}`); // Debug line

    // safeguard
    if (sqlVerb === 'select' && httpVerb !== 'get') {
        sqlVerb = 'exec';
    }

    console.log(`sqlVerb after safeguard: ${sqlVerb}`); // Debug line

    sqlVerb = sqlVerb === 'select' ? checkAdditionalProperties(operationObj, schemasObj) : sqlVerb;

    console.log(`sqlVerb after checkAdditionalProperties: ${sqlVerb}`); // Debug line

    // override by exception by service
    sqlVerb = getSqlVerbOverride(service, sqlVerb, operationId);

    console.log(`sqlVerb after getSqlVerbOverride: ${sqlVerb}`); // Debug line

    return sqlVerb;
}

  