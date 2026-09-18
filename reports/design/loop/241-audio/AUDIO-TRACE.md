# Audio interaction trace

Captured 2026-09-18T03:22:02.189Z on port 42136. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**46 / 46 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.4}]

```
   1729 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1759 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3084 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3246 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3932 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4557 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5402 tv    ss:cancel    speaking=false pending=false
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
   6260 tv    music:plan   from=lobby to=null
   6260 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7771 tv    music:stop   track=airport-lounge.mp3
   8222 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9517 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16475 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17475 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18476 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19477 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20476 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21262 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22081 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22237 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22393 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22548 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22704 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22860 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23022 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23174 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23336 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23489 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23648 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23802 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23960 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24120 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24270 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24428 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24596 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24741 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24898 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25784 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26105 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27909 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29648 tv    ss:cancel    speaking=false pending=false
  29649 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31221 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33425 tv    ss:cancel    speaking=false pending=false
  33425 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34993 tv    ss:cancel    speaking=false pending=false
  34995 tv    music:plan   from=null to=lobby
  34995 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=phase,call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":15.4}]
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":18.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer cheer@+5367ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":33}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=lock,silence,phase,call spoken=g46.wav
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36578 tv    music:plan   from=lobby to=game:bingo
  36578 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36578 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36892 tv    hush
  36892 tv    hush
  37380 tv    music:stop   track=bossa-antigua.mp3
  39617 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  39822 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39823 tv    clip         src=b9.wav muted=false ready=true
  39823 tv    speak        text=b9.wav voice=clip
  41636 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41636 tv    clip         src=b8.wav muted=false ready=true
  41636 tv    speak        text=b8.wav voice=clip
  43585 tv    hush
  43586 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  43586 tv    hush
  48944 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  52136 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  52335 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52335 tv    clip         src=n34.wav muted=false ready=true
  52335 tv    speak        text=n34.wav voice=clip
  54368 tv    music:paused paused=true
  54369 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  55656 tv    music:paused paused=false
  55658 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  61772 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61772 tv    clip         src=g46.wav muted=false ready=true
  61772 tv    speak        text=g46.wav voice=clip
  62486 tv    hush
  62487 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  62487 tv    hush
  64370 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  67853 tv    music:duck   ms=9000
  67853 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  72606 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  72618 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  72923 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  73122 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  73123 tv    clip         src=g46.wav muted=false ready=true
  73123 tv    speak        text=g46.wav voice=clip
  77111 tv    ss:cancel    speaking=false pending=false
  77112 tv    music:plan   from=game:bingo to=null
  77112 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  78622 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
  79245 tv    ss:cancel    speaking=false pending=false
  79245 tv    music:plan   from=null to=lobby
  79245 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  82598 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
  82615 tv    ss:cancel    speaking=false pending=false
  82618 tv    music:plan   from=lobby to=game:bingo
  82618 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  82618 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  82625 tv    hush
  82625 tv    hush
  83052 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  83252 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  83252 tv    clip         src=i21.wav muted=false ready=true
  83252 tv    speak        text=i21.wav voice=clip
  83422 tv    music:stop   track=airport-lounge.mp3
  83546 tv    ss:cancel    speaking=false pending=false
  83546 tv    music:plan   from=game:bingo to=null
  83554 tv    ss:cancel    speaking=false pending=false
  83554 tv    music:plan   from=null to=lobby
  83554 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  84368 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":9.4}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
  89117 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  89537 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  89979 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  91161 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
  91766 tv    ss:cancel    speaking=false pending=false
  91774 tv    music:plan   from=lobby to=null
  91774 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  93014 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  93282 tv    music:stop   track=george-street-shuffle.mp3
  94627 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  95970 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
  97327 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  98405 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  99456 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 102011 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 102193 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 102384 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 102562 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 103679 tv    ss:cancel    speaking=false pending=false
 103686 tv    ss:cancel    speaking=false pending=false
 103686 tv    music:plan   from=null to=lobby
 103687 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 105697 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 105717 tv    ss:cancel    speaking=false pending=false
 105720 tv    music:plan   from=lobby to=null
 105720 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 107221 tv    music:stop   track=local-forecast-elevator.mp3
 107259 tv    music:plan   from=null to=game:broken-pencil
 107259 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 107259 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 108746 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 109215 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 109361 tv    music:plan   from=game:broken-pencil to=null
 109361 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 110868 tv    music:stop   track=backbay-lounge.mp3
```
