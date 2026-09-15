import { Router, Request, Response, NextFunction } from 'express';
import { CredentialContract } from '../contracts/credential.contract';
import { AppError } from '../utils/errors';
import { z } from 'zod';

const router = Router();

const issueCredentialSchema = z.object({
  issuer: z.string().min(1),
  subject: z.string().min(1),
  credential_type: z.string().min(1),
  claims: z.string().min(1),
  expires_at: z.number().optional(),
  signature: z.string().min(1),
});

const revokeCredentialSchema = z.object({
  caller: z.string().min(1),
});

// POST /api/v1/credentials/issue - Issue a new credential
router.post('/issue', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = issueCredentialSchema.parse(req.body);
    const txHash = await CredentialContract.issueCredential(body);
    res.status(201).json({ success: true, data: { tx_hash: txHash }, timestamp: Date.now() });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/credentials/:id - Get credential details
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const record = await CredentialContract.getCredential(id);
    if (!record) {
      throw AppError.notFound('Credential not found');
    }
    res.json({ success: true, data: record, timestamp: Date.now() });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/credentials/:id/verify - Verify a credential
router.post('/:id/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const valid = await CredentialContract.verifyCredential(id);
    res.json({ success: true, data: { valid }, timestamp: Date.now() });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/credentials/:id/revoke - Revoke a credential
router.post('/:id/revoke', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const body = revokeCredentialSchema.parse(req.body);
    const txHash = await CredentialContract.revokeCredential(id, body);
    res.json({ success: true, data: { tx_hash: txHash }, timestamp: Date.now() });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/credentials/issuer/:address - Get credentials by issuer
router.get('/issuer/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const credentials = await CredentialContract.getIssuerCredentials(address);
    res.json({ success: true, data: credentials, timestamp: Date.now() });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/credentials/subject/:did - Get credentials by subject
router.get('/subject/:did', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { did } = req.params;
    const credentials = await CredentialContract.getSubjectCredentials(did);
    res.json({ success: true, data: credentials, timestamp: Date.now() });
  } catch (error) {
    next(error);
  }
});

export default router;
