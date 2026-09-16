# Web3 Suite — Identity Backend

> Production-ready TypeScript/Express.js REST API for Stellar identity — DID management, verifiable credential issuance, and KYC verification backed by Soroban smart contracts.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge)](https://expressjs.com)
[![Stellar](https://img.shields.io/badge/Stellar-Soroban-08B5E5?style=for-the-badge&logo=stellar&logoColor=white)](https://stellar.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Issues](https://img.shields.io/github/issues/sudo-robi/web3-suite-identity-backend)](https://github.com/sudo-robi/web3-suite-identity-backend/issues)
[![Stars](https://img.shields.io/github/stars/sudo-robi/web3-suite-identity-backend)](https://github.com/sudo-robi/web3-suite-identity-backend/stargazers)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
  - [DID Management](#did-management)
  - [Verifiable Credentials](#verifiable-credentials)
  - [KYC Verification](#kyc-verification)
  - [System](#system)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running](#running)
- [Testing](#testing)
- [Deployment](#deployment)
  - [Docker](#docker)
  - [Production Build](#production-build)
- [Environment Variables](#environment-variables)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

### The Problem

Building identity-aware dApps on Stellar requires interacting directly with Soroban smart contracts — constructing transactions, managing keypairs, handling RPC errors, and serializing complex types. This creates a steep barrier for frontend developers, mobile apps, and third-party integrations that just need a simple REST API.

### The Solution

This backend provides a clean RESTful API layer over the Stellar Identity Suite smart contracts. It handles:

- Transaction construction and signing via the Stellar SDK
- Request validation with Zod schemas
- Error normalization into consistent JSON responses
- Rate limiting and security headers
- Structured logging for production observability

### Target Audience

- **Frontend developers** building identity UIs (pairs with the Identity Frontend)
- **Mobile app developers** needing REST endpoints for DID/credential/KYC flows
- **Third-party integrators** connecting existing systems to Stellar identity
- **Enterprise teams** requiring a HIPAA/SOC2-ready API layer

---

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
│  │ /did     │  │ Auth         │  │ Stellar    │  │ DID Registry │  │
│  │ /creds   │  │ Validation   │  │ Client     │  │ Credentials  │  │
│  │ /kyc     │  │ Rate Limit   │  │            │  │ KYC Verif.   │  │
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
│  JSON Response   │
└─────────────────┘
```

---

## Features

1. **RESTful API** — Clean REST endpoints for all identity operations (DID, Credentials, KYC)
2. **Zod Validation** — Request body and query parameter validation with detailed error messages
3. **Type-Safe Contracts** — Full TypeScript bindings for all Soroban smart contract calls
4. **Structured Logging** — Pino-based JSON logging for production observability
5. **Rate Limiting** — Configurable rate limiting to prevent API abuse
6. **Security Headers** — Helmet.js for HTTP security headers (HSTS, CSP, etc.)
7. **CORS Support** — Configurable cross-origin resource sharing
8. **Error Normalization** — Consistent error response format across all endpoints
9. **Docker Ready** — Dockerfile and docker-compose.yml for containerized deployment
10. **Hot Reload** — Development server with tsx watch for instant feedback
11. **Environment Validation** — Startup-time validation of all required environment variables
12. **TypeScript Strict Mode** — Full strict TypeScript with no implicit any

---

## Tech Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Runtime | Node.js | 18+ | JavaScript runtime |
| Language | TypeScript | 5.3 | Type-safe development |
| Framework | Express.js | 4.18 | HTTP server and routing |
| Validation | Zod | 3.22 | Schema-based request validation |
| Blockchain | Stellar SDK | 12.0 | Soroban contract interaction |
| Logging | Pino | 8.17 | Structured JSON logging |
| Security | Helmet | 7.1 | HTTP security headers |
| CORS | cors | 2.8 | Cross-origin configuration |
| Rate Limiting | express-rate-limit | 7.1 | Request throttling |
| Testing | Vitest | 1.1 | Unit and integration testing |
| Linting | ESLint | 8.55 | Code quality enforcement |
| Formatting | Prettier | 3.1 | Code formatting |
| Build | tsc | 5.3 | TypeScript compilation |
| Dev Runner | tsx | 4.6 | TypeScript execution with watch |

---

## Project Structure

```
web3-suite-identity-backend/
├── src/
│   ├── index.ts                      # Entry point — starts the server
│   ├── app.ts                        # Express app configuration
│   │                                 #   - Helmet, CORS, JSON parsing
│   │                                 #   - Rate limiting
│   │                                 #   - Route mounting
│   │                                 #   - Error handler
│   │
│   ├── config/
│   │   └── index.ts                  # Environment config with Zod validation
│   │                                 #   - Parses and validates all env vars
│   │                                 #   - Exits process on invalid config
│   │
│   ├── routes/
│   │   ├── index.ts                  # Route aggregator
│   │   │                             #   - Mounts /did, /credentials, /kyc
│   │   ├── did.routes.ts             # DID management endpoints (6 routes)
│   │   ├── credential.routes.ts      # Credential endpoints (6 routes)
│   │   └── kyc.routes.ts             # KYC endpoints (6 routes)
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts         # Authentication middleware
│   │   ├── validation.middleware.ts   # Zod schema validation
│   │   ├── error.middleware.ts        # Global error handler
│   │   └── rateLimit.middleware.ts    # Rate limiting configuration
│   │
│   ├── services/
│   │   └── stellar.ts                # Unified Stellar RPC client
│   │                                 #   - Singleton SorobanClient
│   │                                 #   - Network passphrase helper
│   │
│   ├── contracts/
│   │   ├── did.contract.ts           # DID Registry contract bindings
│   │   │                             #   - createDID, resolveDID, updateDID
│   │   │                             #   - deactivateDID, transferDID, isActive
│   │   ├── credential.contract.ts    # Credentials contract bindings
│   │   │                             #   - issueCredential, verifyCredential
│   │   │                             #   - revokeCredential, getCredential
│   │   │                             #   - getIssuerCredentials, getSubjectCredentials
│   │   └── kyc.contract.ts           # KYC contract bindings
│   │                                 #   - submitKYC, approveKYC, rejectKYC
│   │                                 #   - verifyKYC, registerVerifier, isVerified
│   │
│   ├── types/
│   │   ├── index.ts                  # Re-exports all types
│   │   ├── did.types.ts              # DID-related TypeScript types
│   │   ├── credential.types.ts       # Credential-related TypeScript types
│   │   └── kyc.types.ts              # KYC-related TypeScript types
│   │
│   └── utils/
│       ├── logger.ts                 # Pino logger configuration
│       └── errors.ts                 # AppError class for typed errors
│
├── tests/                            # Test files
├── Dockerfile                        # Multi-stage Docker build
├── docker-compose.yml                # Docker Compose configuration
├── .env.example                      # Environment variable template
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── tsconfig.build.json               # Build-specific TS config
├── LICENSE                           # MIT License
├── CONTRIBUTING.md                   # Contribution guidelines
└── README.md                         # This file
```

---

## API Reference

All endpoints return JSON responses with the following envelope:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": 1700000000000
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400
  },
  "timestamp": 1700000000000
}
```

### DID Management

#### Create DID

```
POST /api/v1/did
```

**Request Body:**

```json
{
  "owner": "GABC...XYZ",
  "document": "https://example.com/did/doc1"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "tx_hash": "a1b2c3d4e5f6..."
  },
  "timestamp": 1700000000000
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/did \
  -H "Content-Type: application/json" \
  -d '{"owner": "GABC...XYZ", "document": "https://example.com/did/doc1"}'
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 201 | DID created successfully |
| 400 | Invalid request body (validation error) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

#### Resolve DID

```
GET /api/v1/did/:id
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "owner": "GABC...XYZ",
    "document": "https://example.com/did/doc1",
    "created_at": 1700000000,
    "updated_at": 1700000000,
    "active": true
  },
  "timestamp": 1700000000000
}
```

**cURL:**

```bash
curl http://localhost:3000/api/v1/did/a1b2c3d4e5f6...
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200 | DID resolved successfully |
| 404 | DID not found |
| 429 | Rate limit exceeded |

---

#### Update DID

```
PUT /api/v1/did/:id
```

**Request Body:**

```json
{
  "caller": "GABC...XYZ",
  "new_document": "https://example.com/did/doc2"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "tx_hash": "f6e5d4c3b2a1..."
  },
  "timestamp": 1700000000000
}
```

**cURL:**

```bash
curl -X PUT http://localhost:3000/api/v1/did/a1b2c3d4e5f6... \
  -H "Content-Type: application/json" \
  -d '{"caller": "GABC...XYZ", "new_document": "https://example.com/did/doc2"}'
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200 | DID updated successfully |
| 400 | Invalid request body |
| 404 | DID not found |
| 403 | Caller is not the DID owner |

---

#### Deactivate DID

```
DELETE /api/v1/did/:id?caller=GABC...XYZ
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `caller` | string | Yes | DID owner's Stellar address |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "tx_hash": "1a2b3c4d5e6f..."
  },
  "timestamp": 1700000000000
}
```

**cURL:**

```bash
curl -X DELETE "http://localhost:3000/api/v1/did/a1b2c3d4e5f6...?caller=GABC...XYZ"
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200 | DID deactivated successfully |
| 400 | Missing caller parameter |
| 404 | DID not found |
| 403 | Caller is not the DID owner |

---

#### Transfer DID

```
POST /api/v1/did/:id/transfer
```

**Request Body:**

```json
{
  "caller": "GABC...XYZ",
  "new_owner": "GDEF...UVW"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "tx_hash": "6f5e4d3c2b1a..."
  },
  "timestamp": 1700000000000
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/did/a1b2c3d4e5f6.../transfer \
  -H "Content-Type: application/json" \
  -d '{"caller": "GABC...XYZ", "new_owner": "GDEF...UVW"}'
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Ownership transferred |
| 400 | Invalid request body |
| 404 | DID not found |
| 403 | Caller is not the DID owner |

---

#### Check DID Status

```
GET /api/v1/did/check/:id
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "active": true
  },
  "timestamp": 1700000000000
}
```

**cURL:**

```bash
curl http://localhost:3000/api/v1/did/check/a1b2c3d4e5f6...
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Status retrieved (active may be true or false) |
| 429 | Rate limit exceeded |

---

### Verifiable Credentials

#### Issue Credential

```
POST /api/v1/credentials/issue
```

**Request Body:**

```json
{
  "issuer": "GABC...XYZ",
  "subject": "a1b2c3d4e5f6...",
  "credential_type": "ProofOfIdentity",
  "claims": "{\"name\": \"Alice\", \"dob\": \"1990-01-01\"}",
  "expires_at": 1731542400,
  "signature": "sig123..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `issuer` | string | Yes | Issuer's Stellar address |
| `subject` | string | Yes | Subject's DID (32-byte hex) |
| `credential_type` | string | Yes | Credential type identifier |
| `claims` | string | Yes | Claims payload (typically JSON) |
| `expires_at` | number | No | Expiry as Unix timestamp |
| `signature` | string | Yes | Cryptographic signature |

**Response (201):**

```json
{
  "success": true,
  "data": {
    "tx_hash": "b2c3d4e5f6a1..."
  },
  "timestamp": 1700000000000
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/credentials/issue \
  -H "Content-Type: application/json" \
  -d '{
    "issuer": "GABC...XYZ",
    "subject": "a1b2c3d4e5f6...",
    "credential_type": "ProofOfIdentity",
    "claims": "{\"name\": \"Alice\"}",
    "signature": "sig123..."
  }'
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 201 | Credential issued successfully |
| 400 | Invalid request body |
| 429 | Rate limit exceeded |

---

#### Get Credential

```
GET /api/v1/credentials/:id
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "issuer": "GABC...XYZ",
    "subject": "a1b2c3d4e5f6...",
    "credential_type": "ProofOfIdentity",
    "claims": "{\"name\": \"Alice\"}",
    "issued_at": 1700000000,
    "expires_at": 1731542400,
    "revoked": false,
    "signature": "sig123..."
  },
  "timestamp": 1700000000000
}
```

**cURL:**

```bash
curl http://localhost:3000/api/v1/credentials/b2c3d4e5f6a1...
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Credential retrieved |
| 404 | Credential not found |

---

#### Verify Credential

```
POST /api/v1/credentials/:id/verify
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "valid": true
  },
  "timestamp": 1700000000000
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/credentials/b2c3d4e5f6a1.../verify
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Verification result returned |
| 429 | Rate limit exceeded |

---

#### Revoke Credential

```
POST /api/v1/credentials/:id/revoke
```

**Request Body:**

```json
{
  "caller": "GABC...XYZ"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "tx_hash": "c3d4e5f6a1b2..."
  },
  "timestamp": 1700000000000
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/credentials/b2c3d4e5f6a1.../revoke \
  -H "Content-Type: application/json" \
  -d '{"caller": "GABC...XYZ"}'
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Credential revoked |
| 400 | Invalid request body |
| 404 | Credential not found |
| 403 | Caller is not the issuer |

---

#### List Credentials by Issuer

```
GET /api/v1/credentials/issuer/:address
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    "b2c3d4e5f6a1...",
    "d4e5f6a1b2c3...",
    "f6a1b2c3d4e5..."
  ],
  "timestamp": 1700000000000
}
```

**cURL:**

```bash
curl http://localhost:3000/api/v1/credentials/issuer/GABC...XYZ
```

---

#### List Credentials by Subject

```
GET /api/v1/credentials/subject/:did
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    "b2c3d4e5f6a1...",
    "e5f6a1b2c3d4..."
  ],
  "timestamp": 1700000000000
}
```

**cURL:**

```bash
curl http://localhost:3000/api/v1/credentials/subject/a1b2c3d4e5f6...
```

---

### KYC Verification

#### Submit KYC

```
POST /api/v1/kyc/submit
```

**Request Body:**

```json
{
  "applicant": "GABC...XYZ",
  "did_id": "a1b2c3d4e5f6...",
  "level": 2,
  "data_hash": "hash123..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `applicant` | string | Yes | Applicant's Stellar address |
| `did_id` | string | Yes | Applicant's DID (32-byte hex) |
| `level` | number | Yes | KYC level: 1 (Basic), 2 (Enhanced), 3 (Institutional) |
| `data_hash` | string | Yes | Hash of supporting documents |

**Response (201):**

```json
{
  "success": true,
  "data": {
    "tx_hash": "d4e5f6a1b2c3..."
  },
  "timestamp": 1700000000000
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/kyc/submit \
  -H "Content-Type: application/json" \
  -d '{
    "applicant": "GABC...XYZ",
    "did_id": "a1b2c3d4e5f6...",
    "level": 2,
    "data_hash": "hash123..."
  }'
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 201 | KYC application submitted |
| 400 | Invalid request body |
| 409 | Active KYC application already exists |

---

#### Approve KYC

```
POST /api/v1/kyc/approve
```

**Request Body:**

```json
{
  "applicant": "GABC...XYZ",
  "verifier": "GDEF...UVW",
  "data_hash": "hash123..."
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "tx_hash": "e5f6a1b2c3d4..."
  },
  "timestamp": 1700000000000
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/kyc/approve \
  -H "Content-Type: application/json" \
  -d '{
    "applicant": "GABC...XYZ",
    "verifier": "GDEF...UVW",
    "data_hash": "hash123..."
  }'
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200 | KYC approved |
| 400 | Invalid request body |
| 403 | Verifier not registered |
| 404 | KYC application not found |

---

#### Reject KYC

```
POST /api/v1/kyc/reject
```

**Request Body:**

```json
{
  "applicant": "GABC...XYZ",
  "verifier": "GDEF...UVW",
  "reason": "Insufficient documentation"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "tx_hash": "f6a1b2c3d4e5..."
  },
  "timestamp": 1700000000000
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/kyc/reject \
  -H "Content-Type: application/json" \
  -d '{
    "applicant": "GABC...XYZ",
    "verifier": "GDEF...UVW",
    "reason": "Insufficient documentation"
  }'
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200 | KYC rejected |
| 400 | Invalid request body |
| 403 | Verifier not registered |
| 404 | KYC application not found |

---

#### Get KYC Status

```
GET /api/v1/kyc/status/:address
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "did_id": "a1b2c3d4e5f6...",
    "level": 2,
    "verifier": "GDEF...UVW",
    "verified_at": 1700000000,
    "expires_at": 1731542400,
    "data_hash": "hash123...",
    "status": "Approved"
  },
  "timestamp": 1700000000000
}
```

**cURL:**

```bash
curl http://localhost:3000/api/v1/kyc/status/GABC...XYZ
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200 | KYC status retrieved |
| 404 | No KYC record found |

---

#### Register Verifier

```
POST /api/v1/kyc/verifier/register
```

**Request Body:**

```json
{
  "admin": "GABC...XYZ",
  "verifier": "GDEF...UVW"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "tx_hash": "a1b2c3d4e5f6..."
  },
  "timestamp": 1700000000000
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/kyc/verifier/register \
  -H "Content-Type: application/json" \
  -d '{"admin": "GABC...XYZ", "verifier": "GDEF...UVW"}'
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 201 | Verifier registered |
| 400 | Invalid request body |
| 403 | Caller is not the admin |

---

#### Check KYC Verification Level

```
GET /api/v1/kyc/verify/:address?level=2
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `level` | number | No | 1 | Required KYC level (1-3) |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "verified": true,
    "required_level": 2
  },
  "timestamp": 1700000000000
}
```

**cURL:**

```bash
curl "http://localhost:3000/api/v1/kyc/verify/GABC...XYZ?level=2"
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Verification check completed |

