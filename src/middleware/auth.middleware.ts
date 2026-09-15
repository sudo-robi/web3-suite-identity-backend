import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(AppError.unauthorized('Missing or invalid authorization header'));
    return;
  }

  // In production, verify JWT token here
  // For now, extract address from header
  const address = req.headers['x-stellar-address'] as string;
  if (!address) {
    next(AppError.unauthorized('Missing x-stellar-address header'));
    return;
  }

  // Attach user info to request
  (req as any).user = { address };
  next();
};
