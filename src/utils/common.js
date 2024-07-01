import fs from 'node:fs';
import { makeLogger } from './logger.js';
import { SLEEP_TIME } from '../settings.js';

export function readFile(path) {
  const content = fs.readFileSync(path, 'utf8');
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');
}

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min) * 1000;
}

export async function sleep() {
  const logger = makeLogger('SLEEP');
  const randomDelay = getRandomDelay(SLEEP_TIME[0], SLEEP_TIME[1]);
  logger.debug(`Sleep before next task | ${randomDelay / 1000} sec 💤`);
  return new Promise((resolve) => setTimeout(resolve, randomDelay));
}
