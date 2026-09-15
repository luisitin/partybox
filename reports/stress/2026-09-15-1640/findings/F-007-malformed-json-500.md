# F-007 — Malformed JSON on any POST answers 500 Internal Server Error

- **Severity:** P3 (robustness; no crash, but a client error reported as a server fault)
- **Game / phase:** server / HTTP (all `/api/dev/*` POST routes, and any future POST)
- **Category:** Protocol (malformed JSON)
- **Status:** FIXED — `fix(server): F-007 bad JSON bodies are a 400`

## Repro

```
curl -i -X POST :42070/api/dev/clock -H 'content-type: application/json' -d '{'
pnpm sim --net --port 42070 --only http
pnpm vitest run --project server -t "F-007"
```

## Observed

`HTTP/1.1 500 {"statusCode":500,"error":"Internal Server Error","message":"Expected property name or '}' in JSON at position 1"}`
and `connection: close`.

## Expected

400 Bad Request (Fastify's built-in JSON parser does that; docs/PROTOCOL.md's spirit: "invalid →
error back to the sender").

## Root cause

`packages/server/src/app.ts:74` — the custom `application/json` parser (added so an empty body parses
as `{}`) forwards the `SyntaxError` without a `statusCode`, and Fastify maps unknown errors to 500.

## Fix

Set `statusCode = 400` on the error before `done(err)`. 1 line.

## Regression test

`packages/server/src/app.test.ts` — "F-007: malformed JSON bodies are a 400, not a 500".
