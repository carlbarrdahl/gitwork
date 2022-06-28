import { GetServerSidePropsContext } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { Octokit } from "@octokit/core";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "ui";

import { GitHubIssue } from "types";
import IssueTable from "features/bounties/components/IssueTable";
import Layout from "components/Layout";

export default function RepoPage({ issues = [] }) {
  const router = useRouter();
  const { owner, repo } = router.query;
  return (
    <Layout>
      <Breadcrumb fontSize={"xl"} color="blue.600" mb={8}>
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
