# Dependencies

One line per package and why it exists. `pnpm verify` fails if a dependency in any `package.json` has no
line here (match is on the backticked name). Versions live in `pnpm-workspace.yaml` `catalog:` when shared.

## Runtime

| Package              | Where                                   | Why                                                                                                                |
| -------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `zod`                | shared                                  | schema validation for protocol payloads, manifests, content packs and game inputs; the only dependency of `shared` |
| `fastify`            | server                                  | HTTP server: static files, dev API, health; fast and well documented                                               |
| `@fastify/static`    | server                                  | serves the built client in `pnpm start`                                                                            |
| `@fastify/middie`    | server                                  | mounts Vite's connect middleware in dev so there is one port (ADR-006)                                             |
| `socket.io`          | server                                  | rooms, reconnection, heartbeats and binary-safe events out of the box                                              |
| `socket.io-client`   | client                                  | matching client with auto-reconnect                                                                                |
| `qrcode`             | server                                  | renders the join URL as an SVG QR code locally (no network, ADR-012)                                               |
| `vite`               | client (build), server (dev middleware) | bundler + dev server with HMR; middleware mode keeps one port                                                      |
| `react`, `react-dom` | client, game-sdk, games                 | UI; lazy-loaded game modules; the most widely known choice for AI sessions                                         |
| `tsx`                | root                                    | runs TypeScript directly for the server, scripts, sim and e2e (ADR-007)                                            |
| `cross-env`          | root                                    | sets `NODE_ENV` in `pnpm start` on Windows and POSIX alike                                                         |

## Development

| Package                                                            | Where                          | Why                                                                             |
| ------------------------------------------------------------------ | ------------------------------ | ------------------------------------------------------------------------------- |
| `typescript`                                                       | root                           | 6.0.x; the last line typescript-eslint supports (ADR-001)                       |
| `@types/node`, `@types/react`, `@types/react-dom`, `@types/qrcode` | root / client / games / server | type definitions                                                                |
| `@vitejs/plugin-react`                                             | client                         | JSX transform + fast refresh for Vite                                           |
| `vitest`, `@vitest/coverage-v8`                                    | root                           | unit + contract tests, per-package projects, coverage thresholds for the engine |
| `eslint`, `typescript-eslint`                                      | root                           | lint + import boundaries + purity rules for game server code                    |
| `eslint-plugin-react-hooks`                                        | root                           | rules-of-hooks for client and game components                                   |
| `dependency-cruiser`                                               | root                           | path-level dependency direction rules (`.dependency-cruiser.cjs`)               |
| `prettier`                                                         | root                           | formatting; `pnpm format:check` is part of verify                               |
| `playwright`                                                       | e2e                            | real Chromium with iPhone/Pixel device profiles for `pnpm e2e` and screenshots  |

## Explicitly not used

Tailwind, a router, Redux/Zustand, commitlint/husky, a database, any CDN — see ADR-011, ADR-013, ADR-012.
