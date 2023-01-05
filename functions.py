import sys, shutil, os, yaml

class NoAliasDumper(yaml.SafeDumper):
    def ignore_aliases(self, data):
        return True

def check_python_version():
    if sys.version_info < (3, 9):
        raise Exception('Python version must be 3.9 or above')
    else:
        print('Python version: %s.%s.%s' % (sys.version_info.major, sys.version_info.minor, sys.version_info.micro))

def clean_output_dir():
    if os.path.exists('openapi3'):
        shutil.rmtree('openapi3')
    os.mkdir('openapi3')
    with open('openapi3/.gitignore', 'w') as f:
        f.write('*\n')
        f.write('!.gitignore\n')

def populate_service_info(discovery_doc):
    return {
        'title': discovery_doc['title'],
        'version': discovery_doc['version'],
        'description': discovery_doc['description']
    }

def replace_schema_refs(obj):
    for key in obj:
        if isinstance(obj[key], dict):
            replace_schema_refs(obj[key])
        elif isinstance(obj[key], list):
            for item in obj[key]:
                if isinstance(item, dict):
                    replace_schema_refs(item)
        elif isinstance(obj[key], str):
            if key == '$ref':
                obj[key] = "#/components/schemas/%s" % obj[key]
    return obj

def process_parameters(input_params):
    params_obj = {}
    params_ref_list = []
    for key in input_params.keys():
        params_ref_list.append({ '$ref': '#/components/parameters/%s' % key.replace('$.', '_.') })
        
        if 'enum' in input_params[key].keys():
            schema_obj = { 
                'type': input_params[key]['type'],
                'enum': input_params[key]['enum'] 
            }
        else:
            schema_obj = { 
                'type': input_params[key]['type'] 
            }
        
        params_obj[key.replace('$.', '_.')] = {
            'description': input_params[key]['description'],
            'in': input_params[key]['location'],
            'name': key.replace('$.', '_.'),
            'schema': schema_obj
        }
    return (params_obj, params_ref_list)


def write_openapi_doc(name, openapi_doc):
    with open('openapi3/%s/%s.yaml' % (name, name), 'w') as f:
        yaml.dump(openapi_doc, f, Dumper=NoAliasDumper, default_flow_style=False)

#
# path processing helper functions
#

def get_op_params(method, param_order, path):
    in_params = method['parameters']
    param_list = []
    for param in param_order:
        if param in in_params.keys():
            param_list.append(in_params[param] | {'name': param})
    for param in in_params.keys():
        if param not in param_order:
            param_list.append(in_params[param] | {'name': param})
    param_list_final = []
    # add path params
    for token in path.split('/'):
        if token.startswith('{'):
            final_param = {}
            final_param['in'] = 'path'
            final_param['name'] = token.replace('{', '').replace('}', '').split(':')[0]
            final_param['required'] = True
            final_param['schema'] = { 'type': 'string' }
            param_list_final.append(final_param)
    # add non path
    for param in param_list:
        if param['location'] != 'path':
            final_param = {}
            final_param['in'] = param['location']
            final_param['name'] = param['name']
            if 'required' in param.keys():
                final_param['required'] = param['required']
            # if 'description' in param.keys():
            #     final_param['description'] = param['description']
            final_param['schema'] = { 'type': param['type'] }
            param_list_final.append(final_param)
    return param_list_final

def get_response(resp_schema):
    return {
        '200': {
            'description': 'Successful response',
            'content': {
                'application/json': {
                    'schema': {
                        '$ref': '#/components/schemas/%s' % resp_schema
                    }
                }
            }
        }
    }

def get_resource_tag(operation_id):
    id_tokens = operation_id.split('.')
    # res_tokens = []
    # for i in range(len(id_tokens)):
    #     if i == 0:
    #         continue
    #     elif i == (len(id_tokens)-1):
    #         continue
    #     else:
    #         res_tokens.append(id_tokens[i])
    # return str('_'.join(res_tokens))
    return id_tokens[-2]

def get_method_scopes(obj):
    scopes = []
    if 'scopes' in obj.keys():
        for scope in obj['scopes']:
            scope_map = {}
            scope_map['Oauth2'] = [scope]
            scope_map['Oauth2c'] = [scope]
            scopes.append(scope_map)
    return scopes

def get_valid_path(path):
    if path.startswith('/'):
        return path
    else:
        return '/' + path

