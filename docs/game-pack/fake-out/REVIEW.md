# Fake-Out — review package

Branch `game/fake-out` · build notes in [NOTES.md](NOTES.md) · spec [SPEC.md](SPEC.md) · media under
`reports/design/record-review/fake-out/` (gitignored, on the host PC).

## Five lines

1. A full game plays end to end on the TV and phones: intro → question (read aloud) → lie (💡 Suggest,
   the truth refused) → pick (👍 likes) → the stamped reveal → scores → Final Fake-Out → results.
2. 158 family + 62 spicy facts, every one with a checkable source and checked by the writers; the
   pack test runs every accepted form and house lie through the matcher.
3. The reveal: each picked lie flies from the deck to the stage, its pickers pop in, the reader
   reads it, the stamp lands on the beat (LIE ✗ · PARTYBOX LIE 🤖 · TRUTH ✓) with its sound and line,
   then the authors rise with their points; the fact completes with the truth in gold.
4. Measured: TV 0 dead spans and 0 hard cuts (pass 3); every cue and voice line within 30 ms of its
   moment; 166 game tests, the contract suite and 2 400 simulated games clean; 14 KB of state at 12.
5. Built on local stand-ins for the matcher and the reader's rewrite rules until the Foundation's
   F5/F6 reach main (same signatures; the swap is an import change plus a re-run of the tests).

## Screens (all five themes, TV 1920×1080, iPhone SE 320×568, iPhone 390-class, 200 % text, sideways)

`reports/design/record-review/fake-out/matrix2/fake-out/<phase>[-<theme>]/` — `tv-stage.png`,
`iphone-se-p1-p1.png`, `iphone-p1-p1.png`, `font200-p1-p1.png`, `landscape-p1-p1.png` per phase.

## Clips

`reports/design/record-review/fake-out/p04/video/tv/round.webm` (TV, a 3-question game with the
reader) and `…/p04/video/phone/round.webm` (the VIP's phone).

## Try this

- 4–6 players (bots are welcome), the defaults: type a lie that is really the truth ("penguin" when
  it is penguin) to see the refusal; tap 💡 Suggest; 👍 two answers while picking.
- Settings: fewer questions (3) for a quick look; Spicy facts on; Reader → No reader to see the
  timing without a voice.
- A phone-only room: the reveal becomes a vertical feed on every phone, voiced.

## Open questions

1. The display form folds case (a lie typed in CAPITALS looked different from the lowercase truth).
   Keep? — recommended: yes.
2. Three present-tense facts could go stale (NOTES.md "Content notes"). Keep? — recommended: yes.
3. `phoneStagePhases` is `['reveal']`, not the spec's intro/reveal/scores, so the VIP keeps the
   in-context Let's go / Next question buttons (the phone-only intro and scores already show the
   stage's content). Keep? — recommended: yes.
