# Audio interaction trace

Captured 2026-09-17T21:31:13.470Z on port 42079. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**34 / 45 checks passed.** Failed: A: selecting keeps the lobby music (no plan change), a status-swap cue only; C: new game → selecting → lobby music comes back (plan null→lobby); D: Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2); D: exactly one track audible after the switch; D: music keeps playing through the check; D: resume → phase chime, music resumes; D: BINGO → caller hushed, sweep as the line turns, cheer once at the verdict (~4.4 s), no chime on entry, music continues; E: Home → fresh lobby → lobby music again, no cheer, speech cancelled; E: Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible; G: draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track; G: show → reveal sting (mapped), music stops (show)

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:george-street-shuffle music:stop:george-street-shuffle.mp3 music:stop: music:start:bossa-antigua music:stop:bossa-antigua.mp3 music:stop: music:start:local-forecast-elevator music:stop:local-forecast-elevator.mp3 music:stop:
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ❌ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[]

```
   1767 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   1767 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   1777 tv    music:stop   track=george-street-shuffle.mp3
   1777 tv    music:stop   track=
   2286 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   2292 tv    music:stop   track=bossa-antigua.mp3
   2292 tv    music:stop   track=
   2803 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   2810 tv    music:stop   track=local-forecast-elevator.mp3
   2811 tv    music:stop   track=
   3096 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3237 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3320 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   3328 tv    music:stop   track=airport-lounge.mp3
   3328 tv    music:stop   track=
   3840 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   3844 tv    music:stop   track=bossa-antigua.mp3
   3844 tv    music:stop   track=
   3927 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4355 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   4360 tv    music:stop   track=george-street-shuffle.mp3
   4360 tv    music:stop   track=
   4554 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   4869 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   4873 tv    music:stop   track=local-forecast-elevator.mp3
   4873 tv    music:stop   track=
   5376 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   5377 tv    music:stop   track=bossa-antigua.mp3
   5377 tv    music:stop   track=
   5402 tv    ss:cancel    speaking=false pending=false
   5882 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   5882 tv    music:stop   track=local-forecast-elevator.mp3
   5882 tv    music:stop   track=
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
   6272 tv    music:plan   from=lobby to=null
   6272 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   8241 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9528 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16503 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17503 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18494 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19497 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20500 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21268 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22068 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22231 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22383 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22547 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22704 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22857 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23012 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23164 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23332 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23492 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23634 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23782 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23936 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24079 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24229 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24378 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24534 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24686 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24848 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25724 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26052 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27859 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29603 tv    ss:cancel    speaking=false pending=false
  29603 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ❌ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[]

```
  31186 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33357 tv    ss:cancel    speaking=false pending=false
  33357 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34918 tv    ss:cancel    speaking=false pending=false
  34920 tv    music:plan   from=null to=lobby
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ❌ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo
- ❌ **exactly one track audible after the switch** — []
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=hush,silence,hush,wrong
- ❌ **music keeps playing through the check** — []
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ❌ **resume → phase chime, music resumes** — cues=phase playing=[]
- ❌ **BINGO → caller hushed, sweep as the line turns, cheer once at the verdict (~4.4 s), no chime on entry, music continues** — cues=silence,sweep,cheer cheer@+3510ms playing=[]
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going → play resumes, next number spoken, no start/phase chime** — cues=lock,call spoken=b11.wav
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36507 tv    music:plan   from=lobby to=game:bingo
  36507 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36819 tv    hush
  36819 tv    hush
  39574 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39574 tv    clip         src=b9.wav muted=false ready=true
  39574 tv    speak        text=b9.wav voice=clip
  41401 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41401 tv    clip         src=b8.wav muted=false ready=true
  41401 tv    speak        text=b8.wav voice=clip
  43532 tv    hush
  43534 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  43534 tv    hush
  47036 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  49563 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  49564 tv    clip         src=n34.wav muted=false ready=true
  49564 tv    speak        text=n34.wav voice=clip
  51788 tv    music:paused paused=true
  51788 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  53069 tv    music:paused paused=false
  53069 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  54397 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54397 tv    clip         src=n35.wav muted=false ready=true
  54397 tv    speak        text=n35.wav voice=clip
  54491 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54491 tv    clip         src=i25.wav muted=false ready=true
  54491 tv    speak        text=i25.wav voice=clip
  54586 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54586 tv    clip         src=n45.wav muted=false ready=true
  54586 tv    speak        text=n45.wav voice=clip
  54680 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54680 tv    clip         src=n33.wav muted=false ready=true
  54680 tv    speak        text=n33.wav voice=clip
  54774 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54774 tv    clip         src=g49.wav muted=false ready=true
  54774 tv    speak        text=g49.wav voice=clip
  54868 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54868 tv    clip         src=b4.wav muted=false ready=true
  54868 tv    speak        text=b4.wav voice=clip
  54964 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54964 tv    clip         src=i20.wav muted=false ready=true
  54964 tv    speak        text=i20.wav voice=clip
  55060 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55060 tv    clip         src=o69.wav muted=false ready=true
  55060 tv    speak        text=o69.wav voice=clip
  55169 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55169 tv    clip         src=o67.wav muted=false ready=true
  55169 tv    speak        text=o67.wav voice=clip
  55261 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55261 tv    clip         src=o65.wav muted=false ready=true
  55261 tv    speak        text=o65.wav voice=clip
  55357 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55357 tv    clip         src=o73.wav muted=false ready=true
  55357 tv    speak        text=o73.wav voice=clip
  55466 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55466 tv    clip         src=i21.wav muted=false ready=true
  55466 tv    speak        text=i21.wav voice=clip
  55562 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55562 tv    clip         src=i18.wav muted=false ready=true
  55562 tv    speak        text=i18.wav voice=clip
  55657 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55657 tv    clip         src=g58.wav muted=false ready=true
  55657 tv    speak        text=g58.wav voice=clip
  55765 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55765 tv    clip         src=n36.wav muted=false ready=true
  55765 tv    speak        text=n36.wav voice=clip
  55861 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55861 tv    clip         src=o61.wav muted=false ready=true
  55861 tv    speak        text=o61.wav voice=clip
  55955 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55955 tv    clip         src=n37.wav muted=false ready=true
  55955 tv    speak        text=n37.wav voice=clip
  56051 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56051 tv    clip         src=i16.wav muted=false ready=true
  56051 tv    speak        text=i16.wav voice=clip
  56144 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56144 tv    clip         src=g47.wav muted=false ready=true
  56144 tv    speak        text=g47.wav voice=clip
  56238 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56238 tv    clip         src=n41.wav muted=false ready=true
  56238 tv    speak        text=n41.wav voice=clip
  56335 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56335 tv    clip         src=b6.wav muted=false ready=true
  56335 tv    speak        text=b6.wav voice=clip
  56428 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56428 tv    clip         src=o72.wav muted=false ready=true
  56428 tv    speak        text=o72.wav voice=clip
  56523 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56523 tv    clip         src=b3.wav muted=false ready=true
  56523 tv    speak        text=b3.wav voice=clip
  56616 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56617 tv    clip         src=i30.wav muted=false ready=true
  56617 tv    speak        text=i30.wav voice=clip
  56711 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56711 tv    clip         src=g56.wav muted=false ready=true
  56711 tv    speak        text=g56.wav voice=clip
  56806 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56806 tv    clip         src=o75.wav muted=false ready=true
  56806 tv    speak        text=o75.wav voice=clip
  56885 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56885 tv    clip         src=b1.wav muted=false ready=true
  56885 tv    speak        text=b1.wav voice=clip
  56994 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56994 tv    clip         src=b2.wav muted=false ready=true
  56994 tv    speak        text=b2.wav voice=clip
  57090 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57090 tv    clip         src=n32.wav muted=false ready=true
  57090 tv    speak        text=n32.wav voice=clip
  57180 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57181 tv    clip         src=g48.wav muted=false ready=true
  57181 tv    speak        text=g48.wav voice=clip
  57290 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57290 tv    clip         src=i23.wav muted=false ready=true
  57290 tv    speak        text=i23.wav voice=clip
  57387 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57388 tv    clip         src=i26.wav muted=false ready=true
  57388 tv    speak        text=i26.wav voice=clip
  57496 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57496 tv    clip         src=o66.wav muted=false ready=true
  57496 tv    speak        text=o66.wav voice=clip
  57589 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57589 tv    clip         src=i19.wav muted=false ready=true
  57589 tv    speak        text=i19.wav voice=clip
  57684 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57684 tv    clip         src=n42.wav muted=false ready=true
  57684 tv    speak        text=n42.wav voice=clip
  57776 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57776 tv    clip         src=i24.wav muted=false ready=true
  57776 tv    speak        text=i24.wav voice=clip
  57857 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57857 tv    clip         src=n39.wav muted=false ready=true
  57857 tv    speak        text=n39.wav voice=clip
  57966 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57966 tv    clip         src=g46.wav muted=false ready=true
  57966 tv    speak        text=g46.wav voice=clip
  58062 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58062 tv    clip         src=n44.wav muted=false ready=true
  58062 tv    speak        text=n44.wav voice=clip
  58154 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58154 tv    clip         src=b15.wav muted=false ready=true
  58154 tv    speak        text=b15.wav voice=clip
  58988 tv    hush
  58989 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  58989 tv    hush
  59868 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  62498 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  66604 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  66613 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  66613 tv    clip         src=b11.wav muted=false ready=true
  66613 tv    speak        text=b11.wav voice=clip
  69096 tv    ss:cancel    speaking=false pending=false
  69096 tv    music:plan   from=game:bingo to=null
  69096 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## E · Home (reset) from results and mid-game

