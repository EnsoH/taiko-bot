import fs from 'node:fs';
import { makeLogger } from './logger.js';
import { SETTINGS } from "../settings.js";

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

export const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export async function sleep() {
  const logger = makeLogger('SLEEP');
  const randomDelay = getRandomDelay(SETTINGS.SLEEP_TIME[0], SETTINGS.SLEEP_TIME[1]);
  logger.debug(`Sleep before next task | ${randomDelay / 1000} sec 💤`);

  return new Promise((resolve) => setTimeout(resolve, randomDelay));
}
