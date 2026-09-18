# Audio interaction trace

Captured 2026-09-18T08:38:51.679Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**50 / 50 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:bossa-antigua
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":4.4}]

```
   1755 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   1783 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3109 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3245 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3939 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4579 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5430 tv    ss:cancel    speaking=false pending=false
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
   7785 tv    music:stop   track=bossa-antigua.mp3
   8222 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9528 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16482 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17483 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18481 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19485 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20486 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21283 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22077 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22234 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22373 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22535 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22689 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22841 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22999 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23139 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23297 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23457 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23611 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23752 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23908 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24070 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24223 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24381 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24537 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24691 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24849 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25730 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26057 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27863 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29589 tv    ss:cancel    speaking=false pending=false
  29589 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31156 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33290 tv    ss:cancel    speaking=false pending=false
  33290 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34842 tv    ss:cancel    speaking=false pending=false
  34842 tv    music:plan   from=null to=lobby
  34842 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=phase,call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":15.4}]
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":18.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,lock cheer@+5358ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":33.2}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5410ms cheer@+5368ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=silence,phase,call spoken=b15.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36407 tv    music:plan   from=lobby to=game:bingo
  36407 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36407 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36711 tv    hush
  36711 tv    hush
  37209 tv    music:stop   track=airport-lounge.mp3
  39465 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  39656 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39656 tv    clip         src=b9.wav muted=false ready=true
  39656 tv    speak        text=b9.wav voice=clip
  41477 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41477 tv    clip         src=b8.wav muted=false ready=true
  41477 tv    speak        text=b8.wav voice=clip
  43142 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  43409 tv    hush
  43409 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  43409 tv    hush
  48761 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  51944 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  52135 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52135 tv    clip         src=n34.wav muted=false ready=true
  52135 tv    speak        text=n34.wav voice=clip
  54146 tv    music:paused paused=true
  54146 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  55391 tv    music:paused paused=false
  55391 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  61724 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61724 tv    clip         src=b15.wav muted=false ready=true
  61724 tv    speak        text=b15.wav voice=clip
  62107 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  62397 tv    hush
  62397 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  62397 tv    hush
  64272 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  67755 tv    music:duck   ms=9000
  67755 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  67803 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  72546 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  72869 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  73060 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  73061 tv    clip         src=b15.wav muted=false ready=true
  73061 tv    speak        text=b15.wav voice=clip
  76469 tv    ss:cancel    speaking=false pending=false
  76469 tv    music:plan   from=game:bingo to=null
  76472 tv    ss:cancel    speaking=false pending=false
  76472 tv    music:plan   from=null to=lobby
  76472 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  77272 tv    music:stop   track=wallpaper.mp3
  78990 tv    ss:cancel    speaking=false pending=false
  78999 tv    music:plan   from=lobby to=game:bingo
  78999 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  78999 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  79002 tv    hush
  79002 tv    hush
  79626 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  79800 tv    music:stop   track=airport-lounge.mp3
  85881 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  85882 tv    clip         src=g59.wav muted=false ready=true
  85882 tv    speak        text=g59.wav voice=clip
  86905 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  87170 tv    hush
  87170 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  87171 tv    hush
  94774 tv    music:duck   ms=9000
  94774 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  94784 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  99790 tv    hush
  99790 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
  99791 tv    hush
 103796 tv    ss:cancel    speaking=false pending=false
 103796 tv    music:plan   from=game:bingo to=null
 103796 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 105297 tv    music:stop   track=cool-vibes.mp3
 105385 tv    ss:cancel    speaking=false pending=false
 105385 tv    music:plan   from=null to=lobby
 105385 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 107893 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 107901 tv    ss:cancel    speaking=false pending=false
 107909 tv    music:plan   from=lobby to=game:bingo
 107909 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 107909 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 107913 tv    hush
 107914 tv    hush
 108711 tv    music:stop   track=bossa-antigua.mp3
 110038 tv    ss:cancel    speaking=false pending=false
 110038 tv    music:plan   from=game:bingo to=null
 110038 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 111538 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 112133 tv    ss:cancel    speaking=false pending=false
 112133 tv    music:plan   from=null to=lobby
 112134 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 115474 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 115483 tv    ss:cancel    speaking=false pending=false
 115485 tv    music:plan   from=lobby to=game:bingo
 115485 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 115485 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 115489 tv    hush
 115489 tv    hush
 115889 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 116080 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 116080 tv    clip         src=i21.wav muted=false ready=true
 116080 tv    speak        text=i21.wav voice=clip
 116287 tv    music:stop   track=george-street-shuffle.mp3
 116384 tv    ss:cancel    speaking=false pending=false
 116384 tv    music:plan   from=game:bingo to=null
 116387 tv    ss:cancel    speaking=false pending=false
 116387 tv    music:plan   from=null to=lobby
 116387 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 117188 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 121938 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 122354 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 122787 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 123220 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 123636 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 124721 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 125314 tv    ss:cancel    speaking=false pending=false
 125321 tv    music:plan   from=lobby to=null
 125321 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 126560 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 126822 tv    music:stop   track=bossa-antigua.mp3
 128139 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 129438 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 130740 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 131762 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 132804 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135360 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 135550 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135739 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 135929 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"lobby-time.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 137016 tv    ss:cancel    speaking=false pending=false
 137018 tv    ss:cancel    speaking=false pending=false
 137018 tv    music:plan   from=null to=lobby
 137018 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 139029 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 139037 tv    ss:cancel    speaking=false pending=false
 139039 tv    music:plan   from=lobby to=null
 139039 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 140539 tv    music:stop   track=local-forecast-elevator.mp3
 140581 tv    music:plan   from=null to=game:broken-pencil
 140581 tv    music:start  plan=game:broken-pencil track=lobby-time mode=chain volume=0.2
 140581 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 142065 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 142538 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 142694 tv    music:plan   from=game:broken-pencil to=null
 142694 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 144195 tv    music:stop   track=lobby-time.mp3
```
