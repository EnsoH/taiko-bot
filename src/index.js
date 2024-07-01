import { createWalletClient, http, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { taiko } from 'viem/chains';
import { readFile } from './utils/common.js';
import { makeLogger } from "./utils/logger.js";

async function main() {
  const logger = makeLogger('MAIN_MODULE');
  logger.silly('STARTING BOT ⚡⚡⚡\n');

  const privateKeys = readFile('src/data/private-keys.txt');

  for (const privateKey of privateKeys) {
    const client = createWalletClient({
      account: privateKeyToAccount(privateKey),
      chain: taiko,
      transport: http(),
    }).extend(publicActions);

    const walletAddress = privateKey.address;


  }
}

main();
