import Layout from "components/Layout";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import {
  Box,
  Container,
  FormControl,
  Heading,
  HStack,
  Input,
  List,
  ListItem,
  Link,
  FormErrorMessage,
  Flex,
} from "ui";

export default function Web() {
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm();
  const { repo: inputError } = formState.errors;
  return (
    <Layout>
      <Container>
        <Box mb={8} textAlign="center">
          <Heading fontWeight={"normal"} fontSize={"6xl"} fontFamily="logo">
            .gitwork
          </Heading>
        </Box>
        <Flex
          mb={8}
          as="form"
          onSubmit={handleSubmit(({ repo }) => {
            // Validate actual GitHub repo
            router.push(`/${repo}`);
          })}
        >
          <FormControl isInvalid={!!inputError} mr={2}>
            <Input
              {...register("repo", {
                required: true,
                pattern: {
                  value: /([a-zA-Z0-9_.-]{2,}\/[a-zA-Z0-9_.-]{2,})\w+/,
                  message: "Must be a valid repo path (owner/repo)",
                },
              })}
              placeholder="Enter GitHub owner/repo"
            />
            <FormErrorMessage>{inputError?.message as string}</FormErrorMessage>
          </FormControl>
        </Flex>
        <Box py={4}>
          <Heading fontSize={"md"} mb={2}>
            Or check out one of these:
          </Heading>
          <List>
            {[
              "trpc/trpc",
              "scaffold-eth/scaffold-eth",
              "vercel/next.js",
              "vercel/turborepo",
              "nextauthjs/next-auth",
              "ethers-io/ethers.js",
              "tmm/wagmi",
              "rainbow-me/rainbowkit",
              "carlbarrdahl/gitwork",
            ].map((ex) => (
              <NextLink href={`/${ex}`} key={ex} passHref>
                <Link>
                  <ListItem fontSize={"lg"}>{ex}</ListItem>
                </Link>
              </NextLink>
            ))}
          </List>
        </Box>
      </Container>
    </Layout>
  );
}
