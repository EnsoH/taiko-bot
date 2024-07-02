import { sleep } from '../utils/common.js';
import { makeLogger } from '../utils/logger.js';
import { SYNCSWAP_CONTRACT_ADDRESS } from '../utils/contracts.js';
import { syncswapAbi } from '../abis/syncswap-abi.js';
import { syncswapClassicPoolAbi } from '../abis/syncswap-classic-pool-abi.js';
import { encodeAbiParameters, parseEther } from 'viem';
import { checkBalance, getMinAmount } from '../utils/web3-util.js';

async function pool(client, fromToken, toToken) {
  try {
    return await client.readContract({
      address: '0x608Cb7C3168427091F5994A45Baf12083964B4A3',
      abi: syncswapClassicPoolAbi,
      functionName: 'getPool',
      args: [fromToken, toToken],
    });
  } catch (err) {
    console.log(`Error when fetching pool in syncswap | ${err}`);
  }
}

export async function syncSwap(
  client,
  walletAddress,
  fromToken,
  toToken,
  amount,
  slippage
) {
  const logger = makeLogger('SYNC_SWAP');
  try {
    await checkBalance(client, walletAddress);

    const poolAddress = await pool(client, fromToken, toToken);
    const zeroAddress = '0x0000000000000000000000000000000000000000';

    if (poolAddress === zeroAddress) {
      logger.error(
        `Pool doesn't exist syncswap | pool address - ${poolAddress}`
      );
      return;
    }

    const withdrawMode = 1;
    const swapData = encodeAbiParameters(
      [
        { name: 'address', type: 'address' },
        { name: 'address', type: 'address' },
        { name: 'withdrawMode', type: 'uint8' },
      ],
      [fromToken, walletAddress, withdrawMode]
    );

    const steps = [
      {
        pool: poolAddress,
        data: swapData,
        callback: zeroAddress,
        callbackData: '0x',
      },
    ];

    const paths = [
      {
        steps: steps,
        tokenIn: zeroAddress,
        amountIn: parseEther(String(amount)),
      },
    ];

    const deadline = Math.floor(Date.now() / 1000) + 5 * 60;
    const minAmount = await getMinAmount(true, amount, slippage);

    const { request } = await client.simulateContract({
      address: SYNCSWAP_CONTRACT_ADDRESS,
      abi: syncswapAbi,
      functionName: 'swap',
      args: [paths, minAmount, deadline],
    });

    const result = await client.writeContract(request);

    logger.info(
      `Swap ${amount} ETH -> USDC | https://taikoscan.io/tx/${result}`
    );

    await sleep()
  } catch (err) {
    logger.error(`Error when swapping on syncswap | ${err}`);
  }
}
