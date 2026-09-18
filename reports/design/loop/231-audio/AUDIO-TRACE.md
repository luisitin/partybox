# Audio interaction trace

Captured 2026-09-18T01:13:46.773Z on port 42117. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**45 / 45 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.3}]

```
   1755 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1755 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3073 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3208 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3895 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4526 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5375 tv    ss:cancel    speaking=false pending=false
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
   6215 tv    music:plan   from=lobby to=null
   6215 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7715 tv    music:stop   track=local-forecast-elevator.mp3
   8158 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9442 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16415 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17415 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18415 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19414 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20410 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21219 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22002 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22158 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22315 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22473 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22630 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22787 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22944 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23100 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23257 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23415 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23572 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23729 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23884 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24038 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24195 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24353 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24509 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24667 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24825 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25702 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26031 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27837 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29562 tv    ss:cancel    speaking=false pending=false
  29562 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31102 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33236 tv    ss:cancel    speaking=false pending=false
  33236 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34789 tv    ss:cancel    speaking=false pending=false
  34789 tv    music:plan   from=null to=lobby
  34789 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":15.4}]
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":18.9}]
- ✅ **BINGO → caller hushed, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer cheer@+5356ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":30.3}]
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going → play resumes, next number spoken, no start/phase chime** — cues=lock,call spoken=b3.wav
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36357 tv    music:plan   from=lobby to=game:bingo
  36357 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36357 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36660 tv    hush
  36660 tv    hush
  37157 tv    music:stop   track=airport-lounge.mp3
  39410 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39410 tv    clip         src=b9.wav muted=false ready=true
  39410 tv    speak        text=b9.wav voice=clip
  41229 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41229 tv    clip         src=b8.wav muted=false ready=true
  41229 tv    speak        text=b8.wav voice=clip
  43363 tv    hush
  43363 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  43363 tv    hush
  48716 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  51914 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  51915 tv    clip         src=n34.wav muted=false ready=true
  51915 tv    speak        text=n34.wav voice=clip
  54106 tv    music:paused paused=true
  54106 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  55338 tv    music:paused paused=false
  55338 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  56623 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56623 tv    clip         src=n35.wav muted=false ready=true
  56623 tv    speak        text=n35.wav voice=clip
  56718 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56718 tv    clip         src=i25.wav muted=false ready=true
  56718 tv    speak        text=i25.wav voice=clip
  56812 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56812 tv    clip         src=n45.wav muted=false ready=true
  56812 tv    speak        text=n45.wav voice=clip
  56906 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56906 tv    clip         src=n33.wav muted=false ready=true
  56906 tv    speak        text=n33.wav voice=clip
  57000 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57000 tv    clip         src=g49.wav muted=false ready=true
  57000 tv    speak        text=g49.wav voice=clip
  57096 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57096 tv    clip         src=b4.wav muted=false ready=true
  57096 tv    speak        text=b4.wav voice=clip
  57188 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57189 tv    clip         src=i20.wav muted=false ready=true
  57189 tv    speak        text=i20.wav voice=clip
  57284 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57284 tv    clip         src=o69.wav muted=false ready=true
  57284 tv    speak        text=o69.wav voice=clip
  57378 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57378 tv    clip         src=o67.wav muted=false ready=true
  57378 tv    speak        text=o67.wav voice=clip
  57472 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57472 tv    clip         src=o65.wav muted=false ready=true
  57472 tv    speak        text=o65.wav voice=clip
  57566 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57566 tv    clip         src=o73.wav muted=false ready=true
  57566 tv    speak        text=o73.wav voice=clip
  57662 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57662 tv    clip         src=i21.wav muted=false ready=true
  57662 tv    speak        text=i21.wav voice=clip
  57757 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57757 tv    clip         src=i18.wav muted=false ready=true
  57757 tv    speak        text=i18.wav voice=clip
  57852 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57852 tv    clip         src=g58.wav muted=false ready=true
  57852 tv    speak        text=g58.wav voice=clip
  57946 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57946 tv    clip         src=n36.wav muted=false ready=true
  57946 tv    speak        text=n36.wav voice=clip
  58041 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58041 tv    clip         src=o61.wav muted=false ready=true
  58041 tv    speak        text=o61.wav voice=clip
  58134 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58134 tv    clip         src=n37.wav muted=false ready=true
  58134 tv    speak        text=n37.wav voice=clip
  58228 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58228 tv    clip         src=i16.wav muted=false ready=true
  58228 tv    speak        text=i16.wav voice=clip
  58323 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58323 tv    clip         src=g47.wav muted=false ready=true
  58323 tv    speak        text=g47.wav voice=clip
  58415 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58415 tv    clip         src=n41.wav muted=false ready=true
  58415 tv    speak        text=n41.wav voice=clip
  58509 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58509 tv    clip         src=b6.wav muted=false ready=true
  58509 tv    speak        text=b6.wav voice=clip
  58602 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58602 tv    clip         src=o72.wav muted=false ready=true
  58602 tv    speak        text=o72.wav voice=clip
  59443 tv    hush
  59443 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  59443 tv    hush
  61318 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  64799 tv    music:duck   ms=9000
  64799 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  69538 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  69542 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  69542 tv    clip         src=b3.wav muted=false ready=true
  69542 tv    speak        text=b3.wav voice=clip
  71968 tv    ss:cancel    speaking=false pending=false
  71968 tv    music:plan   from=game:bingo to=null
  71968 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  73469 tv    music:stop   track=cool-vibes.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
  74065 tv    ss:cancel    speaking=false pending=false
  74065 tv    music:plan   from=null to=lobby
  74065 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  77407 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
  77423 tv    ss:cancel    speaking=false pending=false
  77425 tv    music:plan   from=lobby to=game:bingo
  77425 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  77425 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  77429 tv    hush
  77429 tv    hush
  77854 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  77855 tv    clip         src=i21.wav muted=false ready=true
  77855 tv    speak        text=i21.wav voice=clip
  78225 tv    music:stop   track=george-street-shuffle.mp3
  78348 tv    ss:cancel    speaking=false pending=false
  78348 tv    music:plan   from=game:bingo to=null
  78351 tv    ss:cancel    speaking=false pending=false
  78351 tv    music:plan   from=null to=lobby
  78351 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  79153 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":9.2}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
  83919 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  84335 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  84769 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  85819 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
  86420 tv    ss:cancel    speaking=false pending=false
  86424 tv    music:plan   from=lobby to=null
  86424 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  87667 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  87924 tv    music:stop   track=george-street-shuffle.mp3
  89237 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  90537 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
  91837 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  92845 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  93893 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  96432 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  96624 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  96798 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  96984 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
  98081 tv    ss:cancel    speaking=false pending=false
  98083 tv    ss:cancel    speaking=false pending=false
  98083 tv    music:plan   from=null to=lobby
  98083 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 100091 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 100100 tv    ss:cancel    speaking=false pending=false
 100102 tv    music:plan   from=lobby to=null
 100102 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 101602 tv    music:stop   track=airport-lounge.mp3
 101638 tv    music:plan   from=null to=game:broken-pencil
 101638 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 101638 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 103111 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 103579 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 103732 tv    music:plan   from=game:broken-pencil to=null
 103732 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 105233 tv    music:stop   track=backbay-lounge.mp3
```
