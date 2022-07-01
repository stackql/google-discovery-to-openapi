import os, yaml, re, shutil

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

def camel_to_snake(name):
    name = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', name).lower().replace('__', '_')

def clean_resource_name(service, resource, subresource):
    if service == resource:
        return subresource
    else:
        return resource + '_' + subresource

def tag_operations(openapi_doc, service):
    for path in openapi_doc['paths'].keys():
        for verb in openapi_doc['paths'][path].keys():
            if verb != 'parameters':
                operation_id = openapi_doc['paths'][path][verb]['operationId']
                resource = camel_to_snake(operation_id.split('.')[-2])
                action = operation_id.split('.')[-1]
                # print('%s,%s,%s,%s' % (operation_id, resource, action, verb))
                if service == 'clouddebugger':
                    res_tokens = []
                    for token in operation_id.split('.')[1:-1]:
                        res_tokens.append(token)
                    resource = '_'.join(res_tokens)
                elif action in ['getIamPolicy', 'setIamPolicy', 'testIamPermissions', 'analyzeIamPolicy', 'analyzeIamPolicyLongrunning', 'searchAllIamPolicies']:
                    resource = clean_resource_name(service, resource, 'iam_policies')
                elif action.startswith('get') and action != 'get':
                    resource = clean_resource_name(service, resource, camel_to_snake(action[3:]))
                elif action.startswith('list') and action != 'list':
                    resource = clean_resource_name(service, resource, camel_to_snake(action[4:]))
                elif action.startswith('delete') and action != 'delete':
                    resource = clean_resource_name(service, resource, camel_to_snake(action[6:]))
                elif action.startswith('batchGet') and action != 'batchGet':
                    resource = clean_resource_name(service, resource, camel_to_snake(action[8:]))
                elif action.startswith('remove') and action != 'remove':
                    resource = clean_resource_name(service, resource, camel_to_snake(action[6:]))
                elif action.startswith('create') and action != 'create':
                    resource = clean_resource_name(service, resource, camel_to_snake(action[6:]))
                elif action.startswith('add') and action != 'add':
                    resource = clean_resource_name(service, resource, camel_to_snake(action[3:]))
                elif action.startswith('fetch') and action != 'fetch':
                    resource = clean_resource_name(service, resource, camel_to_snake(action[5:]))

                if service == 'compute':
                    if resource in ['backend_services', 'health_checks', 'global_operations', 'security_policies', 'ssl_certificates', 'target_http_proxies', 'target_https_proxies', 'url_maps'] and action == 'aggregatedList':
                        resource = resource + '_aggregated'
                    elif resource == 'instances' and action == 'bulkInsert': 
                        resource = resource + '_bulk'

                if service == 'containeranalysis':
                    if resource in ['notes', 'occurrences'] and action == 'batchCreate':
                        resource = resource + '_batch'

                if service == 'dataflow':
                    if resource == 'jobs' and action == 'aggregated':
                        resource = resource + '_aggregated'

                if service == 'documentai':
                    if operation_id.split('.')[1] == 'uiv1beta3':
                        resource = resource + '_uiv1beta3'

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
        with open(service_file, 'r') as f:
            openapi_doc = yaml.load(f, Loader=yaml.FullLoader)
            tag_operations(openapi_doc, service)