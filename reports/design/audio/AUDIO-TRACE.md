# Audio interaction trace

Captured 2026-09-19T02:12:15.318Z on port 42112. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**67 / 67 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.3}]

```
   1780 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1814 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3118 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3255 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3958 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4587 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5420 tv    ss:cancel    speaking=false pending=false
```

## B · Lightning Round: start, phases, lock-in, last five seconds, final reveal, results

- ✅ **game start → start cue, lobby music fades to none (Lightning plays beds, not tracks)** — cues=start; plan=lobby→null
- ✅ **no track audible during Lightning; the intro bed is the marimba** — playing=[] bed=marimba
- ✅ **question phase → the generic phase chime (unmapped)** — cues=phase
- ✅ **question → the pulse bed** — bed=pulse
- ✅ **lock-in → TV lock tick; phone submit cue + 20 ms buzz** — tv=lock; phone=submit buzz=15 20
- ✅ **the phone never plays TV cues (phase/start/win/lock/countdown)** — phone cues=submit
- ✅ **last 5 s → five countdown ticks on the TV, climbing** — ticks=5 semitones=0,2,4,5,7
- ✅ **an unanswered phone buzzes each second, ticks once at 5 s, buzzes at time-up** — buzz=6 phone cues=tick
- ✅ **the deadline fired → reveal phase, reveal cue, and NO phase chime on top** — phase=reveal cues=countdown,countdown,countdown,countdown,countdown,reveal
- ✅ **the reveal keeps the pulse bed (no crossfade on the cut)** — bed=pulse
- ✅ **wager phase → wager cue (mapped), no phase chime for it** — cues=phase,reveal,phase,reveal,phase,reveal,phase,reveal,phase,reveal,phase,reveal,phase,reveal,phase,reveal,phase,reveal,wager
- ✅ **wager → the late-night bed** — bed=latenight
- ✅ **final reveal → jackpot or bust cue from the game, no reveal sting on top** — cues=phase,silence,bust
- ✅ **results → one cheer (horn + crowd), no synth win, no music, no bed** — cues=cheer; playing=[] bed=null
- ✅ **results on the phones → a buzz only (no cue)** — phone cues=none buzz=[60,60,60,60,160]

