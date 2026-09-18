# Audio interaction trace

Captured 2026-09-18T15:55:16.921Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**54 / 54 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.4}]

```
   1748 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1774 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3084 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3220 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3926 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4536 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5388 tv    ss:cancel    speaking=false pending=false
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
   6233 tv    music:plan   from=lobby to=null
   6233 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7744 tv    music:stop   track=airport-lounge.mp3
   8191 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9473 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16444 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17444 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18443 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19444 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20445 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21242 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22048 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22205 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22361 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22522 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22675 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22835 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22975 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23147 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23303 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23457 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23614 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23771 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23930 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24085 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24244 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24399 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24554 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24710 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24870 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25745 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26071 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27880 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29605 tv    ss:cancel    speaking=false pending=false
  29605 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":1.5}]

```
  31148 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33319 tv    ss:cancel    speaking=false pending=false
  33319 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34868 tv    ss:cancel    speaking=false pending=false
  34868 tv    music:plan   from=null to=lobby
  34868 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:local-forecast-elevator.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":3}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+954ms phone@+970ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18.1}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":25}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer,silence cheer@+5354ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.5}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5411ms cheer@+5365ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=3 lastTickIdx=2
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36428 tv    music:plan   from=lobby to=game:bingo
  36428 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36428 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36731 tv    hush
  36731 tv    hush
  37228 tv    music:stop   track=local-forecast-elevator.mp3
  37342 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38435 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39434 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40433 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41451 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41643 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41643 tv    clip         src=b9.wav muted=false ready=true
  41643 tv    speak        text=b9.wav voice=clip
  43283 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43283 tv    clip         src=b8.wav muted=false ready=true
  43283 tv    speak        text=b8.wav voice=clip
  45111 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45111 tv    clip         src=n34.wav muted=false ready=true
  45111 tv    speak        text=n34.wav voice=clip
  46802 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47064 tv    hush
  47064 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47065 tv    hush
  52416 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55422 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56424 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57423 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58610 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58611 tv    clip         src=n35.wav muted=false ready=true
  58611 tv    speak        text=n35.wav voice=clip
  60234 tv    music:paused paused=true
  60234 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61484 tv    music:paused paused=false
  61485 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  67990 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  67990 tv    clip         src=g57.wav muted=false ready=true
  67990 tv    speak        text=g57.wav voice=clip
  68418 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68707 tv    hush
  68707 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68707 tv    hush
  70583 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  74061 tv    music:duck   ms=9000
  74061 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  74113 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  78859 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79193 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80195 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81194 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82387 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  82388 tv    clip         src=g57.wav muted=false ready=true
  82388 tv    speak        text=g57.wav voice=clip
  84493 tv    ss:cancel    speaking=false pending=false
  84493 tv    music:plan   from=game:bingo to=null
  84496 tv    ss:cancel    speaking=false pending=false
  84496 tv    music:plan   from=null to=lobby
  84496 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  85297 tv    music:stop   track=wallpaper.mp3
  87012 tv    ss:cancel    speaking=false pending=false
  87021 tv    music:plan   from=lobby to=game:bingo
  87021 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  87021 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  87025 tv    hush
  87025 tv    hush
  87639 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  87822 tv    music:stop   track=local-forecast-elevator.mp3
  94582 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  94582 tv    clip         src=b14.wav muted=false ready=true
  94582 tv    speak        text=b14.wav voice=clip
  95613 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95874 tv    hush
  95874 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95874 tv    hush
 103479 tv    music:duck   ms=9000
 103479 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108496 tv    hush
 108496 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108496 tv    hush
 112505 tv    ss:cancel    speaking=false pending=false
 112505 tv    music:plan   from=game:bingo to=null
 112505 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 114007 tv    music:stop   track=wallpaper.mp3
 114059 tv    ss:cancel    speaking=false pending=false
 114059 tv    music:plan   from=null to=lobby
 114059 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 116578 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 116586 tv    ss:cancel    speaking=false pending=false
 116588 tv    music:plan   from=lobby to=game:bingo
 116588 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116588 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116591 tv    hush
 116591 tv    hush
 117202 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117391 tv    music:stop   track=airport-lounge.mp3
 118594 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 118712 tv    ss:cancel    speaking=false pending=false
 118712 tv    music:plan   from=game:bingo to=null
 118712 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 120212 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 120809 tv    ss:cancel    speaking=false pending=false
 120809 tv    music:plan   from=null to=lobby
 120809 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 124165 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 124172 tv    ss:cancel    speaking=false pending=false
 124177 tv    music:plan   from=lobby to=game:bingo
 124177 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 124177 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 124182 tv    hush
 124182 tv    hush
 124592 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 124783 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124783 tv    clip         src=i21.wav muted=false ready=true
 124783 tv    speak        text=i21.wav voice=clip
 124979 tv    music:stop   track=bossa-antigua.mp3
 125093 tv    ss:cancel    speaking=false pending=false
 125093 tv    music:plan   from=game:bingo to=null
 125096 tv    ss:cancel    speaking=false pending=false
 125096 tv    music:plan   from=null to=lobby
 125096 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 125897 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"airport-lounge.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 130646 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131062 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131503 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131931 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132345 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 133395 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 134002 tv    ss:cancel    speaking=false pending=false
 134007 tv    music:plan   from=lobby to=null
 134007 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 135258 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135509 tv    music:stop   track=airport-lounge.mp3
 136905 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 138212 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 139515 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140535 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141602 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144147 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144337 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144524 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144714 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 145791 tv    ss:cancel    speaking=false pending=false
 145794 tv    ss:cancel    speaking=false pending=false
 145794 tv    music:plan   from=null to=lobby
 145794 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 147805 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 147813 tv    ss:cancel    speaking=false pending=false
 147815 tv    music:plan   from=lobby to=null
 147815 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149316 tv    music:stop   track=local-forecast-elevator.mp3
 149362 tv    music:plan   from=null to=game:broken-pencil
 149362 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 149362 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150840 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151297 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151456 tv    music:plan   from=game:broken-pencil to=null
 151456 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 152957 tv    music:stop   track=hep-cats.mp3
```
