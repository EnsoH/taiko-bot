import { createWalletClient, http, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { taiko } from 'viem/chains';
import { getRandomAmount, readFile, shuffle } from './utils/common.js';
import { makeLogger } from "./utils/logger.js";
import { SETTINGS, SWAP_SETTINGS } from "./settings.js";
import { dtxSwap } from "./modules/dtx.js";
import { syncSwap } from "./modules/syncswap.js";
import { rubyscoreVote } from "./modules/rubyscore.js";
import { depositWeth } from "./modules/wrap-eth.js";


async function executeModule(client, walletAddress, module, logger) {
  const amount = getRandomAmount(SWAP_SETTINGS.DEX_ETH_AMOUNT[0], SWAP_SETTINGS.DEX_ETH_AMOUNT[1]);
  const slippage = SWAP_SETTINGS.SLIPPAGE;

  try {
    switch (module) {
      case 'dtx':
        await dtxSwap(client, walletAddress, amount, slippage);
        break;
      case 'syncswap':
        await syncSwap(client, walletAddress, amount, slippage);
        break;
      case 'rubyscore':
        await rubyscoreVote(client, walletAddress);
        break;
      case 'wrap-eth':
        const wrapAmount = getRandomAmount(SWAP_SETTINGS.WRAP_ETH_AMOUNT[0], SWAP_SETTINGS.WRAP_ETH_AMOUNT[1]);
        await depositWeth(client, walletAddress, wrapAmount);
        break;
      default:
        logger.fatal('Unknown module error', module);
    }
  } catch (error) {
    logger.error(`Error executing module ${module}:`, error);
  }
}

async function processWallet(client, walletAddress, logger) {
  const modules = shuffle(SETTINGS.MODULES);

  if (SETTINGS.SHUFFLE_TX_COUNT) {
    const txCounts = getRandomAmount(SETTINGS.SHUFFLE_TX_COUNT[0], SETTINGS.SHUFFLE_TX_COUNT[1]);

    for (let i = 0; i < txCounts; i++) {
      for (const module of modules) {
        await executeModule(client, walletAddress, module, logger);
      }
    }
  }

  for (const module of modules) {
    await executeModule(client, walletAddress, module, logger);
  }
}

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
    await processWallet(client, walletAddress, logger);
  }
}

main();
