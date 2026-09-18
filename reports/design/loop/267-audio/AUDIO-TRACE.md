# Audio interaction trace

Captured 2026-09-18T09:55:40.959Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**52 / 52 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:george-street-shuffle
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":4.4}]

```
   1739 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   1781 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3094 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3229 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3934 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4560 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5410 tv    ss:cancel    speaking=false pending=false
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
   6273 tv    music:plan   from=lobby to=null
   6273 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7774 tv    music:stop   track=george-street-shuffle.mp3
   8203 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9498 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16455 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17468 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18457 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19455 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20458 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21268 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22046 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22203 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22357 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22517 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22672 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22830 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22983 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23141 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23296 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23452 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23609 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23753 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23908 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24066 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24223 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24379 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24534 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24692 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24849 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25737 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26056 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27863 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29591 tv    ss:cancel    speaking=false pending=false
  29592 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31139 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33272 tv    ss:cancel    speaking=false pending=false
  33272 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34826 tv    ss:cancel    speaking=false pending=false
  34826 tv    music:plan   from=null to=lobby
  34826 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro counts down: three ticks (3 · 2 · 1), then the first call** — cues=tick,tick,tick,phase,call
- ✅ **the phone taps 3 · 2 · 1 with the TV, silently** — taps=3 cues=
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":19}]
- ✅ **play resumes → the next number is spoken** — spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":22.5}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,lock cheer@+5355ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":36.7}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5405ms cheer@+5368ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=silence,phase,call spoken=b15.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36384 tv    music:plan   from=lobby to=game:bingo
  36384 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36384 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36689 tv    hush
  36690 tv    hush
  37184 tv    music:stop   track=bossa-antigua.mp3
  38441 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39442 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40448 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41398 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41589 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41589 tv    clip         src=b9.wav muted=false ready=true
  41589 tv    speak        text=b9.wav voice=clip
  43193 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43193 tv    clip         src=b8.wav muted=false ready=true
  43193 tv    speak        text=b8.wav voice=clip
  45024 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45024 tv    clip         src=n34.wav muted=false ready=true
  45024 tv    speak        text=n34.wav voice=clip
  46708 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  46965 tv    hush
  46965 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  46966 tv    hush
  52320 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55513 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  55703 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55703 tv    clip         src=n35.wav muted=false ready=true
  55703 tv    speak        text=n35.wav voice=clip
  57712 tv    music:paused paused=true
  57712 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  58960 tv    music:paused paused=false
  58960 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  65191 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  65191 tv    clip         src=b15.wav muted=false ready=true
  65191 tv    speak        text=b15.wav voice=clip
  65577 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  65842 tv    hush
  65842 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  65843 tv    hush
  67715 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  71197 tv    music:duck   ms=9000
  71197 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  71244 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  75980 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  76307 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  76498 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  76498 tv    clip         src=b15.wav muted=false ready=true
  76498 tv    speak        text=b15.wav voice=clip
  79918 tv    ss:cancel    speaking=false pending=false
  79918 tv    music:plan   from=game:bingo to=null
  79923 tv    ss:cancel    speaking=false pending=false
  79923 tv    music:plan   from=null to=lobby
  79923 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  80724 tv    music:stop   track=cool-vibes.mp3
  82438 tv    ss:cancel    speaking=false pending=false
  82447 tv    music:plan   from=lobby to=game:bingo
  82447 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  82447 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  82450 tv    hush
  82450 tv    hush
  83068 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  83248 tv    music:stop   track=local-forecast-elevator.mp3
  89392 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  89392 tv    clip         src=g59.wav muted=false ready=true
  89392 tv    speak        text=g59.wav voice=clip
  90437 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  90704 tv    hush
  90704 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  90704 tv    hush
  98308 tv    music:duck   ms=9000
  98308 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  98325 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 103319 tv    hush
 103319 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 103320 tv    hush
 107320 tv    ss:cancel    speaking=false pending=false
 107320 tv    music:plan   from=game:bingo to=null
 107320 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108821 tv    music:stop   track=wallpaper.mp3
 108916 tv    ss:cancel    speaking=false pending=false
 108916 tv    music:plan   from=null to=lobby
 108916 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 111434 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 111443 tv    ss:cancel    speaking=false pending=false
 111446 tv    music:plan   from=lobby to=game:bingo
 111446 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 111446 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 111450 tv    hush
 111450 tv    hush
 112247 tv    music:stop   track=local-forecast-elevator.mp3
 113452 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 113602 tv    ss:cancel    speaking=false pending=false
 113602 tv    music:plan   from=game:bingo to=null
 113602 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 115103 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 115699 tv    ss:cancel    speaking=false pending=false
 115699 tv    music:plan   from=null to=lobby
 115699 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 119046 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 119056 tv    ss:cancel    speaking=false pending=false
 119058 tv    music:plan   from=lobby to=game:bingo
 119058 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 119058 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 119061 tv    hush
 119062 tv    hush
 119492 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 119683 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 119683 tv    clip         src=i21.wav muted=false ready=true
 119683 tv    speak        text=i21.wav voice=clip
 119860 tv    music:stop   track=local-forecast-elevator.mp3
 119984 tv    ss:cancel    speaking=false pending=false
 119984 tv    music:plan   from=game:bingo to=null
 119987 tv    ss:cancel    speaking=false pending=false
 119987 tv    music:plan   from=null to=lobby
 119988 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 120789 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 125538 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 125952 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 126386 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 126819 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 127236 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 128318 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 128905 tv    ss:cancel    speaking=false pending=false
 128912 tv    music:plan   from=lobby to=null
 128912 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 130149 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 130413 tv    music:stop   track=george-street-shuffle.mp3
 131721 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 133021 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 134421 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135434 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 136474 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 139031 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 139227 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 139411 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 139602 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"lobby-time.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 140699 tv    ss:cancel    speaking=false pending=false
 140701 tv    ss:cancel    speaking=false pending=false
 140701 tv    music:plan   from=null to=lobby
 140701 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 142714 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 142721 tv    ss:cancel    speaking=false pending=false
 142723 tv    music:plan   from=lobby to=null
 142723 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 144223 tv    music:stop   track=local-forecast-elevator.mp3
 144283 tv    music:plan   from=null to=game:broken-pencil
 144283 tv    music:start  plan=game:broken-pencil track=lobby-time mode=chain volume=0.2
 144283 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 145765 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 146239 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 146394 tv    music:plan   from=game:broken-pencil to=null
 146394 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 147894 tv    music:stop   track=lobby-time.mp3
```
