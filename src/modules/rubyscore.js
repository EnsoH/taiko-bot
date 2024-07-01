import { sleep } from '../utils/common.js';
import { makeLogger } from '../utils/logger.js';
import { rubyscoreAbi } from '../abis/rubyscore-abi.js';
import { RUBYSCORE_CONTRACT_ADDRESS } from '../utils/contracts.js';
import { parseGwei } from 'viem';
import { checkBalance } from '../utils/web3-util.js';

export async function rubyscoreVote(client) {
  const logger = makeLogger('RUBYSCORE');
  try {
    await checkBalance(client, walletAddress);

    const result = await client.writeContract({
      address: RUBYSCORE_CONTRACT_ADDRESS,
      abi: rubyscoreAbi,
      functionName: 'vote',
      args: [],
    });

    logger.info(`Voted on RubyScore | https://taikoscan.io/tx/${result}`);
  } catch (err) {
    logger.error(`Error when voting on rubyscoroe | ${err}`);
  }
}
