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
  
export function getResource(service, operationId){
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
    return [resource, action];
}

export function getSQLVerb(service, resource, action, operationId, httpVerb){
    let verb = 'exec';
    // action to sql verb mapping
    if (
        action.startsWith('add') && 
        action !== 'addons'
        ){
        verb = 'insert';
    } else if (
        action.startsWith('create') ||
        action.startsWith('insert') ||
        action === 'batchCreate' ||
        action === 'bulkInsert'
    ){
        verb = 'insert';
    } else if (
        action.startsWith('get') ||
        action.startsWith('list') ||
        action.startsWith('aggregated') ||
        action.startsWith('batchGet') ||
        action.startsWith('fetch') ||
        // action.startsWith('query') ||
        action.startsWith('read') ||
        action.startsWith('retrieve')
        // || action.startsWith('search')
    ){
        verb = 'select';
        // aggregated scoped list 
        if((resource == 'healthChecks' || 
            resource == 'backendServices' || 
            resource == 'globalOperations' || 
            resource == 'securityPolicies' ||
            resource == 'sslCertificates' ||
            resource == 'targetHttpProxies' ||
            resource == 'targetHttpsProxies' ||
            resource == 'urlMaps'
        ) && action == 'aggregatedList'){
            verb = 'exec';
        }
        // exceptions
        if(resource == 'relyingparty' && action == 'getPublicKeys'){
            verb = 'exec';
        }
    } else if (
        action.startsWith('delete') ||
        action.startsWith('remove') ||
        action === 'batchDelete' ||
        action === 'destroy' ||
        action === 'dropDatabase'
    ){
        if(action != 'removeProject'){
            verb = 'delete';    
        }
    }

    // select exceptions
    switch(service){
        case 'osconfig':
            if(resource == 'inventories'){
                verb = 'exec';
            }
            break;
        case 'cloudsearch':
            if([
                'cloudsearch.stats.index.datasources.get',
                'cloudsearch.stats.user.searchapplications.get', 
                'cloudsearch.stats.session.searchapplications.get', 
                'cloudsearch.stats.query.searchapplications.get'
            ].includes(operationId)){
                verb = 'exec';
            } 
            break;
        case 'compute':
            if([
                'compute.targetTcpProxies.aggregatedList',
                'compute.sslPolicies.aggregatedList',
                'compute.backendServices.aggregatedList',
                'compute.globalOperations.aggregatedList',
                'compute.targetHttpProxies.aggregatedList',
                'compute.targetHttpsProxies.aggregatedList',
                'compute.sslCertificates.aggregatedList',
                'compute.healthChecks.aggregatedList',
                'compute.urlMaps.aggregatedList',
                'compute.securityPolicies.aggregatedList',
            ].includes(operationId)){
                verb = 'exec';
            }
            break;
        case 'dataform':
            if([
                'dataform.projects.locations.repositories.workspaces.readFile',
            ].includes(operationId)){
                verb = 'exec';
            }
            break;
        case 'identitytoolkit':
            if([
                'identitytoolkit.relyingparty.getPublicKeys',
            ].includes(operationId)){
                verb = 'exec';
            }
            break;
        case 'doubleclicksearch':
            if([
                'doubleclicksearch.reports.getFile',
                'doubleclicksearch.reports.getIdMappingFile',
            ].includes(operationId)){
                verb = 'exec';
            }
            break;
        case 'tagmanager':
            if([
                'tagmanager.accounts.containers.workspaces.built_in_variables.create',
            ].includes(operationId)){
                verb = 'exec';
            }
            break;
        case 'androidenterprise':
            if([
                'androidenterprise.enterprises.createEnrollmentToken',
            ].includes(operationId)){
                verb = 'exec';
            }
            break;
        case 'androidmanagement':
            if([
                'androidmanagement.signupUrls.create',
            ].includes(operationId)){
                verb = 'exec';
            }
            break;
        case 'displayvideo':
            if([
                'displayvideo.advertisers.lineItems.bulkListAssignedTargetingOptions',
            ].includes(operationId)){
                verb = 'exec';
            }
            break;
        case 'prod_tt_sasportal':
            if([
                'prod_tt_sasportal.customers.nodes.get',
                'prod_tt_sasportal.nodes.nodes.get',
                'prod_tt_sasportal.nodes.get',
            ].includes(operationId)){
                verb = 'exec';
            } else if ([
                'prod_tt_sasportal.policies.get',
            ].includes(operationId)){
                verb = 'select';
            }
            break;
        case 'sasportal':
            if([
                'sasportal.customers.nodes.get',
                'sasportal.nodes.nodes.get',
                'sasportal.nodes.get',
            ].includes(operationId)){
                verb = 'exec';
            } else if ([
                'sasportal.policies.get',
            ].includes(operationId)){
                verb = 'select';
            }
            break;
    }
    return verb;
}

  