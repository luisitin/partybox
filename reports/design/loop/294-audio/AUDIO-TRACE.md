# Audio interaction trace

Captured 2026-09-18T13:39:42.329Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**54 / 54 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.4}]

```
   1755 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1783 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3109 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3246 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3946 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4577 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5429 tv    ss:cancel    speaking=false pending=false
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
   6286 tv    music:plan   from=lobby to=null
   6286 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7793 tv    music:stop   track=airport-lounge.mp3
   8247 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9534 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16503 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17502 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18501 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19502 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20501 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21302 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22083 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22240 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22394 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22553 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22712 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22856 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23009 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23163 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23318 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23474 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23630 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23788 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23948 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24106 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24260 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24404 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24569 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24729 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24883 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25762 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26088 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27897 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29619 tv    ss:cancel    speaking=false pending=false
  29619 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":1.5}]

```
  31173 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33307 tv    ss:cancel    speaking=false pending=false
  33307 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34857 tv    ss:cancel    speaking=false pending=false
  34857 tv    music:plan   from=null to=lobby
  34857 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:local-forecast-elevator.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+954ms phone@+962ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,lock cheer@+5355ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5388ms cheer@+5365ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=3 lastTickIdx=2
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36416 tv    music:plan   from=lobby to=game:bingo
  36416 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36416 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36718 tv    hush
  36719 tv    hush
  37216 tv    music:stop   track=local-forecast-elevator.mp3
  37329 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38470 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39471 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40469 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41417 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41608 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41608 tv    clip         src=b9.wav muted=false ready=true
  41608 tv    speak        text=b9.wav voice=clip
  43246 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43246 tv    clip         src=b8.wav muted=false ready=true
  43246 tv    speak        text=b8.wav voice=clip
  45062 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45062 tv    clip         src=n34.wav muted=false ready=true
  45062 tv    speak        text=n34.wav voice=clip
  46742 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  46999 tv    hush
  46999 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  46999 tv    hush
  52352 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55356 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56357 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57358 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58558 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58558 tv    clip         src=n35.wav muted=false ready=true
  58558 tv    speak        text=n35.wav voice=clip
  60142 tv    music:paused paused=true
  60142 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61392 tv    music:paused paused=false
  61392 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  67877 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  67877 tv    clip         src=g57.wav muted=false ready=true
  67877 tv    speak        text=g57.wav voice=clip
  68306 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68591 tv    hush
  68591 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68591 tv    hush
  70464 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73946 tv    music:duck   ms=9000
  73946 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  73977 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  78712 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79030 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80031 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81031 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82230 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  82230 tv    clip         src=g57.wav muted=false ready=true
  82230 tv    speak        text=g57.wav voice=clip
  84335 tv    ss:cancel    speaking=false pending=false
  84335 tv    music:plan   from=game:bingo to=null
  84338 tv    ss:cancel    speaking=false pending=false
  84338 tv    music:plan   from=null to=lobby
  84338 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  85138 tv    music:stop   track=wallpaper.mp3
  86838 tv    ss:cancel    speaking=false pending=false
  86847 tv    music:plan   from=lobby to=game:bingo
  86847 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86847 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86851 tv    hush
  86851 tv    hush
  87458 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  87649 tv    music:stop   track=airport-lounge.mp3
  94310 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  94310 tv    clip         src=b14.wav muted=false ready=true
  94310 tv    speak        text=b14.wav voice=clip
  95358 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95627 tv    hush
  95627 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95628 tv    hush
 103233 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 103233 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 103237 tv    music:duck   ms=9000
 103237 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108237 tv    hush
 108237 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108238 tv    hush
 112245 tv    ss:cancel    speaking=false pending=false
 112245 tv    music:plan   from=game:bingo to=null
 112245 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113747 tv    music:stop   track=wallpaper.mp3
 113834 tv    ss:cancel    speaking=false pending=false
 113834 tv    music:plan   from=null to=lobby
 113834 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 116355 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 116364 tv    ss:cancel    speaking=false pending=false
 116369 tv    music:plan   from=lobby to=game:bingo
 116369 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116370 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116374 tv    hush
 116374 tv    hush
 116985 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117170 tv    music:stop   track=bossa-antigua.mp3
 118375 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 118520 tv    ss:cancel    speaking=false pending=false
 118520 tv    music:plan   from=game:bingo to=null
 118520 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 120021 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 120617 tv    ss:cancel    speaking=false pending=false
 120617 tv    music:plan   from=null to=lobby
 120617 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 123961 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 123971 tv    ss:cancel    speaking=false pending=false
 123973 tv    music:plan   from=lobby to=game:bingo
 123973 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 123973 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 123976 tv    hush
 123977 tv    hush
 124392 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 124584 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124584 tv    clip         src=i21.wav muted=false ready=true
 124584 tv    speak        text=i21.wav voice=clip
 124775 tv    music:stop   track=bossa-antigua.mp3
 124901 tv    ss:cancel    speaking=false pending=false
 124901 tv    music:plan   from=game:bingo to=null
 124904 tv    ss:cancel    speaking=false pending=false
 124904 tv    music:plan   from=null to=lobby
 124904 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 125706 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"airport-lounge.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 130471 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 130905 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131337 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131773 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132207 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 133269 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 133880 tv    ss:cancel    speaking=false pending=false
 133884 tv    music:plan   from=lobby to=null
 133884 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 135123 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135385 tv    music:stop   track=airport-lounge.mp3
 136704 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 138007 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 139309 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140319 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141355 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143913 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144075 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144256 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144444 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"lobby-time.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 145550 tv    ss:cancel    speaking=false pending=false
 145552 tv    ss:cancel    speaking=false pending=false
 145552 tv    music:plan   from=null to=lobby
 145552 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 147568 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 147584 tv    ss:cancel    speaking=false pending=false
 147586 tv    music:plan   from=lobby to=null
 147586 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149087 tv    music:stop   track=bossa-antigua.mp3
 149141 tv    music:plan   from=null to=game:broken-pencil
 149141 tv    music:start  plan=game:broken-pencil track=lobby-time mode=chain volume=0.2
 149141 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150619 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151096 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151237 tv    music:plan   from=game:broken-pencil to=null
 151237 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 152738 tv    music:stop   track=lobby-time.mp3
```
