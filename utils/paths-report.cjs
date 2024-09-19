// const fs = require('fs');
// const yaml = require('js-yaml');
// const path = require('path');

// // node utils/paths-report.cjs ./openapi/src/googleapis.com/v00.00.00000/services/iam.yaml ./iam.csv

// // Function to process the OpenAPI spec and write CSV
// function processOpenApiSpec(inputFilePath, outputFilePath) {
//     try {
//         // Load the YAML file
//         const openApiSpec = yaml.load(fs.readFileSync(inputFilePath, 'utf8'));
        
//         const rows = [];
//         rows.push(['Path', 'Verb', 'OperationId']); // CSV header

//         // Loop through paths and extract verb, path, and operationId
//         for (const apiPath in openApiSpec.paths) {
//             const pathItem = openApiSpec.paths[apiPath];
//             for (const method in pathItem) {
//                 const operation = pathItem[method];
//                 const operationId = operation.operationId || '';
//                 rows.push([apiPath, method.toUpperCase(), operationId]);
//             }
//         }

//         // Convert rows array to CSV format manually
//         const csvContent = rows.map(row => row.join(',')).join('\n');

//         // Write the CSV content to a file
//         fs.writeFileSync(outputFilePath, csvContent);
//         console.log('CSV file created successfully at:', outputFilePath);

//     } catch (err) {
//         console.error('Error processing OpenAPI spec:', err);
//     }
// }

// // Get input file and output file from command-line arguments
// const args = process.argv.slice(2);

// if (args.length < 1) {
//     console.error('Usage: node script.js <inputYamlPath> [outputCsvPath]');
//     process.exit(1);
// }

// const inputFilePath = path.resolve(args[0]);
// const outputFilePath = args[1] ? path.resolve(args[1]) : path.join(__dirname, 'output.csv');

// // Process the OpenAPI spec
// processOpenApiSpec(inputFilePath, outputFilePath);


const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

// node utils/paths-report.cjs ./openapi/src/googleapis.com/v00.00.00000/services/iam.yaml ./iam.csv

// Function to process the OpenAPI spec and write CSV
function processOpenApiSpec(inputFilePath, outputFilePath) {
    try {
        // Load the YAML file
        const openApiSpec = yaml.load(fs.readFileSync(inputFilePath, 'utf8'));
        
        const rows = [];
        rows.push(['Path', 'Verb', 'OperationId', '200 Response Schema']); // CSV header with schema

        // Loop through paths and extract verb, path, operationId, and 200 response schema
        for (const apiPath in openApiSpec.paths) {
            const pathItem = openApiSpec.paths[apiPath];
            for (const method in pathItem) {
                if (method === "parameters") continue;
                const operation = pathItem[method];
                const operationId = operation.operationId || '';
                
                // Default value for schema
                let responseSchema = '';

                // Check if the 200 response exists and has a schema
                if (operation.responses && operation.responses['200']) {
                    const response200 = operation.responses['200'];
                    if (response200.content && response200.content['application/json'] && response200.content['application/json'].schema) {
                        const schema = response200.content['application/json'].schema;
                        // Extract the reference from $ref
                        if (schema.$ref) {
                            responseSchema = schema.$ref.split('/').pop(); // Get the last part of the $ref string
                        }
                    }
                }

                // Push the path, method, operationId, and response schema to the rows
                rows.push([apiPath, method.toUpperCase(), operationId, responseSchema]);
            }
        }

        // Convert rows array to CSV format manually
        const csvContent = rows.map(row => row.join(',')).join('\n');

        // Write the CSV content to a file
        fs.writeFileSync(outputFilePath, csvContent);
        console.log('CSV file created successfully at:', outputFilePath);

    } catch (err) {
        console.error('Error processing OpenAPI spec:', err);
    }
}

// Get input file and output file from command-line arguments
const args = process.argv.slice(2);

if (args.length < 1) {
    console.error('Usage: node script.js <inputYamlPath> [outputCsvPath]');
    process.exit(1);
}

const inputFilePath = path.resolve(args[0]);
const outputFilePath = args[1] ? path.resolve(args[1]) : path.join(__dirname, 'output.csv');

// Process the OpenAPI spec
processOpenApiSpec(inputFilePath, outputFilePath);
