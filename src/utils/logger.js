import { Logger } from 'tslog';

export function makeLogger(name) {
  const logger = new Logger({
    hideLogPositionForProduction: true,
    name: name,
    prettyLogTemplate: '{{hh}}:{{MM}}:{{ss}} | {{logLevelName}} | {{name}} | ',
  });

  return logger;
}
