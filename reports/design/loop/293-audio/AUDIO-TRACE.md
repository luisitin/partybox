# Audio interaction trace

Captured 2026-09-18T13:23:52.436Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**54 / 54 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.4}]

```
   1737 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1762 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3092 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3227 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3925 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4544 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5412 tv    ss:cancel    speaking=false pending=false
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
   6250 tv    music:plan   from=lobby to=null
   6250 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7765 tv    music:stop   track=local-forecast-elevator.mp3
   8198 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9479 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16451 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17452 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18451 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19451 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20450 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21258 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22038 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22177 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22333 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22490 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22633 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22794 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22947 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23107 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23259 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23418 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23572 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23729 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23886 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24042 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24196 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24354 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24494 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24637 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24791 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25667 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  25993 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27798 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29535 tv    ss:cancel    speaking=false pending=false
  29535 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31089 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33239 tv    ss:cancel    speaking=false pending=false
  33239 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34790 tv    ss:cancel    speaking=false pending=false
  34790 tv    music:plan   from=null to=lobby
  34790 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+960ms phone@+963ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,lock cheer@+5354ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5401ms cheer@+5365ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=3 lastTickIdx=2
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36354 tv    music:plan   from=lobby to=game:bingo
  36354 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36354 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36663 tv    hush
  36663 tv    hush
  37155 tv    music:stop   track=airport-lounge.mp3
  37274 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38415 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39414 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40416 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41361 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41553 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41553 tv    clip         src=b9.wav muted=false ready=true
  41554 tv    speak        text=b9.wav voice=clip
  43176 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43176 tv    clip         src=b8.wav muted=false ready=true
  43176 tv    speak        text=b8.wav voice=clip
  44999 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44999 tv    clip         src=n34.wav muted=false ready=true
  44999 tv    speak        text=n34.wav voice=clip
  46674 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  46935 tv    hush
  46935 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  46935 tv    hush
  52287 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55291 tv    hush
  55291 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  55292 tv    hush
  56293 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57293 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58489 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58489 tv    clip         src=n35.wav muted=false ready=true
  58490 tv    speak        text=n35.wav voice=clip
  60090 tv    music:paused paused=true
  60090 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61324 tv    music:paused paused=false
  61324 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  67806 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  67806 tv    clip         src=g57.wav muted=false ready=true
  67806 tv    speak        text=g57.wav voice=clip
  68222 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68497 tv    hush
  68497 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68497 tv    hush
  70372 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73851 tv    music:duck   ms=9000
  73851 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  73894 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  78645 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  78966 tv    hush
  78966 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  78966 tv    hush
  79969 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80968 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82158 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  82158 tv    clip         src=g57.wav muted=false ready=true
  82158 tv    speak        text=g57.wav voice=clip
  84267 tv    ss:cancel    speaking=false pending=false
  84267 tv    music:plan   from=game:bingo to=null
  84269 tv    ss:cancel    speaking=false pending=false
  84269 tv    music:plan   from=null to=lobby
  84269 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  85071 tv    music:stop   track=cool-vibes.mp3
  86782 tv    ss:cancel    speaking=false pending=false
  86792 tv    music:plan   from=lobby to=game:bingo
  86792 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86792 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86796 tv    hush
  86796 tv    hush
  87407 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  87594 tv    music:stop   track=bossa-antigua.mp3
  94353 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  94353 tv    clip         src=b14.wav muted=false ready=true
  94353 tv    speak        text=b14.wav voice=clip
  95388 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95649 tv    hush
  95649 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95649 tv    hush
 103254 tv    music:duck   ms=9000
 103254 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 103271 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 108268 tv    hush
 108269 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108269 tv    hush
 112269 tv    ss:cancel    speaking=false pending=false
 112269 tv    music:plan   from=game:bingo to=null
 112269 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113769 tv    music:stop   track=wallpaper.mp3
 113834 tv    ss:cancel    speaking=false pending=false
 113834 tv    music:plan   from=null to=lobby
 113834 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 116353 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 116361 tv    ss:cancel    speaking=false pending=false
 116362 tv    music:plan   from=lobby to=game:bingo
 116363 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116363 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116366 tv    hush
 116366 tv    hush
 116977 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117163 tv    music:stop   track=local-forecast-elevator.mp3
 118368 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 118504 tv    ss:cancel    speaking=false pending=false
 118504 tv    music:plan   from=game:bingo to=null
 118504 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 120005 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 120599 tv    ss:cancel    speaking=false pending=false
 120599 tv    music:plan   from=null to=lobby
 120599 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 123939 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 123956 tv    ss:cancel    speaking=false pending=false
 123958 tv    music:plan   from=lobby to=game:bingo
 123958 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 123958 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 123962 tv    hush
 123963 tv    hush
 124385 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 124576 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124576 tv    clip         src=i21.wav muted=false ready=true
 124576 tv    speak        text=i21.wav voice=clip
 124759 tv    music:stop   track=local-forecast-elevator.mp3
 124885 tv    ss:cancel    speaking=false pending=false
 124885 tv    music:plan   from=game:bingo to=null
 124889 tv    ss:cancel    speaking=false pending=false
 124889 tv    music:plan   from=null to=lobby
 124889 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 125693 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":10.2}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 130469 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 130908 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131337 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131772 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132204 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 133286 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 133902 tv    ss:cancel    speaking=false pending=false
 133906 tv    music:plan   from=lobby to=null
 133906 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 135135 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135410 tv    music:stop   track=george-street-shuffle.mp3
 136740 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 138038 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 139327 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140349 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141407 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143959 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144132 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144322 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144511 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 145614 tv    ss:cancel    speaking=false pending=false
 145617 tv    ss:cancel    speaking=false pending=false
 145617 tv    music:plan   from=null to=lobby
 145617 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 147625 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 147642 tv    ss:cancel    speaking=false pending=false
 147644 tv    music:plan   from=lobby to=null
 147644 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149144 tv    music:stop   track=local-forecast-elevator.mp3
 149221 tv    music:plan   from=null to=game:broken-pencil
 149221 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 149221 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150696 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151174 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151331 tv    music:plan   from=game:broken-pencil to=null
 151331 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 152832 tv    music:stop   track=backbay-lounge.mp3
```
