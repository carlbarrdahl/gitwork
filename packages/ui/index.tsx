import "@fontsource/ibm-plex-mono";

import * as React from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

export * from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    logo: `'IBM Plex Mono', 'Open Sans', sans-serif`,
  },
});

export default function ThemeProvider(props: React.PropsWithChildren) {
  return <ChakraProvider theme={theme} {...props}></ChakraProvider>;
}
