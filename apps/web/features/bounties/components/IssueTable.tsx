import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  VStack,
  Flex,
  Box,
  Heading,
  Text,
  StackDivider,
  Button,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  NumberInput,
  NumberInputField,
  HStack,
  useToast,
} from "ui";

import { useToken } from "wagmi";
import { GitHubIssue } from "types";
import {
  useAllowance,
  useApprove,
  useContractAddresses,
  useFund,
  useFunding,
} from "../hooks/useFund";
import { ethers } from "ethers";
import BountyAmount from "./BountyAmount";
import { parseUnits } from "ethers/lib/utils";
import { contracts } from "config";

const { formatEther, parseEther } = ethers.utils;

const FundModal = ({ repo, issue, onClose }) => {
  const { addressOrName: fundingToken } = useContractAddresses(
    contracts.fundingToken
  );
  const token = useToken({ address: fundingToken });
  const { register, watch, handleSubmit } = useForm({
    defaultValues: { amount: null },
  });
  const initialRef = React.useRef(null);

  const amount = watch("amount");

  const allowance = useAllowance(fundingToken);
  const approve = useApprove(amount, fundingToken);
  const fund = useFund();

  const allowanceAmount = useMemo(
    () => formatEther(allowance.data || 0),
    [allowance.data]
  );

  const canFund = +allowanceAmount >= (amount || 0);

  async function handleFund({ amount }: any) {
    try {
      const parsedAmount = parseUnits(amount, token.data?.decimals);
      if (allowance.data?.gte(parsedAmount)) {
        console.log("Fund", repo, issue.number, parsedAmount.toString());
        fund
          .writeAsync({
            args: [repo, issue.number, fundingToken, parsedAmount.toString()],
          })
          .then(onClose);
      } else {
        console.log("Approve", amount, token.data);
        approve.write();
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Modal initialFocusRef={initialRef} isOpen onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(handleFund)}>
          <ModalHeader>
            Fund #{issue.number} {issue.title}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Amount</FormLabel>
              <NumberInput min={0.01} step={0.1}>
                <NumberInputField
                  autoFocus
                  {...register("amount", { required: true })}
                />
              </NumberInput>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Token</FormLabel>
              <Input readOnly value={token.data?.symbol} />
            </FormControl>
          </ModalBody>

          <ModalFooter justifyContent={"space-between"}>
            <Text pr={4} fontSize="sm">
              Approved allowance: {allowanceAmount}
            </Text>
            <HStack>
              <Button
                type="submit"
                colorScheme="blue"
                mr={3}
                isLoading={approve.isLoading || fund.isLoading}
                disabled={approve.isLoadng || fund.isLoading}
              >
                {canFund ? "Fund" : "Approve"}
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

const FundIssue = ({ repo, issue }) => {
  const { addressOrName: fundingToken } = useContractAddresses(
    contracts.fundingToken
  );
  const { onOpen, onClose, isOpen } = useDisclosure();
  const funding = useFunding(repo, issue.number, fundingToken);

  return (
    <>
      <BountyAmount repo={repo} issue={issue.number} />
      <Button variant={"ghost"} onClick={onOpen}>
        Fund
      </Button>
      {isOpen ? (
        <FundModal repo={repo} issue={issue} onClose={onClose} />
      ) : null}
    </>
  );
};

const stateLabels = {
  open: "opened",
  closed: "closed",
};
export default function IssueTable({ issues }: { issues: GitHubIssue[] }) {
  const { query } = useRouter();

  const repo = [query.owner, query.repo].join("/");

  return (
    <VStack divider={<StackDivider />} spacing={3} align="stretch">
      {issues.map((issue) => (
        <Flex key={issue.id} justify="space-between">
          <Box flex={1}>
            <NextLink href={issue.html_url} passHref>
              <Link target="_blank">
                <Heading as="h5" fontSize="md" mb={2}>
                  {issue.title}
                </Heading>
              </Link>
            </NextLink>
            <Text color={"gray.600"} fontSize="xs">
              #{issue.number} {stateLabels[issue.state] || issue.state}{" "}
              {issue.created_at} by{" "}
              <NextLink href={`/${issue.user.login}`} passHref>
                <Link>{issue.user.login}</Link>
              </NextLink>
            </Text>
          </Box>
          <HStack>
            <FundIssue repo={repo} issue={issue} />
          </HStack>
        </Flex>
      ))}
    </VStack>
  );
}
