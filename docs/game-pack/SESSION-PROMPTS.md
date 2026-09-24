# Session prompts

One prompt per Claude Code session. Paste each into its own session; each begins with the game's
name. The shared rules live in [SESSION-PLAYBOOK.md](SESSION-PLAYBOOK.md), so every prompt stays short
and every session follows the same ones.

Start the **Foundation** session first (or together with the others): every game depends on its
F-tasks, and the games work on content and server logic until those land.

| Session       | Worktree                             | Branch               | Port  |
| ------------- | ------------------------------------ | -------------------- | ----- |
| Foundation    | `C:/dev/partybox-foundation`         | `foundation`         | 42300 |
| Imposter      | `C:/dev/partybox-game-imposter`      | `game/imposter`      | 42310 |
| Herd Mind     | `C:/dev/partybox-game-herd-mind`     | `game/herd-mind`     | 42320 |
| Fake-Out      | `C:/dev/partybox-game-fake-out`      | `game/fake-out`      | 42330 |
| Who Said It   | `C:/dev/partybox-game-who-said-it`   | `game/who-said-it`   | 42340 |
| Tune In       | `C:/dev/partybox-game-tune-in`       | `game/tune-in`       | 42350 |
| Hive Rank     | `C:/dev/partybox-game-hive-rank`     | `game/hive-rank`     | 42360 |
| Echo          | `C:/dev/partybox-game-echo`          | `game/echo`          | 42370 |
| Blind Auction | `C:/dev/partybox-game-blind-auction` | `game/blind-auction` | 42380 |
| Spy Grid      | `C:/dev/partybox-game-spy-grid`      | `game/spy-grid`      | 42390 |
| Nightfall     | `C:/dev/partybox-game-nightfall`     | `game/nightfall`     | 42400 |

---

## Foundation

```
Foundation — you build the platform work for PartyBox's new game pack (Part 00, F1–F7 minus the game-owned components).

Repo C:/dev/partybox. Read and follow docs/game-pack/SESSION-PLAYBOOK.md (your spec is docs/game-pack/parts/00-FOUNDATION.md; read docs/game-pack/FOUNDATION-AUDIT.md in full — it lists the conflicts, errata and build order). Worktree C:/dev/partybox-foundation, branch foundation, harness port 42300.

1. First, put the audit's 20 owner questions to the owner (each with its recommended answer, options A/B/Other) and record the answers in docs/game-pack/DECISIONS.md — every game session reads it.
2. Then build in the audit's order: the errata pass, F1 (code-split registry, lint rule, build check; move the manifest-line Spanish to the server BEFORE going lazy — the audit's blocker), F2 (catalog + about + the new manifest fields for the five existing games), F3 (phone picker, About sheet, TV grid + mirror, collapsed settings + Start). Ship F1–F3 on their own first (Part 00 §9), each with the review package in §0.2.4, and wait for the owner after each.
3. Then F5 (match module, 60+ case tests), F6 (toSpeakable, override lists, per-part fallback, speech lab, service hardening), F4 (presence: room setting, per-phone toggle, init context, P1 per-player stage, P2 sound on remote phones, lobby notices), P5, and the helpers teamsFromSeed / majorityPick / rotation. Ship each to main as soon as it's reviewed — ten game sessions are waiting on them; announce each landing in docs/game-pack/README.md.
The goal the owner set: phones download only the catalog until a game is picked, then only that game's code; content never; audio on first play — so the lineup can grow to hundreds without slowing phones. Measure it (entry chunk, per-game chunks, network log in a test) before and after.
```

## Imposter

```
Imposter — you build Imposter 🕵️ (id `imposter`) for PartyBox, game 1 of the owner's pack.

Repo C:/dev/partybox. Read and follow docs/game-pack/SESSION-PLAYBOOK.md; your spec is docs/game-pack/imposter/SPEC.md. Worktree C:/dev/partybox-game-imposter, branch game/imposter, harness port 42310.

You own the SDK components SecretCard and FacePicker (Part 00 §6): build them first, ship them to main early — Herd Mind, Who Said It, Echo, Spy Grid and Nightfall use them. Build your hidden-role plumbing (per-role views, identical screens for every role, leak tests) cleanly: Nightfall reuses it.
You need F5 (isLegalClue, matchAnswer, sameAnswer), F4 (presence: talk off in remote-text) and F6 (toSpeakable) from the Foundation session; until they land, do content (168 family + 72 spicy words, each with 6+ accept forms and 8–10 legal clues, 12+ imposter clues per category) and the pure server logic with its tests.
Mind the spec's leak rules (the word's reading is requested only at wordReveal; clue cards revealed in a seeded shuffle) and its simulator note on the slowest settings — tell the owner what you chose.
The owner's bar: smooth, beautiful, 3D transitions, no dead air — prove it with the record-review skill, re-record after every change.
```

## Herd Mind

