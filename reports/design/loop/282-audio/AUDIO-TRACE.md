# Audio interaction trace

Captured 2026-09-18T12:00:42.547Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**54 / 54 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:george-street-shuffle
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":4.4}]

```
   1749 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   1773 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3087 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3206 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3908 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4540 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
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
   6263 tv    music:plan   from=lobby to=null
   6263 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7763 tv    music:stop   track=george-street-shuffle.mp3
   8206 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9492 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16462 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17462 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18457 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19462 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20461 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21258 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22041 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22197 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22354 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22510 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22667 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22820 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22977 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23132 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23290 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23449 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23606 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23765 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23917 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24073 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24216 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24375 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24530 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24692 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24846 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25725 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26050 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27858 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29595 tv    ss:cancel    speaking=false pending=false
  29596 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31151 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33305 tv    ss:cancel    speaking=false pending=false
  33305 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34835 tv    ss:cancel    speaking=false pending=false
  34835 tv    music:plan   from=null to=lobby
  34835 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+955ms phone@+960ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":19}]
- ✅ **play resumes → the next number is spoken** — spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":22.5}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,lock cheer@+5354ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":37}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5403ms cheer@+5366ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=3 lastTickIdx=2
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36392 tv    music:plan   from=lobby to=game:bingo
  36392 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36392 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36695 tv    hush
  36695 tv    hush
  37192 tv    music:stop   track=bossa-antigua.mp3
  37305 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38447 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39447 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40450 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41397 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41588 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41588 tv    clip         src=b9.wav muted=false ready=true
  41588 tv    speak        text=b9.wav voice=clip
  43217 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43217 tv    clip         src=b8.wav muted=false ready=true
  43217 tv    speak        text=b8.wav voice=clip
  45048 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45048 tv    clip         src=n34.wav muted=false ready=true
  45048 tv    speak        text=n34.wav voice=clip
  46721 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  46983 tv    hush
  46983 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  46983 tv    hush
  52337 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55524 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  55715 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55715 tv    clip         src=n35.wav muted=false ready=true
  55715 tv    speak        text=n35.wav voice=clip
  57727 tv    music:paused paused=true
  57727 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  58969 tv    music:paused paused=false
  58970 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  65392 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  65392 tv    clip         src=g57.wav muted=false ready=true
  65392 tv    speak        text=g57.wav voice=clip
  65825 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  66117 tv    hush
  66117 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  66117 tv    hush
  67992 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  71471 tv    music:duck   ms=9000
  71471 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  71519 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  76293 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  76625 tv    hush
  76625 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  76626 tv    hush
  77626 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  78626 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  79816 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  79816 tv    clip         src=g57.wav muted=false ready=true
  79816 tv    speak        text=g57.wav voice=clip
  81930 tv    ss:cancel    speaking=false pending=false
  81930 tv    music:plan   from=game:bingo to=null
  81934 tv    ss:cancel    speaking=false pending=false
  81934 tv    music:plan   from=null to=lobby
  81934 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  82734 tv    music:stop   track=wallpaper.mp3
  84454 tv    ss:cancel    speaking=false pending=false
  84463 tv    music:plan   from=lobby to=game:bingo
  84463 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  84463 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  84467 tv    hush
  84468 tv    hush
  85077 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  85264 tv    music:stop   track=george-street-shuffle.mp3
  91391 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  91391 tv    clip         src=g59.wav muted=false ready=true
  91391 tv    speak        text=g59.wav voice=clip
  92441 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  92713 tv    hush
  92713 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  92713 tv    hush
 100324 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 100324 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 100333 tv    music:duck   ms=9000
 100333 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 105331 tv    hush
 105331 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 105332 tv    hush
 109325 tv    ss:cancel    speaking=false pending=false
 109325 tv    music:plan   from=game:bingo to=null
 109325 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 110827 tv    music:stop   track=wallpaper.mp3
 110913 tv    ss:cancel    speaking=false pending=false
 110913 tv    music:plan   from=null to=lobby
 110913 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 113438 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 113447 tv    ss:cancel    speaking=false pending=false
 113455 tv    music:plan   from=lobby to=game:bingo
 113455 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 113455 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 113458 tv    hush
 113459 tv    hush
 114070 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 114257 tv    music:stop   track=airport-lounge.mp3
 115461 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 115565 tv    ss:cancel    speaking=false pending=false
 115565 tv    music:plan   from=game:bingo to=null
 115565 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 117066 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 117662 tv    ss:cancel    speaking=false pending=false
 117662 tv    music:plan   from=null to=lobby
 117662 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 121014 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 121025 tv    ss:cancel    speaking=false pending=false
 121026 tv    music:plan   from=lobby to=game:bingo
 121026 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 121026 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 121030 tv    hush
 121030 tv    hush
 121453 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 121643 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 121644 tv    clip         src=i21.wav muted=false ready=true
 121644 tv    speak        text=i21.wav voice=clip
 121827 tv    music:stop   track=bossa-antigua.mp3
 121946 tv    ss:cancel    speaking=false pending=false
 121946 tv    music:plan   from=game:bingo to=null
 121949 tv    ss:cancel    speaking=false pending=false
 121949 tv    music:plan   from=null to=lobby
 121949 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 122750 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"airport-lounge.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 127516 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 127937 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 128366 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 128799 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 129215 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 130279 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 130877 tv    ss:cancel    speaking=false pending=false
 130883 tv    music:plan   from=lobby to=null
 130883 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 132122 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 132384 tv    music:stop   track=airport-lounge.mp3
 133699 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 134986 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 136294 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 137306 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 138369 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140915 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141110 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 141290 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141479 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 142578 tv    ss:cancel    speaking=false pending=false
 142580 tv    ss:cancel    speaking=false pending=false
 142580 tv    music:plan   from=null to=lobby
 142580 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 144593 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 144603 tv    ss:cancel    speaking=false pending=false
 144605 tv    music:plan   from=lobby to=null
 144605 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 146107 tv    music:stop   track=local-forecast-elevator.mp3
 146158 tv    music:plan   from=null to=game:broken-pencil
 146159 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 146159 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 147641 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 148113 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 148250 tv    music:plan   from=game:broken-pencil to=null
 148250 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 149750 tv    music:stop   track=backbay-lounge.mp3
```
