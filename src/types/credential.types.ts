export interface CredentialRecord {
  credential_id: string;
  issuer: string;
  subject: string;
  credential_type: string;
  claims: string;
  issued_at: number;
  expires_at: number | null;
  revoked: boolean;
  signature: string;
}

export interface IssueCredentialRequest {
  issuer: string;
  subject: string;
  credential_type: string;
  claims: string;
  expires_at?: number;
  signature: string;
}

export interface RevokeCredentialRequest {
  caller: string;
}

export interface CredentialResponse {
  success: boolean;
  data?: CredentialRecord;
  error?: string;
}

export interface CredentialListResponse {
  success: boolean;
  data?: string[];
  error?: string;
}
