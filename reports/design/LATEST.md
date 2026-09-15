# Design review — LATEST (2026-09-15, round 3)

- Round 3 pass: `reports/design/2026-09-15-1810/` — bots-as-players (ADR-028) + core regression; 5 recommendations, **all applied** (TV lobby fits 16 tagged chips; '＋ Add a bot' chip + ✕ on own bots; muted 'No bots'; glyph-only bot tag; hint copy).
- Round 2 pass: `reports/design/2026-09-15-1730/` — Wisecrack, Lightning Round, five themes (383 stills, `contact-sheet.html`; re-capture in `after/`).
- Themes shipped (user request): Neon Night · Daylight · Retro Arcade · Cozy Cabin · High Contrast — per device, 🎨 on the TV corner and the phone header, `?theme=` for previews. Docs: DESIGN_SYSTEM.md → Themes.
- Round 2 recommendations R-029…R-039: **all 11 applied** (P1 Lightning reveal card; P2 big vote cards, muted "(no answer)", VIP pill removed, reveal rows fit 16; P3 theme polish + consistency).
- Round 1 (`2026-09-15-1619/`): 28/28 applied, merged to main @ f688d60.
- Hand-offs: `2026-09-15-1730/for-games.md` (chip status during Wisecrack answer / Lightning question, reveal timing) · `2026-09-15-1619/for-stress.md`.
- Owner decisions still open: `phaseStartedAt` in the view envelope; `category` on ToastPayload.
- Capture tooling: `packages/e2e/src/design/` (capture-core, -video, -preview, -game, -themes, sheet, measure).
- Not verifiable headless: iOS keyboard vs sticky footer; real 200 % OS text.
- Next round triggers: a new game or core UI change on `main` (say "go", or `/loop 30m` "check main and run the next design round if it changed").
- Tally: open 0 / applied 44 / declined 0 (R-044 chip order → stress session).
