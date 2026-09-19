# Audio interaction trace

Captured 2026-09-19T02:26:20.067Z on port 42112. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**69 / 69 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.3}]

```
   1755 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1794 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3112 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3250 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3937 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4566 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5401 tv    ss:cancel    speaking=false pending=false
```

## B · Lightning Round: start, phases, lock-in, last five seconds, final reveal, results

- ✅ **game start → start cue, lobby music fades to none (Lightning plays beds, not tracks)** — cues=start; plan=lobby→null
- ✅ **no track audible during Lightning; the intro bed is the marimba** — playing=[] bed=marimba
- ✅ **question phase → the generic phase chime (unmapped)** — cues=phase
- ✅ **question → the pulse bed** — bed=pulse
- ✅ **the phase chime ducks the pulse bed once** — bed:duck events=1
- ✅ **a lock tick does not duck the pulse bed (light cue)** — bed:duck events=0
- ✅ **lock-in → TV lock tick; phone submit cue + 20 ms buzz** — tv=lock; phone=submit buzz=15 20
- ✅ **the phone never plays TV cues (phase/start/win/lock/countdown)** — phone cues=submit
- ✅ **last 5 s → five countdown ticks on the TV, climbing** — ticks=5 semitones=0,2,4,5,7
- ✅ **an unanswered phone buzzes each second, ticks once at 5 s, buzzes at time-up** — buzz=6 phone cues=tick
- ✅ **the deadline fired → reveal phase, reveal cue, and NO phase chime on top** — phase=reveal cues=countdown,countdown,countdown,countdown,countdown,reveal
- ✅ **the reveal keeps the pulse bed (no crossfade on the cut)** — bed=pulse
- ✅ **wager phase → wager cue (mapped), no phase chime for it** — cues=phase,reveal,phase,reveal,phase,reveal,phase,reveal,phase,reveal,phase,reveal,phase,reveal,phase,reveal,phase,reveal,wager
- ✅ **wager → the late-night bed** — bed=latenight
- ✅ **final reveal → jackpot or bust cue from the game, no reveal sting on top** — cues=phase,silence,bust
- ✅ **results → one cheer (horn + crowd), no synth win, no music, no bed** — cues=cheer; playing=[] bed=null
- ✅ **results on the phones → a buzz only (no cue)** — phone cues=none buzz=[60,60,60,60,160]

```
   6254 tv    music:plan   from=lobby to=null
   6254 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7765 tv    music:stop   track=local-forecast-elevator.mp3
   8222 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   8222 tv    bed:duck     bed=pulse cue=phase
   9502 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16483 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17482 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18483 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19479 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20482 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21262 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  21262 tv    bed:duck     bed=pulse cue=reveal
  22056 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22056 tv    bed:duck     bed=pulse cue=phase
  22212 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22212 tv    bed:duck     bed=pulse cue=reveal
  22368 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22368 tv    bed:duck     bed=pulse cue=phase
  22524 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22524 tv    bed:duck     bed=pulse cue=reveal
  22683 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22683 tv    bed:duck     bed=pulse cue=phase
  22840 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22840 tv    bed:duck     bed=pulse cue=reveal
  22998 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22998 tv    bed:duck     bed=pulse cue=phase
  23140 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23140 tv    bed:duck     bed=pulse cue=reveal
  23293 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23293 tv    bed:duck     bed=pulse cue=phase
  23452 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23452 tv    bed:duck     bed=pulse cue=reveal
  23609 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23609 tv    bed:duck     bed=pulse cue=phase
  23766 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23766 tv    bed:duck     bed=pulse cue=reveal
  23924 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23924 tv    bed:duck     bed=pulse cue=phase
  24080 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24080 tv    bed:duck     bed=pulse cue=reveal
  24238 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24238 tv    bed:duck     bed=pulse cue=phase
  24395 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24395 tv    bed:duck     bed=pulse cue=reveal
  24551 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24551 tv    bed:duck     bed=pulse cue=phase
  24708 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24708 tv    bed:duck     bed=pulse cue=reveal
  24868 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  24868 tv    bed:duck     bed=latenight cue=wager
  25742 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  25742 tv    bed:duck     bed=pulse cue=phase
  26072 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  26072 tv    bed:duck     bed=pulse cue=silence
  27875 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  27875 tv    bed:duck     bed=pulse cue=bust
  29591 tv    ss:cancel    speaking=false pending=false
  29591 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":1.5}]

```
  31142 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33308 tv    ss:cancel    speaking=false pending=false
  33308 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34860 tv    ss:cancel    speaking=false pending=false
  34860 tv    music:plan   from=null to=lobby
  34860 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:george-street-shuffle.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime** — cues=start,card,lock,lock,tick,tick,tick,call
