import Link from "next/link";
import { PropsWithChildren, useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "ui";

import { HamburgerIcon, BellIcon } from "ui/icons";

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
      <Flex as="header" py={0} justifyContent="space-between">
        <HStack>
          <Link href={"/"}>
            <Text
              fontFamily={"logo"}
              fontSize={"sm"}
              letterSpacing={1}
              p={3}
              sx={{
                cursor: "pointer",
                "&:hover": { opacity: 0.6 },
              }}
            >
              &gt; .gitwork
            </Text>
          </Link>
          <NavLink href={"/"}>Bounties</NavLink>
        </HStack>
        <HStack display={["none", "none", "flex"]}>
          <Box>
            <ConnectButton showBalance={false} />
          </Box>
          <Box>
            <ConnectGithub />
          </Box>
        </HStack>
        <Menu colorScheme="white">
          <MenuButton
            display={["block", "block", "none"]}
            as={IconButton}
            aria-label="Menu"
            icon={<HamburgerIcon />}
          />
          <MenuList>
            <MenuItem>
              <ConnectButton showBalance={false} />
            </MenuItem>
            <MenuItem>
              <ConnectGithub w="100%" variant="ghost" />
            </MenuItem>
          </MenuList>
        </Menu>
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
