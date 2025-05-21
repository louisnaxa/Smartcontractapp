'use client';

import { useState, FormEvent } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createMintToInstruction, getAssociatedTokenAddress } from '@solana/spl-token';

interface MintTokensProps {
  mintAddress: string;
}

export function MintTokens({ mintAddress }: MintTokensProps) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  const [amount, setAmount] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      setError('Portefeuille non connecté');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setTxSignature(null);

      // Convertir l'adresse du mint en PublicKey
      const mintPubkey = new PublicKey(mintAddress);
      
      // Trouver l'adresse du compte de jetons associé
      const tokenAccount = await getAssociatedTokenAddress(
        mintPubkey,
        publicKey
      );
      
      // Calculer le montant avec les décimales (par défaut 9)
      const decimals = 9;
      const mintAmount = Math.floor(parseFloat(amount) * Math.pow(10, decimals));
      
      // Créer une transaction manuelle
      const transaction = new Transaction();
      
      // Ajouter l'instruction pour frapper de nouveaux jetons
      transaction.add(
        createMintToInstruction(
          mintPubkey,              // mint
          tokenAccount,            // destination
          publicKey,               // mint authority
          mintAmount               // montant
        )
      );
      
      // Envoyer la transaction
      const signature = await sendTransaction(transaction, connection);
      
      console.log(`Transaction envoyée: ${signature}`);
      
      // Attendre la confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log(`Transaction confirmée: ${signature}`);
      setTxSignature(signature);
      
    } catch (err) {
      console.error('Erreur lors de la frappe des jetons:', err);
      setError(`Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-1">
            Quantité à frapper
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0.000000001"
            step="any"
            className="w-full p-2 rounded-md bg-black/30 border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {txSignature && (
          <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-md text-sm">
            Transaction réussie! <a 
              href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:underline"
            >
              Voir dans l'explorateur →
            </a>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting || !publicKey}
          className="w-full py-2 px-4 bg-purple-600 rounded-md font-medium hover:bg-purple-700 transition-colors disabled:bg-purple-800/50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Frappe en cours...' : 'Frapper des jetons'}
        </button>
      </form>
    </div>
  );
} 