// node utils/resources-report.cjs openapi/src/googleapis.com/v00.00.00000/services

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Utility function to resolve $ref in the OpenAPI spec
function resolveRef(spec, ref) {
    if (typeof ref === 'string') {
        const refPath = ref.split('/').slice(1); // Remove the initial '#'
        let result = spec;
        for (const part of refPath) {
            if (!result[part]) {
                console.warn(`Warning: Reference not found in spec for path: ${ref}`);
                return null; // Return null to indicate the ref could not be resolved
            }
            result = result[part];
        }
        return result;
    } else if (typeof ref === 'object' && ref.$ref) {
        return resolveRef(spec, ref.$ref);
    } else {
        throw new Error(`Invalid ref format: ${JSON.stringify(ref)}`);
    }
}

// Main function to generate the resources report CSV
function generateResourcesReport(directory) {
    const files = fs.readdirSync(directory).filter(file => file.endsWith('.yaml'));
    const csvRows = [['serviceName', 'resourceName', 'sqlVerb', 'httpVerb', 'action', 'opid', 'methodName', 'path', 'objectKey']];

    files.forEach(file => {
        const filePath = path.join(directory, file);
        const yamlContent = fs.readFileSync(filePath, 'utf8');
        const spec = yaml.load(yamlContent);
        const serviceName = path.basename(file, '.yaml');
        const referencedMethods = new Set();

        if (spec.components && spec.components['x-stackQL-resources']) {
            const resources = spec.components['x-stackQL-resources'];

            Object.entries(resources).forEach(([resourceName, resource]) => {
                const sqlVerbs = resource.sqlVerbs || {};

                Object.entries(sqlVerbs).forEach(([sqlVerb, methods]) => {
                    methods.forEach(methodRef => {
                        try {
                            if (typeof methodRef === 'object' && methodRef.$ref) {
                                methodRef = methodRef.$ref;
                            } else {
                                throw new Error(`Expected methodRef to be an object with a $ref property, but got: ${JSON.stringify(methodRef)}`);
                            }

                            // Track the referenced method
                            referencedMethods.add(methodRef);
                            
                            // methodRef #/components/x-stackQL-resources/tables/methods/patch
                            const methodName = methodRef.split('/').pop();
                            const method = resolveRef(spec, methodRef);
                            // method {
                            //     operation: {
                            //       '$ref': '#/paths/~1projects~1{projectId}~1datasets~1{+datasetId}~1tables~1{+tableId}/patch'
                            //     },
                            //     response: { mediaType: 'application/json', openAPIDocKey: '200' }
                            //   }
                            if (!method) {
                                console.warn(`Warning: Method reference ${methodRef} could not be resolved in file ${file}`);
                                return;
                            }

                            const pathRef = method.operation.$ref;
                            // pathRef #/paths/~1projects~1{projectId}~1datasets~1{+datasetId}~1tables~1{+tableId}/patch
                            if (!pathRef.startsWith('#/paths')) {
                                console.warn(`Warning: Invalid path reference format: ${pathRef} in file ${file}`);
                                return;
                            }

                            // Properly format the path by replacing `#/paths` and `~1` with `/`
                            const formattedPath = pathRef.replace('#/paths/', '').replace(/~1/g, '/');
                            const pathSegments = formattedPath.split('/');
                            const httpVerb = pathSegments.pop(); // Extract the HTTP verb
                            const pathString = pathSegments.join('/'); // Join back the path segments

                            const pathVerbObj = spec.paths[pathString][httpVerb];
                            const opid = pathVerbObj.operationId;
                            const objectKey = method.response?.objectKey || '';
                            const action = opid.split('.').pop();

                            // skip cases which dont need inspection
                            if (sqlVerb === 'select' && httpVerb === 'get') {
                                console.log('skipping...');
                            } else if (sqlVerb === 'delete' && httpVerb === 'delete') {
                                console.log('skipping...');
                            } else if (sqlVerb === 'insert' && httpVerb === 'post') {
                                console.log('skipping...');
                            } else if (sqlVerb === 'update' && httpVerb === 'patch') {
                                console.log('skipping...');
                            } else if (sqlVerb === 'replace' && httpVerb === 'put') {
                                console.log('skipping...');
                            } else if (sqlVerb === 'select' && action === 'getIamPolicy') {
                                console.log('skipping...');
                            } else if (sqlVerb === 'replace' && action === 'setIamPolicy') {
                                console.log('skipping...');                                
                            } else {
                                console.log('skipping...');
                                // csvRows.push([
                                //     serviceName,
                                //     resourceName,
                                //     sqlVerb,
                                //     httpVerb,
                                //     action,
                                //     opid,
                                //     methodName,
                                //     pathString,
                                //     objectKey,
                                // ]);
                            }
                        } catch (error) {
                            console.error(`Error processing method reference ${JSON.stringify(methodRef)} in file ${file}: ${error.message}`);
                        }
                    });
                });
            });

            // Second pass: process unassigned methods
            Object.entries(resources).forEach(([resourceName, resource]) => {
                Object.entries(resource.methods || {}).forEach(([methodName, method]) => {
                    const methodRef = `#/components/x-stackQL-resources/${resourceName}/methods/${methodName}`;
                    if (!referencedMethods.has(methodRef)) {
                        // Method not referenced in sqlVerbs, assign it to exec
                        try {
                            const pathRef = method.operation.$ref;
                            if (!pathRef.startsWith('#/paths')) {
                                console.warn(`Warning: Invalid path reference format: ${pathRef} in file ${file}`);
                                return;
                            }

                            // Properly format the path by replacing `#/paths` and `~1` with `/`
                            const formattedPath = pathRef.replace('#/paths/', '').replace(/~1/g, '/');
                            const pathSegments = formattedPath.split('/');
                            const httpVerb = pathSegments.pop(); // Extract the HTTP verb
                            const pathString = pathSegments.join('/'); // Join back the path segments

                            const pathVerbObj = spec.paths[pathString][httpVerb];
                            const opid = pathVerbObj.operationId;

                            const objectKey = method.response?.objectKey || '';
                            const action = opid.split('.').pop();


                            // post	testIamPermissions
                            if (httpVerb === 'post' && action === 'testIamPermissions') {
                                console.log('skipping...');
                            } else {
                                csvRows.push([
                                    serviceName,
                                    resourceName,
                                    'exec', // Assign verb as 'exec'
                                    httpVerb,
                                    action,
                                    opid,
                                    methodName,
                                    pathString,
                                    objectKey,
                                    
                                ]);
                            }
                        } catch (error) {
                            console.error(`Error processing unassigned method ${methodName} in file ${file}: ${error.message}`);
                        }
                    }
                });
            });

        }
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    fs.writeFileSync('resources-report.csv', csvContent);
    console.log('CSV report generated as resources-report.csv');
}

// Use the directory from command line arguments
const directory = process.argv[2];
if (!directory) {
    console.error('Please provide a directory of OpenAPI YAML specs as an argument.');
    process.exit(1);
}

generateResourcesReport(directory);
