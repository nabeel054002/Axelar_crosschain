'use strict'
const {
    getDefaultProvider, 
    Contract,
    constants: {AddressZero},
} = require('ethers');
const {
    utils:{deployContract},
} = require('@axelar-network/axelar-local-dev');

const { sleep } = require('../../utils');
const TaskEarnWeb3 = require('../../artifacts/examples/taskEarn/TaskEarnWeb3.sol/TaskEarnWeb3.json');
const Gateway = require('../../artifacts/@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol/IAxelarGateway.json');
const IERC20 = require('../../artifacts/@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol/IERC20.json');

async function deploy(chain, wallet) {
    console.log(`Deploying TaskEarnWeb3 for ${chain.name}.`);
    const contract = await deployContract(wallet, TaskEarnWeb3, [chain.gateway, chain.gasReceiver]);
    chain.TaskEarnWeb3 = contract.address;
    console.log(`Deployed TaskEarnWeb3 for ${chain.name} at ${chain.TaskEarnWeb3}.`);
}

async function test(chains, wallet, options) {
    const args = options.args || [];
    const getGasPrice = options.getGasPrice;
    const source = chains.find((chain) => chain.name === (args[0] || 'Avalanche'));
    const destination = chains.find((chain) => chain.name === (args[1] || 'Fantom'));
    const amount = Math.floor(parseFloat(args[3])) * 1e6 || 10e6;
    const accounts = args.slice(4);
    const message = args[2] || `Hello ${destination.name} from ${source.name}, it is ${new Date().toLocaleTimeString()}.`;
    if (accounts.length === 0) accounts.push(wallet.address);

    for (const chain of [source, destination]) {
        const provider = getDefaultProvider(chain.rpc);
        chain.wallet = wallet.connect(provider);
        chain.contract = new Contract(chain.TaskEarnWeb3, TaskEarnWeb3.abi, chain.wallet);
        chain.gateway = new Contract(chain.gateway, Gateway.abi, chain.wallet);
        const usdcAddress = chain.gateway.tokenAddresses('aUSDC');
        chain.usdc = new Contract(usdcAddress, IERC20.abi, chain.wallet);
    }

    async function logAccountBalances() {
        console.log(`value at ${destination.name} is "${await destination.contract.value()}"`);
        for (const account of accounts) {
            console.log(`${account} has ${(await destination.usdc.balanceOf(account)) / 1e6} aUSDC`);
        }
    }

    console.log('--- Initially ---');
    await logAccountBalances();
    console.log('51');
    const gasLimit = 3e6;
    const gasPrice = await getGasPrice(source, destination, AddressZero);
    console.log('54');
    const balance = BigInt(await destination.usdc.balanceOf(accounts[0]));
    console.log('56');
    const approveTx = await source.usdc.approve(source.contract.address, amount);
    await approveTx.wait();
    console.log('59')
    console.log(destination.name, destination.TaskEarnWeb3, accounts, 'aUSDC', amount, message);
    const sendTx = await source.contract.sendToMany(destination.name, destination.TaskEarnWeb3, accounts, 'aUSDC', amount, message,  {
        value: BigInt(Math.floor(gasLimit * gasPrice)),
    });
    console.log("transaction is ",sendTx);
    await sendTx.wait();
    console.log('64')
    while (BigInt(await destination.usdc.balanceOf(accounts[0])) === balance) {
        await sleep(2000);
    }

    while ((await destination.contract.value()) !== message) {
        await sleep(2000);
    }

    console.log('--- After ---');
    await logAccountBalances();
}

module.exports = {
    deploy,
    test,
};
/*
Deployed TaskEarnWeb3 for Moonbeam at 0x286C24e76faA85FB9FF1a8Bd72582D2b11e712F3.
Deployed TaskEarnWeb3 for Avalanche at 0x13B05DC0F09d44f6fAdc598852957255a3A70400.
Deployed TaskEarnWeb3 for Polygon at 0x13B05DC0F09d44f6fAdc598852957255a3A70400.
Deployed TaskEarnWeb3 for Fantom at 0x13B05DC0F09d44f6fAdc598852957255a3A70400.
Deployed TaskEarnWeb3 for Ethereum at 0x13B05DC0F09d44f6fAdc598852957255a3A70400.
*/