```
Herd Mind — you build Herd Mind 🐑 (id `herd-mind`) for PartyBox, game 2 of the owner's pack.

Repo C:/dev/partybox. Read and follow docs/game-pack/SESSION-PLAYBOOK.md; your spec is docs/game-pack/herd-mind/SPEC.md. Worktree C:/dev/partybox-game-herd-mind, branch game/herd-mind, harness port 42320.

You need F5 (matchAnswer, sameAnswer for typed-mode grouping) from the Foundation session; tiles mode needs nothing new, so build tiles mode end to end first. Content: 200 family + 80 spicy questions, 10–14 weighted answers each with 6+ accept forms, the question-style mix the spec gives, "Would you rather" items marked tiles: all.
Get the Black Sheep's flight, the herd columns and the race track to feel great — it's a quick game, so every reveal must land crisply with no waiting. The VIP merge tool (typed mode) renders only on the VIP's phone.
The owner's bar: smooth, beautiful, 3D transitions, no dead air — prove it with the record-review skill, re-record after every change.
```

## Fake-Out

```
Fake-Out — you build Fake-Out 🎭 (id `fake-out`) for PartyBox, game 3 of the owner's pack.

Repo C:/dev/partybox. Read and follow docs/game-pack/SESSION-PLAYBOOK.md; your spec is docs/game-pack/fake-out/SPEC.md. Worktree C:/dev/partybox-game-fake-out, branch game/fake-out, harness port 42330.

The biggest risk is content: every played fact must be TRUE. Each fact carries a checkable `source`; set `verified: true` only after you checked it against that source with web search/fetch. Anything you can't verify goes to content/unverified.json for the owner to spot-check. The pack test fails on an unsourced or unverified played fact. (Runtime stays offline — ADR-012; the web is for writing the pack only.)
You need F5 (matchAnswer for lies too close to the truth, sameAnswer for merging lies) and F6 (toSpeakable; the completed-fact line is requested only at the truth step) from the Foundation session; until they land, write and verify the packs and build the pure server logic with its tests.
Make the step-by-step reveal the star: every option, who fell for it, the stamp, the authors — dramatic but never slow.
The owner's bar: smooth, beautiful, 3D transitions, no dead air — prove it with the record-review skill, re-record after every change.
```

## Who Said It

```
Who Said It — you build Who Said It 🗣️ (id `who-said-it`) for PartyBox, game 4 of the owner's pack.

Repo C:/dev/partybox. Read and follow docs/game-pack/SESSION-PLAYBOOK.md; your spec is docs/game-pack/who-said-it/SPEC.md. Worktree C:/dev/partybox-game-who-said-it, branch game/who-said-it, harness port 42340.

You use FacePicker (owned by the Imposter session — use a local stand-in until it lands on main, then switch) and F5's sameAnswer for merging identical answers. Player-written answers are read aloud, so everything spoken goes through F6's toSpeakable (Foundation session); until those land, do the prompt packs and the pure server logic with its tests.
Answers are the players' own words: the guessing phase must never reveal the author by timing, order or layout (seeded order, identical screens), and a player's own answer never appears in their own picker.
The owner's bar: smooth, beautiful, 3D transitions, no dead air — prove it with the record-review skill, re-record after every change.
```

## Tune In

```
Tune In — you build Tune In 📻 (id `tune-in`) for PartyBox, game 5 of the owner's pack.

Repo C:/dev/partybox. Read and follow docs/game-pack/SESSION-PLAYBOOK.md; your spec is docs/game-pack/tune-in/SPEC.md. Worktree C:/dev/partybox-game-tune-in, branch game/tune-in, harness port 42350.

You own the SDK components Dial + DialInput and TeamBanner (Part 00 §6): build them first and ship them to main early — Spy Grid uses TeamBanner. The dial is the game's hero: a real 3D feel to the shutter swing, faces landing on the rim, the needle settling — and a DialInput that feels great under a thumb (48 px thumb, tap-to-jump, ± buttons, haptic ticks on Android, throttled sends as the spec says).
You need teamsFromSeed (Foundation helpers), F4 presence (huddle forced off in remote-text) and F6 toSpeakable; until they land, do the 150 + 50 spectra (12 bank clues each, spread across every fifth of the dial, each legal against its own spectrum) and the pure server logic for all three modes with its tests.
The owner's bar: smooth, beautiful, 3D transitions, no dead air — prove it with the record-review skill, re-record after every change.
```

## Hive Rank

```
Hive Rank — you build Hive Rank 🐝 (id `hive-rank`) for PartyBox, game 6 of the owner's pack.

Repo C:/dev/partybox. Read and follow docs/game-pack/SESSION-PLAYBOOK.md; your spec is docs/game-pack/hive-rank/SPEC.md. Worktree C:/dev/partybox-game-hive-rank, branch game/hive-rank, harness port 42360.

You own the SDK component OrderPicker (Part 00 §6, refined in your spec so five rows never scroll on 320×568): build it first and ship it to main early.
Hive Rank needs nothing else from the Foundation session except F6's toSpeakable for the readings, so you can build almost the whole game now: 150 family + 50 spicy opinion questions (exactly five items, labels ≤ 22 chars, a `say` sentence, an `expected` order), the hive tie-break chain, scoring, awards, bots.
The 5th-to-1st ladder countdown is the show — every spot lands with its reading and its faces, no dead beats between spots.
The owner's bar: smooth, beautiful, 3D transitions, no dead air — prove it with the record-review skill, re-record after every change.
```

