import * as StellarSdk from '@stellar/stellar-sdk';
import { config } from '../config';
import { CredentialRecord, IssueCredentialRequest, RevokeCredentialRequest } from '../types';
import { logger } from '../utils/logger';

const server = new StellarSdk.Horizon.Server(config.SOROBAN_RPC_URL);
const keypair = StellarSdk.Keypair.fromSecret(config.STELLAR_SECRET_KEY);
const contractId = config.CONTRACT_ID_CREDENTIALS;

export class CredentialContract {
  static async issueCredential(req: IssueCredentialRequest): Promise<string> {
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
            'issue_credential',
            StellarSdk.Address.fromString(req.issuer),
            StellarSdk.nativeToScVal(req.subject, { type: 'bytesN', size: 32 }),
            StellarSdk.nativeToScVal(req.credential_type, { type: 'bytes' }),
            StellarSdk.nativeToScVal(req.claims, { type: 'bytes' }),
            req.expires_at
              ? StellarSdk.nativeToScVal(req.expires_at, { type: 'u64' })
              : StellarSdk.nativeToScVal(null, { type: 'option' }),
            StellarSdk.nativeToScVal(req.signature, { type: 'bytes' })
          )
        )
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

      tx.sign(keypair);
      const result = await server.submitTransaction(tx);
      logger.info('Credential issued', { txHash: result.hash });
      return result.hash;
    } catch (error) {
      logger.error('Failed to issue credential:', error);
      throw error;
    }
  }

  static async verifyCredential(credentialId: string): Promise<boolean> {
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
            'verify_credential',
            StellarSdk.nativeToScVal(credentialId, { type: 'bytesN', size: 32 })
          )
        )
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

      tx.sign(keypair);
      const result = await server.simulateTransaction(tx);
      return StellarSdk.scValToNative(result.result?.retval) as boolean;
    } catch (error) {
      logger.error('Failed to verify credential:', error);
      return false;
    }
  }

  static async revokeCredential(credentialId: string, req: RevokeCredentialRequest): Promise<string> {
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
            'revoke_credential',
            StellarSdk.nativeToScVal(credentialId, { type: 'bytesN', size: 32 }),
            StellarSdk.Address.fromString(req.caller)
          )
        )
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

      tx.sign(keypair);
      const result = await server.submitTransaction(tx);
      logger.info('Credential revoked', { credentialId, txHash: result.hash });
      return result.hash;
    } catch (error) {
      logger.error('Failed to revoke credential:', error);
      throw error;
    }
  }

  static async getCredential(credentialId: string): Promise<CredentialRecord | null> {
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
            'get_credential',
            StellarSdk.nativeToScVal(credentialId, { type: 'bytesN', size: 32 })
          )
        )
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

      tx.sign(keypair);
      const result = await server.simulateTransaction(tx);
      return StellarSdk.scValToNative(result.result?.retval) as CredentialRecord | null;
    } catch (error) {
      logger.error('Failed to get credential:', error);
      return null;
    }
  }

  static async getIssuerCredentials(issuer: string): Promise<string[]> {
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
            'get_issuer_credentials',
            StellarSdk.Address.fromString(issuer)
          )
        )
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

      tx.sign(keypair);
      const result = await server.simulateTransaction(tx);
      return StellarSdk.scValToNative(result.result?.retval) as string[];
    } catch (error) {
      logger.error('Failed to get issuer credentials:', error);
      return [];
    }
  }

  static async getSubjectCredentials(subject: string): Promise<string[]> {
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
            'get_subject_credentials',
            StellarSdk.nativeToScVal(subject, { type: 'bytesN', size: 32 })
          )
        )
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

      tx.sign(keypair);
      const result = await server.simulateTransaction(tx);
      return StellarSdk.scValToNative(result.result?.retval) as string[];
    } catch (error) {
      logger.error('Failed to get subject credentials:', error);
      return [];
    }
  }
}
