import { Router, Request, Response, NextFunction } from 'express';
import { KYCContract } from '../contracts/kyc.contract';
import { AppError } from '../utils/errors';
import { z } from 'zod';
import { KYCLevel } from '../types';

const router = Router();

const submitKYCSchema = z.object({
  applicant: z.string().min(1),
  did_id: z.string().min(1),
  level: z.nativeEnum(KYCLevel),
  data_hash: z.string().min(1),
});

const approveKYCSchema = z.object({
  applicant: z.string().min(1),
  verifier: z.string().min(1),
  data_hash: z.string().min(1),
});

const rejectKYCSchema = z.object({
  applicant: z.string().min(1),
  verifier: z.string().min(1),
  reason: z.string().min(1),
});

const registerVerifierSchema = z.object({
  admin: z.string().min(1),
  verifier: z.string().min(1),
});

// POST /api/v1/kyc/submit - Submit KYC application
router.post('/submit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = submitKYCSchema.parse(req.body);
    const txHash = await KYCContract.submitKYC(body);
    res.status(201).json({ success: true, data: { tx_hash: txHash }, timestamp: Date.now() });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/kyc/approve - Approve KYC
router.post('/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = approveKYCSchema.parse(req.body);
    const txHash = await KYCContract.approveKYC(body);
    res.json({ success: true, data: { tx_hash: txHash }, timestamp: Date.now() });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/kyc/reject - Reject KYC
router.post('/reject', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = rejectKYCSchema.parse(req.body);
    const txHash = await KYCContract.rejectKYC(body);
    res.json({ success: true, data: { tx_hash: txHash }, timestamp: Date.now() });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/kyc/status/:address - Get KYC status
router.get('/status/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const record = await KYCContract.verifyKYC(address);
    if (!record) {
      throw AppError.notFound('No KYC record found');
    }
    res.json({ success: true, data: record, timestamp: Date.now() });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/kyc/verifier/register - Register a verifier
router.post('/verifier/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = registerVerifierSchema.parse(req.body);
    const txHash = await KYCContract.registerVerifier(body);
    res.status(201).json({ success: true, data: { tx_hash: txHash }, timestamp: Date.now() });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/kyc/verify/:address - Check KYC verification level
router.get('/verify/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const level = parseInt(req.query.level as string) || KYCLevel.Basic;
    const verified = await KYCContract.isVerified(address, level as KYCLevel);
    res.json({ success: true, data: { verified, required_level: level }, timestamp: Date.now() });
  } catch (error) {
    next(error);
  }
});

export default router;
