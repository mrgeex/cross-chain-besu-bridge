require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.7",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    chain_a: {
      url: process.env.CHAIN_A_RPC_URL,
      accounts: [process.env.CHAIN_A_PRIV_KEY],
      chainId: 1337,
      gasPrice: 0,
    },
    chain_b: {
      url: process.env.CHAIN_B_RPC_URL,
      accounts: [process.env.CHAIN_B_PRIV_KEY],
      chainId: 2337,
      gasPrice: 0,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
};
