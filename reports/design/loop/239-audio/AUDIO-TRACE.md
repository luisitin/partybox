# Audio interaction trace

Captured 2026-09-18T02:53:20.809Z on port 42130. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**45 / 45 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:george-street-shuffle
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":4.4}]

```
   1731 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   1757 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3087 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3222 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3923 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4569 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5426 tv    ss:cancel    speaking=false pending=false
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
   6273 tv    music:plan   from=lobby to=null
   6273 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7779 tv    music:stop   track=george-street-shuffle.mp3
   8226 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9516 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16478 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17489 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18479 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19477 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20477 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21275 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22117 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22273 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22431 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22588 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22740 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22902 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23058 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23222 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23375 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23539 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23685 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23827 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23983 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24140 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24298 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24462 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24596 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24755 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24898 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25791 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26096 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27911 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29649 tv    ss:cancel    speaking=false pending=false
  29649 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":1.5}]

```
  31214 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33388 tv    ss:cancel    speaking=false pending=false
  33388 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34949 tv    ss:cancel    speaking=false pending=false
  34949 tv    music:plan   from=null to=lobby
  34949 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:local-forecast-elevator.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=phase,call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":15.4}]
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":18.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer cheer@+5369ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":31}]
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=lock,silence,phase,call spoken=o72.wav
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36546 tv    music:plan   from=lobby to=game:bingo
  36546 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36546 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36860 tv    hush
  36860 tv    hush
  37352 tv    music:stop   track=local-forecast-elevator.mp3
  39595 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  39787 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39787 tv    clip         src=b9.wav muted=false ready=true
  39788 tv    speak        text=b9.wav voice=clip
  41609 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41609 tv    clip         src=b8.wav muted=false ready=true
  41609 tv    speak        text=b8.wav voice=clip
  43552 tv    hush
  43552 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  43552 tv    hush
  48907 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  52111 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  52313 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52313 tv    clip         src=n34.wav muted=false ready=true
  52313 tv    speak        text=n34.wav voice=clip
  54308 tv    music:paused paused=true
  54308 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  55580 tv    music:paused paused=false
  55581 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  59710 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  59710 tv    clip         src=o72.wav muted=false ready=true
  59710 tv    speak        text=o72.wav voice=clip
  60417 tv    hush
  60417 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  60417 tv    hush
  62303 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  65786 tv    music:duck   ms=9000
  65786 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  70509 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  70521 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  70833 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  71035 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  71035 tv    clip         src=o72.wav muted=false ready=true
  71035 tv    speak        text=o72.wav voice=clip
  74968 tv    ss:cancel    speaking=false pending=false
  74968 tv    music:plan   from=game:bingo to=null
  74968 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  76474 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
  77081 tv    ss:cancel    speaking=false pending=false
  77081 tv    music:plan   from=null to=lobby
  77081 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  80427 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
  80443 tv    ss:cancel    speaking=false pending=false
  80446 tv    music:plan   from=lobby to=game:bingo
  80446 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  80446 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  80453 tv    hush
  80454 tv    hush
  80876 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  81068 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  81068 tv    clip         src=i21.wav muted=false ready=true
  81068 tv    speak        text=i21.wav voice=clip
  81257 tv    music:stop   track=george-street-shuffle.mp3
  81381 tv    ss:cancel    speaking=false pending=false
  81381 tv    music:plan   from=game:bingo to=null
  81387 tv    ss:cancel    speaking=false pending=false
  81387 tv    music:plan   from=null to=lobby
  81387 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  82202 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.07,"t":9.4}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
  86971 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  87400 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  87919 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  89080 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
  89649 tv    ss:cancel    speaking=false pending=false
  89657 tv    music:plan   from=lobby to=null
  89657 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  90916 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  91158 tv    music:stop   track=local-forecast-elevator.mp3
  92521 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  93821 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
  95155 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  96214 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  97259 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  99800 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  99990 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 100178 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 100369 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 101465 tv    ss:cancel    speaking=false pending=false
 101470 tv    ss:cancel    speaking=false pending=false
 101470 tv    music:plan   from=null to=lobby
 101470 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 103519 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 103530 tv    ss:cancel    speaking=false pending=false
 103534 tv    music:plan   from=lobby to=null
 103534 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 105040 tv    music:stop   track=george-street-shuffle.mp3
 105092 tv    music:plan   from=null to=game:broken-pencil
 105092 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 105092 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 106569 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 107036 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 107211 tv    music:plan   from=game:broken-pencil to=null
 107211 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 108722 tv    music:stop   track=backbay-lounge.mp3
```