def process_methods(paths_obj, methods_obj, params_ref_list):
    for method in methods_obj:
        print('Processing method: %s...' % method)
        if 'flatPath' in methods_obj[method].keys():
            path = get_valid_path(methods_obj[method]['flatPath'])
        elif 'path' in methods_obj[method].keys():
            path = get_valid_path(methods_obj[method]['path'])
        else:
            raise Exception('Method %s has no path' % method)
        verb = methods_obj[method]['httpMethod'].lower()
        if 'description' in methods_obj[method].keys():
            description = methods_obj[method]['description']
        else:
            description = ''
        operation_id = methods_obj[method]['id']

        # update path
        version = path.split('/')[1]
        if len(path.split('/')) > 2:
            if path.split('/')[2] == '{%sId}' % version:
                path = get_valid_path(methods_obj[method]['path'].split(':')[0]).replace('+', '')

        ## TODO FIX serviceusage

        if path not in paths_obj:
            print('Adding %s path and global params...' % path)
            paths_obj[path] = {'parameters': params_ref_list}

        print('Adding %s verb...' % verb)
        paths_obj[path][verb] = {'description': description, 'operationId': operation_id}
        if 'request' in methods_obj[method].keys():
            req_ref = methods_obj[method]['request']['$ref']
            paths_obj[path][verb]['requestBody'] = {
                'content': {
                    'application/json': {
                        'schema': {
                            '$ref': '#/components/schemas/%s' % req_ref
                        }
                    }
                }
            }
        paths_obj[path][verb]['tags'] = []
        paths_obj[path][verb]['security'] = get_method_scopes(methods_obj[method])
        if 'response' in methods_obj[method].keys():
            paths_obj[path][verb]['responses'] = get_response(methods_obj[method]['response']['$ref'])
        if 'parameterOrder' in methods_obj[method].keys():
            parameter_order = methods_obj[method]['parameterOrder']
        else:
            parameter_order = []
        if 'parameters' in methods_obj[method].keys():
            paths_obj[path][verb]['parameters'] = get_op_params(methods_obj[method], parameter_order, path)
    return paths_obj

def populate_paths(paths_obj, obj, params_ref_list):
    for key in obj:
        if isinstance(obj[key], dict):
            if key == 'methods':
                paths_obj = process_methods(paths_obj, obj[key], params_ref_list)
            populate_paths(paths_obj, obj[key], params_ref_list)
        elif isinstance(obj[key], list):
            for item in obj[key]:
                if isinstance(item, dict):
                    populate_paths(paths_obj, item, params_ref_list)
        elif isinstance(obj[key], str):
            pass
    return paths_obj

def populate_security_schemes(auth_obj):
    security_schemes = {}
    scopes_source = auth_obj['oauth2']['scopes']
    scopes_target = {}
    authorization_url = 'https://accounts.google.com/o/oauth2/auth'
    token_url = 'https://accounts.google.com/o/oauth2/token'
    # reformat scopes
    for scope in scopes_source:
        scopes_target[scope] = scopes_source[scope]['description']
    # create implicit flow security scheme
    security_schemes['Oauth2'] = {}
    security_schemes['Oauth2']['type'] = 'oauth2'
    security_schemes['Oauth2']['description'] = 'Oauth 2.0 implicit authentication'
    security_schemes['Oauth2']['flows'] = {}
    security_schemes['Oauth2']['flows']['implicit'] = {}
    security_schemes['Oauth2']['flows']['implicit']['authorizationUrl'] = authorization_url
    security_schemes['Oauth2']['flows']['implicit']['scopes'] = scopes_target
    # create authorization code flow security scheme
    security_schemes['Oauth2c'] = {}
    security_schemes['Oauth2c']['type'] = 'oauth2'
    security_schemes['Oauth2c']['description'] = 'Oauth 2.0 authorization code authentication'
    security_schemes['Oauth2c']['flows'] = {}
    security_schemes['Oauth2c']['flows']['authorizationCode'] = {}
    security_schemes['Oauth2c']['flows']['authorizationCode']['authorizationUrl'] = authorization_url
    security_schemes['Oauth2c']['flows']['authorizationCode']['tokenUrl'] = token_url
    security_schemes['Oauth2c']['flows']['authorizationCode']['scopes'] = scopes_target

    return security_schemes
