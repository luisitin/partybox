# Audio interaction trace

Captured 2026-09-19T03:43:47.722Z on port 42112. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**70 / 70 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.3}]

```
   1799 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1836 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3153 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3289 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3985 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4622 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5482 tv    ss:cancel    speaking=false pending=false
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
   6322 tv    music:plan   from=lobby to=null
   6322 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7827 tv    music:stop   track=local-forecast-elevator.mp3
   8259 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   8259 tv    bed:duck     bed=pulse cue=phase
   9539 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16511 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17511 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18513 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19511 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20512 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21322 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  21322 tv    bed:duck     bed=pulse cue=reveal
  22115 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22115 tv    bed:duck     bed=pulse cue=phase
  22272 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22272 tv    bed:duck     bed=pulse cue=reveal
  22430 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22430 tv    bed:duck     bed=pulse cue=phase
  22587 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22587 tv    bed:duck     bed=pulse cue=reveal
  22743 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22743 tv    bed:duck     bed=pulse cue=phase
  22900 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22900 tv    bed:duck     bed=pulse cue=reveal
  23059 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23059 tv    bed:duck     bed=pulse cue=phase
  23214 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23214 tv    bed:duck     bed=pulse cue=reveal
  23371 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23371 tv    bed:duck     bed=pulse cue=phase
  23528 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23528 tv    bed:duck     bed=pulse cue=reveal
  23671 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23671 tv    bed:duck     bed=pulse cue=phase
  23811 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23811 tv    bed:duck     bed=pulse cue=reveal
  23966 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23966 tv    bed:duck     bed=pulse cue=phase
  24124 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24124 tv    bed:duck     bed=pulse cue=reveal
  24279 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24279 tv    bed:duck     bed=pulse cue=phase
  24436 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24436 tv    bed:duck     bed=pulse cue=reveal
  24592 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24592 tv    bed:duck     bed=pulse cue=phase
  24734 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24734 tv    bed:duck     bed=pulse cue=reveal
  24889 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  24889 tv    bed:duck     bed=latenight cue=wager
  25763 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  25763 tv    bed:duck     bed=pulse cue=phase
  26092 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  26092 tv    bed:duck     bed=pulse cue=silence
  27895 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  27895 tv    bed:duck     bed=pulse cue=bust
  29633 tv    ss:cancel    speaking=false pending=false
  29633 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31183 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33333 tv    ss:cancel    speaking=false pending=false
  33333 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34885 tv    ss:cancel    speaking=false pending=false
  34885 tv    music:plan   from=null to=lobby
  34885 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime** — cues=start,card,lock,lock,tick,tick,tick,call
- ✅ **the hand feels each card land (one 12 ms tap per card) and then the first call** — taps(12)=2 (1 card + the first call)
- ✅ **each Ready ticks (lock, rising); the 3 · 2 · 1's first tick comes a breath (≥ 300 ms) after the last** — locks=2 last lock→first tick=414ms
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+998ms phone@+1010ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "another" is a 20 ms tap and one card pluck; Ready a 20 ms tap and the submit cue** — taps=3 cues=card,submit
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **each voice starts on the push (no delay); its boing lands on the squash, 170–230 ms later** — delays=0,0 boing lags=192,198ms
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18.9}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":25.8}]
- ✅ **skipping through the deck: a hush before every call, one voice at a time** — clips=41 hushes=41
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5357ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":40.3}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the winner's celebration buzz (320 ms) runs whole — nothing shorter cuts it** — celebration@74395 cut by=[]
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5398ms cheer@+5367ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36439 tv    music:plan   from=lobby to=game:bingo
  36439 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36439 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36744 tv    hush
  36744 tv    hush
  37241 tv    music:stop   track=bossa-antigua.mp3
  37398 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  39517 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  40036 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
  40450 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41447 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  42445 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  43441 tv    hush
  43442 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  43442 tv    speak        text=b9.wav voice=clip delayMs=0
  43442 tv    hush
  43637 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43985 tv    hush
  43985 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  43985 tv    speak        text=b8.wav voice=clip delayMs=0
  44177 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45811 tv    hush
  45811 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  45811 tv    speak        text=n34.wav voice=clip delayMs=0
  46009 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  47686 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47955 tv    hush
  47955 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47956 tv    hush
  53312 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  56319 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57325 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58324 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  59333 tv    hush
  59333 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  59333 tv    speak        text=n35.wav voice=clip delayMs=0
  59527 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61119 tv    music:paused paused=true
  61119 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  62368 tv    music:paused paused=false
  62368 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  63676 tv    hush
  63676 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  63676 tv    speak        text=i25.wav voice=clip delayMs=0
  63786 tv    hush
  63786 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  63786 tv    speak        text=n45.wav voice=clip delayMs=0
  63912 tv    hush
  63912 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  63912 tv    speak        text=n33.wav voice=clip delayMs=0
  64038 tv    hush
  64038 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  64038 tv    speak        text=g49.wav voice=clip delayMs=0
  64164 tv    hush
  64164 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  64164 tv    speak        text=b4.wav voice=clip delayMs=0
  64289 tv    hush
  64289 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  64289 tv    speak        text=i20.wav voice=clip delayMs=0
  64414 tv    hush
  64414 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  64414 tv    speak        text=o69.wav voice=clip delayMs=0
  64540 tv    hush
  64540 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  64540 tv    speak        text=o67.wav voice=clip delayMs=0
  64666 tv    hush
  64666 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  64666 tv    speak        text=o65.wav voice=clip delayMs=0
  64793 tv    hush
  64793 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  64793 tv    speak        text=o73.wav voice=clip delayMs=0
  64921 tv    hush
  64921 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  64921 tv    speak        text=i21.wav voice=clip delayMs=0
  65042 tv    hush
  65042 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  65042 tv    speak        text=i18.wav voice=clip delayMs=0
  65168 tv    hush
  65168 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  65168 tv    speak        text=g58.wav voice=clip delayMs=0
  65294 tv    hush
  65294 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  65294 tv    speak        text=n36.wav voice=clip delayMs=0
  65420 tv    hush
  65420 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  65420 tv    speak        text=o61.wav voice=clip delayMs=0
  65543 tv    hush
  65543 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  65543 tv    speak        text=n37.wav voice=clip delayMs=0
  65668 tv    hush
  65668 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  65668 tv    speak        text=i16.wav voice=clip delayMs=0
  65765 tv    hush
  65765 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  65765 tv    speak        text=g47.wav voice=clip delayMs=0
  65886 tv    hush
  65886 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  65886 tv    speak        text=n41.wav voice=clip delayMs=0
  66010 tv    hush
  66010 tv    clip         src=b6.wav muted=false ready=true delayMs=0
  66010 tv    speak        text=b6.wav voice=clip delayMs=0
  66137 tv    hush
  66137 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  66137 tv    speak        text=o72.wav voice=clip delayMs=0
  66259 tv    hush
  66259 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  66259 tv    speak        text=b3.wav voice=clip delayMs=0
  66385 tv    hush
  66385 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  66385 tv    speak        text=i30.wav voice=clip delayMs=0
  66510 tv    hush
  66510 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  66510 tv    speak        text=g56.wav voice=clip delayMs=0
  66636 tv    hush
  66636 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  66636 tv    speak        text=o75.wav voice=clip delayMs=0
  66746 tv    hush
  66746 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  66746 tv    speak        text=b1.wav voice=clip delayMs=0
  66870 tv    hush
  66870 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  66870 tv    speak        text=b2.wav voice=clip delayMs=0
  66998 tv    hush
  66998 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  66998 tv    speak        text=n32.wav voice=clip delayMs=0
  67125 tv    hush
  67125 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  67125 tv    speak        text=g48.wav voice=clip delayMs=0
  67249 tv    hush
  67249 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  67249 tv    speak        text=i23.wav voice=clip delayMs=0
  67371 tv    hush
  67371 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  67371 tv    speak        text=i26.wav voice=clip delayMs=0
  67497 tv    hush
  67497 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  67497 tv    speak        text=o66.wav voice=clip delayMs=0
  67624 tv    hush
  67624 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  67624 tv    speak        text=i19.wav voice=clip delayMs=0
  67750 tv    hush
  67750 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  67750 tv    speak        text=n42.wav voice=clip delayMs=0
  67874 tv    hush
  67874 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  67874 tv    speak        text=i24.wav voice=clip delayMs=0
  67999 tv    hush
  67999 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  67999 tv    speak        text=n39.wav voice=clip delayMs=0
  68126 tv    hush
  68126 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  68126 tv    speak        text=g46.wav voice=clip delayMs=0
  68252 tv    hush
  68252 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  68252 tv    speak        text=n44.wav voice=clip delayMs=0
  68378 tv    hush
  68378 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  68378 tv    speak        text=b15.wav voice=clip delayMs=0
  68487 tv    hush
  68487 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  68487 tv    speak        text=b11.wav voice=clip delayMs=0
  68613 tv    hush
  68613 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  68613 tv    speak        text=g57.wav voice=clip delayMs=0
  68805 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  69235 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  69512 tv    hush
  69513 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  69513 tv    hush
  71386 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  74869 tv    music:duck   ms=9000
  74869 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  79676 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  80004 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81006 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82005 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82999 tv    hush
  82999 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  82999 tv    speak        text=g57.wav voice=clip delayMs=0
  83190 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  85312 tv    ss:cancel    speaking=false pending=false
  85312 tv    music:plan   from=game:bingo to=null
  85315 tv    ss:cancel    speaking=false pending=false
  85315 tv    music:plan   from=null to=lobby
  85315 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  86117 tv    music:stop   track=wallpaper.mp3
  87823 tv    ss:cancel    speaking=false pending=false
  87833 tv    music:plan   from=lobby to=game:bingo
  87833 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  87833 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  87836 tv    hush
  87837 tv    hush
  88448 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  88452 tv    hush
  88452 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  88452 tv    speak        text=i21.wav voice=clip delayMs=0
  88452 tv    hush
  88458 tv    hush
  88458 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  88458 tv    speak        text=n32.wav voice=clip delayMs=0
  88545 tv    hush
  88545 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  88545 tv    speak        text=i18.wav voice=clip delayMs=0
  88634 tv    music:stop   track=bossa-antigua.mp3
  88640 tv    hush
  88640 tv    clip         src=n40.wav muted=false ready=true delayMs=0
  88640 tv    speak        text=n40.wav voice=clip delayMs=0
  88733 tv    hush
  88733 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  88733 tv    speak        text=i30.wav voice=clip delayMs=0
  88826 tv    hush
  88826 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  88826 tv    speak        text=o69.wav voice=clip delayMs=0
  88921 tv    hush
  88921 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  88921 tv    speak        text=o61.wav voice=clip delayMs=0
  89016 tv    hush
  89016 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  89016 tv    speak        text=n34.wav voice=clip delayMs=0
  89094 tv    hush
  89094 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  89094 tv    speak        text=n35.wav voice=clip delayMs=0
  89189 tv    hush
  89189 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  89189 tv    speak        text=o67.wav voice=clip delayMs=0
  89297 tv    hush
  89298 tv    clip         src=g55.wav muted=false ready=true delayMs=0
  89298 tv    speak        text=g55.wav voice=clip delayMs=0
  89390 tv    hush
  89390 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  89390 tv    speak        text=i26.wav voice=clip delayMs=0
  89484 tv    hush
  89484 tv    clip         src=i22.wav muted=false ready=true delayMs=0
  89484 tv    speak        text=i22.wav voice=clip delayMs=0
  89577 tv    hush
  89577 tv    clip         src=i29.wav muted=false ready=true delayMs=0
  89577 tv    speak        text=i29.wav voice=clip delayMs=0
  89671 tv    hush
  89671 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  89671 tv    speak        text=o66.wav voice=clip delayMs=0
  89764 tv    hush
  89764 tv    clip         src=g51.wav muted=false ready=true delayMs=0
  89764 tv    speak        text=g51.wav voice=clip delayMs=0
  89861 tv    hush
  89861 tv    clip         src=g53.wav muted=false ready=true delayMs=0
  89861 tv    speak        text=g53.wav voice=clip delayMs=0
  89953 tv    hush
  89953 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  89953 tv    speak        text=b9.wav voice=clip delayMs=0
  90047 tv    hush
  90048 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  90048 tv    speak        text=n36.wav voice=clip delayMs=0
  90141 tv    hush
  90141 tv    clip         src=g52.wav muted=false ready=true delayMs=0
  90141 tv    speak        text=g52.wav voice=clip delayMs=0
  90237 tv    hush
  90237 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  90237 tv    speak        text=b1.wav voice=clip delayMs=0
  90331 tv    hush
  90331 tv    clip         src=b13.wav muted=false ready=true delayMs=0
  90331 tv    speak        text=b13.wav voice=clip delayMs=0
  90425 tv    hush
  90425 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  90425 tv    speak        text=n37.wav voice=clip delayMs=0
  90519 tv    hush
  90519 tv    clip         src=o71.wav muted=false ready=true delayMs=0
  90519 tv    speak        text=o71.wav voice=clip delayMs=0
  90617 tv    hush
  90617 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  90617 tv    speak        text=b8.wav voice=clip delayMs=0
  90706 tv    hush
  90706 tv    clip         src=b5.wav muted=false ready=true delayMs=0
  90706 tv    speak        text=b5.wav voice=clip delayMs=0
  90797 tv    hush
  90797 tv    clip         src=b7.wav muted=false ready=true delayMs=0
  90797 tv    speak        text=b7.wav voice=clip delayMs=0
  90893 tv    hush
  90893 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  90893 tv    speak        text=n42.wav voice=clip delayMs=0
  90989 tv    hush
  90989 tv    clip         src=i28.wav muted=false ready=true delayMs=0
  90989 tv    speak        text=i28.wav voice=clip delayMs=0
  91098 tv    hush
  91098 tv    clip         src=i27.wav muted=false ready=true delayMs=0
  91098 tv    speak        text=i27.wav voice=clip delayMs=0
  91189 tv    hush
  91189 tv    clip         src=o63.wav muted=false ready=true delayMs=0
  91189 tv    speak        text=o63.wav voice=clip delayMs=0
  91283 tv    hush
  91283 tv    clip         src=o64.wav muted=false ready=true delayMs=0
  91283 tv    speak        text=o64.wav voice=clip delayMs=0
  91378 tv    hush
  91378 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  91378 tv    speak        text=o73.wav voice=clip delayMs=0
  91457 tv    hush
  91457 tv    clip         src=g50.wav muted=false ready=true delayMs=0
  91457 tv    speak        text=g50.wav voice=clip delayMs=0
  91549 tv    hush
  91549 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  91549 tv    speak        text=g48.wav voice=clip delayMs=0
  91643 tv    hush
  91643 tv    clip         src=b12.wav muted=false ready=true delayMs=0
  91643 tv    speak        text=b12.wav voice=clip delayMs=0
  91736 tv    hush
  91736 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  91736 tv    speak        text=n45.wav voice=clip delayMs=0
  91831 tv    hush
  91831 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  91831 tv    speak        text=b4.wav voice=clip delayMs=0
  91924 tv    hush
  91924 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  91924 tv    speak        text=g46.wav voice=clip delayMs=0
  92019 tv    hush
  92019 tv    clip         src=o74.wav muted=false ready=true delayMs=0
  92019 tv    speak        text=o74.wav voice=clip delayMs=0
  92113 tv    hush
  92113 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  92113 tv    speak        text=g47.wav voice=clip delayMs=0
  92209 tv    hush
  92209 tv    clip         src=n31.wav muted=false ready=true delayMs=0
  92209 tv    speak        text=n31.wav voice=clip delayMs=0
  92303 tv    hush
  92303 tv    clip         src=o62.wav muted=false ready=true delayMs=0
  92303 tv    speak        text=o62.wav voice=clip delayMs=0
  92399 tv    hush
  92399 tv    clip         src=b10.wav muted=false ready=true delayMs=0
  92399 tv    speak        text=b10.wav voice=clip delayMs=0
  92479 tv    hush
  92479 tv    clip         src=g60.wav muted=false ready=true delayMs=0
  92479 tv    speak        text=g60.wav voice=clip delayMs=0
  92587 tv    hush
  92587 tv    clip         src=n38.wav muted=false ready=true delayMs=0
  92587 tv    speak        text=n38.wav voice=clip delayMs=0
  92681 tv    hush
  92681 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  92681 tv    speak        text=n39.wav voice=clip delayMs=0
  92760 tv    hush
  92760 tv    clip         src=o70.wav muted=false ready=true delayMs=0
  92760 tv    speak        text=o70.wav voice=clip delayMs=0
  92854 tv    hush
  92854 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  92854 tv    speak        text=b11.wav voice=clip delayMs=0
  92948 tv    hush
  92948 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  92948 tv    speak        text=o75.wav voice=clip delayMs=0
  93042 tv    hush
  93042 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  93042 tv    speak        text=g58.wav voice=clip delayMs=0
  93138 tv    hush
  93138 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  93138 tv    speak        text=b15.wav voice=clip delayMs=0
  93231 tv    hush
  93231 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  93231 tv    speak        text=i24.wav voice=clip delayMs=0
  93327 tv    hush
  93327 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  93327 tv    speak        text=o72.wav voice=clip delayMs=0
  93419 tv    hush
  93419 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  93419 tv    speak        text=g56.wav voice=clip delayMs=0
  93514 tv    hush
  93514 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  93514 tv    speak        text=i20.wav voice=clip delayMs=0
  93608 tv    hush
  93608 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  93608 tv    speak        text=n44.wav voice=clip delayMs=0
  93701 tv    hush
  93701 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  93701 tv    speak        text=b3.wav voice=clip delayMs=0
  93795 tv    hush
  93795 tv    clip         src=o68.wav muted=false ready=true delayMs=0
  93795 tv    speak        text=o68.wav voice=clip delayMs=0
  93890 tv    hush
  93890 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  93890 tv    speak        text=b2.wav voice=clip delayMs=0
  93984 tv    hush
  93984 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  93984 tv    speak        text=n41.wav voice=clip delayMs=0
  94077 tv    hush
  94077 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  94077 tv    speak        text=o65.wav voice=clip delayMs=0
  94155 tv    hush
  94155 tv    clip         src=i17.wav muted=false ready=true delayMs=0
  94155 tv    speak        text=i17.wav voice=clip delayMs=0
  94265 tv    hush
  94265 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  94265 tv    speak        text=i25.wav voice=clip delayMs=0
  94372 tv    hush
  94372 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  94372 tv    speak        text=i19.wav voice=clip delayMs=0
  94468 tv    hush
  94468 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  94468 tv    speak        text=g57.wav voice=clip delayMs=0
  94545 tv    hush
  94545 tv    clip         src=g59.wav muted=false ready=true delayMs=0
  94545 tv    speak        text=g59.wav voice=clip delayMs=0
  94736 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  95766 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  96021 tv    hush
  96021 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  96021 tv    hush
 103630 tv    music:duck   ms=9000
 103630 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108650 tv    hush
 108650 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108651 tv    hush
 112653 tv    ss:cancel    speaking=false pending=false
 112653 tv    music:plan   from=game:bingo to=null
 112653 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 114164 tv    music:stop   track=cool-vibes.mp3
 114281 tv    ss:cancel    speaking=false pending=false
 114281 tv    music:plan   from=null to=lobby
 114281 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 116810 tv    ss:cancel    speaking=false pending=false
 116831 tv    music:plan   from=lobby to=game:bingo
 116831 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116832 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116838 tv    hush
 116838 tv    hush
 117425 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 117431 tv    hush
 117431 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 117431 tv    speak        text=i21.wav voice=clip delayMs=0
 117432 tv    hush
 117444 tv    hush
 117444 tv    clip         src=n32.wav muted=false ready=true delayMs=0
 117444 tv    speak        text=n32.wav voice=clip delayMs=0
 117553 tv    hush
 117553 tv    clip         src=i18.wav muted=false ready=true delayMs=0
 117553 tv    speak        text=i18.wav voice=clip delayMs=0
 117638 tv    music:stop   track=george-street-shuffle.mp3
 117649 tv    hush
 117649 tv    clip         src=n40.wav muted=false ready=true delayMs=0
 117649 tv    speak        text=n40.wav voice=clip delayMs=0
 117742 tv    hush
 117742 tv    clip         src=i30.wav muted=false ready=true delayMs=0
 117742 tv    speak        text=i30.wav voice=clip delayMs=0
 117853 tv    hush
 117853 tv    clip         src=o69.wav muted=false ready=true delayMs=0
 117853 tv    speak        text=o69.wav voice=clip delayMs=0
 117959 tv    hush
 117959 tv    clip         src=o61.wav muted=false ready=true delayMs=0
 117959 tv    speak        text=o61.wav voice=clip delayMs=0
 118037 tv    hush
 118037 tv    clip         src=n34.wav muted=false ready=true delayMs=0
 118037 tv    speak        text=n34.wav voice=clip delayMs=0
 118120 tv    hush
 118121 tv    clip         src=n35.wav muted=false ready=true delayMs=0
 118121 tv    speak        text=n35.wav voice=clip delayMs=0
 118214 tv    hush
 118214 tv    clip         src=o67.wav muted=false ready=true delayMs=0
 118214 tv    speak        text=o67.wav voice=clip delayMs=0
 118321 tv    hush
 118321 tv    clip         src=g55.wav muted=false ready=true delayMs=0
 118321 tv    speak        text=g55.wav voice=clip delayMs=0
 118417 tv    hush
 118417 tv    clip         src=i26.wav muted=false ready=true delayMs=0
 118417 tv    speak        text=i26.wav voice=clip delayMs=0
 118512 tv    hush
 118512 tv    clip         src=i22.wav muted=false ready=true delayMs=0
 118512 tv    speak        text=i22.wav voice=clip delayMs=0
 118621 tv    hush
 118621 tv    clip         src=i29.wav muted=false ready=true delayMs=0
 118621 tv    speak        text=i29.wav voice=clip delayMs=0
 118717 tv    hush
 118717 tv    clip         src=o66.wav muted=false ready=true delayMs=0
 118717 tv    speak        text=o66.wav voice=clip delayMs=0
 118810 tv    hush
 118810 tv    clip         src=g51.wav muted=false ready=true delayMs=0
 118810 tv    speak        text=g51.wav voice=clip delayMs=0
 118906 tv    hush
 118906 tv    clip         src=g53.wav muted=false ready=true delayMs=0
 118906 tv    speak        text=g53.wav voice=clip delayMs=0
 119001 tv    hush
 119001 tv    clip         src=b9.wav muted=false ready=true delayMs=0
 119001 tv    speak        text=b9.wav voice=clip delayMs=0
 119093 tv    hush
 119093 tv    clip         src=n36.wav muted=false ready=true delayMs=0
 119093 tv    speak        text=n36.wav voice=clip delayMs=0
 119187 tv    hush
 119187 tv    clip         src=g52.wav muted=false ready=true delayMs=0
 119187 tv    speak        text=g52.wav voice=clip delayMs=0
 119281 tv    hush
 119281 tv    clip         src=b1.wav muted=false ready=true delayMs=0
 119281 tv    speak        text=b1.wav voice=clip delayMs=0
 119391 tv    hush
 119391 tv    clip         src=b13.wav muted=false ready=true delayMs=0
 119391 tv    speak        text=b13.wav voice=clip delayMs=0
 119486 tv    hush
 119486 tv    clip         src=n37.wav muted=false ready=true delayMs=0
 119486 tv    speak        text=n37.wav voice=clip delayMs=0
 119579 tv    hush
 119579 tv    clip         src=o71.wav muted=false ready=true delayMs=0
 119579 tv    speak        text=o71.wav voice=clip delayMs=0
 119673 tv    hush
 119673 tv    clip         src=b8.wav muted=false ready=true delayMs=0
 119673 tv    speak        text=b8.wav voice=clip delayMs=0
 119768 tv    hush
 119768 tv    clip         src=b5.wav muted=false ready=true delayMs=0
 119768 tv    speak        text=b5.wav voice=clip delayMs=0
 119865 tv    hush
 119865 tv    clip         src=b7.wav muted=false ready=true delayMs=0
 119865 tv    speak        text=b7.wav voice=clip delayMs=0
 119958 tv    hush
 119959 tv    clip         src=n42.wav muted=false ready=true delayMs=0
 119959 tv    speak        text=n42.wav voice=clip delayMs=0
 120053 tv    hush
 120053 tv    clip         src=i28.wav muted=false ready=true delayMs=0
 120053 tv    speak        text=i28.wav voice=clip delayMs=0
 120163 tv    hush
 120163 tv    clip         src=i27.wav muted=false ready=true delayMs=0
 120163 tv    speak        text=i27.wav voice=clip delayMs=0
 120259 tv    hush
 120259 tv    clip         src=o63.wav muted=false ready=true delayMs=0
 120259 tv    speak        text=o63.wav voice=clip delayMs=0
 120350 tv    hush
 120350 tv    clip         src=o64.wav muted=false ready=true delayMs=0
 120350 tv    speak        text=o64.wav voice=clip delayMs=0
 120446 tv    hush
 120446 tv    clip         src=o73.wav muted=false ready=true delayMs=0
 120446 tv    speak        text=o73.wav voice=clip delayMs=0
 120556 tv    hush
 120556 tv    clip         src=g50.wav muted=false ready=true delayMs=0
 120556 tv    speak        text=g50.wav voice=clip delayMs=0
 120651 tv    hush
 120651 tv    clip         src=g48.wav muted=false ready=true delayMs=0
 120651 tv    speak        text=g48.wav voice=clip delayMs=0
 120745 tv    hush
 120745 tv    clip         src=b12.wav muted=false ready=true delayMs=0
 120745 tv    speak        text=b12.wav voice=clip delayMs=0
 120839 tv    hush
 120839 tv    clip         src=n45.wav muted=false ready=true delayMs=0
 120839 tv    speak        text=n45.wav voice=clip delayMs=0
 120933 tv    hush
 120933 tv    clip         src=b4.wav muted=false ready=true delayMs=0
 120933 tv    speak        text=b4.wav voice=clip delayMs=0
 121042 tv    hush
 121042 tv    clip         src=g46.wav muted=false ready=true delayMs=0
 121042 tv    speak        text=g46.wav voice=clip delayMs=0
 121152 tv    hush
 121152 tv    clip         src=o74.wav muted=false ready=true delayMs=0
 121152 tv    speak        text=o74.wav voice=clip delayMs=0
 121263 tv    hush
 121263 tv    clip         src=g47.wav muted=false ready=true delayMs=0
 121263 tv    speak        text=g47.wav voice=clip delayMs=0
 121356 tv    hush
 121356 tv    clip         src=n31.wav muted=false ready=true delayMs=0
 121356 tv    speak        text=n31.wav voice=clip delayMs=0
 121465 tv    hush
 121465 tv    clip         src=o62.wav muted=false ready=true delayMs=0
 121465 tv    speak        text=o62.wav voice=clip delayMs=0
 121574 tv    hush
 121574 tv    clip         src=b10.wav muted=false ready=true delayMs=0
 121574 tv    speak        text=b10.wav voice=clip delayMs=0
 121670 tv    hush
 121670 tv    clip         src=g60.wav muted=false ready=true delayMs=0
 121670 tv    speak        text=g60.wav voice=clip delayMs=0
 121764 tv    hush
 121764 tv    clip         src=n38.wav muted=false ready=true delayMs=0
 121764 tv    speak        text=n38.wav voice=clip delayMs=0
 121873 tv    hush
 121873 tv    clip         src=n39.wav muted=false ready=true delayMs=0
 121873 tv    speak        text=n39.wav voice=clip delayMs=0
 121970 tv    hush
 121970 tv    clip         src=o70.wav muted=false ready=true delayMs=0
 121970 tv    speak        text=o70.wav voice=clip delayMs=0
 122044 tv    hush
 122044 tv    clip         src=b11.wav muted=false ready=true delayMs=0
 122044 tv    speak        text=b11.wav voice=clip delayMs=0
 122140 tv    hush
 122140 tv    clip         src=o75.wav muted=false ready=true delayMs=0
 122140 tv    speak        text=o75.wav voice=clip delayMs=0
 122217 tv    hush
 122217 tv    clip         src=g58.wav muted=false ready=true delayMs=0
 122217 tv    speak        text=g58.wav voice=clip delayMs=0
 122314 tv    hush
 122314 tv    clip         src=b15.wav muted=false ready=true delayMs=0
 122314 tv    speak        text=b15.wav voice=clip delayMs=0
 122408 tv    hush
 122408 tv    clip         src=i24.wav muted=false ready=true delayMs=0
 122408 tv    speak        text=i24.wav voice=clip delayMs=0
 122517 tv    hush
 122517 tv    clip         src=o72.wav muted=false ready=true delayMs=0
 122517 tv    speak        text=o72.wav voice=clip delayMs=0
 122625 tv    hush
 122625 tv    clip         src=g56.wav muted=false ready=true delayMs=0
 122625 tv    speak        text=g56.wav voice=clip delayMs=0
 122705 tv    hush
 122705 tv    clip         src=i20.wav muted=false ready=true delayMs=0
 122705 tv    speak        text=i20.wav voice=clip delayMs=0
 122813 tv    hush
 122813 tv    clip         src=n44.wav muted=false ready=true delayMs=0
 122813 tv    speak        text=n44.wav voice=clip delayMs=0
 122905 tv    hush
 122905 tv    clip         src=b3.wav muted=false ready=true delayMs=0
 122905 tv    speak        text=b3.wav voice=clip delayMs=0
 122999 tv    hush
 122999 tv    clip         src=o68.wav muted=false ready=true delayMs=0
 122999 tv    speak        text=o68.wav voice=clip delayMs=0
 123095 tv    hush
 123095 tv    clip         src=b2.wav muted=false ready=true delayMs=0
 123095 tv    speak        text=b2.wav voice=clip delayMs=0
 123203 tv    hush
 123203 tv    clip         src=n41.wav muted=false ready=true delayMs=0
 123203 tv    speak        text=n41.wav voice=clip delayMs=0
 123315 tv    hush
 123315 tv    clip         src=o65.wav muted=false ready=true delayMs=0
 123315 tv    speak        text=o65.wav voice=clip delayMs=0
 123407 tv    hush
 123407 tv    clip         src=i17.wav muted=false ready=true delayMs=0
 123407 tv    speak        text=i17.wav voice=clip delayMs=0
 123502 tv    hush
 123502 tv    clip         src=i25.wav muted=false ready=true delayMs=0
 123502 tv    speak        text=i25.wav voice=clip delayMs=0
 123599 tv    hush
 123599 tv    clip         src=i19.wav muted=false ready=true delayMs=0
 123599 tv    speak        text=i19.wav voice=clip delayMs=0
 123707 tv    hush
 123707 tv    clip         src=g57.wav muted=false ready=true delayMs=0
 123707 tv    speak        text=g57.wav voice=clip delayMs=0
 123801 tv    hush
 123801 tv    clip         src=g59.wav muted=false ready=true delayMs=0
 123801 tv    speak        text=g59.wav voice=clip delayMs=0
 123996 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 125155 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 125428 tv    hush
 125428 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 125429 tv    hush
 133037 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 133054 tv    music:duck   ms=9000
 133054 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 138050 tv    hush
 138051 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 138051 tv    hush
 139632 tv    ss:cancel    speaking=false pending=false
 139632 tv    music:plan   from=game:bingo to=null
 139637 tv    ss:cancel    speaking=false pending=false
 139637 tv    music:plan   from=null to=lobby
 139637 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 140449 tv    music:stop   track=wallpaper.mp3
 142150 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 142170 tv    ss:cancel    speaking=false pending=false
 142174 tv    music:plan   from=lobby to=game:bingo
 142174 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 142174 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 142183 tv    hush
 142184 tv    hush
 142835 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 142977 tv    music:stop   track=bossa-antigua.mp3
 143410 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
 144335 tv    ss:cancel    speaking=false pending=false
 144335 tv    music:plan   from=game:bingo to=null
 144335 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 145847 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 146530 tv    ss:cancel    speaking=false pending=false
 146531 tv    music:plan   from=null to=lobby
 146531 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 149907 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 149928 tv    ss:cancel    speaking=false pending=false
 149931 tv    music:plan   from=lobby to=game:bingo
 149931 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 149931 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149938 tv    hush
 149939 tv    hush
 150348 tv    cue          cue=lock surface=tv muted=false ready=true semitones=8
 150354 tv    hush
 150354 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 150354 tv    speak        text=i21.wav voice=clip delayMs=0
 150355 tv    hush
 150556 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 150734 tv    music:stop   track=airport-lounge.mp3
 150848 tv    ss:cancel    speaking=false pending=false
 150848 tv    music:plan   from=game:bingo to=null
 150856 tv    ss:cancel    speaking=false pending=false
 150857 tv    music:plan   from=null to=lobby
 150857 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 151659 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, the lobby track only fading out, the warm bed under the intro** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.06,"t":10.4}] bed=warm
- ✅ **the writing track eases in (under 0.2 a third of a second in), never a hard start** — playing=[{"track":"local-forecast-elevator.mp3","vol":0.04,"t":10.8},{"track":"sneaky-snitch.mp3","vol":0.08,"t":0.3}]
- ✅ **answer → one Wisecrack track at 0.2 × its trim while everyone writes, the bed gone** — playing=[{"track":"sneaky-snitch.mp3","vol":0.2,"t":2.4}] bed=null
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **vote → the marimba bed (the first prompt), the track fading out** — bed=marimba playing=[]
- ✅ **reveal keeps the vote’s bed (same list, same turn: no crossfade on the cut)** — bed=marimba playing=[]
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal
- ✅ **scores phase → tally ping (mapped), the lounge bed** — cues=phase,reveal,phase,reveal,tally bed=lounge

```
 156486 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156919 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157351 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157786 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158217 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 159467 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 160096 tv    ss:cancel    speaking=false pending=false
 160105 tv    music:plan   from=lobby to=null
 160105 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 161381 tv    music:plan   from=null to=game:wisecrack
 161381 tv    music:start  plan=game:wisecrack track=sneaky-snitch mode=chain volume=0.2
 161381 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 162182 tv    music:stop   track=local-forecast-elevator.mp3
 164888 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 166223 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 167555 tv    music:plan   from=game:wisecrack to=null
 167557 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 167557 tv    bed:duck     bed=marimba cue=phase
 168655 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 168655 tv    bed:duck     bed=marimba cue=reveal
 169065 tv    music:stop   track=sneaky-snitch.mp3
 172313 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 172313 tv    bed:duck     bed=lofi cue=phase
 172500 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 172500 tv    bed:duck     bed=lofi cue=reveal
 172689 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 172689 tv    bed:duck     bed=marimba cue=phase
 172876 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 172876 tv    bed:duck     bed=marimba cue=reveal
 173067 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 173067 tv    bed:duck     bed=lounge cue=tally
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"lobby-time.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 174229 tv    ss:cancel    speaking=false pending=false
 174234 tv    ss:cancel    speaking=false pending=false
 174234 tv    music:plan   from=null to=lobby
 174234 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 176250 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 176267 tv    ss:cancel    speaking=false pending=false
 176270 tv    music:plan   from=lobby to=null
 176270 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 177772 tv    music:stop   track=airport-lounge.mp3
 177851 tv    music:plan   from=null to=game:broken-pencil
 177851 tv    music:start  plan=game:broken-pencil track=lobby-time mode=chain volume=0.2
 177851 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 179331 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 179801 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 179957 tv    music:plan   from=game:broken-pencil to=null
 179957 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 181464 tv    music:stop   track=lobby-time.mp3
```
