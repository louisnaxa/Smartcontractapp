'use client';

import { useState, FormEvent } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, createInitializeMintInstruction, createMintToInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';

// Adresse du programme, à remplacer par l'adresse réelle après le déploiement
const PROGRAM_ID = new PublicKey('M7sbwHarEXWzCxDHrc4Fx4pSxED2ghffrgpm2aHLyEJ');

interface TokenFormProps {
  onSuccess: (mintAddress: string) => void;
}

export function TokenForm({ onSuccess }: TokenFormProps) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDecimals, setTokenDecimals] = useState('9');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      setError('Portefeuille non connecté');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Créer un nouveau keypair pour le compte de mint
      const mintKeypair = Keypair.generate();
      const decimals = parseInt(tokenDecimals);
      
      console.log(`Adresse du Mint: ${mintKeypair.publicKey.toBase58()}`);
      
      // 1. Première transaction - Initialiser le Mint
      const initMintTx = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: 82, // Taille du compte Mint
          lamports: await connection.getMinimumBalanceForRentExemption(82),
          programId: TOKEN_PROGRAM_ID
        }),
        createInitializeMintInstruction(
          mintKeypair.publicKey,   // mint pubkey
          decimals,                // decimals
          publicKey,               // mint authority
          publicKey                // freeze authority
        )
      );

      // Définir les paramètres de transaction
      initMintTx.feePayer = publicKey;
      initMintTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      // Signer avec le mintKeypair
      initMintTx.sign(mintKeypair);
      
      // Envoyer au portefeuille pour signature et soumission
      const initSignature = await sendTransaction(initMintTx, connection);
      console.log(`Transaction d'initialisation de Mint envoyée: ${initSignature}`);
      
      // Attendre la confirmation
      await connection.confirmTransaction(initSignature, 'confirmed');
      console.log(`Transaction d'initialisation de Mint confirmée`);
      
      // 2. Deuxième transaction - Créer le compte associé et frapper les jetons
      // Trouver l'adresse du compte de jetons associé
      const tokenAccount = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        publicKey
      );
      
      const mintTx = new Transaction();
      
      // Ajouter l'instruction pour créer le compte de jeton associé
      mintTx.add(
        createAssociatedTokenAccountInstruction(
          publicKey,               // payer
          tokenAccount,            // associated token account address
          publicKey,               // owner
          mintKeypair.publicKey    // mint
        )
      );
      
      // Ajouter l'instruction pour frapper un montant initial
      const initialSupply = 1000000000; // 1 token avec 9 décimales
      mintTx.add(
        createMintToInstruction(
          mintKeypair.publicKey,   // mint
          tokenAccount,            // destinataire
          publicKey,               // mint authority
          initialSupply            // montant
        )
      );
      
      // Envoyer la deuxième transaction
      const mintSignature = await sendTransaction(mintTx, connection);
      console.log(`Transaction de frappe envoyée: ${mintSignature}`);
      
      // Attendre la confirmation
      await connection.confirmTransaction(mintSignature, 'confirmed');
      console.log(`Transaction de frappe confirmée`);
      
      // Appeler onSuccess avec l'adresse du mint
      onSuccess(mintKeypair.publicKey.toBase58());
      
    } catch (err) {
      console.error('Erreur lors de la création du jeton:', err);
      setError(`Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="tokenName" className="block text-sm font-medium mb-1">
          Nom du jeton
        </label>
        <input
          id="tokenName"
          type="text"
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
          required
          className="w-full p-2 rounded-md bg-black/30 border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Mon Super Jeton"
        />
      </div>
      
      <div>
        <label htmlFor="tokenSymbol" className="block text-sm font-medium mb-1">
          Symbole du jeton
        </label>
        <input
          id="tokenSymbol"
          type="text"
          value={tokenSymbol}
          onChange={(e) => setTokenSymbol(e.target.value)}
          required
          className="w-full p-2 rounded-md bg-black/30 border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="MSJ"
          maxLength={10}
        />
      </div>
      
      <div>
        <label htmlFor="tokenDecimals" className="block text-sm font-medium mb-1">
          Décimales
        </label>
        <input
          id="tokenDecimals"
          type="number"
          value={tokenDecimals}
          onChange={(e) => setTokenDecimals(e.target.value)}
          required
          min="0"
          max="9"
          className="w-full p-2 rounded-md bg-black/30 border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs mt-1 text-gray-400">
          Standard recommandé: 9 (comme SOL)
        </p>
      </div>
      
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={isSubmitting || !publicKey}
        className="w-full py-2 px-4 bg-purple-600 rounded-md font-medium hover:bg-purple-700 transition-colors disabled:bg-purple-800/50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Création en cours...' : 'Créer le jeton'}
      </button>
    </form>
  );
} 