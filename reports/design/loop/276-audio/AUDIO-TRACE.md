# Audio interaction trace

Captured 2026-09-18T11:10:11.486Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**52 / 52 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:george-street-shuffle
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":4.4}]

```
   1721 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   1745 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3059 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3195 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3892 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4512 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5364 tv    ss:cancel    speaking=false pending=false
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
   6220 tv    music:plan   from=lobby to=null
   6220 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7731 tv    music:stop   track=george-street-shuffle.mp3
   8164 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9448 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16418 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17415 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18419 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19418 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20419 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21240 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22034 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22189 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22347 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22501 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22657 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22817 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22972 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23129 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23281 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23424 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23582 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23738 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23893 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24050 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24206 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24366 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24518 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24672 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24834 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25710 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26035 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27837 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29580 tv    ss:cancel    speaking=false pending=false
  29580 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":1.5}]

```
  31123 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33295 tv    ss:cancel    speaking=false pending=false
  33295 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34841 tv    ss:cancel    speaking=false pending=false
  34841 tv    music:plan   from=null to=lobby
  34841 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:local-forecast-elevator.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro counts down: three ticks (3 · 2 · 1), then the first call** — cues=tick,tick,tick,phase,call
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":19}]
- ✅ **play resumes → the next number is spoken** — spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":22.5}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,silence,lock cheer@+5358ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":37}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5417ms cheer@+5368ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36398 tv    music:plan   from=lobby to=game:bingo
  36398 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36398 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36703 tv    hush
  36704 tv    hush
  37200 tv    music:stop   track=local-forecast-elevator.mp3
  38455 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39455 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40456 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41401 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41592 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41592 tv    clip         src=b9.wav muted=false ready=true
  41592 tv    speak        text=b9.wav voice=clip
  43212 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43213 tv    clip         src=b8.wav muted=false ready=true
  43213 tv    speak        text=b8.wav voice=clip
  45037 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45037 tv    clip         src=n34.wav muted=false ready=true
  45037 tv    speak        text=n34.wav voice=clip
  46710 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  46981 tv    hush
  46981 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  46981 tv    hush
  52336 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55528 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  55719 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55719 tv    clip         src=n35.wav muted=false ready=true
  55719 tv    speak        text=n35.wav voice=clip
  57741 tv    music:paused paused=true
  57741 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  58992 tv    music:paused paused=false
  58992 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  65512 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  65512 tv    clip         src=g57.wav muted=false ready=true
  65512 tv    speak        text=g57.wav voice=clip
  65925 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  66196 tv    hush
  66197 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  66197 tv    hush
  68072 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  71554 tv    music:duck   ms=9000
  71554 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  71610 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  71610 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  76347 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  76688 tv    hush
  76688 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  76688 tv    hush
  77689 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  78689 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  79880 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  79880 tv    clip         src=g57.wav muted=false ready=true
  79880 tv    speak        text=g57.wav voice=clip
  81985 tv    ss:cancel    speaking=false pending=false
  81985 tv    music:plan   from=game:bingo to=null
  81988 tv    ss:cancel    speaking=false pending=false
  81988 tv    music:plan   from=null to=lobby
  81988 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  82788 tv    music:stop   track=wallpaper.mp3
  84503 tv    ss:cancel    speaking=false pending=false
  84515 tv    music:plan   from=lobby to=game:bingo
  84515 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  84515 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  84519 tv    hush
  84519 tv    hush
  85133 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  85316 tv    music:stop   track=airport-lounge.mp3
  92109 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  92109 tv    clip         src=b14.wav muted=false ready=true
  92109 tv    speak        text=b14.wav voice=clip
  93143 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  93414 tv    hush
  93414 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  93415 tv    hush
 101017 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 101017 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 101022 tv    music:duck   ms=9000
 101022 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 106025 tv    hush
 106025 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 106025 tv    hush
 110028 tv    ss:cancel    speaking=false pending=false
 110028 tv    music:plan   from=game:bingo to=null
 110028 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 111530 tv    music:stop   track=wallpaper.mp3
 111633 tv    ss:cancel    speaking=false pending=false
 111633 tv    music:plan   from=null to=lobby
 111633 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 114157 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 114165 tv    ss:cancel    speaking=false pending=false
 114167 tv    music:plan   from=lobby to=game:bingo
 114167 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 114167 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 114170 tv    hush
 114171 tv    hush
 114967 tv    music:stop   track=airport-lounge.mp3
 116173 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 116287 tv    ss:cancel    speaking=false pending=false
 116287 tv    music:plan   from=game:bingo to=null
 116287 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 117788 tv    music:stop   track=cool-vibes.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 118400 tv    ss:cancel    speaking=false pending=false
 118400 tv    music:plan   from=null to=lobby
 118400 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 121773 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 121785 tv    ss:cancel    speaking=false pending=false
 121787 tv    music:plan   from=lobby to=game:bingo
 121787 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 121787 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 121790 tv    hush
 121791 tv    hush
 122210 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 122400 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 122401 tv    clip         src=i21.wav muted=false ready=true
 122401 tv    speak        text=i21.wav voice=clip
 122588 tv    music:stop   track=local-forecast-elevator.mp3
 122719 tv    ss:cancel    speaking=false pending=false
 122719 tv    music:plan   from=game:bingo to=null
 122722 tv    ss:cancel    speaking=false pending=false
 122722 tv    music:plan   from=null to=lobby
 122722 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 123522 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 128270 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 128690 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 129123 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 129558 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 129992 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131053 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 131640 tv    ss:cancel    speaking=false pending=false
 131642 tv    music:plan   from=lobby to=null
 131642 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 132883 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 133143 tv    music:stop   track=george-street-shuffle.mp3
 134453 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 135773 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 137076 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 138092 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 139130 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 141683 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141876 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 142063 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 142248 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 143350 tv    ss:cancel    speaking=false pending=false
 143352 tv    ss:cancel    speaking=false pending=false
 143352 tv    music:plan   from=null to=lobby
 143352 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 145362 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 145370 tv    ss:cancel    speaking=false pending=false
 145372 tv    music:plan   from=lobby to=null
 145372 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 146872 tv    music:stop   track=local-forecast-elevator.mp3
 146925 tv    music:plan   from=null to=game:broken-pencil
 146925 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 146925 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 148403 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 148872 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 149029 tv    music:plan   from=game:broken-pencil to=null
 149029 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 150530 tv    music:stop   track=hep-cats.mp3
```
