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

def tag_operations(openapi_doc):
    for path in openapi_doc['paths'].keys():
        for verb in openapi_doc['paths'][path].keys():
            if verb != 'parameters':
                operation_id = openapi_doc['paths'][path][verb]['operationId']
                resource = camel_to_snake(operation_id.split('.')[-2])
                action = operation_id.split('.')[-1]
                if action in ['getIamPolicy', 'setIamPolicy', 'testIamPermissions']:
                    resource = resource + '_iam'
                if action == 'getServiceAccount':
                    resource = resource + '_service_account'
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
            tag_operations(openapi_doc)