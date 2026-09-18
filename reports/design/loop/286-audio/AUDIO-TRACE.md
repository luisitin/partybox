# Audio interaction trace

Captured 2026-09-18T12:38:55.963Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**54 / 54 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:bossa-antigua
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":4.4}]

```
   1770 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   1795 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3108 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3245 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3936 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
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
   6237 tv    music:plan   from=lobby to=null
   6237 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7738 tv    music:stop   track=bossa-antigua.mp3
   8184 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9463 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16444 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17443 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18443 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19446 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20451 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21250 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22039 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22197 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22352 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22493 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22651 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22810 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22965 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23127 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23280 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23438 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23595 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23751 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23909 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24066 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24223 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24382 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24536 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24679 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24834 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25696 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26022 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27830 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29555 tv    ss:cancel    speaking=false pending=false
  29555 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":1.5}]

```
  31104 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33238 tv    ss:cancel    speaking=false pending=false
  33238 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34795 tv    ss:cancel    speaking=false pending=false
  34795 tv    music:plan   from=null to=lobby
  34795 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:george-street-shuffle.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+974ms phone@+985ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,silence,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,silence,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,lock cheer@+5358ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.5}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5409ms cheer@+5368ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=3 lastTickIdx=2
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36372 tv    music:plan   from=lobby to=game:bingo
  36372 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36373 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36676 tv    hush
  36676 tv    hush
  37173 tv    music:stop   track=george-street-shuffle.mp3
  37287 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38428 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39428 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40427 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41370 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41563 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41563 tv    clip         src=b9.wav muted=false ready=true
  41563 tv    speak        text=b9.wav voice=clip
  43215 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43215 tv    clip         src=b8.wav muted=false ready=true
  43215 tv    speak        text=b8.wav voice=clip
  45046 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45046 tv    clip         src=n34.wav muted=false ready=true
  45046 tv    speak        text=n34.wav voice=clip
  46723 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  46987 tv    hush
  46987 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  46988 tv    hush
  52347 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  52351 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55344 tv    hush
  55345 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  55345 tv    hush
  56346 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57345 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58542 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58543 tv    clip         src=n35.wav muted=false ready=true
  58543 tv    speak        text=n35.wav voice=clip
  60131 tv    music:paused paused=true
  60131 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61390 tv    music:paused paused=false
  61390 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  67893 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  67893 tv    clip         src=g57.wav muted=false ready=true
  67894 tv    speak        text=g57.wav voice=clip
  68308 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68596 tv    hush
  68596 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68596 tv    hush
  70470 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73954 tv    music:duck   ms=9000
  73954 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  74003 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  78763 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79089 tv    hush
  79089 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  79089 tv    hush
  80092 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81090 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82282 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  82282 tv    clip         src=g57.wav muted=false ready=true
  82282 tv    speak        text=g57.wav voice=clip
  84400 tv    ss:cancel    speaking=false pending=false
  84400 tv    music:plan   from=game:bingo to=null
  84403 tv    ss:cancel    speaking=false pending=false
  84403 tv    music:plan   from=null to=lobby
  84403 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  85206 tv    music:stop   track=wallpaper.mp3
  86927 tv    ss:cancel    speaking=false pending=false
  86937 tv    music:plan   from=lobby to=game:bingo
  86937 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86937 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86941 tv    hush
  86942 tv    hush
  87554 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  87738 tv    music:stop   track=local-forecast-elevator.mp3
  94520 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  94520 tv    clip         src=b14.wav muted=false ready=true
  94520 tv    speak        text=b14.wav voice=clip
  95560 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95834 tv    hush
  95834 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95835 tv    hush
 103440 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 103440 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 103444 tv    music:duck   ms=9000
 103444 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108455 tv    hush
 108455 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108455 tv    hush
 112455 tv    ss:cancel    speaking=false pending=false
 112455 tv    music:plan   from=game:bingo to=null
 112455 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113955 tv    music:stop   track=wallpaper.mp3
 114032 tv    ss:cancel    speaking=false pending=false
 114032 tv    music:plan   from=null to=lobby
 114032 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 116545 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 116552 tv    ss:cancel    speaking=false pending=false
 116554 tv    music:plan   from=lobby to=game:bingo
 116554 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116554 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116557 tv    hush
 116558 tv    hush
 117169 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117355 tv    music:stop   track=local-forecast-elevator.mp3
 118559 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 118685 tv    ss:cancel    speaking=false pending=false
 118685 tv    music:plan   from=game:bingo to=null
 118685 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 120185 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 120766 tv    ss:cancel    speaking=false pending=false
 120766 tv    music:plan   from=null to=lobby
 120766 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 124118 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 124129 tv    ss:cancel    speaking=false pending=false
 124136 tv    music:plan   from=lobby to=game:bingo
 124136 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 124136 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 124140 tv    hush
 124141 tv    hush
 124546 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 124737 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124737 tv    clip         src=i21.wav muted=false ready=true
 124737 tv    speak        text=i21.wav voice=clip
 124936 tv    music:stop   track=bossa-antigua.mp3
 125050 tv    ss:cancel    speaking=false pending=false
 125050 tv    music:plan   from=game:bingo to=null
 125053 tv    ss:cancel    speaking=false pending=false
 125053 tv    music:plan   from=null to=lobby
 125053 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 125853 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 130620 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131039 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131469 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131901 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132335 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 133386 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 134007 tv    ss:cancel    speaking=false pending=false
 134012 tv    music:plan   from=lobby to=null
 134012 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 135242 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135512 tv    music:stop   track=george-street-shuffle.mp3
 136845 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 138158 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 139475 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140472 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141514 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144046 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144238 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144409 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144602 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 145698 tv    ss:cancel    speaking=false pending=false
 145700 tv    ss:cancel    speaking=false pending=false
 145700 tv    music:plan   from=null to=lobby
 145700 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 147717 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 147724 tv    ss:cancel    speaking=false pending=false
 147726 tv    music:plan   from=lobby to=null
 147726 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149227 tv    music:stop   track=bossa-antigua.mp3
 149280 tv    music:plan   from=null to=game:broken-pencil
 149280 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 149280 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150752 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151225 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151384 tv    music:plan   from=game:broken-pencil to=null
 151384 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 152884 tv    music:stop   track=hep-cats.mp3
```
