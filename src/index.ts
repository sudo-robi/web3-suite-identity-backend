import { app } from './app';
import { config } from './config';
import { logger } from './utils/logger';

const server = app.listen(config.PORT, () => {
  logger.info(`Identity API server running on port ${config.PORT}`);
  logger.info(`Environment: ${config.NODE_ENV}`);
  logger.info(`Network: ${config.STELLAR_NETWORK}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down...');
  server.close(() => {
    process.exit(0);
  });
});

export default server;
