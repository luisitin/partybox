# PartyBox Game Pack: Foundation audit (Part 00 vs `main`)

_Audited 2026-09-24 against `main` @ `c1c35d7b` in `C:/dev/partybox-session-c`. Sources: `docs/game-pack/parts/00-FOUNDATION.md` (the spec), `C:/dev/partybox-ideas/GAME-DESIGN-BRIEF.md` (the brief), and six area audits (§1, §2, §3, §4, §5, §6–8). I checked every blocker and major finding against the code again. No repo files were changed._

---

## Summary

1. The platform already covers most of what Part 00 calls "exists". Game UI is already lazy per surface. Speech, the reader voices, the VIP-stamped input, phone-only forks, the sim, the contract suite and screenshot tooling are all in place. The work ahead is mostly restructuring, not new systems.
2. One blocker comes first. The shell translates every game's tagline, description and setting labels from that game's client `strings` table. Making the registry lazy without first moving those translations to the server would break Spanish on the picker, or would download game code when the picker or About opens.
3. The biggest scaling problem today is that the full game list, every settings spec included, goes out in every room push. That is 15.2 KB raw for 5 games and about 42 KB at 14. The entry chunk also carries every game's string tables (625 KB raw / 196 KB gzip, sent uncompressed), and static files have no immutable caching.
4. Several spec rules need errata before coding:
   - Spanish article removal vs number words
   - stems that never match singular and plural
   - matcher `lang` has no source
   - presence via `__presence` cannot work
   - the speech key format fails the server's regex
   - case-insensitive overrides
   - the build check reads a Vite manifest that cannot see inlined modules
5. The recommended order starts with an F0 errata pass. F1 then moves the translations before it goes lazy. F2 and F3 follow, then F5 and F6 in parallel, then F4, then F7 per game. Section 9 lists 20 owner questions, each with a recommended answer.

---

## Conflicts to settle

Severity: **B** = blocker, **M** = major, **m** = minor. "Holds" means I re-checked it in code. I dropped nothing that matters. Two findings are corrected in the notes after the table.

