# Round 4 — what changed, for the owner (2026-09-15)

Every open item of `RECOMMENDATIONS.md` (R-047 … R-090) was applied by five parallel lanes, one commit each, `pnpm verify` green before every commit, then merged on `design`. Per item: what a player now sees, hears or feels. Sound cues are synthesized (Web Audio) unless noted; every motion collapses to 0 ms under prefers-reduced-motion; every colour is a theme token.

## R-047 · clientModule.sounds is dead code: every phase change plays the same 'phase' triad and the declared `reveal` sting never plays

- **applied** — commit `d3d4686`. The TV no longer plays the same triad for every phase. A phase whose id is mapped in the game's clientModule.sounds plays its own cue: Lightning's reveal now plays a real 0.7 s pickup-then-resolve sting (two soft E4 taps, a B4+E5 lift, a held B5+E6 chord) and its wager phase an E4-G4-B4 rising triangle; Wisecrack's scores phase plays the bright 'tally' ping (E6 square tick into A6). Unmapped phases still play 'phase', now lighter (third note shortened to 120 ms) and reserved for 'pick up your phone'. Broken Pencil's map was re-keyed from the dead 'page' to the real 'show' phase so its reveal sting finally fires; Bingo's map is untouched.

## R-048 · The phone has no sound engine and no haptics: `submit` and `error` are design-system controller cues that cannot play, and navigator.vibrate is never called

- **applied** — commit `278f67b`. The phone now has its own Web Audio engine at 35 % master level (mute remembered separately under partybox:phone-sound, default on) plus haptics. When your pick lands you hear a short 660→880 Hz 'submit' blip and feel a 20 ms buzz; a rejected join or input gives the 150 Hz square 'error' thud plus a 40-60-40 ms buzz; a new prompt that needs you (status active, timer not quiet) buzzes 30-50-30 with no sound (the TV plays the chime); at results the winner's phone buzzes 60-60-60-60-160, everyone else 40. The theme sheet gained two 44 px rows, 'Sounds on this phone' and 'Vibration', with On/Off text and an outline (never colour alone). Games' Controllers now get a real useSound() through SoundProvider (the 'correct' cue is available for verdict cards).

## R-049 · Press states are invisible and lock-in waits for the server echo: four visual changes land in one frame, 100-300 ms after the tap on party Wi-Fi

- **applied** — commit `8639ae9`. Every phone button now squeezes the instant the finger lands (controller-surface rule, instant in / eased release); choice and vote cards also get the pink accent edge, darker fill and a 12 % bigger letter disc while held, and the big button brightens. A tap locks the grid at once: the picked card settles with a small pop, its ✓ pops in, the other cards dim, and '✓ Locking in…' rises under the grid, then flips to '✓ Locked in — look at the TV' on the server echo. If nothing comes back for 4 s the grid re-enables and the line reads '✗ Didn't reach the TV — tap again' in danger red. A 15 ms buzz on tap (Android).

## R-050 · An unanswered phone gets nothing in the last 5 seconds: a 4 px red bar and a 14 px red '3 s' at the top while the TV pulses 3 m away

- **applied** — commit `c1ebe7f`. In the last 5 seconds of a real input phase, a phone that has not answered yet gets urgent: a small 'PICK NOW' cue appears in the header beside the digits, the seconds grow ×1.5 and pulse in the danger colour, the choice letters and the primary button take a danger outline with one nudge, and the phone buzzes 30 ms once per second (5…1). At the 5 s edge a soft 'tick' plays; if the deadline hits 0 with still no answer, the error thud plays and the phone buzzes [60,40,60]. A phone that has already submitted, a passive screen (intro, reveal, scores) or a quiet/hidden timer never panics — the shell checks that the screen actually offers something to press. Reduced motion collapses the pulse and nudge to 0 ms; the cue word, colour and haptic remain.

## R-051 · The final-wager reveal — where the game is decided — drops bets, answer, deltas and totals at t=0 in the same 36 px rows as question 1, names collapse to initials, then a hard cut to 'Priya wins!'

