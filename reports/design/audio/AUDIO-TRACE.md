# Audio interaction trace

Captured 2026-09-19T05:53:45.196Z on port 42112. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**73 / 73 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:george-street-shuffle
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":4.4}]

```
   1763 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   1794 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3121 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3275 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3972 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4608 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5462 tv    ss:cancel    speaking=false pending=false
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
   6312 tv    music:plan   from=lobby to=null
   6312 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7813 tv    music:stop   track=george-street-shuffle.mp3
   8270 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   8270 tv    bed:duck     bed=pulse cue=phase
   9566 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16526 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17527 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18525 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19525 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20524 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21320 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  21320 tv    bed:duck     bed=pulse cue=reveal
  22107 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22107 tv    bed:duck     bed=pulse cue=phase
  22248 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22248 tv    bed:duck     bed=pulse cue=reveal
  22405 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22405 tv    bed:duck     bed=pulse cue=phase
  22560 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22560 tv    bed:duck     bed=pulse cue=reveal
  22718 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22718 tv    bed:duck     bed=pulse cue=phase
  22876 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22876 tv    bed:duck     bed=pulse cue=reveal
  23031 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23031 tv    bed:duck     bed=pulse cue=phase
  23188 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23188 tv    bed:duck     bed=pulse cue=reveal
  23346 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23346 tv    bed:duck     bed=pulse cue=phase
  23504 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23504 tv    bed:duck     bed=pulse cue=reveal
  23663 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23663 tv    bed:duck     bed=pulse cue=phase
  23819 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23819 tv    bed:duck     bed=pulse cue=reveal
  23977 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23977 tv    bed:duck     bed=pulse cue=phase
  24131 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24131 tv    bed:duck     bed=pulse cue=reveal
  24274 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24274 tv    bed:duck     bed=pulse cue=phase
  24431 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24431 tv    bed:duck     bed=pulse cue=reveal
  24590 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24590 tv    bed:duck     bed=pulse cue=phase
  24749 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24749 tv    bed:duck     bed=pulse cue=reveal
  24894 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  24894 tv    bed:duck     bed=latenight cue=wager
  25769 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  25769 tv    bed:duck     bed=pulse cue=phase
  26104 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  26104 tv    bed:duck     bed=pulse cue=silence
  27909 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  27909 tv    bed:duck     bed=pulse cue=bust
  29634 tv    ss:cancel    speaking=false pending=false
  29634 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":1.5}]

```
  31206 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33364 tv    ss:cancel    speaking=false pending=false
  33365 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34926 tv    ss:cancel    speaking=false pending=false
  34926 tv    music:plan   from=null to=lobby
  34926 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:local-forecast-elevator.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime** — cues=start,card,lock,lock,tick,tick,tick,call
