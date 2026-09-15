[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge)](https://expressjs.com)
[![Stellar](https://img.shields.io/badge/Stellar-Soroban-08B5E5?style=for-the-badge&logo=stellar&logoColor=white)](https://stellar.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)

# Web3 Suite — Identity Backend

A production-ready TypeScript/Express.js backend API for the Stellar Identity Suite. This service provides RESTful endpoints for DID management, verifiable credential issuance, and KYC verification — all backed by Soroban smart contracts on the Stellar network.

## Architecture

```
                    ┌─────────────────────────────────────┐
                    │            Client Apps               │
                    │   (Web, Mobile, Third-party)         │
                    └──────────────┬──────────────────────┘
                                   │ HTTP/HTTPS
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                          Express.js API                              │
│                                                                      │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │  Routes   │  │  Middleware   │  │  Services  │  │  Contracts   │  │
│  │          │  │              │  │            │  │              │  │
│  │ /did     │  │ Auth         │  │ DID        │  │ DID Registry │  │
│  │ /creds   │  │ Validation   │  │ Credentl   │  │ Credentials  │  │
│  │ /kyc     │  │ Rate Limit   │  │ KYC        │  │ KYC Verif.   │  │
│  │ /health  │  │ Error Handler│  │            │  │              │  │
│  └──────────┘  └──────────────┘  └────────────┘  └──────┬───────┘  │
│                                                          │          │
│  ┌──────────────────────────────────────────────────────┐│          │
│  │               Stellar SDK / Soroban RPC              ││          │
│  └──────────────────────────────────────────────────────┘│          │
└──────────────────────────────────────────────────────────┼──────────┘
                                                           │
                                                           ▼
                                                   ┌──────────────┐
                                                   │ Stellar      │
                                                   │ Network      │
                                                   │ (Testnet)    │
                                                   └──────────────┘
```

### Request Flow

```
Client Request
     │
     ▼
┌─────────────────┐
│   Rate Limiter  │ ──► 429 Too Many Requests
└────────┬────────┘
         ▼
┌─────────────────┐
│  Auth Middleware │ ──► 401 Unauthorized
└────────┬────────┘
         ▼
┌─────────────────┐
│ Body Validation  │ ──► 400 Bad Request (Zod)
└────────┬────────┘
         ▼
┌─────────────────┐
│   Route Handler  │
└────────┬────────┘
         ▼
┌─────────────────┐
│  Contract Layer  │ ──► Stellar SDK → Soroban RPC
└────────┬────────┘
         ▼
┌─────────────────┐
│  Response        │
└─────────────────┘
```

## API Endpoints

### DID Management

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/v1/did` | Create a new DID | `{ owner, document }` |
| `GET` | `/api/v1/did/:id` | Resolve a DID | — |
| `PUT` | `/api/v1/did/:id` | Update DID document | `{ caller, new_document }` |
| `DELETE` | `/api/v1/did/:id` | Deactivate DID | Query: `?caller=` |
| `POST` | `/api/v1/did/:id/transfer` | Transfer DID ownership | `{ caller, new_owner }` |
| `GET` | `/api/v1/did/check/:id` | Check if DID is active | — |

### Verifiable Credentials

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/v1/credentials/issue` | Issue a new credential | `{ issuer, subject, credential_type, claims, expires_at?, signature }` |
| `GET` | `/api/v1/credentials/:id` | Get credential details | — |
| `POST` | `/api/v1/credentials/:id/verify` | Verify a credential | — |
| `POST` | `/api/v1/credentials/:id/revoke` | Revoke a credential | `{ caller }` |
| `GET` | `/api/v1/credentials/issuer/:address` | List credentials by issuer | — |
| `GET` | `/api/v1/credentials/subject/:did` | List credentials by subject | — |

### KYC Verification

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/v1/kyc/submit` | Submit KYC application | `{ applicant, did_id, level, data_hash }` |
| `POST` | `/api/v1/kyc/approve` | Approve KYC | `{ applicant, verifier, data_hash }` |
| `POST` | `/api/v1/kyc/reject` | Reject KYC | `{ applicant, verifier, reason }` |
| `GET` | `/api/v1/kyc/status/:address` | Get KYC status | — |
| `POST` | `/api/v1/kyc/verifier/register` | Register a verifier | `{ admin, verifier }` |
| `GET` | `/api/v1/kyc/verify/:address` | Check verification level | Query: `?level=` |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/v1/info` | API info and version |

## Getting Started

### Prerequisites

- Node.js ≥ 18.0.0
- npm or yarn
- Stellar account with testnet tokens
- Deployed Soroban contracts

### Installation

```bash
# Clone the repository
git clone https://github.com/sudo-robi/web3-suite-identity-backend.git
cd web3-suite-identity-backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
```

### Configuration

Edit `.env` with your settings:

```env
PORT=3000
NODE_ENV=development
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_NETWORK=testnet
STELLAR_SECRET_KEY=your-secret-key-here
CONTRACT_ID_DID=your-deployed-did-contract-id
CONTRACT_ID_CREDENTIALS=your-deployed-credentials-contract-id
CONTRACT_ID_KYC=your-deployed-kyc-contract-id
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Run tests
npm test

# Type check
npm run typecheck

# Lint
npm run lint

# Format
npm run format
```

### Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t identity-backend .
docker run -p 3000:3000 --env-file .env identity-backend
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `SOROBAN_RPC_URL` | Yes | — | Soroban RPC endpoint |
| `STELLAR_NETWORK` | Yes | — | `testnet`, `mainnet`, or `standalone` |
| `STELLAR_SECRET_KEY` | Yes | — | Stellar secret key for signing |
| `CONTRACT_ID_DID` | Yes | — | Deployed DID Registry contract ID |
| `CONTRACT_ID_CREDENTIALS` | Yes | — | Deployed Credentials contract ID |
| `CONTRACT_ID_KYC` | Yes | — | Deployed KYC contract ID |
| `IPFS_API_URL` | No | — | IPFS API endpoint |
| `IPFS_API_KEY` | No | — | IPFS API key |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | No | `100` | Max requests per window |
| `LOG_LEVEL` | No | `info` | Log level |

## Project Structure

```
web3-suite-identity-backend/
├── src/
│   ├── index.ts              # Entry point
│   ├── app.ts                # Express app configuration
│   ├── config/
│   │   └── index.ts          # Environment config with Zod validation
│   ├── routes/
│   │   ├── index.ts          # Route aggregator
│   │   ├── did.routes.ts     # DID endpoints
│   │   ├── credential.routes.ts # Credential endpoints
│   │   └── kyc.routes.ts     # KYC endpoints
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── rateLimit.middleware.ts
│   ├── contracts/
│   │   ├── did.contract.ts   # DID contract bindings
│   │   ├── credential.contract.ts
│   │   └── kyc.contract.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── did.types.ts
│   │   ├── credential.types.ts
│   │   └── kyc.types.ts
│   └── utils/
│       ├── logger.ts
│       └── errors.ts
├── tests/
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Security

- **Helmet** for HTTP security headers
- **CORS** configured for cross-origin requests
- **Rate Limiting** to prevent abuse
- **Zod** validation on all request bodies
- **Environment variables** for secrets (never committed)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with ❤️ for the Stellar ecosystem.
