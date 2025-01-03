import path from 'path';
import fs from 'fs';
import { UserSigner } from '@multiversx/sdk-wallet';
import {
    Address,
    ApiNetworkProvider,
    TransactionsFactoryConfig,
    TransactionComputer,
    Account,
    SmartContractTransactionsFactory,
    TokenIdentifierValue,
    AddressValue,
    TokenTransfer,
    StringValue,
} from '@multiversx/sdk-core';

const URL = "https://devnet-api.multiversx.com";
// const WOOD_SC = "erd1qqqqqqqqqqqqqpgqcs54gq36d6lgc4q57jpsu8veys7xe27k6dkqaswnpz";
// const WOOD_SC_TEST = "erd1qqqqqqqqqqqqqpgqrqds9gxytvqxmtu09qvjkw4r97z497de6dkqv2xnkx";
const FOOD_SC_TEST = "erd1qqqqqqqqqqqqqpgqrad0al0gqpnqg68e9t4zfg853urg97au6dkqjz6mh3";
// const STONE_SC = "erd1qqqqqqqqqqqqqpgqvl3xlxz4rarxn6m95trqffkl7gwpxd7k6dkqzcpqvj";
// const FOOD_SC = "erd1qqqqqqqqqqqqqpgqqtsm6hkf89nq49z0ztys8ulr7z5gp5426dkqnaac6q";
// const GOLD_SC = "erd1qqqqqqqqqqqqqpgqggjxlqw9v9uxqn8yknm8k85ss6l5wexc6dkqjdk8r8";

const FUNCTION_GENERATE = "generateResources";
const FUNCTION_STAKE = "stakeWinter";
const CHAIN_ID = "D";

const TOKEN_ID = "WINTER-4b4989";
const AMOUNT = "1000000";
const numDecimals = 8;

const EGLD_FEE = 50000000000000000;

const apiNetworkProvider = new ApiNetworkProvider(URL);
const config = new TransactionsFactoryConfig({ chainID: CHAIN_ID});
const factory = new SmartContractTransactionsFactory({config:config});

async function issueToken(
  signer: UserSigner,
  tokenName: string,
  tokenTicker: string,
): Promise<void> {
  const userAddress = signer.getAddress().toString();
  const address = Address.fromBech32(userAddress);

  const account = new Account(address);
  const accountOnNetwork = await apiNetworkProvider.getAccount(address);
  account.update(accountOnNetwork);

  let args = [new StringValue(tokenName),new StringValue(tokenTicker)];
  
  const transaction = factory.createTransactionForExecute({
      sender: address,
      contract: Address.fromBech32(FOOD_SC_TEST),
      function: "issue",
      gasLimit: BigInt(100000000),
      arguments: args,
      nativeTransferAmount: BigInt(EGLD_FEE)
  });
  
  const nonce = account.getNonceThenIncrement();
  transaction.nonce = BigInt(nonce.valueOf());

  const transactionComputer = new TransactionComputer();
  const serializedTransaction = transactionComputer.computeBytesForSigning(transaction);
  const signature = await signer.sign(serializedTransaction);
  transaction.signature = signature;

  const txHash = await apiNetworkProvider.sendTransaction(transaction);
  console.log("Transaction hash:", txHash);
}

async function stakeTokenWinter(
  signer: UserSigner,
): Promise<void> {  
  const userAddress = signer.getAddress().toString();
  const address = Address.fromBech32(userAddress);

  const account = new Account(address);
  const accountOnNetwork = await apiNetworkProvider.getAccount(address);
  account.update(accountOnNetwork);

  const payment = TokenTransfer.fungibleFromAmount(
    TOKEN_ID,
    AMOUNT,
    numDecimals
  );

  const transaction = factory.createTransactionForExecute({
    sender: address,
    contract: Address.fromBech32(FOOD_SC_TEST),
    function: FUNCTION_STAKE,
    gasLimit: BigInt(5000000),
    tokenTransfers: [payment]
  });
  
  const nonce = account.getNonceThenIncrement();
  transaction.nonce = BigInt(nonce.valueOf());

  const transactionComputer = new TransactionComputer();
  const serializedTransaction = transactionComputer.computeBytesForSigning(transaction);
  const signature = await signer.sign(serializedTransaction);
  transaction.signature = signature;

  const txHash = await apiNetworkProvider.sendTransaction(transaction);
  console.log("Transaction hash:", txHash);
}

async function generateResources(
    signer: UserSigner,
  ): Promise<void> {  
    const userAddress = signer.getAddress().toString();
    const address = Address.fromBech32(userAddress);
  
    const account = new Account(address);
    const accountOnNetwork = await apiNetworkProvider.getAccount(address);
    account.update(accountOnNetwork);
  
    const transaction = factory.createTransactionForExecute({
        sender: address,
        contract: Address.fromBech32(FOOD_SC_TEST),
        function: FUNCTION_GENERATE,
        gasLimit: BigInt(5000000),
    });
    
    const nonce = account.getNonceThenIncrement();
    transaction.nonce = BigInt(nonce.valueOf());
  
    const transactionComputer = new TransactionComputer();
    const serializedTransaction = transactionComputer.computeBytesForSigning(transaction);
    const signature = await signer.sign(serializedTransaction);
    transaction.signature = signature;
  
    const txHash = await apiNetworkProvider.sendTransaction(transaction);
    console.log("Transaction hash:", txHash);
  }
  
async function loadWallet(walletPath: string): Promise<UserSigner> {
    const walletJson = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
    return UserSigner.fromWallet(walletJson, 'password');
}

async function main() {
    try {
      const walletPath = path.join(__dirname, `../challenge-1/wallets/wallet_shard${0}_${1}.json`);
      
      const signer = await loadWallet(walletPath);
      // await issueToken(signer, "FOOD", "FOOD");
      // await stakeTokenWinter(signer);
      await generateResources(signer);

      console.log("Resources has been generated resources successfully");
    } catch (error) {
      console.error("Error during generated resources:", error);
    }
}

main();