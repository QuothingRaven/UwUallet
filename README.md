# Cosmos SDK Wallet

A comprehensive TypeScript implementation of a wallet for the Cosmos SDK ecosystem. This library provides a simple interface for interacting with Cosmos-based blockchains, including support for basic operations, staking, and governance.

## Features

- 🔑 Wallet Creation and Management
- 💸 Token Transfers
- 📈 Staking Operations (Delegate, Undelegate, Redelegate)
- 🏛️ Governance Participation (Submit Proposals, Vote)
- 💎 Rewards Management
- 🔍 Chain Queries (Validators, Proposals)

## Installation

```bash
npm install cosmos-sdk-wallet
```

## Quick Start

```typescript
import CosmosWallet from 'cosmos-sdk-wallet';

async function main() {
  // Create a new wallet instance
  const wallet = new CosmosWallet();
  
  // Generate a new wallet or import existing
  const walletInfo = await wallet.createWallet();
  console.log("Address:", walletInfo.address);
  console.log("Mnemonic:", walletInfo.mnemonic);
  
  // Connect to a chain
  await wallet.connectToChain("https://rpc.cosmos.network:26657");
  
  // Check balance
  const balance = await wallet.getBalance(walletInfo.address);
  console.log("Balance:", balance);
  
  // Delegate tokens to a validator
  const delegation = await wallet.delegate(
    "cosmosvaloper1...",
    "1000000",
    "uatom"
  );
  console.log("Delegation:", delegation);
}
```

## Advanced Usage

### Staking Operations

```typescript
// Delegate tokens
await wallet.delegate("cosmosvaloper1...", "1000000");

// Undelegate tokens
await wallet.undelegate("cosmosvaloper1...", "1000000");

// Redelegate tokens
await wallet.redelegate(
  "cosmosvaloper1...", // source validator
  "cosmosvaloper2...", // destination validator
  "1000000"
);

// Claim rewards
await wallet.getRewards("cosmosvaloper1...");
```

### Governance

```typescript
// Submit a proposal
await wallet.submitProposal(
  "My Proposal",
  "Description of the proposal",
  [{ amount: "1000000", denom: "uatom" }]
);

// Vote on a proposal
await wallet.vote(1, "Yes");

// Query proposals
const proposals = await wallet.getProposals();
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
