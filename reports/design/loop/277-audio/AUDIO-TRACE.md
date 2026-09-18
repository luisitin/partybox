# Audio interaction trace

Captured 2026-09-18T11:20:45.066Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**52 / 52 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:george-street-shuffle
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":4.4}]

```
   1758 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   1785 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3097 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3231 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3923 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4550 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5400 tv    ss:cancel    speaking=false pending=false
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
   6257 tv    music:plan   from=lobby to=null
   6257 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7759 tv    music:stop   track=george-street-shuffle.mp3
   8204 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9502 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16462 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17455 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18465 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19455 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20455 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21277 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22083 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22240 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22395 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22552 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22708 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22867 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23025 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23185 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23337 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23497 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23652 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23810 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23966 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24121 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24276 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24439 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24593 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24748 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24892 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25770 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26096 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27904 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29643 tv    ss:cancel    speaking=false pending=false
  29643 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":1.5}]

```
  31175 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33325 tv    ss:cancel    speaking=false pending=false
  33325 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34878 tv    ss:cancel    speaking=false pending=false
  34878 tv    music:plan   from=null to=lobby
  34878 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:local-forecast-elevator.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro counts down: three ticks (3 · 2 · 1), then the first call** — cues=tick,tick,tick,phase,call
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":19}]
- ✅ **play resumes → the next number is spoken** — spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":22.5}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,lock cheer@+5355ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":37}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5397ms cheer@+5367ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36437 tv    music:plan   from=lobby to=game:bingo
  36437 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36437 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36742 tv    hush
  36743 tv    hush
  37238 tv    music:stop   track=local-forecast-elevator.mp3
  38495 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39495 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40495 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41451 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41642 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41642 tv    clip         src=b9.wav muted=false ready=true
  41642 tv    speak        text=b9.wav voice=clip
  43263 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43263 tv    clip         src=b8.wav muted=false ready=true
  43263 tv    speak        text=b8.wav voice=clip
  45096 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45097 tv    clip         src=n34.wav muted=false ready=true
  45097 tv    speak        text=n34.wav voice=clip
  46761 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47028 tv    hush
  47028 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47029 tv    hush
  52380 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55561 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  55753 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55753 tv    clip         src=n35.wav muted=false ready=true
  55753 tv    speak        text=n35.wav voice=clip
  57778 tv    music:paused paused=true
  57778 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  59028 tv    music:paused paused=false
  59028 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  65459 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  65459 tv    clip         src=g57.wav muted=false ready=true
  65459 tv    speak        text=g57.wav voice=clip
  65900 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  66193 tv    hush
  66193 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  66193 tv    hush
  68066 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  71548 tv    music:duck   ms=9000
  71548 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  71585 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  76336 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  76679 tv    hush
  76679 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  76679 tv    hush
  77681 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  78682 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  79865 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  79865 tv    clip         src=g57.wav muted=false ready=true
  79865 tv    speak        text=g57.wav voice=clip
  81971 tv    ss:cancel    speaking=false pending=false
  81971 tv    music:plan   from=game:bingo to=null
  81974 tv    ss:cancel    speaking=false pending=false
  81974 tv    music:plan   from=null to=lobby
  81974 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  82776 tv    music:stop   track=cool-vibes.mp3
  84493 tv    ss:cancel    speaking=false pending=false
  84507 tv    music:plan   from=lobby to=game:bingo
  84507 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  84507 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  84510 tv    hush
  84510 tv    hush
  85122 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  85308 tv    music:stop   track=airport-lounge.mp3
  92060 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  92060 tv    clip         src=b14.wav muted=false ready=true
  92060 tv    speak        text=b14.wav voice=clip
  93094 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  93362 tv    hush
  93363 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  93363 tv    hush
 100971 tv    music:duck   ms=9000
 100971 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 100982 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 105973 tv    hush
 105973 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 105973 tv    hush
 109971 tv    ss:cancel    speaking=false pending=false
 109972 tv    music:plan   from=game:bingo to=null
 109972 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 111473 tv    music:stop   track=wallpaper.mp3
 111588 tv    ss:cancel    speaking=false pending=false
 111588 tv    music:plan   from=null to=lobby
 111588 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 114122 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 114131 tv    ss:cancel    speaking=false pending=false
 114133 tv    music:plan   from=lobby to=game:bingo
 114133 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 114133 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 114137 tv    hush
 114137 tv    hush
 114935 tv    music:stop   track=george-street-shuffle.mp3
 116139 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 116258 tv    ss:cancel    speaking=false pending=false
 116258 tv    music:plan   from=game:bingo to=null
 116258 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 117761 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 118354 tv    ss:cancel    speaking=false pending=false
 118354 tv    music:plan   from=null to=lobby
 118354 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 121715 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 121723 tv    ss:cancel    speaking=false pending=false
 121725 tv    music:plan   from=lobby to=game:bingo
 121725 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 121725 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 121729 tv    hush
 121729 tv    hush
 122150 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 122341 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 122341 tv    clip         src=i21.wav muted=false ready=true
 122341 tv    speak        text=i21.wav voice=clip
 122526 tv    music:stop   track=airport-lounge.mp3
 122655 tv    ss:cancel    speaking=false pending=false
 122655 tv    music:plan   from=game:bingo to=null
 122658 tv    ss:cancel    speaking=false pending=false
 122658 tv    music:plan   from=null to=lobby
 122658 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 123458 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 128223 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 128643 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 129073 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 129517 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 129941 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131005 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 131616 tv    ss:cancel    speaking=false pending=false
 131622 tv    music:plan   from=lobby to=null
 131622 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 132856 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 133124 tv    music:stop   track=local-forecast-elevator.mp3
 134458 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 135763 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 137058 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 138058 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 139112 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 141661 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141852 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 142037 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 142229 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 143319 tv    ss:cancel    speaking=false pending=false
 143321 tv    ss:cancel    speaking=false pending=false
 143321 tv    music:plan   from=null to=lobby
 143321 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 145346 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 145356 tv    ss:cancel    speaking=false pending=false
 145358 tv    music:plan   from=lobby to=null
 145358 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 146858 tv    music:stop   track=george-street-shuffle.mp3
 146901 tv    music:plan   from=null to=game:broken-pencil
 146901 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 146901 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 148371 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 148839 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 148994 tv    music:plan   from=game:broken-pencil to=null
 148994 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 150495 tv    music:stop   track=backbay-lounge.mp3
```
