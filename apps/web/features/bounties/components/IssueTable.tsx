import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
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
} from "ui";

import { GitHubIssue } from "types";
import {
  useAllowance,
  useApprove,
  useFund,
  useFunding,
} from "../hooks/useFund";
import { ethers } from "ethers";

const { formatEther, parseEther } = ethers.utils;

const FundModal = ({ repo, issue, onClose }) => {
  const { register, watch, handleSubmit } = useForm({
    defaultValues: {
      amount: null,
      token: "0x01BE23585060835E02B77ef475b0Cc51aA1e0709",
    },
  });
  const initialRef = React.useRef(null);

  const amount = watch("amount");
  const token = watch("token");

  const allowance = useAllowance(token);
  const approve = useApprove(amount, token);
  const fund = useFund();

  const allowanceAmount = useMemo(
    () => formatEther(allowance.data || 0),
    [allowance.data]
  );

  const canFund = +allowanceAmount >= (amount || 0);

  async function handleFund(values) {
    try {
      const parsedAmount = parseEther(values.amount);
      if (allowance.data?.gte(parsedAmount)) {
        console.log("Fund", repo, issue.number, values);
        fund.write({
          args: [repo, issue.number, values.token, parsedAmount.toString()],
        });
      } else {
        console.log("Approve", values);
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
              <Input {...register("token")} placeholder="USDC" />
            </FormControl>
          </ModalBody>

          <ModalFooter justifyContent={"space-between"}>
            <Text pr={4} fontSize="sm">
              Approved allowance: {allowanceAmount}
            </Text>
            <HStack>
              <Button type="submit" colorScheme="blue" mr={3}>
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

const TOKEN_ADDRESS = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709";
const FundIssue = ({ repo, issue }) => {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const funding = useFunding(repo, issue.number, TOKEN_ADDRESS);

  const fundedAmount = useMemo(
    () => formatEther(funding.data || 0).toString(),
    [funding.data]
  );

  return (
    <>
      {+fundedAmount ? <Text fontSize="sm">{fundedAmount} USDC</Text> : null}
      <Button variant={"ghost"} onClick={onOpen}>
        Fund
      </Button>
      {isOpen ? (
        <FundModal repo={repo} issue={issue} onClose={onClose} />
      ) : null}
    </>
  );
};

export default function IssueTable({ issues }: { issues: GitHubIssue[] }) {
  const { query } = useRouter();
  const [isMounting, setMounting] = useState(true);

  const repo = [query.owner, query.repo].join("/");
  useEffect(() => {
    setMounting(false);
  }, []);
  if (isMounting) {
    return null;
  }
  return (
    <VStack divider={<StackDivider />} spacing={3} align="stretch">
      {issues.map((issue) => (
        <Flex key={issue.id} justify="space-between">
          <Box flex={1}>
            <NextLink href={issue.html_url} passHref>
              <Link target={"_blank"}>
                <Heading as="h5" fontSize="md" mb={2}>
                  {issue.title}
                </Heading>
              </Link>
            </NextLink>
            <Text color={"gray.600"} fontSize="xs">
              #{issue.number} opened {issue.created_at} by{" "}
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
