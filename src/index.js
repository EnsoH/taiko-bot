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

    const modules = shuffle(SETTINGS.MODULES)

    for (const module of modules) {
      const amount = getRandomAmount(
          SWAP_SETTINGS.DEX_ETH_AMOUNT[0], SWAP_SETTINGS.DEX_ETH_AMOUNT[0])
      const slippage = SWAP_SETTINGS.SLIPPAGE

      switch (module) {
        case 'dtx':
          await dtxSwap(client, walletAddress, amount, slippage)
          break
        case 'syncswap':
          await syncSwap(client, walletAddress, amount, slippage)
          break
        case 'rubyscore':
          await rubyscoreVote(client, walletAddress)
          break
        case 'wrap-eth':
          const wrapAmount = getRandomAmount(
              SWAP_SETTINGS.WRAP_ETH_AMOUNT[0], SWAP_SETTINGS.WRAP_ETH_AMOUNT[1])
          await depositWeth(client, walletAddress, wrapAmount)
          break
        default:
          logger.fatal('unknown module error', module)
      }
    }
  }
}

main();
