# Audio interaction trace

Captured 2026-09-18T09:35:32.470Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**52 / 52 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.4}]

```
   1744 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1773 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3080 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3216 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3916 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4548 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5383 tv    ss:cancel    speaking=false pending=false
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
   6223 tv    music:plan   from=lobby to=null
   6223 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7732 tv    music:stop   track=airport-lounge.mp3
   8180 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9451 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16431 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17438 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18433 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19435 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20433 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21232 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22012 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22164 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22320 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22480 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22633 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22790 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22933 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23074 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23232 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23387 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23543 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23697 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23854 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24008 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24163 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24325 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24481 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24635 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24792 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25680 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26000 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27808 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29552 tv    ss:cancel    speaking=false pending=false
  29552 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":1.5}]

```
  31110 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33250 tv    ss:cancel    speaking=false pending=false
  33250 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34812 tv    ss:cancel    speaking=false pending=false
  34812 tv    music:plan   from=null to=lobby
  34812 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:local-forecast-elevator.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro counts down: three ticks (3 · 2 · 1), then the first call** — cues=tick,tick,tick,phase,call
- ✅ **the phone taps 3 · 2 · 1 with the TV, silently** — taps=3 cues=
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":19}]
- ✅ **play resumes → the next number is spoken** — spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":22.4}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,lock cheer@+5356ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":36.3}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5402ms cheer@+5368ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=silence,phase,call spoken=g46.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36387 tv    music:plan   from=lobby to=game:bingo
  36387 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36387 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36694 tv    hush
  36694 tv    hush
  37188 tv    music:stop   track=local-forecast-elevator.mp3
  38447 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39446 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40446 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41395 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41585 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41586 tv    clip         src=b9.wav muted=false ready=true
  41586 tv    speak        text=b9.wav voice=clip
  43177 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43177 tv    clip         src=b8.wav muted=false ready=true
  43177 tv    speak        text=b8.wav voice=clip
  44998 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44998 tv    clip         src=n34.wav muted=false ready=true
  44998 tv    speak        text=n34.wav voice=clip
  46679 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  46946 tv    hush
  46946 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  46947 tv    hush
  52299 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55482 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  55673 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55673 tv    clip         src=n35.wav muted=false ready=true
  55673 tv    speak        text=n35.wav voice=clip
  57681 tv    music:paused paused=true
  57681 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  58945 tv    music:paused paused=false
  58946 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  64851 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  64851 tv    clip         src=g46.wav muted=false ready=true
  64851 tv    speak        text=g46.wav voice=clip
  65244 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  65513 tv    hush
  65513 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  65513 tv    hush
  67386 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  70869 tv    music:duck   ms=9000
  70869 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  70911 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  75652 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  75967 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  76157 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  76158 tv    clip         src=g46.wav muted=false ready=true
  76158 tv    speak        text=g46.wav voice=clip
  79573 tv    ss:cancel    speaking=false pending=false
  79573 tv    music:plan   from=game:bingo to=null
  79577 tv    ss:cancel    speaking=false pending=false
  79577 tv    music:plan   from=null to=lobby
  79577 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  80379 tv    music:stop   track=wallpaper.mp3
  82092 tv    ss:cancel    speaking=false pending=false
  82102 tv    music:plan   from=lobby to=game:bingo
  82102 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  82102 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  82106 tv    hush
  82106 tv    hush
  82727 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  82903 tv    music:stop   track=bossa-antigua.mp3
  89651 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  89651 tv    clip         src=b14.wav muted=false ready=true
  89651 tv    speak        text=b14.wav voice=clip
  90677 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  90933 tv    hush
  90933 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  90933 tv    hush
  98542 tv    music:duck   ms=9000
  98542 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  98553 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 103541 tv    hush
 103541 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 103542 tv    hush
 107546 tv    ss:cancel    speaking=false pending=false
 107546 tv    music:plan   from=game:bingo to=null
 107546 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 109048 tv    music:stop   track=wallpaper.mp3
 109122 tv    ss:cancel    speaking=false pending=false
 109122 tv    music:plan   from=null to=lobby
 109122 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 111632 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 111645 tv    ss:cancel    speaking=false pending=false
 111647 tv    music:plan   from=lobby to=game:bingo
 111647 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 111647 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 111650 tv    hush
 111651 tv    hush
 112447 tv    music:stop   track=george-street-shuffle.mp3
 113652 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 113775 tv    ss:cancel    speaking=false pending=false
 113775 tv    music:plan   from=game:bingo to=null
 113775 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 115276 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 115888 tv    ss:cancel    speaking=false pending=false
 115888 tv    music:plan   from=null to=lobby
 115888 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 119228 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 119237 tv    ss:cancel    speaking=false pending=false
 119243 tv    music:plan   from=lobby to=game:bingo
 119243 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 119243 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 119247 tv    hush
 119247 tv    hush
 119663 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 119854 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 119854 tv    clip         src=i21.wav muted=false ready=true
 119854 tv    speak        text=i21.wav voice=clip
 120044 tv    music:stop   track=george-street-shuffle.mp3
 120156 tv    ss:cancel    speaking=false pending=false
 120156 tv    music:plan   from=game:bingo to=null
 120159 tv    ss:cancel    speaking=false pending=false
 120159 tv    music:plan   from=null to=lobby
 120159 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 120961 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 125709 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 126141 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 126561 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 126992 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 127410 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 128456 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 129057 tv    ss:cancel    speaking=false pending=false
 129063 tv    music:plan   from=lobby to=null
 129063 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 130292 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 130563 tv    music:stop   track=george-street-shuffle.mp3
 131878 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 133178 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 134481 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135498 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 136552 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 139104 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 139292 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 139481 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 139675 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 140754 tv    ss:cancel    speaking=false pending=false
 140756 tv    ss:cancel    speaking=false pending=false
 140756 tv    music:plan   from=null to=lobby
 140756 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 142772 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 142797 tv    ss:cancel    speaking=false pending=false
 142799 tv    music:plan   from=lobby to=null
 142799 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 144300 tv    music:stop   track=bossa-antigua.mp3
 144337 tv    music:plan   from=null to=game:broken-pencil
 144337 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 144337 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 145813 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 146289 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 146444 tv    music:plan   from=game:broken-pencil to=null
 146444 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 147946 tv    music:stop   track=hep-cats.mp3
```
