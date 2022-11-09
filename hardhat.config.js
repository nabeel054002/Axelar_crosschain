require('hardhat-gas-reporter');
require('solidity-coverage');
require("dotenv").config({ path: ".env" })

const privatekey = process.env.EVM_PRIVATE_KEY;

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: {
        version: '0.8.9',
        settings: {
            evmVersion: process.env.EVM_VERSION || 'london',
            optimizer: {
                enabled: true,
                runs: 1000,
                details: {
                    peephole: true,
                    inliner: true,
                    jumpdestRemover: true,
                    orderLiterals: true,
                    deduplicate: true,
                    cse: true,
                    constantOptimizer: true,
                    yul: true,
                    yulDetails: {
                        stackAllocation: true,
                    },
                },
            },
        },
    },
    networks:{
        Moonbeam:{
            url:"https://moonbeam-alpha.api.onfinality.io/public",
            accounts:[privatekey],
        },
        Avalanche:{
            url:"https://api.avax-test.network/ext/bc/C/rpc",
            accounts:[privatekey],
        },
        Polygon:{
            url:"https://polygon-mumbai.g.alchemy.com/v2/Ksd4J1QVWaOJAJJNbr_nzTcJBJU-6uP3",
            accounts:[privatekey],
        },
        Fantom:{
            url:"https://rpc.testnet.fantom.network",
            accounts:[privatekey],
        },
        Ethereum:{
            url:"https://ropsten.infura.io/v3/a4812158fbab4a2aaa849e6f4a6dc605",
            accounts:[privatekey],
        }
    },
    paths: {
        sources: "./examples",
    }
};
