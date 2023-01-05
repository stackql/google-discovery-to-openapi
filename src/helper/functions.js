import { logger } from '../util/logging.js';

/*
*  helper functions 
*/

function camelToSnake(name) {
  name = name.replace(/([A-Z])/g, function(match) {
    return "_" + match;
  });
  return name.toLowerCase();
}

function cleanResourceName(service, resource, subresource) {
  if (service === resource) {
    return subresource;
  } else {
    return resource + '_' + subresource;
  }
}

function getOpParams(method, paramOrder, path) {
    const inParams = method['parameters'];
    const paramList = [];
    for (const param of paramOrder) {
      if (param in inParams) {
        paramList.push({ ...inParams[param], name: param });
      }
    }
    for (const param in inParams) {
      if (!paramOrder.includes(param)) {
        paramList.push({ ...inParams[param], name: param });
      }
    }
    const paramListFinal = [];
    // add path params
    for (const token of path.split('/')) {
      if (token.startsWith('{')) {
        const finalParam = {};
        finalParam['in'] = 'path';
        finalParam['name'] = token.replace('{', '').replace('}', '').split(':')[0];
        finalParam['required'] = true;
        finalParam['schema'] = { type: 'string' };
        paramListFinal.push(finalParam);
      }
    }
    // add non path
    for (const param of paramList) {
      if (param['location'] !== 'path') {
        const finalParam = {};
        finalParam['in'] = param['location'];
        finalParam['name'] = param['name'];
        if ('required' in param) {
          finalParam['required'] = param['required'];
        }
        finalParam['schema'] = { type: param['type'] };
        paramListFinal.push(finalParam);
      }
    }
    return paramListFinal;
}

function getResponse(respSchema) {
    return {
      '200': {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: {
              '$ref': `#/components/schemas/${respSchema}`,
            },
          },
        },
      },
    };
}
    
function getResourceTag(operationId) {
    const idTokens = operationId.split('.');
    return idTokens[idTokens.length - 2];
}

function getMethodScopes(obj) {
    const scopes = [];
    if ('scopes' in obj) {
      for (const scope of obj['scopes']) {
        scopes.push({
          Oauth2: [scope],
          Oauth2c: [scope],
        });
      }
    }
    return scopes;
}

function getValidPath(path) {
    if (path.startsWith('/')) {
      return path;
    } else {
      return `/${path}`;
    }
}
  
function processMethods(pathsObj, methodsObj, paramsRefList, debug) {
    for (const method in methodsObj) {
      debug ? logger.debug(`Processing method: ${method}...`) : null;
      let path;
      if ('flatPath' in methodsObj[method]) {
        path = getValidPath(methodsObj[method]['flatPath']);
      } else if ('path' in methodsObj[method]) {
        path = getValidPath(methodsObj[method]['path']);
      } else {
        throw new Error(`Method ${method} has no path`);
      }
      const verb = methodsObj[method]['httpMethod'].toLowerCase();
      let description;
      if ('description' in methodsObj[method]) {
        description = methodsObj[method]['description'];
      } else {
        description = '';
      }
      const operationId = methodsObj[method]['id'];
  
      // update path
      const version = path.split('/')[1];
      if (path.split('/').length > 2) {
        if (path.split('/')[2] === `{${version}Id}`) {
          path = getValidPath(methodsObj[method]['path'].split(':')[0]).replace('+', '');
        }
      }
  
      // TODO FIX serviceusage
      
      if (!(path in pathsObj)) {
        debug ? logger.debug(`Adding ${path} path and global params...`) : null;
        pathsObj[path] = { parameters: paramsRefList };
      }
      
      debug ? logger.debug(`Adding ${verb} verb...`) : null;
      pathsObj[path][verb] = { description: description, operationId: operationId };
      if ('request' in methodsObj[method]) {
        const reqRef = methodsObj[method]['request']['$ref'];
        pathsObj[path][verb]['requestBody'] = {
          content: {
            'application/json': {
              schema: {
                '$ref': `#/components/schemas/${reqRef}`,
              },
            },
          },
        };
      }
      pathsObj[path][verb]['tags'] = [];
      pathsObj[path][verb]['security'] = getMethodScopes(methodsObj[method]);
      if ('response' in methodsObj[method]) {
        pathsObj[path][verb]['responses'] = getResponse(methodsObj[method]['response']['$ref']);
      }
      const parameterOrder = 'parameterOrder' in methodsObj[method] ? methodsObj[method]['parameterOrder'] : [];
      if ('parameters' in methodsObj[method]) {
        pathsObj[path][verb]['parameters'] = getOpParams(methodsObj[method], parameterOrder, path);
      }
    }
    return pathsObj;
}
      
