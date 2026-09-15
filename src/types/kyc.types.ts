export enum KYCLevel {
  Unverified = 0,
  Basic = 1,
  Enhanced = 2,
  Institutional = 3,
}

export enum KYCStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Expired = 3,
}

export interface KYCRecord {
  did_id: string;
  level: KYCLevel;
  verifier: string;
  verified_at: number;
  expires_at: number;
  data_hash: string;
  status: KYCStatus;
}

export interface SubmitKYCRequest {
  applicant: string;
  did_id: string;
  level: KYCLevel;
  data_hash: string;
}

export interface ApproveKYCRequest {
  applicant: string;
  verifier: string;
  data_hash: string;
}

export interface RejectKYCRequest {
  applicant: string;
  verifier: string;
  reason: string;
}

export interface RegisterVerifierRequest {
  admin: string;
  verifier: string;
}

export interface KYCResponse {
  success: boolean;
  data?: KYCRecord;
  error?: string;
}

export interface IsVerifiedResponse {
  success: boolean;
  data?: { verified: boolean };
  error?: string;
}
