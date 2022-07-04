import React, { useMemo } from "react";
import { Text } from "ui";

import { useContractAddresses, useFunding } from "../hooks/useFund";
import { useToken } from "wagmi";
import { formatUnits } from "ethers/lib/utils";
import { contracts } from "config";

const BountyAmount = ({ repo = "", issue = "", ...props }) => {
  const { addressOrName } = useContractAddresses(contracts.fundingToken);
  const token = useToken({
    address: addressOrName,
    enabled: !!addressOrName,
  });
  const funding = useFunding(repo, issue, addressOrName);

  const bountyAmount = useMemo(
    () => formatUnits(funding.data || 0, token.data?.decimals).toString(),
    [funding.data, token.data]
  );
  return +bountyAmount ? (
    <Text as="span" {...props}>
      {bountyAmount} {token.data?.symbol}
    </Text>
  ) : null;
};

export default BountyAmount;
