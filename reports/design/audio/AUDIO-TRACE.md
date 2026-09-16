# Audio interaction trace

Captured 2026-09-16T21:51:50.640Z on port 42145. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**45 / 45 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.3}]

```
   1857 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1858 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3164 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3296 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3991 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4617 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5466 tv    ss:cancel    speaking=false pending=false
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
   6309 tv    music:plan   from=lobby to=null
   6309 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7810 tv    music:stop   track=local-forecast-elevator.mp3
   8256 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9532 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16522 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17508 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18511 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19507 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20523 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21311 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22106 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22264 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22418 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22572 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22729 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22886 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23041 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23197 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23355 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23511 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23667 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23825 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23982 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24137 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24292 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24450 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24606 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24762 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24920 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25793 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26126 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27934 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29653 tv    ss:cancel    speaking=false pending=false
  29653 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31193 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33343 tv    ss:cancel    speaking=false pending=false
  33343 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34877 tv    ss:cancel    speaking=false pending=false
  34877 tv    music:plan   from=null to=lobby
  34877 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two spoken calls in Zira** — cues=call,call; spoken=B, 9. | B, 8. voice=Microsoft Zira - English (United States)
- ✅ **the phones stay silent during calls**
- ✅ **wrong claim → caller hushed at once, buzzer after the card lands, no chime on entry, nothing spoken** — events=hush,ss:cancel,silence,hush,ss:cancel,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":8.9}]
- ✅ **play resumes → the next number is spoken** — spoken=N, 34.
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":12.3}]
- ✅ **BINGO → caller hushed, cheer once after the card lands (~1.3 s), no chime on entry, music continues** — cues=silence,cheer cheer@+1306ms playing=[{"track":"wallpaper.mp3","vol":0.2,"t":19}]
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going → play resumes, next number spoken, no start/phase chime** — cues=lock,call spoken=N, 44.
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36444 tv    music:plan   from=lobby to=game:bingo
  36444 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36444 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36750 tv    hush         speaking=false pending=false
  36750 tv    ss:cancel    speaking=false pending=false
  36750 tv    hush         speaking=false pending=false
  36750 tv    ss:cancel    speaking=false pending=false
  37252 tv    music:stop   track=bossa-antigua.mp3
  39503 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39804 tv    ss:cancel    speaking=false pending=false
  39887 tv    speak        text=B, 9. voice=Microsoft Zira - English (United States)
  39887 tv    ss:speak     text=B, 9.
  41320 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41621 tv    ss:cancel    speaking=true pending=false
  41705 tv    speak        text=B, 8. voice=Microsoft Zira - English (United States)
  41705 tv    ss:speak     text=B, 8.
  43181 tv    hush         speaking=true pending=false
  43181 tv    ss:cancel    speaking=true pending=false
  43182 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  43182 tv    hush         speaking=false pending=false
  43182 tv    ss:cancel    speaking=false pending=false
  44482 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  45409 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45715 tv    ss:cancel    speaking=false pending=false
  45804 tv    speak        text=N, 34. voice=Microsoft Zira - English (United States)
  45804 tv    ss:speak     text=N, 34.
  47628 tv    music:paused paused=true
  47629 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  48879 tv    music:paused paused=false
  48879 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  50151 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  50243 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  50338 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  50433 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  50524 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  50619 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  50713 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  50807 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  50901 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  50997 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  51092 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  51198 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  51292 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  51384 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  51478 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  51571 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  51665 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  51759 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  51854 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  51948 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52044 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52137 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52230 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52324 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52418 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52513 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52607 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52701 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52795 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52890 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52968 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  53076 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  53170 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  53250 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  53357 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  53452 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  53547 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  53640 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  53949 tv    ss:cancel    speaking=false pending=false
  54037 tv    speak        text=G, 46. voice=Microsoft Zira - English (United States)
  54037 tv    ss:speak     text=G, 46.
  54214 tv    hush         speaking=true pending=false
  54214 tv    ss:cancel    speaking=true pending=false
  54214 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  54214 tv    hush         speaking=false pending=false
  54214 tv    ss:cancel    speaking=false pending=false
  55520 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  58313 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  58316 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58621 tv    ss:cancel    speaking=false pending=false
  58703 tv    speak        text=N, 44. voice=Microsoft Zira - English (United States)
  58703 tv    ss:speak     text=N, 44.
  60741 tv    ss:cancel    speaking=true pending=false
  60741 tv    music:plan   from=game:bingo to=null
  60741 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  62245 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
  62839 tv    ss:cancel    speaking=false pending=false
  62839 tv    music:plan   from=null to=lobby
  62839 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  66186 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
  66196 tv    ss:cancel    speaking=false pending=false
  66197 tv    music:plan   from=lobby to=game:bingo
  66197 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  66197 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  66202 tv    hush         speaking=false pending=false
  66202 tv    ss:cancel    speaking=false pending=false
  66202 tv    hush         speaking=false pending=false
  66202 tv    ss:cancel    speaking=false pending=false
  66626 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  66933 tv    ss:cancel    speaking=false pending=false
  67003 tv    music:stop   track=george-street-shuffle.mp3
  67020 tv    speak        text=I, 21. voice=Microsoft Zira - English (United States)
  67020 tv    ss:speak     text=I, 21.
  67123 tv    ss:cancel    speaking=true pending=false
  67123 tv    music:plan   from=game:bingo to=null
  67126 tv    ss:cancel    speaking=false pending=false
  67126 tv    music:plan   from=null to=lobby
  67126 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  67934 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.07,"t":9.2}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
  72695 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  73111 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  73543 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  74626 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
  75221 tv    ss:cancel    speaking=false pending=false
  75224 tv    music:plan   from=lobby to=null
  75224 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  76462 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  76736 tv    music:stop   track=local-forecast-elevator.mp3
  78061 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  79362 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
  80661 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  81663 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  82714 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  85279 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  85466 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  85653 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  85844 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"lobby-time.mp3","vol":0.2,"t":1.4}]
- ✅ **show → reveal sting (mapped), music stops (show)** — cues=phase,phase,reveal playing=[]

```
  86938 tv    ss:cancel    speaking=false pending=false
  86940 tv    ss:cancel    speaking=false pending=false
  86940 tv    music:plan   from=null to=lobby
  86940 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  88956 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
  88961 tv    ss:cancel    speaking=false pending=false
  88962 tv    music:plan   from=lobby to=null
  88962 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  90465 tv    music:stop   track=bossa-antigua.mp3
  90502 tv    music:plan   from=null to=game:broken-pencil
  90502 tv    music:start  plan=game:broken-pencil track=lobby-time mode=chain volume=0.2
  90502 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  91978 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  92433 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  92591 tv    music:plan   from=game:broken-pencil to=null
  92591 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  94096 tv    music:stop   track=lobby-time.mp3
```
