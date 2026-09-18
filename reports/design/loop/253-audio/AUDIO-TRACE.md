# Audio interaction trace

Captured 2026-09-18T06:01:53.069Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**49 / 49 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.4}]

```
   1783 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1814 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3138 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3277 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3959 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4593 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5444 tv    ss:cancel    speaking=false pending=false
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
   6289 tv    music:plan   from=lobby to=null
   6289 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7792 tv    music:stop   track=local-forecast-elevator.mp3
   8236 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9521 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16493 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17492 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18487 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19489 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20492 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21287 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22094 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22252 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22409 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22568 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22727 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22882 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23039 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23196 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23354 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23512 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23653 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23809 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23967 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24125 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24284 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24441 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24600 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24760 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24904 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25783 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26116 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27921 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29659 tv    ss:cancel    speaking=false pending=false
  29659 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":1.5}]

```
  31217 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33402 tv    ss:cancel    speaking=false pending=false
  33402 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34956 tv    ss:cancel    speaking=false pending=false
  34956 tv    music:plan   from=null to=lobby
  34956 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:george-street-shuffle.mp3
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
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer cheer@+5372ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":33}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,claim,correct
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=lock,silence,phase,call spoken=g46.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=lock,tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36523 tv    music:plan   from=lobby to=game:bingo
  36523 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36523 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36834 tv    hush
  36834 tv    hush
  37324 tv    music:stop   track=george-street-shuffle.mp3
  39599 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  39792 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39792 tv    clip         src=b9.wav muted=false ready=true
  39792 tv    speak        text=b9.wav voice=clip
  41609 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41609 tv    clip         src=b8.wav muted=false ready=true
  41609 tv    speak        text=b8.wav voice=clip
  43305 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  43573 tv    hush
  43573 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  43574 tv    hush
  48927 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  52115 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  52320 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52320 tv    clip         src=n34.wav muted=false ready=true
  52320 tv    speak        text=n34.wav voice=clip
  54334 tv    music:paused paused=true
  54335 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  55602 tv    music:paused paused=false
  55602 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  61715 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61715 tv    clip         src=g46.wav muted=false ready=true
  61715 tv    speak        text=g46.wav voice=clip
  62135 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  62430 tv    hush
  62430 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  62431 tv    hush
  64317 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  67802 tv    music:duck   ms=9000
  67802 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  72540 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  72549 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  72868 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  73064 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  73064 tv    clip         src=g46.wav muted=false ready=true
  73065 tv    speak        text=g46.wav voice=clip
  76463 tv    ss:cancel    speaking=false pending=false
  76463 tv    music:plan   from=game:bingo to=null
  76467 tv    ss:cancel    speaking=false pending=false
  76467 tv    music:plan   from=null to=lobby
  76467 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  77269 tv    music:stop   track=wallpaper.mp3
  78981 tv    ss:cancel    speaking=false pending=false
  78998 tv    music:plan   from=lobby to=game:bingo
  78998 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  78998 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  79004 tv    hush
  79005 tv    hush
  79613 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  79809 tv    music:stop   track=airport-lounge.mp3
  86599 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  86600 tv    clip         src=b14.wav muted=false ready=true
  86600 tv    speak        text=b14.wav voice=clip
  87653 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  87914 tv    hush
  87914 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  87915 tv    hush
  95523 tv    music:duck   ms=9000
  95523 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 100529 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 100537 tv    hush
 100538 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 100539 tv    hush
 104535 tv    ss:cancel    speaking=false pending=false
 104535 tv    music:plan   from=game:bingo to=null
 104535 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 106037 tv    music:stop   track=wallpaper.mp3
 106128 tv    ss:cancel    speaking=false pending=false
 106128 tv    music:plan   from=null to=lobby
 106128 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 108634 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 108651 tv    ss:cancel    speaking=false pending=false
 108654 tv    music:plan   from=lobby to=game:bingo
 108655 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 108655 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 108662 tv    hush
 108662 tv    hush
 109456 tv    music:stop   track=airport-lounge.mp3
 110783 tv    ss:cancel    speaking=false pending=false
 110783 tv    music:plan   from=game:bingo to=null
 110783 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 112289 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 112895 tv    ss:cancel    speaking=false pending=false
 112895 tv    music:plan   from=null to=lobby
 112895 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 116237 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 116270 tv    ss:cancel    speaking=false pending=false
 116274 tv    music:plan   from=lobby to=game:bingo
 116274 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116274 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116280 tv    hush
 116281 tv    hush
 116672 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 116870 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 116870 tv    clip         src=i21.wav muted=false ready=true
 116870 tv    speak        text=i21.wav voice=clip
 117088 tv    music:stop   track=local-forecast-elevator.mp3
 117182 tv    ss:cancel    speaking=false pending=false
 117182 tv    music:plan   from=game:bingo to=null
 117188 tv    ss:cancel    speaking=false pending=false
 117188 tv    music:plan   from=null to=lobby
 117188 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 117998 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":10.3}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 122803 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 123228 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 123672 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 124128 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 124560 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 125730 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 126354 tv    ss:cancel    speaking=false pending=false
 126363 tv    music:plan   from=lobby to=null
 126363 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 127597 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 127863 tv    music:stop   track=bossa-antigua.mp3
 129224 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 130578 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 131908 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 132971 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 134021 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 136585 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 136771 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 136976 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 137160 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"lobby-time.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 138277 tv    ss:cancel    speaking=false pending=false
 138281 tv    ss:cancel    speaking=false pending=false
 138281 tv    music:plan   from=null to=lobby
 138282 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 140323 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 140347 tv    ss:cancel    speaking=false pending=false
 140350 tv    music:plan   from=lobby to=null
 140350 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 141855 tv    music:stop   track=local-forecast-elevator.mp3
 141894 tv    music:plan   from=null to=game:broken-pencil
 141894 tv    music:start  plan=game:broken-pencil track=lobby-time mode=chain volume=0.2
 141894 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143383 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143861 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144031 tv    music:plan   from=game:broken-pencil to=null
 144031 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 145534 tv    music:stop   track=lobby-time.mp3
```
