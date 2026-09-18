# Audio interaction trace

Captured 2026-09-18T03:29:36.478Z on port 42139. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**46 / 46 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:bossa-antigua
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":4.4}]

```
   1781 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   1825 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3140 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3276 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3971 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4610 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5462 tv    ss:cancel    speaking=false pending=false
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
   6319 tv    music:plan   from=lobby to=null
   6319 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7821 tv    music:stop   track=bossa-antigua.mp3
   8277 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9582 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16538 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17533 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18529 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19541 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20535 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21308 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22116 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22274 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22431 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22589 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22747 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22905 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23064 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23222 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23379 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23536 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23693 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23853 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24008 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24167 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24324 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24480 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24637 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24794 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24940 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25832 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26151 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27959 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29692 tv    ss:cancel    speaking=false pending=false
  29692 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":1.5}]

```
  31249 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33421 tv    ss:cancel    speaking=false pending=false
  33421 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34968 tv    ss:cancel    speaking=false pending=false
  34968 tv    music:plan   from=null to=lobby
  34968 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:george-street-shuffle.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=phase,call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":15.4}]
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":18.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer cheer@+5365ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":33.2}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,claim,correct
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=lock,silence,phase,call spoken=b15.wav
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36550 tv    music:plan   from=lobby to=game:bingo
  36550 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36550 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36858 tv    hush
  36858 tv    hush
  37358 tv    music:stop   track=george-street-shuffle.mp3
  39599 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  39790 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39790 tv    clip         src=b9.wav muted=false ready=true
  39790 tv    speak        text=b9.wav voice=clip
  41620 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41620 tv    clip         src=b8.wav muted=false ready=true
  41620 tv    speak        text=b8.wav voice=clip
  43564 tv    hush
  43564 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  43565 tv    hush
  48927 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  52101 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  52295 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52295 tv    clip         src=n34.wav muted=false ready=true
  52295 tv    speak        text=n34.wav voice=clip
  54305 tv    music:paused paused=true
  54305 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  55566 tv    music:paused paused=false
  55566 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  61961 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61962 tv    clip         src=b15.wav muted=false ready=true
  61962 tv    speak        text=b15.wav voice=clip
  62600 tv    hush
  62600 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  62601 tv    hush
  64491 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  67965 tv    music:duck   ms=9000
  67965 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  72706 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  72716 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  73042 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  73245 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  73245 tv    clip         src=b15.wav muted=false ready=true
  73245 tv    speak        text=b15.wav voice=clip
  77201 tv    ss:cancel    speaking=false pending=false
  77201 tv    music:plan   from=game:bingo to=null
  77201 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  78705 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
  79328 tv    ss:cancel    speaking=false pending=false
  79328 tv    music:plan   from=null to=lobby
  79328 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  82681 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
  82703 tv    ss:cancel    speaking=false pending=false
  82707 tv    music:plan   from=lobby to=game:bingo
  82707 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  82707 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  82714 tv    hush
  82715 tv    hush
  83134 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  83324 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  83325 tv    clip         src=i21.wav muted=false ready=true
  83325 tv    speak        text=i21.wav voice=clip
  83513 tv    music:stop   track=bossa-antigua.mp3
  83628 tv    ss:cancel    speaking=false pending=false
  83628 tv    music:plan   from=game:bingo to=null
  83636 tv    ss:cancel    speaking=false pending=false
  83636 tv    music:plan   from=null to=lobby
  83636 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  84444 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":9.4}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
  89202 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  89636 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  90051 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  91247 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
  91873 tv    ss:cancel    speaking=false pending=false
  91883 tv    music:plan   from=lobby to=null
  91883 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  93162 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  93388 tv    music:stop   track=george-street-shuffle.mp3
  94774 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  96077 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
  97405 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  98467 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  99502 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 102053 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 102243 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 102433 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 102625 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 103713 tv    ss:cancel    speaking=false pending=false
 103717 tv    ss:cancel    speaking=false pending=false
 103717 tv    music:plan   from=null to=lobby
 103717 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 105728 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 105741 tv    ss:cancel    speaking=false pending=false
 105743 tv    music:plan   from=lobby to=null
 105744 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 107250 tv    music:stop   track=local-forecast-elevator.mp3
 107296 tv    music:plan   from=null to=game:broken-pencil
 107296 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 107296 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 108799 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 109252 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 109408 tv    music:plan   from=game:broken-pencil to=null
 109409 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 110912 tv    music:stop   track=hep-cats.mp3
```
