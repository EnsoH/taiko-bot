import { createWalletClient, http, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { taiko } from 'viem/chains';
import { getRandomAmount, readFile, shuffle } from './utils/common.js';
import { makeLogger } from "./utils/logger.js";
import { SETTINGS, SWAP_SETTINGS } from "./settings.js";
import { dtxSwap } from "./modules/dtx.js";
// import { syncSwap } from "./modules/syncswap.js";
import { rubyscoreVote } from "./modules/rubyscore.js";
import { depositWeth } from "./modules/wrap-eth.js";
// import { USDC_CONTRACT_ADDRESS, WETH_CONTRACT_ADDRESS } from "./utils/contracts.js";
import { checkBalance } from "./utils/web3-util.js";


async function executeModule(client, walletAddress, module, logger) {
	const amount = getRandomAmount(SWAP_SETTINGS.DEX_ETH_AMOUNT[0], SWAP_SETTINGS.DEX_ETH_AMOUNT[1]);
	const slippage = SWAP_SETTINGS.SLIPPAGE;

	try {
		let txCountBlockchain = await client.getTransactionCount({
			address: walletAddress,
		})
		const txCounts = Math.round(getRandomAmount(SETTINGS.COUNT_TX[0], SETTINGS.COUNT_TX[1]));
		let finalTxCount = txCountBlockchain + txCounts

		while (txCountBlockchain < finalTxCount) {
			const isBalance = await checkBalance(client, walletAddress);
			if (!isBalance) {
				break
			}
			switch (module) {
				case 'dtx':
					await dtxSwap(client, walletAddress, amount, slippage);
					break;
					// case 'syncswap':
					//   await syncSwap(
					//       client, walletAddress, WETH_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS, amount, slippage);
					//   break;
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
			txCountBlockchain += 1
		}
	} catch (error) {
		logger.error(`Error executing module ${module}:`, error);
	}
}

async function processWallet(client, walletAddress, logger) {
	if (SETTINGS.SHUFFLE_TX_COUNT) {
		const modules = shuffle(SETTINGS.MODULES);
		for (const module of modules) {
			await executeModule(client, walletAddress, module, logger);
		}
	}
}

async function main() {
	const logger = makeLogger('MAIN_MODULE');
	logger.silly('STARTING BOT ⚡⚡⚡\n');

	const privateKeys = readFile('src/data/private-keys.txt');

	for (const privateKey of privateKeys) {
		const key = privateKeyToAccount(privateKey)
		const walletAddress = key.address
		const client = createWalletClient({
			account: key,
			chain: taiko,
			transport: http(),
		}).extend(publicActions);

		await processWallet(client, walletAddress, logger);
	}
}

main();
