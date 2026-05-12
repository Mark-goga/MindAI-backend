# Project Overview

## Stack

| Layer           | Technology                               |
|-----------------|------------------------------------------|
| Framework       | NestJS 11                                |
| HTTP Server     | Fastify 5                                |
| Language        | TypeScript 6                             |
| Validation      | Zod 4 + nestjs-zod                       |
| Logging         | nestjs-pino + pino-pretty                |
| API Docs        | @nestjs/swagger (Swagger UI at `/api`)   |
| File handling   | exceljs + file-type + @fastify/multipart |
| Auth            | jsonwebtoken + @fastify/cookie           |
| Testing         | Vitest + @nestjs/testing + supertest     |
| Package manager | Yarn                                     |

## Running the project

```bash
yarn dev          # development with watch
yarn start:prod   # production
yarn build        # compile TypeScript
```

## Environment

Minimum required `.env` (see `.env.example`):

```
PORT=3000
NODE_ENV=dev
```

All env vars are validated at startup via Zod. If a required var is missing, the process exits immediately.

## Current modules

| Module | Routes                | Status      |
|--------|-----------------------|-------------|
| health | `POST /health/status` | Implemented |

## Testing

```bash
yarn test         # unit tests
yarn test:e2e     # end-to-end tests
yarn test:cov     # coverage report
yarn test:watch   # watch mode
```

## Key patterns to know before developing

1. **All responses are wrapped** — `GlobalInterceptor` adds `{ success: true, data: ... }` automatically
2. **All DTOs use Zod** — via `createZodDto`, validated globally by `ZodValidationPipe`
3. **All routes defined in constants** — `ENDPOINTS` in `common/constants/endpoints.constants.ts`
4. **All env vars validated** — `CONFIG` from `common/constants/config.constant.ts`
5. **Path aliases** — always `@common/`, `@modules/`, `@app/` instead of relative paths

## Documentation files

| File                   | Contents                                             |
|------------------------|------------------------------------------------------|
| `OVERVIEW.md`          | This file — stack, commands, key patterns            |
| `ARCHITECTURE.md`      | Folder structure, where code belongs, path aliases   |
| `HOW_TO_ADD_MODULE.md` | Step-by-step guide for creating a new feature module |
