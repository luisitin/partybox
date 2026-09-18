# Audio interaction trace

Captured 2026-09-18T08:01:50.727Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**49 / 49 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.4}]

```
   1721 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1758 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3075 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3211 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3904 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4530 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5379 tv    ss:cancel    speaking=false pending=false
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
   6221 tv    music:plan   from=lobby to=null
   6221 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7731 tv    music:stop   track=airport-lounge.mp3
   8169 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9462 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16433 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17421 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18421 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19424 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20433 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21229 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22030 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22186 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22343 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22499 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22656 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22816 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22954 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23115 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23271 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23426 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23579 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23733 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23890 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24047 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24190 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24344 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24504 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24660 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24819 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25706 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26025 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27834 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29557 tv    ss:cancel    speaking=false pending=false
  29557 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":1.5}]

```
  31104 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33239 tv    ss:cancel    speaking=false pending=false
  33239 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34790 tv    ss:cancel    speaking=false pending=false
  34790 tv    music:plan   from=null to=lobby
  34790 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:local-forecast-elevator.mp3
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
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,silence,lock cheer@+5355ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":30.9}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,claim,correct
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=silence,phase,call spoken=o72.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36360 tv    music:plan   from=lobby to=game:bingo
  36360 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36360 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36663 tv    hush
  36664 tv    hush
  37160 tv    music:stop   track=local-forecast-elevator.mp3
  39406 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  39597 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39597 tv    clip         src=b9.wav muted=false ready=true
  39597 tv    speak        text=b9.wav voice=clip
  41422 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41422 tv    clip         src=b8.wav muted=false ready=true
  41422 tv    speak        text=b8.wav voice=clip
  43091 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  43361 tv    hush
  43361 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  43362 tv    hush
  48718 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  51912 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  52104 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52104 tv    clip         src=n34.wav muted=false ready=true
  52104 tv    speak        text=n34.wav voice=clip
  54108 tv    music:paused paused=true
  54108 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  55359 tv    music:paused paused=false
  55359 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  59408 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  59408 tv    clip         src=o72.wav muted=false ready=true
  59408 tv    speak        text=o72.wav voice=clip
  59814 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  60088 tv    hush
  60088 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  60088 tv    hush
  61961 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  65443 tv    music:duck   ms=9000
  65443 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  66541 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  66541 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  70246 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  70565 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  70756 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  70756 tv    clip         src=o72.wav muted=false ready=true
  70756 tv    speak        text=o72.wav voice=clip
  74167 tv    ss:cancel    speaking=false pending=false
  74167 tv    music:plan   from=game:bingo to=null
  74170 tv    ss:cancel    speaking=false pending=false
  74170 tv    music:plan   from=null to=lobby
  74170 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  74970 tv    music:stop   track=wallpaper.mp3
  76688 tv    ss:cancel    speaking=false pending=false
  76701 tv    music:plan   from=lobby to=game:bingo
  76701 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  76701 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  76704 tv    hush
  76704 tv    hush
  77319 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  77501 tv    music:stop   track=bossa-antigua.mp3
  84316 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84316 tv    clip         src=b14.wav muted=false ready=true
  84316 tv    speak        text=b14.wav voice=clip
  85363 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  85633 tv    hush
  85633 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  85633 tv    hush
  93237 tv    music:duck   ms=9000
  93237 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  93248 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  98249 tv    hush
  98249 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
  98250 tv    hush
 102241 tv    ss:cancel    speaking=false pending=false
 102241 tv    music:plan   from=game:bingo to=null
 102241 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 103744 tv    music:stop   track=wallpaper.mp3
 103833 tv    ss:cancel    speaking=false pending=false
 103833 tv    music:plan   from=null to=lobby
 103833 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 106347 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 106363 tv    ss:cancel    speaking=false pending=false
 106367 tv    music:plan   from=lobby to=game:bingo
 106367 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 106367 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 106371 tv    hush
 106371 tv    hush
 107168 tv    music:stop   track=bossa-antigua.mp3
 108519 tv    ss:cancel    speaking=false pending=false
 108519 tv    music:plan   from=game:bingo to=null
 108519 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 110021 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 110616 tv    ss:cancel    speaking=false pending=false
 110616 tv    music:plan   from=null to=lobby
 110616 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 113966 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 113983 tv    ss:cancel    speaking=false pending=false
 113988 tv    music:plan   from=lobby to=game:bingo
 113988 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 113989 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 113992 tv    hush
 113993 tv    hush
 114411 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 114610 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 114610 tv    clip         src=i21.wav muted=false ready=true
 114610 tv    speak        text=i21.wav voice=clip
 114789 tv    music:stop   track=george-street-shuffle.mp3
 114916 tv    ss:cancel    speaking=false pending=false
 114916 tv    music:plan   from=game:bingo to=null
 114919 tv    ss:cancel    speaking=false pending=false
 114919 tv    music:plan   from=null to=lobby
 114919 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 115720 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 120487 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 120919 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 121337 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 121769 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 122186 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 123234 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 123826 tv    ss:cancel    speaking=false pending=false
 123829 tv    music:plan   from=lobby to=null
 123829 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 125067 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 125329 tv    music:stop   track=local-forecast-elevator.mp3
 126671 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 127970 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 129274 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 130284 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 131338 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 133868 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 134064 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 134246 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 134436 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 135531 tv    ss:cancel    speaking=false pending=false
 135534 tv    ss:cancel    speaking=false pending=false
 135534 tv    music:plan   from=null to=lobby
 135534 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 137560 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 137567 tv    ss:cancel    speaking=false pending=false
 137569 tv    music:plan   from=lobby to=null
 137569 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 139070 tv    music:stop   track=george-street-shuffle.mp3
 139111 tv    music:plan   from=null to=game:broken-pencil
 139111 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 139112 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140594 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 141064 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 141225 tv    music:plan   from=game:broken-pencil to=null
 141225 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 142726 tv    music:stop   track=backbay-lounge.mp3
```
