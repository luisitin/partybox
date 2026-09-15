# PartyBox — prompt for a game-author session (design contract)

Paste everything below the line into the session that builds or maintains a game (`games/<id>/`).
Written by the design-review session after two full passes (`reports/design/LATEST.md`).

---

You are building or maintaining a PartyBox game in `games/<id>/`. The design review session audits
every screen of every game from a 3 m couch (TV) and from a thumb on a 320 px phone; what follows is
the contract that keeps your game out of its recommendation list. Read `docs/DESIGN_SYSTEM.md`
(tokens, type scale, themes, primitives), `packages/game-sdk/README.md` and `docs/ADDING_A_GAME.md`
first. Game rules stay yours; the **look** comes from the SDK.

## The shells do the chrome — you do the content

- The TV shell renders the strip (player chips, 128 px timer, deadline bar) and the paused card; the
  phone shell renders the header, the countdown line, the reconnect banner and toasts. Never draw your
  own timer, player list, VIP marker or "reconnecting" state.
- One focal point per TV screen: the prompt, the question, the answers, or the board — at `display`
  (128 px) or `h1` (72 px). Body text on the TV is 36 px minimum; never set a smaller px value.
- Everything is a token: colours, sizes, radii, durations (`--pb-*`). No hex, no px sizes, no
  hard-coded durations. Your game must look right in all five themes — Daylight is light; if you wrote
  `#fff` or `rgba(0,0,0,…)` it will break there. Use `--pb-accent-2-fill`/`--pb-on-accent-2-fill` for
  gold pills and letter discs, `--pb-accent-2` only for text and digits, `--pb-border` never directly.
- Use the primitives, and their newer props:
  - `TextAnswer` — free text; it renders the sent answer as a card and warns about unsent drafts.
  - `ChoiceGrid` — 2–6 lettered choices; shows "✓ Locked in" itself; `correctId` after the reveal.
  - `VoteList` — 2..N options; pass `size="large"` when there are 2–3 (the party's key decision must
    fill the thumb zone) and `muted: true` on placeholder options like "(no answer)".
  - `WaitingScreen` with `mood="done" | "watch" | "wait"` for every phase where the phone has nothing
    to do — never an empty screen, never a bare `<p>`.
  - `Scoreboard` with `noTrophy` for interim standings (a 🏆 means the game is over); it goes dense and
    two-column by itself from 7 players.
  - `Reveal` for sequential TV reveals (it already honours reduced motion); `BigText` for stage copy;
    `Stage center` only when the whole screen is one centred thing (it centres text — boards go in a
    non-centred `Stage`).
- Do not put `<p>` status lines in `footer` slots; the SDK primitives already say "Locked in" / "Vote
  in". The phone's footer is for the primary action only.

## Views carry the state the shells display

- `players[].status` is how the TV strip shows progress: set `'submitted'` the moment a player has
  nothing more to do this phase, `'active'` while the phone is waiting for them, `'waiting'` when it is
  not their turn (renders silently). A phase that counts answers on the TV ("3 / 12 answers in") but
  leaves every chip `active` is a finding.
- The phone never spoils the TV: nothing appears in `controllerView` before `tvView` has shown it.
- Reveal phases need ≥ 8 s when they list more than two items (700 ms per item + reading time).
- Copy: short, warm, second person ("Write your answers!", "Look at the TV"), no jargon, no ellipsis
  stacks; every number has a unit or a noun ("30 s", "+350", "3 / 8 answered").
- Names are ≤ 16 characters and answers ≤ 80: lay out for the longest, never truncate on the TV.

## Fixtures are your screenshots

- One `fixtures/<phase>.json` per phase, at an **interesting moment** (some players submitted, a tie,
  a blank answer, a 16-character name, the final round). The design pass renders every fixture through
  `/preview/<id>/<phase>?view=tv|controller&player=<pid>` on the TV and three phones — a fixture with
  4 identical idle players hides every problem.
- Include at least one fixture where the viewer is a spectator or has already acted.

## Self-check before you hand over (all from the repo root, server not running)

```
pnpm exec tsx packages/e2e/src/design/capture-preview.ts --games <id> --themes night,daylight,contrast --phones iphone,iphone-se,font200 --out reports/design/<id>-selfcheck
pnpm exec tsx packages/e2e/src/design/capture-game.ts --game <id> --out reports/design/<id>-selfcheck
pnpm exec tsx packages/e2e/src/design/sheet.ts --dir reports/design/<id>-selfcheck   # open contact-sheet.html
```

Walk the sheet against this list: TV readable from 3 m (nothing under 28 px, one focal point, 16
players fit); phone primary action in the bottom third and ≥ 44 px; submitted / waiting / spectator
states unmistakable; nothing overlaps the strip, the countdown line or the corner controls; Daylight
and High Contrast still legible; no colour-only meaning (✓ ✗ – letters, not just green/red).
Delete the selfcheck folder before committing (screenshots are gitignored; the manifest is not).

## Open items from the last design pass (`reports/design/2026-09-15-1730/for-games.md`)

- Wisecrack `answer`: flip chips to `submitted` when a player's second answer is in.
- Wisecrack `reveal`: 5 s is too short for two items + author line; use 8 s.
- Lightning Round `question`: mark `submitted` as players lock in; the TV only has the count today.

When you are done, add a line to your game's README `## Design notes` (which primitives, which
fixtures show what) and tell the design session which phases changed so it re-captures only those.
