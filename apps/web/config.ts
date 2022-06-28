import BountyRegistry from "contracts/BountyRegistryV1.json";

export const contracts = {
  bountyRegistry: "bountyRegistry",
};
export const config = {
  31337: {},
  4: {
    [contracts.bountyRegistry]: {
      addressOrName: "0x014218c033a4CC6348c7Dd8b04d203d15F9d81De",
      contractInterface: BountyRegistry.abi,
    },
  },
};

// export const contractTypes = {
//   project: Project.abi,
//   bountyRegi: ProjectFactory.abi,
//   token: ERC20Token.abi,
// };
