# Audio interaction trace

Captured 2026-09-18T06:15:28.881Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**49 / 49 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:bossa-antigua
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":4.5}]

```
   1865 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   1898 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3240 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3396 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   4094 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4727 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5595 tv    ss:cancel    speaking=false pending=false
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
   6469 tv    music:plan   from=lobby to=null
   6469 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7976 tv    music:stop   track=bossa-antigua.mp3
   8423 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9713 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16675 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17675 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18676 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19675 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20675 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21461 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22220 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22382 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22540 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22692 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22852 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23011 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23168 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23324 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23482 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23627 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23769 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23930 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24085 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24241 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24400 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24560 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24716 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24859 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  25022 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25897 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26232 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  28043 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29774 tv    ss:cancel    speaking=false pending=false
  29774 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":1.5}]

```
  31334 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33510 tv    ss:cancel    speaking=false pending=false
  33510 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  35064 tv    ss:cancel    speaking=false pending=false
  35064 tv    music:plan   from=null to=lobby
  35064 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:local-forecast-elevator.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=phase,call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":15.5}]
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":19}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer cheer@+5375ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":33.3}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=lock,silence,phase,call spoken=b15.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=lock,tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36670 tv    music:plan   from=lobby to=game:bingo
  36670 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36670 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36977 tv    hush
  36977 tv    hush
  37475 tv    music:stop   track=local-forecast-elevator.mp3
  39730 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  39930 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39930 tv    clip         src=b9.wav muted=false ready=true
  39930 tv    speak        text=b9.wav voice=clip
  41758 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41758 tv    clip         src=b8.wav muted=false ready=true
  41758 tv    speak        text=b8.wav voice=clip
  43445 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  43738 tv    hush
  43739 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  43739 tv    hush
  49094 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  52300 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  52494 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52494 tv    clip         src=n34.wav muted=false ready=true
  52494 tv    speak        text=n34.wav voice=clip
  54491 tv    music:paused paused=true
  54492 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  55735 tv    music:paused paused=false
  55735 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62055 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  62055 tv    clip         src=b15.wav muted=false ready=true
  62055 tv    speak        text=b15.wav voice=clip
  62523 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  62811 tv    hush
  62811 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  62812 tv    hush
  64699 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  68186 tv    music:duck   ms=9000
  68186 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  72915 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  72921 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  73250 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  73446 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  73446 tv    clip         src=b15.wav muted=false ready=true
  73446 tv    speak        text=b15.wav voice=clip
  76861 tv    ss:cancel    speaking=false pending=false
  76861 tv    music:plan   from=game:bingo to=null
  76866 tv    ss:cancel    speaking=false pending=false
  76867 tv    music:plan   from=null to=lobby
  76867 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  77680 tv    music:stop   track=wallpaper.mp3
  79389 tv    ss:cancel    speaking=false pending=false
  79408 tv    music:plan   from=lobby to=game:bingo
  79408 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  79408 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  79414 tv    hush
  79415 tv    hush
  80018 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  80208 tv    music:stop   track=george-street-shuffle.mp3
  86549 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  86549 tv    clip         src=g59.wav muted=false ready=true
  86549 tv    speak        text=g59.wav voice=clip
  87675 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  87947 tv    hush
  87948 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  87948 tv    hush
  95564 tv    music:duck   ms=9000
  95564 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 100567 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 100574 tv    hush
 100575 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 100576 tv    hush
 104558 tv    ss:cancel    speaking=false pending=false
 104558 tv    music:plan   from=game:bingo to=null
 104558 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 106062 tv    music:stop   track=cool-vibes.mp3
 106160 tv    ss:cancel    speaking=false pending=false
 106160 tv    music:plan   from=null to=lobby
 106160 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 108679 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 108698 tv    ss:cancel    speaking=false pending=false
 108702 tv    music:plan   from=lobby to=game:bingo
 108702 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 108702 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 108709 tv    hush
 108709 tv    hush
 109506 tv    music:stop   track=local-forecast-elevator.mp3
 110828 tv    ss:cancel    speaking=false pending=false
 110828 tv    music:plan   from=game:bingo to=null
 110828 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 112343 tv    music:stop   track=cool-vibes.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 112943 tv    ss:cancel    speaking=false pending=false
 112943 tv    music:plan   from=null to=lobby
 112943 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 116341 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 116356 tv    ss:cancel    speaking=false pending=false
 116360 tv    music:plan   from=lobby to=game:bingo
 116360 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116360 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116368 tv    hush
 116368 tv    hush
 116778 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 116971 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 116971 tv    clip         src=i21.wav muted=false ready=true
 116971 tv    speak        text=i21.wav voice=clip
 117172 tv    music:stop   track=george-street-shuffle.mp3
 117278 tv    ss:cancel    speaking=false pending=false
 117278 tv    music:plan   from=game:bingo to=null
 117285 tv    ss:cancel    speaking=false pending=false
 117285 tv    music:plan   from=null to=lobby
 117286 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 118087 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.08,"t":10.2}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 122866 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 123294 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 123735 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 124167 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 124598 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 125742 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 126386 tv    ss:cancel    speaking=false pending=false
 126394 tv    music:plan   from=lobby to=null
 126394 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 127618 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 127904 tv    music:stop   track=george-street-shuffle.mp3
 129253 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 130567 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 131867 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 132922 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 133961 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 136535 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 136729 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 136914 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 137106 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"lobby-time.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 138210 tv    ss:cancel    speaking=false pending=false
 138214 tv    ss:cancel    speaking=false pending=false
 138214 tv    music:plan   from=null to=lobby
 138214 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 140235 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 140250 tv    ss:cancel    speaking=false pending=false
 140253 tv    music:plan   from=lobby to=null
 140253 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 141753 tv    music:stop   track=bossa-antigua.mp3
 141790 tv    music:plan   from=null to=game:broken-pencil
 141790 tv    music:start  plan=game:broken-pencil track=lobby-time mode=chain volume=0.2
 141790 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143261 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143718 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143876 tv    music:plan   from=game:broken-pencil to=null
 143876 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 145387 tv    music:stop   track=lobby-time.mp3
```
