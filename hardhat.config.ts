import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    arbitrum: {
      chainId: 42161,
      url: `https://arbitrum-mainnet.infura.io/v3/${vars.get(
        "INFURA_API_KEY"
      )}`,
      accounts: [vars.get("PRIVATE_KEY")],
    },
    bsc: {
      chainId: 56,
      url: `https://bsc-mainnet.infura.io/v3/${vars.get("INFURA_API_KEY")}`,
      accounts: [vars.get("PRIVATE_KEY")],
    },
  },
};

export default config;