- ✅ **the hand feels each card land (one 12 ms tap per card) and then the first call** — taps(12)=2 (1 card + the first call)
- ✅ **each Ready ticks (lock, rising); the 3 · 2 · 1's first tick comes a breath (≥ 300 ms) after the last** — locks=2 last lock→first tick=441ms
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+1061ms phone@+1074ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "another" is a 20 ms tap and one card pluck; Ready a 20 ms tap and the submit cue** — taps=3 cues=card,submit
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **each voice starts on the push (no delay); its boing lands on the squash, 170–230 ms later** — delays=0,0 boing lags=194,196ms
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":19}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":25.9}]
- ✅ **skipping through the deck: a hush before every call, one voice at a time** — clips=41 hushes=41
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5355ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":40.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the winner's celebration buzz (320 ms) runs whole — nothing shorter cuts it** — celebration@74504 cut by=[]
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5401ms cheer@+5365ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36445 tv    music:plan   from=lobby to=game:bingo
  36445 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36445 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36784 tv    hush
  36788 tv    hush
  37249 tv    music:stop   track=george-street-shuffle.mp3
  37442 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  39528 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  40058 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
  40499 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41500 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  42495 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  43466 tv    hush
  43466 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  43466 tv    speak        text=b9.wav voice=clip delayMs=0
  43467 tv    hush
  43659 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44061 tv    hush
  44061 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  44061 tv    speak        text=b8.wav voice=clip delayMs=0
  44255 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45878 tv    hush
  45878 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  45878 tv    speak        text=n34.wav voice=clip delayMs=0
  46074 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  47756 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  48020 tv    hush
  48021 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  48021 tv    hush
  53375 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  56382 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57392 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58398 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  59392 tv    hush
  59392 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  59392 tv    speak        text=n35.wav voice=clip delayMs=0
  59588 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61189 tv    music:paused paused=true
  61189 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  62439 tv    music:paused paused=false
  62439 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  63710 tv    hush
  63710 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  63710 tv    speak        text=i25.wav voice=clip delayMs=0
  63835 tv    hush
  63835 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  63835 tv    speak        text=n45.wav voice=clip delayMs=0
  63962 tv    hush
  63962 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  63962 tv    speak        text=n33.wav voice=clip delayMs=0
  64085 tv    hush
  64085 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  64085 tv    speak        text=g49.wav voice=clip delayMs=0
  64211 tv    hush
  64211 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  64211 tv    speak        text=b4.wav voice=clip delayMs=0
  64338 tv    hush
  64338 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  64338 tv    speak        text=i20.wav voice=clip delayMs=0
  64446 tv    hush
  64446 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  64446 tv    speak        text=o69.wav voice=clip delayMs=0
  64571 tv    hush
  64571 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  64571 tv    speak        text=o67.wav voice=clip delayMs=0
  64695 tv    hush
  64695 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  64695 tv    speak        text=o65.wav voice=clip delayMs=0
  64822 tv    hush
  64822 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  64822 tv    speak        text=o73.wav voice=clip delayMs=0
  64935 tv    hush
  64935 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  64935 tv    speak        text=i21.wav voice=clip delayMs=0
  65058 tv    hush
  65058 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  65058 tv    speak        text=i18.wav voice=clip delayMs=0
  65181 tv    hush
  65181 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  65181 tv    speak        text=g58.wav voice=clip delayMs=0
  65308 tv    hush
  65308 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  65308 tv    speak        text=n36.wav voice=clip delayMs=0
  65433 tv    hush
  65433 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  65433 tv    speak        text=o61.wav voice=clip delayMs=0
  65558 tv    hush
  65558 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  65558 tv    speak        text=n37.wav voice=clip delayMs=0
  65682 tv    hush
  65682 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  65682 tv    speak        text=i16.wav voice=clip delayMs=0
  65811 tv    hush
  65811 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  65811 tv    speak        text=g47.wav voice=clip delayMs=0
  65933 tv    hush
  65933 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  65933 tv    speak        text=n41.wav voice=clip delayMs=0
  66057 tv    hush
  66057 tv    clip         src=b6.wav muted=false ready=true delayMs=0
  66057 tv    speak        text=b6.wav voice=clip delayMs=0
  66181 tv    hush
  66181 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  66181 tv    speak        text=o72.wav voice=clip delayMs=0
  66306 tv    hush
  66306 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  66306 tv    speak        text=b3.wav voice=clip delayMs=0
  66433 tv    hush
  66433 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  66433 tv    speak        text=i30.wav voice=clip delayMs=0
  66559 tv    hush
  66559 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  66559 tv    speak        text=g56.wav voice=clip delayMs=0
  66667 tv    hush
  66667 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  66667 tv    speak        text=o75.wav voice=clip delayMs=0
  66793 tv    hush
  66793 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  66793 tv    speak        text=b1.wav voice=clip delayMs=0
  66920 tv    hush
  66920 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  66920 tv    speak        text=b2.wav voice=clip delayMs=0
  67045 tv    hush
  67045 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  67045 tv    speak        text=n32.wav voice=clip delayMs=0
  67171 tv    hush
  67171 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  67171 tv    speak        text=g48.wav voice=clip delayMs=0
  67296 tv    hush
  67296 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  67296 tv    speak        text=i23.wav voice=clip delayMs=0
  67421 tv    hush
  67421 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  67421 tv    speak        text=i26.wav voice=clip delayMs=0
  67547 tv    hush
  67547 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  67547 tv    speak        text=o66.wav voice=clip delayMs=0
  67672 tv    hush
  67672 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  67672 tv    speak        text=i19.wav voice=clip delayMs=0
  67801 tv    hush
  67801 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  67801 tv    speak        text=n42.wav voice=clip delayMs=0
  67923 tv    hush
  67923 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  67923 tv    speak        text=i24.wav voice=clip delayMs=0
  68049 tv    hush
  68049 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  68049 tv    speak        text=n39.wav voice=clip delayMs=0
  68174 tv    hush
  68174 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  68174 tv    speak        text=g46.wav voice=clip delayMs=0
  68300 tv    hush
  68300 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  68300 tv    speak        text=n44.wav voice=clip delayMs=0
  68425 tv    hush
  68425 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  68425 tv    speak        text=b15.wav voice=clip delayMs=0
  68550 tv    hush
  68550 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  68550 tv    speak        text=b11.wav voice=clip delayMs=0
  68674 tv    hush
  68674 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  68674 tv    speak        text=g57.wav voice=clip delayMs=0
  68866 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  69305 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  69585 tv    hush
  69585 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  69585 tv    hush
  71459 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  74940 tv    music:duck   ms=9000
  74940 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  79762 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  80077 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81078 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82080 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  83079 tv    hush
  83079 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  83079 tv    speak        text=g57.wav voice=clip delayMs=0
  83271 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  85399 tv    ss:cancel    speaking=false pending=false
  85399 tv    music:plan   from=game:bingo to=null
  85402 tv    ss:cancel    speaking=false pending=false
  85402 tv    music:plan   from=null to=lobby
  85402 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  86202 tv    music:stop   track=cool-vibes.mp3
  87915 tv    ss:cancel    speaking=false pending=false
  87924 tv    music:plan   from=lobby to=game:bingo
  87924 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  87924 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  87928 tv    hush
  87928 tv    hush
  88544 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  88547 tv    hush
  88547 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  88547 tv    speak        text=i21.wav voice=clip delayMs=0
  88547 tv    hush
  88561 tv    hush
  88561 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  88561 tv    speak        text=n32.wav voice=clip delayMs=0
  88656 tv    hush
  88657 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  88657 tv    speak        text=i18.wav voice=clip delayMs=0
  88725 tv    music:stop   track=george-street-shuffle.mp3
  88750 tv    hush
  88750 tv    clip         src=n40.wav muted=false ready=true delayMs=0
  88750 tv    speak        text=n40.wav voice=clip delayMs=0
  88844 tv    hush
  88844 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  88844 tv    speak        text=i30.wav voice=clip delayMs=0
  88937 tv    hush
  88937 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  88937 tv    speak        text=o69.wav voice=clip delayMs=0
  89030 tv    hush
  89030 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  89030 tv    speak        text=o61.wav voice=clip delayMs=0
  89124 tv    hush
  89124 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  89124 tv    speak        text=n34.wav voice=clip delayMs=0
  89205 tv    hush
  89205 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  89205 tv    speak        text=n35.wav voice=clip delayMs=0
  89300 tv    hush
  89300 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  89300 tv    speak        text=o67.wav voice=clip delayMs=0
  89391 tv    hush
  89391 tv    clip         src=g55.wav muted=false ready=true delayMs=0
  89391 tv    speak        text=g55.wav voice=clip delayMs=0
  89486 tv    hush
  89486 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  89486 tv    speak        text=i26.wav voice=clip delayMs=0
  89582 tv    hush
  89582 tv    clip         src=i22.wav muted=false ready=true delayMs=0
  89582 tv    speak        text=i22.wav voice=clip delayMs=0
  89675 tv    hush
  89675 tv    clip         src=i29.wav muted=false ready=true delayMs=0
  89675 tv    speak        text=i29.wav voice=clip delayMs=0
  89768 tv    hush
  89768 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  89768 tv    speak        text=o66.wav voice=clip delayMs=0
  89863 tv    hush
  89863 tv    clip         src=g51.wav muted=false ready=true delayMs=0
  89863 tv    speak        text=g51.wav voice=clip delayMs=0
  89956 tv    hush
  89956 tv    clip         src=g53.wav muted=false ready=true delayMs=0
  89956 tv    speak        text=g53.wav voice=clip delayMs=0
  90049 tv    hush
  90049 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  90049 tv    speak        text=b9.wav voice=clip delayMs=0
  90143 tv    hush
  90143 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  90143 tv    speak        text=n36.wav voice=clip delayMs=0
  90236 tv    hush
  90236 tv    clip         src=g52.wav muted=false ready=true delayMs=0
  90236 tv    speak        text=g52.wav voice=clip delayMs=0
  90331 tv    hush
  90331 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  90331 tv    speak        text=b1.wav voice=clip delayMs=0
  90423 tv    hush
  90423 tv    clip         src=b13.wav muted=false ready=true delayMs=0
  90423 tv    speak        text=b13.wav voice=clip delayMs=0
  90517 tv    hush
  90517 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  90517 tv    speak        text=n37.wav voice=clip delayMs=0
  90614 tv    hush
  90614 tv    clip         src=o71.wav muted=false ready=true delayMs=0
  90614 tv    speak        text=o71.wav voice=clip delayMs=0
  90691 tv    hush
  90691 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  90691 tv    speak        text=b8.wav voice=clip delayMs=0
  90770 tv    hush
  90770 tv    clip         src=b5.wav muted=false ready=true delayMs=0
  90770 tv    speak        text=b5.wav voice=clip delayMs=0
  90865 tv    hush
  90865 tv    clip         src=b7.wav muted=false ready=true delayMs=0
  90865 tv    speak        text=b7.wav voice=clip delayMs=0
  90960 tv    hush
  90960 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  90960 tv    speak        text=n42.wav voice=clip delayMs=0
  91068 tv    hush
  91068 tv    clip         src=i28.wav muted=false ready=true delayMs=0
  91068 tv    speak        text=i28.wav voice=clip delayMs=0
  91149 tv    hush
  91149 tv    clip         src=i27.wav muted=false ready=true delayMs=0
  91149 tv    speak        text=i27.wav voice=clip delayMs=0
  91259 tv    hush
  91259 tv    clip         src=o63.wav muted=false ready=true delayMs=0
  91259 tv    speak        text=o63.wav voice=clip delayMs=0
  91351 tv    hush
  91351 tv    clip         src=o64.wav muted=false ready=true delayMs=0
  91351 tv    speak        text=o64.wav voice=clip delayMs=0
  91446 tv    hush
  91446 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  91446 tv    speak        text=o73.wav voice=clip delayMs=0
  91542 tv    hush
  91542 tv    clip         src=g50.wav muted=false ready=true delayMs=0
  91542 tv    speak        text=g50.wav voice=clip delayMs=0
  91647 tv    hush
  91647 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  91647 tv    speak        text=g48.wav voice=clip delayMs=0
  91742 tv    hush
  91742 tv    clip         src=b12.wav muted=false ready=true delayMs=0
  91742 tv    speak        text=b12.wav voice=clip delayMs=0
  91837 tv    hush
  91837 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  91837 tv    speak        text=n45.wav voice=clip delayMs=0
  91929 tv    hush
  91929 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  91929 tv    speak        text=b4.wav voice=clip delayMs=0
  92026 tv    hush
  92026 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  92026 tv    speak        text=g46.wav voice=clip delayMs=0
  92116 tv    hush
  92116 tv    clip         src=o74.wav muted=false ready=true delayMs=0
  92116 tv    speak        text=o74.wav voice=clip delayMs=0
  92225 tv    hush
  92225 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  92225 tv    speak        text=g47.wav voice=clip delayMs=0
  92320 tv    hush
  92320 tv    clip         src=n31.wav muted=false ready=true delayMs=0
  92320 tv    speak        text=n31.wav voice=clip delayMs=0
  92414 tv    hush
  92414 tv    clip         src=o62.wav muted=false ready=true delayMs=0
  92414 tv    speak        text=o62.wav voice=clip delayMs=0
  92507 tv    hush
  92507 tv    clip         src=b10.wav muted=false ready=true delayMs=0
  92507 tv    speak        text=b10.wav voice=clip delayMs=0
  92600 tv    hush
  92600 tv    clip         src=g60.wav muted=false ready=true delayMs=0
  92600 tv    speak        text=g60.wav voice=clip delayMs=0
  92694 tv    hush
  92694 tv    clip         src=n38.wav muted=false ready=true delayMs=0
  92694 tv    speak        text=n38.wav voice=clip delayMs=0
  92793 tv    hush
  92793 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  92793 tv    speak        text=n39.wav voice=clip delayMs=0
  92881 tv    hush
  92881 tv    clip         src=o70.wav muted=false ready=true delayMs=0
  92881 tv    speak        text=o70.wav voice=clip delayMs=0
  92974 tv    hush
  92974 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  92974 tv    speak        text=b11.wav voice=clip delayMs=0
  93054 tv    hush
  93054 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  93054 tv    speak        text=o75.wav voice=clip delayMs=0
  93149 tv    hush
  93149 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  93149 tv    speak        text=g58.wav voice=clip delayMs=0
  93243 tv    hush
  93243 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  93243 tv    speak        text=b15.wav voice=clip delayMs=0
  93336 tv    hush
  93336 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  93336 tv    speak        text=i24.wav voice=clip delayMs=0
  93431 tv    hush
  93431 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  93431 tv    speak        text=o72.wav voice=clip delayMs=0
  93523 tv    hush
  93523 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  93523 tv    speak        text=g56.wav voice=clip delayMs=0
  93617 tv    hush
  93617 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  93617 tv    speak        text=i20.wav voice=clip delayMs=0
  93710 tv    hush
  93710 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  93710 tv    speak        text=n44.wav voice=clip delayMs=0
  93804 tv    hush
  93804 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  93804 tv    speak        text=b3.wav voice=clip delayMs=0
  93913 tv    hush
  93913 tv    clip         src=o68.wav muted=false ready=true delayMs=0
  93913 tv    speak        text=o68.wav voice=clip delayMs=0
  94023 tv    hush
  94023 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  94023 tv    speak        text=b2.wav voice=clip delayMs=0
  94112 tv    hush
  94112 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  94112 tv    speak        text=n41.wav voice=clip delayMs=0
  94206 tv    hush
  94206 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  94206 tv    speak        text=o65.wav voice=clip delayMs=0
  94299 tv    hush
  94299 tv    clip         src=i17.wav muted=false ready=true delayMs=0
  94299 tv    speak        text=i17.wav voice=clip delayMs=0
  94403 tv    hush
  94403 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  94403 tv    speak        text=i25.wav voice=clip delayMs=0
  94485 tv    hush
  94485 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  94485 tv    speak        text=i19.wav voice=clip delayMs=0
  94580 tv    hush
  94580 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  94580 tv    speak        text=g57.wav voice=clip delayMs=0
  94680 tv    hush
  94680 tv    clip         src=g59.wav muted=false ready=true delayMs=0
  94680 tv    speak        text=g59.wav voice=clip delayMs=0
  94766 tv    hush
  94766 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  94766 tv    speak        text=g49.wav voice=clip delayMs=0
  94865 tv    hush
  94865 tv    clip         src=n43.wav muted=false ready=true delayMs=0
  94865 tv    speak        text=n43.wav voice=clip delayMs=0
  94953 tv    hush
  94953 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  94953 tv    speak        text=i16.wav voice=clip delayMs=0
  95051 tv    hush
  95051 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  95051 tv    speak        text=n33.wav voice=clip delayMs=0
  95141 tv    hush
  95141 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  95141 tv    speak        text=i23.wav voice=clip delayMs=0
  95235 tv    hush
  95235 tv    clip         src=g54.wav muted=false ready=true delayMs=0
  95235 tv    speak        text=g54.wav voice=clip delayMs=0
  95331 tv    hush
  95331 tv    clip         src=b14.wav muted=false ready=true delayMs=0
  95331 tv    speak        text=b14.wav voice=clip delayMs=0
  95522 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  96536 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  96801 tv    hush
  96801 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  96802 tv    hush
 104409 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 104418 tv    music:duck   ms=9000
 104418 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 109420 tv    hush
 109420 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 109420 tv    hush
 113414 tv    ss:cancel    speaking=false pending=false
 113414 tv    music:plan   from=game:bingo to=null
 113414 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 114916 tv    music:stop   track=wallpaper.mp3
 115031 tv    ss:cancel    speaking=false pending=false
 115031 tv    music:plan   from=null to=lobby
 115031 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 117541 tv    ss:cancel    speaking=false pending=false
 117549 tv    music:plan   from=lobby to=game:bingo
 117549 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 117549 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 117552 tv    hush
 117553 tv    hush
 118168 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 118171 tv    hush
 118171 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 118171 tv    speak        text=i21.wav voice=clip delayMs=0
 118171 tv    hush
 118176 tv    hush
 118176 tv    clip         src=n32.wav muted=false ready=true delayMs=0
 118176 tv    speak        text=n32.wav voice=clip delayMs=0
 118278 tv    hush
 118278 tv    clip         src=i18.wav muted=false ready=true delayMs=0
 118278 tv    speak        text=i18.wav voice=clip delayMs=0
 118350 tv    music:stop   track=airport-lounge.mp3
 118370 tv    hush
 118370 tv    clip         src=n40.wav muted=false ready=true delayMs=0
 118370 tv    speak        text=n40.wav voice=clip delayMs=0
 118465 tv    hush
 118465 tv    clip         src=i30.wav muted=false ready=true delayMs=0
 118465 tv    speak        text=i30.wav voice=clip delayMs=0
 118560 tv    hush
 118560 tv    clip         src=o69.wav muted=false ready=true delayMs=0
 118560 tv    speak        text=o69.wav voice=clip delayMs=0
 118652 tv    hush
 118652 tv    clip         src=o61.wav muted=false ready=true delayMs=0
 118652 tv    speak        text=o61.wav voice=clip delayMs=0
 118747 tv    hush
 118747 tv    clip         src=n34.wav muted=false ready=true delayMs=0
 118747 tv    speak        text=n34.wav voice=clip delayMs=0
 118841 tv    hush
 118841 tv    clip         src=n35.wav muted=false ready=true delayMs=0
 118841 tv    speak        text=n35.wav voice=clip delayMs=0
 118935 tv    hush
 118935 tv    clip         src=o67.wav muted=false ready=true delayMs=0
 118935 tv    speak        text=o67.wav voice=clip delayMs=0
 119028 tv    hush
 119028 tv    clip         src=g55.wav muted=false ready=true delayMs=0
 119028 tv    speak        text=g55.wav voice=clip delayMs=0
 119122 tv    hush
 119122 tv    clip         src=i26.wav muted=false ready=true delayMs=0
 119122 tv    speak        text=i26.wav voice=clip delayMs=0
 119216 tv    hush
 119216 tv    clip         src=i22.wav muted=false ready=true delayMs=0
 119216 tv    speak        text=i22.wav voice=clip delayMs=0
 119310 tv    hush
 119310 tv    clip         src=i29.wav muted=false ready=true delayMs=0
 119310 tv    speak        text=i29.wav voice=clip delayMs=0
 119388 tv    hush
 119388 tv    clip         src=o66.wav muted=false ready=true delayMs=0
 119388 tv    speak        text=o66.wav voice=clip delayMs=0
 119483 tv    hush
 119483 tv    clip         src=g51.wav muted=false ready=true delayMs=0
 119483 tv    speak        text=g51.wav voice=clip delayMs=0
 119562 tv    hush
 119562 tv    clip         src=g53.wav muted=false ready=true delayMs=0
 119562 tv    speak        text=g53.wav voice=clip delayMs=0
 119655 tv    hush
 119655 tv    clip         src=b9.wav muted=false ready=true delayMs=0
 119655 tv    speak        text=b9.wav voice=clip delayMs=0
 119750 tv    hush
 119750 tv    clip         src=n36.wav muted=false ready=true delayMs=0
 119750 tv    speak        text=n36.wav voice=clip delayMs=0
 119846 tv    hush
 119846 tv    clip         src=g52.wav muted=false ready=true delayMs=0
 119846 tv    speak        text=g52.wav voice=clip delayMs=0
 119939 tv    hush
 119939 tv    clip         src=b1.wav muted=false ready=true delayMs=0
 119939 tv    speak        text=b1.wav voice=clip delayMs=0
 120033 tv    hush
 120033 tv    clip         src=b13.wav muted=false ready=true delayMs=0
 120033 tv    speak        text=b13.wav voice=clip delayMs=0
 120129 tv    hush
 120129 tv    clip         src=n37.wav muted=false ready=true delayMs=0
 120129 tv    speak        text=n37.wav voice=clip delayMs=0
 120222 tv    hush
 120222 tv    clip         src=o71.wav muted=false ready=true delayMs=0
 120222 tv    speak        text=o71.wav voice=clip delayMs=0
 120331 tv    hush
 120331 tv    clip         src=b8.wav muted=false ready=true delayMs=0
 120331 tv    speak        text=b8.wav voice=clip delayMs=0
 120425 tv    hush
 120425 tv    clip         src=b5.wav muted=false ready=true delayMs=0
 120425 tv    speak        text=b5.wav voice=clip delayMs=0
 120521 tv    hush
 120521 tv    clip         src=b7.wav muted=false ready=true delayMs=0
 120521 tv    speak        text=b7.wav voice=clip delayMs=0
 120616 tv    hush
 120616 tv    clip         src=n42.wav muted=false ready=true delayMs=0
 120616 tv    speak        text=n42.wav voice=clip delayMs=0
 120709 tv    hush
 120709 tv    clip         src=i28.wav muted=false ready=true delayMs=0
 120709 tv    speak        text=i28.wav voice=clip delayMs=0
 120802 tv    hush
 120802 tv    clip         src=i27.wav muted=false ready=true delayMs=0
 120802 tv    speak        text=i27.wav voice=clip delayMs=0
 120897 tv    hush
 120897 tv    clip         src=o63.wav muted=false ready=true delayMs=0
 120897 tv    speak        text=o63.wav voice=clip delayMs=0
 120991 tv    hush
 120991 tv    clip         src=o64.wav muted=false ready=true delayMs=0
 120991 tv    speak        text=o64.wav voice=clip delayMs=0
 121085 tv    hush
 121085 tv    clip         src=o73.wav muted=false ready=true delayMs=0
 121085 tv    speak        text=o73.wav voice=clip delayMs=0
 121181 tv    hush
 121181 tv    clip         src=g50.wav muted=false ready=true delayMs=0
 121181 tv    speak        text=g50.wav voice=clip delayMs=0
 121273 tv    hush
 121273 tv    clip         src=g48.wav muted=false ready=true delayMs=0
 121273 tv    speak        text=g48.wav voice=clip delayMs=0
 121381 tv    hush
 121381 tv    clip         src=b12.wav muted=false ready=true delayMs=0
 121381 tv    speak        text=b12.wav voice=clip delayMs=0
 121474 tv    hush
 121475 tv    clip         src=n45.wav muted=false ready=true delayMs=0
 121475 tv    speak        text=n45.wav voice=clip delayMs=0
 121568 tv    hush
 121568 tv    clip         src=b4.wav muted=false ready=true delayMs=0
 121568 tv    speak        text=b4.wav voice=clip delayMs=0
 121646 tv    hush
 121646 tv    clip         src=g46.wav muted=false ready=true delayMs=0
 121646 tv    speak        text=g46.wav voice=clip delayMs=0
 121739 tv    hush
 121739 tv    clip         src=o74.wav muted=false ready=true delayMs=0
 121739 tv    speak        text=o74.wav voice=clip delayMs=0
 121834 tv    hush
 121834 tv    clip         src=g47.wav muted=false ready=true delayMs=0
 121834 tv    speak        text=g47.wav voice=clip delayMs=0
 121931 tv    hush
 121931 tv    clip         src=n31.wav muted=false ready=true delayMs=0
 121931 tv    speak        text=n31.wav voice=clip delayMs=0
 122024 tv    hush
 122024 tv    clip         src=o62.wav muted=false ready=true delayMs=0
 122024 tv    speak        text=o62.wav voice=clip delayMs=0
 122118 tv    hush
 122118 tv    clip         src=b10.wav muted=false ready=true delayMs=0
 122118 tv    speak        text=b10.wav voice=clip delayMs=0
 122214 tv    hush
 122214 tv    clip         src=g60.wav muted=false ready=true delayMs=0
 122214 tv    speak        text=g60.wav voice=clip delayMs=0
 122308 tv    hush
 122308 tv    clip         src=n38.wav muted=false ready=true delayMs=0
 122308 tv    speak        text=n38.wav voice=clip delayMs=0
 122404 tv    hush
 122404 tv    clip         src=n39.wav muted=false ready=true delayMs=0
 122404 tv    speak        text=n39.wav voice=clip delayMs=0
 122498 tv    hush
 122498 tv    clip         src=o70.wav muted=false ready=true delayMs=0
 122498 tv    speak        text=o70.wav voice=clip delayMs=0
 122592 tv    hush
 122592 tv    clip         src=b11.wav muted=false ready=true delayMs=0
 122592 tv    speak        text=b11.wav voice=clip delayMs=0
 122685 tv    hush
 122685 tv    clip         src=o75.wav muted=false ready=true delayMs=0
 122685 tv    speak        text=o75.wav voice=clip delayMs=0
 122780 tv    hush
 122780 tv    clip         src=g58.wav muted=false ready=true delayMs=0
 122780 tv    speak        text=g58.wav voice=clip delayMs=0
 122875 tv    hush
 122875 tv    clip         src=b15.wav muted=false ready=true delayMs=0
 122875 tv    speak        text=b15.wav voice=clip delayMs=0
 122970 tv    hush
 122970 tv    clip         src=i24.wav muted=false ready=true delayMs=0
 122970 tv    speak        text=i24.wav voice=clip delayMs=0
 123079 tv    hush
 123079 tv    clip         src=o72.wav muted=false ready=true delayMs=0
 123079 tv    speak        text=o72.wav voice=clip delayMs=0
 123173 tv    hush
 123173 tv    clip         src=g56.wav muted=false ready=true delayMs=0
 123173 tv    speak        text=g56.wav voice=clip delayMs=0
 123267 tv    hush
 123267 tv    clip         src=i20.wav muted=false ready=true delayMs=0
 123267 tv    speak        text=i20.wav voice=clip delayMs=0
 123363 tv    hush
 123363 tv    clip         src=n44.wav muted=false ready=true delayMs=0
 123363 tv    speak        text=n44.wav voice=clip delayMs=0
 123457 tv    hush
 123457 tv    clip         src=b3.wav muted=false ready=true delayMs=0
 123457 tv    speak        text=b3.wav voice=clip delayMs=0
 123550 tv    hush
 123550 tv    clip         src=o68.wav muted=false ready=true delayMs=0
 123550 tv    speak        text=o68.wav voice=clip delayMs=0
 123641 tv    hush
 123641 tv    clip         src=b2.wav muted=false ready=true delayMs=0
 123641 tv    speak        text=b2.wav voice=clip delayMs=0
 123735 tv    hush
 123735 tv    clip         src=n41.wav muted=false ready=true delayMs=0
 123735 tv    speak        text=n41.wav voice=clip delayMs=0
 123831 tv    hush
 123831 tv    clip         src=o65.wav muted=false ready=true delayMs=0
 123831 tv    speak        text=o65.wav voice=clip delayMs=0
 123925 tv    hush
 123925 tv    clip         src=i17.wav muted=false ready=true delayMs=0
 123925 tv    speak        text=i17.wav voice=clip delayMs=0
 124018 tv    hush
 124018 tv    clip         src=i25.wav muted=false ready=true delayMs=0
 124018 tv    speak        text=i25.wav voice=clip delayMs=0
 124113 tv    hush
 124113 tv    clip         src=i19.wav muted=false ready=true delayMs=0
 124113 tv    speak        text=i19.wav voice=clip delayMs=0
 124207 tv    hush
 124207 tv    clip         src=g57.wav muted=false ready=true delayMs=0
 124207 tv    speak        text=g57.wav voice=clip delayMs=0
 124301 tv    hush
 124301 tv    clip         src=g59.wav muted=false ready=true delayMs=0
 124301 tv    speak        text=g59.wav voice=clip delayMs=0
 124394 tv    hush
 124394 tv    clip         src=g49.wav muted=false ready=true delayMs=0
 124394 tv    speak        text=g49.wav voice=clip delayMs=0
 124472 tv    hush
 124472 tv    clip         src=n43.wav muted=false ready=true delayMs=0
 124472 tv    speak        text=n43.wav voice=clip delayMs=0
 124566 tv    hush
 124566 tv    clip         src=i16.wav muted=false ready=true delayMs=0
 124566 tv    speak        text=i16.wav voice=clip delayMs=0
 124660 tv    hush
 124660 tv    clip         src=n33.wav muted=false ready=true delayMs=0
 124660 tv    speak        text=n33.wav voice=clip delayMs=0
 124754 tv    hush
 124754 tv    clip         src=i23.wav muted=false ready=true delayMs=0
 124754 tv    speak        text=i23.wav voice=clip delayMs=0
 124850 tv    hush
 124850 tv    clip         src=g54.wav muted=false ready=true delayMs=0
 124850 tv    speak        text=g54.wav voice=clip delayMs=0
 124945 tv    hush
 124946 tv    clip         src=b14.wav muted=false ready=true delayMs=0
 124946 tv    speak        text=b14.wav voice=clip delayMs=0
 125137 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 126169 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 126439 tv    hush
 126439 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 126439 tv    hush
 134046 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 134051 tv    music:duck   ms=9000
 134051 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 139052 tv    hush
 139052 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 139052 tv    hush
 140614 tv    ss:cancel    speaking=false pending=false
 140614 tv    music:plan   from=game:bingo to=null
 140616 tv    ss:cancel    speaking=false pending=false
 140616 tv    music:plan   from=null to=lobby
 140616 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 141418 tv    music:stop   track=wallpaper.mp3
 143129 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 143138 tv    ss:cancel    speaking=false pending=false
 143140 tv    music:plan   from=lobby to=game:bingo
 143140 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 143140 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 143144 tv    hush
 143144 tv    hush
 143796 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 143943 tv    music:stop   track=airport-lounge.mp3
 144350 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
 145283 tv    ss:cancel    speaking=false pending=false
 145283 tv    music:plan   from=game:bingo to=null
 145283 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 146784 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 147414 tv    ss:cancel    speaking=false pending=false
 147414 tv    music:plan   from=null to=lobby
 147414 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 150772 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 150782 tv    ss:cancel    speaking=false pending=false
 150784 tv    music:plan   from=lobby to=game:bingo
 150784 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 150784 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 150787 tv    hush
 150787 tv    hush
 151208 tv    cue          cue=lock surface=tv muted=false ready=true semitones=8
 151211 tv    hush
 151211 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 151211 tv    speak        text=i21.wav voice=clip delayMs=0
 151211 tv    hush
 151403 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 151585 tv    music:stop   track=local-forecast-elevator.mp3
 151714 tv    ss:cancel    speaking=false pending=false
 151714 tv    music:plan   from=game:bingo to=null
 151717 tv    ss:cancel    speaking=false pending=false
 151717 tv    music:plan   from=null to=lobby
 151717 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 152519 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, the lobby track only fading out, the warm bed under the intro** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.06,"t":10.3}] bed=warm
