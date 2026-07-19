# Code Review

## 🔴 Critical

- [ ] **Vapi API endpoints have no org-membership validation (IDOR)** — `src/routes/api/vapi/stats.ts:9-19`, `src/routes/api/vapi/calls.ts:9-19`. `orgId=all` grants unrestricted access to any authenticated user. No membership check when a specific `orgId` is provided. Reuse `getUserAssistantIds` from `src/lib/vapi.ts:42` which already implements these checks.
- [ ] **Business hours evaluated in server timezone, not configured timezone** — `src/lib/vapi.ts:78-81`. Uses `date.getHours()` / `date.getDay()` (server local time) but `businessHours.timezone` is `'America/New_York'`. Use `Intl.DateTimeFormat` with the configured timezone.
- [ ] **Zero test coverage** — `vitest`, `@solidjs/testing-library`, `jsdom` installed but unused. No test files exist.
- [ ] **No CI/CD** — No `.github/` directory, no automated checks on push/PR.

## 🟠 High

## 🟡 Medium

- [ ] **`createSolidTable` recreated on every render** — `src/routes/users.tsx:227-239`. Wrap in `createMemo`.
- [ ] **Invite tokens in URL query params** — `src/routes/api/invites.ts:13`. Exposed to browser history, server logs, Referer header. Use POST body only.
- [ ] **Missing security headers** — No CSP, HSTS, X-Frame-Options, X-Content-Type-Options. Add at Nitro/reverse proxy layer.
- [ ] **No session expiry configured** — `src/lib/auth.ts`. Configure `session.expiresIn` and `session.updateAge`.
- [ ] **`useContext(UserContext)!` without descriptive error** — `src/lib/user-provider.tsx:77`. Throw `'useUserContext must be used within a UserProvider'`.
- [ ] **`createEffect` for redirect in sign-in** — `src/routes/sign-in.tsx:20-24`. Use TanStack Router `beforeLoad` guard instead.

## 🔵 Low

- [ ] **No git hooks** — Add husky + lint-staged for pre-commit.
- [ ] **Missing test scripts** — `package.json`. Add `test:watch`, `test:coverage`, `typecheck`.
- [ ] **Regex patterns recompiled each time** — `src/routes/dashboard.tsx:164`. Extract to module-level `const BOOKING_PATTERN`.
