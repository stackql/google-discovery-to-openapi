# Google Discovery to OpenAPI 3.x Converter

Generates OpenAPI 3.x specification from Google Discovery documents.

## Overview

This script performs the following steps:
1. Gets the [root discovery document for all Google APIs](https://discovery.googleapis.com/discovery/v1/apis)
2. Gets each respective service discovery document from the root discovery document (can be filtered to only fetch `preferred` service versions)
3. Converts each service discovery document to an OpenAPI 3.x specification, written as a `yaml` file to the `openapi` folder

The resultant OpenAPI service specifications can the be used with [@stackql/openapi-doc-util](https://www.npmjs.com/package/@stackql/openapi-doc-util) to generate [StackQL Google provider definitions](https://registry.stackql.io/providers/google/).

## Usage

> __NOTE:__ Requires Node.js 14.x or higher

Mac/Linux:

```bash
bin/google-discovery-to-openapi.mjs generate
```

Windows/PowerShell:
    
```powershell
node .\bin\google-discovery-to-openapi.mjs generate
```