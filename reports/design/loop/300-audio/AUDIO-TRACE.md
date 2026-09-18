# Audio interaction trace

Captured 2026-09-18T14:38:43.086Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**54 / 54 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.4}]

```
   1874 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1905 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3228 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3380 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   4085 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4712 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5564 tv    ss:cancel    speaking=false pending=false
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
   6414 tv    music:plan   from=lobby to=null
   6414 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7915 tv    music:stop   track=local-forecast-elevator.mp3
   8346 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9630 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16598 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17602 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18603 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19602 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20603 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21415 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22199 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22356 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22514 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22670 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22829 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22985 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23142 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23285 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23442 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23598 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23756 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23914 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24072 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24229 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24385 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24545 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24701 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24859 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  25016 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25902 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26226 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  28028 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29766 tv    ss:cancel    speaking=false pending=false
  29766 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31324 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33477 tv    ss:cancel    speaking=false pending=false
  33477 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  35026 tv    ss:cancel    speaking=false pending=false
  35026 tv    music:plan   from=null to=lobby
  35026 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+957ms phone@+964ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5354ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.3}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5405ms cheer@+5365ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=3 lastTickIdx=2
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36586 tv    music:plan   from=lobby to=game:bingo
  36586 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36586 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36890 tv    hush
  36890 tv    hush
  37387 tv    music:stop   track=airport-lounge.mp3
  37501 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38643 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39643 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40642 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41594 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41785 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41786 tv    clip         src=b9.wav muted=false ready=true
  41786 tv    speak        text=b9.wav voice=clip
  43430 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43430 tv    clip         src=b8.wav muted=false ready=true
  43430 tv    speak        text=b8.wav voice=clip
  45264 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45264 tv    clip         src=n34.wav muted=false ready=true
  45264 tv    speak        text=n34.wav voice=clip
  46943 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47205 tv    hush
  47205 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47205 tv    hush
  52558 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55558 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56560 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57559 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58749 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58749 tv    clip         src=n35.wav muted=false ready=true
  58749 tv    speak        text=n35.wav voice=clip
  60326 tv    music:paused paused=true
  60326 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61576 tv    music:paused paused=false
  61576 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  67984 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  67984 tv    clip         src=g57.wav muted=false ready=true
  67984 tv    speak        text=g57.wav voice=clip
  68391 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68685 tv    hush
  68685 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68685 tv    hush
  70559 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  74039 tv    music:duck   ms=9000
  74039 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  78848 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79174 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80175 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81175 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82377 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  82377 tv    clip         src=g57.wav muted=false ready=true
  82377 tv    speak        text=g57.wav voice=clip
  84486 tv    ss:cancel    speaking=false pending=false
  84486 tv    music:plan   from=game:bingo to=null
  84489 tv    ss:cancel    speaking=false pending=false
  84489 tv    music:plan   from=null to=lobby
  84489 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  85289 tv    music:stop   track=wallpaper.mp3
  87008 tv    ss:cancel    speaking=false pending=false
  87017 tv    music:plan   from=lobby to=game:bingo
  87017 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  87017 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  87021 tv    hush
  87021 tv    hush
  87632 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  87819 tv    music:stop   track=airport-lounge.mp3
  94589 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  94589 tv    clip         src=b14.wav muted=false ready=true
  94589 tv    speak        text=b14.wav voice=clip
  95622 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95882 tv    hush
  95882 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95882 tv    hush
 103486 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 103490 tv    music:duck   ms=9000
 103490 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108496 tv    hush
 108497 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108497 tv    hush
 112505 tv    ss:cancel    speaking=false pending=false
 112505 tv    music:plan   from=game:bingo to=null
 112505 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 114007 tv    music:stop   track=wallpaper.mp3
 114119 tv    ss:cancel    speaking=false pending=false
 114119 tv    music:plan   from=null to=lobby
 114119 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 116629 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 116647 tv    ss:cancel    speaking=false pending=false
 116652 tv    music:plan   from=lobby to=game:bingo
 116652 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 116652 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116656 tv    hush
 116656 tv    hush
 117268 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117453 tv    music:stop   track=local-forecast-elevator.mp3
 118658 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 118788 tv    ss:cancel    speaking=false pending=false
 118788 tv    music:plan   from=game:bingo to=null
 118788 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 120288 tv    music:stop   track=cool-vibes.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 120902 tv    ss:cancel    speaking=false pending=false
 120902 tv    music:plan   from=null to=lobby
 120902 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 124248 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 124256 tv    ss:cancel    speaking=false pending=false
 124258 tv    music:plan   from=lobby to=game:bingo
 124258 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 124258 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 124262 tv    hush
 124263 tv    hush
 124676 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 124866 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124867 tv    clip         src=i21.wav muted=false ready=true
 124867 tv    speak        text=i21.wav voice=clip
 125059 tv    music:stop   track=airport-lounge.mp3
 125186 tv    ss:cancel    speaking=false pending=false
 125186 tv    music:plan   from=game:bingo to=null
 125189 tv    ss:cancel    speaking=false pending=false
 125189 tv    music:plan   from=null to=lobby
 125189 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 125991 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 130755 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131190 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131621 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132037 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132471 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 133520 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 134124 tv    ss:cancel    speaking=false pending=false
 134129 tv    music:plan   from=lobby to=null
 134129 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 135373 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135629 tv    music:stop   track=local-forecast-elevator.mp3
 137090 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 138389 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 139689 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140744 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141786 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144339 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144512 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144702 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144894 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"lobby-time.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 145984 tv    ss:cancel    speaking=false pending=false
 145986 tv    ss:cancel    speaking=false pending=false
 145986 tv    music:plan   from=null to=lobby
 145986 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 148008 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 148017 tv    ss:cancel    speaking=false pending=false
 148024 tv    music:plan   from=lobby to=null
 148024 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149525 tv    music:stop   track=bossa-antigua.mp3
 149558 tv    music:plan   from=null to=game:broken-pencil
 149558 tv    music:start  plan=game:broken-pencil track=lobby-time mode=chain volume=0.2
 149558 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151043 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151512 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151670 tv    music:plan   from=game:broken-pencil to=null
 151670 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 153170 tv    music:stop   track=lobby-time.mp3
```
