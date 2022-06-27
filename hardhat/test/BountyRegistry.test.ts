import { expect } from "chai";
import { ethers } from "hardhat";
const { getMnemonicWallet } = require("../utils/getMnemonicWallet");

function createHash(values: [string, string]) {
  return ethers.utils.solidityKeccak256(
    ["bytes"],
    [ethers.utils.solidityPack(["string", "address"], values)]
  );
}

describe("BountyRegistry", function () {
  beforeEach(async () => {});
  const verifierWallet = getMnemonicWallet();

  const repo = "test";
  const issue = "123";
  const amount = ethers.utils.parseEther("1");

  it("Fund issue", async function () {
    const [deployer, owner] = await ethers.getSigners();
    const BountyRegistry = await ethers.getContractFactory("BountyRegistryV1");
    const Verifier = await ethers.getContractFactory("Verifier");
    const verifier = await Verifier.deploy(verifierWallet.address);
    await verifier.deployed();

    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();
    await token.deployed();

    await token.mint(deployer.address, amount);
    const registry = await BountyRegistry.deploy(verifier.address);
    await registry.deployed();

    expect(await registry.getBounty(repo, issue, token.address)).to.equal(0);

    await token.approve(registry.address, amount);

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
});
