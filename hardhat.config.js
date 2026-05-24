import { defineConfig } from "hardhat/config";
import hardhatNodeTestRunner from "@nomicfoundation/hardhat-node-test-runner";
import hardhatViem from "@nomicfoundation/hardhat-viem";
import hardhatViemAssertions from "@nomicfoundation/hardhat-viem-assertions";

/** @type import('hardhat/config').HardhatUserConfig */
export default defineConfig({
  plugins: [
    hardhatNodeTestRunner,
    hardhatViem,
    hardhatViemAssertions,
  ],
  solidity: {
    version: "0.8.24",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  }
});
