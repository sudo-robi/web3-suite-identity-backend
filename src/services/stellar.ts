import * as StellarSdk from '@stellar/stellar-sdk';
import { config } from '../config';
import { logger } from '../utils/logger';

/**
 * Unified Stellar RPC client wrapper.
 *
 * Provides helpers for loading accounts, building transactions, and
 * interacting with Soroban contracts through a single shared client.
 */
class StellarClient {
  private server: StellarSdk.SorobanRpc.Server;
  private horizon: StellarSdk.Horizon.Server;
  private keypair: StellarSdk.Keypair;
  private networkPassphrase: string;

  constructor() {
    this.server = new StellarSdk.SorobanRpc.Server(config.SOROBAN_RPC_URL, {
      allowHttp: config.NODE_ENV === 'development',
    });
    this.horizon = new StellarSdk.Horizon.Server(config.SOROBAN_RPC_URL);
    this.keypair = StellarSdk.Keypair.fromSecret(config.STELLAR_SECRET_KEY);
    this.networkPassphrase =
      config.STELLAR_NETWORK === 'mainnet'
        ? StellarSdk.Networks.PUBLIC
        : StellarSdk.Networks.TESTNET;
  }

  /** The server-facing public key used for signing transactions. */
  get publicKey(): string {
    return this.keypair.publicKey();
  }

  /** Soroban RPC server instance. */
  get soroban(): StellarSdk.SorobanRpc.Server {
    return this.server;
  }

  /** Horizon server instance. */
  get horizonServer(): StellarSdk.Horizon.Server {
    return this.horizon;
  }

  /** Network passphrase for the target network. */
  get passphrase(): string {
    return this.networkPassphrase;
  }

  /** Load an account by public key from Horizon. */
  async loadAccount(publicKey?: string): Promise<StellarSdk.Account> {
    return this.horizon.loadAccount(publicKey ?? this.publicKey);
  }

  /** Build a contract invocation transaction. */
  buildContractTx(
    contractId: string,
    method: string,
    ...args: StellarSdk.xdr.ScVal[]
  ): StellarSdk.TransactionBuilder {
    const contract = new StellarSdk.Contract(contractId);
    return new StellarSdk.TransactionBuilder(
      {} as StellarSdk.Account, // caller must .build() after loading account
      {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      }
    ).addOperation(contract.call(method, ...args));
  }

  /** Sign and submit a transaction. */
  async signAndSubmit(tx: StellarSdk.Transaction): Promise<StellarSdk.Horizon.Api.SubmitTransactionResponse> {
    tx.sign(this.keypair);
    const result = await this.horizon.submitTransaction(tx);
    logger.info('Transaction submitted', { hash: result.hash });
    return result;
  }

  /** Simulate a transaction (read-only call). */
  async simulate(tx: StellarSdk.Transaction): Promise<StellarSdk.SorobanRpc.Api.SimulateTransactionResponse> {
    return this.server.simulateTransaction(tx);
  }
}

/** Singleton Stellar client instance. */
export const stellar = new StellarClient();
