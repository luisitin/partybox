# Audio interaction trace

Captured 2026-09-18T05:22:41.236Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**48 / 48 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.5}]

```
   1782 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1815 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3177 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3356 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   4043 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4680 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5531 tv    ss:cancel    speaking=false pending=false
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
   6391 tv    music:plan   from=lobby to=null
   6391 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7892 tv    music:stop   track=airport-lounge.mp3
   8349 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9650 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16612 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17609 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18609 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19610 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20609 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21406 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22214 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22386 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22543 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22700 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22861 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23003 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23158 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23321 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23475 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23613 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23767 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23922 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24086 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24243 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24408 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24564 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24726 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24886 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  25041 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25942 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26247 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  28051 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29780 tv    ss:cancel    speaking=false pending=false
  29780 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":1.5}]

```
  31352 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33519 tv    ss:cancel    speaking=false pending=false
  33519 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  35072 tv    ss:cancel    speaking=false pending=false
  35072 tv    music:plan   from=null to=lobby
  35072 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:local-forecast-elevator.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=phase,call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":15.4}]
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":18.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer cheer@+5369ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":32.9}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=lock,silence,phase,call spoken=g46.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=lock,tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36669 tv    music:plan   from=lobby to=game:bingo
  36669 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36669 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36978 tv    hush
  36978 tv    hush
  37476 tv    music:stop   track=local-forecast-elevator.mp3
  39707 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  39910 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39910 tv    clip         src=b9.wav muted=false ready=true
  39910 tv    speak        text=b9.wav voice=clip
  41737 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41737 tv    clip         src=b8.wav muted=false ready=true
  41737 tv    speak        text=b8.wav voice=clip
  43675 tv    hush
  43676 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  43676 tv    hush
  49028 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  52226 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  52417 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52418 tv    clip         src=n34.wav muted=false ready=true
  52418 tv    speak        text=n34.wav voice=clip
  54429 tv    music:paused paused=true
  54429 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  55695 tv    music:paused paused=false
  55698 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  61724 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61724 tv    clip         src=g46.wav muted=false ready=true
  61724 tv    speak        text=g46.wav voice=clip
  62484 tv    hush
  62484 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  62485 tv    hush
  64373 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  67853 tv    music:duck   ms=9000
  67853 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  72598 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  72610 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  72932 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  73134 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  73134 tv    clip         src=g46.wav muted=false ready=true
  73134 tv    speak        text=g46.wav voice=clip
  76549 tv    ss:cancel    speaking=false pending=false
  76549 tv    music:plan   from=game:bingo to=null
  76554 tv    ss:cancel    speaking=false pending=false
  76554 tv    music:plan   from=null to=lobby
  76554 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  77365 tv    music:stop   track=wallpaper.mp3
  79074 tv    ss:cancel    speaking=false pending=false
  79090 tv    music:plan   from=lobby to=game:bingo
  79090 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  79090 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  79096 tv    hush
  79096 tv    hush
  79707 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  79892 tv    music:stop   track=local-forecast-elevator.mp3
  86876 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  86876 tv    clip         src=b14.wav muted=false ready=true
  86876 tv    speak        text=b14.wav voice=clip
  88186 tv    hush
  88186 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  88187 tv    hush
  95799 tv    music:duck   ms=9000
  95799 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 100798 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 100806 tv    hush
 100807 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 100808 tv    hush
 104808 tv    ss:cancel    speaking=false pending=false
 104808 tv    music:plan   from=game:bingo to=null
 104808 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 106313 tv    music:stop   track=wallpaper.mp3
 106430 tv    ss:cancel    speaking=false pending=false
 106431 tv    music:plan   from=null to=lobby
 106431 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 108934 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 108950 tv    ss:cancel    speaking=false pending=false
 108963 tv    music:plan   from=lobby to=game:bingo
 108963 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 108963 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 108969 tv    hush
 108969 tv    hush
 109764 tv    music:stop   track=local-forecast-elevator.mp3
 111095 tv    ss:cancel    speaking=false pending=false
 111095 tv    music:plan   from=game:bingo to=null
 111095 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 112601 tv    music:stop   track=cool-vibes.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 113213 tv    ss:cancel    speaking=false pending=false
 113213 tv    music:plan   from=null to=lobby
 113213 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 116563 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 116579 tv    ss:cancel    speaking=false pending=false
 116582 tv    music:plan   from=lobby to=game:bingo
 116582 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116583 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116590 tv    hush
 116591 tv    hush
 117013 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 117205 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 117205 tv    clip         src=i21.wav muted=false ready=true
 117205 tv    speak        text=i21.wav voice=clip
 117392 tv    music:stop   track=airport-lounge.mp3
 117512 tv    ss:cancel    speaking=false pending=false
 117512 tv    music:plan   from=game:bingo to=null
 117519 tv    ss:cancel    speaking=false pending=false
 117519 tv    music:plan   from=null to=lobby
 117519 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 118321 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.07,"t":10.2}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 123102 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 123535 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 123968 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 124400 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 124833 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 125965 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 126552 tv    ss:cancel    speaking=false pending=false
 126560 tv    music:plan   from=lobby to=null
 126560 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 127817 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 128061 tv    music:stop   track=local-forecast-elevator.mp3
 129414 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 130721 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 132061 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 133129 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 134182 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 136745 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 136921 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 137131 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 137318 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 138413 tv    ss:cancel    speaking=false pending=false
 138419 tv    ss:cancel    speaking=false pending=false
 138419 tv    music:plan   from=null to=lobby
 138419 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 140447 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 140468 tv    ss:cancel    speaking=false pending=false
 140471 tv    music:plan   from=lobby to=null
 140471 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 141974 tv    music:stop   track=airport-lounge.mp3
 142021 tv    music:plan   from=null to=game:broken-pencil
 142021 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 142021 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143479 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143960 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144133 tv    music:plan   from=game:broken-pencil to=null
 144133 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 145634 tv    music:stop   track=hep-cats.mp3
```
