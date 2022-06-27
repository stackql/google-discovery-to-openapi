import os, yaml, re, shutil, json

class NoAliasDumper(yaml.SafeDumper):
    def ignore_aliases(self, data):
        return True

def clean_tagged_output_dir():
    if os.path.exists('openapi3_tagged'):
        shutil.rmtree('openapi3_tagged')
    os.mkdir('openapi3_tagged')
    with open('openapi3_tagged/.gitignore', 'w') as f:
        f.write('*\n')
        f.write('!.gitignore\n')

def write_tagged_openapi_doc(name, openapi_doc):
    os.mkdir('openapi3_tagged/%s' % name)
    with open('openapi3_tagged/%s/%s.yaml' % (name, name), 'w') as f:
        yaml.dump(openapi_doc, f, Dumper=NoAliasDumper, default_flow_style=False)

def get_meaningful_op_id(operationId):
    op_id_tokens = operationId.split('.')
    last_token = op_id_tokens[-1]
    meaningful_tokens = op_id_tokens[1:-1]
    if any(ele.isupper() for ele in last_token):
        non_verb_ix = [i for i, c in enumerate(last_token) if c.isupper()][0]
        # verb = last_token[:non_verb_ix]
        non_verb = last_token[non_verb_ix:]
        meaningful_tokens.append(non_verb)
    return '.'.join(meaningful_tokens)

def camel_to_snake(name):
    name = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', name).lower().replace('__', '_')

def get_resource_name(schema_name, service, meaningful_op_id):
    # apigee
    if service == 'apigee':
        if schema_name.startswith('GoogleCloudApigeeV1'):
            schema_name = schema_name[len('GoogleCloudApigeeV1'):]
        elif schema_name.startswith('GoogleIamV1'):
            schema_name = schema_name[len('GoogleIamV1'):]
        elif schema_name == 'GoogleApiHttpBody':
            schema_name = meaningful_op_id.replace('.', '_')
    # add pluralization here
    if meaningful_op_id.endswith('ies') and schema_name.endswith('y'):
        schema_name = schema_name[:-1] + 'ies'
    elif meaningful_op_id.endswith('s') and not schema_name.endswith('s') and not meaningful_op_id.endswith('keys'):
        if schema_name.endswith('y'):
            schema_name = schema_name[:-1] + 'ies'
        else:
            schema_name = schema_name + 's'
    # get and return resource name
    if schema_name.lower() == service.lower():
        return camel_to_snake(schema_name)
    elif schema_name.lower().startswith(service.lower()):
        return camel_to_snake(schema_name[len(service):])
    else:
        return camel_to_snake(schema_name)

def build_tag_map(openapi_doc, service):
    tag_map = {}
    path_map = {}
    for path in openapi_doc['paths'].keys():
        for verb in openapi_doc['paths'][path].keys():
            if verb != 'parameters':
                if verb == 'get':
                    op_id = openapi_doc['paths'][path][verb]['operationId']
                    if op_id.split('.')[-1] != 'list':
                        schema_name = openapi_doc['paths'][path][verb]['responses']['200']['content']['application/json']['schema']['$ref'].split('/')[-1]
                        # print(schema_name)
                        meaningful_op_id = get_meaningful_op_id(op_id)
                        res_name = get_resource_name(schema_name, service, meaningful_op_id)
                        tag_map[meaningful_op_id] = res_name
                        path_map[path.split(':')[0]] = res_name
    return (tag_map, path_map)

def tag_operations(openapi_doc, tag_map, path_map, service):
    for path in openapi_doc['paths'].keys():
        for verb in openapi_doc['paths'][path].keys():
            if verb != 'parameters':
                meaningful_op_id = get_meaningful_op_id(openapi_doc['paths'][path][verb]['operationId'])
                if meaningful_op_id in tag_map.keys():
                    resource = tag_map[meaningful_op_id]
                else:
                    # try path_map
                    if path.split(':')[0] in path_map.keys():
                        resource = camel_to_snake(path_map[path.split(':')[0]])
                    elif camel_to_snake(meaningful_op_id.split('.')[-1]) == 'all':
                        resource = 'operations'
                    else:
                        resource = camel_to_snake(meaningful_op_id.split('.')[-1])
                openapi_doc['paths'][path][verb]['tags'].append(resource)
    write_tagged_openapi_doc(service, openapi_doc)

#
# build tag map and tag operations
#

clean_tagged_output_dir()
rootdir = 'openapi3'
for service in os.listdir(rootdir):
    d = os.path.join(rootdir, service)
    # if service == 'apigee':
    if os.path.isdir(d):
        print('Processing %s...' % service)
        service_file = os.path.join(rootdir, service, service + '.yaml')
        print(service_file)
        with open(service_file, 'r') as f:
            openapi_doc = yaml.load(f, Loader=yaml.FullLoader)
            tag_map, path_map = build_tag_map(openapi_doc, service)
            # print(json.dumps(tag_map, indent=1))
            # print(json.dumps(path_map, indent=1))
            tag_operations(openapi_doc, tag_map, path_map, service)