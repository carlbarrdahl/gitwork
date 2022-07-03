import Link from "next/link";
import { PropsWithChildren, useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Box, Button, Container, Flex, HStack, Text } from "ui";
import ConnectGithub from "features/auth/components/ConnectGithub";

export default function Layout(props: PropsWithChildren) {
  const [isMounting, setMounting] = useState(true);

  // Fixes Error: Text content does not match server-rendered HTML.
  useEffect(() => {
    setMounting(false);
  }, []);
  if (isMounting) {
    return null;
  }

  return (
    <Container maxW={"container.lg"}>
      <Flex as="header" py={4} justifyContent="space-between">
        <HStack>
          <Text fontSize={"sm"} fontWeight="bold">
            .gitwork
          </Text>
          <NavLink href={"/"}>Bounties</NavLink>
        </HStack>
        <HStack>
          <ConnectGithub />
          <ConnectButton />
        </HStack>
      </Flex>
      <Box py={4}>{props.children}</Box>
    </Container>
  );
}

const NavLink = ({ href = "", ...props }) => (
  <Link href={href}>
    <Button variant={"ghost"} {...props} />
  </Link>
);
