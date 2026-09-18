# Audio interaction trace

Captured 2026-09-18T12:13:51.261Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**54 / 54 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:george-street-shuffle
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":4.4}]

```
   1751 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   1777 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3089 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3226 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3925 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4559 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
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
   7775 tv    music:stop   track=george-street-shuffle.mp3
   8222 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9512 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16482 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17473 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18474 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19475 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20475 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21273 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22067 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22222 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22379 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22537 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22691 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22850 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23010 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23162 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23319 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23476 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23631 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23787 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23944 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24105 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24243 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24400 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24560 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24716 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24867 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25747 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26074 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27882 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29612 tv    ss:cancel    speaking=false pending=false
  29612 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31168 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33325 tv    ss:cancel    speaking=false pending=false
  33326 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34887 tv    ss:cancel    speaking=false pending=false
  34887 tv    music:plan   from=null to=lobby
  34887 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+958ms phone@+970ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,lock cheer@+5361ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5397ms cheer@+5374ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=3 lastTickIdx=2
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36458 tv    music:plan   from=lobby to=game:bingo
  36458 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36458 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36765 tv    hush
  36765 tv    hush
  37264 tv    music:stop   track=bossa-antigua.mp3
  37377 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38516 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39517 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40517 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41475 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41666 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41666 tv    clip         src=b9.wav muted=false ready=true
  41666 tv    speak        text=b9.wav voice=clip
  43306 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43306 tv    clip         src=b8.wav muted=false ready=true
  43306 tv    speak        text=b8.wav voice=clip
  45124 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45124 tv    clip         src=n34.wav muted=false ready=true
  45124 tv    speak        text=n34.wav voice=clip
  46771 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47041 tv    hush
  47041 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47041 tv    hush
  52395 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55413 tv    hush
  55414 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  55414 tv    hush
  56414 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57414 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58611 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58611 tv    clip         src=n35.wav muted=false ready=true
  58611 tv    speak        text=n35.wav voice=clip
  60214 tv    music:paused paused=true
  60214 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61471 tv    music:paused paused=false
  61472 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  67916 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  67916 tv    clip         src=g57.wav muted=false ready=true
  67916 tv    speak        text=g57.wav voice=clip
  68347 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68638 tv    hush
  68638 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68639 tv    hush
  70512 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73999 tv    music:duck   ms=9000
  73999 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  74031 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  78776 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79105 tv    hush
  79106 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  79106 tv    hush
  80108 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81107 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82307 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  82307 tv    clip         src=g57.wav muted=false ready=true
  82307 tv    speak        text=g57.wav voice=clip
  84415 tv    ss:cancel    speaking=false pending=false
  84415 tv    music:plan   from=game:bingo to=null
  84418 tv    ss:cancel    speaking=false pending=false
  84418 tv    music:plan   from=null to=lobby
  84418 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  85220 tv    music:stop   track=wallpaper.mp3
  86944 tv    ss:cancel    speaking=false pending=false
  86954 tv    music:plan   from=lobby to=game:bingo
  86954 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86954 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86957 tv    hush
  86958 tv    hush
  87569 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  87754 tv    music:stop   track=local-forecast-elevator.mp3
  94431 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  94431 tv    clip         src=b14.wav muted=false ready=true
  94431 tv    speak        text=b14.wav voice=clip
  95493 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95766 tv    hush
  95766 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95766 tv    hush
 103371 tv    music:duck   ms=9000
 103371 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 103386 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 108381 tv    hush
 108382 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108382 tv    hush
 112383 tv    ss:cancel    speaking=false pending=false
 112383 tv    music:plan   from=game:bingo to=null
 112383 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113883 tv    music:stop   track=wallpaper.mp3
 113965 tv    ss:cancel    speaking=false pending=false
 113965 tv    music:plan   from=null to=lobby
 113965 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 116490 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 116497 tv    ss:cancel    speaking=false pending=false
 116502 tv    music:plan   from=lobby to=game:bingo
 116502 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116502 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116506 tv    hush
 116506 tv    hush
 117118 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117304 tv    music:stop   track=bossa-antigua.mp3
 118509 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 118617 tv    ss:cancel    speaking=false pending=false
 118617 tv    music:plan   from=game:bingo to=null
 118617 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 120119 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 120713 tv    ss:cancel    speaking=false pending=false
 120713 tv    music:plan   from=null to=lobby
 120713 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 124058 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 124067 tv    ss:cancel    speaking=false pending=false
 124069 tv    music:plan   from=lobby to=game:bingo
 124069 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 124069 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 124073 tv    hush
 124074 tv    hush
 124493 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 124684 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124684 tv    clip         src=i21.wav muted=false ready=true
 124684 tv    speak        text=i21.wav voice=clip
 124870 tv    music:stop   track=airport-lounge.mp3
 124997 tv    ss:cancel    speaking=false pending=false
 124997 tv    music:plan   from=game:bingo to=null
 125000 tv    ss:cancel    speaking=false pending=false
 125000 tv    music:plan   from=null to=lobby
 125000 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 125800 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 130566 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131002 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131434 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131868 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132281 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 133332 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 133923 tv    ss:cancel    speaking=false pending=false
 133928 tv    music:plan   from=lobby to=null
 133928 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 135178 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135430 tv    music:stop   track=local-forecast-elevator.mp3
 136788 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 138084 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 139389 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140399 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141465 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144028 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144213 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144403 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144596 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 145696 tv    ss:cancel    speaking=false pending=false
 145698 tv    ss:cancel    speaking=false pending=false
 145698 tv    music:plan   from=null to=lobby
 145698 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 147723 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 147736 tv    ss:cancel    speaking=false pending=false
 147738 tv    music:plan   from=lobby to=null
 147738 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149238 tv    music:stop   track=airport-lounge.mp3
 149295 tv    music:plan   from=null to=game:broken-pencil
 149295 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 149295 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150768 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151244 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151386 tv    music:plan   from=game:broken-pencil to=null
 151386 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 152887 tv    music:stop   track=hep-cats.mp3
```
