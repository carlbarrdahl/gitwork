import * as React from "react";
import { ChakraProvider } from "@chakra-ui/react";

export * from "@chakra-ui/react";

export default function ThemeProvider(props: React.PropsWithChildren) {
  return <ChakraProvider {...props}></ChakraProvider>;
}
