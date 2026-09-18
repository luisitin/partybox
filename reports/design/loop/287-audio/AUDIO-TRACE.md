# Audio interaction trace

Captured 2026-09-18T12:47:37.741Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**54 / 54 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.4}]

```
   1765 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1790 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3102 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3238 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3929 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4553 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5405 tv    ss:cancel    speaking=false pending=false
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
   6253 tv    music:plan   from=lobby to=null
   6253 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7760 tv    music:stop   track=airport-lounge.mp3
   8204 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9490 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16461 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17460 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18461 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19461 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20462 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21258 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22058 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22214 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22365 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22525 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22679 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22835 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22991 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23146 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23289 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23447 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23602 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23730 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23882 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24043 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24196 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24355 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24508 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24666 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24824 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25706 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26032 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27837 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29579 tv    ss:cancel    speaking=false pending=false
  29579 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":1.5}]

```
  31132 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33282 tv    ss:cancel    speaking=false pending=false
  33282 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34834 tv    ss:cancel    speaking=false pending=false
  34834 tv    music:plan   from=null to=lobby
  34834 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:george-street-shuffle.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":3}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+955ms phone@+965ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,lock cheer@+5355ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.5}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5394ms cheer@+5368ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=3 lastTickIdx=2
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36397 tv    music:plan   from=lobby to=game:bingo
  36397 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36397 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36700 tv    hush
  36701 tv    hush
  37198 tv    music:stop   track=george-street-shuffle.mp3
  37312 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38452 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39452 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40452 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41408 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41599 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41599 tv    clip         src=b9.wav muted=false ready=true
  41599 tv    speak        text=b9.wav voice=clip
  43227 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43227 tv    clip         src=b8.wav muted=false ready=true
  43227 tv    speak        text=b8.wav voice=clip
  45055 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45056 tv    clip         src=n34.wav muted=false ready=true
  45056 tv    speak        text=n34.wav voice=clip
  46719 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  46995 tv    hush
  46995 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  46995 tv    hush
  52349 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55364 tv    hush
  55364 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  55364 tv    hush
  56366 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57367 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58553 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58553 tv    clip         src=n35.wav muted=false ready=true
  58553 tv    speak        text=n35.wav voice=clip
  60143 tv    music:paused paused=true
  60143 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61401 tv    music:paused paused=false
  61401 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  67931 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  67932 tv    clip         src=g57.wav muted=false ready=true
  67932 tv    speak        text=g57.wav voice=clip
  68374 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68674 tv    hush
  68674 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68674 tv    hush
  70548 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  74029 tv    music:duck   ms=9000
  74029 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  74062 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  78826 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79160 tv    hush
  79160 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  79160 tv    hush
  80163 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81161 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82375 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  82375 tv    clip         src=g57.wav muted=false ready=true
  82375 tv    speak        text=g57.wav voice=clip
  84462 tv    ss:cancel    speaking=false pending=false
  84462 tv    music:plan   from=game:bingo to=null
  84465 tv    ss:cancel    speaking=false pending=false
  84465 tv    music:plan   from=null to=lobby
  84465 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  85267 tv    music:stop   track=wallpaper.mp3
  86989 tv    ss:cancel    speaking=false pending=false
  86999 tv    music:plan   from=lobby to=game:bingo
  86999 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  86999 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  87003 tv    hush
  87003 tv    hush
  87613 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  87801 tv    music:stop   track=local-forecast-elevator.mp3
  94623 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  94623 tv    clip         src=b14.wav muted=false ready=true
  94623 tv    speak        text=b14.wav voice=clip
  95636 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95903 tv    hush
  95904 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95904 tv    hush
 103511 tv    music:duck   ms=9000
 103511 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 103524 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 108522 tv    hush
 108523 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108523 tv    hush
 112528 tv    ss:cancel    speaking=false pending=false
 112528 tv    music:plan   from=game:bingo to=null
 112528 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 114029 tv    music:stop   track=cool-vibes.mp3
 114110 tv    ss:cancel    speaking=false pending=false
 114110 tv    music:plan   from=null to=lobby
 114110 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 116618 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 116628 tv    ss:cancel    speaking=false pending=false
 116630 tv    music:plan   from=lobby to=game:bingo
 116630 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 116630 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116634 tv    hush
 116634 tv    hush
 117244 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117431 tv    music:stop   track=airport-lounge.mp3
 118635 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 118764 tv    ss:cancel    speaking=false pending=false
 118764 tv    music:plan   from=game:bingo to=null
 118764 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 120264 tv    music:stop   track=cool-vibes.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 120877 tv    ss:cancel    speaking=false pending=false
 120877 tv    music:plan   from=null to=lobby
 120877 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 124224 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 124238 tv    ss:cancel    speaking=false pending=false
 124240 tv    music:plan   from=lobby to=game:bingo
 124240 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 124240 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 124244 tv    hush
 124244 tv    hush
 124664 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 124855 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124855 tv    clip         src=i21.wav muted=false ready=true
 124855 tv    speak        text=i21.wav voice=clip
 125040 tv    music:stop   track=bossa-antigua.mp3
 125160 tv    ss:cancel    speaking=false pending=false
 125160 tv    music:plan   from=game:bingo to=null
 125163 tv    ss:cancel    speaking=false pending=false
 125163 tv    music:plan   from=null to=lobby
 125163 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 125964 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 130714 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131150 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131585 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132012 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132430 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 133478 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 134077 tv    ss:cancel    speaking=false pending=false
 134082 tv    music:plan   from=lobby to=null
 134082 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 135319 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135583 tv    music:stop   track=bossa-antigua.mp3
 136918 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 138223 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 139522 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140544 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141597 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144155 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144345 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144534 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144722 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 145809 tv    ss:cancel    speaking=false pending=false
 145811 tv    ss:cancel    speaking=false pending=false
 145811 tv    music:plan   from=null to=lobby
 145811 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 147834 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 147844 tv    ss:cancel    speaking=false pending=false
 147846 tv    music:plan   from=lobby to=null
 147846 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149347 tv    music:stop   track=airport-lounge.mp3
 149399 tv    music:plan   from=null to=game:broken-pencil
 149399 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 149399 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150879 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151328 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151490 tv    music:plan   from=game:broken-pencil to=null
 151490 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 152991 tv    music:stop   track=hep-cats.mp3
```