- **applied** (SDK input primitives + Lightning phone) — commit `cac24e5`. Phone half only: on the final reveal the phone keeps the picked card outlined and shows a '🎲 The bets are in — look at the TV' card in the footer for 1.2 s (the TV's first verdict beat), then the ✓/✗ marks and the outcome card land, reading 'Lost the wager · you bet 1550 · final score 1550' (or Won … / Wagered nothing · final score N). Measured: push at 11 ms, outcome at 1217 ms.
- **applied** (Lightning TV) — commit `a365efa`. The final reveal is now a ceremony. At t=0 the kicker reads FINAL QUESTION · THE BETS ARE IN and every player's row rises in showing only avatar, name and 'bet 3150' / 'no bet', sorted smallest bet first; the answer card's space is held empty. At 0.9 s the answer card pops in. From 1.2 s each row's verdict ('C✓ bet 1530' / 'B✗ bet 4260') and a 48 px ±delta pop in one row at a time, min(300, 1500/(n−1)) ms apart, so the biggest bet is always the last to flip (last row by 2.7 s at any count). When the last row lands the TV plays the cue: jackpot (G-major rise 784→988→1175→1568 Hz, triangle tail) if anyone won their bet, else bust (two low triangle notes 196→185 Hz). 600 ms later ' · 11440 pts' appends to every caption together and the new leader's row gets the green outline, leaving ≥1.5 s settled before the results cut. Reduced motion: everything shows at once.

## R-052 · The correct answer is the smallest text on the reveal stage

- **applied** — commit `3d3b0c6`. On every reveal the question steps back to a muted 36 px line and the correct answer becomes the biggest thing on the stage: one full-width card at 72 px with a filled green letter disc on the left and a big ✓ on the right, popping in over 300 ms. The old four-choice strip is gone (compact prop and .gridCompact rules deleted). On the phone the revealed choice's letter disc is now filled green too, so correct reads by shape + glyph, not colour alone.

## R-053 · The reveal blanks the stage, re-lays the answers out as rows, and each row lands with author + votes + points + voters + outline + SWEEP! in one hit — winner first, then 4.6 s of a red timer

- **applied** — commit `1d4d80b`. When the last vote lands, the two A/B cards the room was staring at stay exactly where they are — no blank stage, no re-layout into rows. At 0.3 s the voters' avatars pop into each card's footer one after another; at 0.9 s each author's avatar and name rise in beside their letter (the loser's first, the clear winner's name always last); at 1.5 s the vote count, +points and the winner outline (gold, scale 1.02, fading in) land together and the SWEEP pill pops on a sweep. The 'reveal' sting (three rising sawtooth notes 440/554/659 Hz over 0.54 s) plays at t=0 and silences the generic phase chime; on a sweep a fast rising 'sweep' arpeggio (523/659/784 then a held 1047 Hz, 0.65 s) plays at 1.5 s. Under reduced motion everything is on screen from the first frame and both cues play at once.

## R-054 · The payoff — author, votes, points, SWEEP — is one 28 px muted caption; the author avatar is indistinguishable from the voters; a tie says nothing

- **applied** — commit `1d4d80b`. The payoff is now the biggest thing in the card: a 72 px vote count with the word 'vote(s)' beside it, the +points in gold h2, and an uppercase SWEEP pill; a tie puts a TIE pill and the outline on both cards. The author is unmistakable — a 72 px avatar with their name in 36 px next to the letter disc — while the 48 px voters sit in the footer. A card with 0 votes shows '0 votes' in muted text, no delta, no pill, no voter row. Two-line answers and two-line prompts fit inside 1026 px (checked live).

## R-055 · Standings boards overflow the stage at 5-6 players under a heading and again at 13+ dense; the 7+ dense grid reads ranks across, not down

- **applied** (SDK input primitives + Lightning phone) — commit `1c2699b`. Standings boards fit the stage at any count: 5–6 players get body-size single-column rows (six rows ≈ 400 px, no more clipping under 'Place your wagers'), 7–12 keep the two h2 columns, 13+ go three body-size columns, and the multi-column boards now read ranks down each column (8 players: 1-2-2-2 down the left, then the right) instead of across. A ✓ can sit in the delta slot for players who have acted (markIds). Also fixed: the winner's score no longer clips to '15' in the results screen's narrower board at 8 or 16 players.
- **applied** (Lightning TV) — commit `36a787f`. The wager screen no longer runs off the stage at 5–6 players: the header pairs the FINAL QUESTION NEXT kicker with '3 / 6 placed' in gold on the right (number pops), the heading drops to 48 px 'Place your wagers', one centred muted caption reads 'Right answer wins the bet · wrong answer loses it · Sam leads by 230', and the board goes two-column from 5 players (6 players ≈ 3 rows, ends around y≈820) with a green ✓ in the delta slot for every player whose wager is in.
- **applied** (Wisecrack) — commit `40db8c6`. On the round-2 board the line that decides how people play the last round — 'Next: the final round — double points!' — now sits in accent between 'Scores so far' and the board, where it can never be the first thing clipped; earlier rounds keep 'Next round coming up…' at the bottom.

## R-056 · Every scoreboard lands whole: no row stagger, deltas and totals appear together, nobody sees the numbers move or the ranks change

- **applied** (SDK input primitives + Lightning phone) — commit `5308c62`. Every TV scoreboard now lands in beats: rows rise one after another (last place first, the leader last; 150 ms apart, 75 ms on the multi-column boards), each '+350' delta appears 300 ms after its row, and each total counts up from its previous value over 600 ms once its row has landed, so the room watches 202 → 350 tick up; the leader's 🏆 pops last. Default on for every TV Scoreboard; the phone's compact boards stay instant. Under reduced motion the final board appears at once.
- **applied** (Lightning TV) — commit `2b86aa5`. The wager standings now land row by row, rank 1 first (75 ms apart on the dense board), so the room is introduced to the ranks one at a time before betting; the fallback done board lands last place first with the leader last, and the trophy glyph pops after its row. Deltas, where present, rise a beat after their row.
- **applied** (Wisecrack) — commit `3652f46`. The round board no longer lands whole: rows rise 150 ms apart from last place up to the leader, each delta follows its row a beat later, and the crown (where shown) pops last — about 1.2 s of movement inside the 8 s phase, static under reduced motion. On the phone the '+250' hero counts up from 0 and the total from the previous score over 600 ms.

## R-057 · A player locking in is invisible from the couch: the ✓ just appears, shoves the neighbouring chips sideways, makes no sound; ⟳ does not turn

- **applied** — commit `a9d5239`. When a player locks in, their chip on the TV strip now pops a solid green ✓ disc into a slot that was already reserved, so no neighbouring chip moves a pixel, and the whole pill gets a green inner ring. Each lock-in ticks a soft high 'lock' note that rises a whole tone per player (capped at the fifth) and resets with the phase, quiet enough never to suppress the phase chime. A reconnecting player's ⟳ actually turns (2 s per turn, static under reduced motion). The 'n / m answered / answers in / voted' numbers pop when they change, in a fixed-width slot so 9 → 10 does not shift the text.

## R-058 · The phone results screen spoils the TV ceremony and says nothing personal: the winner reads 'Priya wins!' in the third person, losers get no place, and 'Waiting for the VIP…' has no name

- **applied** — commit `a8a3bdd`. The phone results screen now speaks to the player: the winner reads 'You win! 🏆' (or 'You tie for first! 🏆'), everyone else sees who won and their own place — 'You finished 2nd · 12 pts' — under the headline. The player's own row on the compact board pops in and, when it is not the outlined winner row, gets its own accent outline so 'that one is me' reads at a glance. Non-VIPs wait on the VIP by name: 'Waiting for Sam…'. A nobody-scored game keeps the neutral 'Game over' line with no place line.

## R-059 · The phone spoils the TV reveal: votes/points or ✓/✗ are on the phone at t=0, up to 1.5 s before the TV shows them

- **applied** (SDK input primitives + Lightning phone) — commit `6d82b33`. Lightning phones no longer light up before the TV: when the reveal lands the phone keeps the picked card outlined with its 'Locked in…' line for 300 ms (the TV's reveal-row rise), then the ✓/✗ marks pop in, the outcome card rises and the haptic fires. Measured: push at 11 ms, marks + card at 315 ms.
- **applied** (Wisecrack) — commit `a0fd7a5`. An author's phone no longer spoils the TV: for the first 1.8 s of the reveal it shows 'Your answer is up · Look at the TV' with their answer, and only after the TV's last beat has landed does the result rise in with the points popping. Timing lives in one file (timing.ts) that both the TV beats and the phone hold read from, so they cannot drift.

## R-060 · Reveal rows pack four-wide at any player count (names truncate), shout '– +0' as loudly as winners, and never say who picked what or who is winning

- **applied** — commit `b5ba8ec`. Reveal rows now use explicit columns: two up to 8 players (full names, running total '5127' in muted caption after the delta, 👑 before the leader's name), three up to 12 (crown, no total), four up to 16 (tighter gaps, no crown/total) — never more than four rows. Each verdict shows the pick: 'A✓' green, 'D✗' red, '–' muted for no answer (aria 'picked D, wrong'). Rows that scored nothing print '0' and go muted as a whole, so a wall of 14 zeros no longer shouts; correct rows keep the green outline and delta.

## R-061 · 'n / m voted — pick the funnier one' sits in the overscan band or off-screen, never names the holdout, and the answer floats top-left in a half-empty card

- **applied** — commit `f48c5d8`. Nothing sits below the cards any more: the cards stretch to fill the stage (ending at y=1026 with a one- or two-line prompt) with the letter disc and answer centred, and answers of 20 characters or fewer render at 72 px. The status is a pill on the right of the kicker row: 'Vote on your phone · 0 / 2', then 'Just waiting for [avatar] Dev…', or with more players 'n / m voted · waiting for [avatar] A, [avatar] B, [avatar] C +k'; the pill re-rises with every vote so the room notices the count change.

## R-062 · Prompt and both answers land in the same 300 ms; nobody gets to read the prompt before the answers

- **applied** — commit `2f85a6b`. The vote stage now reads like a host: kicker and prompt appear first and sit alone for a second; answer A rises in at 1.0 s, answer B at 1.6 s, and the status pill ('Vote on your phone · 0 / 2') at 1.9 s once both answers are up. 18 s of the 20 s window remain with everything on screen. Under reduced motion all four land at once.

## R-063 · Tapping 'Next prompt' hard-cuts to an identical-looking empty screen: no acknowledgement that answer 1 was sent, no slide, and the label reads as navigation, not submission

- **applied** (SDK input primitives + Lightning phone) — commit `c73583d`. SDK part only: the big button's ✓ now pops in (150 ms) whenever a 'Submitted' button appears; TextAnswer accepts a className (so a new prompt can rise in as a new card via pb-enter) and a submittedHint so the sent card can say 'One more…' instead of 'look at the TV' while a second prompt is pending; WaitingScreen accepts a className for the same slide. Player-visible change today: the ✓ pop on submit.
- **applied** (Wisecrack) — commit `8326d01`. The button says what it does — 'Submit 1 of 2', then 'Submit 2 of 2'. After the tap the card flips to '✓ Submitted · You said A single sock · One more…' and holds for 600 ms (0 under reduced motion), then prompt 2 rises in as a fresh card whose kicker reads 'ROUND 1 · PROMPT 2 OF 2 · ✓ 1 SENT'; the final 'Both answers in!' screen enters the same way. Nobody sees their text vanish into an identical empty screen any more.

## R-064 · The wager screen looks like another trivia question, and during the final question the phone forgets the stake

- **applied** — commit `13e8eb4`. The wager screen no longer looks like a quiz: no A–E discs, a pink 'FINAL QUESTION NEXT' kicker like the TV, the rule 'Right answer: +wager. Wrong or no answer: −wager.' under the prompt, and each row leads with the amount at h1 ('1550' + '50 % of your 3100', '3100 · All in · 100 %', '0 · nothing at stake'). During the final question the sticky footer keeps the stake in view — '🎲 Your bet: 1550 · right +1550 · wrong −1550' (only the number pink) or '🎲 Nothing riding on this one — play for pride' — and the final question's kicker is pink too.

## R-065 · The outcome card is a silent hard cut, paints a loss in winner's gold, hides the right answer on small phones, clips at 200 % text and prints 'streak reset' for players who never had one

- **applied** — commit `ba3164d`. The reveal card's number is coloured by its sign — green +1000, danger-red −1550, muted '0' (never '+0', never gold for a loss). Verdicts read Correct! / Too slow / No answer / Wrong, and a miss adds 'It was C · Lesotho' so the right answer is on screen even when the ✓ card is below the fold; 'Streak of 2 over' only prints when a streak of 2+ actually ended; final rows say Won/Lost the wager or Wagered nothing. Motion: the ✓/✗ marks pop, the card rises 150 ms later, a gain pops over 600 ms, a loss shakes; at 200 % OS text the number wraps to its own line instead of clipping. Android phones buzz 30-40-30 on a correct answer and 120 ms on a miss.

## R-066 · Every phone screen change is a hard cut and 'your turn' has no cue: the phone is the only surface that jumps, exactly when the player looks down from the TV

- **applied** — commit `f8698cb`. Every phone screen now rises in (fade + 12 px, 300 ms) when it mounts: join → lobby, lobby → intro, intro → question, waiting ↔ vote, results. In Lightning each new question rises as a new screen while question → reveal stays put (the grid is keyed by question number, the wager grid by 'wager'); in Bingo intro / play / bingo / scoreboard / done each rise, a claim check does not re-animate the card. Taps are never blocked during the fade, and reduced motion collapses it to an instant swap.

## R-067 · In a speed game the four answer buttons stop at 56-78 % of the screen; the thumb zone is empty

- **applied** — commit `154aff7`. On Lightning the four answer cards (and the five wager rows) now grow evenly to fill the screen down to the thumb zone instead of stopping at mid-screen; nothing gets smaller than today's 64 px rows, and on an iPhone SE the body simply scrolls as before.

## R-068 · Nobody knows who is winning between reveals: the strip never shows scores although every ViewPlayer already carries one

- **applied** — commit `c2cb0e9`. Between reveals the TV strip now shows every player's running total on their chip ('Priya ▲ 2000'), the number popping in place each time it changes, with a small gold ▲ on whoever is leading (no mark while everyone is at 0 or tied; screen readers hear ', leading'). Spectators and score-less games stay number-free. Wisecrack's strip hides the numbers during its stepped reveal so the strip never spoils the stage, and shows them again on the scores board.

## R-069 · The deadline bar visibly refills (250 ms full-width sweep) and flashes red-orange-red at every timed phase boundary

- **applied** — commit `492c403`. At every phase boundary the deadline bar now snaps to a fresh full bar and starts draining, instead of visibly sweeping back from ~5 % to 100 % over 250 ms in an orange in-between colour; the drain itself is a continuous 300 ms glide. On the TV the bar rises together with the stage content. Measured on both devices: fill 0.62 → 1.0 in a single step, then a smooth drain.

## R-070 · Dimmed choices use opacity and fall below 4.5:1 in Daylight and Contrast; phone letter discs are grey while the TV's are gold

- **applied** — commit `bc41166`. Dimmed choices and vote options are no longer half-transparent: they turn muted-grey text on the page background with a plain surface disc, so in Daylight and Contrast the losing options stay legible (6.4:1+) and the chosen/correct card's coloured border carries the state. VoteList's lettered discs are now gold like the TV's vote cards (the voted disc still flips to pink).

## R-071 · Pause, resume, kick and leave are silent and snap on/off; the curtain and sheet backdrops hard-code night colours so Daylight gets a grey smear that stops at the header

- **applied** — commit `ee0f23e`. Pausing now fades a theme-tinted veil over the whole frame, header included (new --pb-scrim per theme: Night/Arcade/Cabin ink at 62 %, Daylight's own ink at 45 %, Contrast black at 78 %), while the Paused card rises in with an edge and a soft shadow; Resume fades the veil back out. The host bar (Resume / Skip / End) and toasts stay lit and clickable above the veil. Daylight phone sheets (VIP menu, theme picker) now rise out of a lavender-ink veil instead of black fog. Sound: pause plays a settling A4→E4, resume the 'phase' chime, and a kick / leave / bot removal plays a falling E5→C5 'leave' (one per snapshot, at most one per 300 ms). Server-lost dim and banner now transition/rise.

## R-072 · Paused on the phone looks exactly like 'answer now': four lit tappable cards and a 20 px '⏸ Paused' in the header

- **applied** — commit `f49dd2d`. When the VIP pauses, every phone shows a banner: 'Paused — Sam will resume the game' (the VIP's real name), while the VIP's own phone reads 'Paused — open ★ VIP and tap Resume'. The game area under it fades to 0.5 opacity and goes inert (no taps, no focus, out of the accessibility tree), so a pocket-tap cannot queue an answer the server would drop anyway. On resume the fade reverses and the screen is live again. The reconnecting banner wins if both apply. Reduced motion snaps the fade.

## R-073 · Starting a game flashes a stray '…' top-left, then hard-cuts to the intro with no cue; every status swap on the TV is an instant cut

- **applied** — commit `013a3cd`. Every TV status swap (selecting → playing, playing → results, results → lobby, Home reset) now rises in over 300 ms instead of cutting; starting a game also plays a held G-major 'start' arpeggio (G4-C5-E5-G5, 0.75 s). The stray top-left '…' is gone: a game chunk that loads within 150 ms shows nothing but the intro rising in; a slow one (real TV over Wi-Fi) shows a centred on-brand '<Game name> / Getting the game ready…' card that the intro replaces in the same box.

## R-074 · The intro is three lines of text with no lightning in it, snapped in as one block, and the phone's 'Get ready!' ignores its own countdown

- **applied** — commit `ca64807`. The intro opens with a gold lightning bolt (inline SVG, 128 px) above the display title, both riding the 300 ms phase rise; the tagline 'Fast fingers, sharp minds. Bet big on the last one.' rises in at 300 ms in full-strength text, and a capsule pill 'ALL CATEGORIES · FASTER IS WORTH MORE' rises at 600 ms — the card is complete at 900 ms of the 4 s intro with no looping motion.

## R-075 · New chips pop into existence with no entrance while a redundant 'X joined' toast rises 700 px away; the empty lobby is a QR card and half a screen of nothing that never breathes

- **applied** — commit `19975f8`. On the TV, an empty lobby shows six dashed seats where players will go, the 'Scan to join' heading breathes and the 'Waiting for the first player' dots chase. Each join pops its chip into the next seat (the seat count shrinks) and the 'n / 16 players' count bumps — so the eye lands on the chip, and the '<name> joined' toast no longer appears in the lobby (or during play). On the phone lobby a new chip pops in the same way. Left / kicked / new-VIP / game-ended toasts still show. Reduced motion: no pop, no breathing, static dots.

## R-076 · Before the gate is passed the corner shows 🔊 while the pill says 🔇; enabling audio gives no audible confirmation and the pill just vanishes

- **applied** — commit `ac591b0`. Before the first tap the corner speaker now shows 🔇 (labelled 'Sound is off — tap to enable') so it agrees with the pill. The first tap anywhere enables audio and the TV proves its speakers with a short C5→G5 'ready' chime while the pill flips to '🔊 Sound on' and fades out over 300 ms, then unmounts (instantly under reduced motion). Tapping the speaker before the gate no longer silently toggles the persisted mute; after the gate, mute/unmute pops the disc in place (focus kept) and unmuting replays the 'ready' chime.

## R-077 · All TV cues share one 10 ms attack / exponential-fade envelope and mostly the same 0.18 sine gain; the countdown is five identical blips with no time's-up; 16 joins sound identical

- **applied** — commit `82dbc80`. The last five seconds now climb a major scale instead of five identical blips: 880 → 988 → 1109 → 1175 → 1319 Hz (A up to the fifth), on a softer triangle wave, so the room hears the deadline coming. Each player joining the lobby steps up a scale (C-D-E-F-G, then wraps) so 16 joins no longer sound like a fault. The engine's play() takes { semitones } and transposes every note (including slides).

## R-078 · A rejected join or input is a quiet red line: no shake, no thud, no haptic, and the taken name stays as typed

- **applied** — commit `26c129e`. A rejected join (name taken / invalid, or a room that does not exist) shakes the name field (or the code field) three times sideways, hands it back focused with the text selected so the retry is one keystroke, plays the error cue and buzzes [40,60,40] — once per new error, and again for a second rejection. Mid-game, a server error shows as a strip under the header with a ⚠ glyph and role=alert that shakes once. Reduced motion: no shake, still selected, still the glyph and the buzz.

## R-079 · The author's reveal phone leads with a ✓ and a hint with the points third and +0 painted gold; the voter's phone forgets what they picked and never says which letter is theirs

- **applied** — commit `092e76e`. An author's reveal phone now opens with the number: '+250' in gold (or a muted '+0'), then '2 votes' with a SWEEP pill beside it (or 'No votes this time'), then their answer, then a small 'Nice one.' / 'Better luck on the next prompt.' — no green ✓ disc pretending it was a submission. A voter's phone remembers the tap: 'You picked A · See who wrote it on the TV' with the answer they chose echoed underneath. During the vote the author's hint reads 'Don't say which one — the others are voting…'.

## R-080 · Phone scores crown a 🏆 on interim standings and spend 110 px on a '◎' disc while players 7-8 fall off screen

- **applied** — commit `561c949`. Between rounds the phone shows the thing that changed: '+650' huge and green (a quiet grey '+0' if nothing changed), '#3 of 8 · 650 points' under it, then the compact board with numeric ranks — no 🏆 before the game is over and no 110 px mood disc. Measured on the iPhone 15 viewport: row 8's bottom at 650 px of 659, fully visible; the iPhone SE still scrolls as accepted.

## R-081 · After the final round the TV says 'Scores so far' and then cuts straight to 'X wins!'; the game's own ceremony copy is unreachable

- **applied** — commit `778e8e8`. After the last round the TV no longer says 'Scores so far': kicker 'FINAL ROUND PLAYED', title 'Final scores', deltas kept, no crown, and an accent 'And the winner is…' whose ellipsis breathes once per second (static under reduced motion) — a real drumroll into the core results screen. The phone's final scores screen says 'Final: #2 of 4 · 800 points' with the delta hero (per R-080).

## R-082 · 'Locked in — look at the TV' never says how fast you were, although speed is the whole point

- **applied** — commit `4e32620`. After locking in, the green line says how fast you were: '✓ Locked in with 12 s to spare — look at the TV' (or '✓ Just made it — look at the TV' at 3 s or less), using the same seconds the header shows. A correct outcome then reads '🔥 streak 2 · 12 s to spare · 3100 points'. The wager grid keeps the plain line.

## R-083 · Question and its four choices rise as one block — nothing leads the eye from prompt to A/B/C/D, and the final question's kicker does not register

- **applied** — commit `0293692`. Every new question now reads top-down: the kicker and prompt ride the shell's 300 ms rise, then A, B, C and D rise in one after another (150/200/250/300 ms delays), all settled by 600 ms. The FINAL QUESTION kicker (wager screen, final question, final reveal) pops in over 600 ms instead of sliding like 'Question 2 of 10'. All token multiples → 0 ms under reduced motion.

## R-084 · Streak growth and streak loss have no motion or weight on either screen

- **applied** — commit `03c91c5`. A streak of three or more now announces itself: after the reveal rows have landed, the gold '🔥4' badge pops in (600 ms, row order) instead of being part of the one-frame cut; '🔥2' stays static. The badge carries aria-label 'streak 4'. Reduced motion: the badge simply appears.

## R-085 · '1 / 6 answered' is a static number: no pop when someone locks in, no 'waiting for Sam' when one person holds the room, no 'everyone's in'

- **applied** — commit `fc4c87b`. The count line under the choices reads '3 / 5 locked in' with the number in bold white that pops (scale 0.6→1.08→1) every time someone locks in, and when one to three connected players are holding the room it adds ' · waiting for Maximiliano Vega and Ben' in muted text (derived from each player's status, so disconnected players are never named). The wager screen's number pops the same way.

## R-086 · Sixty seconds of a text counter on an empty stage; the room can't see who is holding it up

- **applied** — commit `b0591fe`. The minute-long writing phase finally moves: a row of 8–16 pips under 'Write your answers!' fills with green ✓ discs as answers arrive, the newest one popping; the '5 / 8 answers in' line re-enters on every change; and once anyone is done the muted 'Two prompts are waiting on your phone.' becomes an accent 'Waiting for Priya and Kenji…' (up to four names, then 'and n more'). With 10 s left the headline swaps to 'Last chance!' while the status keeps naming who is holding the room up.

## R-087 · The TV theme strip is a half-empty 1152 px panel whose five options wrap into two ragged rows over the players heading

- **applied** — commit `c3f255f`. The TV's 🎨 button now drops a single 640 px column (x 1184–1824, bottom ≈ y 654) instead of a ragged two-row strip: five 99 px rows, each with the swatch, a 36 px label and its one-line hint ('bright room, light background' …), the current theme marked ✓ with an accent-2 border, and a 1 px --pb-border edge that shows white in High Contrast. It clears the '16 / 16 players' heading even with a full lobby. Picking a theme recolours the screen and closes the menu; a click anywhere outside the corner controls or Escape (which hands focus back to 🎨) closes it too, while the mute/fullscreen buttons beside it do not. It still rises in with pb-rise (0 ms under reduced motion).

## R-088 · Game cards mark the selection by border colour alone and have no press feedback

- **applied** — commit `4f341f2`. Each game card on the VIP's 'Pick a game' screen carries a 28 px disc beside its title: a hollow muted ring at rest, a filled accent disc with a ✓ when selected — so the choice never rests on the border colour alone. Cards now have a 3 px --pb-border edge (transparent in four themes, white in High Contrast, where every card is outlined and the selected one turns pink + ✓). Holding a card scales it to 0.98, like every other tap target, and the theme sheet's options press the same way. Long titles wrap under the disc instead of colliding with it. Reduced motion snaps the press.

## R-089 · The VIP menu is four equal grey slabs plus a list: nothing says 'game', 'room' or 'people', and End game looks like Pause until it is confirmed

- **applied** — commit `c5dcfa9`. The VIP sheet now scans as three labelled sections in the Join-form label voice: GAME (Skip phase, Pause/Resume, End game — only while playing), ROOM (Lock/Unlock room) and PLAYERS (the list, under a hairline). End game at rest reads as destructive before the confirm tap: danger-coloured text with a 2 px inset danger ring; the confirm state is unchanged (solid danger 'Confirm: End game', reverting after 4 s). Kick buttons carry a ✕ glyph so the meaning does not rest on red text; screen readers still hear 'Kick' / 'Confirm: Kick'. In High Contrast the small Make VIP / Kick pills get a white edge. No motion or sound change.

## R-090 · Disabled primary buttons carry no reason and give no press acknowledgement; an empty name and 'Connecting…' read the same

- **applied** — commit `d858a83`. A grey Join button now says why it is grey: 'Enter a name to join', then 'Enter the 4-letter code' when a code is needed, then 'Join' (with 'Connecting…' / 'Joining…' still winning). Tapping any grey primary button — Join, the VIP's 'Start Broken Pencil' under its 'needs at least 3 players' reason, a TextAnswer submit — shakes it once (three sideways jolts, 300 ms) and buzzes 10 ms on Android, instead of dying silently; a second tap shakes again. A ✓ 'Submitted' button stays inert with no shake. Enter with an empty name no longer submits or shows the native bubble. Reduced motion: no shake, copy and the 10 ms buzz remain.

## Also in this round (owner requests)

- **Background music** (`packages/client/src/music.ts`): the lobby and game-selection screens rotate Airport Lounge / Bossa Antigua / Local Forecast (Elevator) / George Street Shuffle — 30–60 s each, a 2.5 s fade, one second of silence, next track; Bingo chains Wallpaper with the occasional Cool Vibes (3:1) at 20 % under the caller; Broken Pencil chains Backbay Lounge / Lobby Time / Hep Cats at 20 % only while people draw, guess and pass. A paused game holds the track; the TV 🔊 toggle mutes it; the first tap on the audio gate starts it. Tracks are fetched once by the launcher (`pnpm fetch-music`), Kevin MacLeod CC BY 4.0.
- **Bingo caller**: every call is spoken on the TV — "B, 12" — 300 ms after the boing, Windows Zira at rate 1.15 / pitch 1.1 (owner pick: voice 4, plain style), hushed the instant someone claims, silent when the TV is muted.
- **Lightning final board stays**: the results stage keeps the settled final-wager board (bets, answer, deltas, totals, leader outline) under the winner line until Play again / New game / Home (`clientModule.finale` / `Finale`).
