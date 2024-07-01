import { createWalletClient, http, parseEther, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { taiko } from 'viem/chains';
import { readFile } from './utils/common.js';
import { depositWeth } from './modules/wrap-eth.js';
import { dtxSwap } from './modules/dtx.js';
import {
  checkBalanceUsdc,
  increaseAllowance,
  decreaseAllowance,
} from './utils/web3-util.js';
import { COUNT_TX } from './settings.js';
import { makeLogger } from './utils/logger.js';
import { rubyscoreVote } from './modules/rubyscore.js';
import { parseGwei } from 'viem';
import { syncSwap } from './modules/syncswap.js';
import { syncswapAbi } from './abis/syncswap-abi.js';
import { decodeFunctionData } from 'viem';

const privateKey = privateKeyToAccount(
  '0x11a2a0200e408146f754610fe9114f2916c887b44255927ad526b4fc05b8acab'
);

const client = createWalletClient({
  account: privateKey,
  chain: taiko,
  transport: http(),
}).extend(publicActions);

const walletAddress = privateKey.address;

async function main() {
  const privateKeys = readFile('src/data/private-keys.txt');
  const functions = ['dtx', 'syncswap', 'vote', 'wrap'];
  console.log(privateKeys);

  // const logger = makeLogger('MAIN_MODULE');
  // logger.silly('STARTING BOT ⚡⚡⚡\n');
}

main();
