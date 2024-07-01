import { parseEther } from 'viem';
import { wethAbi } from '../abis/weth-abi.js';
import { sleep } from '../utils/common.js';
import { makeLogger } from '../utils/logger.js';
import { WETH_CONTRACT_ADDRESS } from '../utils/contracts.js';
import { checkBalance } from '../utils/web3-util.js';

export async function depositWeth(client, walletAddress, amount) {
  const logger = makeLogger('WETH_MODULE');

  try {
    await checkBalance(client, walletAddress);

    console.log(amount)
    console.log('fs')
    console.log(parseEther(amount))

    const { request } = await client.simulateContract({
      address: WETH_CONTRACT_ADDRESS,
      abi: wethAbi,
      functionName: 'deposit',
      value: parseEther(amount),
    });

    const result = await client.writeContract(request);
    logger.info(`Tx send hash https://taikoscan.io/tx/${result}`);
    await sleep();
  } catch (err) {
    logger.error(`Error when sending tx for wrap eth | ${err}`);
  }
}
