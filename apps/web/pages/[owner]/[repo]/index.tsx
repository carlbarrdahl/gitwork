import { GetServerSidePropsContext } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { Octokit } from "@octokit/core";

import { Button, Breadcrumb, BreadcrumbItem, BreadcrumbLink, HStack } from "ui";

import { GitHubIssue } from "types";
import IssueTable from "features/bounties/components/IssueTable";
import Layout from "components/Layout";

export default function RepoPage({ issues = [] }) {
  const router = useRouter();
  const { owner, repo } = router.query;
  return (
    <Layout>
      <HStack justify="space-between" mb={8}>
        <Breadcrumb fontSize={"xl"} color="blue.600">
          <BreadcrumbItem>
            <NextLink href={`/${owner}`} passHref>
              <BreadcrumbLink>{owner}</BreadcrumbLink>
            </NextLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <NextLink href={`/${owner}/${repo}`} passHref>
              <BreadcrumbLink>{repo}</BreadcrumbLink>
            </NextLink>
          </BreadcrumbItem>
        </Breadcrumb>
        <NextLink
          href={`https://github.com/${owner}/${repo}/issues/new/choose`}
          passHref
        >
          <a target="_blank">
            <Button>New issue</Button>
          </a>
        </NextLink>
      </HStack>
      <IssueTable issues={issues} />
    </Layout>
  );
}

export async function getServerSideProps({ query }: GetServerSidePropsContext) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  const { owner, repo } = query;
  let issues = [];
  try {
    const data = await octokit.request("GET /repos/{owner}/{repo}/issues", {
      owner,
      repo,
    });
    issues = (data?.data || [])
      // Hide Pull Requests
      .filter((i: GitHubIssue) => !i.pull_request);
  } catch (error) {
    console.log(error);
  }

  return { props: { issues } };
}