## Echo

```
Echo — you build Echo 🔁 (id `echo`) for PartyBox, game 7 of the owner's pack: its real co-op game.

Repo C:/dev/partybox. Read and follow docs/game-pack/SESSION-PLAYBOOK.md; your spec is docs/game-pack/echo/SPEC.md. Worktree C:/dev/partybox-game-echo, branch game/echo, harness port 42370.

Echo leans hardest on the matcher: you need F5 (sameAnswer for echoes, isLegalClue for clues, matchAnswer for the guess) and F6 (toSpeakable) from the Foundation session, and SecretCard from the Imposter session (use a local stand-in until it lands). Until then, write the 300 family + 80 spicy words (6+ accept forms, a reject list for look-alikes, family roots, 10 bank clues ordered most to least obvious, each legal) and the pure server logic with its tests.
The secret word must never reach the guesser's phone, the TV or a spectator before `result` — test it. Make the echo moment (clues vanishing into blank 🔇 cards) and the deck counter feel alive.
The owner's bar: smooth, beautiful, 3D transitions, no dead air — prove it with the record-review skill, re-record after every change.
```

## Blind Auction

```
Blind Auction — you build Blind Auction 🔨 (id `blind-auction`) for PartyBox, game 8 of the owner's pack.

Repo C:/dev/partybox. Read and follow docs/game-pack/SESSION-PLAYBOOK.md; your spec is docs/game-pack/blind-auction/SPEC.md. Worktree C:/dev/partybox-game-blind-auction, branch game/blind-auction, harness port 42380.

You own the SDK component BidPad (Part 00 §6): build it first and ship it to main early.
You need F4 presence (Live mode only in `together` rooms) and F6 (toSpeakable, and the fixed auctioneer clips generated in every voice — "Going once…" must start instantly) from the Foundation session. Until then: the lot pools (60 normal, 20 wild, 12 grand, 20 spicy-flavoured; chances summing to 100; balanced EVs as the spec says) and the pure server logic with its tests, sealed mode first.
Lot outcomes live only in state — no view may differ by outcome before the flip; test it. The flip (heists and swaps flying coins between faces) and the live going-once clock are the show.
The owner's bar: smooth, beautiful, 3D transitions, no dead air — prove it with the record-review skill, re-record after every change.
```

## Spy Grid

```
Spy Grid — you build Spy Grid 🗂️ (id `spy-grid`) for PartyBox, game 9 of the owner's pack: the largest one (about 1,000–1,400 lines plus content).

Repo C:/dev/partybox. Read and follow docs/game-pack/SESSION-PLAYBOOK.md; your spec is docs/game-pack/spy-grid/SPEC.md. Worktree C:/dev/partybox-game-spy-grid, branch game/spy-grid, harness port 42390.

You own the SDK component WordGrid (specified in your spec §9.5): build it and ship it to main early. You use TeamBanner (Tune In session), SecretCard (Imposter session), teamsFromSeed (Foundation helpers), F5's isLegalClue and sameAnswer, F4 presence and F6 — use local stand-ins until each lands.
Start with the content, which the bots depend on: 400 family words in 120 themes + 120 spicy words in 36 themes; every theme's clue and alts legal against its own members (pack test), no root clashes on a board. Then the server logic: pointing by majority, bots follow humans, the two-stage flip so the TV reveals first, the key only in spymaster views — test every leak rule. Mind the simulator note on extreme settings and tell the owner what you chose.
The owner's bar: smooth, beautiful, 3D transitions, no dead air — prove it with the record-review skill, re-record after every change.
```

## Nightfall

```
Nightfall — you build Nightfall 🌙 (id `nightfall`) for PartyBox, game 10 of the owner's pack: the classic hidden-roles game, built last.

Repo C:/dev/partybox. Read and follow docs/game-pack/SESSION-PLAYBOOK.md; your spec is docs/game-pack/nightfall/SPEC.md. Worktree C:/dev/partybox-game-nightfall, branch game/nightfall, harness port 42400.

Nightfall reuses Imposter's hidden-role plumbing (read the Imposter session's work on main and in docs/game-pack/imposter/NOTES.md before designing yours), SecretCard and FacePicker (Imposter session), F4 presence (voice-if-remote: the lobby notice, the town board in remote-text) and F6 (toSpeakable + both flavours' narrator clips in every voice). Until they land: the flavours (village and mafia, every role, side and narrator line, in English and Spanish), the bot lines, and the pure server logic — dealing, night resolution order, win checks after every death and departure, hunter and jester — with its tests.
The leak rules are the heart of it: one identical night screen and dawn strip for every role, chips identical across roles, the TV never shows a living player's role, no speech key with a role or death requested before its reveal — snapshot-test them.
The owner's bar: smooth, beautiful, 3D transitions (night falling, dawn breaking, the role card flip), no dead air — prove it with the record-review skill, re-record after every change.
```
