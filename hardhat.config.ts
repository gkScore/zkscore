import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import secret from "./secret.json";

const config: HardhatUserConfig = {
  gasReporter: {
    enabled: true,
    currency: "JPY",
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
    coinmarketcap: secret.gasapi,
  },
  etherscan: {
    apiKey: secret.etherscan 
  },
  networks: {
    goerli: {
      url: secret.api,
      accounts: [secret.privatekey],
    },
  },
  solidity: "0.8.17",
  paths: {
    artifacts: "./artifacts"
  }
};

export default config;
