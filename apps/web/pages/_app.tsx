import { AppProps } from "next/app";
import ThemeProvider from "ui";
import { SessionProvider } from "next-auth/react";

import "@rainbow-me/rainbowkit/styles.css";
import { QueryClientProvider } from "react-query";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

const isDev = process.env.NODE_ENV !== "production";

const { chains, provider } = configureChains(
  isDev ? [chain.hardhat] : [chain.optimism],
  isDev
    ? [jsonRpcProvider({ rpc: () => ({ http: `http://localhost:8545` }) })]
    : [publicProvider()]
);

const { connectors } = getDefaultWallets({ appName: "gitwork", chains });

const wagmiClient = createClient({ autoConnect: true, connectors, provider });

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <QueryClientProvider client={wagmiClient.queryClient}>
        <RainbowKitProvider chains={chains}>
          <ThemeProvider>
            <SessionProvider session={session}>
              <Component {...pageProps} />
            </SessionProvider>
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
export default MyApp;
