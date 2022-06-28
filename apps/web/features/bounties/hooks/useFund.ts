import { config, contracts } from "config";
import { ethers } from "ethers";
import {
  erc20ABI,
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  useWaitForTransaction,
} from "wagmi";

export function useContractAddresses(contractName: string) {
  const { activeChain } = useNetwork();
  const chain = activeChain?.id || 31337;
  const contract = config[chain][contractName] || {};
  //   if (!contract) throw new Error("Contract not found: " + contractName);
  return contract;
}

export function useApprove(amount, addressOrName = "") {
  const registry = useContractAddresses(contracts.bountyRegistry);
  return useContractWriteRefresh(
    { addressOrName, contractInterface: erc20ABI },
    "approve",
    {
      args: [
        registry.addressOrName,
        ethers.utils.parseEther(amount || "0").toString(),
      ],
    },
    "Approval"
  );
}

export function useAllowance(addressOrName) {
  const account = useAccount();
  const registry = useContractAddresses(contracts.bountyRegistry);

  return useContractRead(
    { addressOrName, contractInterface: erc20ABI },
    "allowance",
    {
      args: [account.data?.address, registry.addressOrName],
      enabled: registry.addressOrName && account.data?.address,
    }
  );
}

export function useFund() {
  const { addressOrName, contractInterface } = useContractAddresses(
    contracts.bountyRegistry
  );

  const fund = useContractWriteRefresh(
    { addressOrName, contractInterface },
    "fund",
    {},
    "Funded"
  );

  return fund;
}

export function useFunding(repo, issue, token) {
  const { addressOrName, contractInterface } = useContractAddresses(
    contracts.bountyRegistry
  );

  return useContractRead({ addressOrName, contractInterface }, "getBounty", {
    args: [repo, issue, token],
    enabled: Boolean(token),
  });
}

export function useContractWriteRefresh(
  contractConfig,
  method: string,
  opts,
  eventName: string = ""
) {
  const contract = useContractWrite(contractConfig, method, opts);

  // Listen to event and invalidate cache
  //   useContractEvent(
  //     contractConfig,
  //     eventName,
  //     (e) => {
  //       console.log("Event received", eventName, e);
  //       cache.invalidateQueries();
  //     },
  //     {
  //       once: true,
  //     }
  //   );

  return contract;
}