/*
*  exported functions 
*/

export function tagOperations(openapiDoc, service) {
  for (const path of Object.keys(openapiDoc.paths)) {
    for (const verb of Object.keys(openapiDoc.paths[path])) {
      if (verb !== 'parameters') {
        const operationId = openapiDoc.paths[path][verb].operationId;
        let resource = camelToSnake(operationId.split('.')[operationId.split('.').length - 2]);
        const action = operationId.split('.')[operationId.split('.').length - 1];

        if (service === 'clouddebugger') {
          const resTokens = [];
          for (const token of operationId.split('.').slice(1, -1)) {
            resTokens.push(token);
          }
          resource = resTokens.join('_');
        } else if (['getIamPolicy', 'setIamPolicy', 'testIamPermissions', 'analyzeIamPolicy', 'analyzeIamPolicyLongrunning', 'searchAllIamPolicies'].includes(action)) {
          resource = cleanResourceName(service, resource, 'iam_policies');
        } else if (action.startsWith('get') && action !== 'get') {
          resource = cleanResourceName(service, resource, camelToSnake(action.slice(3)));
        } else if (action.startsWith('list') && action !== 'list') {
          resource = cleanResourceName(service, resource, camelToSnake(action.slice(4)));
        } else if (action.startsWith('delete') && action !== 'delete') {
          resource = cleanResourceName(service, resource, camelToSnake(action.slice(6)));
        } else if (action.startsWith('batchGet') && action !== 'batchGet') {
          resource = cleanResourceName(service, resource, camelToSnake(action.slice(8)));
        } else if (action.startsWith('remove') && action !== 'remove') {
          resource = cleanResourceName(service, resource, camelToSnake(action.slice(6)));
        } else if (action.startsWith('create') && action !== 'create') {
          resource = cleanResourceName(service, resource, camelToSnake(action.slice(6)));
        } else if (action.startsWith('add') && action !== 'add') {
          resource = cleanResourceName(service, resource, camelToSnake(action.slice(3)));
        } else if (action.startsWith('fetch') && action !== 'fetch') {
          resource = cleanResourceName(service, resource, camelToSnake(action.slice(5)));
        } else if (action.startsWith('retrieve') && action !== 'retrieve') {
          resource = cleanResourceName(service, resource, camelToSnake(action.slice(8)));
        }

        if (service === 'compute') {
          if (['backend_services', 'health_checks', 'global_operations', 'security_policies', 'ssl_certificates', 'target_http_proxies', 'target_https_proxies', 'url_maps'].includes(resource) && action === 'aggregatedList') {
            resource = resource + '_aggregated';
          } else if (resource === 'instances' && action === 'bulkInsert') {
            resource = resource + '_batch';
          }
        }
        
        if (service === 'containeranalysis') {
          if (['notes', 'occurrences'].includes(resource) && action === 'batchCreate') {
            resource = resource + '_batch';
          }
        }
        
        if (service === 'dataflow') {
          if (resource === 'jobs' && action === 'aggregated') {
            resource = resource + '_aggregated';
          }
        }
        
        if (service === 'documentai') {
          if (operationId.split('.')[1] === 'uiv1beta3') {
            resource = resource + '_uiv1beta3';
          }
        }
        
        if (service === 'videointelligence') {
          if (operationId.split('.')[1] === 'operations' && resource === 'operations') {
            resource = 'long_running_operations';
          }
        }
        
        if (service === 'osconfig') {
          if (resource === 'inventories' && action === 'list') {
            resource = 'instance_inventories';
          } else if (resource === 'reports' && action === 'get') {
            resource = 'report';
          } else if (resource === 'vulnerability_reports' && action === 'get') {
            resource = 'vulnerability_report';
          }
        }
        
        if (service === 'privateca') {
          if (action === 'fetch' && resource === 'certificate_authorities') {
            resource = 'certificate_signing_request';
          }
        }
        
        if (service === 'jobs') {
          if (resource === 'jobs' && action === 'batchCreate') {
            resource = resource + '_batch';
          }
        }
        
        if (service === 'serviceconsumermanagement') {
          if (resource === 'tenancy_units' && action === 'removeProject') {
            resource = resource + '_projects';
          }
        }
        
        if (service === 'serviceusage') {
          if (resource === 'services' && action === 'batchGet') {
            resource = resource + '_batch';
          }
        }
        
        if (service === 'spanner') {
          if (resource === 'sessions' && action === 'read') {
            resource = 'session_info';
          } else if (resource === 'sessions' && action === 'batchCreate') {
            resource = resource + '_batch';
          }
        }
        
        openapiDoc.paths[path][verb].tags.push(resource);
      }
    }
  }
  return openapiDoc;
}

