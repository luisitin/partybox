# Audio interaction trace

Captured 2026-09-18T09:11:45.345Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**52 / 52 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:bossa-antigua
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":4.4}]

```
   1850 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   1876 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3188 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3324 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   4020 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4656 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5490 tv    ss:cancel    speaking=false pending=false
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
   6333 tv    music:plan   from=lobby to=null
   6333 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7845 tv    music:stop   track=bossa-antigua.mp3
   8282 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9574 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16542 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17537 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18543 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19538 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20534 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21332 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22150 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22309 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22464 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22622 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22780 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22939 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23079 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23238 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23395 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23553 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23710 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23866 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24025 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24182 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24340 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24481 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24637 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24796 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24954 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25839 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26171 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27973 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29712 tv    ss:cancel    speaking=false pending=false
  29712 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31267 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33418 tv    ss:cancel    speaking=false pending=false
  33418 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34968 tv    ss:cancel    speaking=false pending=false
  34968 tv    music:plan   from=null to=lobby
  34968 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro counts down: three ticks (3 · 2 · 1), then the first call** — cues=tick,tick,tick,phase,call
- ✅ **the phone taps 3 · 2 · 1 with the TV, silently** — taps=3 cues=
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":19}]
- ✅ **play resumes → the next number is spoken** — spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":22.5}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,silence,lock cheer@+5355ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":36.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5416ms cheer@+5366ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=silence,phase,call spoken=g46.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36534 tv    music:plan   from=lobby to=game:bingo
  36534 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36534 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36838 tv    hush
  36838 tv    hush
  37334 tv    music:stop   track=airport-lounge.mp3
  38591 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39590 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40590 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41533 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41724 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41725 tv    clip         src=b9.wav muted=false ready=true
  41725 tv    speak        text=b9.wav voice=clip
  43316 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43316 tv    clip         src=b8.wav muted=false ready=true
  43316 tv    speak        text=b8.wav voice=clip
  45147 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45147 tv    clip         src=n34.wav muted=false ready=true
  45147 tv    speak        text=n34.wav voice=clip
  46820 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47089 tv    hush
  47089 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47089 tv    hush
  52441 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55633 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  55823 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55824 tv    clip         src=n35.wav muted=false ready=true
  55824 tv    speak        text=n35.wav voice=clip
  57837 tv    music:paused paused=true
  57837 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  59088 tv    music:paused paused=false
  59088 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  65042 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  65042 tv    clip         src=g46.wav muted=false ready=true
  65043 tv    speak        text=g46.wav voice=clip
  65419 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  65694 tv    hush
  65694 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  65694 tv    hush
  67568 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  71049 tv    music:duck   ms=9000
  71049 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  71105 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  71105 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  75847 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  76172 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  76363 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  76363 tv    clip         src=g46.wav muted=false ready=true
  76363 tv    speak        text=g46.wav voice=clip
  79763 tv    ss:cancel    speaking=false pending=false
  79763 tv    music:plan   from=game:bingo to=null
  79767 tv    ss:cancel    speaking=false pending=false
  79767 tv    music:plan   from=null to=lobby
  79767 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  80569 tv    music:stop   track=wallpaper.mp3
  82275 tv    ss:cancel    speaking=false pending=false
  82285 tv    music:plan   from=lobby to=game:bingo
  82285 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  82285 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  82289 tv    hush
  82289 tv    hush
  82905 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  83087 tv    music:stop   track=bossa-antigua.mp3
  89892 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  89892 tv    clip         src=b14.wav muted=false ready=true
  89892 tv    speak        text=b14.wav voice=clip
  90934 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  91195 tv    hush
  91195 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  91196 tv    hush
  98800 tv    music:duck   ms=9000
  98800 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  98813 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 103811 tv    hush
 103812 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 103812 tv    hush
 107818 tv    ss:cancel    speaking=false pending=false
 107818 tv    music:plan   from=game:bingo to=null
 107818 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 109319 tv    music:stop   track=wallpaper.mp3
 109395 tv    ss:cancel    speaking=false pending=false
 109395 tv    music:plan   from=null to=lobby
 109395 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 111903 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 111917 tv    ss:cancel    speaking=false pending=false
 111919 tv    music:plan   from=lobby to=game:bingo
 111919 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 111919 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 111923 tv    hush
 111923 tv    hush
 112719 tv    music:stop   track=local-forecast-elevator.mp3
 113924 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 114048 tv    ss:cancel    speaking=false pending=false
 114048 tv    music:plan   from=game:bingo to=null
 114048 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 115549 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 116144 tv    ss:cancel    speaking=false pending=false
 116144 tv    music:plan   from=null to=lobby
 116144 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 119488 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 119498 tv    ss:cancel    speaking=false pending=false
 119500 tv    music:plan   from=lobby to=game:bingo
 119500 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 119500 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 119504 tv    hush
 119504 tv    hush
 119919 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 120111 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 120111 tv    clip         src=i21.wav muted=false ready=true
 120111 tv    speak        text=i21.wav voice=clip
 120300 tv    music:stop   track=local-forecast-elevator.mp3
 120431 tv    ss:cancel    speaking=false pending=false
 120431 tv    music:plan   from=game:bingo to=null
 120435 tv    ss:cancel    speaking=false pending=false
 120435 tv    music:plan   from=null to=lobby
 120435 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 121236 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"airport-lounge.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 125965 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 126381 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 126814 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 127231 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 127665 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 128765 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 129366 tv    ss:cancel    speaking=false pending=false
 129373 tv    music:plan   from=lobby to=null
 129373 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 130602 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 130874 tv    music:stop   track=airport-lounge.mp3
 132200 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 133483 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 134784 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135789 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 136829 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 139394 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 139584 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 139773 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 139964 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.3}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 141044 tv    ss:cancel    speaking=false pending=false
 141047 tv    ss:cancel    speaking=false pending=false
 141047 tv    music:plan   from=null to=lobby
 141047 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 143068 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 143075 tv    ss:cancel    speaking=false pending=false
 143082 tv    music:plan   from=lobby to=null
 143082 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 144583 tv    music:stop   track=bossa-antigua.mp3
 144620 tv    music:plan   from=null to=game:broken-pencil
 144620 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 144620 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 146075 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 146518 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 146674 tv    music:plan   from=game:broken-pencil to=null
 146674 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 148176 tv    music:stop   track=hep-cats.mp3
```
