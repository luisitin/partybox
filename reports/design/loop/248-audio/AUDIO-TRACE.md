# Audio interaction trace

Captured 2026-09-18T04:53:59.033Z on port 42160. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**48 / 48 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.4}]

```
   1755 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1784 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3107 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3268 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3968 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4600 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5425 tv    ss:cancel    speaking=false pending=false
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
   6282 tv    music:plan   from=lobby to=null
   6282 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7782 tv    music:stop   track=local-forecast-elevator.mp3
   8235 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9557 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16500 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17488 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18489 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19492 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20494 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21273 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22102 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22245 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22404 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22559 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22709 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22867 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23036 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23173 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23339 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23499 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23654 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23817 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23975 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24133 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24287 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24462 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24620 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24775 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24931 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25810 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26140 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27946 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29677 tv    ss:cancel    speaking=false pending=false
  29682 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":1.5}]

```
  31243 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33438 tv    ss:cancel    speaking=false pending=false
  33438 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  35016 tv    ss:cancel    speaking=false pending=false
  35016 tv    music:plan   from=null to=lobby
  35016 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:george-street-shuffle.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=phase,call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":15.5}]
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":19}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer cheer@+5358ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":31.2}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=lock,silence,phase,call spoken=o72.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=lock,tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36586 tv    music:plan   from=lobby to=game:bingo
  36586 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36586 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36898 tv    hush
  36898 tv    hush
  37387 tv    music:stop   track=george-street-shuffle.mp3
  39650 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  39844 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39844 tv    clip         src=b9.wav muted=false ready=true
  39844 tv    speak        text=b9.wav voice=clip
  41680 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41680 tv    clip         src=b8.wav muted=false ready=true
  41680 tv    speak        text=b8.wav voice=clip
  43611 tv    hush
  43611 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  43612 tv    hush
  48966 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  52174 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  52365 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52365 tv    clip         src=n34.wav muted=false ready=true
  52365 tv    speak        text=n34.wav voice=clip
  54416 tv    music:paused paused=true
  54416 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  55670 tv    music:paused paused=false
  55670 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  59839 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  59839 tv    clip         src=o72.wav muted=false ready=true
  59839 tv    speak        text=o72.wav voice=clip
  60584 tv    hush
  60585 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  60585 tv    hush
  62465 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  65942 tv    music:duck   ms=9000
  65942 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  70680 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  70693 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  71015 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  71211 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  71211 tv    clip         src=o72.wav muted=false ready=true
  71211 tv    speak        text=o72.wav voice=clip
  74619 tv    ss:cancel    speaking=false pending=false
  74619 tv    music:plan   from=game:bingo to=null
  74623 tv    ss:cancel    speaking=false pending=false
  74624 tv    music:plan   from=null to=lobby
  74624 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  75438 tv    music:stop   track=wallpaper.mp3
  77148 tv    ss:cancel    speaking=false pending=false
  77164 tv    music:plan   from=lobby to=game:bingo
  77164 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  77164 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  77170 tv    hush
  77170 tv    hush
  77772 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  77972 tv    music:stop   track=george-street-shuffle.mp3
  84850 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84850 tv    clip         src=b14.wav muted=false ready=true
  84850 tv    speak        text=b14.wav voice=clip
  86306 tv    hush
  86307 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  86307 tv    hush
  93921 tv    music:duck   ms=9000
  93921 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  98931 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  98941 tv    hush
  98941 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
  98942 tv    hush
 102928 tv    ss:cancel    speaking=false pending=false
 102928 tv    music:plan   from=game:bingo to=null
 102928 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 104428 tv    music:stop   track=wallpaper.mp3
 104568 tv    ss:cancel    speaking=false pending=false
 104569 tv    music:plan   from=null to=lobby
 104569 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 107088 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 107105 tv    ss:cancel    speaking=false pending=false
 107112 tv    music:plan   from=lobby to=game:bingo
 107112 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 107112 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 107118 tv    hush
 107119 tv    hush
 107914 tv    music:stop   track=bossa-antigua.mp3
 109241 tv    ss:cancel    speaking=false pending=false
 109241 tv    music:plan   from=game:bingo to=null
 109241 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 110753 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 111349 tv    ss:cancel    speaking=false pending=false
 111349 tv    music:plan   from=null to=lobby
 111350 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 114727 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 114747 tv    ss:cancel    speaking=false pending=false
 114751 tv    music:plan   from=lobby to=game:bingo
 114751 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 114751 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 114759 tv    hush
 114760 tv    hush
 115172 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 115367 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 115367 tv    clip         src=i21.wav muted=false ready=true
 115367 tv    speak        text=i21.wav voice=clip
 115553 tv    music:stop   track=local-forecast-elevator.mp3
 115668 tv    ss:cancel    speaking=false pending=false
 115668 tv    music:plan   from=game:bingo to=null
 115675 tv    ss:cancel    speaking=false pending=false
 115675 tv    music:plan   from=null to=lobby
 115675 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 116484 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.07,"t":10.2}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 121275 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 121702 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 122139 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 122573 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 122989 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 124158 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 124750 tv    ss:cancel    speaking=false pending=false
 124760 tv    music:plan   from=lobby to=null
 124760 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 126027 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 126263 tv    music:stop   track=local-forecast-elevator.mp3
 127663 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 129004 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 130344 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 131428 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 132488 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135074 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 135257 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135441 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 135616 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 136734 tv    ss:cancel    speaking=false pending=false
 136742 tv    ss:cancel    speaking=false pending=false
 136742 tv    music:plan   from=null to=lobby
 136742 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 138773 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 138790 tv    ss:cancel    speaking=false pending=false
 138793 tv    music:plan   from=lobby to=null
 138793 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 140309 tv    music:stop   track=airport-lounge.mp3
 140383 tv    music:plan   from=null to=game:broken-pencil
 140383 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 140383 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 141847 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 142307 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 142463 tv    music:plan   from=game:broken-pencil to=null
 142463 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 143965 tv    music:stop   track=backbay-lounge.mp3
```