| #   | Spec §                                      | Conflict                                                                                                                                                                                                                                                                                                                                                                                                         | Evidence (file:line)                                                                                                                          | Sev   | Proposed fix                                                                                                                                                                                                                                                                                                        |
| --- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | §1.2, §1.4, §2.2                            | Picker text (tagline, description, setting labels, canStart reasons, server toasts) is translated from each game's **client** `strings` table, reached through the eager registry. A lazy registry leaves the picker untranslated or pulls game chunks on About. That breaks the §1.7 check "Opening About downloads no game code". The server has no Spanish, so `about(gameId, lang)` cannot be served. Holds. | `packages/client/src/i18n-games.ts:6-18`; `server-text.ts:121`; `scripts/i18n-coverage.test.ts:97-140`; `docs/DECISIONS.md:261-265` (ADR-044) | **B** | Move the manifest-facing Spanish into a server-readable per-game file, keyed by the English sentence: `games/<id>/manifest.es.json` (or a manifest `i18n.es` block). The catalog and `about` return text already translated. Point i18n-coverage at the new file. New ADR amending ADR-044.                         |
| 2   | §1.2, §2.6                                  | There is no separate catalog. The full `GameSummary[]` (descriptions plus all settings specs) is rebuilt inside **every** RoomSnapshot and sent to every phone and TV whose snapshot changed. Holds.                                                                                                                                                                                                             | `packages/engine/src/views.ts:76`; `packages/server/src/host.ts:111-127`                                                                      | **M** | Remove `games` from RoomSnapshot. Send the catalog once (on welcome, tv hello and resend) plus a `catalogRev` in the snapshot. Add `selectedGame?: {id, settings}` only while a game is chosen.                                                                                                                     |
| 3   | §1.2 vs today's picker                      | `CatalogEntry` has no `settings` or `estimate`. The per-row minutes estimate (I-189), key-setting chip (I-187), tuned line (I-763) and settings editor read them for every game.                                                                                                                                                                                                                                 | `estimate.ts:10-15`; `tunedLine.ts:14-21`; `keySetting.ts:13-14`; `Selecting.tsx:163-168,210-243`; `TvSelecting.tsx:68-74`                    | **M** | Add a small `pace` object to the catalog (≈90 B). The chosen game's settings go in `selectedGame`. The tuned line moves to the "Game options (n) ▾" header.                                                                                                                                                         |
| 4   | §2.3 "no new message"                       | `selectedGameId` does not mean "chosen". Entering the picker preselects a game: the vote leader or the first game on the phone, the first game on the TV. Every TV list click is a `selectGame`. A preload keyed on it would download a game on every picker open and every TV browse. Holds.                                                                                                                    | `controller/Lobby.tsx:63-69`; `tv/HostBar.tsx:172-174,248-252`; `tv/TvSelecting.tsx:57`; `engine/src/vip.ts:68-87`                            | **M** | Make `selectGame.gameId` nullable (`protocol.ts:45`). `null` means the list screen. Lobby "Pick a game", TV "Pick" and "‹ All games" send `null`. Preload runs when `selectedGameId` becomes non-null, on `playing`, or on `results.gameId`. This changes a message schema; state that in the spec.                 |
| 5   | §1.3 Suggest                                | It duplicates the shipped I-650 vote, which already shows per-person picks with counts on the VIP phone and TV. It is modelled on nudge, and the engine drops nudges outside `lobby`, so it would not work in `selecting`. Holds.                                                                                                                                                                                | `engine/src/room.ts:167` (nudge lobby-only), `:181-191` (vote); `VoteRow.tsx:38-76`; `TvLobby.tsx:272-300`                                    | **M** | Suggest sends the existing `vote`. The vote case adds a throttled toast ("👍 Maya suggests Fake-Out"), at most one per player per 10 s, using `event.now`. Keep the 🙋 counts. Changing the owner-picked I-650 chips needs the owner's OK.                                                                          |
| 6   | §1.6                                        | 14 cards in 4 columns × 220 px plus the host bar and player strip exceed 1080 px. The spec does not say what the TV shows after choosing. ADR-031/I-668 made the TV list clickable and its settings editable.                                                                                                                                                                                                    | `tv/TvSelecting.tsx:104-105` ("Nobody scrolls a TV"); `docs/DECISIONS.md:181-185`                                                             | **M** | Use compact ≈400×150 auto-fit cards and page past what fits. The mirror panel takes the right column. A click chooses (keeps ADR-031). After choosing, show today's editable settings card.                                                                                                                         |
| 7   | §2.2 build check                            | Vite's `manifest.json` lists only facade chunks. The 16 `games/*` modules inlined into the entry never appear in it, so the specified check passes on the exact bug it is meant to catch. A `dist/.vite/manifest.json` would also be served publicly, because `@fastify/static` defaults `dotfiles` to `'allow'`.                                                                                                | auditor ran `vite build --manifest` (no games keys under `index.html`); `packages/client/vite.config.ts:19`; `@fastify/static` index.js:56    | **M** | `scripts/check-bundle.ts` uses Vite's `build()` with a `generateBundle` plugin that fails if any `isEntry` chunk contains a `/games/` module id. It also prints per-game phone and TV closure sizes (gzip) and enforces the budget. Wire it into `pnpm verify`. Never ship a manifest.                              |
| 8   | §2.1, §2.3                                  | The lobby 🎨 sheet renders every game's `PhoneSettings` panel, so opening it downloads those panels. Under a lazy registry it can't even know which games have one. It also uses a hard-coded `GAME_NAMES` map. Holds.                                                                                                                                                                                           | `controller/PhoneSettings.tsx:10-16,223-235`                                                                                                  | **M** | Add a manifest flag `phoneSettings: true` and carry it in the catalog. Panels sit in collapsed rows that load on expand. Names come from the catalog.                                                                                                                                                               |
| 9   | §2.4                                        | Every static file, `index.html` and the SPA fallback included, is `max-age=3600`, not immutable. The launcher rebuilds on every start, so a cached `index.html` can point at deleted chunks (`stale.ts` papers over it with a reload). Nothing is compressed over HTTP. Holds.                                                                                                                                   | `packages/server/src/app.ts:327-334,336-345`; `start-partybox.bat:51-58`                                                                      | **M** | `setHeaders`: `/assets/*` gets `public, max-age=31536000, immutable`; `index.html` and the fallback get `no-cache`; `/music` and `/sfx` (unhashed names) get a long max-age without immutable. Precompress `.br`/`.gz` for assets only and set `preCompressed: true`. No new dependency.                            |
| 10  | §3.4 vs brief rule 13                       | Brief rule 13 says `init` gets "players, settings, seed and time only". `contract.ts:2` requires an ADR before any context change.                                                                                                                                                                                                                                                                               | `GAME-DESIGN-BRIEF.md:102`; `packages/shared/src/contract.ts:2,148-153`                                                                       | **M** | ADR-047. Make `InitContext.presence?` and `PlayerInfo.canSeeTv?` optional, with defaults of together / no phone-only / true. Amend rule 13: presence fixed at start is not carry-over. Needs the owner's OK (rule 0.2.1).                                                                                           |
| 11  | §3.4 fallback                               | The `__presence` setting cannot work. `coerceSettings` drops keys that are not in the manifest. `SettingValue` cannot hold an object. Keys must start with a letter. It would also leak into tuned settings, play-again and the recap.                                                                                                                                                                           | `engine/src/settings.ts:34-54`; `shared/src/contract.ts:11,118-120`                                                                           | m     | Drop the fallback. The preferred path has one production call site (`engine/src/runner.ts:38`).                                                                                                                                                                                                                     |
| 12  | §3.1, §3.3 address default                  | The Cloudflare quick-tunnel remote path is shipped (I-646). Tunnelled phones arrive from 127.0.0.1. Loopback is not in the spec's private list, so every localhost harness phone, dev tab and design recorder would default to remote. That would fork them to PhoneStage and fire the VIP toast, changing every recorded filmstrip.                                                                             | `server/src/public-url.ts:1-9`; `dev-api.ts:64-69`; `rooms-route.ts:21-24,60`; `lan-ip.ts:18`                                                 | **M** | Pure classifier `server/src/presence-address.ts`, checked in this order: forwarded header from a loopback peer → remote; loopback without a header → at-TV; RFC1918, link-local and ULA → at-TV; anything else (including 100.64/10) → remote. Strip `::ffff:` first. Headers count only when the peer is loopback. |
| 13  | §3.6 P1                                     | Only Bingo uses the module-level `PhoneStage`. The other four games (and Bingo's own Controller) fork inline on the engine-stamped `view.phoneOnly`: 27 lines in 13 files, plus 20 SDK lines. A new hook plus a Playing.tsx gate alone would still tell remote players to "look at the TV".                                                                                                                      | `controller/Playing.tsx:165-168`; `engine/src/views.ts:135`; e.g. `games/wisecrack/client/ControllerVote.tsx:34,87-89`                        | **M** | The engine stamps each controller view `phoneOnly = room.phoneOnly \|\| player.canSeeTv === false`, using the **live** per-phone value. Every existing gate (games, SDK lines, clip gating) then follows with no game edits. `useCanSeeTv() = !usePhoneOnly()`. Document the new meaning; amend ADR-041.            |
| 14  | §4.3–4.7 `lang`                             | `normalize` needs a language. `matchAnswer`, `sameAnswer` and `isLegalClue` take none, and game servers have no language (it is per device; content stays in English, §7.8).                                                                                                                                                                                                                                     | `00-FOUNDATION.md:425,459,479,491`; brief §11; no `lang` in `contract.ts`                                                                     | **M** | The language comes from the content. Answer packs carry a required `lang: 'en'\|'es'`. Every match function takes `lang` explicitly. Player-vs-player text uses the prompt pack's language.                                                                                                                         |
| 15  | §4.3 steps 6/8                              | Spanish `un`/`una` are both articles and number words. Numbers are converted before articles are dropped, so "una piñata" becomes "1 pinata". Broken Pencil's test expects "pinata".                                                                                                                                                                                                                             | `games/broken-pencil/__tests__/game.test.ts:318`                                                                                              | **M** | Drop the leading article before converting numbers.                                                                                                                                                                                                                                                                 |
| 16  | §4.4 stems                                  | The stems strip the plural but don't canonicalise, so common pairs never meet: movies→movy vs movie; horses→hors vs horse; knives→knif vs knife; noches→noch vs noche. At ≤4 letters, fuzzy allows 0 edits, so pie/pies fail too.                                                                                                                                                                                | spec lines 448-457, 466-473                                                                                                                   | **M** | Canonicalising rules for EN (ies→i, ves→f, es after sibilants, s, then a final e dropped, y→i) and ES (ces→z, es after a consonant, s, then a final e). Pin every pair in the tests.                                                                                                                                |
| 17  | §5.4 part shape                             | The spec says `{phonemes, text}`. The contract and the Blanks lexicon use `{ipa, text?}`, and `text` is optional. Zira reads `text ?? ''`, so an ipa part without text is silent on Zira. 83 Blanks entries have ipa and no `say`.                                                                                                                                                                               | `shared/src/contract.ts:179`; `server/src/speech.ts:128`; `games/blanks/content/schema.ts:73-77`                                              | **M** | Keep the wire name `ipa` and amend the spec. Make `text` required on ipa parts. In override files, accept `phonemes` as an alias. Backfill `say`.                                                                                                                                                                   |
| 18  | §5.6 key format                             | The example key `fakeout-3f9a1c` fails the server key regex (no hyphens, ≤40 characters). So do the ids `broken-pencil` and `lightning-round`. `want()` answers −1 and the route returns 404. A key that hashes only the text (the spec's wording) is unsafe to mark immutable. Holds.                                                                                                                           | `server/src/speech.ts:26,145,169`                                                                                                             | **M** | Regex `/^[a-z0-9][a-z0-9-]{5,63}$/`. Shared `speechKey(gameId, voice, parts)` hashes `ENGINE_VER\|voice\|JSON(parts)`. Only then mark the route immutable.                                                                                                                                                          |
| 19  | §5.6 "same line hits the cache in any room" | **Existing bug.** `attachSpeech` remembers `room:key` in `asked` forever. A later game in the same room that asks for the same key never gets a `speech` event. Blanks then never plays that reading, and a reveal card waits the full 12 s. The Set also grows forever. Holds.                                                                                                                                  | `server/src/speech.ts:183-192`; `games/blanks/server/phases/reveal.ts:20-23`                                                                  | **M** | Tag by game run (`room.game.startedAt`), or clear the room's tags when `room.game` changes. Server test: two games in one room both receive the event.                                                                                                                                                              |
| 20  | §2.6 speech load                            | Kokoro has one sidecar for all voices with an unbounded stdin backlog. Zira spawns one `powershell.exe` per line with no limit. There is no queue cap or priority. A dead sidecar is never restarted, so every Kokoro line gets −1 until the host restarts. Holds.                                                                                                                                               | `server/src/speech.ts:88-124,117-121,126-141`                                                                                                 | **M** | FIFO queue, capped at 64, with "now" lines ahead of prefetch. Zira runs one at a time. Restart the sidecar with backoff. A dropped prefetch gets **no** reply (−1 silences Blanks for the whole game: `games/blanks/server/round.ts:33-36`).                                                                        |
| 21  | §5.4 matching                               | "Whole words, case-insensitive" would respell _us, it, ai, bass_ everywhere. Blanks matches exact tokens case-sensitively on purpose and also uses per-card fixes, regex patterns and `spell`.                                                                                                                                                                                                                   | `games/blanks/server/speech.ts:49`; `pronounce.json`                                                                                          | **M** | Case-sensitive by default, with `anyCase: true` per entry. The shared schema is a superset of Blanks': words, items, patterns, say/spell/ipa.                                                                                                                                                                       |
| 22  | §5.8 fixed clips                            | The pipeline the spec points to does not exist. The Kokoro Bingo clips come from an out-of-repo script at speed 1.0 (live speech uses 0.92/1.1), with no trim or loudness step. No Zira generator exists. Measured: Kokoro clips are 3–5 dB louder than Zira; fable b12 peaks at 0 dBFS.                                                                                                                         | `C:/dev/partybox-ideas/capture/render_bingo_calls.py:15-27`; `games/bingo/client/caller.ts:10-45`                                             | **M** | In-repo `scripts/render-clips.ts` using the same sidecar and speed table: trim to a 20 ms pre-roll, normalise to one target, -1 dBFS ceiling. Apply the same normalisation to live lines. Re-level Bingo only with the owner's OK.                                                                                  |
| 23  | §6 components in `game-sdk/ui`              | Everything exported from the `ui` barrel lands in the app entry chunk. Shell-unused ChoiceGrid, TextAnswer and VoteList CSS and JS are already there. `game-sdk` has no `sideEffects` field. Adding seven pack components would ship them to every phone at join.                                                                                                                                                | entry `index-*.css` holds `pb-choice-settle` and `pb-urge`; `packages/game-sdk/src/ui.ts:156-161`                                             | **M** | One subpath export per pack component (`@partybox/game-sdk/ui/secret-card`), so each lands in its game's chunk. `check-bundle` fails if any of them reaches the entry.                                                                                                                                              |
| 24  | §8 secrets / §7.3                           | Secret checks are substring lists. Strings under 3 characters are skipped, numeric secrets can't be expressed, and views are sampled about every 12th state. That cannot cover role attribution, Spy Grid's key card, Tune In's target or Blind Auction's bids. No check covers "the phone never shows a result before the TV".                                                                                  | `game-sdk/src/contract-tests/contract.test.ts:50-59,56,195-197`; `load.ts:13-20`                                                              | **M** | Non-interference hook `perturbSecrets(state, viewer, rng)`. Views must be byte-identical after re-rolling secrets the viewer may not know, on every visited state. Optional `revealGate` hook. Make `contract.config` required for games tagged `hidden-roles`/`bluff`.                                             |
| 25  | §4.3 step 1 vs 3                            | NFKD turns `´` into space plus a combining mark, so "don´t" becomes "don t".                                                                                                                                                                                                                                                                                                                                     | node check                                                                                                                                    | m     | Strip quotes and apostrophes before NFKD.                                                                                                                                                                                                                                                                           |
| 26  | §4.3 step 5                                 | ø, ß, æ, œ, ł, đ, þ and ı are not decomposed by NFKD and become spaces ("straße" → "stra e"). "½" becomes "12".                                                                                                                                                                                                                                                                                                  | node check; `broken-pencil/server/books.ts:77`                                                                                                | m     | Fold table after lowercasing: ß→ss, ø→o, æ→ae, œ→oe, ł→l, đ→d, þ→th, ı→i.                                                                                                                                                                                                                                           |
| 27  | §4.3 step 8                                 | A lone article ("A", "the") would normalize to empty.                                                                                                                                                                                                                                                                                                                                                            | `broken-pencil/server/books.ts:80`                                                                                                            | m     | Drop an article only when another word follows it (today's behaviour).                                                                                                                                                                                                                                              |
| 28  | §4.2 dedupe                                 | Spacing variants (ice cream/icecream) are listed as accepts but are equal once compacted, so the spec's own example fails its pack test.                                                                                                                                                                                                                                                                         | spec :416,422                                                                                                                                 | m     | Dedupe on compact. Tell writers that spacing, case, accent and apostrophe variants are automatic.                                                                                                                                                                                                                   |
| 29  | §4.5 reject                                 | Step 1 blocks only exact compact rejects. "puffins" (reject puffin) and "hose" (answer horse) slip through at the stem or fuzzy step.                                                                                                                                                                                                                                                                            | spec :463-473                                                                                                                                 | m     | Rejects also compare by stem. Fuzzy is blocked when the input is at least as close to a reject as to the target. Digits never fuzz (1984/1985). Use OSA distance, minimum over the answer and every accept.                                                                                                         |
| 30  | §4.6                                        | `sameAnswer` is pairwise and not transitive. Grouping needs a deterministic order, and existing tie-breaks use `localeCompare`, which §4.1 bans.                                                                                                                                                                                                                                                                 | `games/wisecrack/server/scoring.ts:79`; `game-sdk/src/scoring.ts:15`; `views.ts:20`; `engine/src/views.ts:19`                                 | m     | Add `groupAnswers(entries, lang)`: stem buckets, then union-find on one edit, in stable submission order. Add a lint ban on `localeCompare`, `toLocale*` and `Intl` in `games/**/server` and `match/`, and replace the 5 existing call sites.                                                                       |
| 31  | §4.7                                        | "longer than 20" vs the message "under 20". Raw vs normalized length is not defined. There is no Spanish message. Is "ice-cream" one word?                                                                                                                                                                                                                                                                       | spec :495-497                                                                                                                                 | m     | Length is counted on the raw trimmed text in code points. `oneWord` splits raw text on whitespace, so a hyphenated clue is one word. The SDK returns reason codes and games translate them.                                                                                                                         |
| 32  | §4.8 That counts                            | Only the VIP's **phone** can send game inputs. The TV host bar sends room actions only, so TV-run rooms can't override. Fuzz never sends `vip: true`. The Broken Pencil precedent has a bug: its recap ignores the veto.                                                                                                                                                                                         | `server/src/sockets.ts:266-306`; `contract-tests/fuzz.ts:30-51`; `broken-pencil/server/recap.ts:5,71`                                         | m     | Accept the limitation for now and say so in the spec. Fuzz with `vip: true/false`. Keep one `judged()` helper that feeds score, awards, views and recap; store what was counted, never who counted it. Fix the Broken Pencil recap.                                                                                 |
| 33  | §3.2 vs §3.3                                | The toast's buttons switch the room mode, which is forbidden mid-game, while the toggle can flip mid-game. The toast is fire-and-forget with no buttons, and it only goes to the VIP's phone (TV-run rooms, ADR-031).                                                                                                                                                                                            | `engine/src/vip.ts:252-255`; `engine/src/types.ts:143-151`                                                                                    | m     | Derive the prompt on the client from the snapshot (`players[].canSeeTv` + `presenceMode`). Show it on the VIP's phone and the TV host bar, between games only, and never in phone-only rooms.                                                                                                                       |
| 34  | §3.6 P2 / §7.6                              | The brief says private per-phone audio exists only in phone-only rooms. The TV's phase cue already plays on phones in phone-only and music-on-phones rooms. The spec doesn't say whether remote phones get cues and music.                                                                                                                                                                                       | brief :193,306; `ControllerShell.tsx:137-151`; `phone-music.ts:26-32`                                                                         | m     | Remote phones get readings, TV cues and music by default, with the 🎨 opt-outs. Reword rule 7.6. Update brief §8 and §13.                                                                                                                                                                                           |
| 35  | §3.3/3.4 bots                               | canSeeTv is undefined for bots and for phones that have never reported.                                                                                                                                                                                                                                                                                                                                          | `engine/src/runner.ts:9-19`                                                                                                                   | m     | Bots are always `true`. A phone that has not reported uses the address default computed at join.                                                                                                                                                                                                                    |
| 36  | §1.2 tags                                   | Existing tags are free-form, and Bingo has no tag on the fixed list. There is no Comedy or Strategy chip. `quick` is hand-set and can drift. Blanks' `adult` marker would vanish. No code reads tags today.                                                                                                                                                                                                      | `games/*/manifest.json`; `shared/src/contract.ts:104`                                                                                         | m     | Schema enum of 1–3 tags. Derive `quick` from `estimatedMinutes ≤ 8`. Add a Comedy chip. Give Bingo a legal tag (the owner decides which). Blanks' 🔞 stays on the key-setting chip.                                                                                                                                 |
| 37  | §1.2/§1.4 limits                            | The schema allows tagline 80 and description 500; the spec wants 60 and 300. Bingo's description is 370 and Blanks' is 303 characters.                                                                                                                                                                                                                                                                           | `shared/src/contract.ts:84-85`                                                                                                                | m     | Tighten the schema; trim both descriptions (with Spanish).                                                                                                                                                                                                                                                          |
| 38  | §1.2 isNew                                  | Computing it in pure `views.ts` would read the wall clock (breaks ADR-010). With real dates, all five existing games show NEW until mid-October.                                                                                                                                                                                                                                                                 | `engine/src/views.ts:16-47`; `DECISIONS.md:60-64`                                                                                             | m     | Build the catalog in the server's `loadGames` with the host clock. The owner picks the existing games' `addedOn`.                                                                                                                                                                                                   |
| 39  | §1.2 icon                                   | The shell already hard-codes a glyph map, and it **differs** from the spec: Blanks is ✍️ there and 🃏 in the spec.                                                                                                                                                                                                                                                                                               | `tv/HostBar.tsx:18-25`                                                                                                                        | m     | Delete `GAME_GLYPH` and read `catalog.icon`.                                                                                                                                                                                                                                                                        |
| 40  | §1.3 misc                                   | The one-tap fix already adds N bots or removes bots, but the spec says "one bot". Votes-vs-NEW sort order is undefined. There is no place for the I-642 room row or Back. Non-VIP phones see a WaitingScreen, not a list.                                                                                                                                                                                        | `startFix.ts:27-68`; `Selecting.tsx:30-44,57-59,95-118`                                                                                       | m     | Reuse `startFix` labels. Sort by fits → votes → NEW → A–Z. Move the room row to the chosen-game screen. Non-VIP phones get the read-only list.                                                                                                                                                                      |
| 41  | §1.4 mirror                                 | `highlightedGameId` needs a new VIP action and room field, plus clearing rules.                                                                                                                                                                                                                                                                                                                                  | `protocol.ts:44-70,138-170`                                                                                                                   | m     | `{action:'highlight', gameId\|null}`, allowed in lobby and selecting. Clear on select, start, toLobby, playAgain and VIP change.                                                                                                                                                                                    |
| 42  | §1.6 keyboard                               | The host bar has no keyboard handling; the only listeners are in the audio gate.                                                                                                                                                                                                                                                                                                                                 | `tv/AudioGate.tsx:55,77-86`                                                                                                                   | m     | Optional new work (roving tabindex); the owner decides.                                                                                                                                                                                                                                                             |
| 43  | §2.2 registry snippet                       | There is no `@games` alias. The registry is **generated** (ADR-003), and `new-game` regenerates it instead of appending.                                                                                                                                                                                                                                                                                         | `scripts/gen-registry.ts:23-51`; `scripts/new-game.ts:64-66`                                                                                  | m     | `gen-registry` emits `gameLoaders` with relative dynamic imports. Amend the spec text.                                                                                                                                                                                                                              |
| 44  | §2.2 phone/TV split                         | The shell entry bundles TvApp and Preview for phones. The Blanks phone Controller imports a constant from `TvResult.tsx`, pulling the TV result chunk (≈12.6 KB gz JS+CSS) onto phones. Holds.                                                                                                                                                                                                                   | `client/src/main.tsx:6,8,17`; `games/blanks/client/Controller.tsx:26`                                                                         | m     | Lazy per route in `main.tsx`; move `RESULT_BEATS_MS` to `client/timing.ts`; assert no `Tv*` facade in phone closures.                                                                                                                                                                                               |
| 45  | §2.3 retries                                | Today: a rejected `React.lazy` stays cached, preload errors reload once, and the error boundary offers a full reload. A pure retry loop would retry forever after a relaunch (old hashes 404).                                                                                                                                                                                                                   | `net/stale.ts:27-32`; `GameErrorBoundary.tsx:28-48`                                                                                           | m     | Loader cache with retries at 1/3/6 s. Then check `/api/info` `startedAt`: if it changed, reload once; otherwise show the tap-to-retry card.                                                                                                                                                                         |
| 46  | §2.5 lint                                   | A literal client→content ban flags the legitimate `content/schema` import (Blanks `BLANK`). The real leak path is transitive (client → server → json).                                                                                                                                                                                                                                                           | `games/blanks/client/Cards.tsx:7`; `games/blanks/server/fill.ts:3`                                                                            | m     | dependency-cruiser `reachable: true` rule from `client/` to `content/*.json` and `server/content.ts`, for all games. It replaces the two per-game phone-bundle tests.                                                                                                                                               |
| 47  | §5.3 rule 3                                 | The spec respells possessives as plurals. Blanks deliberately keeps `'s` after an ipa part, and its test expects that.                                                                                                                                                                                                                                                                                           | `games/blanks/server/speech.ts:45,58`; `__tests__/speech.test.ts:32-34`                                                                       | m     | Rule 3 applies to text parts. After an ipa part, append `z`/`ɪz` phonemes.                                                                                                                                                                                                                                          |
| 48  | §5.7 10 pending keys                        | Blanks asks for 1 + players readings (up to 14).                                                                                                                                                                                                                                                                                                                                                                 | `games/blanks/server/speech.ts:125-135`                                                                                                       | m     | Cap at `max(10, players + 1)` through a shared helper.                                                                                                                                                                                                                                                              |
| 49  | §5.4 fallback                               | Kokoro's tokenizer **silently drops** unknown phoneme symbols, so a bad ipa entry comes out garbled with no error.                                                                                                                                                                                                                                                                                               | `tools/tts/venv/.../kokoro_onnx/tokenizer.py:71`                                                                                              | m     | The sidecar validates ipa against the vocab and falls back to `text`. A pack test checks every override.                                                                                                                                                                                                            |
| 50  | §5.9 lab route                              | There is no `/dev/` client route (the SPA would render the Controller). No hook enumerates a game's read-aloud lines.                                                                                                                                                                                                                                                                                            | `client/src/main.tsx:23-40`; `server/src/dev-api.ts:55-77`                                                                                    | m     | Lazy `/dev/speech-lab` branch; `/api/dev/speech/{lines,try,flag}` behind the existing dev and loopback lock; optional `readAloud()` hook.                                                                                                                                                                           |
| 51  | §5.1 "never speechSynthesis"                | TvApp still calls `speechSynthesis.cancel()` (a leftover; it never speaks).                                                                                                                                                                                                                                                                                                                                      | `tv/TvApp.tsx:82`                                                                                                                             | m     | Remove it when F6 touches TvApp.                                                                                                                                                                                                                                                                                    |
| 52  | §6 TeamBanner                               | Sun = `--pb-accent` = player 1's colour; Moon = `--pb-info` = player 4's colour.                                                                                                                                                                                                                                                                                                                                 | `styles/tokens.css:11,15,26,29`                                                                                                               | m     | `--pb-team-sun`/`--pb-team-moon` tokens per theme. Show membership as shape plus a band, never as a tint on the face.                                                                                                                                                                                               |
| 53  | §6 helpers                                  | The signatures imply a mutable RNG, and `pick` throws on an empty list. Reducers must be pure and must never throw.                                                                                                                                                                                                                                                                                              | `shared/src/rng.ts:44-68`; `game-sdk/src/index.ts:37`                                                                                         | m     | `[value, RngState]` returns. `majorityPick` returns `null` when there are no votes.                                                                                                                                                                                                                                 |
| 54  | §7.9 honest bots                            | `sampleInput` gets the full state; the rule is not checked.                                                                                                                                                                                                                                                                                                                                                      | `shared/src/contract.ts:287-290`; `contract.test.ts:203-224`                                                                                  | m     | Add `viewBot(controllerView, decide)`. The contract asserts `sampleInput == decide(controllerView)` for new games.                                                                                                                                                                                                  |
| 55  | §2.6 4 KB views                             | The contract and sim allow 64 KB. Blanks views reach 7.5 KB and Lightning 6.1 KB. The envelope alone is ≈1.5 KB at 16 players.                                                                                                                                                                                                                                                                                   | `contract.test.ts:15`; `sim/src/invariants.ts:118`                                                                                            | m     | Per-game `viewBudgetBytes`: default 4096 for new games, the existing five grandfathered.                                                                                                                                                                                                                            |
| 56  | §8 sim budget                               | The sim uses 4× `estimatedMinutes`, the contract 3×. `verify` runs 50 mixed runs, not 200 random plus 200 idle.                                                                                                                                                                                                                                                                                                  | `sim/src/runner.ts:77`; `smoke.ts:6`                                                                                                          | m     | `pnpm sim --dod` (200 random + 200 idle, 3×, players vary).                                                                                                                                                                                                                                                         |
| 57  | §8 screenshots                              | There is no 390×844 preset ("iphone" is 393×659). 200 % text exists only on a 412-wide Pixel. `e2e:snap` has no themes flag.                                                                                                                                                                                                                                                                                     | `packages/e2e/src/devices.ts:24-65`; `cli.ts:73`                                                                                              | m     | Presets `phone-390`, `se-font200`, `sideways`; `--themes` and `--dod` flags.                                                                                                                                                                                                                                        |
| 58  | §8 manifest fields                          | Zod strips unknown keys, and the contract deep-equals the manifest against the JSON, so adding fields before the schema breaks tests or silently drops them.                                                                                                                                                                                                                                                     | `shared/src/contract.ts:80-115`; `contract.test.ts:100`                                                                                       | m     | Change the schema first, then the manifests, in one commit.                                                                                                                                                                                                                                                         |
| 59  | §8 README headings                          | The docs say the headings are checked "in this order"; `check-drift` only checks presence. The ADDING_A_GAME DoD lacks most §8 items.                                                                                                                                                                                                                                                                            | `scripts/check-drift.ts:79-84`; `docs/ADDING_A_GAME.md:90-104`                                                                                | m     | Check the order; mirror §8 with a command per checkbox.                                                                                                                                                                                                                                                             |
| 60  | §7.3 at-TV copy                             | SDK default lines switch wording only for room-wide phone-only.                                                                                                                                                                                                                                                                                                                                                  | `game-sdk/src/controller/phoneOnly.tsx:21-38`                                                                                                 | m     | Fixed by the per-phone stamp (#13); add a shared `WatchTheTv`.                                                                                                                                                                                                                                                      |

**Corrections to the auditors' notes:**

- The §6 auditor worried that the entry-chunk numbers came from a stale `dist`. They don't: the §2 auditor rebuilt and got the same hash (`index-CDb1uVhp.js`). The numbers are current for `c1c35d7b`.
- On #19 (the `asked` Set): the stall happens only when a later game in the **same room** needs a key an earlier game already asked for. That is most often the same black card read alone. In practice it means an occasional silent question or a 12 s card, not every game. It is still a real bug, and more voiced games make it more likely.

**Repo docs to update with these decisions:** `docs/game-pack/schemas/*.json` were written from the spec text. After the owner rules, update them for:

- a pack-level `lang` on answer items (#14)
- `presence.gameContext` without the `__presence` fallback (#11)
- pronunciation entries (`ipa` alias, case rule, items, patterns: #17, #21)
- the tag enum (#36)

---

## What already exists

**§1 Picker**

- Game list in every snapshot (`GameSummary`): `packages/shared/src/protocol.ts:111-129,149`; built in `packages/engine/src/views.ts:16-47`.
- `GET /api/games`: `packages/server/src/app.ts:273`.
- Per-client dedupe of pushes: `packages/server/src/host.ts:100-127`. Socket deflate above 1 KB: `packages/server/src/sockets.ts:49`.
- VIP picker (vote counts, fit line, one-tap fix, key chip, tuned line, settings editor, sticky Start/Back): `packages/client/src/controller/Selecting.tsx:60-246`.
- I-642 room switches on the picker: `Selecting.tsx:95-118`.
- I-650 votes: `packages/engine/src/room.ts:181-191`, `packages/client/src/controller/VoteRow.tsx`, `packages/client/src/tv/TvLobby.tsx:272-300`.
- Nudge: `room.ts:162-180`.
- `tuned` (I-763): `packages/engine/src/vip.ts:78-83`. `tonight` (I-652, the "↻ played" source): `views.ts:84-92`.
- One-tap fix (I-667): `packages/client/src/startFix.ts`. Estimate (I-189): `packages/client/src/estimate.ts`.
- TV picker, clickable and editable (ADR-031, I-668): `packages/client/src/tv/TvSelecting.tsx`.
- "Getting the game ready…": `packages/client/src/i18n-en.ts:202`, `controller/ControllerApp.tsx:168-173`.
- Tokens the spec names: `packages/client/src/styles/tokens.css:7-15`.

**§2 Code splitting and delivery**

- Generated registry (eager): `packages/client/src/games.generated.ts`, `scripts/gen-registry.ts`.
- Game surfaces are already `React.lazy` per surface (Tv, Controller, PhoneStage, PhonePanel, Finale): `games/*/client/index.ts`, `packages/game-sdk/src/client-module.ts:33-112`.
- I-752 fixed: no content in any built JS. Checks: `games/blanks/__tests__/phone-bundle.test.ts`, `games/lightning-round/__tests__/phone-bundle.test.ts`.
- Servers import packs directly: `games/*/server/content.ts`.
- Suspense fallbacks and error boundary: `controller/Playing.tsx:176-198`, `tv/TvPlaying.tsx:185-202`, `controller/GameErrorBoundary.tsx`.
- Stale-chunk reload: `packages/client/src/net/stale.ts`.
- Audio by URL only, never bundled: `packages/client/src/music.ts:191`, `sound.ts:34-38`, `games/bingo/client/caller.ts:27`.
- No service worker.

**§3 Presence**

- `phoneOnly` room flag, rejected mid-game (the pattern for the new mode): `packages/engine/src/vip.ts:252-268`.
- `musicOnPhones`: `vip.ts:232-246`.
- Per-view stamp: `engine/src/views.ts:135`.
- PhoneStage fork: `controller/Playing.tsx:164-196`.
- `usePhoneOnly` and `SDK_LINES`: `packages/game-sdk/src/controller/phoneOnly.tsx`.
- Per-phone 🎨 toggles: `controller/PhoneSettings.tsx`.
- Phone cue and music gates: `ControllerShell.tsx:137-151`, `phone-music.ts:26-32`.
- The single production `init` call: `engine/src/runner.ts:38`.
- CGNAT regex: `server/src/lan-ip.ts:18`.
- Tunnel header handling on HTTP: `dev-api.ts:64-69`, `rooms-route.ts:21-24`.

**§4 Matcher**

- Only Broken Pencil's `normalizeText` and strict-equality verdict: `games/broken-pencil/server/books.ts:68-97` (3 test assertions).
- VIP-stamped input (ADR-042): `engine/src/room.ts:92`, `games/broken-pencil/server/phases/show.ts:58-76`.
- VIP button via `view.vip === me.id`: `games/broken-pencil/client/Controller.tsx:297-301`.

**§5 Voices**

- Speech service: four Kokoro voices plus Zira, sidecar, three-layer dedupe, disk cache, `/api/speech/:file`: `packages/server/src/speech.ts`, `packages/server/speech/kokoro_sidecar.py`.
- Contract: `SpeechPart`, `SpeechRequest`, `speech(state)`, the `speech` event: `packages/shared/src/contract.ts:173-188,316-321`; ADR-045.
- Blanks lexicon (151 words, 5 patterns, 60 per-card fixes), key, early requests, 12 s wait and 0.9 s beat pacing: `games/blanks/server/speech.ts`, `phases/reveal.ts:13-41`.
- Client playback: `games/blanks/client/useReading.ts`.
- Bingo fixed clips (5 voices × 75): `packages/client/public/sfx/calls/`, `games/bingo/client/call-voices.json`.
- Reader select settings: `games/blanks/manifest.json:96-115`, `games/bingo/manifest.json:120-126`.

**§6–8 SDK and quality bar**

- UI barrel (Stage, Timer, Scoreboard, Reveal, VoteList, ChoiceGrid, TextAnswer, motion hooks, sound): `packages/game-sdk/src/ui.ts`.
- `flip` keyframe: `packages/client/src/styles/global.css:154-170`.
- Scoring helpers (`rank`, `buildResults`, `speedPoints`): `packages/game-sdk/src/scoring.ts`.
- `applyVip` pause/resume/skip and `allConnectedDone`: `packages/game-sdk/src/timer.ts`.
- Contract suite: `packages/game-sdk/src/contract-tests/`. Sim with chaos strategies: `packages/sim/`.
- Screenshot presets and design capture with themes: `packages/e2e/src/devices.ts`, `packages/e2e/src/design/capture-preview.ts`.
- README checks: `scripts/check-drift.ts`.
- Game scaffold: `scripts/new-game.ts` + `games/_template`.
- Pack docs already stored: `docs/game-pack/` (parts, per-game folders, 5 JSON schemas).
- Skills already stored: `.claude/skills/game-pack-build`, `record-review`, `ship-spec`.
- Recorder helper: `packages/e2e/src/design/dead-air.ts`.
- All of the above are untracked; F1 commits must not sweep them in.

---

## Gaps by F-task

**F1: Code-split games**

- **L:** Lazy registry. `gen-registry` emits `gameLoaders` (per-surface `phone.ts`/`tv.ts` entries recommended). Add a loader cache and `useGameModule(id)`. Replace the 10 synchronous `clientGames` call sites: `i18n-games`, `server-text`, `ControllerApp`, `ControllerShell`, `PhoneSettings`, `Playing`, `Results`, `TvApp`, `TvPlaying`, `TvResults`. Handle the case where the in-game hooks (sounds, music, beds, strip*, finale, scoreless) are not loaded yet.
- **M:** Picker translations move to the server side (#1). This must land **before** the registry goes lazy.
- **M:** `scripts/check-bundle.ts`: entry has no `games/*` module; per-game phone and TV closure sizes; budget file; runs in verify (#7).
- **S:** ESLint ban on `games/*/client` imports outside `games.generated.ts`.
- **S:** dependency-cruiser reachability rule from client to content (#46).
- **S:** Retries at 1/3/6 s, a stale-build check, and a "Couldn't load the game. Tap to retry." card in EN and ES (#45).
- **S:** Lazy `TvApp` and `Preview` per route. Blanks `RESULT_BEATS_MS` moves to `timing.ts` (#44).
- **S:** 🎨 sheet panels load on demand behind a manifest flag; drop `GAME_NAMES` (#8).
- **S:** Cache headers per file class plus precompressed assets (#9).
- **M (recommended, beyond the spec):** get zod out of the client entry (≈171 KB pre-minify) with a zod-free `@partybox/shared/constants`.
- **S:** Pack SDK components get subpath exports (#23). This is a rule; the components themselves are built in F7.

**F2: Catalog and about**

- **S:** Manifest schema: `icon` (one grapheme), `howToPlay` (3 × ≤90), `presence`, `addedOn`, tag enum 1–3, tagline ≤60, description ≤300, `phoneSettings?`. Fill in the five manifests and `_template`, trim Bingo and Blanks, update `new-game.ts`.
- **M:** Catalog built once in `loadGames` with the host clock; `isNew` and `quick` derived; `pace`. Delivered once, plus `catalogRev`. Remove `games` from RoomSnapshot and update ≈12 consumers. `selectedGame.settings` in the snapshot.
- **S:** `about(gameId, lang)` over the socket and `GET /api/games/:id/about?lang=` (≤2 KB), cached per session.
- **S:** Delete `GAME_GLYPH` (#39).
- **S:** Budget tests: ≤400 B per entry, ≤8 KB at 20 synthetic entries, about ≤2 KB in EN and ES.

**F3: Picker UI**

- **S:** Nullable `selectGame` (the list state) and its senders (#4).
- **S:** `highlight` action and `highlightedGameId` (#41).
- **S:** Suggest built on the vote (#5).
- **L:** Phone PickerList: title + player pill, FilterChips, GameRow (72 px, icon tile, ⓘ 44×44, dimmed with reason, ⚠, NEW, ↻), empty state, 200 % text, read-only for non-VIP phones.
- **M:** AboutSheet (85 vh, swipe/✕/outside to close, sticky Choose or Suggest, fix button, Good to know).
- **S:** Chosen-game screen: collapsible "Game options (n) ▾" with sticky Start; the room row moves here.
- **L:** TV compact paged grid, fit dimming, accent ring with mirror panel, click to choose, settings card after choosing. Keyboard navigation optional.
- **M:** Preload hook (after F1).
- **M:** Network-log e2e plus the screenshot matrix.
- **S:** EN/ES strings.

**F4: Presence**

- **S:** `presenceMode` room field, `setPresenceMode` (rejected mid-game), VipMenu switch, TV host-bar chip (Phone-only chip too).
- **M:** Per-phone `canSeeTv`: join field, `presence` socket message, address classifier (#12), 🎨 row, localStorage `partybox:can-see-tv`, `PlayerPublic.canSeeTv`.
- **S:** VIP and TV prompt derived from the snapshot (#33).
- **S:** Contract: optional `InitContext.presence` and `PlayerInfo.canSeeTv`; ADR-047; brief rule 13 amended (#10).
- **M:** Per-phone `phoneOnly` stamp in `controllerView` (P1); `useCanSeeTv()` (#13).
- **S:** P2: cue, music and clip gates follow the per-phone stamp (#34).
- **M:** Lobby notices on choose (voice-if-remote / same-room) and a recap note.
- **M:** Sim and contract presence matrix (3 modes × phoneOnly × mixed roster); `?canSeeTv=0` harness override.
- **S:** Recorder session saves presence.

**F5: Match module**

- **S:** Spec errata (#14–16, #25–31) and ADR.
- **M:** `packages/game-sdk/src/match/`: normalize, fold, numbers-en/es, stem, OSA distance, matchAnswer, sameAnswer, groupAnswers, isLegalClue.
- **S:** `./match` subpath, tsconfig path, dependency-cruiser pure list.
- **S:** Locale-API lint ban; replace the 5 `localeCompare` call sites.
- **M:** ≈90-row table tests across 4 files (each ≤400 lines); a re-run under a different process locale.
- **M:** `answerItemSchema` with pack `lang`; `checkAnswerPack`; contract check #9 hook.
- **S:** Fuzz with `vip: true/false`; the That-counts pattern doc; fix the Broken Pencil recap veto.
- **Optional:** Broken Pencil adopts the matcher at the stem level (the owner decides).

**F6: Voices**

- **S:** Contract: required `text` on ipa parts; server-only `@partybox/game-sdk/speech` subpath with `speechKey`, `SPEECH_ENGINE_VERSION`, pacing helper lifted from Blanks; wider key regex (#17, #18).
- **L:** `toSpeakable` with the 13 rules, override precedence, player-text mode, skip-name rule.
- **M:** Global `overrides.en.json` (server-only) plus the shared pronunciations schema, a superset of Blanks' (#21).
- **M:** Service hardening: queue cap 64 with priority, Zira concurrency 1, sidecar restart, per-run dedupe fix (#19, #20), immutable header, optional tmp LRU.
- **S:** Sidecar ipa validation with fallback; loudness normalisation.
- **M:** `render-clips` pipeline plus an immutable route for game assets (#22).
- **M:** Speech lab (#50).
- **S:** Reader select helper; document `speech()` in `GAME_CONTRACT.md`.
- **M (optional):** "Say my name as" (P5).
- **Owner-gated:** Blanks migration onto `toSpeakable`.

**F7: SDK components and quality gates**

- **M:** SecretCard. Needs a reversible transform-only flip, iOS and Android long-press hardening, and a per-device tap-to-toggle setting.
- **M:** FacePicker. Build it new; VoiceList-style tap-to-lock doesn't fit. Imposter's two-imposter mode needs a **pick-two** mode, which §6 doesn't mention.
- **M:** Dial and DialInput.
- **S:** OrderPicker.
- **S:** BidPad.
- **S:** TeamBanner plus team tokens.
- **L:** WordGrid (Part 05).
- **S:** `teamsFromSeed`, `majorityPick`, `rotation` (pure, never throw).
- **S:** Awards helper and a 3–5 awards check.
- **M:** Reveal-step gating primitive.
- **M:** Non-interference secrets check (#24).
- **M:** Solo and dropper strategies.
- **S:** 16-player size log and per-game view budget.
- **S:** Phone-cue guard (in-hand cues only).
- **S:** Shared test kit.
- **S:** Screenshot presets and `--dod`.
- **S:** `_template` updated to the pack DoD.
- **S:** `ADDING_A_GAME` §8 mirror and heading-order check.

---

## Baseline measurements

Measured on `main` @ `c1c35d7b`, production build (Vite 8.3.0 / rolldown).

| What                                               | Now                                                                                                                  | Spec target                                                                 |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Entry JS `index-*.js`                              | 625,463 B raw / ≈196 KB gzip, **sent uncompressed**                                                                  | must not grow per game                                                      |
| Entry CSS                                          | 98,361 B raw / ≈18 KB gzip                                                                                           | —                                                                           |
| Entry composition (pre-minify)                     | react-dom 537 KB, **zod 171 KB**, controller shell 116 KB, TV shell 72 KB (phones get it too), 16 game modules 61 KB | shell + lobby + SDK UI only                                                 |
| Game code in entry, source gzip                    | bingo 8.5 KB, blanks 7.2, lightning 5.0, broken-pencil 4.9, wisecrack 3.5 (≈25 KB, grows per game)                   | 0                                                                           |
| Phone closure gzip, JS + CSS                       | bingo 29.0 KB, blanks 18.4 KB (includes a TV chunk), broken-pencil 8.7, wisecrack 5.7, lightning 5.3                 | budget = largest after F1 (Bingo ≈37.5 KB once its strings leave the entry) |
| TV closure gzip                                    | bingo 27.9, blanks 16.6, broken-pencil 6.9, lightning 6.2, wisecrack 5.6 KB                                          | —                                                                           |
| `room.games` in every snapshot                     | 15.2 KB raw / 4.1 KB deflate for 5 games; settings are 80 % of it; ≈42 KB raw at 14                                  | catalog ≤8 KB, sent once                                                    |
| Spec-shaped catalog (projected)                    | 234–260 B per entry; 1.2 KB for 5; ≈3.5 KB at 14 (≈4.3 KB with ES taglines)                                          | ≤400 B per entry, ≤8 KB                                                     |
| About (projected, EN)                              | bingo ≈1.26 KB, blanks ≈1.29, others 0.75–0.86                                                                       | ≤2 KB                                                                       |
| Static cache headers                               | everything `max-age=3600`; speech `max-age=86400`; no Content-Encoding                                               | assets immutable, index no-cache                                            |
| Max view size (random bots, max players)           | blanks 7.5 KB, lightning 6.1 KB, broken-pencil 4.5 KB, bingo 4.2 KB, wisecrack 2.2 KB, template 2.6 KB               | ≤4 KB target                                                                |
| 16-player envelope alone                           | ≈1.5 KB                                                                                                              | —                                                                           |
| Max state                                          | blanks 91.7 KB (12 players), broken-pencil 22 KB, others under 6 KB                                                  | ≤256 KB                                                                     |
| Speech tmp cache                                   | 175 WAVs, 44 MB, never pruned                                                                                        | —                                                                           |
| Bingo clips                                        | 375 WAVs, 25 MB. RMS: Zira ≈−24.5 dBFS (16 kHz), Kokoro ≈−20 to −22 (24 kHz); fable b12 peaks at 0 dBFS              | one loudness target                                                         |
| Audio in `dist`                                    | 117 MB (music 91 + sfx 26), copied every build                                                                       | —                                                                           |
| Phone-only forks in games                          | 27 lines in 13 files, plus 20 SDK lines; module `PhoneStage` in 1 of 5 games                                         | per-phone                                                                   |
| Matcher test coverage                              | 3 assertions                                                                                                         | 60+ cases                                                                   |
| `localeCompare`/`toLocale*` in server or pure code | 7 call sites                                                                                                         | 0 in match and game servers                                                 |

---

## Recommended build order and per-F-task plan

Rule 0.2.4 applies to every F-task: after each one, post screenshots, a five-line summary and open questions, then wait for the owner. Every UI change is recorded (filmstrip plus audio trace) and re-recorded after fixes, following `.claude/skills/record-review`.

**Order:** F0 → F2a → F1 → F2b → F3 → F5 ∥ F6 → F4 → F7 (per game).

- F2a (schema and translations) must come before F1. Otherwise the lazy registry breaks Spanish.
- F5 is pure and can run in parallel with F3 or F6.
- F4 is needed before Imposter, Spy Grid and Nightfall.
- F1–F3 ship on their own and fix the cramped picker first, as the spec intends.

### F0: Errata and decisions (docs only)

- **Steps:**
  1. Get the owner's answers to the questions at the end of this document.
  2. Write an errata block under each affected spec section (items #1, #4, #7, #10–18, #21, #25–31 and #43 from the conflicts table).
  3. Write the ADRs:
     - ADR-047: presence as an optional init input
     - ADR-048: shared answer matcher
     - ADR-049: manifest translations served by the server (amends ADR-044)
     - ADR-050: registry loaders (amends ADR-003)
     - ADR-045 addendum: speech keys and caching
  4. Update `docs/game-pack/schemas/*.json` to match.
- **Files:** `docs/game-pack/parts/00-FOUNDATION.md`, `parts/00-FOUNDATION.md`, `docs/DECISIONS.md`, `docs/game-pack/schemas/*`. The brief's rule 13 changes only if the owner approves.
- **Acceptance:** the owner has signed off on every conflict marked B or M.

### F2a: Manifest fields and server-side translations

- **Steps:**
  1. Extend `gameManifestSchema` (`packages/shared/src/contract.ts:80-115`) first.
  2. Update the five manifests and `_template`.
  3. Add `games/<id>/manifest.es.json`, covering tagline, description, howToPlay, every setting label, hint and option, and the canStart reasons.
  4. Remove the picker lines from client `strings` tables.
  5. `gameText` reads the catalog; `serverText` falls back to English until the module is loaded.
- **Files:**
  - `packages/shared/src/contract.ts`
  - `games/*/manifest.json`, `games/*/manifest.es.json`, `games/*/client/strings*.ts`
  - `games/lightning-round/client/strings-picker-es.ts` (folds in)
  - `packages/client/src/i18n-games.ts`, `packages/client/src/server-text.ts`
  - `scripts/i18n-coverage.test.ts`, `scripts/new-game.ts`
- **Tests:**
  - New keys survive parsing.
  - The schema rejects 4 tags, an unknown tag, two emoji, or a 91-character step.
  - i18n-coverage fails when any manifest line lacks Spanish.
- **Acceptance (§1.7):** every picker string exists in EN and ES.

### F1: Code-split games

- **Steps:**
  1. **F1a:** `check-bundle.ts`, ratcheted at today's 16 modules; record the baseline in `scripts/bundle-budget.json`.
  2. **F1c:** `gen-registry` emits `gameLoaders` (per-surface entries `games/<id>/client/{phone,tv}.ts`). Add `packages/client/src/games/registry.ts` with a promise cache, retries at 1/3/6 s and a stale-build check. Replace every consumer. The Playing, TvPlaying, Results and TvResults fallbacks render until the module resolves. In-game hooks default safely when the module is not loaded.
  3. **F1e:** 🎨 panels on demand.
  4. **F1f:** lint and reachability rules.
  5. **F1g:** lazy `TvApp` and `Preview` routes; Blanks `timing.ts`.
  6. **F1h:** cache headers and precompression.
  7. **F1j (if approved):** zod-free client constants.
  8. Ratchet the entry to 0 game modules. Measure every phone chunk and set the budget to the largest.
- **Files:**
  - `scripts/{gen-registry,check-bundle,verify}.ts`
  - `packages/client/src/{games.generated.ts,games/registry.ts,main.tsx,server-text.ts}`
  - `packages/client/src/controller/{ControllerApp,ControllerShell,Playing,Results,PhoneSettings}.tsx`
  - `packages/client/src/tv/{TvApp,TvPlaying,TvResults}.tsx`
  - `packages/game-sdk/src/client-module.ts`, `games/*/client/{index,phone,tv}.ts`
  - `eslint.config.js`, `.dependency-cruiser.cjs`
  - `packages/server/src/app.ts`
  - `docs/GAME_CONTRACT.md`
- **Tests:**
  - Loader retries under fake timers.
  - The stale path calls `reloadOnce`.
  - `fastify.inject` header tests: assets immutable plus `br`; `/` and `/tv` no-cache.
  - A negative lint fixture.
  - A synthetic 20th game proves the entry does not grow.
- **Acceptance (§2.2):**
  - No game file is in the entry chunk.
  - The entry does not grow when a game is added.
  - Every phone chunk is under the budget.
  - Phones never download a `Tv*` chunk.
  - Content never appears in client JS (the I-752 checks stay green).

### F2b: Catalog and about

- **Steps:**
  1. Build the catalog once in `loadGames`.
  2. Deliver it on welcome, tv hello and resend, with `catalogRev`.
  3. Add `about` on the socket and over HTTP.
  4. Remove `games` from `snapshot()`; add `selectedGame`.
  5. Update `PROTOCOL.md` and every consumer (grep e2e, sim and design tools too).
- **Files:**
  - `packages/server/src/{app,sockets,host}.ts`
  - `packages/engine/src/{views,types}.ts`
  - `packages/shared/src/protocol.ts`
  - client `net/*`, `Lobby`, `VoteRow`, `HostBar`, `Tonight`, `TvLobby`, `TvSelecting`, `TvPlaying`
  - `docs/PROTOCOL.md`
- **Tests:**
  - The room-push size does not depend on game count (register 14 fake games).
  - Catalog and about budgets hold.
  - An unknown about id returns 404.
- **Acceptance (§1.2):** ≤400 B per entry, ≤8 KB total, about ≤2 KB, long text only through about.

### F3: Picker UI

- **Steps:**
  1. Nullable `selectGame`, `highlight`, and the Suggest toast in the engine.
  2. Change the senders.
  3. Split `Selecting.tsx` into `controller/picker/{PickerList,FilterChips,GameRow,AboutSheet,ChosenGame}.tsx`.
  4. Build the TV grid and mirror.
  5. Add the preload hook.
- **Files:**
  - `packages/engine/src/{vip,room}.ts`
  - `packages/shared/src/protocol.ts`
  - `packages/client/src/controller/picker/*`
  - `packages/client/src/tv/TvSelecting.tsx` (+ css)
  - `packages/client/src/preload.ts`
  - i18n files
- **Tests:**
  - Engine tables: `select(null)`; a highlight from a non-VIP is refused; highlight clears on start, toLobby and VIP handover; two votes within 10 s give one toast.
  - Sort and filter unit tests.
  - Screenshots at 320×568, 390×844 and 200 % text, in 5 themes, with 5, 14 and 20 entries.
  - TV at 1920×1080 with 5, 14 and 20 entries, mirror open and closed.
  - 44 px tap-target check.
  - Scroll frame-time trace on a throttled CPU.
  - Recorded filmstrips of the sheet open and close and the TV mirror (no dead frames, no hard cuts: `dead-air.ts`).
- **Acceptance (§1.7):**
  - 20 entries scroll smoothly on a low-end Android.
  - Usable at 320×568 and at 200 % text.
  - No state shown by colour alone.
  - **Opening About downloads no game code** (network log).
  - **Choosing downloads exactly one phone chunk** (§2.3).

### F5: Match module

- **Steps:**
  1. Errata (F0).
  2. Scaffold `packages/game-sdk/src/match/*`.
  3. Lint ban on locale APIs; replace the call sites.
  4. Table tests.
  5. `checkAnswerPack` and the contract hook.
  6. Fuzz with the VIP stamp.
  7. That-counts doc; Broken Pencil recap fix.
- **Files:**
  - `packages/game-sdk/{package.json,src/match/*}`
  - `tsconfig.base.json`, `.dependency-cruiser.cjs`, `eslint.config.js`
  - `packages/game-sdk/src/contract-tests/{contract.test,fuzz}.ts`
  - `games/broken-pencil/server/recap.ts`
  - `docs/GAME_CONTRACT.md`
- **Tests:** 60+ EN/ES cases (≈90 planned). Identical output under `LANG=tr_TR`. Good and bad pack fixtures.
- **Acceptance (§4.9):**
  - The table covers apostrophes, accents, plurals, articles, numbers, compounds, rejects and every clue reason.
  - The pack test fails on duplicates and on any accept that is not exact.

### F6: Voices

- **Steps:**
  1. Contract and key changes.
  2. `toSpeakable` and overrides.
  3. Service hardening, including the `asked` fix. This fixes a live Blanks bug, so ship it early.
  4. Sidecar validation and normalisation.
  5. `render-clips`.
  6. Speech lab.
  7. Reader helper and docs.
- **Files:**
  - `packages/shared/src/contract.ts`
  - `packages/game-sdk/src/speech/*` (server-only subpath)
  - `packages/server/src/speech.ts` (+ new `speech.test.ts` with a fake sidecar)
  - `packages/server/speech/{kokoro_sidecar.py,voices.json,render_clips.py}`
  - `scripts/render-clips.ts`
  - `packages/server/src/dev-api.ts`
  - `packages/client/src/dev/SpeechLab.tsx`, `packages/client/src/main.tsx`
  - `packages/client/src/tv/TvApp.tsx:82`
- **Tests:**
  - A table per rule using every §5.3 example.
  - Override precedence; case-sensitivity collisions.
  - Two runs in one room both get their event.
  - 100 requests leave ≤64 queued.
  - The sidecar recovers after a crash.
  - Hyphenated keys pass; path traversal is still rejected.
  - Clip loudness within ±1 dB.
- **Acceptance (§5):**
  - A missing voice never stalls the room.
  - No key appears in a view before its line plays.
  - Secrets are never rendered before their reveal.
  - Speech-lab flags are written on loopback only.

### F4: Presence

- **Steps:**
  1. ADR-047 approved.
  2. Contract and protocol fields.
  3. Address classifier with its truth table.
  4. Engine: mode, per-phone value, init context, per-phone stamp.
  5. Sockets and recorder.
  6. Client: 🎨 row, gates, prompt, notices, switches.
  7. Harness override and presence matrix.
- **Files:**
  - `packages/shared/src/{contract,protocol}.ts`
  - `packages/server/src/{presence-address,sockets,recorder}.ts`
  - `packages/engine/src/{types,room,players,vip,runner,views}.ts`
  - `packages/client/src/controller/{PhoneSettings,Playing,ControllerShell,VipMenu,Selecting}.tsx`
  - `packages/client/src/phone-music.ts`, `packages/client/src/tv/TvSelecting.tsx`
  - `packages/game-sdk/src/controller/phoneOnly.tsx`
  - `packages/sim/src/runner.ts`, `packages/game-sdk/src/contract-tests/play.ts`
- **Tests:**
  - Classifier table (loopback, and loopback plus a cf header, 100.x, a spoofed header from the LAN).
  - Mode switch rejected mid-game.
  - Init context carries presence.
  - A mid-game flip changes only that phone's stamp.
  - Determinism hash.
  - e2e: two phones, one with `canSeeTv=0`; only that phone shows Bingo's PhoneStage and hears the clip.
  - Sim on 200 seeds × 3 modes.
- **Acceptance (§8):** PhoneStage is checked with `canSeeTv=false` in a room that has a TV, and the presence table is tested in each mode.

### F7: Components and gates, per game

- **Before Part 01:**
  - Subpath rule for components.
  - Helpers.
  - Secrets v2 (non-interference).
  - Solo and dropper strategies; `sim --dod`.
  - `viewBot`.
  - Awards check.
  - Size log.
  - Screenshot presets and `--dod`.
  - Template and ADDING_A_GAME update.
- **Then** build each component when its first game needs it. Imposter needs SecretCard and FacePicker (with pick-two).
- **Acceptance (§6, §8):**
  - Tokens only; reduced motion respected; ≥44 px targets; never colour alone.
  - Not in the entry chunk.
  - Filmstrip and audio trace clean across 5 themes and the phone and TV matrix.

---

## Risks

- **Silent field loss.** Zod strips unknown manifest keys. Adding fields before the schema ships a catalog without icons or presence, and no error appears.
- **Wrong-game downloads.** Tying preload to today's `selectedGameId` downloads the wrong game on every picker open, and on every TV click.
- **Removing `room.games`** touches ≈12 client consumers plus the e2e, sim and design harnesses. A missed one renders a blank name.
- **Two-hop start latency.** An index chunk followed by a Controller chunk means two round-trips. Use per-surface entries plus preload on choose.
- **Late joiners mid-phase.** The shell reads in-game hooks synchronously. Every hook needs a safe default while the module loads.
- **Immutable caching** is safe only for content-hashed URLs. `/music` and `/sfx` must never be immutable, and `index.html` must be `no-cache`, because the launcher rebuilds on every start.
- **The dev server over tunnels** (Cloudflare or Tailscale hosts in `vite.config`) serves unbundled modules. None of the split benefits apply there.
- **Loopback classified as remote** would silently change every recorded filmstrip and cue trace from the design and review loops.
- **The owner's own phone** may be on Tailscale at home. If it joins through the 100.x address, it defaults to "remote". The 🎨 toggle overrides this.
- **Remote phones need reveal data in every controller view.** At-TV phones then hold data they must not show before the TV's reveal step. Games must never branch view **content** on `canSeeTv`; it is for the shell only.
- **Any −1 from the speech service** turns Blanks' voice off for the whole game. The new queue and restart logic must never answer −1 for a dropped prefetch.
- **One Kokoro sidecar at 12 rooms** can back up past 12 s. Prefetching in quiet phases is essential. Per-voice processes cost about 4× the RAM.
- **Stems can merge unrelated words** (e.g. love → lov-). Games choose their level; keep a collision watch-list in the tests.
- **Changing Broken Pencil's matcher** (typos counted as intact) changes its drift comedy. The owner decides.
- **Re-levelling or re-rendering Bingo clips** changes a shipped feel the owner signed off on. Only with an A/B options page.
- **FacePicker at 16 players** cannot avoid scrolling on 320×568. OrderPicker's "5 items, no scroll" will not hold at 200 % text.
- **SecretCard press-and-hold** fights the iOS callout and Android context menu. Test on real phones, not only Playwright.
- **Untracked work from other sessions** sits in the worktree (skills, `docs/game-pack`, `dead-air.ts`). Stage F-task commits by path.

---

## Open questions for the owner

1. **Presence in `init`:** amend brief rule 13 and add ADR-047 (optional `presence` and `canSeeTv`)? **Recommend yes.** The `__presence` fallback cannot work.
2. **Suggest vs I-650 votes:** make Suggest send the existing vote, add a throttled toast, keep the 🙋 counts, and retire the chip cloud? **Recommend yes.**
3. **Sort order:** fits → votes → NEW → A–Z, or the spec's fits → NEW → A–Z with votes only as a badge? **Recommend votes before NEW.**
4. **Tags:** which tag does Bingo get? Should `quick` be derived from ≤8 minutes? Add a Comedy chip? **Recommend:** add `classic` to the list for Bingo, derive `quick`, add Comedy. Blanks' 18+ stays on its key chip.
5. **`addedOn` for the five existing games:** real dates, which show NEW until mid-October, or a date before the window? **Recommend a date before the window.** NEW should mean the pack.
6. **Picker entry:** Lobby "Pick a game" opens the list with nothing chosen (a schema change to `selectGame`)? **Recommend yes.**
7. **TV after choosing:** keep today's editable settings card (ADR-031)? Is keyboard navigation in scope? **Recommend:** keep the card; keyboard later.
8. **Catalog delivery:** a one-time socket event on welcome, plus the new `highlight` action and nullable `selectGame`, all counted as within §2.3's "no new message"? **Recommend yes.**
9. **Start uses tonight's tuned settings** (I-763), not the factory defaults as §1.5 literally says? **Recommend tuned.**
10. **Phone/TV entries per game:** add `phone.ts` and `tv.ts` per game (one hop, a contract change for all five)? **Recommend yes.**
11. **In F1 scope:** HTTP precompression and a zod-free client entry? **Recommend yes to both.** The entry currently goes out raw at 625 KB.
12. **Chunk budget:** count JS + CSS gzip together? **Recommend yes.**
13. **Tunnelled phones default to remote; localhost defaults to at-TV?** **Recommend yes.**
14. **Remote phones in a TV room:** get the TV's cues and music by default, with the 🎨 opt-outs? **Recommend yes.** Show the "can't see the TV" prompt on the TV host bar too? **Recommend yes.**
15. **Matcher language** comes from a required `lang` on each answer pack? **Recommend yes.** Should Broken Pencil adopt the matcher? **Recommend** the stem level only, after an options page.
16. **Matcher errata:** rejects also block stem and fuzzy matches; digits never fuzz; hyphenated clues count as one word? **Recommend yes to all.**
17. **Speech naming and cache:** keep `ipa` as the wire name? Overrides case-sensitive by default? Hash the parts plus an engine version into the key, with no per-host salt? **Recommend yes, yes, yes.**
18. **Loudness:** one target for all voices, and which one? Re-level Bingo? **Recommend** ≈−21 dBFS RMS with a −1 dBFS ceiling for new clips and live lines. Re-level Bingo only after an A/B page.
19. **Blanks and `toSpeakable`:** move Blanks onto it now, or freeze Blanks and use `toSpeakable` for new games only? **Recommend freeze.** Fix only the `asked` bug now.
20. **View budget and bot rules:** make the 4 KB view budget and `bot.decide(view)` binding for new games only, with the existing five grandfathered? **Recommend yes.** Should SecretCard's hold/tap preference be a shell-level per-device setting? **Recommend yes.**
