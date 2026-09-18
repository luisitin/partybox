# Audio interaction trace

Captured 2026-09-18T10:42:38.474Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**52 / 52 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.4}]

```
   1764 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1790 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3084 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3220 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3925 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4553 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5421 tv    ss:cancel    speaking=false pending=false
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
   7776 tv    music:stop   track=airport-lounge.mp3
   8214 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9504 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16476 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17464 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18466 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19469 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20469 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21281 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22074 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22226 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22382 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22524 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22679 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22837 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22993 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23154 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23307 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23465 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23623 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23760 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23917 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24074 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24230 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24391 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24542 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24698 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24856 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25727 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26058 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27860 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29596 tv    ss:cancel    speaking=false pending=false
  29596 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":1.5}]

```
  31147 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33319 tv    ss:cancel    speaking=false pending=false
  33319 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34866 tv    ss:cancel    speaking=false pending=false
  34866 tv    music:plan   from=null to=lobby
  34866 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:george-street-shuffle.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":3}]
- ✅ **intro: nothing spoken**
- ✅ **the intro counts down: three ticks (3 · 2 · 1), then the first call** — cues=tick,tick,tick,phase,call
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":19.1}]
- ✅ **play resumes → the next number is spoken** — spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":22.5}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,lock cheer@+5354ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":37}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5396ms cheer@+5365ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=silence,phase,call spoken=g57.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36433 tv    music:plan   from=lobby to=game:bingo
  36433 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36433 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36739 tv    hush
  36739 tv    hush
  37233 tv    music:stop   track=george-street-shuffle.mp3
  38491 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39491 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40490 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41445 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41638 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41638 tv    clip         src=b9.wav muted=false ready=true
  41638 tv    speak        text=b9.wav voice=clip
  43268 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43268 tv    clip         src=b8.wav muted=false ready=true
  43268 tv    speak        text=b8.wav voice=clip
  45098 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45098 tv    clip         src=n34.wav muted=false ready=true
  45098 tv    speak        text=n34.wav voice=clip
  46768 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47046 tv    hush
  47046 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47047 tv    hush
  52398 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55595 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  55786 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55787 tv    clip         src=n35.wav muted=false ready=true
  55787 tv    speak        text=n35.wav voice=clip
  57808 tv    music:paused paused=true
  57808 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  59087 tv    music:paused paused=false
  59087 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  65532 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  65532 tv    clip         src=g57.wav muted=false ready=true
  65532 tv    speak        text=g57.wav voice=clip
  65950 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  66240 tv    hush
  66240 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  66240 tv    hush
  68114 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  71594 tv    music:duck   ms=9000
  71594 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  71633 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  76372 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  76688 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  76880 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  76880 tv    clip         src=g57.wav muted=false ready=true
  76880 tv    speak        text=g57.wav voice=clip
  80277 tv    ss:cancel    speaking=false pending=false
  80277 tv    music:plan   from=game:bingo to=null
  80280 tv    ss:cancel    speaking=false pending=false
  80280 tv    music:plan   from=null to=lobby
  80280 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  81080 tv    music:stop   track=wallpaper.mp3
  82798 tv    ss:cancel    speaking=false pending=false
  82807 tv    music:plan   from=lobby to=game:bingo
  82807 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  82807 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  82810 tv    hush
  82811 tv    hush
  83424 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  83608 tv    music:stop   track=bossa-antigua.mp3
  90444 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  90444 tv    clip         src=b14.wav muted=false ready=true
  90444 tv    speak        text=b14.wav voice=clip
  91482 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  91743 tv    hush
  91744 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  91744 tv    hush
  99348 tv    music:duck   ms=9000
  99348 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  99360 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 104358 tv    hush
 104359 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 104359 tv    hush
 108369 tv    ss:cancel    speaking=false pending=false
 108369 tv    music:plan   from=game:bingo to=null
 108369 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 109870 tv    music:stop   track=wallpaper.mp3
 109959 tv    ss:cancel    speaking=false pending=false
 109959 tv    music:plan   from=null to=lobby
 109959 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 112486 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 112495 tv    ss:cancel    speaking=false pending=false
 112497 tv    music:plan   from=lobby to=game:bingo
 112497 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 112497 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 112501 tv    hush
 112501 tv    hush
 113299 tv    music:stop   track=bossa-antigua.mp3
 114503 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 114645 tv    ss:cancel    speaking=false pending=false
 114645 tv    music:plan   from=game:bingo to=null
 114645 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 116146 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 116742 tv    ss:cancel    speaking=false pending=false
 116742 tv    music:plan   from=null to=lobby
 116742 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 120092 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 120101 tv    ss:cancel    speaking=false pending=false
 120103 tv    music:plan   from=lobby to=game:bingo
 120103 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 120103 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 120107 tv    hush
 120107 tv    hush
 120516 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 120707 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 120707 tv    clip         src=i21.wav muted=false ready=true
 120707 tv    speak        text=i21.wav voice=clip
 120903 tv    music:stop   track=airport-lounge.mp3
 121009 tv    ss:cancel    speaking=false pending=false
 121009 tv    music:plan   from=game:bingo to=null
 121012 tv    ss:cancel    speaking=false pending=false
 121012 tv    music:plan   from=null to=lobby
 121012 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 121814 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 126580 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 127012 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 127451 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 127877 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 128311 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 129360 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 129959 tv    ss:cancel    speaking=false pending=false
 129966 tv    music:plan   from=lobby to=null
 129966 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 131198 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 131466 tv    music:stop   track=george-street-shuffle.mp3
 132780 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 134064 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 135367 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 136390 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 137443 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 139996 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 140188 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140369 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 140557 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 141658 tv    ss:cancel    speaking=false pending=false
 141661 tv    ss:cancel    speaking=false pending=false
 141661 tv    music:plan   from=null to=lobby
 141661 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 143674 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 143684 tv    ss:cancel    speaking=false pending=false
 143685 tv    music:plan   from=lobby to=null
 143685 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 145187 tv    music:stop   track=bossa-antigua.mp3
 145228 tv    music:plan   from=null to=game:broken-pencil
 145228 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 145228 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 146705 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 147161 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 147317 tv    music:plan   from=game:broken-pencil to=null
 147318 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 148818 tv    music:stop   track=hep-cats.mp3
```
