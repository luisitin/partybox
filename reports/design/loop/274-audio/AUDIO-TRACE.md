# Audio interaction trace

Captured 2026-09-18T10:58:26.218Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**52 / 52 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.4}]

```
   1755 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1781 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3093 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3229 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3919 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4549 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5398 tv    ss:cancel    speaking=false pending=false
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
   6249 tv    music:plan   from=lobby to=null
   6249 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7754 tv    music:stop   track=local-forecast-elevator.mp3
   8188 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9480 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16439 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17445 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18445 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19447 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20446 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21264 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22055 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22215 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22369 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22528 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22685 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22846 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22999 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23153 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23309 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23469 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23623 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23771 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23921 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24078 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24235 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24390 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24546 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24703 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24860 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25744 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26076 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27889 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29606 tv    ss:cancel    speaking=false pending=false
  29611 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31156 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33313 tv    ss:cancel    speaking=false pending=false
  33313 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34875 tv    ss:cancel    speaking=false pending=false
  34875 tv    music:plan   from=null to=lobby
  34875 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":3}]
- ✅ **intro: nothing spoken**
- ✅ **the intro counts down: three ticks (3 · 2 · 1), then the first call** — cues=tick,tick,tick,phase,call
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":19.1}]
- ✅ **play resumes → the next number is spoken** — spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":22.5}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,lock cheer@+5354ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":36.9}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5406ms cheer@+5365ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=silence,phase,call spoken=g57.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36431 tv    music:plan   from=lobby to=game:bingo
  36431 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36431 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36735 tv    hush
  36737 tv    hush
  37231 tv    music:stop   track=bossa-antigua.mp3
  38489 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39489 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40487 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41433 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41623 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41624 tv    clip         src=b9.wav muted=false ready=true
  41624 tv    speak        text=b9.wav voice=clip
  43263 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43263 tv    clip         src=b8.wav muted=false ready=true
  43263 tv    speak        text=b8.wav voice=clip
  45096 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45096 tv    clip         src=n34.wav muted=false ready=true
  45096 tv    speak        text=n34.wav voice=clip
  46776 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47050 tv    hush
  47050 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47050 tv    hush
  52403 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55591 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  55783 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55783 tv    clip         src=n35.wav muted=false ready=true
  55783 tv    speak        text=n35.wav voice=clip
  57777 tv    music:paused paused=true
  57777 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  59043 tv    music:paused paused=false
  59043 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  65444 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  65444 tv    clip         src=g57.wav muted=false ready=true
  65444 tv    speak        text=g57.wav voice=clip
  65858 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  66144 tv    hush
  66144 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  66144 tv    hush
  68019 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  71498 tv    music:duck   ms=9000
  71498 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  71545 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  76280 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  76609 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  76800 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  76800 tv    clip         src=g57.wav muted=false ready=true
  76800 tv    speak        text=g57.wav voice=clip
  80219 tv    ss:cancel    speaking=false pending=false
  80219 tv    music:plan   from=game:bingo to=null
  80222 tv    ss:cancel    speaking=false pending=false
  80222 tv    music:plan   from=null to=lobby
  80222 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  81022 tv    music:stop   track=wallpaper.mp3
  82749 tv    ss:cancel    speaking=false pending=false
  82761 tv    music:plan   from=lobby to=game:bingo
  82761 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  82761 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  82764 tv    hush
  82764 tv    hush
  83373 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  83561 tv    music:stop   track=bossa-antigua.mp3
  89603 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  89603 tv    clip         src=g59.wav muted=false ready=true
  89603 tv    speak        text=g59.wav voice=clip
  90666 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  90938 tv    hush
  90938 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  90938 tv    hush
  98542 tv    music:duck   ms=9000
  98542 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  98564 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 103558 tv    hush
 103558 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 103558 tv    hush
 107558 tv    ss:cancel    speaking=false pending=false
 107558 tv    music:plan   from=game:bingo to=null
 107558 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 109059 tv    music:stop   track=wallpaper.mp3
 109151 tv    ss:cancel    speaking=false pending=false
 109151 tv    music:plan   from=null to=lobby
 109151 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 111667 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 111675 tv    ss:cancel    speaking=false pending=false
 111677 tv    music:plan   from=lobby to=game:bingo
 111677 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 111677 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 111681 tv    hush
 111681 tv    hush
 112478 tv    music:stop   track=local-forecast-elevator.mp3
 113682 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 113822 tv    ss:cancel    speaking=false pending=false
 113822 tv    music:plan   from=game:bingo to=null
 113822 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 115323 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 115934 tv    ss:cancel    speaking=false pending=false
 115934 tv    music:plan   from=null to=lobby
 115934 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 119286 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 119302 tv    ss:cancel    speaking=false pending=false
 119308 tv    music:plan   from=lobby to=game:bingo
 119308 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 119308 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 119312 tv    hush
 119312 tv    hush
 119736 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 119927 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 119927 tv    clip         src=i21.wav muted=false ready=true
 119927 tv    speak        text=i21.wav voice=clip
 120109 tv    music:stop   track=local-forecast-elevator.mp3
 120234 tv    ss:cancel    speaking=false pending=false
 120234 tv    music:plan   from=game:bingo to=null
 120238 tv    ss:cancel    speaking=false pending=false
 120238 tv    music:plan   from=null to=lobby
 120238 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 121038 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 125807 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 126243 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 126670 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 127109 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 127542 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 128605 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 129213 tv    ss:cancel    speaking=false pending=false
 129219 tv    music:plan   from=lobby to=null
 129219 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 130451 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 130720 tv    music:stop   track=bossa-antigua.mp3
 132038 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 133341 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 134650 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135686 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 136723 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 139285 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 139469 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 139660 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 139847 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 140950 tv    ss:cancel    speaking=false pending=false
 140952 tv    ss:cancel    speaking=false pending=false
 140952 tv    music:plan   from=null to=lobby
 140952 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 142974 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 142979 tv    ss:cancel    speaking=false pending=false
 142986 tv    music:plan   from=lobby to=null
 142986 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 144487 tv    music:stop   track=airport-lounge.mp3
 144540 tv    music:plan   from=null to=game:broken-pencil
 144540 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 144540 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 146002 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 146475 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 146632 tv    music:plan   from=game:broken-pencil to=null
 146632 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 148133 tv    music:stop   track=hep-cats.mp3
```
