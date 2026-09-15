export { DIDRecord, CreateDIDRequest, UpdateDIDRequest, TransferDIDRequest, DIDResponse } from './did.types';
export {
  CredentialRecord,
  IssueCredentialRequest,
  RevokeCredentialRequest,
  CredentialResponse,
  CredentialListResponse,
} from './credential.types';
export {
  KYCLevel,
  KYCStatus,
  KYCRecord,
  SubmitKYCRequest,
  ApproveKYCRequest,
  RejectKYCRequest,
  RegisterVerifierRequest,
  KYCResponse,
  IsVerifiedResponse,
} from './kyc.types';

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface HealthResponse {
  status: 'ok' | 'error';
  version: string;
  uptime: number;
  network: string;
}
