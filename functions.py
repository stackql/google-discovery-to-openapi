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
        params_obj[key.replace('$.', '_.')] = input_params[key]
    return (params_obj, params_ref_list)

def write_openapi_doc(name, openapi_doc):
    with open('openapi3/%s/%s.yaml' % (name, name), 'w') as f:
        yaml.dump(openapi_doc, f, Dumper=NoAliasDumper, default_flow_style=False)

#
# path processing helper functions
#

def get_op_params(in_params, param_order):
    param_list = []
    for param in param_order:
        if param in in_params.keys():
            param_list.append(in_params[param] | {'name': param})
    for param in in_params.keys():
        if param not in param_order:
            param_list.append(in_params[param] | {'name': param})
    param_list_final = []
    for param in param_list:
        final_param = {}
        final_param['in'] = param['location']
        final_param['name'] = param['name']
        if 'required' in param.keys():
            final_param['required'] = param['required']
        if 'description' in param.keys():
            final_param['description'] = param['description']            
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

def get_scope(obj):
    if 'scopes' in obj.keys():
        if len(obj['scopes']) > 0:
            return obj['scopes'][0]
    return ''

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
        scope = get_scope(methods_obj[method])

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
        # paths_obj[path][verb]['tags'] = [get_resource_tag(operation_id)]
        paths_obj[path][verb]['tags'] = []
        paths_obj[path][verb]['security'] = [{'Oauth2': scope, 'Oauth2c': scope}]
        if 'response' in methods_obj[method].keys():
            paths_obj[path][verb]['responses'] = get_response(methods_obj[method]['response']['$ref'])
        if 'parameterOrder' in methods_obj[method].keys():
            parameter_order = methods_obj[method]['parameterOrder']
        else:
            parameter_order = []
        if 'parameters' in methods_obj[method].keys():
            paths_obj[path][verb]['parameters'] = get_op_params(methods_obj[method]['parameters'], parameter_order)
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