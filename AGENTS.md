# Environment variables

All environment variables must be declared in `src/env.ts` with a proper Zod
validator and consumed by importing `{ env }` from `../env`. Never read
`process.env` directly — the validation catches misconfiguration at startup and
provides correct types.