- ✅ **the hand feels each card land (one 12 ms tap per card) and then the first call** — taps(12)=2 (1 card + the first call)
- ✅ **each Ready ticks (lock, rising); the 3 · 2 · 1's first tick comes a breath (≥ 300 ms) after the last** — locks=2 last lock→first tick=424ms
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+1027ms phone@+1042ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "another" is a 20 ms tap and one card pluck; Ready a 20 ms tap and the submit cue** — taps=3 cues=card,submit
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **each voice starts on the push (no delay); its boing lands on the squash, 170–230 ms later** — delays=0,0 boing lags=207,193ms
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18.9}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":25.8}]
- ✅ **skipping through the deck: a hush before every call, one voice at a time** — clips=41 hushes=41
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5359ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":40.3}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,close,daub,claim,correct
- ✅ **one 'close' between the penultimate and the last daub (one square to go), once for the card** — phone cues=daub,daub,close,daub,claim,correct
- ✅ **the winner's celebration buzz (320 ms) runs whole — nothing shorter cuts it** — celebration@74588 cut by=[]
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5391ms cheer@+5373ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36520 tv    music:plan   from=lobby to=game:bingo
  36520 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36520 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36830 tv    hush
  36831 tv    hush
  37325 tv    music:stop   track=local-forecast-elevator.mp3
  37484 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  39604 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  40118 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
  40542 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41536 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  42542 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  43514 tv    hush
  43514 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  43514 tv    speak        text=b9.wav voice=clip delayMs=0
  43515 tv    hush
  43707 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44068 tv    hush
  44068 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  44068 tv    speak        text=b8.wav voice=clip delayMs=0
  44275 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45892 tv    hush
  45892 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  45892 tv    speak        text=n34.wav voice=clip delayMs=0
  46085 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  47787 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  48057 tv    hush
  48057 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  48058 tv    hush
  53420 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  56423 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57425 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58424 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  59415 tv    hush
  59415 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  59415 tv    speak        text=n35.wav voice=clip delayMs=0
  59606 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61216 tv    music:paused paused=true
  61216 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  62454 tv    music:paused paused=false
  62454 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  63778 tv    hush
  63778 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  63778 tv    speak        text=i25.wav voice=clip delayMs=0
  63904 tv    hush
  63904 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  63904 tv    speak        text=n45.wav voice=clip delayMs=0
  64029 tv    hush
  64029 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  64029 tv    speak        text=n33.wav voice=clip delayMs=0
  64155 tv    hush
  64155 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  64155 tv    speak        text=g49.wav voice=clip delayMs=0
  64281 tv    hush
  64281 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  64281 tv    speak        text=b4.wav voice=clip delayMs=0
  64408 tv    hush
  64408 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  64408 tv    speak        text=i20.wav voice=clip delayMs=0
  64534 tv    hush
  64534 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  64534 tv    speak        text=o69.wav voice=clip delayMs=0
  64660 tv    hush
  64660 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  64660 tv    speak        text=o67.wav voice=clip delayMs=0
  64785 tv    hush
  64785 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  64785 tv    speak        text=o65.wav voice=clip delayMs=0
  64882 tv    hush
  64882 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  64882 tv    speak        text=o73.wav voice=clip delayMs=0
  65006 tv    hush
  65006 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  65006 tv    speak        text=i21.wav voice=clip delayMs=0
  65132 tv    hush
  65132 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  65132 tv    speak        text=i18.wav voice=clip delayMs=0
  65257 tv    hush
  65257 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  65257 tv    speak        text=g58.wav voice=clip delayMs=0
  65384 tv    hush
  65384 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  65384 tv    speak        text=n36.wav voice=clip delayMs=0
  65511 tv    hush
  65511 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  65511 tv    speak        text=o61.wav voice=clip delayMs=0
  65636 tv    hush
  65636 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  65636 tv    speak        text=n37.wav voice=clip delayMs=0
  65764 tv    hush
  65764 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  65764 tv    speak        text=i16.wav voice=clip delayMs=0
  65890 tv    hush
  65890 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  65890 tv    speak        text=g47.wav voice=clip delayMs=0
  66014 tv    hush
  66014 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  66014 tv    speak        text=n41.wav voice=clip delayMs=0
  66142 tv    hush
  66142 tv    clip         src=b6.wav muted=false ready=true delayMs=0
  66142 tv    speak        text=b6.wav voice=clip delayMs=0
  66266 tv    hush
  66266 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  66266 tv    speak        text=o72.wav voice=clip delayMs=0
  66392 tv    hush
  66392 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  66392 tv    speak        text=b3.wav voice=clip delayMs=0
  66518 tv    hush
  66518 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  66518 tv    speak        text=i30.wav voice=clip delayMs=0
  66629 tv    hush
  66629 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  66629 tv    speak        text=g56.wav voice=clip delayMs=0
  66758 tv    hush
  66758 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  66758 tv    speak        text=o75.wav voice=clip delayMs=0
  66882 tv    hush
  66882 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  66882 tv    speak        text=b1.wav voice=clip delayMs=0
  67007 tv    hush
  67007 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  67007 tv    speak        text=b2.wav voice=clip delayMs=0
  67132 tv    hush
  67132 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  67132 tv    speak        text=n32.wav voice=clip delayMs=0
  67258 tv    hush
  67258 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  67258 tv    speak        text=g48.wav voice=clip delayMs=0
  67383 tv    hush
  67383 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  67383 tv    speak        text=i23.wav voice=clip delayMs=0
  67509 tv    hush
  67509 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  67509 tv    speak        text=i26.wav voice=clip delayMs=0
  67634 tv    hush
  67634 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  67634 tv    speak        text=o66.wav voice=clip delayMs=0
  67761 tv    hush
  67761 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  67761 tv    speak        text=i19.wav voice=clip delayMs=0
  67885 tv    hush
  67885 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  67885 tv    speak        text=n42.wav voice=clip delayMs=0
  68014 tv    hush
  68014 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  68014 tv    speak        text=i24.wav voice=clip delayMs=0
  68138 tv    hush
  68138 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  68138 tv    speak        text=n39.wav voice=clip delayMs=0
  68262 tv    hush
  68262 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  68262 tv    speak        text=g46.wav voice=clip delayMs=0
  68388 tv    hush
  68388 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  68388 tv    speak        text=n44.wav voice=clip delayMs=0
  68513 tv    hush
  68513 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  68513 tv    speak        text=b15.wav voice=clip delayMs=0
  68639 tv    hush
  68639 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  68639 tv    speak        text=b11.wav voice=clip delayMs=0
  68768 tv    hush
  68768 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  68768 tv    speak        text=g57.wav voice=clip delayMs=0
  68962 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  69403 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  69687 tv    hush
  69688 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  69688 tv    hush
  71573 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  75046 tv    music:duck   ms=9000
  75046 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  79864 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  80199 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81203 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82206 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  83204 tv    hush
  83204 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  83204 tv    speak        text=g57.wav voice=clip delayMs=0
  83399 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  85512 tv    ss:cancel    speaking=false pending=false
  85512 tv    music:plan   from=game:bingo to=null
  85517 tv    ss:cancel    speaking=false pending=false
  85517 tv    music:plan   from=null to=lobby
  85517 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  86332 tv    music:stop   track=wallpaper.mp3
  88031 tv    ss:cancel    speaking=false pending=false
  88050 tv    music:plan   from=lobby to=game:bingo
  88050 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  88050 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  88055 tv    hush
  88056 tv    hush
  88651 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  88653 tv    hush
  88653 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  88653 tv    speak        text=i21.wav voice=clip delayMs=0
  88653 tv    hush
  88677 tv    hush
  88677 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  88677 tv    speak        text=n32.wav voice=clip delayMs=0
  88767 tv    hush
  88767 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  88767 tv    speak        text=i18.wav voice=clip delayMs=0
  88849 tv    hush
  88849 tv    clip         src=n40.wav muted=false ready=true delayMs=0
  88849 tv    speak        text=n40.wav voice=clip delayMs=0
  88852 tv    music:stop   track=george-street-shuffle.mp3
  88941 tv    hush
  88941 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  88941 tv    speak        text=i30.wav voice=clip delayMs=0
  89054 tv    hush
  89054 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  89054 tv    speak        text=o69.wav voice=clip delayMs=0
  89130 tv    hush
  89130 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  89130 tv    speak        text=o61.wav voice=clip delayMs=0
  89236 tv    hush
  89236 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  89236 tv    speak        text=n34.wav voice=clip delayMs=0
  89331 tv    hush
  89331 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  89331 tv    speak        text=n35.wav voice=clip delayMs=0
  89418 tv    hush
  89418 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  89418 tv    speak        text=o67.wav voice=clip delayMs=0
  89509 tv    hush
  89510 tv    clip         src=g55.wav muted=false ready=true delayMs=0
  89510 tv    speak        text=g55.wav voice=clip delayMs=0
  89615 tv    hush
  89615 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  89615 tv    speak        text=i26.wav voice=clip delayMs=0
  89695 tv    hush
  89695 tv    clip         src=i22.wav muted=false ready=true delayMs=0
  89695 tv    speak        text=i22.wav voice=clip delayMs=0
  89789 tv    hush
  89789 tv    clip         src=i29.wav muted=false ready=true delayMs=0
  89789 tv    speak        text=i29.wav voice=clip delayMs=0
  89869 tv    hush
  89869 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  89869 tv    speak        text=o66.wav voice=clip delayMs=0
  89981 tv    hush
  89981 tv    clip         src=g51.wav muted=false ready=true delayMs=0
  89981 tv    speak        text=g51.wav voice=clip delayMs=0
  90096 tv    hush
  90096 tv    clip         src=g53.wav muted=false ready=true delayMs=0
  90096 tv    speak        text=g53.wav voice=clip delayMs=0
  90194 tv    hush
  90194 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  90194 tv    speak        text=b9.wav voice=clip delayMs=0
  90293 tv    hush
  90293 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  90293 tv    speak        text=n36.wav voice=clip delayMs=0
  90390 tv    hush
  90390 tv    clip         src=g52.wav muted=false ready=true delayMs=0
  90390 tv    speak        text=g52.wav voice=clip delayMs=0
  90459 tv    hush
  90459 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  90459 tv    speak        text=b1.wav voice=clip delayMs=0
  90567 tv    hush
  90567 tv    clip         src=b13.wav muted=false ready=true delayMs=0
  90567 tv    speak        text=b13.wav voice=clip delayMs=0
  90664 tv    hush
  90664 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  90664 tv    speak        text=n37.wav voice=clip delayMs=0
  90747 tv    hush
  90747 tv    clip         src=o71.wav muted=false ready=true delayMs=0
  90747 tv    speak        text=o71.wav voice=clip delayMs=0
  90836 tv    hush
  90836 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  90836 tv    speak        text=b8.wav voice=clip delayMs=0
  90933 tv    hush
  90933 tv    clip         src=b5.wav muted=false ready=true delayMs=0
  90933 tv    speak        text=b5.wav voice=clip delayMs=0
  91053 tv    hush
  91053 tv    clip         src=b7.wav muted=false ready=true delayMs=0
  91053 tv    speak        text=b7.wav voice=clip delayMs=0
  91130 tv    hush
  91130 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  91130 tv    speak        text=n42.wav voice=clip delayMs=0
  91221 tv    hush
  91221 tv    clip         src=i28.wav muted=false ready=true delayMs=0
  91221 tv    speak        text=i28.wav voice=clip delayMs=0
  91333 tv    hush
  91333 tv    clip         src=i27.wav muted=false ready=true delayMs=0
  91333 tv    speak        text=i27.wav voice=clip delayMs=0
  91425 tv    hush
  91425 tv    clip         src=o63.wav muted=false ready=true delayMs=0
  91425 tv    speak        text=o63.wav voice=clip delayMs=0
  91520 tv    hush
  91520 tv    clip         src=o64.wav muted=false ready=true delayMs=0
  91520 tv    speak        text=o64.wav voice=clip delayMs=0
  91599 tv    hush
  91599 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  91599 tv    speak        text=o73.wav voice=clip delayMs=0
  91693 tv    hush
  91693 tv    clip         src=g50.wav muted=false ready=true delayMs=0
  91693 tv    speak        text=g50.wav voice=clip delayMs=0
  91788 tv    hush
  91788 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  91788 tv    speak        text=g48.wav voice=clip delayMs=0
  91884 tv    hush
  91884 tv    clip         src=b12.wav muted=false ready=true delayMs=0
  91884 tv    speak        text=b12.wav voice=clip delayMs=0
  91979 tv    hush
  91979 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  91979 tv    speak        text=n45.wav voice=clip delayMs=0
  92070 tv    hush
  92070 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  92070 tv    speak        text=b4.wav voice=clip delayMs=0
  92166 tv    hush
  92166 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  92166 tv    speak        text=g46.wav voice=clip delayMs=0
  92275 tv    hush
  92275 tv    clip         src=o74.wav muted=false ready=true delayMs=0
  92275 tv    speak        text=o74.wav voice=clip delayMs=0
  92370 tv    hush
  92370 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  92370 tv    speak        text=g47.wav voice=clip delayMs=0
  92463 tv    hush
  92463 tv    clip         src=n31.wav muted=false ready=true delayMs=0
  92463 tv    speak        text=n31.wav voice=clip delayMs=0
  92558 tv    hush
  92558 tv    clip         src=o62.wav muted=false ready=true delayMs=0
  92558 tv    speak        text=o62.wav voice=clip delayMs=0
  92655 tv    hush
  92655 tv    clip         src=b10.wav muted=false ready=true delayMs=0
  92655 tv    speak        text=b10.wav voice=clip delayMs=0
  92746 tv    hush
  92746 tv    clip         src=g60.wav muted=false ready=true delayMs=0
  92746 tv    speak        text=g60.wav voice=clip delayMs=0
  92841 tv    hush
  92841 tv    clip         src=n38.wav muted=false ready=true delayMs=0
  92841 tv    speak        text=n38.wav voice=clip delayMs=0
  92935 tv    hush
  92935 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  92935 tv    speak        text=n39.wav voice=clip delayMs=0
  93029 tv    hush
  93029 tv    clip         src=o70.wav muted=false ready=true delayMs=0
  93029 tv    speak        text=o70.wav voice=clip delayMs=0
  93124 tv    hush
  93124 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  93124 tv    speak        text=b11.wav voice=clip delayMs=0
  93219 tv    hush
  93219 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  93219 tv    speak        text=o75.wav voice=clip delayMs=0
  93300 tv    hush
  93300 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  93300 tv    speak        text=g58.wav voice=clip delayMs=0
  93411 tv    hush
  93411 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  93411 tv    speak        text=b15.wav voice=clip delayMs=0
  93504 tv    hush
  93504 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  93504 tv    speak        text=i24.wav voice=clip delayMs=0
  93598 tv    hush
  93598 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  93598 tv    speak        text=o72.wav voice=clip delayMs=0
  93709 tv    hush
  93709 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  93709 tv    speak        text=g56.wav voice=clip delayMs=0
  93804 tv    hush
  93804 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  93804 tv    speak        text=i20.wav voice=clip delayMs=0
  93897 tv    hush
  93897 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  93897 tv    speak        text=n44.wav voice=clip delayMs=0
  93991 tv    hush
  93991 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  93991 tv    speak        text=b3.wav voice=clip delayMs=0
  94086 tv    hush
  94086 tv    clip         src=o68.wav muted=false ready=true delayMs=0
  94086 tv    speak        text=o68.wav voice=clip delayMs=0
  94180 tv    hush
  94180 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  94180 tv    speak        text=b2.wav voice=clip delayMs=0
  94287 tv    hush
  94287 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  94287 tv    speak        text=n41.wav voice=clip delayMs=0
  94382 tv    hush
  94382 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  94382 tv    speak        text=o65.wav voice=clip delayMs=0
  94477 tv    hush
  94477 tv    clip         src=i17.wav muted=false ready=true delayMs=0
  94477 tv    speak        text=i17.wav voice=clip delayMs=0
  94571 tv    hush
  94571 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  94571 tv    speak        text=i25.wav voice=clip delayMs=0
  94665 tv    hush
  94665 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  94665 tv    speak        text=i19.wav voice=clip delayMs=0
  94760 tv    hush
  94760 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  94760 tv    speak        text=g57.wav voice=clip delayMs=0
  94854 tv    hush
  94854 tv    clip         src=g59.wav muted=false ready=true delayMs=0
  94854 tv    speak        text=g59.wav voice=clip delayMs=0
  95044 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  96067 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  96336 tv    hush
  96336 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  96336 tv    hush
 103944 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 103951 tv    music:duck   ms=9000
 103952 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108953 tv    hush
 108954 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108954 tv    hush
 112949 tv    ss:cancel    speaking=false pending=false
 112949 tv    music:plan   from=game:bingo to=null
 112949 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 114454 tv    music:stop   track=cool-vibes.mp3
 114576 tv    ss:cancel    speaking=false pending=false
 114576 tv    music:plan   from=null to=lobby
 114576 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 117101 tv    ss:cancel    speaking=false pending=false
 117119 tv    music:plan   from=lobby to=game:bingo
 117119 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 117119 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 117125 tv    hush
 117126 tv    hush
 117725 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 117729 tv    hush
 117729 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 117729 tv    speak        text=i21.wav voice=clip delayMs=0
 117730 tv    hush
 117741 tv    hush
 117741 tv    clip         src=n32.wav muted=false ready=true delayMs=0
 117741 tv    speak        text=n32.wav voice=clip delayMs=0
 117837 tv    hush
 117837 tv    clip         src=i18.wav muted=false ready=true delayMs=0
 117837 tv    speak        text=i18.wav voice=clip delayMs=0
 117922 tv    music:stop   track=bossa-antigua.mp3
 117931 tv    hush
 117931 tv    clip         src=n40.wav muted=false ready=true delayMs=0
 117931 tv    speak        text=n40.wav voice=clip delayMs=0
 118013 tv    hush
 118013 tv    clip         src=i30.wav muted=false ready=true delayMs=0
 118013 tv    speak        text=i30.wav voice=clip delayMs=0
 118120 tv    hush
 118120 tv    clip         src=o69.wav muted=false ready=true delayMs=0
 118120 tv    speak        text=o69.wav voice=clip delayMs=0
 118215 tv    hush
 118215 tv    clip         src=o61.wav muted=false ready=true delayMs=0
 118215 tv    speak        text=o61.wav voice=clip delayMs=0
 118312 tv    hush
 118312 tv    clip         src=n34.wav muted=false ready=true delayMs=0
 118312 tv    speak        text=n34.wav voice=clip delayMs=0
 118405 tv    hush
 118405 tv    clip         src=n35.wav muted=false ready=true delayMs=0
 118405 tv    speak        text=n35.wav voice=clip delayMs=0
 118513 tv    hush
 118513 tv    clip         src=o67.wav muted=false ready=true delayMs=0
 118513 tv    speak        text=o67.wav voice=clip delayMs=0
 118622 tv    hush
 118622 tv    clip         src=g55.wav muted=false ready=true delayMs=0
 118622 tv    speak        text=g55.wav voice=clip delayMs=0
 118718 tv    hush
 118718 tv    clip         src=i26.wav muted=false ready=true delayMs=0
 118718 tv    speak        text=i26.wav voice=clip delayMs=0
 118827 tv    hush
 118827 tv    clip         src=i22.wav muted=false ready=true delayMs=0
 118827 tv    speak        text=i22.wav voice=clip delayMs=0
 118921 tv    hush
 118921 tv    clip         src=i29.wav muted=false ready=true delayMs=0
 118921 tv    speak        text=i29.wav voice=clip delayMs=0
 119016 tv    hush
 119016 tv    clip         src=o66.wav muted=false ready=true delayMs=0
 119016 tv    speak        text=o66.wav voice=clip delayMs=0
 119123 tv    hush
 119123 tv    clip         src=g51.wav muted=false ready=true delayMs=0
 119123 tv    speak        text=g51.wav voice=clip delayMs=0
 119218 tv    hush
 119218 tv    clip         src=g53.wav muted=false ready=true delayMs=0
 119218 tv    speak        text=g53.wav voice=clip delayMs=0
 119298 tv    hush
 119298 tv    clip         src=b9.wav muted=false ready=true delayMs=0
 119298 tv    speak        text=b9.wav voice=clip delayMs=0
 119392 tv    hush
 119392 tv    clip         src=n36.wav muted=false ready=true delayMs=0
 119392 tv    speak        text=n36.wav voice=clip delayMs=0
 119486 tv    hush
 119486 tv    clip         src=g52.wav muted=false ready=true delayMs=0
 119486 tv    speak        text=g52.wav voice=clip delayMs=0
 119581 tv    hush
 119581 tv    clip         src=b1.wav muted=false ready=true delayMs=0
 119581 tv    speak        text=b1.wav voice=clip delayMs=0
 119661 tv    hush
 119661 tv    clip         src=b13.wav muted=false ready=true delayMs=0
 119661 tv    speak        text=b13.wav voice=clip delayMs=0
 119754 tv    hush
 119754 tv    clip         src=n37.wav muted=false ready=true delayMs=0
 119754 tv    speak        text=n37.wav voice=clip delayMs=0
 119848 tv    hush
 119848 tv    clip         src=o71.wav muted=false ready=true delayMs=0
 119848 tv    speak        text=o71.wav voice=clip delayMs=0
 119944 tv    hush
 119944 tv    clip         src=b8.wav muted=false ready=true delayMs=0
 119944 tv    speak        text=b8.wav voice=clip delayMs=0
 120052 tv    hush
 120052 tv    clip         src=b5.wav muted=false ready=true delayMs=0
 120052 tv    speak        text=b5.wav voice=clip delayMs=0
 120147 tv    hush
 120147 tv    clip         src=b7.wav muted=false ready=true delayMs=0
 120147 tv    speak        text=b7.wav voice=clip delayMs=0
 120243 tv    hush
 120243 tv    clip         src=n42.wav muted=false ready=true delayMs=0
 120243 tv    speak        text=n42.wav voice=clip delayMs=0
 120338 tv    hush
 120338 tv    clip         src=i28.wav muted=false ready=true delayMs=0
 120338 tv    speak        text=i28.wav voice=clip delayMs=0
 120431 tv    hush
 120431 tv    clip         src=i27.wav muted=false ready=true delayMs=0
 120431 tv    speak        text=i27.wav voice=clip delayMs=0
 120514 tv    hush
 120514 tv    clip         src=o63.wav muted=false ready=true delayMs=0
 120514 tv    speak        text=o63.wav voice=clip delayMs=0
 120622 tv    hush
 120622 tv    clip         src=o64.wav muted=false ready=true delayMs=0
 120622 tv    speak        text=o64.wav voice=clip delayMs=0
 120715 tv    hush
 120715 tv    clip         src=o73.wav muted=false ready=true delayMs=0
 120715 tv    speak        text=o73.wav voice=clip delayMs=0
 120780 tv    hush
 120780 tv    clip         src=g50.wav muted=false ready=true delayMs=0
 120780 tv    speak        text=g50.wav voice=clip delayMs=0
 120859 tv    hush
 120859 tv    clip         src=g48.wav muted=false ready=true delayMs=0
 120859 tv    speak        text=g48.wav voice=clip delayMs=0
 120951 tv    hush
 120951 tv    clip         src=b12.wav muted=false ready=true delayMs=0
 120951 tv    speak        text=b12.wav voice=clip delayMs=0
 121031 tv    hush
 121031 tv    clip         src=n45.wav muted=false ready=true delayMs=0
 121031 tv    speak        text=n45.wav voice=clip delayMs=0
 121139 tv    hush
 121139 tv    clip         src=b4.wav muted=false ready=true delayMs=0
 121139 tv    speak        text=b4.wav voice=clip delayMs=0
 121233 tv    hush
 121233 tv    clip         src=g46.wav muted=false ready=true delayMs=0
 121233 tv    speak        text=g46.wav voice=clip delayMs=0
 121345 tv    hush
 121345 tv    clip         src=o74.wav muted=false ready=true delayMs=0
 121345 tv    speak        text=o74.wav voice=clip delayMs=0
 121437 tv    hush
 121437 tv    clip         src=g47.wav muted=false ready=true delayMs=0
 121437 tv    speak        text=g47.wav voice=clip delayMs=0
 121531 tv    hush
 121531 tv    clip         src=n31.wav muted=false ready=true delayMs=0
 121531 tv    speak        text=n31.wav voice=clip delayMs=0
 121629 tv    hush
 121629 tv    clip         src=o62.wav muted=false ready=true delayMs=0
 121629 tv    speak        text=o62.wav voice=clip delayMs=0
 121735 tv    hush
 121735 tv    clip         src=b10.wav muted=false ready=true delayMs=0
 121735 tv    speak        text=b10.wav voice=clip delayMs=0
 121830 tv    hush
 121830 tv    clip         src=g60.wav muted=false ready=true delayMs=0
 121830 tv    speak        text=g60.wav voice=clip delayMs=0
 121926 tv    hush
 121926 tv    clip         src=n38.wav muted=false ready=true delayMs=0
 121926 tv    speak        text=n38.wav voice=clip delayMs=0
 122021 tv    hush
 122021 tv    clip         src=n39.wav muted=false ready=true delayMs=0
 122021 tv    speak        text=n39.wav voice=clip delayMs=0
 122115 tv    hush
 122115 tv    clip         src=o70.wav muted=false ready=true delayMs=0
 122115 tv    speak        text=o70.wav voice=clip delayMs=0
 122212 tv    hush
 122212 tv    clip         src=b11.wav muted=false ready=true delayMs=0
 122212 tv    speak        text=b11.wav voice=clip delayMs=0
 122300 tv    hush
 122300 tv    clip         src=o75.wav muted=false ready=true delayMs=0
 122300 tv    speak        text=o75.wav voice=clip delayMs=0
 122397 tv    hush
 122397 tv    clip         src=g58.wav muted=false ready=true delayMs=0
 122397 tv    speak        text=g58.wav voice=clip delayMs=0
 122493 tv    hush
 122493 tv    clip         src=b15.wav muted=false ready=true delayMs=0
 122493 tv    speak        text=b15.wav voice=clip delayMs=0
 122586 tv    hush
 122586 tv    clip         src=i24.wav muted=false ready=true delayMs=0
 122586 tv    speak        text=i24.wav voice=clip delayMs=0
 122650 tv    hush
 122650 tv    clip         src=o72.wav muted=false ready=true delayMs=0
 122650 tv    speak        text=o72.wav voice=clip delayMs=0
 122759 tv    hush
 122759 tv    clip         src=g56.wav muted=false ready=true delayMs=0
 122759 tv    speak        text=g56.wav voice=clip delayMs=0
 122862 tv    hush
 122862 tv    clip         src=i20.wav muted=false ready=true delayMs=0
 122862 tv    speak        text=i20.wav voice=clip delayMs=0
 122943 tv    hush
 122943 tv    clip         src=n44.wav muted=false ready=true delayMs=0
 122943 tv    speak        text=n44.wav voice=clip delayMs=0
 123027 tv    hush
 123027 tv    clip         src=b3.wav muted=false ready=true delayMs=0
 123027 tv    speak        text=b3.wav voice=clip delayMs=0
 123137 tv    hush
 123137 tv    clip         src=o68.wav muted=false ready=true delayMs=0
 123137 tv    speak        text=o68.wav voice=clip delayMs=0
 123232 tv    hush
 123232 tv    clip         src=b2.wav muted=false ready=true delayMs=0
 123232 tv    speak        text=b2.wav voice=clip delayMs=0
 123342 tv    hush
 123342 tv    clip         src=n41.wav muted=false ready=true delayMs=0
 123342 tv    speak        text=n41.wav voice=clip delayMs=0
 123434 tv    hush
 123434 tv    clip         src=o65.wav muted=false ready=true delayMs=0
 123434 tv    speak        text=o65.wav voice=clip delayMs=0
 123534 tv    hush
 123534 tv    clip         src=i17.wav muted=false ready=true delayMs=0
 123534 tv    speak        text=i17.wav voice=clip delayMs=0
 123618 tv    hush
 123618 tv    clip         src=i25.wav muted=false ready=true delayMs=0
 123618 tv    speak        text=i25.wav voice=clip delayMs=0
 123707 tv    hush
 123707 tv    clip         src=i19.wav muted=false ready=true delayMs=0
 123707 tv    speak        text=i19.wav voice=clip delayMs=0
 123782 tv    hush
 123782 tv    clip         src=g57.wav muted=false ready=true delayMs=0
 123782 tv    speak        text=g57.wav voice=clip delayMs=0
 123892 tv    hush
 123892 tv    clip         src=g59.wav muted=false ready=true delayMs=0
 123892 tv    speak        text=g59.wav voice=clip delayMs=0
 124087 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 125152 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 125420 tv    hush
 125420 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 125420 tv    hush
 133029 tv    music:duck   ms=9000
 133029 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 138050 tv    hush
 138050 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 138050 tv    hush
 139595 tv    ss:cancel    speaking=false pending=false
 139595 tv    music:plan   from=game:bingo to=null
 139602 tv    ss:cancel    speaking=false pending=false
 139602 tv    music:plan   from=null to=lobby
 139602 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 140418 tv    music:stop   track=wallpaper.mp3
 142112 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 142126 tv    ss:cancel    speaking=false pending=false
 142130 tv    music:plan   from=lobby to=game:bingo
 142130 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 142130 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 142136 tv    hush
 142137 tv    hush
 142788 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 142936 tv    music:stop   track=bossa-antigua.mp3
 143362 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
 144284 tv    ss:cancel    speaking=false pending=false
 144284 tv    music:plan   from=game:bingo to=null
 144284 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 145788 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 146444 tv    ss:cancel    speaking=false pending=false
 146444 tv    music:plan   from=null to=lobby
 146444 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 149811 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 149828 tv    ss:cancel    speaking=false pending=false
 149831 tv    music:plan   from=lobby to=game:bingo
 149831 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 149831 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149838 tv    hush
 149839 tv    hush
 150254 tv    cue          cue=lock surface=tv muted=false ready=true semitones=8
 150259 tv    hush
 150259 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 150259 tv    speak        text=i21.wav voice=clip delayMs=0
 150259 tv    hush
 150452 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 150635 tv    music:stop   track=bossa-antigua.mp3
 150762 tv    ss:cancel    speaking=false pending=false
 150762 tv    music:plan   from=game:bingo to=null
 150770 tv    ss:cancel    speaking=false pending=false
 150770 tv    music:plan   from=null to=lobby
 150770 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 151575 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, the lobby track only fading out, the warm bed under the intro** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.06,"t":10.3}] bed=warm
