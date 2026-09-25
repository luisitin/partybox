# Game pack — the owner's decisions

The owner's rulings on the Foundation audit (`FOUNDATION-AUDIT.md`, "Open questions for the owner").
Where the audit corrects Part 00, the audit's proposed fix stands; where a ruling below differs from
both, the ruling wins. Code ADRs land in `docs/DECISIONS.md` with the F-task that implements them.

## 2026-09-24 — all 20 recommendations applied

| #   | Question                                  | Ruling                                                                                                                                                                                    |
| --- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Presence in `init`                        | Yes: optional `InitContext.presence` and `PlayerInfo.canSeeTv` (ADR-047); brief rule 13 amended ("presence fixed at start is not carry-over"). No `__presence` fallback.                  |
| 2   | Suggest vs I-650 votes                    | Suggest sends the existing `vote`; the vote case adds a toast ("👍 Maya suggests Fake-Out"), at most one per player per 10 s. The 🙋 counts stay; the chip cloud retires.                 |
| 3   | Sort order                                | Fits the room → votes → NEW → A–Z.                                                                                                                                                        |
| 4   | Tags                                      | Fixed list plus `classic` (Bingo). `quick` is derived (`estimatedMinutes ≤ 8`), never hand-set. A Comedy chip. Blanks' 🔞 stays on its key-setting chip.                                  |
| 5   | `addedOn` of the five existing games      | A date before the NEW window (`2026-01-01`): NEW means the pack.                                                                                                                          |
| 6   | Picker entry                              | "Pick a game" opens the list with nothing chosen: `selectGame.gameId` becomes nullable.                                                                                                   |
| 7   | TV after choosing                         | Keep today's editable settings card (ADR-031). Keyboard navigation later.                                                                                                                 |
| 8   | Catalog delivery                          | One socket event on welcome / TV hello / resend; plus the `highlight` action and the nullable `selectGame` — all within §2.3's "no new message".                                          |
| 9   | Start's settings                          | Tonight's tuned settings (I-763), not the factory defaults.                                                                                                                               |
| 10  | Phone / TV entries                        | `games/<id>/client/phone.ts` and `tv.ts` per game: one hop, phones never fetch TV code.                                                                                                   |
| 11  | F1 scope                                  | HTTP precompression (`.br`/`.gz`, assets only) and a zod-free client entry are in.                                                                                                        |
| 12  | Chunk budget                              | JS + CSS gzip together.                                                                                                                                                                   |
| 13  | Address default                           | Tunnelled phones (a forwarded header from a loopback peer) default to remote; plain localhost to at-TV; RFC 1918 / link-local / ULA at-TV; anything else (100.64/10 too) remote.          |
| 14  | Remote phones in a TV room                | They get readings, TV cues and music by default (🎨 opt-outs). The "can't see the TV" prompt shows on the VIP's phone and the TV host bar, between games only.                            |
| 15  | Matcher language                          | Every answer pack carries a required `lang`; every match function takes `lang`. Broken Pencil adopts the matcher at the stem level only after an options page.                            |
| 16  | Matcher errata                            | Rejects also block stem and fuzzy matches; digits never fuzz; a hyphenated clue is one word.                                                                                              |
| 17  | Speech naming and cache                   | Wire name stays `ipa` (`phonemes` accepted as an alias in override files); overrides case-sensitive by default (`anyCase: true` per entry); key = hash of engine version + voice + parts. |
| 18  | Loudness                                  | ≈ −21 dBFS RMS, −1 dBFS ceiling, for new clips and live lines. Bingo is re-levelled only after an A/B page.                                                                               |
| 19  | Blanks and `toSpeakable`                  | Freeze Blanks on its own speech code; `toSpeakable` is for new games. Only the `asked` bug is fixed now.                                                                                  |
| 20  | View budget, bot rule, SecretCard setting | 4 KB views and `bot.decide(controllerView)` bind new games only; the existing five are grandfathered. SecretCard's hold / tap preference is a shell-level per-device setting.             |

**Pacing (same day):** the Foundation session finishes each F-task on branch `foundation`, posts its
review package and moves on to the next without waiting. Nothing merges to `main` until the owner
says ship.

## Errata that follow (Part 00 as amended)

- **Order:** F0 → F2 (schema, server-side Spanish, catalog, about) → F1 → F3 → F5 ∥ F6 → F4 → F7.
  F2a and F2b land together, before the registry goes lazy (audit #1).
- **§1.2 catalog:** built once by the server with the host clock (`isNew`, derived `quick`), plus
  `pace` (the I-189 estimate), `phoneSettings` and the Spanish tagline. The chosen game's settings
  travel in the snapshot as `selectedGame`; `room.games` is gone (audit #2, #3, #38).
- **§1.2 text:** each game's manifest Spanish lives in `games/<id>/manifest.es.json`, keyed by the
  English sentence; `about` and the settings editor read it from the server (audit #1, ADR-049).
- **§1.2 limits:** tagline ≤ 60, description ≤ 300, 1–3 tags from the list (audit #36, #37).
- **§2.2:** the registry is generated (`gameLoaders`, ADR-050); the entry check reads the Rollup
  bundle, not Vite's manifest; no manifest is ever shipped (audit #7, #43).
- **§2.3:** preload starts when `selectedGameId` becomes non-null, on `playing`, and for results;
  retries 1 / 3 / 6 s, then a stale-build check, then "Couldn't load the game. Tap to retry." (#4, #45).
- **§4:** as audit #14–16 and #25–31, with ruling 16. **§5:** as audit #17–22, #47–51, with ruling 17.
- **§3.4:** as audit #10–13, #33–35, with rulings 1, 13 and 14.
