import Layout from "components/Layout";
import { useRouter } from "next/router";
import { PropsWithChildren } from "react";
import { Heading } from "ui";

export default function UserPage(props: PropsWithChildren) {
  const { query } = useRouter();
  return (
    <Layout>
      <Heading>{query.owner}</Heading>
    </Layout>
  );
}
