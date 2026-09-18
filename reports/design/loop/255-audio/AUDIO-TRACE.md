# Audio interaction trace

Captured 2026-09-18T06:32:29.844Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**49 / 49 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:george-street-shuffle
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":4.4}]

```
   1761 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   1786 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3098 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3271 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3980 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4613 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5460 tv    ss:cancel    speaking=false pending=false
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
   6304 tv    music:plan   from=lobby to=null
   6304 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7807 tv    music:stop   track=george-street-shuffle.mp3
   8256 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9543 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16507 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17507 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18507 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19507 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20509 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21311 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22109 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22260 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22415 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22557 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22716 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22855 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23004 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23168 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23323 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23486 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23619 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23789 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23922 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24077 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24226 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24365 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24519 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24672 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24838 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25714 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26057 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27868 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29587 tv    ss:cancel    speaking=false pending=false
  29587 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31149 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33296 tv    ss:cancel    speaking=false pending=false
  33296 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34868 tv    ss:cancel    speaking=false pending=false
  34868 tv    music:plan   from=null to=lobby
  34868 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
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
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer cheer@+5365ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":33}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,daub,claim,correct
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=lock,silence,phase,call spoken=g46.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=lock,tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36460 tv    music:plan   from=lobby to=game:bingo
  36460 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36461 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36767 tv    hush
  36768 tv    hush
  37269 tv    music:stop   track=airport-lounge.mp3
  39532 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  39722 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39723 tv    clip         src=b9.wav muted=false ready=true
  39723 tv    speak        text=b9.wav voice=clip
  41535 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41535 tv    clip         src=b8.wav muted=false ready=true
  41535 tv    speak        text=b8.wav voice=clip
  43230 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  43497 tv    hush
  43497 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  43498 tv    hush
  48859 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  52066 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  52268 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52268 tv    clip         src=n34.wav muted=false ready=true
  52268 tv    speak        text=n34.wav voice=clip
  54276 tv    music:paused paused=true
  54276 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  55548 tv    music:paused paused=false
  55548 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  61589 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61589 tv    clip         src=g46.wav muted=false ready=true
  61589 tv    speak        text=g46.wav voice=clip
  62036 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  62347 tv    hush
  62348 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  62348 tv    hush
  64238 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  67712 tv    music:duck   ms=9000
  67712 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  72476 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  72487 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  72823 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  73028 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  73028 tv    clip         src=g46.wav muted=false ready=true
  73028 tv    speak        text=g46.wav voice=clip
  76444 tv    ss:cancel    speaking=false pending=false
  76444 tv    music:plan   from=game:bingo to=null
  76450 tv    ss:cancel    speaking=false pending=false
  76450 tv    music:plan   from=null to=lobby
  76450 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  77261 tv    music:stop   track=wallpaper.mp3
  78999 tv    ss:cancel    speaking=false pending=false
  79015 tv    music:plan   from=lobby to=game:bingo
  79015 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  79015 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  79022 tv    hush
  79022 tv    hush
  79627 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  79823 tv    music:stop   track=airport-lounge.mp3
  86689 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  86689 tv    clip         src=b14.wav muted=false ready=true
  86689 tv    speak        text=b14.wav voice=clip
  87836 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  88111 tv    hush
  88111 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  88112 tv    hush
  95720 tv    music:duck   ms=9000
  95720 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 100729 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 100737 tv    hush
 100738 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 100740 tv    hush
 104742 tv    ss:cancel    speaking=false pending=false
 104742 tv    music:plan   from=game:bingo to=null
 104742 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 106245 tv    music:stop   track=wallpaper.mp3
 106326 tv    ss:cancel    speaking=false pending=false
 106326 tv    music:plan   from=null to=lobby
 106326 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 108853 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 108870 tv    ss:cancel    speaking=false pending=false
 108879 tv    music:plan   from=lobby to=game:bingo
 108879 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 108880 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 108887 tv    hush
 108887 tv    hush
 109682 tv    music:stop   track=local-forecast-elevator.mp3
 111054 tv    ss:cancel    speaking=false pending=false
 111054 tv    music:plan   from=game:bingo to=null
 111054 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 112561 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 113160 tv    ss:cancel    speaking=false pending=false
 113164 tv    music:plan   from=null to=lobby
 113164 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 116545 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 116561 tv    ss:cancel    speaking=false pending=false
 116564 tv    music:plan   from=lobby to=game:bingo
 116564 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116564 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116574 tv    hush
 116574 tv    hush
 116981 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 117183 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 117183 tv    clip         src=i21.wav muted=false ready=true
 117183 tv    speak        text=i21.wav voice=clip
 117370 tv    music:stop   track=local-forecast-elevator.mp3
 117478 tv    ss:cancel    speaking=false pending=false
 117478 tv    music:plan   from=game:bingo to=null
 117484 tv    ss:cancel    speaking=false pending=false
 117484 tv    music:plan   from=null to=lobby
 117484 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 118291 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":10.2}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 123064 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 123486 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 123932 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 124351 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 124777 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 125941 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 126552 tv    ss:cancel    speaking=false pending=false
 126560 tv    music:plan   from=lobby to=null
 126560 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 127798 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 128070 tv    music:stop   track=george-street-shuffle.mp3
 129423 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 130729 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 132070 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 133135 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 134182 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 136731 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 136920 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 137107 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 137304 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 138425 tv    ss:cancel    speaking=false pending=false
 138430 tv    ss:cancel    speaking=false pending=false
 138430 tv    music:plan   from=null to=lobby
 138430 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 140481 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 140492 tv    ss:cancel    speaking=false pending=false
 140495 tv    music:plan   from=lobby to=null
 140495 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 142000 tv    music:stop   track=local-forecast-elevator.mp3
 142068 tv    music:plan   from=null to=game:broken-pencil
 142068 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 142068 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143537 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144009 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144168 tv    music:plan   from=game:broken-pencil to=null
 144168 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 145680 tv    music:stop   track=hep-cats.mp3
```
