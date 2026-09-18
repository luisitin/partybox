# Audio interaction trace

Captured 2026-09-18T03:08:00.511Z on port 42132. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**45 / 45 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.5}]

```
   1775 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1800 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3134 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3309 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   4007 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4634 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
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
   6357 tv    music:plan   from=lobby to=null
   6357 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7865 tv    music:stop   track=airport-lounge.mp3
   8321 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9592 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16578 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17578 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18587 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19573 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20572 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21366 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22153 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22313 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22471 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22627 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22781 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22939 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23082 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23240 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23401 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23557 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23713 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23870 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24028 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24185 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24343 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24502 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24655 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24816 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24974 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25870 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26207 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  28010 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29744 tv    ss:cancel    speaking=false pending=false
  29744 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":1.5}]

```
  31312 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33481 tv    ss:cancel    speaking=false pending=false
  33481 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  35032 tv    ss:cancel    speaking=false pending=false
  35032 tv    music:plan   from=null to=lobby
  35032 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
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
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer cheer@+5361ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":31}]
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=lock,silence,phase,call spoken=o72.wav
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36622 tv    music:plan   from=lobby to=game:bingo
  36622 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36623 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36936 tv    hush
  36936 tv    hush
  37425 tv    music:stop   track=george-street-shuffle.mp3
  39673 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  39867 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39867 tv    clip         src=b9.wav muted=false ready=true
  39867 tv    speak        text=b9.wav voice=clip
  41700 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41700 tv    clip         src=b8.wav muted=false ready=true
  41700 tv    speak        text=b8.wav voice=clip
  43654 tv    hush
  43655 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  43655 tv    hush
  49025 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  52194 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  52398 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52398 tv    clip         src=n34.wav muted=false ready=true
  52398 tv    speak        text=n34.wav voice=clip
  54421 tv    music:paused paused=true
  54421 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  55655 tv    music:paused paused=false
  55655 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  59800 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  59800 tv    clip         src=o72.wav muted=false ready=true
  59800 tv    speak        text=o72.wav voice=clip
  60482 tv    hush
  60482 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  60482 tv    hush
  62370 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  65843 tv    music:duck   ms=9000
  65843 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  70585 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  70595 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  70920 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  71118 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  71118 tv    clip         src=o72.wav muted=false ready=true
  71118 tv    speak        text=o72.wav voice=clip
  75067 tv    ss:cancel    speaking=false pending=false
  75067 tv    music:plan   from=game:bingo to=null
  75067 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  76570 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
  77189 tv    ss:cancel    speaking=false pending=false
  77189 tv    music:plan   from=null to=lobby
  77189 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  80543 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
  80563 tv    ss:cancel    speaking=false pending=false
  80573 tv    music:plan   from=lobby to=game:bingo
  80573 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  80573 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  80583 tv    hush
  80584 tv    hush
  80993 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  81185 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  81185 tv    clip         src=i21.wav muted=false ready=true
  81185 tv    speak        text=i21.wav voice=clip
  81379 tv    music:stop   track=local-forecast-elevator.mp3
  81477 tv    ss:cancel    speaking=false pending=false
  81477 tv    music:plan   from=game:bingo to=null
  81485 tv    ss:cancel    speaking=false pending=false
  81485 tv    music:plan   from=null to=lobby
  81485 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  82288 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":9.4}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
  87045 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  87479 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  87916 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  89074 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
  89677 tv    ss:cancel    speaking=false pending=false
  89690 tv    music:plan   from=lobby to=null
  89690 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  90947 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  91201 tv    music:stop   track=george-street-shuffle.mp3
  92564 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  93895 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
  95222 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  96268 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  97303 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  99853 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 100039 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 100221 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 100404 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 101507 tv    ss:cancel    speaking=false pending=false
 101511 tv    ss:cancel    speaking=false pending=false
 101512 tv    music:plan   from=null to=lobby
 101512 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 103536 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 103551 tv    ss:cancel    speaking=false pending=false
 103555 tv    music:plan   from=lobby to=null
 103555 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 105061 tv    music:stop   track=bossa-antigua.mp3
 105124 tv    music:plan   from=null to=game:broken-pencil
 105124 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 105124 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 106599 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 107031 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 107200 tv    music:plan   from=game:broken-pencil to=null
 107200 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 108701 tv    music:stop   track=backbay-lounge.mp3
```
