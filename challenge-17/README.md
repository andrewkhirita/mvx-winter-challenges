# Challenge #17: Mint ORE

Script that allows users (wallets generated at challenge #1) to mint ORE tokens after burning STONE tokens.

## Description

This script interacts with the smart contract deployed at the address `erd1qqqqqqqqqqqqqpgqyl7kcdhqe4wkdhjf28wkz0k7963ukfgw6dkqr0nqtd`

The smart contract was deployed using one of the wallets generated in Challenge #1. 

If you want to use a different smart contract address, please refer to the "Deploying-Contract.md" instructions for deploying your own contract.

## Prerequisites

- Node.js
- TypeScript
- MultiversX SDK
- Wallets generated from Challenge #1

## Setup

```bash
npx tsc --init
npm install @multiversx/sdk-core @multiversx/sdk-network-providers @multiversx/sdk-wallet
```

## Usage

Run the script:
```bash
ts-node mint_ore.ts
