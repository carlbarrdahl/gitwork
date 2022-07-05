import { AppProps } from "next/app";
import ThemeProvider from "ui";
import { SessionProvider } from "next-auth/react";

import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

const isDev = process.env.NODE_ENV !== "production";
const { chains, provider } = configureChains(
  isDev ? [chain.hardhat, chain.optimism] : [chain.optimism],
  isDev
    ? [jsonRpcProvider({ rpc: () => ({ http: `http://localhost:8545` }) })]
    : [publicProvider()]
);

const { connectors } = getDefaultWallets({ appName: "gitwork", chains });

const wagmiClient = createClient({ autoConnect: true, connectors, provider });

wagmiClient.queryClient.setDefaultOptions({
  queries: {
    cacheTime: 1_000 * 60 * 60 * 24, // 24 hours
    networkMode: "offlineFirst",
    refetchOnWindowFocus: true,
    retry: 0,
  },
  mutations: {
    networkMode: "offlineFirst",
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1_000 * 60 * 60 * 24, // 24 hours
      refetchOnWindowFocus: true,
      retry: 0,
    },
  },
});
function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <QueryClientProvider client={queryClient}>
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