```
   6261 tv    music:plan   from=lobby to=null
   6261 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7765 tv    music:stop   track=airport-lounge.mp3
   8213 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9492 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16467 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17467 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18469 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19466 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20476 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21267 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22048 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22203 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22359 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22513 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22671 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22825 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22982 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23140 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23295 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23450 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23608 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23764 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23922 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24077 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24233 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24386 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24543 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24700 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24858 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25741 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26070 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27874 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29601 tv    ss:cancel    speaking=false pending=false
  29601 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31165 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33316 tv    ss:cancel    speaking=false pending=false
  33316 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34865 tv    ss:cancel    speaking=false pending=false
  34865 tv    music:plan   from=null to=lobby
  34865 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime** — cues=start,card,lock,lock,tick,tick,tick,call
- ✅ **the hand feels each card land (one 12 ms tap per card) and then the first call** — taps(12)=2 (1 card + the first call)
- ✅ **each Ready ticks (lock, rising); the 3 · 2 · 1's first tick comes a breath (≥ 300 ms) after the last** — locks=2 last lock→first tick=400ms
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+995ms phone@+1012ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "another" is a 20 ms tap and one card pluck; Ready a 20 ms tap and the submit cue** — taps=3 cues=card,submit
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **each voice starts on the push (no delay); its boing lands on the squash, 170–230 ms later** — delays=0,0 boing lags=196,198ms
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,silence,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,silence,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18.9}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":25.8}]
- ✅ **skipping through the deck: a hush before every call, one voice at a time** — clips=41 hushes=41
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5361ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":40.2}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the winner's celebration buzz (320 ms) runs whole — nothing shorter cuts it** — celebration@74283 cut by=[]
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5402ms cheer@+5371ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36417 tv    music:plan   from=lobby to=game:bingo
  36417 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36417 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36724 tv    hush
  36725 tv    hush
  37220 tv    music:stop   track=bossa-antigua.mp3
  37375 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  39483 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  39976 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
  40376 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41376 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  42375 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  43381 tv    hush
  43381 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  43381 tv    speak        text=b9.wav voice=clip delayMs=0
  43382 tv    hush
  43575 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43944 tv    hush
  43944 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  43944 tv    speak        text=b8.wav voice=clip delayMs=0
  44140 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45770 tv    hush
  45770 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  45770 tv    speak        text=n34.wav voice=clip delayMs=0
  45968 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  47651 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47915 tv    hush
  47915 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47916 tv    hush
  53274 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  53280 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  56270 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57274 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58275 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  59282 tv    hush
  59282 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  59282 tv    speak        text=n35.wav voice=clip delayMs=0
  59475 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61051 tv    music:paused paused=true
  61051 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  62300 tv    music:paused paused=false
  62300 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  63558 tv    hush
  63558 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  63558 tv    speak        text=i25.wav voice=clip delayMs=0
  63679 tv    hush
  63679 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  63679 tv    speak        text=n45.wav voice=clip delayMs=0
  63804 tv    hush
  63804 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  63804 tv    speak        text=n33.wav voice=clip delayMs=0
  63930 tv    hush
  63930 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  63930 tv    speak        text=g49.wav voice=clip delayMs=0
  64039 tv    hush
  64039 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  64039 tv    speak        text=b4.wav voice=clip delayMs=0
  64161 tv    hush
  64161 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  64161 tv    speak        text=i20.wav voice=clip delayMs=0
  64286 tv    hush
  64286 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  64286 tv    speak        text=o69.wav voice=clip delayMs=0
  64398 tv    hush
  64398 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  64398 tv    speak        text=o67.wav voice=clip delayMs=0
  64522 tv    hush
  64522 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  64522 tv    speak        text=o65.wav voice=clip delayMs=0
  64636 tv    hush
  64636 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  64636 tv    speak        text=o73.wav voice=clip delayMs=0
  64756 tv    hush
  64756 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  64756 tv    speak        text=i21.wav voice=clip delayMs=0
  64881 tv    hush
  64881 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  64881 tv    speak        text=i18.wav voice=clip delayMs=0
  65005 tv    hush
  65005 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  65005 tv    speak        text=g58.wav voice=clip delayMs=0
  65131 tv    hush
  65131 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  65131 tv    speak        text=n36.wav voice=clip delayMs=0
  65256 tv    hush
  65256 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  65256 tv    speak        text=o61.wav voice=clip delayMs=0
  65381 tv    hush
  65381 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  65381 tv    speak        text=n37.wav voice=clip delayMs=0
  65506 tv    hush
  65506 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  65506 tv    speak        text=i16.wav voice=clip delayMs=0
  65631 tv    hush
  65631 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  65631 tv    speak        text=g47.wav voice=clip delayMs=0
  65756 tv    hush
  65756 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  65756 tv    speak        text=n41.wav voice=clip delayMs=0
  65881 tv    hush
  65881 tv    clip         src=b6.wav muted=false ready=true delayMs=0
  65881 tv    speak        text=b6.wav voice=clip delayMs=0
  66005 tv    hush
  66005 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  66005 tv    speak        text=o72.wav voice=clip delayMs=0
  66132 tv    hush
  66132 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  66132 tv    speak        text=b3.wav voice=clip delayMs=0
  66256 tv    hush
  66256 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  66256 tv    speak        text=i30.wav voice=clip delayMs=0
  66382 tv    hush
  66383 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  66383 tv    speak        text=g56.wav voice=clip delayMs=0
  66490 tv    hush
  66490 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  66490 tv    speak        text=o75.wav voice=clip delayMs=0
  66614 tv    hush
  66614 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  66614 tv    speak        text=b1.wav voice=clip delayMs=0
  66738 tv    hush
  66738 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  66738 tv    speak        text=b2.wav voice=clip delayMs=0
  66862 tv    hush
  66862 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  66862 tv    speak        text=n32.wav voice=clip delayMs=0
  66989 tv    hush
  66989 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  66989 tv    speak        text=g48.wav voice=clip delayMs=0
  67114 tv    hush
  67114 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  67114 tv    speak        text=i23.wav voice=clip delayMs=0
  67223 tv    hush
  67223 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  67223 tv    speak        text=i26.wav voice=clip delayMs=0
  67347 tv    hush
  67347 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  67347 tv    speak        text=o66.wav voice=clip delayMs=0
  67471 tv    hush
  67471 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  67471 tv    speak        text=i19.wav voice=clip delayMs=0
  67596 tv    hush
  67596 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  67596 tv    speak        text=n42.wav voice=clip delayMs=0
  67721 tv    hush
  67721 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  67721 tv    speak        text=i24.wav voice=clip delayMs=0
  67847 tv    hush
  67847 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  67847 tv    speak        text=n39.wav voice=clip delayMs=0
  67972 tv    hush
  67972 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  67972 tv    speak        text=g46.wav voice=clip delayMs=0
  68098 tv    hush
  68098 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  68098 tv    speak        text=n44.wav voice=clip delayMs=0
  68225 tv    hush
  68225 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  68225 tv    speak        text=b15.wav voice=clip delayMs=0
  68348 tv    hush
  68348 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  68348 tv    speak        text=b11.wav voice=clip delayMs=0
  68474 tv    hush
  68474 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  68474 tv    speak        text=g57.wav voice=clip delayMs=0
  68665 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  69098 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  69372 tv    hush
  69372 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  69372 tv    hush
  71247 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  74733 tv    music:duck   ms=9000
  74733 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  79538 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79857 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80858 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81858 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82854 tv    hush
  82854 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  82854 tv    speak        text=g57.wav voice=clip delayMs=0
  83045 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  85177 tv    ss:cancel    speaking=false pending=false
  85177 tv    music:plan   from=game:bingo to=null
  85181 tv    ss:cancel    speaking=false pending=false
  85181 tv    music:plan   from=null to=lobby
  85181 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  85981 tv    music:stop   track=wallpaper.mp3
  87700 tv    ss:cancel    speaking=false pending=false
  87709 tv    music:plan   from=lobby to=game:bingo
  87709 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  87710 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  87713 tv    hush
  87713 tv    hush
  88325 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  88328 tv    hush
  88328 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  88328 tv    speak        text=i21.wav voice=clip delayMs=0
  88328 tv    hush
  88335 tv    hush
  88335 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  88335 tv    speak        text=n32.wav voice=clip delayMs=0
  88441 tv    hush
  88441 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  88441 tv    speak        text=i18.wav voice=clip delayMs=0
  88510 tv    music:stop   track=airport-lounge.mp3
  88516 tv    hush
  88516 tv    clip         src=n40.wav muted=false ready=true delayMs=0
  88516 tv    speak        text=n40.wav voice=clip delayMs=0
  88609 tv    hush
  88609 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  88609 tv    speak        text=i30.wav voice=clip delayMs=0
  88705 tv    hush
  88705 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  88705 tv    speak        text=o69.wav voice=clip delayMs=0
  88798 tv    hush
  88798 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  88798 tv    speak        text=o61.wav voice=clip delayMs=0
  88891 tv    hush
  88891 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  88891 tv    speak        text=n34.wav voice=clip delayMs=0
  88985 tv    hush
  88985 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  88985 tv    speak        text=n35.wav voice=clip delayMs=0
  89081 tv    hush
  89081 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  89081 tv    speak        text=o67.wav voice=clip delayMs=0
  89174 tv    hush
  89174 tv    clip         src=g55.wav muted=false ready=true delayMs=0
  89174 tv    speak        text=g55.wav voice=clip delayMs=0
  89268 tv    hush
  89268 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  89268 tv    speak        text=i26.wav voice=clip delayMs=0
  89362 tv    hush
  89362 tv    clip         src=i22.wav muted=false ready=true delayMs=0
  89362 tv    speak        text=i22.wav voice=clip delayMs=0
  89457 tv    hush
  89457 tv    clip         src=i29.wav muted=false ready=true delayMs=0
  89457 tv    speak        text=i29.wav voice=clip delayMs=0
  89552 tv    hush
  89552 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  89552 tv    speak        text=o66.wav voice=clip delayMs=0
  89647 tv    hush
  89647 tv    clip         src=g51.wav muted=false ready=true delayMs=0
  89647 tv    speak        text=g51.wav voice=clip delayMs=0
  89741 tv    hush
  89741 tv    clip         src=g53.wav muted=false ready=true delayMs=0
  89741 tv    speak        text=g53.wav voice=clip delayMs=0
  89823 tv    hush
  89823 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  89823 tv    speak        text=b9.wav voice=clip delayMs=0
  89913 tv    hush
  89913 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  89913 tv    speak        text=n36.wav voice=clip delayMs=0
  90006 tv    hush
  90006 tv    clip         src=g52.wav muted=false ready=true delayMs=0
  90006 tv    speak        text=g52.wav voice=clip delayMs=0
  90102 tv    hush
  90102 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  90102 tv    speak        text=b1.wav voice=clip delayMs=0
  90196 tv    hush
  90196 tv    clip         src=b13.wav muted=false ready=true delayMs=0
  90196 tv    speak        text=b13.wav voice=clip delayMs=0
  90273 tv    hush
  90273 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  90273 tv    speak        text=n37.wav voice=clip delayMs=0
  90367 tv    hush
  90367 tv    clip         src=o71.wav muted=false ready=true delayMs=0
  90367 tv    speak        text=o71.wav voice=clip delayMs=0
  90460 tv    hush
  90460 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  90460 tv    speak        text=b8.wav voice=clip delayMs=0
  90555 tv    hush
  90555 tv    clip         src=b5.wav muted=false ready=true delayMs=0
  90555 tv    speak        text=b5.wav voice=clip delayMs=0
  90662 tv    hush
  90662 tv    clip         src=b7.wav muted=false ready=true delayMs=0
  90662 tv    speak        text=b7.wav voice=clip delayMs=0
  90745 tv    hush
  90745 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  90745 tv    speak        text=n42.wav voice=clip delayMs=0
  90834 tv    hush
  90834 tv    clip         src=i28.wav muted=false ready=true delayMs=0
  90834 tv    speak        text=i28.wav voice=clip delayMs=0
  90928 tv    hush
  90928 tv    clip         src=i27.wav muted=false ready=true delayMs=0
  90928 tv    speak        text=i27.wav voice=clip delayMs=0
  91023 tv    hush
  91023 tv    clip         src=o63.wav muted=false ready=true delayMs=0
  91023 tv    speak        text=o63.wav voice=clip delayMs=0
  91121 tv    hush
  91121 tv    clip         src=o64.wav muted=false ready=true delayMs=0
  91121 tv    speak        text=o64.wav voice=clip delayMs=0
  91211 tv    hush
  91211 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  91211 tv    speak        text=o73.wav voice=clip delayMs=0
  91317 tv    hush
  91318 tv    clip         src=g50.wav muted=false ready=true delayMs=0
  91318 tv    speak        text=g50.wav voice=clip delayMs=0
  91411 tv    hush
  91411 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  91411 tv    speak        text=g48.wav voice=clip delayMs=0
  91492 tv    hush
  91492 tv    clip         src=b12.wav muted=false ready=true delayMs=0
  91492 tv    speak        text=b12.wav voice=clip delayMs=0
  91586 tv    hush
  91586 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  91586 tv    speak        text=n45.wav voice=clip delayMs=0
  91678 tv    hush
  91678 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  91678 tv    speak        text=b4.wav voice=clip delayMs=0
  91756 tv    hush
  91756 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  91756 tv    speak        text=g46.wav voice=clip delayMs=0
  91850 tv    hush
  91850 tv    clip         src=o74.wav muted=false ready=true delayMs=0
  91850 tv    speak        text=o74.wav voice=clip delayMs=0
  91930 tv    hush
  91930 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  91930 tv    speak        text=g47.wav voice=clip delayMs=0
  92023 tv    hush
  92023 tv    clip         src=n31.wav muted=false ready=true delayMs=0
  92023 tv    speak        text=n31.wav voice=clip delayMs=0
  92116 tv    hush
  92116 tv    clip         src=o62.wav muted=false ready=true delayMs=0
  92116 tv    speak        text=o62.wav voice=clip delayMs=0
  92209 tv    hush
  92209 tv    clip         src=b10.wav muted=false ready=true delayMs=0
  92209 tv    speak        text=b10.wav voice=clip delayMs=0
  92305 tv    hush
  92305 tv    clip         src=g60.wav muted=false ready=true delayMs=0
  92305 tv    speak        text=g60.wav voice=clip delayMs=0
  92397 tv    hush
  92397 tv    clip         src=n38.wav muted=false ready=true delayMs=0
  92397 tv    speak        text=n38.wav voice=clip delayMs=0
  92504 tv    hush
  92504 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  92504 tv    speak        text=n39.wav voice=clip delayMs=0
  92598 tv    hush
  92598 tv    clip         src=o70.wav muted=false ready=true delayMs=0
  92598 tv    speak        text=o70.wav voice=clip delayMs=0
  92691 tv    hush
  92691 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  92691 tv    speak        text=b11.wav voice=clip delayMs=0
  92784 tv    hush
  92784 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  92784 tv    speak        text=o75.wav voice=clip delayMs=0
  92880 tv    hush
  92880 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  92880 tv    speak        text=g58.wav voice=clip delayMs=0
  92978 tv    hush
  92978 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  92978 tv    speak        text=b15.wav voice=clip delayMs=0
  93074 tv    hush
  93074 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  93074 tv    speak        text=i24.wav voice=clip delayMs=0
  93165 tv    hush
  93165 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  93165 tv    speak        text=o72.wav voice=clip delayMs=0
  93258 tv    hush
  93258 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  93258 tv    speak        text=g56.wav voice=clip delayMs=0
  93353 tv    hush
  93353 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  93353 tv    speak        text=i20.wav voice=clip delayMs=0
  93433 tv    hush
  93433 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  93433 tv    speak        text=n44.wav voice=clip delayMs=0
  93512 tv    hush
  93512 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  93512 tv    speak        text=b3.wav voice=clip delayMs=0
  93607 tv    hush
  93607 tv    clip         src=o68.wav muted=false ready=true delayMs=0
  93607 tv    speak        text=o68.wav voice=clip delayMs=0
  93700 tv    hush
  93700 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  93700 tv    speak        text=b2.wav voice=clip delayMs=0
  93793 tv    hush
  93793 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  93793 tv    speak        text=n41.wav voice=clip delayMs=0
  93901 tv    hush
  93901 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  93901 tv    speak        text=o65.wav voice=clip delayMs=0
  93995 tv    hush
  93995 tv    clip         src=i17.wav muted=false ready=true delayMs=0
  93995 tv    speak        text=i17.wav voice=clip delayMs=0
  94094 tv    hush
  94094 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  94094 tv    speak        text=i25.wav voice=clip delayMs=0
  94188 tv    hush
  94188 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  94188 tv    speak        text=i19.wav voice=clip delayMs=0
  94278 tv    hush
  94278 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  94278 tv    speak        text=g57.wav voice=clip delayMs=0
  94371 tv    hush
  94371 tv    clip         src=g59.wav muted=false ready=true delayMs=0
  94371 tv    speak        text=g59.wav voice=clip delayMs=0
  94479 tv    hush
  94479 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  94479 tv    speak        text=g49.wav voice=clip delayMs=0
  94577 tv    hush
  94577 tv    clip         src=n43.wav muted=false ready=true delayMs=0
  94577 tv    speak        text=n43.wav voice=clip delayMs=0
  94672 tv    hush
  94672 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  94672 tv    speak        text=i16.wav voice=clip delayMs=0
  94764 tv    hush
  94764 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  94764 tv    speak        text=n33.wav voice=clip delayMs=0
  94857 tv    hush
  94857 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  94857 tv    speak        text=i23.wav voice=clip delayMs=0
  94950 tv    hush
  94950 tv    clip         src=g54.wav muted=false ready=true delayMs=0
  94950 tv    speak        text=g54.wav voice=clip delayMs=0
  95045 tv    hush
  95045 tv    clip         src=b14.wav muted=false ready=true delayMs=0
  95045 tv    speak        text=b14.wav voice=clip delayMs=0
  95236 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  96263 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  96530 tv    hush
  96530 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  96531 tv    hush
 104154 tv    music:duck   ms=9000
 104154 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 109160 tv    hush
 109161 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 109161 tv    hush
 113155 tv    ss:cancel    speaking=false pending=false
 113155 tv    music:plan   from=game:bingo to=null
 113155 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 114655 tv    music:stop   track=wallpaper.mp3
 114761 tv    ss:cancel    speaking=false pending=false
 114761 tv    music:plan   from=null to=lobby
 114761 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 117285 tv    ss:cancel    speaking=false pending=false
 117301 tv    music:plan   from=lobby to=game:bingo
 117301 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 117302 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 117308 tv    hush
 117309 tv    hush
 117913 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 117917 tv    hush
 117917 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 117917 tv    speak        text=i21.wav voice=clip delayMs=0
 117918 tv    hush
 117926 tv    hush
 117926 tv    clip         src=n32.wav muted=false ready=true delayMs=0
 117926 tv    speak        text=n32.wav voice=clip delayMs=0
 118027 tv    hush
 118027 tv    clip         src=i18.wav muted=false ready=true delayMs=0
 118027 tv    speak        text=i18.wav voice=clip delayMs=0
 118108 tv    music:stop   track=local-forecast-elevator.mp3
 118117 tv    hush
 118117 tv    clip         src=n40.wav muted=false ready=true delayMs=0
 118117 tv    speak        text=n40.wav voice=clip delayMs=0
 118215 tv    hush
 118215 tv    clip         src=i30.wav muted=false ready=true delayMs=0
 118215 tv    speak        text=i30.wav voice=clip delayMs=0
 118309 tv    hush
 118309 tv    clip         src=o69.wav muted=false ready=true delayMs=0
 118309 tv    speak        text=o69.wav voice=clip delayMs=0
 118416 tv    hush
 118416 tv    clip         src=o61.wav muted=false ready=true delayMs=0
 118416 tv    speak        text=o61.wav voice=clip delayMs=0
 118501 tv    hush
 118501 tv    clip         src=n34.wav muted=false ready=true delayMs=0
 118501 tv    speak        text=n34.wav voice=clip delayMs=0
 118605 tv    hush
 118605 tv    clip         src=n35.wav muted=false ready=true delayMs=0
 118605 tv    speak        text=n35.wav voice=clip delayMs=0
 118697 tv    hush
 118697 tv    clip         src=o67.wav muted=false ready=true delayMs=0
 118697 tv    speak        text=o67.wav voice=clip delayMs=0
 118805 tv    hush
 118805 tv    clip         src=g55.wav muted=false ready=true delayMs=0
 118805 tv    speak        text=g55.wav voice=clip delayMs=0
 118900 tv    hush
 118900 tv    clip         src=i26.wav muted=false ready=true delayMs=0
 118900 tv    speak        text=i26.wav voice=clip delayMs=0
 119008 tv    hush
 119008 tv    clip         src=i22.wav muted=false ready=true delayMs=0
 119008 tv    speak        text=i22.wav voice=clip delayMs=0
 119101 tv    hush
 119101 tv    clip         src=i29.wav muted=false ready=true delayMs=0
 119101 tv    speak        text=i29.wav voice=clip delayMs=0
 119211 tv    hush
 119211 tv    clip         src=o66.wav muted=false ready=true delayMs=0
 119211 tv    speak        text=o66.wav voice=clip delayMs=0
 119305 tv    hush
 119305 tv    clip         src=g51.wav muted=false ready=true delayMs=0
 119305 tv    speak        text=g51.wav voice=clip delayMs=0
 119398 tv    hush
 119398 tv    clip         src=g53.wav muted=false ready=true delayMs=0
 119398 tv    speak        text=g53.wav voice=clip delayMs=0
 119508 tv    hush
 119508 tv    clip         src=b9.wav muted=false ready=true delayMs=0
 119508 tv    speak        text=b9.wav voice=clip delayMs=0
 119586 tv    hush
 119586 tv    clip         src=n36.wav muted=false ready=true delayMs=0
 119586 tv    speak        text=n36.wav voice=clip delayMs=0
 119664 tv    hush
 119664 tv    clip         src=g52.wav muted=false ready=true delayMs=0
 119664 tv    speak        text=g52.wav voice=clip delayMs=0
 119772 tv    hush
 119772 tv    clip         src=b1.wav muted=false ready=true delayMs=0
 119772 tv    speak        text=b1.wav voice=clip delayMs=0
 119863 tv    hush
 119863 tv    clip         src=b13.wav muted=false ready=true delayMs=0
 119863 tv    speak        text=b13.wav voice=clip delayMs=0
 119973 tv    hush
 119973 tv    clip         src=n37.wav muted=false ready=true delayMs=0
 119973 tv    speak        text=n37.wav voice=clip delayMs=0
 120066 tv    hush
 120066 tv    clip         src=o71.wav muted=false ready=true delayMs=0
 120066 tv    speak        text=o71.wav voice=clip delayMs=0
 120160 tv    hush
 120160 tv    clip         src=b8.wav muted=false ready=true delayMs=0
 120160 tv    speak        text=b8.wav voice=clip delayMs=0
 120257 tv    hush
 120257 tv    clip         src=b5.wav muted=false ready=true delayMs=0
 120257 tv    speak        text=b5.wav voice=clip delayMs=0
 120363 tv    hush
 120363 tv    clip         src=b7.wav muted=false ready=true delayMs=0
 120363 tv    speak        text=b7.wav voice=clip delayMs=0
 120455 tv    hush
 120455 tv    clip         src=n42.wav muted=false ready=true delayMs=0
 120455 tv    speak        text=n42.wav voice=clip delayMs=0
 120548 tv    hush
 120548 tv    clip         src=i28.wav muted=false ready=true delayMs=0
 120548 tv    speak        text=i28.wav voice=clip delayMs=0
 120646 tv    hush
 120646 tv    clip         src=i27.wav muted=false ready=true delayMs=0
 120646 tv    speak        text=i27.wav voice=clip delayMs=0
 120740 tv    hush
 120740 tv    clip         src=o63.wav muted=false ready=true delayMs=0
 120740 tv    speak        text=o63.wav voice=clip delayMs=0
 120833 tv    hush
 120833 tv    clip         src=o64.wav muted=false ready=true delayMs=0
 120833 tv    speak        text=o64.wav voice=clip delayMs=0
 120913 tv    hush
 120913 tv    clip         src=o73.wav muted=false ready=true delayMs=0
 120913 tv    speak        text=o73.wav voice=clip delayMs=0
 121005 tv    hush
 121005 tv    clip         src=g50.wav muted=false ready=true delayMs=0
 121005 tv    speak        text=g50.wav voice=clip delayMs=0
 121100 tv    hush
 121100 tv    clip         src=g48.wav muted=false ready=true delayMs=0
 121100 tv    speak        text=g48.wav voice=clip delayMs=0
 121208 tv    hush
 121208 tv    clip         src=b12.wav muted=false ready=true delayMs=0
 121208 tv    speak        text=b12.wav voice=clip delayMs=0
 121302 tv    hush
 121302 tv    clip         src=n45.wav muted=false ready=true delayMs=0
 121302 tv    speak        text=n45.wav voice=clip delayMs=0
 121381 tv    hush
 121381 tv    clip         src=b4.wav muted=false ready=true delayMs=0
 121381 tv    speak        text=b4.wav voice=clip delayMs=0
 121475 tv    hush
 121475 tv    clip         src=g46.wav muted=false ready=true delayMs=0
 121475 tv    speak        text=g46.wav voice=clip delayMs=0
 121555 tv    hush
 121555 tv    clip         src=o74.wav muted=false ready=true delayMs=0
 121555 tv    speak        text=o74.wav voice=clip delayMs=0
 121663 tv    hush
 121663 tv    clip         src=g47.wav muted=false ready=true delayMs=0
 121663 tv    speak        text=g47.wav voice=clip delayMs=0
 121757 tv    hush
 121757 tv    clip         src=n31.wav muted=false ready=true delayMs=0
 121757 tv    speak        text=n31.wav voice=clip delayMs=0
 121851 tv    hush
 121851 tv    clip         src=o62.wav muted=false ready=true delayMs=0
 121851 tv    speak        text=o62.wav voice=clip delayMs=0
 121932 tv    hush
 121932 tv    clip         src=b10.wav muted=false ready=true delayMs=0
 121932 tv    speak        text=b10.wav voice=clip delayMs=0
 122038 tv    hush
 122038 tv    clip         src=g60.wav muted=false ready=true delayMs=0
 122038 tv    speak        text=g60.wav voice=clip delayMs=0
 122133 tv    hush
 122133 tv    clip         src=n38.wav muted=false ready=true delayMs=0
 122133 tv    speak        text=n38.wav voice=clip delayMs=0
 122212 tv    hush
 122212 tv    clip         src=n39.wav muted=false ready=true delayMs=0
 122212 tv    speak        text=n39.wav voice=clip delayMs=0
 122306 tv    hush
 122306 tv    clip         src=o70.wav muted=false ready=true delayMs=0
 122306 tv    speak        text=o70.wav voice=clip delayMs=0
 122414 tv    hush
 122414 tv    clip         src=b11.wav muted=false ready=true delayMs=0
 122414 tv    speak        text=b11.wav voice=clip delayMs=0
 122509 tv    hush
 122509 tv    clip         src=o75.wav muted=false ready=true delayMs=0
 122509 tv    speak        text=o75.wav voice=clip delayMs=0
 122602 tv    hush
 122602 tv    clip         src=g58.wav muted=false ready=true delayMs=0
 122602 tv    speak        text=g58.wav voice=clip delayMs=0
 122683 tv    hush
 122683 tv    clip         src=b15.wav muted=false ready=true delayMs=0
 122683 tv    speak        text=b15.wav voice=clip delayMs=0
 122793 tv    hush
 122793 tv    clip         src=i24.wav muted=false ready=true delayMs=0
 122793 tv    speak        text=i24.wav voice=clip delayMs=0
 122886 tv    hush
 122886 tv    clip         src=o72.wav muted=false ready=true delayMs=0
 122886 tv    speak        text=o72.wav voice=clip delayMs=0
 122980 tv    hush
 122980 tv    clip         src=g56.wav muted=false ready=true delayMs=0
 122980 tv    speak        text=g56.wav voice=clip delayMs=0
 123074 tv    hush
 123074 tv    clip         src=i20.wav muted=false ready=true delayMs=0
 123074 tv    speak        text=i20.wav voice=clip delayMs=0
 123154 tv    hush
 123154 tv    clip         src=n44.wav muted=false ready=true delayMs=0
 123154 tv    speak        text=n44.wav voice=clip delayMs=0
 123247 tv    hush
 123247 tv    clip         src=b3.wav muted=false ready=true delayMs=0
 123247 tv    speak        text=b3.wav voice=clip delayMs=0
 123340 tv    hush
 123340 tv    clip         src=o68.wav muted=false ready=true delayMs=0
 123340 tv    speak        text=o68.wav voice=clip delayMs=0
 123434 tv    hush
 123434 tv    clip         src=b2.wav muted=false ready=true delayMs=0
 123434 tv    speak        text=b2.wav voice=clip delayMs=0
 123531 tv    hush
 123531 tv    clip         src=n41.wav muted=false ready=true delayMs=0
 123531 tv    speak        text=n41.wav voice=clip delayMs=0
 123624 tv    hush
 123624 tv    clip         src=o65.wav muted=false ready=true delayMs=0
 123624 tv    speak        text=o65.wav voice=clip delayMs=0
 123733 tv    hush
 123733 tv    clip         src=i17.wav muted=false ready=true delayMs=0
 123733 tv    speak        text=i17.wav voice=clip delayMs=0
 123829 tv    hush
 123829 tv    clip         src=i25.wav muted=false ready=true delayMs=0
 123829 tv    speak        text=i25.wav voice=clip delayMs=0
 123921 tv    hush
 123921 tv    clip         src=i19.wav muted=false ready=true delayMs=0
 123921 tv    speak        text=i19.wav voice=clip delayMs=0
 124014 tv    hush
 124014 tv    clip         src=g57.wav muted=false ready=true delayMs=0
 124014 tv    speak        text=g57.wav voice=clip delayMs=0
 124109 tv    hush
 124109 tv    clip         src=g59.wav muted=false ready=true delayMs=0
 124109 tv    speak        text=g59.wav voice=clip delayMs=0
 124204 tv    hush
 124204 tv    clip         src=g49.wav muted=false ready=true delayMs=0
 124204 tv    speak        text=g49.wav voice=clip delayMs=0
 124299 tv    hush
 124299 tv    clip         src=n43.wav muted=false ready=true delayMs=0
 124299 tv    speak        text=n43.wav voice=clip delayMs=0
 124377 tv    hush
 124377 tv    clip         src=i16.wav muted=false ready=true delayMs=0
 124377 tv    speak        text=i16.wav voice=clip delayMs=0
 124471 tv    hush
 124471 tv    clip         src=n33.wav muted=false ready=true delayMs=0
 124471 tv    speak        text=n33.wav voice=clip delayMs=0
 124566 tv    hush
 124566 tv    clip         src=i23.wav muted=false ready=true delayMs=0
 124566 tv    speak        text=i23.wav voice=clip delayMs=0
 124659 tv    hush
 124659 tv    clip         src=g54.wav muted=false ready=true delayMs=0
 124659 tv    speak        text=g54.wav voice=clip delayMs=0
 124753 tv    hush
 124753 tv    clip         src=b14.wav muted=false ready=true delayMs=0
 124753 tv    speak        text=b14.wav voice=clip delayMs=0
 124944 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 126001 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 126261 tv    hush
 126262 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 126262 tv    hush
 133876 tv    music:duck   ms=9000
 133876 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 138893 tv    hush
 138894 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 138894 tv    hush
 140425 tv    ss:cancel    speaking=false pending=false
 140425 tv    music:plan   from=game:bingo to=null
 140427 tv    ss:cancel    speaking=false pending=false
 140427 tv    music:plan   from=null to=lobby
 140427 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 141229 tv    music:stop   track=wallpaper.mp3
 142946 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 142957 tv    ss:cancel    speaking=false pending=false
 142959 tv    music:plan   from=lobby to=game:bingo
 142959 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 142959 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 142962 tv    hush
 142963 tv    hush
 143614 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 143760 tv    music:stop   track=george-street-shuffle.mp3
 144160 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
 145094 tv    ss:cancel    speaking=false pending=false
 145094 tv    music:plan   from=game:bingo to=null
 145094 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 146596 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 147224 tv    ss:cancel    speaking=false pending=false
 147224 tv    music:plan   from=null to=lobby
 147224 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 150583 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 150593 tv    ss:cancel    speaking=false pending=false
 150599 tv    music:plan   from=lobby to=game:bingo
 150599 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 150599 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 150602 tv    hush
 150603 tv    hush
 151010 tv    cue          cue=lock surface=tv muted=false ready=true semitones=8
 151012 tv    hush
 151012 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 151012 tv    speak        text=i21.wav voice=clip delayMs=0
 151012 tv    hush
 151203 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 151400 tv    music:stop   track=george-street-shuffle.mp3
 151508 tv    ss:cancel    speaking=false pending=false
 151508 tv    music:plan   from=game:bingo to=null
 151511 tv    ss:cancel    speaking=false pending=false
 151511 tv    music:plan   from=null to=lobby
 151511 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 152312 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, the lobby track only fading out, the warm bed under the intro** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"airport-lounge.mp3","vol":0.07,"t":10.1}] bed=warm
- ✅ **answer → one Wisecrack track at 0.2 while everyone writes, the bed gone** — playing=[{"track":"carefree.mp3","vol":0.2,"t":2.4}] bed=null
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **vote → the marimba bed (the first prompt), the track fading out** — bed=marimba playing=[]
- ✅ **reveal keeps the vote’s bed (same list, same turn: no crossfade on the cut)** — bed=marimba playing=[]
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal
- ✅ **scores phase → tally ping (mapped), the lounge bed** — cues=phase,reveal,phase,reveal,tally bed=lounge

```
 157129 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157544 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157976 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158392 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158810 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 159860 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 160439 tv    ss:cancel    speaking=false pending=false
 160444 tv    music:plan   from=lobby to=null
 160444 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 161695 tv    music:plan   from=null to=game:wisecrack
 161695 tv    music:start  plan=game:wisecrack track=carefree mode=chain volume=0.2
 161695 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 162503 tv    music:stop   track=airport-lounge.mp3
 165194 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 166462 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 167762 tv    music:plan   from=game:wisecrack to=null
 167762 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 168778 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 169269 tv    music:stop   track=carefree.mp3
 172396 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 172583 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 172771 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 172959 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 173146 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 174256 tv    ss:cancel    speaking=false pending=false
 174259 tv    ss:cancel    speaking=false pending=false
 174259 tv    music:plan   from=null to=lobby
 174259 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 176271 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 176278 tv    ss:cancel    speaking=false pending=false
 176281 tv    music:plan   from=lobby to=null
 176281 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 177787 tv    music:stop   track=airport-lounge.mp3
 177843 tv    music:plan   from=null to=game:broken-pencil
 177843 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 177843 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 179311 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 179785 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 179940 tv    music:plan   from=game:broken-pencil to=null
 179940 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 181452 tv    music:stop   track=backbay-lounge.mp3
```
