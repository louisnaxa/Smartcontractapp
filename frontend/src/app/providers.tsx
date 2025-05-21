'use client';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { ReactNode, useMemo, useCallback } from 'react';

// Import des styles du wallet adapter
import '@solana/wallet-adapter-react-ui/styles.css';

export function SolanaProviders({ children }: { children: ReactNode }) {
  // Le réseau peut être défini sur 'devnet', 'testnet', ou 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;

  // Vous pouvez aussi fournir une URL personnalisée
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [network]
  );
  
  // Gestion personnalisée des erreurs
  const onError = useCallback((error: Error) => {
    // Ignorer les erreurs WalletConnectionError puisque la connexion fonctionne quand même
    if (error.name === 'WalletConnectionError') {
      console.log('Note: WalletConnectionError détecté mais ignoré car la connexion fonctionne');
      return;
    }
    console.error('Erreur de portefeuille:', error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect onError={onError}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
} 