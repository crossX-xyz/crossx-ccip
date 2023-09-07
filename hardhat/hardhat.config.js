require("@nomicfoundation/hardhat-toolbox");
//dotenv
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000,
      },
      viaIR: true,
    },
  },

  networks: {
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [process.env.PRIVATE_KEY],
    },
    bsc: {
      url: "https://data-seed-prebsc-1-s2.binance.org:8545",
      accounts: [process.env.PRIVATE_KEY],
    },
    avalanche: {
      url: "https://rpc.ankr.com/avalanche_fuji",
      accounts: [process.env.PRIVATE_KEY],
    },
    arbitrum: {
      url: "https://endpoints.omniatech.io/v1/arbitrum/goerli/public",
      accounts: [process.env.PRIVATE_KEY],
    },
    base: {
      url: "https://base-goerli.publicnode.com",
      accounts: [process.env.PRIVATE_KEY],
    },

    optimism: {
      url: "https://goerli.optimism.io",
      accounts: [process.env.PRIVATE_KEY],
    },

    sepolia: {
      url: "https://ethereum-sepolia.blockpi.network/v1/rpc/public",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGON_API_KEY,
      optimisticGoerli: process.env.OPTIMISM_API_KEY,
      bscTestnet: process.env.BSC_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      arbitrumGoerli: process.env.ARBITRUM_API_KEY,
      avalancheFujiTestnet: process.env.AVALANCHE_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
      base: process.env.BASE_API_KEY,
    },
    customChains: [
      {
        network: "base",
        chainId: 84531,
        urls: {
          apiURL: "https://base-goerli.publicnode.com",
          browserURL: "https://goerli.basescan.org/",
        },
      },
    ],
  },
};
