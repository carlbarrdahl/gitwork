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
  10: {
    [contracts.bountyRegistry]: {
      addressOrName: "0x8171bb4B063c34e33B839FEB895aAdA3a57b880D",
      contractInterface: BountyRegistry.abi,
    },
  },
};

export const tokens = {
  4: {
    LINK: {
      symbol: "LINK",
      address: "0x01BE23585060835E02B77ef475b0Cc51aA1e0709",
    },
  },
};
