'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { TokenForm } from '../components/TokenForm';
import { MintTokens } from '../components/MintTokens';
import Image from 'next/image';
import { ClientWalletButton } from '../components/ClientWalletButton';

export default function Home() {
  const { publicKey, connected } = useWallet();
  const [mintAddress, setMintAddress] = useState<string | null>(null);

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gradient-to-br from-purple-900 to-blue-900 text-white">
      <div className="w-full max-w-4xl flex flex-col items-center gap-8">
        <header className="w-full flex justify-between items-center py-4">
          <h1 className="text-3xl font-bold">SPL Token Minter</h1>
          <ClientWalletButton />
        </header>

        <div className="w-full bg-black/20 backdrop-blur-sm rounded-xl p-6 shadow-xl">
          {!connected ? (
            <div className="flex flex-col items-center gap-6 py-12">
              <Image 
                src="/solana-logo.png" 
                alt="Solana Logo" 
                width={120} 
                height={120}
                className="opacity-70"
              />
              <h2 className="text-2xl font-medium text-center">
                Connectez votre portefeuille pour commencer
              </h2>
              <p className="text-center text-gray-300 max-w-md">
                Cette application vous permet de créer vos propres jetons SPL sur le réseau Solana Devnet
              </p>
              <ClientWalletButton />
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="bg-purple-800/30 p-4 rounded-lg text-sm">
                <p>Portefeuille connecté: <span className="font-mono">{publicKey?.toBase58()}</span></p>
                <p className="mt-1 text-yellow-300">Réseau: Devnet</p>
              </div>
              
              {!mintAddress ? (
                <div>
                  <h2 className="text-xl font-medium mb-4">Créer un nouveau jeton SPL</h2>
                  <TokenForm onSuccess={setMintAddress} />
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-medium mb-4">Frapper des jetons</h2>
                  <p className="mb-4 text-sm">
                    Adresse du jeton: <span className="font-mono text-green-300">{mintAddress}</span>
                  </p>
                  <MintTokens mintAddress={mintAddress} />
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="mt-auto pt-8 text-center text-sm text-gray-400">
          <p>SPL Token Minter - Développé pour Solana</p>
        </footer>
      </div>
    </main>
  );
}
