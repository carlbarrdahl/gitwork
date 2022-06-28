import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
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
  FocusLock,
  IconButton,
  Select,
  useQuery,
  NumberInput,
  NumberInputField,
  HStack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
} from "ui";

import { GitHubIssue } from "types";

const FundIssue = ({ repo, onFund }) => {
  const [selected, select] = useState("");
  const { onOpen, onClose, isOpen } = useDisclosure();
  const initialRef = React.useRef(null);
  //   return <Button variant={"ghost"}>Fund</Button>;

  return (
    <>
      <Button variant={"ghost"} onClick={onOpen}>
        Fund
      </Button>
      <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Fund issue</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Amount</FormLabel>
              <Input ref={initialRef} placeholder="$50" />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Token</FormLabel>
              <Input placeholder="USDC" />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3}>
              Fund
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default function IssueTable({ issues }: { issues: GitHubIssue[] }) {
  console.log(issues);
  const { query } = useRouter();
  console.log(query);
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
            <Text fontSize="sm">110 USDC</Text>
            <FundIssue />
          </HStack>
          {/* <Flex>
            <NumberInput>
              <NumberInputField />
            </NumberInput>
            <Select>
              <option>USDC</option>
            </Select>
          </Flex> */}
        </Flex>
      ))}
    </VStack>
  );
}
