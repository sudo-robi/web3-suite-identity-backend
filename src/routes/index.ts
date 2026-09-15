import { Router } from 'express';
import didRoutes from './did.routes';
import credentialRoutes from './credential.routes';
import kycRoutes from './kyc.routes';

const router = Router();

router.use('/did', didRoutes);
router.use('/credentials', credentialRoutes);
router.use('/kyc', kycRoutes);

export default router;
