import { config, contracts, getContractConfig } from "config";
import { ethers } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { useEffect, useMemo } from "react";
import { useQueryClient } from "react-query";

import {
  erc20ABI,
  useAccount,
  useContractEvent,
  useContractRead,
  useContractWrite,
  useNetwork,
  useToken,
  useWaitForTransaction,
} from "wagmi";
import { UseContractWriteArgs } from "wagmi/dist/declarations/src/hooks/contracts/useContractWrite";

export function useContractAddresses(contractName: string) {
  const { chain } = useNetwork();
  return getContractConfig(contractName, chain?.id);
}

export function useApprove(amount, addressOrName = "") {
  const registry = useContractAddresses(contracts.bountyRegistry);
  return useContractWriteRefresh(
    {
      addressOrName,
      contractInterface: erc20ABI,
      functionName: "approve",
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

  return useContractRead({
    addressOrName,
    contractInterface: erc20ABI,
    functionName: "allowance",
    args: [account.address, registry.addressOrName],
    enabled: registry.addressOrName && account.address,
  });
}

export function useFund() {
  const { addressOrName, contractInterface } = useContractAddresses(
    contracts.bountyRegistry
  );

  const fund = useContractWriteRefresh(
    {
      addressOrName,
      contractInterface,
      functionName: "fund",
    },
    "Funded"
  );

  return fund;
}

export function useClaim() {
  const { addressOrName, contractInterface } = useContractAddresses(
    contracts.bountyRegistry
  );

  return useContractWriteRefresh(
    { addressOrName, contractInterface, functionName: "claim" },
    "Claimed"
  );
}

export function useFunding(repo, issue, token) {
  const { addressOrName, contractInterface } = useContractAddresses(
    contracts.bountyRegistry
  );

  return useContractRead({
    addressOrName,
    contractInterface,
    functionName: "getBounty",
    args: [repo, issue, token],
    enabled: Boolean(token),
  });
}

export function useContractWriteRefresh(
  contractConfig: UseContractWriteArgs,
  eventName: string = ""
) {
  const cache = useQueryClient();
  const contract = useContractWrite(contractConfig);

  const tx = useWaitForTransaction({
    hash: contract.data?.hash,
    enabled: !!contract.data?.hash,
  });

  useEffect(() => {
    if (tx.status === "success") {
      console.log("INVAIDATE");
      cache.invalidateQueries();
    }
  }, [tx.status]);

  // Listen to event and invalidate cache
  console.log("useContractWrite", eventName, contract.data);
  useContractEvent({
    addressOrName: contractConfig.addressOrName,
    contractInterface: contractConfig.contractInterface,
    eventName,
    listener: (event) => {
      console.log("event", eventName, event);
      cache.invalidateQueries();
    },
    once: true,
  });

  return contract;
}

export function useBountyAmount(repo, issue) {
  const { addressOrName } = useContractAddresses(contracts.fundingToken);
  const token = useToken({
    address: addressOrName,
    enabled: !!addressOrName,
  });
  const funding = useFunding(repo, issue, addressOrName);

  const amount = useMemo(
    () => formatUnits(funding.data || 0, token.data?.decimals).toString(),
    [funding.data, token.data]
  );
  return { amount, symbol: token.data?.symbol };
}
