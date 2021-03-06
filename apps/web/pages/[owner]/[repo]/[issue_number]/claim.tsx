import { GetServerSidePropsContext } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { Octokit } from "@octokit/core";

import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Container,
  Heading,
  HStack,
  Text,
} from "ui";

import Layout from "components/Layout";
import BountyAmount from "features/bounties/components/BountyAmount";
import Link from "next/link";
import {
  useClaim,
  useContractAddresses,
} from "features/bounties/hooks/useFund";
import { ethers } from "ethers";
import { getSession } from "next-auth/react";
import { contracts } from "config";

export default function RepoPage({ error, event, commit, hash, sig }) {
  const { addressOrName } = useContractAddresses(contracts.fundingToken);
  const router = useRouter();
  const { owner, repo, issue_number } = router.query;
  const claim = useClaim();
  async function handleClaim() {
    try {
      claim.write({
        args: [[owner, repo].join("/"), issue_number, addressOrName, hash, sig],
      });
    } catch (error) {
      console.log(error);
    }
  }
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
      {error ? <Alert>{error.message}</Alert> : null}
      {commit ? (
        <Container>
          <HStack justifyContent={"space-between"}>
            <Heading fontSize="xl">{commit.commit.message}</Heading>
            <BountyAmount
              repo={`${owner}/${repo}`}
              issue={issue_number as string}
              fontWeight="bold"
            />
          </HStack>
          <Text mb={4}>
            Completed by:{" "}
            <Link href={`/u/${commit.author.login}`}>
              {commit.author.login}
            </Link>{" "}
            at {commit.commit.author.date}
          </Text>

          <Button
            w="100%"
            onClick={handleClaim}
            isLoading={claim.isLoading}
            disabled={claim.isLoading}
          >
            Claim Bounty
          </Button>
        </Container>
      ) : null}
    </Layout>
  );
}

export async function getServerSideProps({
  req,
  query,
}: GetServerSidePropsContext) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  const WALLET_MNEMONIC = process.env.WALLET_MNEMONIC || "";

  const wallet = ethers.Wallet.fromMnemonic(WALLET_MNEMONIC);
  const session = await getSession({ req });

  const { address, owner, repo } = query;

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  try {
    const props = await octokit
      .request("GET /repos/{owner}/{repo}/issues/{issue_number}/events", {
        owner,
        repo,
        issue_number: query.issue_number,
      })
      .then(async ({ data = [] }) => {
        const event = data.find((e) => e.event === "closed");
        if (!event) return { notFound: true };

        // Find commit that closed issue
        const commit = await octokit
          .request("GET /repos/{owner}/{repo}/commits/{ref}", {
            owner,
            repo,
            ref: event.commit_id,
          })
          .then((r) => r.data);

        if (session.githubId !== commit.committer?.id) {
          return {
            props: {
              error: { message: "User not authorized to claim bounty" },
            },
          };
        }

        // Create hash and signature
        const hash = ethers.utils.solidityKeccak256(
          ["bytes"],
          [ethers.utils.solidityPack(["string", "address"], [repo, address])]
        );
        const sig = await wallet.signMessage(ethers.utils.arrayify(hash));

        return { props: { event, commit, hash, sig } };
      });

    return props;
  } catch (error) {
    return { props: { error: { message: error.message } } };
  }

  return { props: {} };
}
