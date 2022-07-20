import BountyRegistry from "contracts/BountyRegistryV1.json";
import { erc20ABI } from "wagmi";

export const isDev = process.env.NODE_ENV !== "production";
export const contracts = {
  bountyRegistry: "bountyRegistry",
  fundingToken: "fundingToken",
};
export const config = {
  31337: {
    // TestToken
    [contracts.fundingToken]: {
      addressOrName: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      contractInterface: erc20ABI,
    },
    [contracts.bountyRegistry]: {
      addressOrName: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
      contractInterface: BountyRegistry.abi,
    },
  },
  4: {
    [contracts.bountyRegistry]: {
      addressOrName: "0x014218c033a4CC6348c7Dd8b04d203d15F9d81De",
      contractInterface: BountyRegistry.abi,
    },
  },
  10: {
    [contracts.fundingToken]: {
      // USDC
      addressOrName: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
      contractInterface: erc20ABI,
    },
    [contracts.bountyRegistry]: {
      addressOrName: "0x7ef8Dd9c5c68DF6E697091A17A6F699b204F8762",
      contractInterface: BountyRegistry.abi,
    },
  },
};

export function getContractConfig(contractName: string, chain?: number) {
  return (config[chain || (isDev ? 31337 : 10)] || {})[contractName] || {};
}
