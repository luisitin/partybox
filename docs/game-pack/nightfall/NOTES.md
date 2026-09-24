# Nightfall — build notes

Session: branch `game/nightfall`, worktree `C:/dev/partybox-game-nightfall`, harness port 42400.
Started 2026-09-24 (after a 30-minute wait for the Foundation session).

## Where things stand

| Stage                   | Status                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1 Content               | done: flavours (both, EN+ES), 90 bot lines, pronunciations, pack tests                                      |
| 2 Server logic          | done: 11 phases, 90 unit tests incl. non-interference leak tests, contract green, sim 200 random + 200 idle |
| 3 Client                | done: TV scenes (sky, village, 3D role cards), phone screens, PhoneStage, EN+ES                             |
| 4 Record → review → fix | passes p01–p14 (see REVIEW.md): 0 dead spans / 0 hard cuts on the TV, voice ±30 ms on its frame; continuing |
| 5 Review package        | REVIEW.md @ 583abb46; build served on 42400 for the owner's play-test                                       |

Platform on `main` when I started (4bfd10eb): none of F1–F7 merged. The Foundation branch had F0
(the owner's 20 rulings, `docs/game-pack/DECISIONS.md` on that branch) and F2 (catalog, about,
`manifest.es.json`). So stages 1–2 go first, against today's contract, and the platform pieces are
thin local stand-ins listed below, swapped out as each lands on `main`.

## Stand-ins in use (swap when the real piece lands)

| Missing piece                                                             | Stand-in                                                                                                                                                                                                                                                                                                                                                                              | Swap when                                          |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| F2 manifest fields (`icon`, `howToPlay`, `presence`, `addedOn`, tag enum) | main's schema strips unknown keys and the contract deep-equals the manifest, so the fields are NOT in `manifest.json` yet. Ready to paste: icon 🌙, tags `hidden-roles`, `bluff`, presence `voice-if-remote`, addedOn 2026-09-24, howToPlay = SPEC §10.1. `manifest.es.json` follows ADR-049 once F2 merges.                                                                          | F2 on main                                         |
| F4 presence (`ctx.presence`, `player.canSeeTv`)                           | `init` reads `ctx.presence` defensively (ADR-047 makes it optional) and defaults to `together`, no phone-only. The town board (`townBoard: auto`) therefore stays off until F4; `on` forces it. Tests pass a presence object through the same cast.                                                                                                                                   | F4 on main                                         |
| F7 `SecretCard` (Imposter owns it)                                        | local `client/HoldCard.tsx`: press-and-hold flips, release flips back; transform-only; reduced motion = fade. Same props shape Part 00 §6 describes.                                                                                                                                                                                                                                  | Imposter ships `@partybox/game-sdk/ui/secret-card` |
| F7 `FacePicker` (Imposter owns it)                                        | local `client/FaceGrid.tsx`: avatar grid with names, ring + ✓ on the pick, optional "No one" tile.                                                                                                                                                                                                                                                                                    | Imposter ships FacePicker                          |
| F6 `toSpeakable`, fixed-clip pipeline                                     | narrator lines (fixed and live) go through today's `speech(state)` path (ADR-045) with a small local `speakable()` (straight quotes, drop emoji, skip unreadable names). Fixed lines are secret-free and prefetched a phase ahead; live lines (a death, a role) are asked for only once the night / vote has resolved, and their key reaches a view only on the step that plays them. | F6 on main (then `render-clips` WAVs + `clip()`)   |
| audit #19 (`asked` set)                                                   | a second Nightfall game in the same room may get no `speech` event for a line the first game already asked for. Pacing never waits more than 12 s for a reading, and a line with no length is just not played, so the room never stalls; the fix is F6's.                                                                                                                             | F6 on main                                         |

## Decisions (made here, not in the spec)

1. **Private rejections are local.** A game cannot send a private error today (only the engine
   rejects room actions). The phone checks a night pick against its own view (own role, pack,
   last protected) and shows the spec's message itself; the server ignores the same invalid picks.
   Same for the 4th post of a day and text that normalises to nothing. Nothing else changes, as
   §10.11 asks.
2. **Reveals are server-stepped.** `dawn`, `verdict` and the hunter's shot stay in their phase
   with later deadlines (ADR-033 beats): `dawn` = sunrise → news → role flip; `verdict` = votes
   land → spotlight → role flip. A role or a death enters a view only on the step that shows it,
   so no phone (or spectator) can spoil it and each reading's key appears exactly when it plays.
3. **Bots in the day are paced by the game.** Bot drivers have no clock and are only woken by
   room changes, so "taps Ready 20–60 s in" and town-board posts cannot come from
   `sampleInput`. At `day` entry the reducer draws one beat per bot (ready at 20–60 s; posts
   spread across the day when the board is on) and re-arms the phase deadline to the next beat;
   the views carry the real end of the day (`dayEndsAt`) as their deadline, and pause/resume
   shifts both. Every bot decision is made from `controllerView(state, botId)` (P00 §7 rule 9).
4. **Hunches** are the night picks of villager-side roles without a power (villager, hunter,
   jester). The tally is stored at dawn and shown at `dawn` and `day`.
5. **Departures** (`player` event with `gone`) are queued and applied at the next `dawn` or
   `verdict` announcement ("Ben packed up and left the village"), then the win check runs. A
   hunter who leaves does not shoot.
6. **Wolves on `auto`** follow §10.3; an explicit count is capped at ⌊players ÷ 3⌋ (min 1).
   Special roles that do not fit (too few seats, jester under 7 players) are simply not dealt,
   and the public role list says what was dealt.
7. **Bot lines** are English content with tokens for the flavour (`{seer}`, `{villager}`,
   `{aWolf}`, `{wolves}`) besides `{name}`, so one bank fits both flavours.

## Conflicts found

1. **Settings cap.** SPEC §10.16 lists 15 settings; `gameManifestSchema` on main allows 12
   (`settings: z.array(...).max(12)`). Fix taken (no contract change): `seer`, `doctor`, `hunter`,
   `jester` are one multiselect, **Special roles** (default seer + doctor). The alternative —
   raising the cap to 16 in `packages/shared/src/contract.ts` — is a contract change (ADR); say
   the word if you prefer four switches.
2. **Contract secrets check.** Its substring lists cannot express "who has which role"; Nightfall's
   real leak tests are non-interference (re-deal every role a viewer may not know → the view is
   byte-identical) in `__tests__/leaks.test.ts` and `bot.test.ts`, i.e. audit #24's proposal,
   locally. The contract config still checks that no phone holds another phone's night report.

## What's left

See the stage table. Review passes are logged under `reports/design/record-review/nightfall/`.
