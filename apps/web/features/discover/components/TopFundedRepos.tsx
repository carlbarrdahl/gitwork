import { Octokit } from "@octokit/core";
import { useSession } from "next-auth/react";
import NextLink from "next/link";
import { useQuery } from "react-query";
import { Box, Flex, Heading, HStack, SimpleGrid, Text, VStack } from "ui";
import { useIssues, useRepos } from "../hooks/useSubgraph";

function RepoList({ title, orderBy }) {
  const repos = useRepos({ orderBy });
  return (
    <Box>
      <Heading size={"sm"} fontFamily="mono" color="gray.600" mb={3}>
        {title}
      </Heading>
      <VStack spacing={4} align="stretch">
        {(repos.data || []).map((item, i) => (
          <Flex key={i} justify="space-between">
            <Box flex={1} cursor="pointer">
              <NextLink href={`/${item.id}`} passHref>
                <Box as="a">
                  <Heading as="h5" fontSize="md">
                    {item.id}
                  </Heading>
                  <Text fontSize="xs" color="gray.500">
                    {new Date(item.lastFunded * 1000).toISOString()}
                  </Text>
                </Box>
              </NextLink>
            </Box>
            <HStack>
              <Text color="gray.600">{item.funded / 10e5} USDC</Text>
            </HStack>
          </Flex>
        ))}
      </VStack>
    </Box>
  );
}

const IssueTitle = ({ repo, number }) => {
  const session = useSession();
  const [owner, _repo] = repo.split("/");
  const issue = useQuery(["issues", repo, number], async () => {
    const octokit = new Octokit({ auth: session.data?.accessToken });
    return octokit
      .request("GET /repos/{owner}/{repo}/issues/{issue_number}", {
        owner,
        repo: _repo,
        issue_number: number,
      })
      .then((r) => r.data);
  });

  return (
    <Text>
      #{number} {issue.data?.title}
    </Text>
  );
};
function IssueList({ title, orderBy }) {
  const issues = useIssues({ orderBy });
  return (
    <Box>
      <Heading size={"sm"} fontFamily="mono" color="gray.600" mb={3}>
        {title}
      </Heading>
      <VStack spacing={4} align="stretch">
        {(issues.data || []).map((item, i) => {
          return (
            <Flex key={i} justify="space-between">
              <Box flex={1} cursor="pointer">
                <NextLink href={`/${item.repo.id}`} passHref>
                  <Box as="a">
                    <Heading as="h5" fontSize="md">
                      <IssueTitle repo={item.repo.id} number={item.number} />
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                      {item.repo?.id}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {new Date(item.lastFunded * 1000).toISOString()}
                    </Text>
                  </Box>
                </NextLink>
              </Box>
              <HStack>
                <Text color="gray.600">{item.amount / 10e5} USDC</Text>
              </HStack>
            </Flex>
          );
        })}
      </VStack>
    </Box>
  );
}

export default function TopFundedRepos() {
  return (
    <SimpleGrid columns={[2]} spacing={8}>
      <RepoList title="Top funded repos" orderBy="fundedAmount" />
      <IssueList title="Top funded issues" orderBy="fundedAmount" />
      <RepoList title="Recently funded repos" orderBy="lastFunded" />
      <IssueList title="Recently funded issues" orderBy="lastFunded" />
    </SimpleGrid>
  );
}
