# Hive Rank — build notes

Branch `game/hive-rank`, worktree `C:/dev/partybox-game-hive-rank`, harness port 42360. Started
2026-09-24 on `main` @ 4bfd10eb. The foundation (F1–F7) is on branch `foundation` and is not on
main yet (the owner: nothing merges until they say ship), so this game builds on main as it is and
uses thin local stand-ins listed below.

## Where it stands

- Content: 150 family + 50 spicy questions (`games/hive-rank/content/`), validated by the pack
  schema and `content.test.ts`; every one fits an iPhone SE rank screen with no scroll (probe).
- Server: phases `intro → rank → hive → score → … → done`, one file each; scoring, awards, recap,
  reader, bot. 57 game tests + the contract suite + `pnpm sim` 200 seeds × random/idle/chaos/mixed
  all green. 16 players: state ≈ 12 KB, largest view < 4 KB (`results.test.ts` logs it).
- Client: TV (intro, rank, the hive ladder with the scout bee, score), phone (intro, OrderPicker
  rank, "Watch the TV", my order vs the hive), PhoneStage for `hive` in phone-only rooms; EN + ES.
- SDK piece I own: `OrderPicker` at `@partybox/game-sdk/ui/order-picker` (its own subpath per
  audit #23, so it lands in this game's chunk, never the entry). Test: `packages/client/src/order-picker.test.tsx`.
- Record-review log: `reports/design/record-review/hive-rank/README.md`.

## The owner's rulings (2026-09-24)

All five REVIEW.md recommendations approved ("go ahead with your initial build with all your
recommendations"): bots' `hint` from their own view; spicy = half the rounds; phone-only keeps the
Controller at `intro`/`score`; 200 % text may scroll the rank screen; OrderPicker ships with the
game rather than ahead of it.

## Decisions (made here, approved as above)

1. **Bots read the writer's `expected` order from their own view** (`hint`, present only in a bot
   seat's controller view). Foundation §7.9 wants bots to decide from `controllerView`; SPEC §6.9
   wants them to start from `expected`, which no phone has. Putting it only in bot views keeps
   both rules and never shows it on a person's phone.
2. **`phoneStagePhases: ['hive']`, not `['intro','hive','score']`.** PhoneStage gets no `skip`, so
   the VIP would lose "Let's go" / "Next round" in a phone-only room (Bingo keeps its own
   controller for the same reason). The Controller draws the room's board itself in phone-only
   rooms at `score`, so nothing is lost.
3. **Spicy on = half the rounds (rounded up) from the spicy pack**, shuffled in. A plain draw from
   200 would give ~1.5 spicy questions in a six-round game.
4. **Fixed clips go through the live reader** (requested during `intro`, cached by key on the
   host): the in-repo clip pipeline (F6 `render-clips`) doesn't exist yet. Swap to recorded clips
   when it lands.
5. **Music beds:** `intro`/`rank` lofi, `hive` latenight (held chords under the voice), `score`
   warm. The spec lists no bed for `hive`.
6. **"Not enough bees!" skips `score`** and goes to the next round (3.5 s).
7. **Queen Bee needs points**: a round where the best score is 0 has no queen; Odd Bug only counts
   rounds where scores differed.
8. **Reset lives in the rank screen's sticky footer** (a 56 px ↺ next to Lock it in), so the hint
   gets the whole row at 320 px; OrderPicker keeps its own Reset for other callers (`reset` prop).
9. **Change is armed 700 ms after a lock**: the server's echo swaps Lock for Change under the
   finger, and a triple tap used to lock twice.

## Stand-ins (swap when the foundation lands)

- `server/speech.ts` `speakable()` — a thin stand-in for F6 `toSpeakable` (quotes, the game's
  pronunciations, digits/symbols to words, emoji out). Pack `say` lines are written speech-safe.
- `server/speech.ts` `speechKey()` — the Blanks key recipe (`hr…`, no hyphen) until F6's shared
  `speechKey`.
- Manifest `icon` 🐝, `howToPlay`, `presence: { needs: 'anywhere' }`, `addedOn` are NOT in
  `manifest.json` yet: main's schema strips unknown keys and the contract deep-equals the file
  (audit #58). They go in with F2. The three how-to-play steps are already the TV/phone intro.
- Presence (F4): nothing to do — Hive Rank is `anywhere` with no per-mode features; remote phones
  get PhoneStage automatically once F4 stamps `phoneOnly` per phone (audit #13).

## Known limits / open

- **200 % text**: 38 of 200 questions scroll the rank screen by up to 69 px (the sticky Lock stays
  put, the ▾ pill shows). The audit predicted "5 items, no scroll" can't hold there.
- **Long frames**: ~5 % on the TV in every recording, identical to Lightning Round recorded the
  same minute (the machine runs many sessions). A static preview holds 60 fps with 0 long frames.
  Re-measure on a quiet machine before the review package.
- Phone-only rooms on an SE: the score screen (my five marks + the room's board) scrolls under
  the sticky Next.
- Shell: the "Not saving recaps" toast covers a rank row for a moment at game start on an SE.
