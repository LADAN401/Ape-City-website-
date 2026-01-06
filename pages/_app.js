import '../styles/globals.css';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { base } from 'wagmi/chains';

const config = getDefaultConfig({
  appName: 'Ape City Launchpad',
  projectId: 'a6ab4cf5e4661087637efd46546bb172', // Your provided WalletConnect Project ID
  chains: [base],
});

function MyApp({ Component, pageProps }) {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiProvider>
  );
}

export default MyApp;
