# Code Review

## 🔴 Critical

- [ ] **Vapi API endpoints have no org-membership validation (IDOR)** — `src/routes/api/vapi/stats.ts:9-19`, `src/routes/api/vapi/calls.ts:9-19`. `orgId=all` grants unrestricted access to any authenticated user. No membership check when a specific `orgId` is provided. Reuse `getUserAssistantIds` from `src/lib/vapi.ts:42` which already implements these checks.
- [x] **Biome config broken for v2** — `biome.json` schema `1.9.4` vs installed CLI `2.4.5`. Deprecated keys: `"ignore"` → `"ignores"`, `"include"` → `"includes"`, `"organizeImports"` removed. Run `bunx biome migrate`.
- [ ] **Business hours evaluated in server timezone, not configured timezone** — `src/lib/vapi.ts:78-81`. Uses `date.getHours()` / `date.getDay()` (server local time) but `businessHours.timezone` is `'America/New_York'`. Use `Intl.DateTimeFormat` with the configured timezone.
- [ ] **Zero test coverage** — `vitest`, `@solidjs/testing-library`, `jsdom` installed but unused. No test files exist.
- [ ] **No CI/CD** — No `.github/` directory, no automated checks on push/PR.

## 🟠 High

- [ ] **Org switcher triggers full page reload** — `src/components/ui/org-switcher.tsx:28`. `window.location.reload()` defeats SPA reactivity. Remove reload and make dashboard reactive to org changes.
- [ ] **Dashboard resources don't reactively track org changes** — `src/routes/dashboard.tsx:71-93`. Both `createResource` calls only track `shouldFetch`, not `orgId`. Change source to `createResource(() => ({ fetch: shouldFetch(), orgId: getSelectedOrgId()() }), fetcher)`.
- [ ] **`resolveOrgAssistantIds` duplicated** — `src/routes/api/vapi/stats.ts:9-19` and `src/routes/api/vapi/calls.ts:9-19`. Extract to `src/lib/vapi.ts`.
- [ ] **`formatDuration` duplicated** — `src/lib/format.ts:1-4` vs `src/components/dashboard/stat-cards.tsx:97-101`. Import from `../../lib/format`.
- [ ] **Duplicate type definitions** — `src/routes/dashboard.tsx:19-39`. `VapiStats` and `VapiCallLogEntry` redefined locally when they exist in `src/lib/vapi.ts:56-76`. Import from there.
- [ ] **No rate limiting** — Auth endpoints, invite creation, Vapi proxy have no rate limiting. Brute force / cost-abuse vectors open.
- [ ] **`GET /api/users` leaks all user data to any authenticated user** — `src/routes/api/users.ts:11-36`. Restrict to site admins or scope to user's own orgs.
- [ ] **No upper bound on Vapi `limit` parameter** — `src/routes/api/vapi/calls.ts:29`. `?limit=1000000` triggers expensive API call. Use Zod schema with `.max(100)`.
- [ ] **Race condition in first-user-as-admin logic** — `src/lib/auth.ts:40-43`. Two simultaneous signups can both become admin. Use a dedicated flag table or advisory lock.
- [ ] **Module-level singleton signal in `org-store.ts`** — `src/lib/org-store.ts:20`. Shared across sessions/tabs. Tie to session lifecycle in `UserProvider`.
- [ ] **Silent failure in dashboard `onMount`** — `src/routes/dashboard.tsx:105`. Empty `catch {}` — if org-check fetch fails, dashboard stuck in loading. Log error, call `triggerFetch(true)` in `finally`.
- [ ] **No Zod input validation on API routes** — All POST/PATCH endpoints use manual truthy checks. Create shared Zod schemas.
- [ ] **Auth check duplicated across 8 API files** — Every route repeats `auth.api.getSession()` + error check. Create `requireAuth(request)` helper.

## 🟡 Medium

- [ ] **`createSolidTable` recreated on every render** — `src/routes/users.tsx:227-239`. Wrap in `createMemo`.
- [ ] **Non-null assertions on potentially null values (10+ instances)** — `src/routes/__root.tsx:71,75`, `src/routes/reset-password.tsx:43`, `src/components/dashboard/spend-chart.tsx:100,162-197`, `src/routes/users.tsx:418`. Replace with optional chaining / guard checks.
- [ ] **Invite tokens in URL query params** — `src/routes/api/invites.ts:13`. Exposed to browser history, server logs, Referer header. Use POST body only.
- [ ] **Missing security headers** — No CSP, HSTS, X-Frame-Options, X-Content-Type-Options. Add at Nitro/reverse proxy layer.
- [ ] **Error messages leak internals** — `src/lib/api-logger.ts:22-28`. Returns `err.message` in 500 responses. Return generic message in production.
- [ ] **No server-side password strength** — `src/lib/auth.ts`. Add `minPasswordLength: 8` to `emailAndPassword` config.
- [ ] **No session expiry configured** — `src/lib/auth.ts`. Configure `session.expiresIn` and `session.updateAge`.
- [ ] **`useContext(UserContext)!` without descriptive error** — `src/lib/user-provider.tsx:77`. Throw `'useUserContext must be used within a UserProvider'`.
- [ ] **`createEffect` for redirect in sign-in** — `src/routes/sign-in.tsx:20-24`. Use TanStack Router `beforeLoad` guard instead.
- [ ] **Empty catch blocks** — `src/routes/dashboard.tsx:105`, `src/lib/org-store.ts:9,16`, `src/routes/__root.tsx:73-79`. Always log in `catch`.

## 🔵 Low

- [x] **README is unmodified boilerplate** — `README.md`. Customize for the project.
- [ ] **No git hooks** — Add husky + lint-staged for pre-commit.
- [ ] **Missing test scripts** — `package.json`. Add `test:watch`, `test:coverage`, `typecheck`.
- [x] **`nixpacks.toml` uses npm** — Switch to `bun install && bun run build`.
- [x] **Uses `.env.local` (non-standard)** — Standard is `.env`.
- [ ] **`alert()` for errors** — `src/routes/users.tsx:56,82,109,130`. Use inline toast/banner.
- [x] **Biome scope too narrow** — `biome.json`. Include `scripts/`, `docs/`, config files.
- [ ] **`as Component<any>` on error boundary** — `src/routes/__root.tsx:40`. Properly type the error component.
- [ ] **Regex patterns recompiled each time** — `src/routes/dashboard.tsx:164`. Extract to module-level `const BOOKING_PATTERN`.
