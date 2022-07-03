import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BountyRegistryV1, Token } from "../typechain";
const { getMnemonicWallet } = require("../utils/getMnemonicWallet");

// 0x572d68996392eD58b53b995DF1D2968380df419A
function createHash(values: [string, string]) {
  return ethers.utils.solidityKeccak256(
    ["bytes"],
    [ethers.utils.solidityPack(["string", "address"], values)]
  );
}

let registry: BountyRegistryV1;
let token: Token;
let deployer: SignerWithAddress;
let owner: SignerWithAddress;

const repo = "test";
const issue = "123";
const amount = ethers.utils.parseEther("1");
const lockedDuration = 60 * 60 * 24 * 7;

const verifierWallet = getMnemonicWallet();
describe("BountyRegistry", function () {
  beforeEach(async () => {
    [deployer, owner] = await ethers.getSigners();
    const BountyRegistry = await ethers.getContractFactory("BountyRegistryV1");
    const Verifier = await ethers.getContractFactory("Verifier");
    const verifier = await Verifier.deploy(verifierWallet.address);
    await verifier.deployed();

    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy();
    await token.deployed();

    await token.mint(deployer.address, amount);

    registry = await BountyRegistry.deploy(verifier.address);
    await registry.deployed();

    await token.approve(registry.address, amount);
  });

  it("Fund issue", async function () {
    expect(await registry.getBounty(repo, issue, token.address)).to.equal(0);

    expect(await registry.fund(repo, issue, token.address, amount)).to.emit(
      registry,
      "Funded"
    );

    expect(await registry.getBounty(repo, issue, token.address)).to.equal(
      amount
    );

    const validHash = createHash([repo, owner.address]);
    const sig = await verifierWallet.signMessage(
      ethers.utils.arrayify(validHash)
    );
    expect(
      await registry
        .connect(owner)
        .claim(repo, issue, token.address, validHash, sig)
    ).to.emit(registry, "Claimed");

    expect(await token.balanceOf(owner.address)).to.eq(amount);
  });
  it("Withdraw funds", async () => {
    expect(await token.balanceOf(deployer.address)).to.eq(amount);
    await registry.fund(repo, issue, token.address, amount);
    expect(await token.balanceOf(deployer.address)).to.eq(0);
    await expect(
      registry.withdraw(repo, issue, token.address)
    ).to.be.revertedWith("Funds are still locked");

    await ethers.provider.send("evm_increaseTime", [lockedDuration]);
    await ethers.provider.send("evm_mine", []);
    expect(await registry.withdraw(repo, issue, token.address)).to.emit(
      registry,
      "Withdraw"
    );
    // expect(await registry.getBounty(repo, issue, token.address)).to.eq(0);
    expect(await token.balanceOf(deployer.address)).to.eq(amount);

    await expect(
      registry.withdraw(repo, issue, token.address)
    ).to.be.revertedWith("Not funded");
  });

  it("Updates lockedDuration", async () => {
    await registry.setLockedDuration(1);

    // Only owner can update
    await expect(
      registry.connect(owner).setLockedDuration(1)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
