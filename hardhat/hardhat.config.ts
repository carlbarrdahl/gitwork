import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

import { HardhatUserConfig, task } from "hardhat/config";

import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import { formatEther, parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
dotenv.config();

const { getMnemonicWallet } = require("./utils/getMnemonicWallet");
console.log(getMnemonicWallet().address);
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

function mnemonic() {
  try {
    return fs.readFileSync("./mnemonic.txt").toString().trim();
  } catch (e) {
    console.log(
      "☢️ WARNING: No mnemonic file created for a deploy account. Try `yarn run generate` and then `yarn run account`."
    );
  }
  return "";
}
const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 2000,
          },
        },
      },
    ],
  },
  networks: {
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    rinkeby: {
      url: process.env.RINKEBY_URL,
      accounts: {
        mnemonic: mnemonic(),
      },
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

task("faucet", "Transfer ETH")
  .addParam("to", "The account's address")
  .setAction(async (taskArgs, hre) => {
    const [deployer] = await hre.ethers.getSigners();

    console.log("deployer", await deployer.getBalance());
    try {
      // deployer.connect(hre.ethers.provider);
      await deployer.sendTransaction({
        to: taskArgs.to,
        value: parseEther("1"),
      });
      console.log("Sent!");
    } catch (error) {
      console.log(error);
    }
  });

task("docgen", "Generate NatSpec", async (taskArgs, hre) => {
  // @ts-ignore
  const config = hre.config.docgen || {
    ignore: ["console", "@openzeppelin"],
    path: ["..", "apps", "web", "contracts"],
    prettify: true,
  };
  const contractNames = await hre.artifacts.getAllFullyQualifiedNames();
  await Promise.all(
    contractNames
      .filter(
        (contractName) =>
          !(config.ignore || []).some((name: string) =>
            contractName.includes(name)
          )
      )
      .map(async (contractName) => {
        const [source, name] = contractName.split(":");
        // @ts-ignore
        const { metadata } = (await hre.artifacts.getBuildInfo(contractName))
          .output.contracts[source][name];

        const { abi, devdoc, userdoc } = JSON.parse(metadata).output;

        fs.writeFileSync(
          path.resolve(__dirname, ...config.path, `${name}.json`),
          JSON.stringify(
            { name, abi, devdoc, userdoc },
            null,
            config.prettify ? 2 : 0
          )
        );
        return { name, abi, devdoc, userdoc };
      })
  );
});

export default config;
