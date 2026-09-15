export interface DIDRecord {
  did_id: string;
  owner: string;
  document: string;
  created_at: number;
  updated_at: number;
  active: boolean;
}

export interface CreateDIDRequest {
  owner: string;
  document: string;
}

export interface UpdateDIDRequest {
  caller: string;
  new_document: string;
}

export interface TransferDIDRequest {
  caller: string;
  new_owner: string;
}

export interface DIDResponse {
  success: boolean;
  data?: DIDRecord;
  error?: string;
}
