# PartyBox live-play session report (2026-09-15, room MEZS, server 127.0.0.1:42090)

## 1. Summary

1. Six agents (Finn/fast, Vera/vip, Sloane/slow, Rory/reloader, Lou/late, TV observer) shared one room from 21:52:19Z to 21:58:28Z; two games finished server-side (Wisecrack, Lightning Round) and the room returned to the lobby.
2. Claim "Reconnect: every reload by Rory resumed the same player in lobby, during play and at results" -- REFUTED 3/3. 18/18 reloads resumed the same player id, same name, no join form, header back in 58-82 ms, game view back in <=0.94 s; but no reload was ever done at results (both results screens lasted <0.8 s) and reload #10 never got its screen back because the game ended 0.66 s later.
3. Claim "VIP handover after Vera >30 s offline during play, toast on TV, no return to Vera" -- REFUTED 3/3. In the shared session Vera was never VIP (Finn joined 57 s earlier); the only handover was Finn->Vera in the lobby after Finn's tab closed. The mechanic was proven only in vip run 4 (22:17-22:19Z, Vera + two script-driven helpers, no TV): VIP -> Hank 30.4 s after disconnect, fired while status was already "results", Vera reconnected without the badge.
4. Claim "Spectator: Lou saw only 'Waiting for the next game' for the rest of game 1, then was a full player in game 2 and reached its results" -- REFUTED 2/3 (1 upheld). Spectator screen and spectator flag held for all of game 1, Lou acted 7 times in game 2 and scored 472, but Lou's own tab never observed a results screen (results lasted 534 ms, poll cadence 700 ms).
5. Claim "Both games reached a results screen with scoreboard and winner on the TV; badge holder started game 2 and returned to lobby via UI" -- REFUTED (1 vote received; the verdict list was truncated after the first vote). Server status "results" existed twice and Finn pressed New game (21:55:54.593Z) and Back to lobby (21:57:44.739Z) through the UI, but the TV never observed results (2 s poll, DOM probe broken) and no TV results screenshot exists.
6. Wisecrack was effectively unplayed: 0 text answers from any agent, no vote/reveal phase, scoreboard 0-0-0-0, four-way "win" -- caused by a harness bug (lib.actOnce looks for /^Submit/, button says "Next prompt"), not by the product.
7. Lightning Round ran with the stepped-down settings (5 questions, 10 s answer time, verified from phase deadlines); Vera won with 4068, Finn had the fastest taps (32-57 ms).
8. Product held up: no console/page errors on any player tab (the only console errors were ERR_INTERNET_DISCONNECTED on Vera while deliberately offline), no reconnect banner outside the offline window, every phase transition landed within ~15 ms of its deadline.
9. Product findings worth a look: stale VIP badge while offline, toasts rendered as buttons, "Connecting..." placeholder shown while connected, name reuse blocked for 120 s after a disconnect, spectators absent (not dimmed) from the TV strip.
10. Harness findings dominate: 3 of 6 agents restarted, 2 scripts crashed on name_taken, the TV probe threw 957 times, the bot VIP left results screens in <1 s so nobody could observe them.

## 2. Timeline (UTC, from the JSONL logs)

