import * as StellarSdk from '@stellar/stellar-sdk';
import { config } from '../config';
import { DIDRecord, CreateDIDRequest, UpdateDIDRequest, TransferDIDRequest } from '../types';
import { logger } from '../utils/logger';

const server = new StellarSdk.Horizon.Server(config.SOROBAN_RPC_URL);
const keypair = StellarSdk.Keypair.fromSecret(config.STELLAR_SECRET_KEY);
const contractId = config.CONTRACT_ID_DID;

export class DIDContract {
  static async createDID(req: CreateDIDRequest): Promise<string> {
    try {
      const account = await server.loadAccount(keypair.publicKey());
      const contract = new StellarSdk.Contract(contractId);

      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: config.STELLAR_NETWORK === 'mainnet'
          ? StellarSdk.Networks.PUBLIC
          : StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          contract.call(
            'create_did',
            StellarSdk.Address.fromString(req.owner),
            StellarSdk.nativeToScVal(req.document, { type: 'bytes' })
          )
        )
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

      tx.sign(keypair);
      const result = await server.submitTransaction(tx);
      logger.info('DID created', { txHash: result.hash });
      return result.hash;
    } catch (error) {
      logger.error('Failed to create DID:', error);
      throw error;
    }
  }

  static async resolveDID(didId: string): Promise<DIDRecord | null> {
    try {
      const account = await server.loadAccount(keypair.publicKey());
      const contract = new StellarSdk.Contract(contractId);

      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: config.STELLAR_NETWORK === 'mainnet'
          ? StellarSdk.Networks.PUBLIC
          : StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          contract.call(
            'resolve_did',
            StellarSdk.nativeToScVal(didId, { type: 'bytesN', size: 32 })
          )
        )
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

      tx.sign(keypair);
      const result = await server.simulateTransaction(tx);
      // Parse result from simulation
      return StellarSdk.scValToNative(result.result?.retval) as DIDRecord | null;
    } catch (error) {
      logger.error('Failed to resolve DID:', error);
      return null;
    }
  }

  static async updateDID(didId: string, req: UpdateDIDRequest): Promise<string> {
    try {
      const account = await server.loadAccount(keypair.publicKey());
      const contract = new StellarSdk.Contract(contractId);

      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: config.STELLAR_NETWORK === 'mainnet'
          ? StellarSdk.Networks.PUBLIC
          : StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          contract.call(
            'update_did',
            StellarSdk.nativeToScVal(didId, { type: 'bytesN', size: 32 }),
            StellarSdk.Address.fromString(req.caller),
            StellarSdk.nativeToScVal(req.new_document, { type: 'bytes' })
          )
        )
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

      tx.sign(keypair);
      const result = await server.submitTransaction(tx);
      logger.info('DID updated', { didId, txHash: result.hash });
      return result.hash;
    } catch (error) {
      logger.error('Failed to update DID:', error);
      throw error;
    }
  }

  static async deactivateDID(didId: string, caller: string): Promise<string> {
    try {
      const account = await server.loadAccount(keypair.publicKey());
      const contract = new StellarSdk.Contract(contractId);

      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: config.STELLAR_NETWORK === 'mainnet'
          ? StellarSdk.Networks.PUBLIC
          : StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          contract.call(
            'deactivate_did',
            StellarSdk.nativeToScVal(didId, { type: 'bytesN', size: 32 }),
            StellarSdk.Address.fromString(caller)
          )
        )
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

      tx.sign(keypair);
      const result = await server.submitTransaction(tx);
      logger.info('DID deactivated', { didId, txHash: result.hash });
      return result.hash;
    } catch (error) {
      logger.error('Failed to deactivate DID:', error);
      throw error;
    }
  }

  static async transferDID(didId: string, req: TransferDIDRequest): Promise<string> {
    try {
      const account = await server.loadAccount(keypair.publicKey());
      const contract = new StellarSdk.Contract(contractId);

      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: config.STELLAR_NETWORK === 'mainnet'
          ? StellarSdk.Networks.PUBLIC
          : StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          contract.call(
            'transfer_did',
            StellarSdk.nativeToScVal(didId, { type: 'bytesN', size: 32 }),
            StellarSdk.Address.fromString(req.caller),
            StellarSdk.Address.fromString(req.new_owner)
          )
        )
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

      tx.sign(keypair);
      const result = await server.submitTransaction(tx);
      logger.info('DID transferred', { didId, txHash: result.hash });
      return result.hash;
    } catch (error) {
      logger.error('Failed to transfer DID:', error);
      throw error;
    }
  }

  static async isActive(didId: string): Promise<boolean> {
    try {
      const account = await server.loadAccount(keypair.publicKey());
      const contract = new StellarSdk.Contract(contractId);

      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: config.STELLAR_NETWORK === 'mainnet'
          ? StellarSdk.Networks.PUBLIC
          : StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          contract.call(
            'is_active',
            StellarSdk.nativeToScVal(didId, { type: 'bytesN', size: 32 })
          )
        )
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

      tx.sign(keypair);
      const result = await server.simulateTransaction(tx);
      return StellarSdk.scValToNative(result.result?.retval) as boolean;
    } catch (error) {
      logger.error('Failed to check DID status:', error);
      return false;
    }
  }
}
