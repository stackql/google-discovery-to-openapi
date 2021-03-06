from pathlib import Path
from functions import *

import httpx
import trio


# main function to convert google service discovery doc to openapi spec
def process_service(name, discovery_doc):
    openapi_doc = {'openapi': '3.1.0', 'info': {}, 'externalDocs': {}, 'servers': [], 'components': {}, 'paths': {}}
    
    # create output dir
    print("Creating output dir...")
    (Path('openapi3') / name).mkdir()
    
    # convert doc
    print("Converting discovery document for %s into an openapi3 spec..." % name)

    # get info
    openapi_doc['info'] = populate_service_info(discovery_doc)
    
    # get external docs
    openapi_doc['externalDocs']['url'] = discovery_doc['documentationLink']

    # get servers
    server_url = discovery_doc['rootUrl'] + discovery_doc['servicePath']
    if server_url[-1] == '/':
        server_url = server_url[:-1]

    openapi_doc['servers'].append({'url': server_url})

    # get securitySchemes
    if 'auth' in discovery_doc:
        openapi_doc['components']['securitySchemes'] = populate_security_schemes(discovery_doc['auth'])

    # get schemas
    openapi_doc['components']['schemas'] = replace_schema_refs(discovery_doc['schemas'])

    # get parameters
    if 'parameters' in discovery_doc:
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
is_google_cloud = True
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

as_client = httpx.AsyncClient()
limiter = trio.CapacityLimiter(30)

async def get_api(item):
    async with limiter:
        service_name = item['name']
        if 'documentationLink' in item:
            doc_link = item['documentationLink']
        else:
            doc_link = ''
        service_id = item['id']
        if is_google_cloud:
            if not (service_name in ('compute', 'storage') or doc_link.startswith('https://cloud.google.com/') or doc_link.startswith('https://firebase.google.com/')):
                print('Skipping %s (not a cloud platform API)' % service_id)
                return
        if get_preferred_only:
            if item['preferred'] == False:
                print('Skipping %s (not preffered)' % service_id)
                return
        if included_services is not None:
            if service_name not in included_services:
                print('Skipping %s (not included)' % service_name)
                return
        if excluded_services is not None:
            if service_name in excluded_services:
                print('Skipping %s (excluded)' % service_name)
                return
        # get discovery document
        print('Getting discovery document for %s...' % service_name)
        discovery_rest_url = item['discoveryRestUrl']
        print('url: %s' % discovery_rest_url)
        response = await as_client.get(discovery_rest_url)
        service_discovery_doc = response.json()
        if 'error' in service_discovery_doc:
            print('Error: %s' % service_discovery_doc['error']['message'])
        else:
            process_service(service_name, service_discovery_doc)

async def main():
    # get root discovery document
    print('Getting root discovery document...')
    root_url = 'https://discovery.googleapis.com/discovery/v1/apis'
    response = await as_client.get(root_url)
    items = response.json()['items']

    # iterate over all APIs
    async with trio.open_nursery() as nursery:
        for item in items:
            nursery.start_soon(get_api, item)

    print("\nFinished !")

trio.run(main)