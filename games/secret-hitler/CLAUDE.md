# secret-hitler — local rules

- Full spec with rule ids: docs/game-pack/secret-hitler/SPEC.md; README.md is the ≤ 120-line working spec. Build notes: docs/game-pack/secret-hitler/NOTES.md.
- Milestones (SPEC §22): M1 rules + plain screens (this) → M2 Parliament Noir → M3 variants/S1 → M4 polish. Don't build ahead.
- Tests are named after rule ids ("R7 …", "D4 …"): every R and D rule has one.
- One file per phase under server/phases/; the order lives in server/flow.ts; D7 exile in server/exile.ts.
- Secrets only in controllerView (views.ts). Views ≤ 4 KB at 10 players with UUID ids (leaks.test.ts).
- Bots decide from their own controllerView only (server/bot.ts, owner ruling 20).
- client/standin/ holds SecretCard + FacePicker stand-ins: swap to the SDK ones when Imposter's land on main.
- Imports: only @partybox/game-sdk (+ react in client/). Client never imports server runtime code (types only).
- Fixtures: pnpm sim --game secret-hitler --dump-fixtures --players 7; vetoAsk is hand-made (bots rarely reach it).
- Test: pnpm vitest run games/secret-hitler · pnpm vitest --project contract · pnpm sim --game secret-hitler --players 10 --runs 200
