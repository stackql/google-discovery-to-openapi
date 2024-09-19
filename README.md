# Google Discovery to OpenAPI 3.x Converter

Generates OpenAPI 3.x specification from Google Discovery documents.

> OpenAPI 3 Specifications for Google Cloud APIs can be found at [__stackql/stackql-provider-registry__](https://github.com/stackql/stackql-provider-registry/tree/dev/providers/src/googleapis.com/v00.00.00000/services)

## Overview

This script performs the following steps:
1. Gets the [root discovery document for all Google APIs](https://discovery.googleapis.com/discovery/v1/apis)
2. Gets each respective service discovery document from the root discovery document (can be filtered to only fetch `preferred` service versions)
3. Converts each service discovery document to an OpenAPI 3.x specification, written as a `yaml` file to the `openapi` folder

The resultant OpenAPI service specifications can the be used with [`stackql/openapisaurus`](https://github.com/stackql/openapisaurus) to generate [StackQL Google provider definitions](https://registry.stackql.io/providers/google/).

## Usage

> __NOTE:__ Requires Node.js 14.x or higher

Mac/Linux:

```bash
npm install
bin/google-discovery-to-openapi.mjs generate googleapis.com --debug
```

Windows/PowerShell:
    
```powershell
npm install
node .\bin\google-discovery-to-openapi.mjs generate
```

## Tests

To Run tests locally, clone [stackql-provider-tests](https://github.com/stackql/stackql-provider-tests), and run locally:

```bash
# run from the directory you cloned into
cd ../../stackql-provider-tests/
sh test-provider.sh \
google \
false \
/mnt/c/LocalGitRepos/stackql/openapi-conversion/google-discovery-to-openapi/openapi \
true
```

## Inspect

```bash
PROVIDER_REGISTRY_ROOT_DIR="$(pwd)/openapi"
REG_STR='{"url": "file://'${PROVIDER_REGISTRY_ROOT_DIR}'", "localDocRoot": "'${PROVIDER_REGISTRY_ROOT_DIR}'", "verifyConfig": {"nopVerify": true}}'
./stackql shell --registry="${REG_STR}"
```

## Publish to the StackQL Provider Registry

Raise a PR to add the provider from `openapi/src` to the [stackql-provider-registry](https://github.com/stackql/stackql-provider-registry/tree/dev/providers/src).  Once merged into the `dev` branch it will be tested and deployed to the `dev` registry, which can be accessed via:

```bash
# google cloud shell example...
curl -L https://bit.ly/stackql-zip -O && unzip stackql-zip
# use the following to test from the dev provider registry with interactiva authentication
DEV_REG="{ \"url\": \"https://registry-dev.stackql.app/providers\" }"
AUTH='{ "google": { "type": "interactive" }}'
./stackql --auth="${AUTH}" --registry="${DEV_REG}" shell
```
