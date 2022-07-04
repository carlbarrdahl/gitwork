// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { parseEther } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
const { getMnemonicWallet } = require("../utils/getMnemonicWallet");

const verifierWallet = getMnemonicWallet();
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(network.config.chainId);
  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run("compile");

  // We get the contract to deploy
  const BountyRegistry = await ethers.getContractFactory("BountyRegistryV1");
  const Verifier = await ethers.getContractFactory("Verifier");
  const Token = await ethers.getContractFactory("Token");

  const verifier = await Verifier.deploy(verifierWallet.address);
  await verifier.deployed();

  const token = await Token.deploy();
  await token.deployed();

  await token.mint(
    "0x277D95C4646827Ea5996E998B31704C0964F79b1",
    parseEther("1000.0")
  );

  console.log("Token deployed to:", token.address);
  console.log("Verifier deployed to:", verifier.address);

  const registry = await BountyRegistry.deploy(verifier.address);
  await registry.deployed();

  console.log("BountyRegistry deployed to:", registry.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
