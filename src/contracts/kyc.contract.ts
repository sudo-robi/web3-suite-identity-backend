import * as StellarSdk from '@stellar/stellar-sdk';
import { config } from '../config';
import { KYCRecord, KYCLevel, SubmitKYCRequest, ApproveKYCRequest, RejectKYCRequest, RegisterVerifierRequest } from '../types';
import { logger } from '../utils/logger';

const server = new StellarSdk.Horizon.Server(config.SOROBAN_RPC_URL);
const keypair = StellarSdk.Keypair.fromSecret(config.STELLAR_SECRET_KEY);
const contractId = config.CONTRACT_ID_KYC;

export class KYCContract {
  static async submitKYC(req: SubmitKYCRequest): Promise<string> {
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
            'submit_kyc',
            StellarSdk.Address.fromString(req.applicant),
            StellarSdk.nativeToScVal(req.did_id, { type: 'bytesN', size: 32 }),
            StellarSdk.nativeToScVal(req.level, { type: 'u32' }),
            StellarSdk.nativeToScVal(req.data_hash, { type: 'bytes' })
          )
        )
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

      tx.sign(keypair);
      const result = await server.submitTransaction(tx);
      logger.info('KYC submitted', { applicant: req.applicant, txHash: result.hash });
      return result.hash;
    } catch (error) {
      logger.error('Failed to submit KYC:', error);
      throw error;
    }
  }

  static async approveKYC(req: ApproveKYCRequest): Promise<string> {
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
            'approve_kyc',
            StellarSdk.Address.fromString(req.applicant),
            StellarSdk.Address.fromString(req.verifier),
            StellarSdk.nativeToScVal(req.data_hash, { type: 'bytes' })
          )
        )
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

      tx.sign(keypair);
      const result = await server.submitTransaction(tx);
      logger.info('KYC approved', { applicant: req.applicant, txHash: result.hash });
      return result.hash;
    } catch (error) {
      logger.error('Failed to approve KYC:', error);
      throw error;
    }
  }

  static async rejectKYC(req: RejectKYCRequest): Promise<string> {
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
            'reject_kyc',
            StellarSdk.Address.fromString(req.applicant),
            StellarSdk.Address.fromString(req.verifier),
            StellarSdk.nativeToScVal(req.reason, { type: 'bytes' })
          )
        )
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

      tx.sign(keypair);
      const result = await server.submitTransaction(tx);
      logger.info('KYC rejected', { applicant: req.applicant, txHash: result.hash });
      return result.hash;
    } catch (error) {
      logger.error('Failed to reject KYC:', error);
      throw error;
    }
  }

  static async verifyKYC(applicant: string): Promise<KYCRecord | null> {
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
            'verify_kyc',
            StellarSdk.Address.fromString(applicant)
          )
        )
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

      tx.sign(keypair);
      const result = await server.simulateTransaction(tx);
      return StellarSdk.scValToNative(result.result?.retval) as KYCRecord | null;
    } catch (error) {
      logger.error('Failed to verify KYC:', error);
      return null;
    }
  }

  static async registerVerifier(req: RegisterVerifierRequest): Promise<string> {
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
            'register_verifier',
            StellarSdk.Address.fromString(req.admin),
            StellarSdk.Address.fromString(req.verifier)
          )
        )
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

      tx.sign(keypair);
      const result = await server.submitTransaction(tx);
      logger.info('Verifier registered', { verifier: req.verifier, txHash: result.hash });
      return result.hash;
    } catch (error) {
      logger.error('Failed to register verifier:', error);
      throw error;
    }
  }

  static async isVerified(applicant: string, requiredLevel: KYCLevel): Promise<boolean> {
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
            'is_verified',
            StellarSdk.Address.fromString(applicant),
            StellarSdk.nativeToScVal(requiredLevel, { type: 'u32' })
          )
        )
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

      tx.sign(keypair);
      const result = await server.simulateTransaction(tx);
      return StellarSdk.scValToNative(result.result?.retval) as boolean;
    } catch (error) {
      logger.error('Failed to check verification status:', error);
      return false;
    }
  }
}
