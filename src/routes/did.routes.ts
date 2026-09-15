import { Router, Request, Response, NextFunction } from 'express';
import { DIDContract } from '../contracts/did.contract';
import { AppError } from '../utils/errors';
import { z } from 'zod';

const router = Router();

const createDIDSchema = z.object({
  owner: z.string().min(1),
  document: z.string().min(1),
});

const updateDIDSchema = z.object({
  caller: z.string().min(1),
  new_document: z.string().min(1),
});

const transferDIDSchema = z.object({
  caller: z.string().min(1),
  new_owner: z.string().min(1),
});

// POST /api/v1/did - Create a new DID
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createDIDSchema.parse(req.body);
    const txHash = await DIDContract.createDID(body);
    res.status(201).json({ success: true, data: { tx_hash: txHash }, timestamp: Date.now() });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/did/:id - Resolve a DID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const record = await DIDContract.resolveDID(id);
    if (!record) {
      throw AppError.notFound('DID not found');
    }
    res.json({ success: true, data: record, timestamp: Date.now() });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/did/:id - Update DID document
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const body = updateDIDSchema.parse(req.body);
    const txHash = await DIDContract.updateDID(id, body);
    res.json({ success: true, data: { tx_hash: txHash }, timestamp: Date.now() });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/did/:id - Deactivate DID
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const caller = req.query.caller as string;
    if (!caller) throw AppError.badRequest('caller query parameter required');
    const txHash = await DIDContract.deactivateDID(id, caller);
    res.json({ success: true, data: { tx_hash: txHash }, timestamp: Date.now() });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/did/:id/transfer - Transfer DID ownership
router.post('/:id/transfer', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const body = transferDIDSchema.parse(req.body);
    const txHash = await DIDContract.transferDID(id, body);
    res.json({ success: true, data: { tx_hash: txHash }, timestamp: Date.now() });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/did/check/:id - Check if DID is active
router.get('/check/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const active = await DIDContract.isActive(id);
    res.json({ success: true, data: { active }, timestamp: Date.now() });
  } catch (error) {
    next(error);
  }
});

export default router;
