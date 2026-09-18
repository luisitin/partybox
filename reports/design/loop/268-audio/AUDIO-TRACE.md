# Audio interaction trace

Captured 2026-09-18T10:05:16.527Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**52 / 52 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.4}]

```
   1779 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1806 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3118 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3253 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3939 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4569 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5419 tv    ss:cancel    speaking=false pending=false
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
   6259 tv    music:plan   from=lobby to=null
   6259 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7760 tv    music:stop   track=local-forecast-elevator.mp3
   8221 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9490 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16475 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17476 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18475 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19476 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20476 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21268 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22065 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22205 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22346 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22502 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22659 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22817 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22958 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23115 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23273 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23430 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23586 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23745 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23905 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24057 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24213 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24368 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24525 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24681 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24840 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25715 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26043 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27851 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29574 tv    ss:cancel    speaking=false pending=false
  29574 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31114 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33265 tv    ss:cancel    speaking=false pending=false
  33265 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34814 tv    ss:cancel    speaking=false pending=false
  34814 tv    music:plan   from=null to=lobby
  34814 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:bossa-antigua.mp3
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
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,lock cheer@+5354ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":36.9}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5403ms cheer@+5364ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=silence,phase,call spoken=g57.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36375 tv    music:plan   from=lobby to=game:bingo
  36375 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36375 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36679 tv    hush
  36679 tv    hush
  37175 tv    music:stop   track=bossa-antigua.mp3
  38430 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39432 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40431 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41375 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41566 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41566 tv    clip         src=b9.wav muted=false ready=true
  41566 tv    speak        text=b9.wav voice=clip
  43203 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43203 tv    clip         src=b8.wav muted=false ready=true
  43203 tv    speak        text=b8.wav voice=clip
  45020 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45020 tv    clip         src=n34.wav muted=false ready=true
  45020 tv    speak        text=n34.wav voice=clip
  46702 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  46972 tv    hush
  46972 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  46973 tv    hush
  52327 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55515 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  55707 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55707 tv    clip         src=n35.wav muted=false ready=true
  55707 tv    speak        text=n35.wav voice=clip
  57716 tv    music:paused paused=true
  57716 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  58951 tv    music:paused paused=false
  58951 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  65333 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  65333 tv    clip         src=g57.wav muted=false ready=true
  65333 tv    speak        text=g57.wav voice=clip
  65747 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  66035 tv    hush
  66035 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  66035 tv    hush
  67909 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  71389 tv    music:duck   ms=9000
  71389 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  71435 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  76203 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  76525 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  76717 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  76717 tv    clip         src=g57.wav muted=false ready=true
  76717 tv    speak        text=g57.wav voice=clip
  80125 tv    ss:cancel    speaking=false pending=false
  80125 tv    music:plan   from=game:bingo to=null
  80128 tv    ss:cancel    speaking=false pending=false
  80128 tv    music:plan   from=null to=lobby
  80128 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  80929 tv    music:stop   track=wallpaper.mp3
  82654 tv    ss:cancel    speaking=false pending=false
  82663 tv    music:plan   from=lobby to=game:bingo
  82663 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  82663 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  82666 tv    hush
  82667 tv    hush
  83291 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  83465 tv    music:stop   track=george-street-shuffle.mp3
  90259 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  90259 tv    clip         src=b14.wav muted=false ready=true
  90259 tv    speak        text=b14.wav voice=clip
  91297 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  91559 tv    hush
  91560 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  91560 tv    hush
  99165 tv    music:duck   ms=9000
  99165 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  99176 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 104176 tv    hush
 104176 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 104176 tv    hush
 108181 tv    ss:cancel    speaking=false pending=false
 108181 tv    music:plan   from=game:bingo to=null
 108181 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 109682 tv    music:stop   track=cool-vibes.mp3
 109775 tv    ss:cancel    speaking=false pending=false
 109775 tv    music:plan   from=null to=lobby
 109775 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 112296 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 112305 tv    ss:cancel    speaking=false pending=false
 112307 tv    music:plan   from=lobby to=game:bingo
 112307 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 112307 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 112311 tv    hush
 112311 tv    hush
 113108 tv    music:stop   track=bossa-antigua.mp3
 114312 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 114445 tv    ss:cancel    speaking=false pending=false
 114445 tv    music:plan   from=game:bingo to=null
 114446 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 115946 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 116559 tv    ss:cancel    speaking=false pending=false
 116559 tv    music:plan   from=null to=lobby
 116559 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 119919 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 119928 tv    ss:cancel    speaking=false pending=false
 119930 tv    music:plan   from=lobby to=game:bingo
 119930 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 119930 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 119933 tv    hush
 119933 tv    hush
 120349 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 120540 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 120540 tv    clip         src=i21.wav muted=false ready=true
 120540 tv    speak        text=i21.wav voice=clip
 120734 tv    music:stop   track=airport-lounge.mp3
 120841 tv    ss:cancel    speaking=false pending=false
 120841 tv    music:plan   from=game:bingo to=null
 120844 tv    ss:cancel    speaking=false pending=false
 120844 tv    music:plan   from=null to=lobby
 120844 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 121645 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 126413 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 126845 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 127261 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 127697 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 128127 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 129193 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 129788 tv    ss:cancel    speaking=false pending=false
 129795 tv    music:plan   from=lobby to=null
 129795 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 131039 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 131297 tv    music:stop   track=local-forecast-elevator.mp3
 132630 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 133929 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 135239 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 136248 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 137285 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 139847 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 140034 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140226 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 140414 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 141506 tv    ss:cancel    speaking=false pending=false
 141508 tv    ss:cancel    speaking=false pending=false
 141508 tv    music:plan   from=null to=lobby
 141508 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 143519 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 143527 tv    ss:cancel    speaking=false pending=false
 143529 tv    music:plan   from=lobby to=null
 143529 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 145029 tv    music:stop   track=george-street-shuffle.mp3
 145075 tv    music:plan   from=null to=game:broken-pencil
 145075 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 145075 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 146553 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 147025 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 147179 tv    music:plan   from=game:broken-pencil to=null
 147179 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 148681 tv    music:stop   track=backbay-lounge.mp3
```
