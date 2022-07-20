import { request, gql } from "graphql-request";
import { useQuery } from "react-query";

// const endpoint = "https://api.thegraph.com/subgraphs/name/carlbarrdahl/gitwork";
const endpoint =
  "https://api.thegraph.com/subgraphs/id/QmQWUmSMbHPXekC9SCMgMMePu3AQS6in18czxHPPcdfy5C";

export const repoQuery = gql`
  {
    repos(first: 10, orderBy: $orderBy) {
      id
      funded
      lastFunded
      issues {
        id
        amount
        lastFunded
        bounties {
          id
          funders {
            id
          }
        }
      }
    }
  }
`;
const issueQuery = gql`
  {
    issues(first: 10, orderBy: $orderBy) {
      id
      number
      repo {
        id
      }
      amount
      lastFunded
      bounties {
        id
        funders {
          id
        }
      }
    }
  }
`;
export function useRepos({ orderBy }) {
  return useQuery([`repos/${orderBy}`], async () => {
    return request(endpoint, repoQuery, { orderBy }).then((r) => r.repos);
  });
}

export function useIssues({ orderBy }) {
  return useQuery([`issues/${orderBy}`], async () => {
    return request(endpoint, issueQuery, { orderBy }).then((r) => r.issues);
  });
}
