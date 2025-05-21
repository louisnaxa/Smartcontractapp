'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import dynamic from 'next/dynamic';

// Wrapper pour le composant WalletMultiButton qui sera uniquement rendu côté client
export const ClientWalletButton = dynamic(
  () => Promise.resolve(
    () => <WalletMultiButton />
  ),
  { ssr: false }
); 