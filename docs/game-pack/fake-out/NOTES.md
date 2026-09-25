# Fake-Out — build notes

Branch `game/fake-out`, worktree `C:/dev/partybox-game-fake-out`, harness port 42330.

## Status (2026-09-24)

| Stage              | State                                                                              |
| ------------------ | ---------------------------------------------------------------------------------- |
| 1. Content         | ✅ 158 family + 62 spicy facts, all sourced and checked; fillers; pack test green  |
| 2. Server logic    | ✅ reducer, views, bot, recap, speech; 160+ unit tests; contract suite; sims clean |
| 3. Client          | ✅ TV + phone + phone-only feed, EN + ES; read-along; deck reveal                  |
| 4. Record → review | passes 1–3 done (see below); touch pass + matrix in progress                       |
| 5. Review package  | not started                                                                        |

## Platform pieces (foundation on main since 2026-09-24, 00331644)

Migrated in the merge of main: the ADR-050 layout (`client/shared.ts`, `phone-entry.ts`,
`tv-entry.ts`; `client/index.ts` gone), the F2 manifest fields (icon 🎭, howToPlay, presence
`anywhere`, addedOn 2026-09-24) and `manifest.es.json`. The stand-ins are gone: `server/lies.ts`
and `server/options.ts` use `@partybox/game-sdk/match` (`matchAnswer`, `sameAnswer`,
`groupAnswers` for merging lies in seat order), `server/speech.ts` uses `@partybox/game-sdk/speech`
(`toSpeakable`, `speechKey`, `parsePronunciations`). Before the swap, all 220 facts were run
through F5 with the §3.7 rules: 0 differences from the stand-in. Phone download within the 33 KB
budget; no TV code on phones.

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
- **`phoneStagePhases: ['reveal']`** (the spec lists intro, reveal, scores). The shell renders
  `PhoneStage` with only the view — no `skip` — so on intro and scores it would take away the VIP's
  in-context **Let's go** / **Next question**. The controller's intro and scores already show the
  stage's content in full (how to play; the board with this question's points), so they stay.
- **The question and the reveal map to the `silence` cue** and the stage plays `card`, `reveal`,
  `bust` and `jackpot` itself: both phases move their deadline (the voice, each reveal step), and
  the shell re-chimes a mapped phase whose deadline moves.
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

## Record → review passes

Evidence under `reports/design/record-review/fake-out/<pass>/` (gitignored). Each pass: real-time
game on port 42330 (TV 1920×1080 + two phones + bots, reader on), `dead-air.ts` on every video.

| Pass          | Found                                                                                                                                                                                                                                                                                                                                                                                                                     | Fixed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| p01           | TV: 9 dead spans (question card static while the voice was read or made; the completed fact held 5.6 s still); the reveal spotlight sat on top of the dimmed grid (text collisions); pick → reveal jumped ~40 px (the clock column leaves the strip); first reveal step waited on the voice; lie slips overlapped the pill                                                                                                | read-along highlight (words light up with the reader; shimmer while the voice is made); reveal redesigned: stage in the middle, options as a deck along the bottom; reveal crossfades in instead of cutting; the fact is asked for before the fixed lines; truth word breathes during the hold                                                                                                                                                                                                                                             |
| p02           | reveal dead spans gone; the question still went silent: a late reading's start was "in the past", so every TV skipped the clip and the read-along                                                                                                                                                                                                                                                                         | `q.readAt`: a late reading starts when it arrives (test pinned)                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| p03           | **TV 0 dead spans, 0 hard cuts**; phone: 2.2 s on the question (gate 3 s), 3.7 s on the shell's results                                                                                                                                                                                                                                                                                                                   | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| p06–p08       | owner's pacing rule [cc45f4]: rules + per-phone I'm ready + 3·2·1; harness phones never tapped Ready (90 s wait); TV ready row sat under the host bar; TV countdown digit fell below the rules                                                                                                                                                                                                                            | bot policy taps Ready (dev act); compact intro; once all are ready the rules give way to a big 3·2·1 on TV and phone; slow-reader holds raised (scores 10 s, fact/unpicked 3 s, steps 3–5.5 s)                                                                                                                                                                                                                                                                                                                                             |
| p09 + matrix3 | review of 5b8bfa9d (spy-grid [2bae6c], reviewer [d738fb], hive-rank [eceffc]): pause during the 3·2·1 desynced the digits; ready count could exceed players; phones imported TV modules; ready shown twice; read-along boxes trailed; strip faces-only in pick/reveal; hole above the completed fact; ES got English facts unannounced; 200 % pick header + 👍 clipping; SE fact text at 70 % width; SE lie scrolled 4 px | `counting` flag + the view reads the live deadline (pause test); count = ready ∩ connected; labels.ts (phone 14.2 KB, TV code on phones: no); strip hidden on intro + reveal, names kept in pick; one accent underline per word, the waiting voice breathes the whole text; completed fact centres on the stage; ES note on the rules + manifest.es; "Pick the truth" + a 👍 hint, like button grows; phone facts wrap `pretty`; input trimmed. TV 0 dead spans, 0 hard cuts. SE scoreboard names truncating = SDK Scoreboard (foundation) |

Sound (fo-audio probe, p03): `card` +20 ms after the question starts, the reading +10 ms after
`readAt`; lie / pick lines 460 ms after the phone chime (by design, 450); each option's reading
+30 ms into its step; the stamp cue at reading + 0.8 s ±20 ms, its line 180 ms later; `jackpot`
exactly when someone found the truth. One slow render (the completed fact, > 6 s under load) held
its card with the shimmer and moved on — a missing voice never stalls the room.

Frame timing: this machine's recorder is the noise floor — shipped Wisecrack under the same
harness drops 7.97 % of frames (worst 133 ms); Fake-Out 5.43 % (worst 133 ms, the chunk load at
the intro). The < 1 % / none over 100 ms gate needs a quiet machine to judge; nothing in the game
animates anything but transform / opacity.
