import { logger } from '../util/logging.js';
import { 
    resourceNameOverrides,
    sqlVerbOverrides,
 } from './overrides.js';

function camelToSnake(name) {
    name = name.replace(/([A-Z])/g, function(match) {
      return "_" + match;
    });
    return name.toLowerCase();
}

function getResourceNameOverride(service, resource, operationId) {
    const override = resourceNameOverrides[service] && resourceNameOverrides[service][operationId];
    
    if (override) {
        return override;
    }

    return resource;
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

    // service based exceptions
    resource = getResourceNameOverride(service, resource, operationId);

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

export function getSQLVerb(service, resource, action, operationId, httpPath, httpVerb, operationObj, schemasObj, debug) {

    // default sql verb to 'exec'
    let sqlVerb = 'exec';

    const actionToVerb = {
        'add': 'insert',
        'create': 'insert',
        'insert': 'insert',
        // 'batchCreate': 'insert',
        // 'bulkInsert': 'insert',
        'get': 'select',
        'list': 'select',
        'aggregated': 'select',
        // 'batchGet': 'select',
        'fetch': 'select',
        'read': 'select',
        'retrieve': 'select',
        'delete': 'delete',
        'remove': 'delete',
        // 'batchDelete': 'delete',
        'destroy': 'delete',
        'dropDatabase': 'delete',
    };

    const verbAction = Object.keys(actionToVerb).find(actionStart => action.startsWith(actionStart));
    if (verbAction) {
        sqlVerb = actionToVerb[verbAction];

        if (sqlVerb === 'select') {
            // const execExceptions = ['healthChecks', 'backendServices', 'globalOperations', 'securityPolicies', 'sslCertificates', 'targetHttpProxies', 'targetHttpsProxies', 'urlMaps'];
            // if (execExceptions.includes(resource) && action === 'aggregatedList') {
            //     verb = 'exec';
            // }
            if (resource === 'relyingparty' && action === 'getPublicKeys') {
                sqlVerb = 'exec';
            }
        } else if (sqlVerb === 'delete' && action === 'removeProject') {
            sqlVerb = 'exec';
        }
    }

    // safeguard
    if (sqlVerb === 'select' && httpVerb !== 'get') {
        sqlVerb === 'exec';
    }

    sqlVerb = sqlVerb === 'select' ? checkAdditionalProperties(operationObj, schemasObj) : sqlVerb;

    // override by exception by service
    sqlVerb = getSqlVerbOverride(service, sqlVerb, operationId);

    return sqlVerb;
}

  