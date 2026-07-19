# Everlight

Dashboard for managing AI voice agents powered by [Vapi](https://vapi.ai).

## Stack

- **SolidJS** + **TanStack Start** — SSR, file-based routing, server functions
- **Tailwind CSS v4** — utility-first styling
- **Better Auth** — authentication (email/password, sessions, email verification, password reset)
- **Drizzle ORM** — type-safe SQL on PostgreSQL
- **Vapi Server SDK** — AI voice agent API client
- **Biome** — linting and formatting
- **Bun** — package manager and runtime
- **Railway** — deployment

## Getting Started

```bash
bun install
bun --bun run dev
```

Requires a local PostgreSQL instance (see `docker-compose.yml`).

## Environment Variables

Copy `.env` (gitignored) with your own values:

```bash
cp .env.example .env
```

All environment variables are validated through Zod schemas in `src/env.ts`.  
**Server-only** variables (e.g. `VAPI_API_KEY`, `DATABASE_URL`) never leak to the client.

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server on port 3000 |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Push migrations to database |
| `bun run test` | Run vitest |
| `bun run lint` | Biome lint |
| `bun run format` | Biome format |
| `bun run check` | Biome lint + format check |

## Project Structure

```
src/
├── env.ts                  # Validated environment variables
├── router.tsx              # TanStack Router factory
├── styles.css              # Tailwind V4 with custom theme (dark mode)
├── db/
│   ├── index.ts            # Drizzle connection
│   └── schema.ts           # DB schema
├── lib/
│   ├── auth.ts             # Better Auth server instance
│   ├── auth-client.ts      # Better Auth Solid client
│   ├── user-provider.tsx   # User/org context provider
│   ├── org-store.ts        # Selected org signal
│   ├── vapi.ts             # Vapi client wrapper
│   ├── api-logger.ts       # API request/response logging
│   └── format.ts           # Format helpers
├── components/
│   ├── ui/                 # Design system components
│   ├── landing/            # Marketing page sections
│   └── dashboard/          # Dashboard widgets
└── routes/                 # File-based routes
    ├── __root.tsx          # Root layout
    ├── index.tsx           # Landing page
    ├── sign-in.tsx         # Sign in
    ├── sign-up.tsx         # Sign up
    ├── dashboard.tsx       # Main dashboard
    ├── users.tsx           # User management
    ├── settings.tsx        # Password change
    └── api/                # Server API routes
```

## Deploy to Railway

Push to GitHub, create a project at https://railway.com, and add the env vars from `.env.example` in production. Railway auto-detects the build from `nixpacks.toml`.
