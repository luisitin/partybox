# host — local rules

- Platform-neutral (ADR-034): no `node:*`, no Socket.IO, no DOM, no React. Web Crypto only.
- Timers: `setTimeout` / `clearTimeout` via `ReturnType<typeof setTimeout>`, never `NodeJS.Timeout`.
- Exactly one pending timer per room, re-derived from `nextWakeAt` after every event (ADR-004).
- Every `now` comes from the injected `Clock`; never call `Date.now()` directly.
- I/O goes through `Transport` only. Adding a wire event means adding it to `docs/PROTOCOL.md` too.
- Both callers must keep working: `packages/server` (LAN) and `packages/web` (GitHub Pages).
- Run: `pnpm vitest --project host`.
