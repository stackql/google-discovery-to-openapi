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
    let content = `---
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

Creates, updates, deletes, gets or lists a <code>${resourceName}</code> resource.

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
function getSchemaManifest(schema, allSchemas, maxDepth = 10) {
    // Helper function to resolve schema references
    const resolveRef = (ref, visitedRefs, depth) => {
        const resolvedSchema = allSchemas[ref];
        return resolvedSchema ? processProperties(resolvedSchema.properties, visitedRefs, depth + 1) : 'string';
    };

    // Helper function to process array items
    const processArrayItems = (value, visitedRefs, depth) => {
        if (value.items.$ref) {
            return [resolveRef(value.items.$ref.replace('#/components/schemas/', ''), visitedRefs, depth)];
        } else if (value.items.properties) {
            return [processProperties(value.items.properties, visitedRefs, depth)];
        } else {
            return [value.items.type || 'string'];
        }
    };

    // Recursive function to process schema properties and return them in the desired format
    function processProperties(properties, visitedRefs = new Set(), depth = 0) {
        if (!properties || depth > maxDepth) return [];

        return Object.entries(properties).map(([key, value]) => {
            if (value.$ref) {
                const ref = value.$ref.replace('#/components/schemas/', '');
                if (visitedRefs.has(ref)) {
                    console.log(`Cyclic reference detected for ${ref}, skipping.`);
                    return null;
                }
                visitedRefs.add(ref);
                return { name: key, value: resolveRef(ref, visitedRefs, depth) };
            } else if (value.type === 'array' && value.items) {
                return { name: key, value: processArrayItems(value, visitedRefs, depth) };
            } else if (value.type === 'object' && value.properties) {
                return { name: key, value: processProperties(value.properties, visitedRefs, depth + 1) };
            } else {
                return { name: key, value: value.type || 'string' };
            }
        }).filter(item => item !== null); // Remove null values from cyclic references
    }

    // Wrap the final result in the desired format
    return [
        {
            name: "your_resource_model_name",
            props: processProperties(schema?.properties)
        }
    ];
}

function generateSelectExample(serviceName, resourceName, method, fields) {
    // Map over the fields array to create a list of column names
    const selectColumns = fields.map(field => field.name).join(',\n');

    // Check if there are required parameters
    const whereClause = method.RequiredParams
        ? `WHERE ${method.RequiredParams.split(', ').map(param => `${param} = '{{ ${param} }}'`).join('\nAND ')}`
        : '';

    return `
## ${mdCodeAnchor}SELECT${mdCodeAnchor} examples

${method.description}

${sqlCodeBlockStart}
SELECT
${selectColumns}
FROM google.${serviceName}.${resourceName}
${whereClause};
${codeBlockEnd}
`;
}

const readOnlyPropertyNames = [
    'selfLink',
    'kind',
    'creationTimestamp',
    'createTime',
    'updateTime',
    'id',
    'selfLinkWithId',
];

function generateInsertExample(serviceName, resourceName, resourceData, paths, componentsSchemas, method) {
    try {
        const requiredParams = method.RequiredParams
            ? method.RequiredParams.split(', ').map(param => param.trim())  // Splitting requiredParams into an array
            : [];  // If no RequiredParams, set it to an empty array

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

        const schemaFields = schema.properties
            ? Object.entries(schema.properties)
                .filter(([key, value]) => !value.readOnly && !readOnlyPropertyNames.includes(key))  // Filter out properties with readOnly: true or matching readOnlyPropertyNames
                .map(([key, value]) => ({
                    name: key,
                    type: value.type
                }))
            : [];

        // Combine required params and schema fields
        const allFields = [
            ...requiredParams.map(param => ({ name: param, type: 'string' })), // requiredParams are assumed to be of type 'string'
            ...schemaFields
        ];

        // Check if there are required parameters to avoid empty insert fields
        const insertFields = allFields.length > 0
            ? allFields.map(field => field.name).join(',\n')
            : '';  // No fields, leave it empty

        // Generate the corresponding values for the SELECT clause, handling different data types
        const selectValues = allFields.length > 0
            ? allFields.map(field => {
                if (field.type === 'string') {
                    return `'{{ ${field.name} }}'`; // for strings, use '{{ fieldName }}'
                } else if (field.type === 'boolean') {
                    return `{{ ${field.name} }}`; // assuming boolean is true for this example, can be false as well
                } else if (field.type === 'number') {
                    return `{{ ${field.name} }}`; // assuming number is 0 for this example
                } else {
                    return `'{{ ${field.name} }}'`; // fallback to string template
                }
            }).join(',\n')
            : '';  // No values, leave it empty

        const yamlManifest = yaml.dump(getSchemaManifest(schema, componentsSchemas), { quotingType: "'", lineWidth: -1, noRefs: true, skipInvalid: true });

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
            ? Object.entries(schema.properties)
                .filter(([key, value]) => !value.readOnly && !readOnlyPropertyNames.includes(key))  // Filter out properties with readOnly: true or matching readOnlyPropertyNames
                .map(([key, value]) => ({
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

        let sqlDescription = `Updates a <code>${resourceName}</code> resource.`
        if(isReplace) {
            sqlDescription = `Replaces all fields in the specified <code>${resourceName}</code> resource.`;
        }

        return `
## ${mdCodeAnchor}${isReplace ? 'REPLACE': 'UPDATE'}${mdCodeAnchor} example

${sqlDescription}

${sqlCodeBlockStart}
/*+ update */
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

Deletes the specified <code>${resourceName}</code> resource.

${sqlCodeBlockStart}
/*+ delete */
DELETE FROM google.${serviceName}.${resourceName}
WHERE ${method.RequiredParams.split(', ').map(param => `${param} = '{{ ${param} }}'`).join('\nAND ')};
${codeBlockEnd}
`;
}

