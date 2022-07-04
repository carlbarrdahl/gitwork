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
      addressOrName: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
      contractInterface: erc20ABI,
    },
    [contracts.bountyRegistry]: {
      addressOrName: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
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
      addressOrName: "0x8171bb4B063c34e33B839FEB895aAdA3a57b880D",
      contractInterface: BountyRegistry.abi,
    },
  },
};

export function getContractConfig(contractName: string, chain?: number) {
  return (config[chain || (isDev ? 31337 : 10)] || {})[contractName] || {};
}
