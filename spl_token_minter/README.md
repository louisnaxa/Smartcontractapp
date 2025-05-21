# Contrat de Création de Jetons SPL

Ce projet est un contrat intelligent Solana minimal qui permet de créer et de frapper des jetons SPL.

## Fonctionnalités

- Initialisation d'un nouveau jeton SPL avec nom, symbole et décimales
- Frappe (minting) de nouveaux jetons

## Prérequis

- Rust (avec cargo)
- Solana CLI
- Anchor Framework
- Node.js et npm

## Installation

1. Cloner le dépôt
```bash
git clone <url-du-dépôt>
cd spl_token_minter
```

2. Installer les dépendances
```bash
npm install
```

## Construction

Pour construire le programme, exécutez :
```bash
anchor build
```

## Tests

Pour exécuter les tests, lancez un validateur Solana local et exécutez les tests :
```bash
solana-test-validator
```

Dans un autre terminal :
```bash
anchor test
```

## Structure du Projet

- `programs/spl_token_minter/src/lib.rs` : Code du contrat intelligent
- `tests/spl_token_minter.ts` : Tests du contrat

## Comment Utiliser

### Initialisation d'un Jeton

```typescript
const tx = await program.methods
  .initializeToken("Mon Jeton", "MJT", 9)
  .accounts({
    // Comptes nécessaires
  })
  .signers([mint])
  .rpc();
```

### Frappe de Jetons

```typescript
const tx = await program.methods
  .mintTokens(new anchor.BN(1000000000))
  .accounts({
    // Comptes nécessaires
  })
  .rpc();
```

## Déploiement

Pour déployer sur le réseau de test (devnet) :
```bash
anchor deploy --provider.cluster devnet
```

## Licence

MIT 