# secret-hitler — local rules

- Full spec with rule ids: docs/game-pack/secret-hitler/SPEC.md; README.md is the ≤ 120-line working spec. Build notes: docs/game-pack/secret-hitler/NOTES.md.
- Milestones (SPEC §22): M1 rules is on main; M2 Parliament Noir is in progress (visual pass shipped, simple claims chat added locally; full claims/Record/narrator/room-mode chat remain) → M3 variants/S1 → M4 polish. Don't build ahead.
- Tests are named after rule ids ("R7 …", "D4 …"): every R and D rule has one.
- One file per phase under server/phases/; the order lives in server/flow.ts; D7 exile in server/exile.ts.
- Secrets only in controllerView (views.ts). Views ≤ 4 KB at 10 players with UUID ids (leaks.test.ts).
- Discussion chat is game-local: living players only during claims, 120 characters, 3 s cooldown, six messages retained per discussion. Controller views trim oldest messages to the 4 KB budget; TV/spectators/exiled/ghosts get no transcript. Pausing blocks sends.
- Bots decide from their own controllerView only (server/bot.ts, owner ruling 20).
- The phone uses the SDK FacePicker; its dossier is a game-local folder. `client/cardMode.ts` follows the SecretCard device preference and defaults to tap.
- Imports: only @partybox/game-sdk (+ react in client/). Client never imports server runtime code (types only).
- Fixtures: pnpm sim --game secret-hitler --dump-fixtures --players 7; vetoAsk is hand-made (bots rarely reach it).
- Test: pnpm vitest run games/secret-hitler · pnpm vitest --project contract · pnpm sim --game secret-hitler --players 10 --runs 200