- ✅ **the writing track eases in (under 0.2 a third of a second in), never a hard start** — playing=[{"track":"local-forecast-elevator.mp3","vol":0.03,"t":10.7},{"track":"fluffing-a-duck.mp3","vol":0.07,"t":0.3}]
- ✅ **answer → one Wisecrack track at 0.2 × its trim while everyone writes, the bed gone** — playing=[{"track":"fluffing-a-duck.mp3","vol":0.19,"t":2.4}] bed=null
- ✅ **pause while writing → pause cue, the writing track holds (nothing playing), no bed** — cues=phase,pause playing=[]
- ✅ **resume → phase chime, the same writing track carries on at its level (no music:start)** — cues=phase playing=[{"track":"fluffing-a-duck.mp3","vol":0.19,"t":3.4}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,pause,phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **vote → the marimba bed (the first prompt), the track fading out** — bed=marimba playing=[]
- ✅ **reveal keeps the vote’s bed (same list, same turn: no crossfade on the cut)** — bed=marimba playing=[]
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal
- ✅ **scores phase → tally ping (mapped), the lounge bed** — cues=phase,reveal,phase,reveal,tally bed=lounge

```
 156416 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156847 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157280 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157713 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158146 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 159278 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 159882 tv    ss:cancel    speaking=false pending=false
 159891 tv    music:plan   from=lobby to=null
 159891 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 161163 tv    music:plan   from=null to=game:wisecrack
 161163 tv    music:start  plan=game:wisecrack track=fluffing-a-duck mode=chain volume=0.18600000000000003
 161163 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 161966 tv    music:stop   track=local-forecast-elevator.mp3
 163695 tv    music:paused paused=true
 163695 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
 164674 tv    music:paused paused=false
 164674 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 166616 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 167915 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 169217 tv    music:plan   from=game:wisecrack to=null
 169218 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 169218 tv    bed:duck     bed=marimba cue=phase
 170279 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 170279 tv    bed:duck     bed=marimba cue=reveal
 170718 tv    music:stop   track=fluffing-a-duck.mp3
 173934 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 173934 tv    bed:duck     bed=lofi cue=phase
 174116 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 174116 tv    bed:duck     bed=lofi cue=reveal
 174307 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 174307 tv    bed:duck     bed=marimba cue=phase
 174478 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 174478 tv    bed:duck     bed=marimba cue=reveal
 174673 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 174673 tv    bed:duck     bed=lounge cue=tally
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"lobby-time.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 175823 tv    ss:cancel    speaking=false pending=false
 175829 tv    ss:cancel    speaking=false pending=false
 175829 tv    music:plan   from=null to=lobby
 175829 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 177848 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 177863 tv    ss:cancel    speaking=false pending=false
 177865 tv    music:plan   from=lobby to=null
 177865 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 179368 tv    music:stop   track=george-street-shuffle.mp3
 179463 tv    music:plan   from=null to=game:broken-pencil
 179463 tv    music:start  plan=game:broken-pencil track=lobby-time mode=chain volume=0.2
 179463 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 180938 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 181419 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 181574 tv    music:plan   from=game:broken-pencil to=null
 181574 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 183079 tv    music:stop   track=lobby-time.mp3
```
