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
import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { Octokit } from "@octokit/core";

const { formatEther, parseEther } = ethers.utils;

const stateLabels = {
  open: "opened",
  closed: "closed",
};
export default function ClosedIssueTable({}: {}) {
  const { query } = useRouter();
  const session = useSession();
  const closedIssues = useQuery(
    `/repos/${query.owner}/${query.repo}/issues/events`,
    async () => {
      const octokit = new Octokit({ auth: session.data?.accessToken });
      return octokit
        .request("GET /repos/{owner}/{repo}/issues/events", {
          owner: query.owner,
          repo: query.repo,
          per_page: 100,
        })
        .then(({ data }) =>
          data.filter((e) => e.event === "closed").map((commit) => commit.issue)
        );
    },
    { enabled: !!session.data?.accessToken }
  );

  const repo = [query.owner, query.repo].join("/");
  const issues = [];
  return (
    <VStack divider={<StackDivider />} spacing={3} align="stretch">
      {closedIssues.data?.map((issue) => (
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
            <BountyAmount repo={repo} issue={issue.number} />
            <NextLink href={`/${repo}/${issue.number}/claim`}>
              <Button>Claim</Button>
            </NextLink>
          </HStack>
        </Flex>
      ))}
    </VStack>
  );
}
