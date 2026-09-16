# Audio interaction trace

Captured 2026-09-16T23:07:36.859Z on port 42145. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**45 / 45 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.4}]

```
   1821 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1822 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3150 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3282 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3976 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4599 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5450 tv    ss:cancel    speaking=false pending=false
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
   6291 tv    music:plan   from=lobby to=null
   6291 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7795 tv    music:stop   track=local-forecast-elevator.mp3
   8260 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9550 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16524 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17513 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18513 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19512 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20515 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21295 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22102 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22259 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22415 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22574 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22728 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22884 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23037 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23193 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23351 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23506 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23661 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23823 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23978 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24120 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24277 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24435 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24576 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24731 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24889 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25764 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26093 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27905 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29622 tv    ss:cancel    speaking=false pending=false
  29622 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.34,"t":1.5}]

```
  31162 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33311 tv    ss:cancel    speaking=false pending=false
  33311 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34861 tv    ss:cancel    speaking=false pending=false
  34862 tv    music:plan   from=null to=lobby
  34862 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":3}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=hush,silence,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":12.7}]
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":16.2}]
- ✅ **BINGO → caller hushed, sweep as the line turns, cheer once at the verdict (~4.4 s), no chime on entry, music continues** — cues=silence,sweep,cheer cheer@+3510ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":24.8}]
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going → play resumes, next number spoken, no start/phase chime** — cues=lock,call spoken=b3.wav
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36403 tv    music:plan   from=lobby to=game:bingo
  36403 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36403 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36706 tv    hush
  36706 tv    hush
  37207 tv    music:stop   track=bossa-antigua.mp3
  39459 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39459 tv    clip         src=b9.wav muted=false ready=true
  39459 tv    speak        text=b9.wav voice=clip
  41289 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41289 tv    clip         src=b8.wav muted=false ready=true
  41289 tv    speak        text=b8.wav voice=clip
  43167 tv    hush
  43168 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  43168 tv    hush
  46671 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  49205 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  49205 tv    clip         src=n34.wav muted=false ready=true
  49205 tv    speak        text=n34.wav voice=clip
  51397 tv    music:paused paused=true
  51397 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  52648 tv    music:paused paused=false
  52648 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  53956 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  53956 tv    clip         src=n35.wav muted=false ready=true
  53956 tv    speak        text=n35.wav voice=clip
  54050 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54050 tv    clip         src=i25.wav muted=false ready=true
  54050 tv    speak        text=i25.wav voice=clip
  54146 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54146 tv    clip         src=n45.wav muted=false ready=true
  54146 tv    speak        text=n45.wav voice=clip
  54239 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54239 tv    clip         src=n33.wav muted=false ready=true
  54239 tv    speak        text=n33.wav voice=clip
  54331 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54331 tv    clip         src=g49.wav muted=false ready=true
  54331 tv    speak        text=g49.wav voice=clip
  54425 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54425 tv    clip         src=b4.wav muted=false ready=true
  54425 tv    speak        text=b4.wav voice=clip
  54519 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54519 tv    clip         src=i20.wav muted=false ready=true
  54519 tv    speak        text=i20.wav voice=clip
  54614 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54614 tv    clip         src=o69.wav muted=false ready=true
  54614 tv    speak        text=o69.wav voice=clip
  54706 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54706 tv    clip         src=o67.wav muted=false ready=true
  54706 tv    speak        text=o67.wav voice=clip
  54815 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54815 tv    clip         src=o65.wav muted=false ready=true
  54815 tv    speak        text=o65.wav voice=clip
  54887 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54887 tv    clip         src=o73.wav muted=false ready=true
  54887 tv    speak        text=o73.wav voice=clip
  54975 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54975 tv    clip         src=i21.wav muted=false ready=true
  54975 tv    speak        text=i21.wav voice=clip
  55068 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55068 tv    clip         src=i18.wav muted=false ready=true
  55068 tv    speak        text=i18.wav voice=clip
  55181 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55181 tv    clip         src=g58.wav muted=false ready=true
  55181 tv    speak        text=g58.wav voice=clip
  55272 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55272 tv    clip         src=n36.wav muted=false ready=true
  55272 tv    speak        text=n36.wav voice=clip
  55367 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55368 tv    clip         src=o61.wav muted=false ready=true
  55368 tv    speak        text=o61.wav voice=clip
  55474 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55474 tv    clip         src=n37.wav muted=false ready=true
  55474 tv    speak        text=n37.wav voice=clip
  55568 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55568 tv    clip         src=i16.wav muted=false ready=true
  55568 tv    speak        text=i16.wav voice=clip
  55663 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55663 tv    clip         src=g47.wav muted=false ready=true
  55663 tv    speak        text=g47.wav voice=clip
  55758 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55758 tv    clip         src=n41.wav muted=false ready=true
  55758 tv    speak        text=n41.wav voice=clip
  55838 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55838 tv    clip         src=b6.wav muted=false ready=true
  55838 tv    speak        text=b6.wav voice=clip
  55929 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55929 tv    clip         src=o72.wav muted=false ready=true
  55929 tv    speak        text=o72.wav voice=clip
  56482 tv    hush
  56482 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  56482 tv    hush
  57190 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  59992 tv    music:duck   ms=9000
  59992 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  64084 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  64086 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  64086 tv    clip         src=b3.wav muted=false ready=true
  64086 tv    speak        text=b3.wav voice=clip
  66510 tv    ss:cancel    speaking=false pending=false
  66510 tv    music:plan   from=game:bingo to=null
  66510 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  68013 tv    music:stop   track=cool-vibes.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
  68608 tv    ss:cancel    speaking=false pending=false
  68608 tv    music:plan   from=null to=lobby
  68608 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  71946 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
  71953 tv    ss:cancel    speaking=false pending=false
  71954 tv    music:plan   from=lobby to=game:bingo
  71954 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  71954 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  71958 tv    hush
  71959 tv    hush
  72380 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  72380 tv    clip         src=i21.wav muted=false ready=true
  72380 tv    speak        text=i21.wav voice=clip
  72756 tv    music:stop   track=local-forecast-elevator.mp3
  72875 tv    ss:cancel    speaking=false pending=false
  72875 tv    music:plan   from=game:bingo to=null
  72878 tv    ss:cancel    speaking=false pending=false
  72878 tv    music:plan   from=null to=lobby
  72878 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  73683 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.07,"t":9.2}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
  78428 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  78861 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  79294 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  80343 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
  80947 tv    ss:cancel    speaking=false pending=false
  80949 tv    music:plan   from=lobby to=null
  80949 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  82192 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  82450 tv    music:stop   track=local-forecast-elevator.mp3
  83796 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  85078 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
  86366 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  87366 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  88429 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  90981 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  91168 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  91358 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  91542 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"lobby-time.mp3","vol":0.2,"t":1.4}]
- ✅ **show → reveal sting (mapped), music stops (show)** — cues=phase,phase,reveal playing=[]

```
  92623 tv    ss:cancel    speaking=false pending=false
  92625 tv    ss:cancel    speaking=false pending=false
  92625 tv    music:plan   from=null to=lobby
  92625 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  94659 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
  94676 tv    ss:cancel    speaking=false pending=false
  94677 tv    music:plan   from=lobby to=null
  94677 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  96187 tv    music:stop   track=airport-lounge.mp3
  96226 tv    music:plan   from=null to=game:broken-pencil
  96226 tv    music:start  plan=game:broken-pencil track=lobby-time mode=chain volume=0.2
  96226 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  97696 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  98165 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  98321 tv    music:plan   from=game:broken-pencil to=null
  98321 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  99823 tv    music:stop   track=lobby-time.mp3
```
