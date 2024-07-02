import { formatEther, parseEther, parseUnits } from 'viem';
import { USDC_CONTRACT_ADDRESS } from './contracts.js';
import { stablecoinAbi } from '../abis/stablecoin-abi.js';
import { makeLogger } from './logger.js';

export async function checkBalance(client, walletAddress) {
  const logger = makeLogger('BALANCE_MODULE');
  try {
    const weiBalance = await client.getBalance({
      address: walletAddress,
    });
    const balance = Number(formatEther(weiBalance)).toFixed(10);
    const MIN_BALANCE_THRESHOLD = 1e-6; // Минимальный порог для баланса

    if (balance <= MIN_BALANCE_THRESHOLD) {
      logger.warn(`${walletAddress} no balance ${balance} ETH`);
      return false
    }

    return balance;
  } catch (err) {
    logger.error(`Error when checking balance ETH | ${err}`);
  }
}

export async function getMinAmount(isEth, amountToSwap, slippage) {
  const logger = makeLogger('ETH_PRICE');
  try {
    const priceEth = await fetch(
      'https://api.coinlore.net/api/ticker/?id=80'
    ).then((resp) => resp.json().then((data) => data[0].price_usd));

    if (isEth) {
      const amount = amountToSwap * priceEth * (1 - slippage);
      return parseUnits(String(amount), 6);
    } else {
      const amount = (amountToSwap / priceEth) * (1 - slippage);
      const roundedAmount = amount.toFixed(18);
      return parseEther(String(roundedAmount));
    }
  } catch (err) {
    logger.error(`Error when fetch ETH PRICE | ${err}`);
  }
}

export async function checkBalanceUsdc(client, walletAddress) {
  try {
    return await client.readContract({
      address: USDC_CONTRACT_ADDRESS,
      abi: stablecoinAbi,
      functionName: 'balanceOf',
      args: [walletAddress],
    });
  } catch (err) {
    console.log(`Error when check balance USDC | ${err}`);
  }
}

export async function checkAllowance(client, walletAddress, spender) {
  try {
    return await client.readContract({
      address: USDC_CONTRACT_ADDRESS,
      abi: stablecoinAbi,
      functionName: 'allowance',
      args: [walletAddress, spender],
    });
  } catch (err) {
    console.log(`Error when check allowance | ${err}`);
  }
}

export async function approve(client, spender, amount) {
  const logger = makeLogger('APPROVE');
  try {
    const result = await client.writeContract({
      address: USDC_CONTRACT_ADDRESS,
      abi: stablecoinAbi,
      functionName: 'approve',
      args: [spender, amount],
    });

    logger.info(`Approve token usdc | https://taikoscan.io/tx/${result}`);
  } catch (err) {
    logger.error(`Error when approve | ${err}`);
  }
}

export async function increaseAllowance(client, spender, amount) {
  const logger = makeLogger('ALLOWANCE_MODULE');
  try {
    const result = await client.writeContract({
      address: USDC_CONTRACT_ADDRESS,
      abi: stablecoinAbi,
      functionName: 'increaseAllowance',
      args: [spender, amount],
    });

    logger.info(`Increase allowance | https://taikoscan.io/tx/${result}`);
  } catch (err) {
    logger.error(`Error when increase allowance | ${err}`);
  }
}

export async function decreaseAllowance(client, spender, amount) {
  const logger = makeLogger('ALLOWANCE_MODULE');
  try {
    const result = await client.writeContract({
      address: USDC_CONTRACT_ADDRESS,
      abi: stablecoinAbi,
      functionName: 'decreaseAllowance',
      args: [spender, amount],
    });

    logger.info(`Decrease allowance | https://taikoscan.io/tx/${result}`);
  } catch (err) {
    logger.error(`Error when decrease allowance | ${err}`);
  }
}
