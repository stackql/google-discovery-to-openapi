const requiredParams = {
    '/admin/directory/v1/users': ['domain'],
    '/admin/directory/v1/customer/{customer}/domainaliases': ['parentDomainName'],
    '/admin/directory/v1/groups': ['domain'],
}

export function isParamRequired(path, param, verb) {
    if (param['location'] != 'query') {
        return false;
    }
    if (verb != 'get') {
        return false;
    }
    // its a query param for a get request, lets see if its required
    if(requiredParams[path]){
        if(requiredParams[path].includes(param['name'])){
            return true;
        } else {
            return false;
        }
    }
}