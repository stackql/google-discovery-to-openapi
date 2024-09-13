import pluralize from 'pluralize';
import yaml from 'js-yaml';
import { runQuery } from '@stackql/pgwire-lite';
const connectionOptions = {
  user: 'stackql',
  database: 'stackql',
  host: 'localhost',
  port: 5444,
  debug: false,
};

const sqlCodeBlockStart = '```sql';
const yamlCodeBlockStart = '```yaml';
const codeBlockEnd = '```';
const mdCodeAnchor = "`";

async function executeSQL(connectionOptions, query) {
    try {
        const result = await runQuery(connectionOptions, query);
        // console.info('result:', result);
        return result.data;
      } catch (error) {
        console.error('error executing query:', error.message);
      }
}

export async function createResourceIndexContent(serviceName, resourceName, resourceData, paths, componentsSchemas) {
    
    const fieldsSql = `DESCRIBE EXTENDED google.${serviceName}.${resourceName}`;
    const fields = await executeSQL(connectionOptions, fieldsSql) || [];
    // console.info('fields:', fields);
    
    // Fetch method descriptions
    const methodsSql = `SHOW EXTENDED METHODS IN google.${serviceName}.${resourceName}`;
    const methods = await executeSQL(connectionOptions, methodsSql) || [];    
    // console.info('methods:', methods);

    // Start building the markdown content
    let content = `
---
title: ${resourceName}
hide_title: false
hide_table_of_contents: false
keywords:
  - ${resourceName}
  - ${serviceName}
  - google
  - stackql
  - infrastructure-as-code
  - configuration-as-data
  - cloud inventory
description: Query, deploy and manage Google Cloud Platform (GCP) infrastructure and resources using SQL
custom_edit_url: null
image: /img/providers/google/stackql-google-provider-featured-image.png
---

import CopyableCode from '@site/src/components/CopyableCode/CopyableCode';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Creates, updates, deletes or gets an <code>${pluralize.singular(resourceName)}</code> resource or lists <code>${resourceName}</code> in a region

## Overview
<table><tbody>
<tr><td><b>Name</b></td><td><code>${resourceName}</code></td></tr>
<tr><td><b>Type</b></td><td>Resource</td></tr>
<tr><td><b>Id</b></td><td><CopyableCode code="${resourceData.id}" /></td></tr>
</tbody></table>

## Fields
`;

    if (fields.length === 0) {
        content += `${mdCodeAnchor}SELECT${mdCodeAnchor} not supported for this resource, use ${mdCodeAnchor}SHOW METHODS${mdCodeAnchor} to view available operations for the resource.\n\n`;
    } else {
        content += '| Name | Datatype | Description |\n|:-----|:---------|:------------|\n';
        fields.forEach(field => {
            content += `| <CopyableCode code="${field.name}" /> | ${mdCodeAnchor}${field.type}${mdCodeAnchor} | ${field.description} |\n`;
        });
    }

    content += '\n## Methods\n| Name | Accessible by | Required Params | Description |\n|:-----|:--------------|:----------------|:------------|\n';

    // Append methods
    methods.forEach(method => {
        const sqlVerb = method.SQLVerb;
        content += `| <CopyableCode code="${method.MethodName}" /> | ${mdCodeAnchor}${sqlVerb}${mdCodeAnchor} | <CopyableCode code="${method.RequiredParams}" /> | ${method.description} |\n`;
    });

    // Append SQL examples for each SQL verb
    const sqlVerbs = ['SELECT', 'INSERT', 'UPDATE', 'REPLACE', 'DELETE'];
    sqlVerbs.forEach(sqlVerb => {
        const relevantMethods = methods.filter(method => method.SQLVerb === sqlVerb);

        if (relevantMethods.length === 0) return;

        const exampleMethod = relevantMethods.sort((a, b) => a.RequiredParams.length - b.RequiredParams.length)[0];

        switch (sqlVerb) {
            case 'SELECT':
                content += generateSelectExample(serviceName, resourceName, exampleMethod, fields);
                break;
            case 'INSERT':
                content += generateInsertExample(serviceName, resourceName, resourceData, paths, componentsSchemas, exampleMethod);
                break;
            case 'UPDATE':
                content += generateUpdateExample(serviceName, resourceName, resourceData, paths, componentsSchemas, exampleMethod);
                break;
            case 'REPLACE':
                content += generateUpdateExample(serviceName, resourceName, resourceData, paths, componentsSchemas, exampleMethod, true);
                break;
            case 'DELETE':
                content += generateDeleteExample(serviceName, resourceName, exampleMethod);
                break;
        }
    });

    // Write the content to a file
    return content;

}

