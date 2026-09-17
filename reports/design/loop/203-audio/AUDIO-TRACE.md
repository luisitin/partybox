# Audio interaction trace

Captured 2026-09-17T21:18:26.042Z on port 42078. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**21 / 27 checks passed.** Failed: A: selecting keeps the lobby music (no plan change), a status-swap cue only; C: new game → selecting → lobby music comes back (plan null→lobby); D: Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2); D: exactly one track audible after the switch; runGameScenarios: scenario completed without throwing; runMoreScenarios: scenario completed without throwing

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:george-street-shuffle music:stop:george-street-shuffle.mp3 music:stop: music:start:airport-lounge music:stop:airport-lounge.mp3 music:stop: music:start:george-street-shuffle music:stop:george-street-shuffle.mp3 music:stop:
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ❌ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[]

```
   1819 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   1819 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   1827 tv    music:stop   track=george-street-shuffle.mp3
   1827 tv    music:stop   track=
   2336 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   2341 tv    music:stop   track=airport-lounge.mp3
   2341 tv    music:stop   track=
   2853 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   2857 tv    music:stop   track=george-street-shuffle.mp3
   2857 tv    music:stop   track=
   3148 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3280 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3358 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   3365 tv    music:stop   track=local-forecast-elevator.mp3
   3365 tv    music:stop   track=
   3879 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   3891 tv    music:stop   track=airport-lounge.mp3
   3891 tv    music:stop   track=
   3986 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4395 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   4405 tv    music:stop   track=bossa-antigua.mp3
   4405 tv    music:stop   track=
   4638 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   4913 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   4920 tv    music:stop   track=airport-lounge.mp3
   4920 tv    music:stop   track=
   5432 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   5433 tv    music:stop   track=george-street-shuffle.mp3
   5434 tv    music:stop   track=
   5484 tv    ss:cancel    speaking=false pending=false
   5936 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   5945 tv    music:stop   track=local-forecast-elevator.mp3
   5945 tv    music:stop   track=
```

## B · Lightning Round: start, phases, lock-in, last five seconds, final reveal, results

- ✅ **game start → start cue, lobby music fades to none (Lightning has no music)** — cues=start; plan=lobby→null
- ✅ **no track audible during Lightning** — []
- ✅ **question phase → the generic phase chime (unmapped)** — cues=phase
- ✅ **lock-in → TV lock tick; phone submit cue + 20 ms buzz** — tv=lock; phone=submit buzz=15 20
- ✅ **the phone never plays TV cues (phase/start/win/lock/countdown)** — phone cues=submit
- ✅ **last 5 s → five countdown ticks on the TV, climbing** — ticks=5 semitones=0,2,4,5,7
- ✅ **an unanswered phone buzzes each second, ticks once at 5 s, buzzes at time-up** — buzz=6 phone cues=tick
- ✅ **the deadline fired → reveal phase, reveal cue, and NO phase chime on top** — phase=reveal cues=countdown,countdown,countdown,countdown,countdown,reveal
- ✅ **wager phase → wager cue (mapped), no phase chime for it** — cues=phase,reveal,phase,reveal,phase,reveal,phase,reveal,phase,reveal,phase,reveal,phase,reveal,phase,reveal,phase,reveal,wager
- ✅ **final reveal → jackpot or bust cue from the game, no reveal sting on top** — cues=phase,silence,bust
- ✅ **results → one cheer (horn + crowd), no synth win, no music** — cues=cheer; playing=[]
- ✅ **results on the phones → a buzz only (no cue)** — phone cues=none buzz=[60,60,60,60,160]

```
   6340 tv    music:plan   from=lobby to=null
   6340 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   8277 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9576 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16537 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17532 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18530 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19531 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20533 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21343 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22123 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22287 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22435 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22598 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22749 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22894 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23047 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23211 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23345 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23482 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23641 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23794 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23947 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24108 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24263 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24420 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24576 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24737 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24887 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25757 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26082 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27887 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29602 tv    ss:cancel    speaking=false pending=false
  29602 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ❌ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[]

```
  31160 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33345 tv    ss:cancel    speaking=false pending=false
  33345 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34912 tv    ss:cancel    speaking=false pending=false
  34912 tv    music:plan   from=null to=lobby
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ❌ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo
- ❌ **exactly one track audible after the switch** — []
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ❌ **scenario completed without throwing** — TimeoutError: locator.click: Timeout 30000ms exceeded.
  Call log:
  [2m - waiting for getByRole('button', { name: /tap again to claim/i })[22m
  [2m - locator

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ❌ **scenario completed without throwing** — Error: /api/dev/start → 409 {"error":"Pick a game first.","code":"cannot_start"}
