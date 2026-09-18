# Audio interaction trace

Captured 2026-09-18T10:50:38.576Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**52 / 52 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.4}]

```
   1759 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1785 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3097 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3218 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3918 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
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
   6247 tv    music:plan   from=lobby to=null
   6247 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7757 tv    music:stop   track=airport-lounge.mp3
   8191 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9473 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16448 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17449 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18447 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19450 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20451 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21264 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22060 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22218 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22372 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22529 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22687 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22843 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23004 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23157 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23309 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23471 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23627 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23787 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23942 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24097 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24252 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24411 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24566 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24725 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24880 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25756 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26089 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27892 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29638 tv    ss:cancel    speaking=false pending=false
  29638 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":1.5}]

```
  31197 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33333 tv    ss:cancel    speaking=false pending=false
  33333 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34881 tv    ss:cancel    speaking=false pending=false
  34881 tv    music:plan   from=null to=lobby
  34881 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
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
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":19.1}]
- ✅ **play resumes → the next number is spoken** — spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":22.5}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,silence,lock cheer@+5355ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":37}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5415ms cheer@+5368ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=silence,phase,call spoken=g57.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36442 tv    music:plan   from=lobby to=game:bingo
  36442 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36443 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36747 tv    hush
  36747 tv    hush
  37247 tv    music:stop   track=local-forecast-elevator.mp3
  38498 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39500 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40499 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41452 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41643 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41644 tv    clip         src=b9.wav muted=false ready=true
  41644 tv    speak        text=b9.wav voice=clip
  43267 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43267 tv    clip         src=b8.wav muted=false ready=true
  43267 tv    speak        text=b8.wav voice=clip
  45097 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45097 tv    clip         src=n34.wav muted=false ready=true
  45097 tv    speak        text=n34.wav voice=clip
  46781 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47052 tv    hush
  47052 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47052 tv    hush
  52405 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55602 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  55792 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55793 tv    clip         src=n35.wav muted=false ready=true
  55793 tv    speak        text=n35.wav voice=clip
  57786 tv    music:paused paused=true
  57786 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  59031 tv    music:paused paused=false
  59031 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  65434 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  65434 tv    clip         src=g57.wav muted=false ready=true
  65434 tv    speak        text=g57.wav voice=clip
  65853 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  66145 tv    hush
  66145 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  66146 tv    hush
  68019 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  71500 tv    music:duck   ms=9000
  71500 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  71553 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  71553 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  76301 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  76631 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  76821 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  76821 tv    clip         src=g57.wav muted=false ready=true
  76821 tv    speak        text=g57.wav voice=clip
  80240 tv    ss:cancel    speaking=false pending=false
  80240 tv    music:plan   from=game:bingo to=null
  80243 tv    ss:cancel    speaking=false pending=false
  80243 tv    music:plan   from=null to=lobby
  80243 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  81044 tv    music:stop   track=cool-vibes.mp3
  82754 tv    ss:cancel    speaking=false pending=false
  82762 tv    music:plan   from=lobby to=game:bingo
  82762 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  82762 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  82767 tv    hush
  82767 tv    hush
  83388 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  83564 tv    music:stop   track=airport-lounge.mp3
  90344 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  90344 tv    clip         src=b14.wav muted=false ready=true
  90344 tv    speak        text=b14.wav voice=clip
  91384 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  91651 tv    hush
  91651 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  91651 tv    hush
  99256 tv    music:duck   ms=9000
  99256 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  99267 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 104272 tv    hush
 104272 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 104273 tv    hush
 108274 tv    ss:cancel    speaking=false pending=false
 108274 tv    music:plan   from=game:bingo to=null
 108274 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 109775 tv    music:stop   track=wallpaper.mp3
 109856 tv    ss:cancel    speaking=false pending=false
 109856 tv    music:plan   from=null to=lobby
 109856 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 112370 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 112378 tv    ss:cancel    speaking=false pending=false
 112380 tv    music:plan   from=lobby to=game:bingo
 112380 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 112380 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 112384 tv    hush
 112384 tv    hush
 113180 tv    music:stop   track=george-street-shuffle.mp3
 114386 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 114526 tv    ss:cancel    speaking=false pending=false
 114526 tv    music:plan   from=game:bingo to=null
 114526 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 116027 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 116623 tv    ss:cancel    speaking=false pending=false
 116623 tv    music:plan   from=null to=lobby
 116623 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 119977 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 119988 tv    ss:cancel    speaking=false pending=false
 119993 tv    music:plan   from=lobby to=game:bingo
 119993 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 119993 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 119997 tv    hush
 119998 tv    hush
 120406 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 120597 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 120597 tv    clip         src=i21.wav muted=false ready=true
 120597 tv    speak        text=i21.wav voice=clip
 120795 tv    music:stop   track=airport-lounge.mp3
 120907 tv    ss:cancel    speaking=false pending=false
 120907 tv    music:plan   from=game:bingo to=null
 120910 tv    ss:cancel    speaking=false pending=false
 120910 tv    music:plan   from=null to=lobby
 120910 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 121710 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 126476 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 126915 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 127364 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 127797 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 128243 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 129308 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 129883 tv    ss:cancel    speaking=false pending=false
 129889 tv    music:plan   from=lobby to=null
 129889 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 131137 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 131393 tv    music:stop   track=bossa-antigua.mp3
 132744 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 134026 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 135329 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 136334 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 137388 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 139931 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 140121 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140310 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 140502 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 141604 tv    ss:cancel    speaking=false pending=false
 141607 tv    ss:cancel    speaking=false pending=false
 141607 tv    music:plan   from=null to=lobby
 141607 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 143624 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 143640 tv    ss:cancel    speaking=false pending=false
 143642 tv    music:plan   from=lobby to=null
 143642 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 145142 tv    music:stop   track=airport-lounge.mp3
 145193 tv    music:plan   from=null to=game:broken-pencil
 145193 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 145193 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 146668 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 147125 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 147266 tv    music:plan   from=game:broken-pencil to=null
 147266 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 148768 tv    music:stop   track=hep-cats.mp3
```