// Helper functions to generate examples for each SQL verb

// function getSchemaManifest(schema, level = 2) {
//     const indent = '  '.repeat(level); // Indent based on the nesting level

//     // Recursive function to process schema properties
//     function processProperties(properties, indentLevel) {
//         if (!properties) return ''; // Guard against undefined or null properties

//         return Object.entries(properties).map(([key, value]) => {
//             if (value.type === 'array' && value.items && value.items.properties) {
//                 // If it's an array, process the first element and recurse
//                 return `${indentLevel}- name: ${key}\n${indentLevel}  value:\n${processProperties(value.items.properties, indentLevel + '    ')}`;
//             } else if (value.type === 'object' && value.properties) {
//                 // If it's an object, recursively process its properties
//                 return `${indentLevel}- name: ${key}\n${indentLevel}  value:\n${processProperties(value.properties, indentLevel + '    ')}`;
//             } else {
//                 // For scalar types, output as a simple value
//                 const placeholder = value.type === 'string' ? `'{{ ${key} }}'` 
//                     : value.type === 'boolean' ? `{{ ${key} }}`
//                     : value.type === 'number' ? `{{ ${key} }}`
//                     : `'{{ ${key} }}'`; // Fallback to string template
//                 return `${indentLevel}- name: ${key}\n${indentLevel}  value: ${placeholder}`;
//             }
//         }).join('\n');
//     }

//     // Start processing the schema properties
//     return `resources:\n  - name: instance\n    props:\n${processProperties(schema?.properties, indent)}`;
// }

function getSchemaManifest(schema) {
    // Recursive function to process schema properties
    function processProperties(properties) {
        if (!properties) return [];

        return Object.entries(properties).map(([key, value]) => {
            if (value.type === 'array' && value.items && value.items.properties) {
                // If it's an array, process the first element and recurse
                return {
                    name: key,
                    value: [processProperties(value.items.properties)]
                };
            } else if (value.type === 'object' && value.properties) {
                // If it's an object, recursively process its properties
                return {
                    name: key,
                    value: processProperties(value.properties)
                };
            } else {
                // For scalar types, output as a simple value
                const placeholder = value.type === 'string' ? `{{ ${key} }}`
                    : value.type === 'boolean' ? `{{ ${key} }}`
                    : value.type === 'number' ? `{{ ${key} }}`
                    : `{{ ${key} }}`; // Fallback to string template
                return {
                    name: key,
                    value: placeholder
                };
            }
        });
    }

    // Build the object structure for the manifest
    const manifest = {
        resources: [
            {
                name: 'instance',
                props: processProperties(schema?.properties)
            }
        ]
    };

    // Convert the manifest object to YAML
    return yaml.dump(manifest, { quotingType: "'" }); // Ensure single quotes around string values
}

function generateSelectExample(serviceName, resourceName, method, fields) {
    // Map over the fields array to create a list of column names
    const selectColumns = fields.map(field => field.name).join(',\n');

    return `
## ${mdCodeAnchor}SELECT${mdCodeAnchor} examples

${method.description}

${sqlCodeBlockStart}
SELECT
${selectColumns}
FROM google.${serviceName}.${resourceName}
WHERE ${method.RequiredParams.split(', ').map(param => `${param} = '{{ ${param} }}'`).join('\nAND ')}; 
${codeBlockEnd}
`;
}

