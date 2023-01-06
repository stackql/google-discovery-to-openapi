import { 
    showUsage, 
    parseArgumentsIntoOptions, 
} from './util/usage.js';

import { logger } from './util/logging.js';
import { generateSpecs } from './commands/generate.js';

export async function main(args) {

    const options = parseArgumentsIntoOptions(args);
    const command = options.command || false;
  
    if (!command){
      showUsage('unknown');
      return
    } else if(options.help){ 
      return
    } else {
      switch(command) {
          case 'generate':
            await generateSpecs(options, process.cwd()).finally(() => {
              process.exit(0);
            }).catch(err => {
              logger.error(err);
              process.exit(1);
            });
            break;
          default:
              showUsage('unknown');
              break;
      };
    };
  }