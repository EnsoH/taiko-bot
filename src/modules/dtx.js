import { sleep } from '../utils/common.js';
import { makeLogger } from '../utils/logger.js';
import { dtxAbi } from '../abis/dtx-abi.js';
import { DTX_CONTRACT_ADDRESS } from '../utils/contracts.js';
import { formatUnits, parseEther } from 'viem';
import {
  checkAllowance,
  checkBalanceUsdc,
  approve,
  getMinAmount,
  checkBalance,
} from '../utils/web3-util.js';

export async function dtxSwap(client, walletAddress, amount, slippage) {
  const logger = makeLogger('DTX_DEX');
  try {
    await checkBalance(client, walletAddress);

    const minAmount = await getMinAmount(true, amount, slippage);
    const deadline = Date.now() + 5 * 60 * 1000;

    const { request } = await client.simulateContract({
      address: DTX_CONTRACT_ADDRESS,
      abi: dtxAbi,
      functionName: 'swapExactETHForTokens',
      value: parseEther(String(amount)),
      args: [
        minAmount,
        [
          '0xA51894664A773981C6C112C43ce576f315d5b1B6',
          '0x07d83526730c7438048D55A4fc0b850e2aaB6f0b',
        ],
        walletAddress,
        deadline,
      ],
    });
    const result = await client.writeContract(request);
    logger.info(
      `Swap ${amount} ETH -> ${formatUnits(
        minAmount,
        6
      )} USDC | TX Send hash https://taikoscan.io/tx/${result}`
    );

    await sleep();

    await dtxSwapUsdcEth(client, walletAddress, slippage);
  } catch (err) {
    logger.error(`Error when sending tx for swap | ${err}`);
  }
}

async function dtxSwapUsdcEth(client, walletAddress, slippage) {
  const logger = makeLogger('DTX_DEX');
  try {
    const deadline = Date.now() + 5 * 60 * 1000;

    const amount = await checkBalanceUsdc(client, walletAddress);

    if (amount <= 0) {
      await sleep();
      if (amount <= 0) logger.warn(`Balance is 0 USDC, cant swap to eth`);
      return;
    }

    const minAmount = await getMinAmount(
      false,
      Number(formatUnits(amount, 6)),
      slippage
    );

    const allowance = await checkAllowance(
      client,
      walletAddress,
      DTX_CONTRACT_ADDRESS
    );

    if (allowance < amount) {
      await approve(client, DTX_CONTRACT_ADDRESS, amount);
      await sleep();

      if (allowance >= amount) {
        const { request } = await client.simulateContract({
          address: DTX_CONTRACT_ADDRESS,
          abi: dtxAbi,
          functionName: 'swapExactTokensForETH',
          args: [
            amount,
            minAmount,
            [
              '0x07d83526730c7438048D55A4fc0b850e2aaB6f0b',
              '0xA51894664A773981C6C112C43ce576f315d5b1B6',
            ],
            walletAddress,
            deadline,
          ],
        });
        const result = await client.writeContract(request);
        logger.info(
            `Swap ${formatUnits(amount, 6)} USDC -> ${formatUnits(
                minAmount,
                18
            )} ETH | TX Send hash https://taikoscan.io/tx/${result}`
        );
        await sleep();
      }
    }
  } catch (err) {
    logger.error(`Error when sending tx for swap | ${err}`);
  }
}
