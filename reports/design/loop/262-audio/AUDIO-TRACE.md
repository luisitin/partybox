# Audio interaction trace

Captured 2026-09-18T08:55:57.297Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**51 / 51 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.4}]

```
   1753 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1780 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3090 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3227 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3920 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4557 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5393 tv    ss:cancel    speaking=false pending=false
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
   6235 tv    music:plan   from=lobby to=null
   6235 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7746 tv    music:stop   track=airport-lounge.mp3
   8179 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9462 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16431 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17431 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18432 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19431 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20430 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21245 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22045 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22203 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22360 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22518 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22676 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22833 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22974 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23132 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23289 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23445 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23601 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23759 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23916 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24074 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24231 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24388 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24544 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24703 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24846 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25724 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26055 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27863 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29596 tv    ss:cancel    speaking=false pending=false
  29596 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":1.5}]

```
  31153 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33303 tv    ss:cancel    speaking=false pending=false
  33303 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34853 tv    ss:cancel    speaking=false pending=false
  34853 tv    music:plan   from=null to=lobby
  34853 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:local-forecast-elevator.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro counts down: three ticks (3 · 2 · 1), then the first call** — cues=tick,tick,tick,phase,call
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":19}]
- ✅ **play resumes → the next number is spoken** — spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":22.4}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,lock cheer@+5355ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":36.6}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5402ms cheer@+5365ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=silence,phase,call spoken=b15.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36418 tv    music:plan   from=lobby to=game:bingo
  36418 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36418 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36721 tv    hush
  36721 tv    hush
  37218 tv    music:stop   track=local-forecast-elevator.mp3
  38473 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39473 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40474 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41431 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41622 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41622 tv    clip         src=b9.wav muted=false ready=true
  41622 tv    speak        text=b9.wav voice=clip
  43183 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43183 tv    clip         src=b8.wav muted=false ready=true
  43183 tv    speak        text=b8.wav voice=clip
  45006 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45006 tv    clip         src=n34.wav muted=false ready=true
  45006 tv    speak        text=n34.wav voice=clip
  46689 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  46946 tv    hush
  46946 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  46947 tv    hush
  52300 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55492 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  55683 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55683 tv    clip         src=n35.wav muted=false ready=true
  55683 tv    speak        text=n35.wav voice=clip
  57705 tv    music:paused paused=true
  57705 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  58938 tv    music:paused paused=false
  58938 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  65132 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  65132 tv    clip         src=b15.wav muted=false ready=true
  65132 tv    speak        text=b15.wav voice=clip
  65524 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  65785 tv    hush
  65785 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  65786 tv    hush
  67660 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  71140 tv    music:duck   ms=9000
  71140 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  71183 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  75928 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  76255 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  76446 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  76446 tv    clip         src=b15.wav muted=false ready=true
  76446 tv    speak        text=b15.wav voice=clip
  79848 tv    ss:cancel    speaking=false pending=false
  79848 tv    music:plan   from=game:bingo to=null
  79851 tv    ss:cancel    speaking=false pending=false
  79851 tv    music:plan   from=null to=lobby
  79851 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  80652 tv    music:stop   track=wallpaper.mp3
  82376 tv    ss:cancel    speaking=false pending=false
  82388 tv    music:plan   from=lobby to=game:bingo
  82388 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  82388 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  82391 tv    hush
  82392 tv    hush
  83000 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  83190 tv    music:stop   track=local-forecast-elevator.mp3
  89279 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  89279 tv    clip         src=g59.wav muted=false ready=true
  89279 tv    speak        text=g59.wav voice=clip
  90337 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  90600 tv    hush
  90600 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  90601 tv    hush
  98205 tv    music:duck   ms=9000
  98205 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  98224 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 103211 tv    hush
 103211 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 103211 tv    hush
 107218 tv    ss:cancel    speaking=false pending=false
 107218 tv    music:plan   from=game:bingo to=null
 107218 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108718 tv    music:stop   track=wallpaper.mp3
 108815 tv    ss:cancel    speaking=false pending=false
 108815 tv    music:plan   from=null to=lobby
 108815 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 111329 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 111340 tv    ss:cancel    speaking=false pending=false
 111342 tv    music:plan   from=lobby to=game:bingo
 111342 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 111342 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 111345 tv    hush
 111346 tv    hush
 112143 tv    music:stop   track=local-forecast-elevator.mp3
 113347 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 113468 tv    ss:cancel    speaking=false pending=false
 113468 tv    music:plan   from=game:bingo to=null
 113468 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 114969 tv    music:stop   track=cool-vibes.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 115564 tv    ss:cancel    speaking=false pending=false
 115564 tv    music:plan   from=null to=lobby
 115564 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 118919 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 118938 tv    ss:cancel    speaking=false pending=false
 118940 tv    music:plan   from=lobby to=game:bingo
 118940 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 118940 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 118944 tv    hush
 118944 tv    hush
 119365 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 119555 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 119555 tv    clip         src=i21.wav muted=false ready=true
 119555 tv    speak        text=i21.wav voice=clip
 119742 tv    music:stop   track=airport-lounge.mp3
 119866 tv    ss:cancel    speaking=false pending=false
 119866 tv    music:plan   from=game:bingo to=null
 119869 tv    ss:cancel    speaking=false pending=false
 119869 tv    music:plan   from=null to=lobby
 119869 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 120671 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 125435 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 125868 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 126284 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 126717 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 127133 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 128251 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 128858 tv    ss:cancel    speaking=false pending=false
 128865 tv    music:plan   from=lobby to=null
 128865 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 130104 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 130366 tv    music:stop   track=bossa-antigua.mp3
 131686 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 132968 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 134386 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135417 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 136464 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 139014 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 139204 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 139393 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 139579 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 140664 tv    ss:cancel    speaking=false pending=false
 140667 tv    ss:cancel    speaking=false pending=false
 140667 tv    music:plan   from=null to=lobby
 140667 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 142673 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 142682 tv    ss:cancel    speaking=false pending=false
 142683 tv    music:plan   from=lobby to=null
 142683 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 144185 tv    music:stop   track=george-street-shuffle.mp3
 144224 tv    music:plan   from=null to=game:broken-pencil
 144224 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 144224 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 145705 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 146176 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 146331 tv    music:plan   from=game:broken-pencil to=null
 146331 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 147832 tv    music:stop   track=backbay-lounge.mp3
```