function generateInsertExample(serviceName, resourceName, resourceData, paths, componentsSchemas, method) {
    try {
        const requiredParams = method.RequiredParams.split(', ').map(param => param.trim()); // splitting requiredParams into an array
        let schema = {};

        // Safely retrieve schemaRef and schema properties
        const operationRef = resourceData.methods[method.MethodName].operation.$ref;
        const operationPathParts = operationRef.replace('#/paths/', '').replace(/~1/g, '/').split('/');
        const operationVerb = operationPathParts.pop();
        const operationPath = operationPathParts.join('/');
        const schemaRef = paths?.[operationPath]?.[operationVerb]?.requestBody?.content?.['application/json']?.schema?.$ref || null;

        if (schemaRef) {
            schema = componentsSchemas[schemaRef.split('/').pop()] || {};
        }

        // Extract field names and data types from the schema
        const schemaFields = schema.properties
            ? Object.entries(schema.properties).map(([key, value]) => ({
                name: key,
                type: value.type
            }))
            : [];

        // Combine required params and schema fields
        const allFields = [
            ...requiredParams.map(param => ({ name: param, type: 'string' })), // requiredParams are assumed to be of type 'string'
            ...schemaFields
        ];

        // Generate the field names for the INSERT INTO clause
        const insertFields = allFields.map(field => field.name).join(',\n');

        // Generate the corresponding values for the SELECT clause, handling different data types
        const selectValues = allFields.map(field => {
            if (field.type === 'string') {
                return `'{{ ${field.name} }}'`; // for strings, use '{{ fieldName }}'
            } else if (field.type === 'boolean') {
                return `true|false`; // assuming boolean is true for this example, can be false as well
            } else if (field.type === 'number') {
                return `number`; // assuming number is 0 for this example
            } else {
                return `'{{ ${field.name} }}'`; // fallback to string template
            }
        }).join(',\n');

        const yamlManifest = getSchemaManifest(schema);

        return `
## ${mdCodeAnchor}INSERT${mdCodeAnchor} example

Use the following StackQL query and manifest file to create a new <code>${resourceName}</code> resource.

<Tabs
    defaultValue="all"
    values={[
        { label: 'All Properties', value: 'all', },
        { label: 'Manifest', value: 'manifest', },
    ]
}>
<TabItem value="all">

${sqlCodeBlockStart}
/*+ create */
INSERT INTO google.${serviceName}.${resourceName} (
${insertFields}
)
SELECT 
${selectValues}
;
${codeBlockEnd}
</TabItem>
<TabItem value="manifest">

${yamlCodeBlockStart}
${yamlManifest}
${codeBlockEnd}
</TabItem>
</Tabs>
`;
    } catch (error) {
        console.log('Error generating INSERT example:', error);
    }
}

function generateUpdateExample(serviceName, resourceName, resourceData, paths, componentsSchemas, method, isReplace = false) {
    try {
        const requiredParams = method.RequiredParams.split(', ').map(param => param.trim()); // Splitting required params into an array

        // Safely retrieve schemaRef and schema properties
        const operationRef = resourceData.methods[method.MethodName].operation.$ref;
        const operationPathParts = operationRef.replace('#/paths/', '').replace(/~1/g, '/').split('/');
        const operationVerb = operationPathParts.pop();
        const operationPath = operationPathParts.join('/');
        const schemaRef = paths?.[operationPath]?.[operationVerb]?.requestBody?.content?.['application/json']?.schema?.$ref || null;

        let schema = {};
        if (schemaRef) {
            schema = componentsSchemas[schemaRef.split('/').pop()] || {};
        }

        // Extract field names and data types from the schema
        const schemaFields = schema.properties
            ? Object.entries(schema.properties).map(([key, value]) => ({
                name: key,
                type: value.type
            }))
            : [];

        // Generate the field names and corresponding values for the SET clause
        const setParams = schemaFields.map(field => {
            if (field.type === 'string') {
                return `${field.name} = '{{ ${field.name} }}'`; // For strings, use '{{ fieldName }}'
            } else if (field.type === 'boolean') {
                return `${field.name} = true|false`; // Assuming boolean is true for this example
            } else if (field.type === 'number') {
                return `${field.name} = number`; // Assuming number is 0 for this example
            } else {
                return `${field.name} = '{{ ${field.name} }}'`; // Fallback to string template
            }
        }).join(',\n');

        // Generate the WHERE clause for the required params
        const whereClause = requiredParams.map(param => `${param} = '{{ ${param} }}'`).join('\nAND ');

        let sqlDescription = `Updates a ${pluralize.singular(resourceName)} only if the necessary resources are available.`
        if(isReplace) {
            sqlDescription = `Replaces all fields in the specified ${pluralize.singular(resourceName)} resource.`;
        }

        return `
## ${mdCodeAnchor}UPDATE${mdCodeAnchor} example

${sqlDescription}

${sqlCodeBlockStart}
${isReplace ? 'REPLACE': 'UPDATE'} google.${serviceName}.${resourceName}
SET 
${setParams}
WHERE 
${whereClause};
${codeBlockEnd}
`;
    } catch (error) {
        console.log('Error generating UPDATE example:', error);
    }
}

function generateDeleteExample(serviceName, resourceName, method) {
    return `
## ${mdCodeAnchor}DELETE${mdCodeAnchor} example

Deletes the specified ${pluralize.singular(resourceName)} resource.

${sqlCodeBlockStart}
DELETE FROM google.${serviceName}.${resourceName}
WHERE ${method.RequiredParams.split(', ').map(param => `${param} = '{{ ${param} }}'`).join('\nAND ')};
${codeBlockEnd}
`;
}

