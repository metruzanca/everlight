# Solidjs

# createResource and Suspense

A `createResource` signal must be consumed inside of a `<Suspense>` boundary.
If consumed outside one, SolidJS walks up the component tree until it finds a
`<Suspense>` ancestor and unmounts everything between — flushing any pending
state.

# Error Boundaries

Every significant UI block should have an ErrorBoundary.

# Environment variables

All environment variables must be declared in `src/env.ts` with a proper Zod
validator and consumed by importing `{ env }` from `../env`. Never read
`process.env` directly — the validation catches misconfiguration at startup and
provides correct types.

# Tables

When a table renders more than a few columns of data, use `@tanstack/solid-table`
instead of ad-hoc markup. Define columns via `createColumnHelper`, build the
table with `createSolidTable`, and render with `flexRender`.
