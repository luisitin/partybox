# Audio interaction trace

Captured 2026-09-18T05:02:21.617Z on port 42162. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**48 / 48 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.4}]

```
   1858 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1891 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3215 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3353 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   4044 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4685 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5538 tv    ss:cancel    speaking=false pending=false
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
   6376 tv    music:plan   from=lobby to=null
   6376 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7880 tv    music:stop   track=local-forecast-elevator.mp3
   8334 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9640 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16585 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17585 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18586 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19586 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20585 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21380 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22180 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22338 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22495 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22654 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22808 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22950 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23106 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23263 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23420 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23577 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23731 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23889 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24046 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24204 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24361 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24519 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24672 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24831 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24987 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25869 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26200 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  28003 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29738 tv    ss:cancel    speaking=false pending=false
  29740 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31292 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33462 tv    ss:cancel    speaking=false pending=false
  33462 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  35012 tv    ss:cancel    speaking=false pending=false
  35012 tv    music:plan   from=null to=lobby
  35012 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=phase,call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":15.4}]
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":18.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer cheer@+5369ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":31}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,claim,correct
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=lock,silence,phase,call spoken=o72.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=lock,tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36590 tv    music:plan   from=lobby to=game:bingo
  36590 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36590 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36901 tv    hush
  36901 tv    hush
  37393 tv    music:stop   track=airport-lounge.mp3
  39656 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  39850 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39850 tv    clip         src=b9.wav muted=false ready=true
  39850 tv    speak        text=b9.wav voice=clip
  41673 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41673 tv    clip         src=b8.wav muted=false ready=true
  41673 tv    speak        text=b8.wav voice=clip
  43615 tv    hush
  43615 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  43615 tv    hush
  48969 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  52156 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  52347 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52347 tv    clip         src=n34.wav muted=false ready=true
  52347 tv    speak        text=n34.wav voice=clip
  54386 tv    music:paused paused=true
  54387 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  55652 tv    music:paused paused=false
  55653 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  59717 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  59717 tv    clip         src=o72.wav muted=false ready=true
  59717 tv    speak        text=o72.wav voice=clip
  60421 tv    hush
  60421 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  60422 tv    hush
  62298 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  65790 tv    music:duck   ms=9000
  65790 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  70533 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  70546 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  70870 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  71062 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  71062 tv    clip         src=o72.wav muted=false ready=true
  71062 tv    speak        text=o72.wav voice=clip
  74472 tv    ss:cancel    speaking=false pending=false
  74472 tv    music:plan   from=game:bingo to=null
  74477 tv    ss:cancel    speaking=false pending=false
  74477 tv    music:plan   from=null to=lobby
  74477 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  75285 tv    music:stop   track=cool-vibes.mp3
  77005 tv    ss:cancel    speaking=false pending=false
  77023 tv    music:plan   from=lobby to=game:bingo
  77023 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  77023 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  77029 tv    hush
  77029 tv    hush
  77635 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  77833 tv    music:stop   track=george-street-shuffle.mp3
  84816 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84816 tv    clip         src=b14.wav muted=false ready=true
  84817 tv    speak        text=b14.wav voice=clip
  86238 tv    hush
  86238 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  86239 tv    hush
  93851 tv    music:duck   ms=9000
  93851 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  98861 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  98868 tv    hush
  98868 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
  98869 tv    hush
 102845 tv    ss:cancel    speaking=false pending=false
 102845 tv    music:plan   from=game:bingo to=null
 102845 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 104347 tv    music:stop   track=wallpaper.mp3
 104438 tv    ss:cancel    speaking=false pending=false
 104438 tv    music:plan   from=null to=lobby
 104438 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 106961 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 106980 tv    ss:cancel    speaking=false pending=false
 106984 tv    music:plan   from=lobby to=game:bingo
 106984 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 106984 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 106992 tv    hush
 106992 tv    hush
 107791 tv    music:stop   track=local-forecast-elevator.mp3
 109118 tv    ss:cancel    speaking=false pending=false
 109118 tv    music:plan   from=game:bingo to=null
 109118 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 110624 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 111236 tv    ss:cancel    speaking=false pending=false
 111236 tv    music:plan   from=null to=lobby
 111236 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 114583 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 114599 tv    ss:cancel    speaking=false pending=false
 114603 tv    music:plan   from=lobby to=game:bingo
 114603 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 114603 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 114610 tv    hush
 114610 tv    hush
 115029 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 115223 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 115223 tv    clip         src=i21.wav muted=false ready=true
 115223 tv    speak        text=i21.wav voice=clip
 115413 tv    music:stop   track=george-street-shuffle.mp3
 115537 tv    ss:cancel    speaking=false pending=false
 115537 tv    music:plan   from=game:bingo to=null
 115543 tv    ss:cancel    speaking=false pending=false
 115543 tv    music:plan   from=null to=lobby
 115543 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 116347 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":10.2}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 121126 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 121559 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 121991 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 122409 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 122840 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 123956 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 124559 tv    ss:cancel    speaking=false pending=false
 124567 tv    music:plan   from=lobby to=null
 124567 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 125824 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 126082 tv    music:stop   track=bossa-antigua.mp3
 127462 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 128762 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 130062 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 131121 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 132165 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 134741 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 134923 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135098 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 135292 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 136420 tv    ss:cancel    speaking=false pending=false
 136425 tv    ss:cancel    speaking=false pending=false
 136425 tv    music:plan   from=null to=lobby
 136425 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 138441 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 138453 tv    ss:cancel    speaking=false pending=false
 138456 tv    music:plan   from=lobby to=null
 138456 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 139962 tv    music:stop   track=local-forecast-elevator.mp3
 140013 tv    music:plan   from=null to=game:broken-pencil
 140013 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 140013 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 141492 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 141958 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 142118 tv    music:plan   from=game:broken-pencil to=null
 142118 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 143624 tv    music:stop   track=backbay-lounge.mp3
```
