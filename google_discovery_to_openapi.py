import requests, os
from functions import *

# main function to convert google service discovery doc to openapi spec
def process_service(name, discovery_doc):
    openapi_doc = {'openapi': '3.1.0', 'info': {}, 'externalDocs': {}, 'servers': [], 'components': {}, 'paths': {}}
    
    # create output dir
    print("Creating output dir...")
    os.mkdir('openapi3/%s' % name)
    
    # convert doc
    print("Converting discovery document for %s into an openapi3 spec..." % name)

    # get info
    openapi_doc['info'] = populate_service_info(discovery_doc)
    
    # get external docs
    openapi_doc['externalDocs']['url'] = discovery_doc['documentationLink']

    # get servers
    openapi_doc['servers'].append({'url': discovery_doc['rootUrl']})

    # get securitySchemes
    if 'auth' in discovery_doc.keys():
        openapi_doc['components']['securitySchemes'] = discovery_doc['auth']

    # get schemas
    openapi_doc['components']['schemas'] = replace_schema_refs(discovery_doc['schemas'])

    # get parameters
    if 'parameters' in discovery_doc.keys():
        (params_obj, params_ref_list) = process_parameters(discovery_doc['parameters'])
        openapi_doc['components']['parameters'] = params_obj
    else:
        params_ref_list = []

    # get paths (most of the action happens here)
    print('Populating paths for %s...' % name)
    openapi_doc['paths'] = populate_paths({}, discovery_doc['resources'], params_ref_list)

    # write openapi doc to file
    print("Writing openapi3 spec for %s to file..." % name)
    write_openapi_doc(name, openapi_doc)


# options
get_preferred_only = True
# add list of serice names to include or exclude or leave as None to process everything
included_services = None
excluded_services = None

# must be Python 3.9 or above
print('Checking Python version...')
check_python_version()

# clean output directory (openapi3)
print('Cleaning output directory...')
clean_output_dir()

# get root discovery document
print('Getting root discovery document...')
root_url = 'https://discovery.googleapis.com/discovery/v1/apis'
response = requests.get(root_url)
items = response.json()['items']

# iterate over all APIs
for item in items:
    service_name = item['name']
    service_id = item['id']
    if get_preferred_only:
        if item['preferred'] == False:
            print('Skipping %s (not preffered)' % service_id)
            continue
    if included_services is not None:
        if service_name not in included_services:
            print('Skipping %s (not included)' % service_name)
            continue
    if excluded_services is not None:
        if service_name in excluded_services:
            print('Skipping %s (excluded)' % service_name)
            continue
    # get discovery document
    print('Getting discovery document for %s...' % service_name)
    discovery_rest_url = item['discoveryRestUrl']
    print('url: %s' % discovery_rest_url)
    response = requests.get(discovery_rest_url)
    service_discovery_doc = response.json()
    if 'error' in service_discovery_doc.keys():
        print('Error: %s' % service_discovery_doc['error']['message'])
    else:
        process_service(service_name, service_discovery_doc)
