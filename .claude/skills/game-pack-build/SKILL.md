---
name: game-pack-build
description: Build one game from the owner's PartyBox game pack (docs/game-pack/) — the pack's rules, presence, matcher, voice, budgets and definition of done on top of the add-game recipe. Use only after the F-tasks it depends on exist.
---

# game-pack-build

The pack lives in `docs/game-pack/`: `parts/00-FOUNDATION.md` (platform) and the part files as the
owner sent them, plus one folder per game (`docs/game-pack/<game-id>/SPEC.md` = that game's section,
`README.md` = status; put build notes, open questions and review passes there). Audit of main vs the
foundation, with the conflicts settled so far: `docs/game-pack/FOUNDATION-AUDIT.md`. **The code on main is the truth**: if the pack conflicts with
the code or a brief hard rule (`C:/dev/partybox-ideas/GAME-DESIGN-BRIEF.md` §4), stop and report the
conflict with a proposed fix; never bend a hard rule quietly.

## Before starting

1. The F-tasks the game needs are merged (foundation §9): F1–F3 always; F4 presence for Imposter,
   Spy Grid, Nightfall; F5 matcher for Imposter, Herd Mind, Fake-Out, Echo, Spy Grid; F6
   `toSpeakable` for every game with a reader; F7 components when the game is the first to need one.
2. One game per branch (`game/<id>`) and per session. Read the game's `SPEC.md` (and its part file's shared intro) end to end, then
   `docs/ADDING_A_GAME.md` and `docs/GAME_CONTRACT.md`.

## Build (in this order)

1. `pnpm new-game <id>`; README spec ≤ 120 lines with the fixed headings (Overview, Players,
   Phases, Inputs, Scoring, Edge cases, Settings, Content).
2. Manifest: `icon`, `howToPlay` (3 × ≤ 90 chars), `presence`, `addedOn`, 1–3 tags from the fixed
   list, `reader` setting (every voice + `none`, default from foundation §5.10), `spicy` if the
   game has a spicy pack.
3. Content: host-only packs; every typed-answer item has `answer`/`accept` (≥ 6 where honest)/
   `reject`/`family`; stable ids; the pack test (normalize, dedupe, accept → exact).
4. Server: one file per phase; `init` draws only what this game needs from the seeded PRNG
   (state holds only what's drawn; ≤ 256 KB at 16 players — log it in a test); every phase exits
   by deadline, all-done and VIP skip; presence table from the part file; secrets only in the
   allowed `controllerView`s; errors never leak secrets; `speech(state)` renders a round ahead
   (≤ 10 pending keys, never a secret before its reveal); bot = `controllerView(state, botId)` first,
   then choose only from it; 3–5 awards with the results builder; recap as the part file says.
5. Client: phone entry (controller, PhoneStage, PhoneSettings, strings) and TV entry through the
   registry only — no `content/**` import from `client/**`; tokens only; EN + ES strings; every
   spoken line also shown as text; "👀 Watch the TV" during reveals on at-TV phones; own result
   only after the TV showed it; phone plays only in-hand cues; the pack's cue vocabulary.
6. Tests: contract suite (declared secrets never in the wrong view), sim ≥ 200 seeds with random
   and idle bots, finishes within 3 × `estimatedMinutes`, one connected player, a drop mid-phase,
   a late joiner, everyone idle, ties, each presence mode.

## Prove it (not optional)

Run the `record-review` skill on the game until every gate holds; then screenshots at 320×568,
390×844, sideways, 200 % text, TV 1920×1080, all five themes; chunk under the phone budget and not
in the entry chunk; the speech-lab pass with every flag fixed. Only then `pnpm verify` → commit →
review package for the owner (screenshots, five-line summary, open questions), per foundation §0.2.4.
