import Link from "next/link";
import { PropsWithChildren, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Box, Button, Container, Flex } from "ui";
import { useEffect } from "react";

export default function Layout(props: PropsWithChildren) {
  return (
    <Container maxW={"container.lg"}>
      <Flex as="header" py={4} justifyContent="space-between">
        <NavLink href={"/"}>Bounties</NavLink>

        <ConnectButton />
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
