import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { config } from './config';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { rateLimiter } from './middleware/rateLimit.middleware';
import { logger } from './utils/logger';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(rateLimiter);

// Logging
app.use(
  pinoHttp({
    logger,
    autoLogging:
      config.NODE_ENV === 'production'
        ? { ignore: (req) => req.url === '/health' }
        : false,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    uptime: process.uptime(),
    network: config.STELLAR_NETWORK,
  });
});

// API info
app.get('/api/v1/info', (_req, res) => {
  res.json({
    name: 'Web3 Suite Identity API',
    version: '1.0.0',
    description: 'Backend API for Stellar Identity Suite',
    network: config.STELLAR_NETWORK,
    contracts: {
      did: config.CONTRACT_ID_DID,
      credentials: config.CONTRACT_ID_CREDENTIALS,
      kyc: config.CONTRACT_ID_KYC,
    },
  });
});

// API routes
app.use('/api/v1', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
