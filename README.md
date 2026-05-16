# MindAI Backend

## Setup

Requires **Node.js 24+**, **Yarn**, and **PostgreSQL**.

```bash
cp .env.example .env
# fill in required values in .env

yarn install
yarn db:migrate
yarn dev
```

Swagger UI: `http://localhost:3000/api`

## Scripts

```bash
yarn dev          # development with watch
yarn build        # compile TypeScript
yarn start:prod   # production
yarn swagger:generate # generate swagger.json and swagger.yaml
yarn db:generate  # generate Drizzle SQL migrations
yarn db:migrate   # apply Drizzle migrations to Postgres
yarn db:studio    # open Drizzle Studio

yarn test         # unit tests (vitest)
yarn test:e2e     # end-to-end tests
yarn test:cov     # coverage report
yarn test:watch   # watch mode
```

## Pre-commit

Husky runs `yarn pre:commit` on every commit — formats, builds, lints, and runs tests.

## Docs

See [`docks/`](./docks) for full documentation:

- [`OVERVIEW.md`](./docks/OVERVIEW.md) — stack and key patterns
- [`ARCHITECTURE.md`](./docks/ARCHITECTURE.md) — folder structure and where code belongs
- [`HOW_TO_ADD_MODULE.md`](./docks/HOW_TO_ADD_MODULE.md) — step-by-step module creation
