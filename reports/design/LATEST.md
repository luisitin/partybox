# Design review — LATEST (2026-09-15, round 2)

- Round 2 pass: `reports/design/2026-09-15-1730/` — Wisecrack, Lightning Round, five themes (383 stills, `contact-sheet.html`; re-capture in `after/`).
- Themes shipped (user request): Neon Night · Daylight · Retro Arcade · Cozy Cabin · High Contrast — per device, 🎨 on the TV corner and the phone header, `?theme=` for previews. Docs: DESIGN_SYSTEM.md → Themes.
- Round 2 recommendations R-029…R-039: **all 11 applied** (P1 Lightning reveal card; P2 big vote cards, muted "(no answer)", VIP pill removed, reveal rows fit 16; P3 theme polish + consistency).
- Round 1 (`2026-09-15-1619/`): 28/28 applied, merged to main @ f688d60.
- Hand-offs: `2026-09-15-1730/for-games.md` (chip status during Wisecrack answer / Lightning question, reveal timing) · `2026-09-15-1619/for-stress.md`.
- Owner decisions still open: `phaseStartedAt` in the view envelope; `category` on ToastPayload.
- Capture tooling: `packages/e2e/src/design/` (capture-core, -video, -preview, -game, -themes, sheet, measure).
- Not verifiable headless: iOS keyboard vs sticky footer; real 200 % OS text.
- Next round triggers: a new game or core UI change on `main`.
- Tally: open 0 / applied 39 / declined 0.