- 21:52:19.866 Finn joins an empty room (pre-join players []), becomes VIP at 21:52:19.930 (fast.jsonl). 21:52:58 TV opens, status lobby (tv.jsonl).
- 21:53:17.156 Vera joins (2nd, not 1st as planned). 21:53:23.548 Sloane joins (3rd, 320x568). 21:53:24.031 Rory joins (4th).
- 21:53:24.320 Finn presses Start (Wisecrack, Rounds 3->2, Writing time 60 s); status selecting 21:53:25.0; status playing + wisecrack:intro@1789509208400 at 21:53:28.469.
- 21:53:33.5 answer phase 1 (60 s). 21:53:34.263 Lou joins mid-game as spectator (5th); TV toast "Lou joined (next game)" (tv-06). 21:53:54.496 Vera's Start attempt times out (she is not VIP).
- 21:54:33.6 scores (no vote phase: 0/8 answers). 21:54:46.5 answer phase 2. 21:55:46.6 scores.
- 21:55:54.518 status results (game 1, all 0 pts). 21:55:54.593 Finn presses New game; 21:55:55.377 Lightning Round started (Questions 10->5, Answer time 15->10); playing 21:55:55.442; Lou's spectator flag -> false 21:55:55.556.
- 21:56:00 - 21:57:41 Lightning Round: 5 question/reveal pairs, wager 21:57:14.5, final question 21:57:29.6. Rory reloads during choices (#6-#10), Sloane misses every 10 s deadline.
- 21:57:44.668 status results (game 2: Vera 4068, Finn 499, Lou 472, Rory 9, Sloane 0). 21:57:44.739 Finn presses Back to lobby; 21:57:45.202 lobby.
- 21:57:45.270 Finn's script exits and closes the tab; 21:57:47.682 TV sees Finn*(off), Lou(off).
- 21:58:15.458 VIP handover Finn -> Vera in the lobby, 30.2 s after Finn went offline (vip.jsonl; tv.jsonl vip-change 21:58:16.509). Rory's tab reports a false VIP badge 21:58:15.832-21:58:19.502 (toast).
- 21:59:45-46 Finn and Lou pruned after the 120 s grace. 22:01:16 reloader hard stop; 22:01:18 TV timeout; 22:01:37 vip run 1 time limit; 22:01:43 slow hard stop. Shared session over.
- Offline window / handover (vip run 4 only, no other agents present): 22:17:07 Vera joins empty room as VIP; helpers Hank 22:17:09.318, Ivy 22:17:10.663; Wisecrack started 22:17:14.9 (Rounds 1, Writing time 30 s).
  OFFLINE-ON 22:17:40.883 (25.1 s after start, phase wisecrack:reveal); server marks Vera disconnected 22:17:41.603; "Reconnecting..." banner 22:17:41.604; status results 22:17:57.267 (Vera still offline); VIP -> Hank 22:18:11.297 (30.4 s); OFFLINE-OFF 22:18:20.966; banner gone 22:18:22.651; Vera connected again without badge 22:18:23.198.
  Hank presses New game -> Lightning Round 22:18:37.540; results 22:19:25.892; Back to lobby -> lobby 22:19:26.692; script done 22:19:26.769 with VIP still Hank.

## 3. Bugs found (product)

- P1 Stale "VIP" badge while offline. The phone kept drawing the yellow badge under the Reconnecting banner for the whole 40 s outage, 9.7 s past the server-side handover. Evidence: vip.jsonl server-vip-changed 22:18:11.297 vs badge still true until the reconnect tick 22:18:23.199; vip-r4-offline-banner.png, vip-r4-offline-end.png. Location: packages/client/src/controller/ControllerShell.tsx header renders isVip from the last snapshot; nothing clears it when connection !== 'connected'.
- P2 Toasts are <button> elements, so a "Hank is now the VIP" toast is exposed as a button named /VIP/ for its 4 s lifetime (accessibility + it fooled the harness twice: reloader.jsonl 21:58:15.832->21:58:19.502, vip.jsonl Ivy 22:18:11.315->22:18:15.001). Location: packages/client/src/controller/ControllerShell.tsx toast list (around lines 76-93); packages/client/src/controller/controller.ts removes toasts after 4000 ms. Suggest role="status" / a non-button element.
- P3 "Connecting..." shown while connected. Wisecrack intro (slow.jsonl 21:53:28.541 heading "Connecting...", green dot; slow-03-waiting.png) and every in-game reload (reloader-reload1-text-answer.png, ~0.9 s) render the connecting placeholder although the socket is up. Location: packages/client/src/controller/Playing.tsx:23 (`!view`) and the Suspense fallback at line 40 both use t.connection.connecting.
- P4 Name reuse blocked for 120 s after a disconnect: a player who closes the tab and rejoins fresh with the same name gets "That name is taken" until the grace expires (slow.jsonl fatal 22:05:28.070; vip.jsonl FATAL 22:14:48.504). Location: packages/engine/src/players.ts:18 nameTaken() scans all room.players incl. disconnected; LIMITS.disconnectGraceMs 120_000 in packages/shared/src/protocol.ts:11. Decide whether a disconnected player's name should be claimable (or offer resume-by-name).
- P5 Spectators are absent from the TV strip, not dimmed: during game 1 the strip showed Rory/Vera/Finn/Sloane only (tv-06, tv-10); Lou appeared only via the toast. Location: packages/client/src/tv/TvPlaying.tsx builds chips from view.players (spectators excluded) / packages/game-sdk/src/tv/PlayerChips.tsx.
- P6 Observation, not a defect: Wisecrack with zero answers goes answer -> scores (no vote/reveal) and ends in a four-way 0-point tie (fast-results-1.png, tv-10). games/wisecrack/server/round.ts nextVotableIndex returns -1 -> enterScores. A TV hint ("nobody answered") would help.
- P7 By design but note it: the 30 s VIP handover timer keeps running through status "results" (expirePlayers on every tick, packages/engine/src/players.ts:170-179), so the badge moved on the results screen, not during play.

## 4. Harness problems (scripts, restarts, crashes)

- H1 packages/e2e/src/live/lib.mts:181 actOnce() clicks getByRole('button',{name:/^Submit/}); Wisecrack labels prompt 1 of 2 "Next prompt" (games/wisecrack/client/ControllerAnswer.tsx:45). Result: 0 text answers session-wide, each call stalled 30 s in isEnabled(). Fix: /^(Submit|Next prompt)/ and a short timeout.
- H2 lib.mts isVip() matches toast buttons (see P2) -> ~4 s false positive on every phone at a handover. Scope the locator to the header.
- H3 vipStartGame label mismatch: Wisecrack's setting is "Writing time" (games/wisecrack/manifest.json:24), "Answer time" exists only on lightning-round; vip run 2 waited 30 s for "less Answer time" and never pressed Start (vip.jsonl 22:07:24.109), room idled in "selecting" until 22:13:52.
- H4 packages/e2e/src/live/tv.helper.mts DOM probe threw "ReferenceError: __name is not defined" on all 957 ticks (tsx/esbuild injects a __name helper into the page.evaluate callback). No TV toast, timer or results text was captured for the whole shared run. Fixed after the session (probe is now a plain JS string, tv.helper.mts:50-51) and validated 22:03:05-22:03:30 (toast "Rory left" captured), but the fix was never exercised on a game.
- H5 Start order: the vip script launched 57 s after fast (21:53:16 vs 21:52:19), so Finn was VIP and Vera's plan (start Wisecrack, go offline 25 s in) never ran; her offline test was also gated on her own Start press. Restarts: 22:06:51 (run 2, helper Hank, H3), 22:14:33 (run 3, FATAL name_taken after 15 s), 22:17:07 (run 4, solo with helpers Hank+Ivy, succeeded). The key test therefore has no shared-session or TV evidence.
- H6 slow.helper.mts run 1 blocked 30-43 s per tick (boundingBox() on a missing /Submit|Start/ button with the default timeout, plus H1): saw 10 phases, 0 results, 0 successful acts, hit the 500 s cap. Runs 2 and 3 (22:04:01, 22:05:12; observe-only) joined an empty room as a new VIP "Sloane", crashed on name_taken, overwrote slow-00-joined.png and slow-zz-final.png, and left a disconnected VIP in the room.
- H7 reloader.helper.mts:215 results-reload branch requires a non-empty phaseKey, which is '' during results (room.game is null) -> the mandatory results reload never ran and the gamesFinished counter stayed 0, so the script ran to its 500 s cap instead of exiting at the lobby.
- H8 late.helper.mts polls every 700 ms with a 1 s act sleep -> missed the 534 ms results status; the "reached results" leg of the spectator claim is unobservable with this cadence.
- H9 The bot VIP (fast.helper.mts) pressed New game / Back to lobby 60-75 ms after detecting results, so both results screens lasted 0.53-0.92 s; TV, late and slow never saw them and reloader-results-289s.png already shows the lobby. Add a results dwell (e.g. 8 s) to the VIP persona.
- H10 Server-side truth is thin: pb_live_server.log holds only the boot banner (room EYPX; the session ran in MEZS after a dev reset) and Vite HMR lines at 22:27:36Z (client files touched after the session); there is no room-event logging, so every server fact above comes from the agents' GET /api/dev/state polls.

## 5. Most useful screenshots

- fast-results-2.png -- game-2 Results on the VIP phone: "Vera wins!" (4068 / 499 / 472 / 9 / 0), awards, New game and Back to lobby buttons.
- fast-results-1.png -- game-1 Results: "Rory, Vera, Finn & Sloane win!" at 0 points each, proof that Wisecrack got no answers.
- tv-06-phase-wisecrack-answer.png -- TV mid-answer: "0 / 8 answers in", toast "Lou joined (next game)", strip without Lou, timer 59.
- slow-05-after-act-text-answer.png -- 320x568 phone on Round 2 prompt 1 with an empty textarea and the disabled "Next prompt" button actOnce cannot find.
- vip-r4-offline-banner.png -- Vera offline: yellow dot, "Reconnecting..." banner, stale VIP badge over "Authors revealed!".
- vip-r4-back-online-15s.png -- Vera 15 s after reconnecting: green dot, same name, no badge, Results "Ivy wins!", footer "Waiting for the VIP...".
- vip-r4-final.png -- run-4 lobby with the star on Hank; the handover did not revert to Vera.
- late-after-join.png -- Lou's spectator screen "Waiting for the next game / You joined mid-game" during Wisecrack.