- ❌ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[]
- ❌ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan playing=[]
- ✅ **nothing spoken in the lobby afterwards**

```
  71223 tv    ss:cancel    speaking=false pending=false
  71223 tv    music:plan   from=null to=lobby
  74592 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
  74612 tv    ss:cancel    speaking=false pending=false
  74615 tv    music:plan   from=lobby to=game:bingo
  74615 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  74622 tv    hush
  74623 tv    hush
  75036 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  75036 tv    clip         src=i21.wav muted=false ready=true
  75036 tv    speak        text=i21.wav voice=clip
  75540 tv    ss:cancel    speaking=false pending=false
  75540 tv    music:plan   from=game:bingo to=null
  75548 tv    ss:cancel    speaking=false pending=false
  75548 tv    music:plan   from=null to=lobby
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,join,start playing=[]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
  81164 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  81598 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  82029 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  83210 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
  83814 tv    ss:cancel    speaking=false pending=false
  83822 tv    music:plan   from=lobby to=null
  83822 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  85086 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  86699 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  88033 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
  89350 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  90423 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  91461 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  94042 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  94230 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  94417 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  94608 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ❌ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — []
- ❌ **show → reveal sting (mapped), music stops (show)** — cues=phase,phase,card playing=[]

```
  95724 tv    ss:cancel    speaking=false pending=false
  95729 tv    ss:cancel    speaking=false pending=false
  95729 tv    music:plan   from=null to=lobby
  97748 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
  97767 tv    ss:cancel    speaking=false pending=false
  97783 tv    music:plan   from=lobby to=null
  97783 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  99339 tv    music:plan   from=null to=game:broken-pencil
  99339 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 100826 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 101301 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 101454 tv    music:plan   from=game:broken-pencil to=null
 101455 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
```