---

### System

#### Health Check

```
GET /health
```

**Response (200):**

```json
{
  "status": "ok",
  "uptime": 3600,
  "timestamp": 1700000000000
}
```

**cURL:**

```bash
curl http://localhost:3000/health
```

---

#### API Info

```
GET /api/v1/info
```

**Response (200):**

```json
{
  "name": "web3-suite-identity-backend",
  "version": "1.0.0",
  "network": "testnet"
}
```

**cURL:**

```bash
curl http://localhost:3000/api/v1/info
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18.0.0
- npm or yarn
- A Stellar account with testnet tokens
- Deployed Soroban contracts (see [Identity Contracts](../contracts/README.md))

### Installation

```bash
# Clone the repository
git clone https://github.com/sudo-robi/web3-suite-identity-backend.git
cd web3-suite-identity-backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration (see Configuration section)
```

### Configuration

Edit `.env` with your settings:

```env
# Server
PORT=3000
NODE_ENV=development

# Stellar / Soroban
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_NETWORK=testnet
STELLAR_SECRET_KEY=your-secret-key-here

# Contract IDs (from deployment)
CONTRACT_ID_DID=your-deployed-did-contract-id
CONTRACT_ID_CREDENTIALS=your-deployed-credentials-contract-id
CONTRACT_ID_KYC=your-deployed-kyc-contract-id

