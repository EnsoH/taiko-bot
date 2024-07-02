import { Logger } from 'tslog';

export function makeLogger(name) {
  return new Logger({
    hideLogPositionForProduction: true,
    name: name,
    prettyLogTemplate: '{{hh}}:{{MM}}:{{ss}} | {{logLevelName}} | {{name}} | ',
  });
}