export function populatePaths(pathsObj, obj, paramsRefList, debug) {
    for (const key in obj) {
      if (obj[key] instanceof Object) {
        if (key === 'methods') {
          pathsObj = processMethods(pathsObj, obj[key], paramsRefList, debug);
        }
        populatePaths(pathsObj, obj[key], paramsRefList, debug);
      } else if (Array.isArray(obj[key])) {
        for (const item of obj[key]) {
          if (item instanceof Object) {
            populatePaths(pathsObj, item, paramsRefList, debug);
          }
        }
      } else if (typeof obj[key] === 'string') {
        // do nothing
      }
    }
    return pathsObj;
  }
  
export function getCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function populateSecuritySchemes(authObj) {
    const securitySchemes = {};
    const scopesSource = authObj['oauth2']['scopes'];
    const scopesTarget = {};
    const authorizationUrl = 'https://accounts.google.com/o/oauth2/auth';
    const tokenUrl = 'https://accounts.google.com/o/oauth2/token';
  
    // reformat scopes
    for (const scope in scopesSource) {
      scopesTarget[scope] = scopesSource[scope]['description'];
    }
  
    // create implicit flow security scheme
    securitySchemes['Oauth2'] = {};
    securitySchemes['Oauth2']['type'] = 'oauth2';
    securitySchemes['Oauth2']['description'] = 'Oauth 2.0 implicit authentication';
    securitySchemes['Oauth2']['flows'] = {};
    securitySchemes['Oauth2']['flows']['implicit'] = {};
    securitySchemes['Oauth2']['flows']['implicit']['authorizationUrl'] = authorizationUrl;
    securitySchemes['Oauth2']['flows']['implicit']['scopes'] = scopesTarget;
  
    // create authorization code flow security scheme
    securitySchemes['Oauth2c'] = {};
    securitySchemes['Oauth2c']['type'] = 'oauth2';
    securitySchemes['Oauth2c']['description'] = 'Oauth 2.0 authorization code authentication';
    securitySchemes['Oauth2c']['flows'] = {};
    securitySchemes['Oauth2c']['flows']['authorizationCode'] = {};
    securitySchemes['Oauth2c']['flows']['authorizationCode']['authorizationUrl'] = authorizationUrl;
    securitySchemes['Oauth2c']['flows']['authorizationCode']['tokenUrl'] = tokenUrl;
    securitySchemes['Oauth2c']['flows']['authorizationCode']['scopes'] = scopesTarget;
  
    return securitySchemes;
  }

  export function replaceSchemaRefs(obj) {
    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        replaceSchemaRefs(obj[key]);
      } else if (Array.isArray(obj[key])) {
        for (const item of obj[key]) {
          if (typeof item === 'object') {
            replaceSchemaRefs(item);
          }
        }
      } else if (typeof obj[key] === 'string') {
        if (key === '$ref') {
          obj[key] = `#/components/schemas/${obj[key]}`;
        }
      }
    }
    return obj;
  }

  export function processParameters(inputParams) {
    const paramsObj = {};
    const paramsRefList = [];
    for (const key in inputParams) {
      paramsRefList.push({ '$ref': `#/components/parameters/${key.replace('$.', '_.')}` });
  
      let schemaObj;
      if ('enum' in inputParams[key]) {
        schemaObj = {
          type: inputParams[key]['type'],
          enum: inputParams[key]['enum'],
        };
      } else {
        schemaObj = {
          type: inputParams[key]['type'],
        };
      }
  
      paramsObj[key.replace('$.', '_.')] = {
        description: inputParams[key]['description'],
        in: inputParams[key]['location'],
        name: key.replace('$.', '_.'),
        schema: schemaObj,
      };
    }
    return [paramsObj, paramsRefList];
  }