# Optional: IPFS
# IPFS_API_URL=https://ipfs.example.com
# IPFS_API_KEY=your-ipfs-api-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Running

```bash
# Development server with hot reload
npm run dev

# The server will start at http://localhost:3000
```

---

## Testing

```bash
# Run all tests
npm test

# Run tests once (no watch)
npm run test:run

# Run tests with coverage
npm run test:coverage

# Type check without emitting
npm run typecheck

# Lint
npm run lint

# Format
npm run format
```

---

## Deployment

### Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Production Build

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode (`development`, `production`, `test`) |
| `SOROBAN_RPC_URL` | Yes | — | Soroban RPC endpoint URL |
| `STELLAR_NETWORK` | Yes | — | Network passphrase (`testnet`, `mainnet`, `standalone`) |
| `STELLAR_SECRET_KEY` | Yes | — | Stellar secret key for signing transactions |
| `CONTRACT_ID_DID` | Yes | — | Deployed DID Registry contract ID |
| `CONTRACT_ID_CREDENTIALS` | Yes | — | Deployed Credentials contract ID |
| `CONTRACT_ID_KYC` | Yes | — | Deployed KYC contract ID |
| `IPFS_API_URL` | No | — | IPFS API endpoint for document storage |
| `IPFS_API_KEY` | No | — | IPFS API authentication key |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate limit window in milliseconds (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | No | `100` | Maximum requests per rate limit window |
| `LOG_LEVEL` | No | `info` | Log level (`error`, `warn`, `info`, `debug`) |

---

## Security

- **Helmet** — HTTP security headers (HSTS, CSP, X-Frame-Options, etc.)
- **CORS** — Configurable cross-origin resource sharing
- **Rate Limiting** — IP-based rate limiting to prevent abuse
- **Zod Validation** — All request bodies validated against strict schemas
- **Environment Variables** — Secrets stored in `.env`, never committed to git
- **Pino Logging** — Structured JSON logs for security event auditing
- **No Secret Logging** — Secret keys are never logged or included in error messages

---

## Contributing

### Branch Naming

| Prefix | Use Case |
|--------|----------|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation changes |
| `refactor/` | Code restructuring |
| `test/` | Adding or updating tests |
| `chore/` | Maintenance tasks |

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(did): add batch DID creation endpoint
fix(credentials): handle expired credential edge case
test(kyc): add verifier registration integration tests
docs: update API reference
```

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Write tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Ensure TypeScript compiles (`npm run typecheck`)
6. Ensure linting passes (`npm run lint`)
7. Commit your changes (`git commit -m 'feat: add my feature'`)
8. Push to the branch (`git push origin feat/my-feature`)
9. Open a Pull Request with a clear description

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with ❤️ for the Stellar ecosystem.
