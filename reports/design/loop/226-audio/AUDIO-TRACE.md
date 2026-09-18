# Audio interaction trace

Captured 2026-09-18T00:37:06.025Z on port 42111. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**45 / 45 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.3}]

```
   1772 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1773 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3092 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3228 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3931 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4561 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5411 tv    ss:cancel    speaking=false pending=false
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
   7752 tv    music:stop   track=airport-lounge.mp3
   8189 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9462 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16443 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17448 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18442 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19444 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20446 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21250 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22047 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22202 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22358 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22518 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22672 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22830 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22983 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23139 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23294 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23449 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23591 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23750 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23901 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24061 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24215 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24373 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24529 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24688 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24843 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25718 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26046 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27849 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29588 tv    ss:cancel    speaking=false pending=false
  29588 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31139 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33291 tv    ss:cancel    speaking=false pending=false
  33291 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34840 tv    ss:cancel    speaking=false pending=false
  34840 tv    music:plan   from=null to=lobby
  34840 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=hush,silence,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":15.4}]
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":18.8}]
- ✅ **BINGO → caller hushed, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=silence,sweep,cheer cheer@+5354ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":31.7}]
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going → play resumes, next number spoken, no start/phase chime** — cues=lock,call spoken=n44.wav
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36408 tv    music:plan   from=lobby to=game:bingo
  36408 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36408 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36712 tv    hush
  36712 tv    hush
  37209 tv    music:stop   track=bossa-antigua.mp3
  39464 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39464 tv    clip         src=b9.wav muted=false ready=true
  39464 tv    speak        text=b9.wav voice=clip
  41283 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41283 tv    clip         src=b8.wav muted=false ready=true
  41283 tv    speak        text=b8.wav voice=clip
  43404 tv    hush
  43404 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  43404 tv    hush
  48756 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  51938 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  51938 tv    clip         src=n34.wav muted=false ready=true
  51938 tv    speak        text=n34.wav voice=clip
  54141 tv    music:paused paused=true
  54141 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  55375 tv    music:paused paused=false
  55375 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  56661 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56662 tv    clip         src=n35.wav muted=false ready=true
  56662 tv    speak        text=n35.wav voice=clip
  56760 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56760 tv    clip         src=i25.wav muted=false ready=true
  56760 tv    speak        text=i25.wav voice=clip
  56857 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56857 tv    clip         src=n45.wav muted=false ready=true
  56857 tv    speak        text=n45.wav voice=clip
  56927 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56927 tv    clip         src=n33.wav muted=false ready=true
  56927 tv    speak        text=n33.wav voice=clip
  57021 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57021 tv    clip         src=g49.wav muted=false ready=true
  57021 tv    speak        text=g49.wav voice=clip
  57114 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57114 tv    clip         src=b4.wav muted=false ready=true
  57114 tv    speak        text=b4.wav voice=clip
  57215 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57216 tv    clip         src=i20.wav muted=false ready=true
  57216 tv    speak        text=i20.wav voice=clip
  57303 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57303 tv    clip         src=o69.wav muted=false ready=true
  57303 tv    speak        text=o69.wav voice=clip
  57396 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57396 tv    clip         src=o67.wav muted=false ready=true
  57396 tv    speak        text=o67.wav voice=clip
  57477 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57478 tv    clip         src=o65.wav muted=false ready=true
  57478 tv    speak        text=o65.wav voice=clip
  57584 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57584 tv    clip         src=o73.wav muted=false ready=true
  57584 tv    speak        text=o73.wav voice=clip
  57692 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57692 tv    clip         src=i21.wav muted=false ready=true
  57692 tv    speak        text=i21.wav voice=clip
  57786 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57786 tv    clip         src=i18.wav muted=false ready=true
  57786 tv    speak        text=i18.wav voice=clip
  57872 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57872 tv    clip         src=g58.wav muted=false ready=true
  57872 tv    speak        text=g58.wav voice=clip
  57959 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57959 tv    clip         src=n36.wav muted=false ready=true
  57959 tv    speak        text=n36.wav voice=clip
  58052 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58052 tv    clip         src=o61.wav muted=false ready=true
  58052 tv    speak        text=o61.wav voice=clip
  58146 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58146 tv    clip         src=n37.wav muted=false ready=true
  58146 tv    speak        text=n37.wav voice=clip
  58241 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58241 tv    clip         src=i16.wav muted=false ready=true
  58241 tv    speak        text=i16.wav voice=clip
  58336 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58336 tv    clip         src=g47.wav muted=false ready=true
  58336 tv    speak        text=g47.wav voice=clip
  58431 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58431 tv    clip         src=n41.wav muted=false ready=true
  58431 tv    speak        text=n41.wav voice=clip
  58524 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58524 tv    clip         src=b6.wav muted=false ready=true
  58524 tv    speak        text=b6.wav voice=clip
  58617 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58617 tv    clip         src=o72.wav muted=false ready=true
  58617 tv    speak        text=o72.wav voice=clip
  58711 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58711 tv    clip         src=b3.wav muted=false ready=true
  58711 tv    speak        text=b3.wav voice=clip
  58804 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58804 tv    clip         src=i30.wav muted=false ready=true
  58804 tv    speak        text=i30.wav voice=clip
  58898 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58898 tv    clip         src=g56.wav muted=false ready=true
  58898 tv    speak        text=g56.wav voice=clip
  58992 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58992 tv    clip         src=o75.wav muted=false ready=true
  58992 tv    speak        text=o75.wav voice=clip
  59087 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  59087 tv    clip         src=b1.wav muted=false ready=true
  59087 tv    speak        text=b1.wav voice=clip
  59181 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  59181 tv    clip         src=b2.wav muted=false ready=true
  59181 tv    speak        text=b2.wav voice=clip
  59276 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  59276 tv    clip         src=n32.wav muted=false ready=true
  59276 tv    speak        text=n32.wav voice=clip
  59370 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  59370 tv    clip         src=g48.wav muted=false ready=true
  59370 tv    speak        text=g48.wav voice=clip
  59477 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  59477 tv    clip         src=i23.wav muted=false ready=true
  59477 tv    speak        text=i23.wav voice=clip
  59572 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  59572 tv    clip         src=i26.wav muted=false ready=true
  59572 tv    speak        text=i26.wav voice=clip
  59665 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  59665 tv    clip         src=o66.wav muted=false ready=true
  59665 tv    speak        text=o66.wav voice=clip
  59757 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  59757 tv    clip         src=i19.wav muted=false ready=true
  59757 tv    speak        text=i19.wav voice=clip
  59851 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  59852 tv    clip         src=n42.wav muted=false ready=true
  59852 tv    speak        text=n42.wav voice=clip
  59946 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  59946 tv    clip         src=i24.wav muted=false ready=true
  59946 tv    speak        text=i24.wav voice=clip
  60040 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60040 tv    clip         src=n39.wav muted=false ready=true
  60040 tv    speak        text=n39.wav voice=clip
  60133 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60133 tv    clip         src=g46.wav muted=false ready=true
  60133 tv    speak        text=g46.wav voice=clip
  60951 tv    hush
  60951 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  60951 tv    hush
  62825 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  66305 tv    music:duck   ms=9000
  66305 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  71059 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  71062 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  71062 tv    clip         src=n44.wav muted=false ready=true
  71062 tv    speak        text=n44.wav voice=clip
  73487 tv    ss:cancel    speaking=false pending=false
  73487 tv    music:plan   from=game:bingo to=null
  73487 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  74988 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
  75585 tv    ss:cancel    speaking=false pending=false
  75585 tv    music:plan   from=null to=lobby
  75585 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  78913 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
  78922 tv    ss:cancel    speaking=false pending=false
  78924 tv    music:plan   from=lobby to=game:bingo
  78924 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  78924 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  78927 tv    hush
  78927 tv    hush
  79341 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  79341 tv    clip         src=i21.wav muted=false ready=true
  79341 tv    speak        text=i21.wav voice=clip
  79725 tv    music:stop   track=bossa-antigua.mp3
  79851 tv    ss:cancel    speaking=false pending=false
  79851 tv    music:plan   from=game:bingo to=null
  79854 tv    ss:cancel    speaking=false pending=false
  79854 tv    music:plan   from=null to=lobby
  79854 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  80656 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.07,"t":9.2}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
  85404 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  85821 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  86238 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  87303 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
  87902 tv    ss:cancel    speaking=false pending=false
  87906 tv    music:plan   from=lobby to=null
  87906 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  89149 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  89408 tv    music:stop   track=local-forecast-elevator.mp3
  90872 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  92173 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
  93474 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  94499 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95559 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  98118 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  98311 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  98494 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  98681 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
  99784 tv    ss:cancel    speaking=false pending=false
  99786 tv    ss:cancel    speaking=false pending=false
  99786 tv    music:plan   from=null to=lobby
  99786 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 101803 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 101811 tv    ss:cancel    speaking=false pending=false
 101813 tv    music:plan   from=lobby to=null
 101813 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 103314 tv    music:stop   track=airport-lounge.mp3
 103347 tv    music:plan   from=null to=game:broken-pencil
 103347 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 103347 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 104828 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 105293 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 105452 tv    music:plan   from=game:broken-pencil to=null
 105452 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 106953 tv    music:stop   track=hep-cats.mp3
```
