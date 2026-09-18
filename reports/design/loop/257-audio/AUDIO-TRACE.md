# Audio interaction trace

Captured 2026-09-18T07:11:52.169Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**49 / 49 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.5}]

```
   1795 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1828 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3194 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3345 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   4050 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4693 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5547 tv    ss:cancel    speaking=false pending=false
```

## B · Lightning Round: start, phases, lock-in, last five seconds, final reveal, results

- ✅ **game start → start cue, lobby music fades to none (Lightning has no music)** — cues=start; plan=lobby→null
- ✅ **no track audible during Lightning** — []
- ✅ **question phase → the generic phase chime (unmapped)** — cues=phase
- ✅ **lock-in → TV lock tick; phone submit cue + 20 ms buzz** — tv=lock; phone=submit buzz=15 20
- ✅ **the phone never plays TV cues (phase/start/win/lock/countdown)** — phone cues=submit
- ✅ **last 5 s → five countdown ticks on the TV, climbing** — ticks=5 semitones=0,2,4,5,7
- ✅ **an unanswered phone buzzes each second, ticks once at 5 s, buzzes at time-up** — buzz=7 phone cues=tick,error
- ✅ **the deadline fired → reveal phase, reveal cue, and NO phase chime on top** — phase=reveal cues=countdown,countdown,countdown,countdown,countdown,reveal
- ✅ **wager phase → wager cue (mapped), no phase chime for it** — cues=phase,reveal,phase,reveal,phase,reveal,phase,reveal,phase,reveal,phase,reveal,phase,reveal,phase,reveal,phase,reveal,wager
- ✅ **final reveal → jackpot or bust cue from the game, no reveal sting on top** — cues=phase,silence,bust
- ✅ **results → one cheer (horn + crowd), no synth win, no music** — cues=cheer; playing=[]
- ✅ **results on the phones → a buzz only (no cue)** — phone cues=none buzz=[60,60,60,60,160]

```
   6414 tv    music:plan   from=lobby to=null
   6414 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7916 tv    music:stop   track=airport-lounge.mp3
   8370 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9663 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16622 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17625 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18625 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19624 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20623 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21420 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22228 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22382 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22535 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22689 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22849 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23009 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23165 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23309 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23465 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23620 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23765 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23925 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24080 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24237 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24395 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24552 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24708 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24851 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  25010 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25912 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26243 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  28055 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29765 tv    ss:cancel    speaking=false pending=false
  29765 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31332 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33518 tv    ss:cancel    speaking=false pending=false
  33518 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  35085 tv    ss:cancel    speaking=false pending=false
  35085 tv    music:plan   from=null to=lobby
  35085 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=phase,call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":15.4}]
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":18.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer cheer@+5369ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":31}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,claim,correct
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=phase,call spoken=o72.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36677 tv    music:plan   from=lobby to=game:bingo
  36678 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36678 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36987 tv    hush
  36987 tv    hush
  37490 tv    music:stop   track=bossa-antigua.mp3
  39733 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  39923 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39923 tv    clip         src=b9.wav muted=false ready=true
  39923 tv    speak        text=b9.wav voice=clip
  41767 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41767 tv    clip         src=b8.wav muted=false ready=true
  41767 tv    speak        text=b8.wav voice=clip
  43446 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  43726 tv    hush
  43726 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  43726 tv    hush
  49085 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  52299 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  52498 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52498 tv    clip         src=n34.wav muted=false ready=true
  52498 tv    speak        text=n34.wav voice=clip
  54521 tv    music:paused paused=true
  54521 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  55777 tv    music:paused paused=false
  55777 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  59907 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  59907 tv    clip         src=o72.wav muted=false ready=true
  59907 tv    speak        text=o72.wav voice=clip
  60304 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  60594 tv    hush
  60594 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  60595 tv    hush
  62470 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  65963 tv    music:duck   ms=9000
  65963 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  71059 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  71250 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  71250 tv    clip         src=o72.wav muted=false ready=true
  71250 tv    speak        text=o72.wav voice=clip
  74660 tv    ss:cancel    speaking=false pending=false
  74660 tv    music:plan   from=game:bingo to=null
  74664 tv    ss:cancel    speaking=false pending=false
  74664 tv    music:plan   from=null to=lobby
  74664 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  75470 tv    music:stop   track=cool-vibes.mp3
  77186 tv    ss:cancel    speaking=false pending=false
  77209 tv    music:plan   from=lobby to=game:bingo
  77209 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  77209 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  77215 tv    hush
  77215 tv    hush
  77829 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  78010 tv    music:stop   track=local-forecast-elevator.mp3
  84889 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84889 tv    clip         src=b14.wav muted=false ready=true
  84889 tv    speak        text=b14.wav voice=clip
  85984 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  86245 tv    hush
  86245 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  86246 tv    hush
  93864 tv    music:duck   ms=9000
  93864 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  93884 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  98870 tv    hush
  98871 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
  98872 tv    hush
 102872 tv    ss:cancel    speaking=false pending=false
 102872 tv    music:plan   from=game:bingo to=null
 102872 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 104374 tv    music:stop   track=wallpaper.mp3
 104459 tv    ss:cancel    speaking=false pending=false
 104460 tv    music:plan   from=null to=lobby
 104460 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 106980 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 106998 tv    ss:cancel    speaking=false pending=false
 107001 tv    music:plan   from=lobby to=game:bingo
 107001 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 107001 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 107008 tv    hush
 107008 tv    hush
 107804 tv    music:stop   track=local-forecast-elevator.mp3
 109147 tv    ss:cancel    speaking=false pending=false
 109147 tv    music:plan   from=game:bingo to=null
 109147 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 110652 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 111260 tv    ss:cancel    speaking=false pending=false
 111260 tv    music:plan   from=null to=lobby
 111260 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 114624 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 114639 tv    ss:cancel    speaking=false pending=false
 114643 tv    music:plan   from=lobby to=game:bingo
 114643 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 114643 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 114650 tv    hush
 114650 tv    hush
 115071 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 115271 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 115271 tv    clip         src=i21.wav muted=false ready=true
 115271 tv    speak        text=i21.wav voice=clip
 115447 tv    music:stop   track=local-forecast-elevator.mp3
 115580 tv    ss:cancel    speaking=false pending=false
 115580 tv    music:plan   from=game:bingo to=null
 115587 tv    ss:cancel    speaking=false pending=false
 115587 tv    music:plan   from=null to=lobby
 115587 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 116392 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":10.2}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 121167 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 121598 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 122035 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 122465 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 122879 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 124045 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 124640 tv    ss:cancel    speaking=false pending=false
 124652 tv    music:plan   from=lobby to=null
 124652 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 125902 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 126154 tv    music:stop   track=bossa-antigua.mp3
 127532 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 128833 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 130167 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 131204 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 132248 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 134834 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 135021 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135213 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 135401 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"lobby-time.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 136507 tv    ss:cancel    speaking=false pending=false
 136513 tv    ss:cancel    speaking=false pending=false
 136513 tv    music:plan   from=null to=lobby
 136513 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 138528 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 138542 tv    ss:cancel    speaking=false pending=false
 138546 tv    music:plan   from=lobby to=null
 138546 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 140055 tv    music:stop   track=airport-lounge.mp3
 140098 tv    music:plan   from=null to=game:broken-pencil
 140098 tv    music:start  plan=game:broken-pencil track=lobby-time mode=chain volume=0.2
 140098 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 141580 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 142040 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 142196 tv    music:plan   from=game:broken-pencil to=null
 142196 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 143703 tv    music:stop   track=lobby-time.mp3
```
