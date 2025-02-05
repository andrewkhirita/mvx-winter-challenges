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
    StringValue,
    Token,
    TokenTransfer,
    U64Value,
    BigIntValue,
} from '@multiversx/sdk-core';

const URL = "https://devnet-api.multiversx.com";
const SMART_CONTRACT = "erd1qqqqqqqqqqqqqpgqhwdtf39jdex90jvq8uw9f6e0xrs8udn46dkqj7dtg9";
const FUNCTION_TO_CREATE_GAME = "createGame";
const FUNCTION_TO_JOIN_GAME = "joinGame";
const ENTRANCE_FEE = "50000000000000000";

const GAME_ID = 11;

const CHAIN_ID = "D";

const apiNetworkProvider = new ApiNetworkProvider(URL);
const config = new TransactionsFactoryConfig({ chainID: CHAIN_ID});
const factory = new SmartContractTransactionsFactory({config:config});

async function createGame(
    signer: UserSigner,
  ): Promise<void> {  
    const userAddress = signer.getAddress().toString();
    const address = Address.fromBech32(userAddress);
  
    const account = new Account(address);
    const accountOnNetwork = await apiNetworkProvider.getAccount(address);
    account.update(accountOnNetwork);
  
    const transaction = factory.createTransactionForExecute({
        sender: address,
        contract: Address.fromBech32(SMART_CONTRACT),
        function: FUNCTION_TO_CREATE_GAME,
        gasLimit: BigInt(5000000),
        tokenTransfers: [
          new TokenTransfer({
            token: new Token({identifier: "CITIZEN-253783", nonce: BigInt(16)}), amount: BigInt(1),
        }),
      ],
      nativeTransferAmount: BigInt(ENTRANCE_FEE)
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

  async function joinGame(
    signer: UserSigner,
  ): Promise<void> {  
    const userAddress = signer.getAddress().toString();
    const address = Address.fromBech32(userAddress);
  
    const account = new Account(address);
    const accountOnNetwork = await apiNetworkProvider.getAccount(address);
    account.update(accountOnNetwork);

    let args = [new U64Value(GAME_ID)];
  
    const transaction = factory.createTransactionForExecute({
        sender: address,
        contract: Address.fromBech32(SMART_CONTRACT),
        function: FUNCTION_TO_JOIN_GAME,
        gasLimit: BigInt(5000000),
        tokenTransfers: [
            new TokenTransfer({
              token: new Token({identifier: "CITIZEN-253783", nonce: BigInt(17)}), amount: BigInt(1),
          }),
        ],
      nativeTransferAmount: BigInt(ENTRANCE_FEE),
      arguments: args,
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
      // await createGame(signer);
      await joinGame(signer);
      
      // console.log("Proccess to create game was completed!");
      console.log("Proccess to join game was completed!");
    } catch (error) {
      // console.error("Error during create game:", error);
      console.error("Error during join game:", error);
    }
}

main();