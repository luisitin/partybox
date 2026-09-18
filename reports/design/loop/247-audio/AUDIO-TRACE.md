# Audio interaction trace

Captured 2026-09-18T04:43:57.357Z on port 42156. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**48 / 48 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.4}]

```
   1744 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1769 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3083 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3235 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3930 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4563 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5418 tv    ss:cancel    speaking=false pending=false
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
   6275 tv    music:plan   from=lobby to=null
   6275 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7775 tv    music:stop   track=local-forecast-elevator.mp3
   8235 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9520 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16491 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17488 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18486 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19492 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20492 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21272 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22066 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22229 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22387 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22538 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22695 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22861 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23011 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23190 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23322 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23483 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23631 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23780 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23948 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24104 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24266 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24436 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24575 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24731 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24858 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25728 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26048 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27862 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29589 tv    ss:cancel    speaking=false pending=false
  29589 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":1.5}]

```
  31145 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33320 tv    ss:cancel    speaking=false pending=false
  33320 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34863 tv    ss:cancel    speaking=false pending=false
  34863 tv    music:plan   from=null to=lobby
  34863 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:george-street-shuffle.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=phase,call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":15.5}]
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":19}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer cheer@+5371ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":33.1}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=lock,silence,phase,call spoken=g46.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=lock,tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36460 tv    music:plan   from=lobby to=game:bingo
  36461 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36461 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36772 tv    hush
  36772 tv    hush
  37270 tv    music:stop   track=george-street-shuffle.mp3
  39523 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  39713 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39714 tv    clip         src=b9.wav muted=false ready=true
  39714 tv    speak        text=b9.wav voice=clip
  41540 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41540 tv    clip         src=b8.wav muted=false ready=true
  41540 tv    speak        text=b8.wav voice=clip
  43487 tv    hush
  43487 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  43487 tv    hush
  48845 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  52051 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  52251 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52251 tv    clip         src=n34.wav muted=false ready=true
  52251 tv    speak        text=n34.wav voice=clip
  54274 tv    music:paused paused=true
  54275 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  55553 tv    music:paused paused=false
  55554 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  61706 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61706 tv    clip         src=g46.wav muted=false ready=true
  61706 tv    speak        text=g46.wav voice=clip
  62411 tv    hush
  62411 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  62411 tv    hush
  64307 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  67782 tv    music:duck   ms=9000
  67782 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  72516 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  72527 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  72851 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  73053 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  73053 tv    clip         src=g46.wav muted=false ready=true
  73053 tv    speak        text=g46.wav voice=clip
  76445 tv    ss:cancel    speaking=false pending=false
  76445 tv    music:plan   from=game:bingo to=null
  76450 tv    ss:cancel    speaking=false pending=false
  76450 tv    music:plan   from=null to=lobby
  76450 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  77264 tv    music:stop   track=wallpaper.mp3
  78962 tv    ss:cancel    speaking=false pending=false
  78979 tv    music:plan   from=lobby to=game:bingo
  78979 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  78979 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  78985 tv    hush
  78985 tv    hush
  79596 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  79789 tv    music:stop   track=bossa-antigua.mp3
  86643 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  86643 tv    clip         src=b14.wav muted=false ready=true
  86643 tv    speak        text=b14.wav voice=clip
  88012 tv    hush
  88013 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  88013 tv    hush
  95628 tv    music:duck   ms=9000
  95628 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 100621 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 100630 tv    hush
 100630 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 100631 tv    hush
 104626 tv    ss:cancel    speaking=false pending=false
 104626 tv    music:plan   from=game:bingo to=null
 104627 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 106129 tv    music:stop   track=cool-vibes.mp3
 106226 tv    ss:cancel    speaking=false pending=false
 106226 tv    music:plan   from=null to=lobby
 106226 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 108737 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 108755 tv    ss:cancel    speaking=false pending=false
 108765 tv    music:plan   from=lobby to=game:bingo
 108765 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 108765 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 108771 tv    hush
 108772 tv    hush
 109571 tv    music:stop   track=airport-lounge.mp3
 110931 tv    ss:cancel    speaking=false pending=false
 110931 tv    music:plan   from=game:bingo to=null
 110931 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 112432 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.4}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 113043 tv    ss:cancel    speaking=false pending=false
 113043 tv    music:plan   from=null to=lobby
 113043 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 116376 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 116392 tv    ss:cancel    speaking=false pending=false
 116395 tv    music:plan   from=lobby to=game:bingo
 116395 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116395 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116402 tv    hush
 116402 tv    hush
 116824 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 117015 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 117015 tv    clip         src=i21.wav muted=false ready=true
 117015 tv    speak        text=i21.wav voice=clip
 117204 tv    music:stop   track=local-forecast-elevator.mp3
 117327 tv    ss:cancel    speaking=false pending=false
 117327 tv    music:plan   from=game:bingo to=null
 117333 tv    ss:cancel    speaking=false pending=false
 117333 tv    music:plan   from=null to=lobby
 117333 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 118134 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":10.2}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 122915 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 123347 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 123765 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 124197 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 124612 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 125762 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 126366 tv    ss:cancel    speaking=false pending=false
 126374 tv    music:plan   from=lobby to=null
 126374 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 127634 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 127875 tv    music:stop   track=george-street-shuffle.mp3
 129250 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 130566 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 131903 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 132938 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 133985 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 136564 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 136759 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 136937 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 137137 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 138227 tv    ss:cancel    speaking=false pending=false
 138231 tv    ss:cancel    speaking=false pending=false
 138231 tv    music:plan   from=null to=lobby
 138232 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 140290 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 140301 tv    ss:cancel    speaking=false pending=false
 140305 tv    music:plan   from=lobby to=null
 140305 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 141814 tv    music:stop   track=local-forecast-elevator.mp3
 141859 tv    music:plan   from=null to=game:broken-pencil
 141859 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 141859 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143346 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143818 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143960 tv    music:plan   from=game:broken-pencil to=null
 143960 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 145463 tv    music:stop   track=hep-cats.mp3
```
