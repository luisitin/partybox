# Audio interaction trace

Captured 2026-09-18T15:37:53.708Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**54 / 54 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.5}]

```
   1737 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1762 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3091 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3228 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3935 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4562 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
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
   6280 tv    music:plan   from=lobby to=null
   6280 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7786 tv    music:stop   track=local-forecast-elevator.mp3
   8210 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9497 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16466 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17467 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18466 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19465 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20462 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21284 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22098 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22268 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22425 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22581 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22739 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22897 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23051 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23206 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23348 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23506 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23644 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23800 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23955 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24117 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24252 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24409 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24566 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24721 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24876 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25755 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26085 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27887 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29616 tv    ss:cancel    speaking=false pending=false
  29616 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31170 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33308 tv    ss:cancel    speaking=false pending=false
  33308 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34860 tv    ss:cancel    speaking=false pending=false
  34860 tv    music:plan   from=null to=lobby
  34860 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":3}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+956ms phone@+962ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":18.1}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer,silence cheer@+5356ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5418ms cheer@+5368ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=3 lastTickIdx=2
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36428 tv    music:plan   from=lobby to=game:bingo
  36428 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36428 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36732 tv    hush
  36732 tv    hush
  37230 tv    music:stop   track=airport-lounge.mp3
  37342 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38433 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39433 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40433 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41442 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41633 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41633 tv    clip         src=b9.wav muted=false ready=true
  41633 tv    speak        text=b9.wav voice=clip
  43258 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43258 tv    clip         src=b8.wav muted=false ready=true
  43258 tv    speak        text=b8.wav voice=clip
  45086 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45087 tv    clip         src=n34.wav muted=false ready=true
  45087 tv    speak        text=n34.wav voice=clip
  46758 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47021 tv    hush
  47021 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47021 tv    hush
  52375 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55381 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56382 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57382 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58587 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58587 tv    clip         src=n35.wav muted=false ready=true
  58587 tv    speak        text=n35.wav voice=clip
  60193 tv    music:paused paused=true
  60193 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61458 tv    music:paused paused=false
  61458 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  67893 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  67893 tv    clip         src=g57.wav muted=false ready=true
  67893 tv    speak        text=g57.wav voice=clip
  68310 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68601 tv    hush
  68601 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68601 tv    hush
  70475 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73957 tv    music:duck   ms=9000
  73957 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  74017 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  78745 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79074 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80081 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81075 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82269 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  82269 tv    clip         src=g57.wav muted=false ready=true
  82269 tv    speak        text=g57.wav voice=clip
  84368 tv    ss:cancel    speaking=false pending=false
  84368 tv    music:plan   from=game:bingo to=null
  84370 tv    ss:cancel    speaking=false pending=false
  84370 tv    music:plan   from=null to=lobby
  84370 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  85171 tv    music:stop   track=cool-vibes.mp3
  86889 tv    ss:cancel    speaking=false pending=false
  86898 tv    music:plan   from=lobby to=game:bingo
  86898 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86899 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86902 tv    hush
  86902 tv    hush
  87513 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  87699 tv    music:stop   track=george-street-shuffle.mp3
  94486 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  94486 tv    clip         src=b14.wav muted=false ready=true
  94486 tv    speak        text=b14.wav voice=clip
  95521 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95793 tv    hush
  95793 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95793 tv    hush
 103401 tv    music:duck   ms=9000
 103401 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108422 tv    hush
 108422 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108423 tv    hush
 112418 tv    ss:cancel    speaking=false pending=false
 112418 tv    music:plan   from=game:bingo to=null
 112418 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113918 tv    music:stop   track=wallpaper.mp3
 113999 tv    ss:cancel    speaking=false pending=false
 113999 tv    music:plan   from=null to=lobby
 113999 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 116517 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 116535 tv    ss:cancel    speaking=false pending=false
 116537 tv    music:plan   from=lobby to=game:bingo
 116537 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116537 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116540 tv    hush
 116541 tv    hush
 117151 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117346 tv    music:stop   track=bossa-antigua.mp3
 118542 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 118668 tv    ss:cancel    speaking=false pending=false
 118668 tv    music:plan   from=game:bingo to=null
 118668 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 120169 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 120765 tv    ss:cancel    speaking=false pending=false
 120765 tv    music:plan   from=null to=lobby
 120765 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 124099 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 124110 tv    ss:cancel    speaking=false pending=false
 124111 tv    music:plan   from=lobby to=game:bingo
 124111 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 124112 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 124115 tv    hush
 124115 tv    hush
 124542 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 124733 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124733 tv    clip         src=i21.wav muted=false ready=true
 124733 tv    speak        text=i21.wav voice=clip
 124912 tv    music:stop   track=local-forecast-elevator.mp3
 125033 tv    ss:cancel    speaking=false pending=false
 125033 tv    music:plan   from=game:bingo to=null
 125036 tv    ss:cancel    speaking=false pending=false
 125036 tv    music:plan   from=null to=lobby
 125036 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 125837 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 130603 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131036 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131469 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131884 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132321 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 133368 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 133979 tv    ss:cancel    speaking=false pending=false
 133985 tv    music:plan   from=lobby to=null
 133985 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 135216 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135485 tv    music:stop   track=local-forecast-elevator.mp3
 136814 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 138120 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 139424 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140444 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141485 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144042 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144222 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144404 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144599 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 145698 tv    ss:cancel    speaking=false pending=false
 145700 tv    ss:cancel    speaking=false pending=false
 145700 tv    music:plan   from=null to=lobby
 145700 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 147722 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 147733 tv    ss:cancel    speaking=false pending=false
 147736 tv    music:plan   from=lobby to=null
 147736 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149238 tv    music:stop   track=bossa-antigua.mp3
 149275 tv    music:plan   from=null to=game:broken-pencil
 149275 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 149275 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150731 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151186 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151347 tv    music:plan   from=game:broken-pencil to=null
 151347 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 152847 tv    music:stop   track=backbay-lounge.mp3
```
