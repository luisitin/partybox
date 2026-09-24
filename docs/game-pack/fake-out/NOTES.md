# Fake-Out — build notes

Branch `game/fake-out`, worktree `C:/dev/partybox-game-fake-out`, harness port 42330.

## Status (2026-09-24)

| Stage              | State                                                                              |
| ------------------ | ---------------------------------------------------------------------------------- |
| 1. Content         | ✅ 158 family + 62 spicy facts, all sourced and checked; fillers; pack test green  |
| 2. Server logic    | ✅ reducer, views, bot, recap, speech; 160+ unit tests; contract suite; sims clean |
| 3. Client          | in progress                                                                        |
| 4. Record → review | not started                                                                        |
| 5. Review package  | not started                                                                        |

## Platform pieces not on main yet (stand-ins in use)

The Foundation session's F-tasks were not on `main` when this session started (only F0's docs on
branch `foundation`). Per the playbook, the game builds against thin local stand-ins:

| Needed                                | Stand-in                                                                                                        | Swap when         |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------- |
| F5 `@partybox/game-sdk/match`         | `games/fake-out/server/match/` — Part 00 §4 + audit errata + ruling 16                                          | F5 lands          |
| F6 `toSpeakable` + override lists     | `games/fake-out/server/speakable.ts` + `spoken-numbers.ts` (rules 1–13)                                         | F6 lands          |
| F6 fixed clips (`render-clips`)       | the eight fixed lines are ordinary live readings, asked for at the intro and cached by the host for good        | F6 `render-clips` |
| F2 manifest fields                    | not in `manifest.json` yet (zod strips unknown keys and the contract deep-equals the file) — values ready below | F2 lands          |
| F1 lazy registry / `phone.ts`+`tv.ts` | the current eager `clientModule` with lazy surfaces                                                             | F1 lands          |
| F4 presence / `useCanSeeTv`           | not needed by the rules (presence table is all "—"); PhoneStage follows `usePhoneOnly`                          | F4 lands          |

Manifest fields ready for F2: `icon: "🎭"`, `howToPlay`: "A strange true fact appears with a blank.
Type a fake answer that sounds real." / "All answers are mixed with the truth. Pick the one you
think is real." / "Score for finding the truth, and for every player your fake fools.",
`presence: { needs: "anywhere" }`, `addedOn: "2026-09-24"`, tags `bluff`, `trivia`, `comedy`.

## Decisions made while building (not in the spec, or sharpened)

- **Display form folds case** before capitalising. The spec says "then capitalise"; a lie typed in
  CAPITALS kept its capitals, and since every truth comes from a lowercase pack, that was a tell.
  Found by the display-form test.
- **A bot's phone always offers Suggest** (`canSuggest` is true for bots even with the setting off):
  that is how bots lie (§3.11). Without it, a bot in a room with Suggest off could not lie at all.
  Where Suggest is not offered at all, a bot falls back to its category's public fillers.
- **Fillers are keyed by kind and by category.** Each fact carries a `kind` (animal, person, year…)
  so a bot's filler fits the blank's shape; the category list backs it up (§3.15 asks per category).
- **Accept forms are counted after normalisation** (audit erratum #28): spacing, case and hyphen
  variants are automatic, so the pack test asks for 6+ _distinct_ forms. 48 facts were topped up with
  honest variants; accepts that would reject legitimate lies through the containment rule were
  removed ("flies" rejected "butterflies", "balls" rejected "baseballs").
- **Stems:** the final-e drop starts at 3 letters so pie/pies and toe/toes meet (audit #16's intent).
- **Lead-in lines:** "Here's your question." plays on question 1 only (it repeated badly on every
  card); "Final Fake-Out. Double points!" leads the final. The fact follows 250 ms after.
- **"Nobody fell for…"** lists players' unpicked lies only (house lies have no authors to name) and
  is skipped when there are none.
- **Points are applied as the reveal begins** (so a VIP "end" mid-reveal keeps them); the views
  subtract them until the reveal ends, so no running score gives a pick away early.
- **Tied awards get one id per winner** (`master-liar`, `master-liar-2`): the results screens key
  awards by id.
- **Performance:** the matcher is normalised once per string (`prepare`) and Suggest draws lazily;
  a 12-player game sims 20× faster than the first cut (28.8 s → 1.4 s for five games).

## Content notes (for the owner's spot-check)

Written by research agents with web access, each fact checked against its `source` during writing;
16 duplicates across batches removed and 20 replacements added. Flagged by the writers:

- Present-tense rules that could go stale if changed: `fo-sports-006` (gold medals ≥ 92.5 % silver),
  `fo-weird-laws-014` (1313 armour law "still on the books"), `fs-weird-laws-018` (Irish bona fide
  traveller).
- Brands as the truth (unavoidable): `fo-holidays-001` (KFC at Christmas in Japan — the truth is
  "fried chicken"), `fo-holidays-013` (Donald Duck).
- Sourced outside Wikipedia (still checkable): koala fingerprints (PBS NOVA), tomato pills
  (History Facts), Lincoln's Hall of Fame, OMG/Churchill (Smithsonian), the wooden mouse (Computer
  History Museum), Venice pigeons (NBC), Wisconsin margarine (WPR), several spicy ones.
- Mild gross-out in family: Santa Anna's leg (`fo-history-007`). The urine tax moved to spicy.

## Open questions for the owner

1. Display form folds case (above) — keep? (Recommended: yes; it closes a real tell.)
2. Present-tense facts above — keep, or reword to past tense? (Recommended: keep; they are true today.)
