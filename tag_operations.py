import yaml, re, shutil
from pathlib import Path


class NoAliasDumper(yaml.SafeDumper):
    def ignore_aliases(self, data):
        return True

def clean_tagged_output_dir():
    if Path('openapi3_tagged').exists():
        shutil.rmtree('openapi3_tagged')
    Path('openapi3_tagged').mkdir()
    with open('openapi3_tagged/.gitignore', 'w') as f:
        f.write('*\n')
        f.write('!.gitignore\n')

def write_tagged_openapi_doc(name, openapi_doc):
    (Path('openapi3_tagged') / name).mkdir()
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
    for path in openapi_doc['paths']:
        for verb in openapi_doc['paths'][path]:
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
                elif action.startswith('retrieve') and action != 'retrieve':
                    resource = clean_resource_name(service, resource, camel_to_snake(action[8:]))

                if service == 'compute':
                    if resource in ['backend_services', 'health_checks', 'global_operations', 'security_policies', 'ssl_certificates', 'target_http_proxies', 'target_https_proxies', 'url_maps'] and action == 'aggregatedList':
                        resource = resource + '_aggregated'
                    elif resource == 'instances' and action == 'bulkInsert': 
                        resource = resource + '_batch'

                if service == 'containeranalysis':
                    if resource in ['notes', 'occurrences'] and action == 'batchCreate':
                        resource = resource + '_batch'

                if service == 'dataflow':
                    if resource == 'jobs' and action == 'aggregated':
                        resource = resource + '_aggregated'

                if service == 'documentai':
                    if operation_id.split('.')[1] == 'uiv1beta3':
                        resource = resource + '_uiv1beta3'

                if service == 'videointelligence':
                    if operation_id.split('.')[1] == 'operations' and resource == 'operations':
                        resource =  'long_running_operations'

                if service == 'osconfig':
                    if resource == 'inventories' and action == 'list':
                        resource = 'instance_inventories'
                    elif resource == 'reports' and action == 'get':
                        resource = 'report'
                    elif resource == 'vulnerability_reports' and action == 'get':
                        resource = 'vulnerability_report'

                if service == 'privateca':
                    if action == 'fetch' and resource == 'certificate_authorities':
                        resource = 'certificate_signing_request'

                if service == 'jobs':
                    if resource == 'jobs' and action == 'batchCreate':
                        resource = resource + '_batch'

                if service == 'serviceconsumermanagement':
                    if resource == 'tenancy_units' and action == 'removeProject':
                        resource = resource + '_projects'

                if service == 'serviceusage':
                    if resource == 'services' and action == 'batchGet':
                        resource = resource + '_batch'

                if service == 'spanner':
                    if resource == 'sessions' and action == 'read':
                        resource = 'session_info'
                    elif resource == 'sessions' and action == 'batchCreate':
                        resource = resource + '_batch'

                openapi_doc['paths'][path][verb]['tags'].append(resource)
    write_tagged_openapi_doc(service, openapi_doc)

#
# build tag map and tag operations
#

clean_tagged_output_dir()
rootdir = 'openapi3'
for service in filter(Path.is_file, Path(rootdir).iterdir()):
    # if service == 'apigee':
    if (Path(rootdir) / service).is_dir():
        print('Processing %s...' % service)
        service_file = Path(rootdir) / service / f"{service}.yaml"
        with open(service_file, 'r') as f:
            openapi_doc = yaml.load(f, Loader=yaml.FullLoader)
            tag_operations(openapi_doc, service)