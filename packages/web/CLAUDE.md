# web — local rules

- ADR-034. Read `WEB_DEPLOY.md` first; it is the contract between this build and the LAN one.
- Reuse `@partybox/client` (its `src/index.ts` barrel). Never copy a screen — export it instead.
- No `packages/server` imports and no `node:*`: this build has no Node process behind it.
- `src/net/room-host.ts` mirrors `packages/server/src/sockets.ts`. Change one, change the other.
- Same zod schemas, same rate limits as the LAN wire: a peer is no more trusted than a phone.
- One client = one player AND one stage. Stage events are the `tv:` prefix, both directions.
- Nobody gets the TV's no-VIP-check powers (ADR-031): the stage is each player's own screen.
- Run: `pnpm web`. Test: `pnpm vitest --project web`.
