# Audio interaction trace

Captured 2026-09-18T08:28:26.582Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**50 / 50 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.4}]

```
   1767 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1793 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3106 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3240 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3947 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4573 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5423 tv    ss:cancel    speaking=false pending=false
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
   6274 tv    music:plan   from=lobby to=null
   6274 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7780 tv    music:stop   track=airport-lounge.mp3
   8226 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9525 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16479 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17480 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18481 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19479 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20480 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21275 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22079 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22205 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22362 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22518 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22675 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22835 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22991 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23148 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23306 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23464 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23608 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23765 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23924 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24079 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24237 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24395 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24553 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24695 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24852 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25736 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26065 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27875 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29605 tv    ss:cancel    speaking=false pending=false
  29606 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31167 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33301 tv    ss:cancel    speaking=false pending=false
  33301 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34857 tv    ss:cancel    speaking=false pending=false
  34857 tv    music:plan   from=null to=lobby
  34857 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=phase,call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":15.4}]
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":18.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,silence,lock cheer@+5354ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":33.3}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5410ms cheer@+5365ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=silence,phase,call spoken=b15.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36412 tv    music:plan   from=lobby to=game:bingo
  36412 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36413 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36718 tv    hush
  36718 tv    hush
  37213 tv    music:stop   track=bossa-antigua.mp3
  39478 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  39668 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39668 tv    clip         src=b9.wav muted=false ready=true
  39668 tv    speak        text=b9.wav voice=clip
  41488 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41488 tv    clip         src=b8.wav muted=false ready=true
  41488 tv    speak        text=b8.wav voice=clip
  43174 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  43433 tv    hush
  43433 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  43433 tv    hush
  48785 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  51970 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  52161 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52161 tv    clip         src=n34.wav muted=false ready=true
  52161 tv    speak        text=n34.wav voice=clip
  54187 tv    music:paused paused=true
  54187 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  55437 tv    music:paused paused=false
  55437 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  61765 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61765 tv    clip         src=b15.wav muted=false ready=true
  61765 tv    speak        text=b15.wav voice=clip
  62155 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  62444 tv    hush
  62444 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  62445 tv    hush
  64318 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  67798 tv    music:duck   ms=9000
  67798 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  67853 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  67853 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  72575 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  72903 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  73094 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  73094 tv    clip         src=b15.wav muted=false ready=true
  73094 tv    speak        text=b15.wav voice=clip
  76514 tv    ss:cancel    speaking=false pending=false
  76514 tv    music:plan   from=game:bingo to=null
  76517 tv    ss:cancel    speaking=false pending=false
  76517 tv    music:plan   from=null to=lobby
  76517 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  77317 tv    music:stop   track=wallpaper.mp3
  79037 tv    ss:cancel    speaking=false pending=false
  79047 tv    music:plan   from=lobby to=game:bingo
  79047 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  79047 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  79050 tv    hush
  79050 tv    hush
  79655 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  79849 tv    music:stop   track=airport-lounge.mp3
  85950 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  85950 tv    clip         src=g59.wav muted=false ready=true
  85950 tv    speak        text=g59.wav voice=clip
  86984 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  87249 tv    hush
  87249 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  87250 tv    hush
  94854 tv    music:duck   ms=9000
  94854 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  94867 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  99873 tv    hush
  99873 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
  99874 tv    hush
 103868 tv    ss:cancel    speaking=false pending=false
 103868 tv    music:plan   from=game:bingo to=null
 103868 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 105369 tv    music:stop   track=wallpaper.mp3
 105479 tv    ss:cancel    speaking=false pending=false
 105479 tv    music:plan   from=null to=lobby
 105479 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 107994 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 108005 tv    ss:cancel    speaking=false pending=false
 108007 tv    music:plan   from=lobby to=game:bingo
 108007 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 108007 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 108011 tv    hush
 108011 tv    hush
 108808 tv    music:stop   track=local-forecast-elevator.mp3
 110149 tv    ss:cancel    speaking=false pending=false
 110149 tv    music:plan   from=game:bingo to=null
 110149 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 111650 tv    music:stop   track=cool-vibes.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 112262 tv    ss:cancel    speaking=false pending=false
 112262 tv    music:plan   from=null to=lobby
 112262 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 115615 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 115624 tv    ss:cancel    speaking=false pending=false
 115626 tv    music:plan   from=lobby to=game:bingo
 115626 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 115626 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 115630 tv    hush
 115630 tv    hush
 116058 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 116248 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 116248 tv    clip         src=i21.wav muted=false ready=true
 116248 tv    speak        text=i21.wav voice=clip
 116427 tv    music:stop   track=local-forecast-elevator.mp3
 116546 tv    ss:cancel    speaking=false pending=false
 116546 tv    music:plan   from=game:bingo to=null
 116549 tv    ss:cancel    speaking=false pending=false
 116549 tv    music:plan   from=null to=lobby
 116549 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 117351 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 122101 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 122538 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 122967 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 123400 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 123837 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 124914 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 125531 tv    ss:cancel    speaking=false pending=false
 125537 tv    music:plan   from=lobby to=null
 125537 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 126770 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 127042 tv    music:stop   track=george-street-shuffle.mp3
 128370 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 129683 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 130986 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 132010 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 133050 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135596 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 135770 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135963 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 136154 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 137244 tv    ss:cancel    speaking=false pending=false
 137247 tv    ss:cancel    speaking=false pending=false
 137247 tv    music:plan   from=null to=lobby
 137247 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 139267 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 139274 tv    ss:cancel    speaking=false pending=false
 139275 tv    music:plan   from=lobby to=null
 139275 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 140790 tv    music:stop   track=local-forecast-elevator.mp3
 140843 tv    music:plan   from=null to=game:broken-pencil
 140843 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 140844 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 142320 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 142791 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 142950 tv    music:plan   from=game:broken-pencil to=null
 142950 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 144451 tv    music:stop   track=backbay-lounge.mp3
```