- ✅ **answer → one Wisecrack track at 0.2 while everyone writes, the bed gone** — playing=[{"track":"carefree.mp3","vol":0.2,"t":2.4}] bed=null
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **vote → the marimba bed (the first prompt), the track fading out** — bed=marimba playing=[]
- ✅ **reveal keeps the vote’s bed (same list, same turn: no crossfade on the cut)** — bed=marimba playing=[]
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal
- ✅ **scores phase → tally ping (mapped), the lounge bed** — cues=phase,reveal,phase,reveal,tally bed=lounge

```
 157317 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157754 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158189 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158605 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 159037 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 160186 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 160793 tv    ss:cancel    speaking=false pending=false
 160802 tv    music:plan   from=lobby to=null
 160802 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 162072 tv    music:plan   from=null to=game:wisecrack
 162072 tv    music:start  plan=game:wisecrack track=carefree mode=chain volume=0.2
 162072 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 162874 tv    music:stop   track=local-forecast-elevator.mp3
 165534 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 166818 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 168117 tv    music:plan   from=game:wisecrack to=null
 168118 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 168118 tv    bed:duck     bed=marimba cue=phase
 169148 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 169148 tv    bed:duck     bed=marimba cue=reveal
 169625 tv    music:stop   track=carefree.mp3
 172789 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 172789 tv    bed:duck     bed=lofi cue=phase
 172977 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 172977 tv    bed:duck     bed=lofi cue=reveal
 173166 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 173166 tv    bed:duck     bed=marimba cue=phase
 173355 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 173355 tv    bed:duck     bed=marimba cue=reveal
 173529 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 173529 tv    bed:duck     bed=lounge cue=tally
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"lobby-time.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 174645 tv    ss:cancel    speaking=false pending=false
 174648 tv    ss:cancel    speaking=false pending=false
 174648 tv    music:plan   from=null to=lobby
 174648 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 176677 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 176694 tv    ss:cancel    speaking=false pending=false
 176701 tv    music:plan   from=lobby to=null
 176702 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 178209 tv    music:stop   track=george-street-shuffle.mp3
 178265 tv    music:plan   from=null to=game:broken-pencil
 178265 tv    music:start  plan=game:broken-pencil track=lobby-time mode=chain volume=0.2
 178265 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 179733 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 180203 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 180344 tv    music:plan   from=game:broken-pencil to=null
 180344 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 181848 tv    music:stop   track=lobby-time.mp3
```
