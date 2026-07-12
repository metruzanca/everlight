# Vapi Dashboard — Feature & Implementation Plan

## Status Key

| Badge | Meaning |
|-------|---------|
| ✅ | Implemented |
| ❓ | Needs discovery (depends on assistant config) |
| 🔮 | Post-MVP / future feature |
| ❌ | Blocked (needs prerequisite) |

---

## Phase 1 — Foundation

| # | Task | Status | File(s) | Depends On |
|---|------|--------|---------|------------|
| 1 | Install `@vapi-ai/server-sdk` | ✅ | `package.json` | — |
| 2 | Add `VAPI_API_KEY` to `.env.local` + `src/env.ts` | ✅ | `.env.local`, `src/env.ts` | — |
| 3 | Create `src/lib/vapi.ts` (server-only Vapi client wrapper) | ✅ | `src/lib/vapi.ts` | #1, #2 |
| 4 | Create `src/routes/api/vapi/stats.ts` (aggregated stats endpoint) | ✅ | `src/routes/api/vapi/stats.ts` | #3 |
| 5 | Create `src/routes/api/vapi/calls.ts` (paginated call log endpoint) | ✅ | `src/routes/api/vapi/calls.ts` | #3 |
| 6 | Protect API routes behind session check | ✅ | `src/routes/api/vapi/*` | #4, #5 |

## Phase 2 — Dashboard Metrics

| # | Metric | Source | Status | Notes |
|---|--------|--------|--------|-------|
| 7 | **Total Calls (Lifetime)** | Vapi analytics `count` | ✅ | Single count query |
| 8 | **Calls Answered** | Vapi analytics `count` filtered by successful `endedReason` | ✅ | Filtered on success end-reason codes |
| 9 | **Average Call Length** | Vapi analytics `avg` on `duration` | ✅ | Single analytics query |
| 10 | **After-Hours Calls Captured** | `GET /call` filtered by `startedAt` outside business hours | ✅ | Client-side filtering, configurable hours |
| 11 | **Appointments Booked** | ❓ Depends on assistant config | ❓ | See discovery notes below |
| 12 | **Appointment Booking Ratio** | Computed: Booked ÷ Answered | ❌ | Blocked on #11 |
| 13 | **Customers Waiting for Follow-up** | Requires user input + local DB table | 🔮 | Post-MVP — needs feature design |
| 14 | **Call Logs (table of recent calls)** | `GET /call` paginated | ✅ | List endpoint |
| 15 | **AI Call Summaries** | `call.analysis.summary` | 🔮 | Post-MVP — display in call detail |
| 16 | **Full Searchable Call Database** | Local DB + sync via Vapi webhooks | 🔮 | Post-MVP — significant scope |
| 17 | **Daily Performance Snapshot** | Analytics with `timeRange.step: "day"` | 🔮 | Post-MVP |

## Phase 3 — Dashboard UI

| # | Task | Status | File(s) | Depends On |
|---|------|--------|---------|------------|
| 18 | Metric card grid (stat cards) | ✅ | `src/routes/dashboard.tsx` | #7–#10 |
| 19 | Recent calls table | ✅ | `src/routes/dashboard.tsx` | #14 |
| 20 | Loading/error/empty states | ✅ | `src/routes/dashboard.tsx` | — |
| 21 | Appointments Booked card (placeholder) | ✅ | `src/routes/dashboard.tsx` | #11 |
| 22 | Booking Ratio card (placeholder) | ✅ | `src/routes/dashboard.tsx` | #11 |
| 23 | Multi-org banner ("coming soon") | ✅ | `src/routes/dashboard.tsx` | — |
| 24 | Sign-in redirect to `/dashboard` when already logged in | ✅ | `src/routes/sign-in.tsx` | — |

---

## ❓ Discovery Needed: Appointments Booked

This metric depends on how the Vapi assistant is configured. Three approaches:

| Approach | Works If | Effort | Reliability |
|----------|----------|--------|-------------|
| **A. Structured data extraction** | Assistant has `structuredData` extraction configured for bookings | Low — read existing field | High (if configured) |
| **B. Summary keyword matching** | Assistant summaries mention "booked", "confirmed", "appointment" | Low — regex on `analysis.summary` | Medium (false positives) |
| **C. Custom tool webhook** | Assistant calls an Everlight webhook endpoint on booking | Medium — build endpoint + DB | High |

**Current implementation**: Approach B (keyword match) as a fallback. The card shows ❓ with a note to verify with the Vapi team. Once confirmed, switch to Approach A.

## Business Hours

After-hours detection uses the window `09:00–17:00` Monday–Friday (configurable in `src/lib/vapi.ts`). Update the `businessHours` object to match the other team's operating hours.
