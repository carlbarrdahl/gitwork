import React, { useMemo } from "react";
import { Text } from "ui";

import { useFunding } from "../hooks/useFund";
import { useToken } from "wagmi";
import { formatUnits } from "ethers/lib/utils";

const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;
const BountyAmount = ({ repo = "", issue = "", ...props }) => {
  const token = useToken({ address: TOKEN_ADDRESS });
  const funding = useFunding(repo, issue, TOKEN_ADDRESS);

  const bountyAmount = useMemo(
    () => formatUnits(funding.data || 0, token.data?.decimals).toString(),
    [funding.data, token.data]
  );

  return +bountyAmount ? (
    <Text as="span" {...props}>
      {bountyAmount} USDC
    </Text>
  ) : null;
};

export default BountyAmount;
