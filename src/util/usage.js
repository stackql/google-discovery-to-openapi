import commandLineUsage from 'command-line-usage'

const programName = 'google-discovery-to-openapi';
const programDesc = 'Extracts API information from Google service discovery documents and reconstitutes into OpenAPI3 compliant specs.';
const generateDesc = 'Generates OpenAPI specification document(s) for one or many Google services.';
const debugDesc = '[OPTIONAL] Debug flag. (defaults to false)';
const helpDesc = '[OPTIONAL] Show help for command only. (defaults to false)';

const cmdUsage = [
  {
    header: programName,
    content: programDesc
  },
  {
    header: 'Synopsis',
    content: `$ ${programName} <command> [<arguments>] [<flags>]`
  },
  {
    header: 'Command List',
    content: [
      { name: 'generate', summary: generateDesc },
    ]
  },
];

const generateUsage = [
  {
    header: `${programName} generate`,
    content: generateDesc
  },
  {
    header: 'Synopsis',
    content: `$ ${programName} generate [<provider (defaults to googleapis)>] [<flags>]`
  },
  {
      header: 'Flags',
      optionList: [
        {
            name: 'output',
            alias: 'o',
            type: String,
            description: 'specify the output path for generated OpenAPI documents. (defaults to "openapi")',
        },
        {
            name: 'nonpreferred',
            alias: 'n',
            type: Boolean,
            description: 'use nonpreferred apis. (defaults to false)',
        },
        {
          name: 'debug',
          alias: 'd',
          type: Boolean,
          description: debugDesc,
        },
        {
          name: 'help',
          alias: 'h',
          type: Boolean,
          description: helpDesc,
        },        
      ]
    }    
];

function showUsage(command) {
    switch(command) {
        case 'generate':
          console.log(commandLineUsage(generateUsage));
          break;
        default:
            console.log(commandLineUsage(cmdUsage));
    };
}

function parseArgumentsIntoOptions(args) {
    
    const command = args[2] || false;
    const provider = args[3] || 'googleapis';

    // flag defaults
    let output = 'openapi';
    let preferred = true;
    let debug = false;
    let help = false;

    // iterate through supplied flags
    const flags = args.slice(4);
    for(let i = 0; i < flags.length; i++) {
        switch(flags[i].split('=')[0]) {
            case '--output':
            case '-o':
                output = flags[i].split('=')[1];
                break;
            case '--nonpreferred':
            case '-n':
                preferred = false;
                break;
            case '--debug':
            case '-d':
                debug = true;
                break;
            case 'help':
            case '--help':
            case '-h':
              help = true;    
              showUsage(command);
              break;                
        };            
    }

    return {
        output: output,
        provider: provider,
        preferred: preferred,
        debug: debug,
        command: command,
        help: help,
    };
}

export {
  showUsage,
  parseArgumentsIntoOptions,
}
