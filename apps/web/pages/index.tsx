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
  LinkOverlay,
  FormErrorMessage,
  Flex,
  Text,
  VStack,
  StackDivider,
} from "ui";

export default function Web() {
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm();
  const { repo: inputError } = formState.errors;
  return (
    <Layout>
      <Container mb={8}>
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
          <HStack align={"flex-start"}>
            <List w={["50%"]}>
              {[
                "trpc/trpc",
                "scaffold-eth/scaffold-eth",
                "vercel/next.js",
                "nextauthjs/next-auth",
              ].map((ex) => (
                <NextLink href={`/${ex}`} key={ex} passHref>
                  <Link>
                    <ListItem fontSize={"lg"}>{ex}</ListItem>
                  </Link>
                </NextLink>
              ))}
            </List>
            <List w={["50%"]}>
              {[
                "carlbarrdahl/gitwork",
                "ethers-io/ethers.js",
                "tmm/wagmi",
                "rainbow-me/rainbowkit",
              ].map((ex) => (
                <NextLink href={`/${ex}`} key={ex} passHref>
                  <Link>
                    <ListItem fontSize={"lg"}>{ex}</ListItem>
                  </Link>
                </NextLink>
              ))}
            </List>
          </HStack>
        </Box>
      </Container>
      <HStack align={"flex-start"} spacing={8}>
        <Box w="50%">
          <Heading
            size={"sm"}
            fontFamily="mono"
            // fontWeight="thin"
            color="gray.600"
            mb={3}
            // textTransform="uppercase"
          >
            Recently funded repos
          </Heading>
          <VStack
            // divider={<StackDivider />}
            spacing={4}
            align="stretch"
          >
            {[
              {
                repo: "carlbarrdahl/gitwork",
                amount: 850,
                fundedAt: "10 minutes ago",
              },
              {
                repo: "another/repo",
                amount: 500,
                fundedAt: "23 minutes ago",
              },
            ].map((item, i) => (
              <Flex key={i} justify="space-between">
                <Box flex={1}>
                  <NextLink href={"/"} passHref>
                    <LinkOverlay>
                      <Heading as="h5" fontSize="md">
                        {item.repo}
                      </Heading>
                      <Text fontSize="xs" color="gray.500">
                        {item.fundedAt}
                      </Text>
                    </LinkOverlay>
                  </NextLink>
                </Box>
                <HStack>
                  <Text color="gray.600">{item.amount} USDC</Text>
                </HStack>
              </Flex>
            ))}
          </VStack>
        </Box>
        <Box w="50%">
          <Heading
            size={"sm"}
            fontFamily="mono"
            // fontWeight="thin"
            color="gray.600"
            mb={3}
            // textTransform="uppercase"
          >
            Recently funded issues
          </Heading>
          <VStack
            // divider={<StackDivider />}
            spacing={4}
            align="stretch"
          >
            {[
              {
                repo: "carlbarrdahl/gitwork",
                issue: "#22 Subgraph",
                amount: 250,
                fundedAt: "10 minutes ago",
              },
              {
                repo: "carlbarrdahl/gitwork",
                issue: "#30 Project page",
                amount: 100,
                fundedAt: "25 minutes ago",
              },
            ].map((item, i) => (
              <Flex key={i} justify="space-between">
                <Box flex={1}>
                  <NextLink href={"/"} passHref>
                    <LinkOverlay>
                      <Heading as="h5" fontSize="md">
                        {item.issue}
                      </Heading>
                      <Text fontSize="sm" color="gray.600">
                        {item.repo}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {item.fundedAt}
                      </Text>
                    </LinkOverlay>
                  </NextLink>
                </Box>
                <HStack>
                  <Text color="gray.600">{item.amount} USDC</Text>
                </HStack>
              </Flex>
            ))}
          </VStack>
        </Box>
      </HStack>
    </Layout>
  );
}
