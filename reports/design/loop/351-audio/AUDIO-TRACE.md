# Audio interaction trace

Captured 2026-09-18T23:54:42.243Z on port 42166. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**60 / 60 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:bossa-antigua
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":4.4}]

```
   1802 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   1828 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3157 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3276 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3981 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4609 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
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
   6301 tv    music:plan   from=lobby to=null
   6301 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7804 tv    music:stop   track=bossa-antigua.mp3
   8253 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9545 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16510 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17506 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18514 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19511 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20505 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21306 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22108 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22252 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22407 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22566 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22722 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22880 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23037 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23198 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23354 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23512 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23653 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23810 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23967 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24126 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24282 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24441 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24595 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24751 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24910 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25782 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26106 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27916 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29641 tv    ss:cancel    speaking=false pending=false
  29641 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":1.5}]

```
  31186 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33320 tv    ss:cancel    speaking=false pending=false
  33320 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34855 tv    ss:cancel    speaking=false pending=false
  34855 tv    music:plan   from=null to=lobby
  34855 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:local-forecast-elevator.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":3}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime** — cues=start,card,lock,lock,lock,tick,tick,tick,call
- ✅ **each Ready ticks (lock, rising); the 3 · 2 · 1's first tick comes a breath (≥ 300 ms) after the last** — locks=3 last lock→first tick=431ms
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+993ms phone@+1002ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "another" is a 20 ms tap and one card pluck; Ready a 20 ms tap and the submit cue** — taps=3 cues=card,submit
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **each voice starts on the push (no delay); its boing lands on the squash, 170–230 ms later** — delays=0,0 boing lags=191,192ms
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":19}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":25.9}]
- ✅ **skipping through the deck: a hush before every call, one voice at a time** — clips=41 hushes=41
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer,silence cheer@+5355ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":40.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the winner's celebration buzz (320 ms) runs whole — nothing shorter cuts it** — celebration@74489 cut by=[]
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5409ms cheer@+5365ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36412 tv    music:plan   from=lobby to=game:bingo
  36412 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36412 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36715 tv    hush
  36716 tv    hush
  37212 tv    music:stop   track=local-forecast-elevator.mp3
  37367 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  39489 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  39742 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
  40037 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
  40468 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41467 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  42467 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  43453 tv    hush
  43453 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  43453 tv    speak        text=b9.wav voice=clip delayMs=0
  43454 tv    hush
  43645 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44015 tv    hush
  44015 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  44015 tv    speak        text=b8.wav voice=clip delayMs=0
  44206 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45846 tv    hush
  45846 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  45846 tv    speak        text=n34.wav voice=clip delayMs=0
  46038 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  47723 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47986 tv    hush
  47986 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47986 tv    hush
  53339 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  56345 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57346 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58346 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  59357 tv    hush
  59357 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  59357 tv    speak        text=n35.wav voice=clip delayMs=0
  59548 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61139 tv    music:paused paused=true
  61139 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  62388 tv    music:paused paused=false
  62389 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  63697 tv    hush
  63697 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  63697 tv    speak        text=i25.wav voice=clip delayMs=0
  63824 tv    hush
  63824 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  63824 tv    speak        text=n45.wav voice=clip delayMs=0
  63951 tv    hush
  63951 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  63951 tv    speak        text=n33.wav voice=clip delayMs=0
  64067 tv    hush
  64067 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  64067 tv    speak        text=g49.wav voice=clip delayMs=0
  64187 tv    hush
  64187 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  64187 tv    speak        text=b4.wav voice=clip delayMs=0
  64315 tv    hush
  64315 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  64315 tv    speak        text=i20.wav voice=clip delayMs=0
  64441 tv    hush
  64441 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  64441 tv    speak        text=o69.wav voice=clip delayMs=0
  64567 tv    hush
  64567 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  64567 tv    speak        text=o67.wav voice=clip delayMs=0
  64692 tv    hush
  64692 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  64692 tv    speak        text=o65.wav voice=clip delayMs=0
  64819 tv    hush
  64819 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  64819 tv    speak        text=o73.wav voice=clip delayMs=0
  64945 tv    hush
  64945 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  64945 tv    speak        text=i21.wav voice=clip delayMs=0
  65074 tv    hush
  65074 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  65074 tv    speak        text=i18.wav voice=clip delayMs=0
  65199 tv    hush
  65199 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  65199 tv    speak        text=g58.wav voice=clip delayMs=0
  65327 tv    hush
  65327 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  65327 tv    speak        text=n36.wav voice=clip delayMs=0
  65454 tv    hush
  65454 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  65454 tv    speak        text=o61.wav voice=clip delayMs=0
  65578 tv    hush
  65578 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  65578 tv    speak        text=n37.wav voice=clip delayMs=0
  65706 tv    hush
  65706 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  65706 tv    speak        text=i16.wav voice=clip delayMs=0
  65832 tv    hush
  65832 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  65832 tv    speak        text=g47.wav voice=clip delayMs=0
  65960 tv    hush
  65960 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  65960 tv    speak        text=n41.wav voice=clip delayMs=0
  66086 tv    hush
  66086 tv    clip         src=b6.wav muted=false ready=true delayMs=0
  66086 tv    speak        text=b6.wav voice=clip delayMs=0
  66213 tv    hush
  66213 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  66213 tv    speak        text=o72.wav voice=clip delayMs=0
  66339 tv    hush
  66339 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  66339 tv    speak        text=b3.wav voice=clip delayMs=0
  66466 tv    hush
  66466 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  66466 tv    speak        text=i30.wav voice=clip delayMs=0
  66591 tv    hush
  66591 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  66591 tv    speak        text=g56.wav voice=clip delayMs=0
  66717 tv    hush
  66717 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  66717 tv    speak        text=o75.wav voice=clip delayMs=0
  66844 tv    hush
  66844 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  66844 tv    speak        text=b1.wav voice=clip delayMs=0
  66973 tv    hush
  66973 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  66973 tv    speak        text=b2.wav voice=clip delayMs=0
  67097 tv    hush
  67097 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  67097 tv    speak        text=n32.wav voice=clip delayMs=0
  67223 tv    hush
  67223 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  67223 tv    speak        text=g48.wav voice=clip delayMs=0
  67334 tv    hush
  67334 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  67334 tv    speak        text=i23.wav voice=clip delayMs=0
  67459 tv    hush
  67459 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  67459 tv    speak        text=i26.wav voice=clip delayMs=0
  67568 tv    hush
  67568 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  67568 tv    speak        text=o66.wav voice=clip delayMs=0
  67694 tv    hush
  67694 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  67694 tv    speak        text=i19.wav voice=clip delayMs=0
  67820 tv    hush
  67821 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  67821 tv    speak        text=n42.wav voice=clip delayMs=0
  67947 tv    hush
  67947 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  67947 tv    speak        text=i24.wav voice=clip delayMs=0
  68075 tv    hush
  68075 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  68075 tv    speak        text=n39.wav voice=clip delayMs=0
  68201 tv    hush
  68201 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  68201 tv    speak        text=g46.wav voice=clip delayMs=0
  68313 tv    hush
  68313 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  68313 tv    speak        text=n44.wav voice=clip delayMs=0
  68439 tv    hush
  68439 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  68439 tv    speak        text=b15.wav voice=clip delayMs=0
  68566 tv    hush
  68566 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  68566 tv    speak        text=b11.wav voice=clip delayMs=0
  68694 tv    hush
  68694 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  68694 tv    speak        text=g57.wav voice=clip delayMs=0
  68884 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  69322 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  69599 tv    hush
  69600 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  69600 tv    hush
  71474 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  74954 tv    music:duck   ms=9000
  74954 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  75006 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79779 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  80096 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81097 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82097 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  83104 tv    hush
  83104 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  83104 tv    speak        text=g57.wav voice=clip delayMs=0
  83296 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  85416 tv    ss:cancel    speaking=false pending=false
  85416 tv    music:plan   from=game:bingo to=null
  85419 tv    ss:cancel    speaking=false pending=false
  85419 tv    music:plan   from=null to=lobby
  85419 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  86219 tv    music:stop   track=wallpaper.mp3
  87930 tv    ss:cancel    speaking=false pending=false
  87939 tv    music:plan   from=lobby to=game:bingo
  87939 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  87939 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  87942 tv    hush
  87942 tv    hush
  88560 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  88562 tv    hush
  88562 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  88562 tv    speak        text=i21.wav voice=clip delayMs=0
  88562 tv    hush
  88569 tv    hush
  88569 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  88569 tv    speak        text=n32.wav voice=clip delayMs=0
  88640 tv    hush
  88640 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  88640 tv    speak        text=i18.wav voice=clip delayMs=0
  88734 tv    hush
  88734 tv    clip         src=n40.wav muted=false ready=true delayMs=0
  88734 tv    speak        text=n40.wav voice=clip delayMs=0
  88740 tv    music:stop   track=local-forecast-elevator.mp3
  88828 tv    hush
  88828 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  88828 tv    speak        text=i30.wav voice=clip delayMs=0
  88923 tv    hush
  88923 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  88923 tv    speak        text=o69.wav voice=clip delayMs=0
  89018 tv    hush
  89018 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  89018 tv    speak        text=o61.wav voice=clip delayMs=0
  89098 tv    hush
  89098 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  89098 tv    speak        text=n34.wav voice=clip delayMs=0
  89194 tv    hush
  89194 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  89194 tv    speak        text=n35.wav voice=clip delayMs=0
  89289 tv    hush
  89289 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  89289 tv    speak        text=o67.wav voice=clip delayMs=0
  89383 tv    hush
  89383 tv    clip         src=g55.wav muted=false ready=true delayMs=0
  89383 tv    speak        text=g55.wav voice=clip delayMs=0
  89481 tv    hush
  89481 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  89481 tv    speak        text=i26.wav voice=clip delayMs=0
  89574 tv    hush
  89574 tv    clip         src=i22.wav muted=false ready=true delayMs=0
  89574 tv    speak        text=i22.wav voice=clip delayMs=0
  89670 tv    hush
  89670 tv    clip         src=i29.wav muted=false ready=true delayMs=0
  89670 tv    speak        text=i29.wav voice=clip delayMs=0
  89763 tv    hush
  89763 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  89763 tv    speak        text=o66.wav voice=clip delayMs=0
  89858 tv    hush
  89858 tv    clip         src=g51.wav muted=false ready=true delayMs=0
  89858 tv    speak        text=g51.wav voice=clip delayMs=0
  89953 tv    hush
  89953 tv    clip         src=g53.wav muted=false ready=true delayMs=0
  89953 tv    speak        text=g53.wav voice=clip delayMs=0
  90047 tv    hush
  90047 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  90047 tv    speak        text=b9.wav voice=clip delayMs=0
  90142 tv    hush
  90142 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  90142 tv    speak        text=n36.wav voice=clip delayMs=0
  90237 tv    hush
  90237 tv    clip         src=g52.wav muted=false ready=true delayMs=0
  90237 tv    speak        text=g52.wav voice=clip delayMs=0
  90333 tv    hush
  90333 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  90333 tv    speak        text=b1.wav voice=clip delayMs=0
  90432 tv    hush
  90432 tv    clip         src=b13.wav muted=false ready=true delayMs=0
  90432 tv    speak        text=b13.wav voice=clip delayMs=0
  90523 tv    hush
  90523 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  90523 tv    speak        text=n37.wav voice=clip delayMs=0
  90615 tv    hush
  90615 tv    clip         src=o71.wav muted=false ready=true delayMs=0
  90615 tv    speak        text=o71.wav voice=clip delayMs=0
  90712 tv    hush
  90712 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  90712 tv    speak        text=b8.wav voice=clip delayMs=0
  90805 tv    hush
  90805 tv    clip         src=b5.wav muted=false ready=true delayMs=0
  90805 tv    speak        text=b5.wav voice=clip delayMs=0
  90901 tv    hush
  90901 tv    clip         src=b7.wav muted=false ready=true delayMs=0
  90901 tv    speak        text=b7.wav voice=clip delayMs=0
  90996 tv    hush
  90996 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  90996 tv    speak        text=n42.wav voice=clip delayMs=0
  91076 tv    hush
  91076 tv    clip         src=i28.wav muted=false ready=true delayMs=0
  91076 tv    speak        text=i28.wav voice=clip delayMs=0
  91169 tv    hush
  91169 tv    clip         src=i27.wav muted=false ready=true delayMs=0
  91169 tv    speak        text=i27.wav voice=clip delayMs=0
  91265 tv    hush
  91265 tv    clip         src=o63.wav muted=false ready=true delayMs=0
  91265 tv    speak        text=o63.wav voice=clip delayMs=0
  91359 tv    hush
  91359 tv    clip         src=o64.wav muted=false ready=true delayMs=0
  91359 tv    speak        text=o64.wav voice=clip delayMs=0
  91455 tv    hush
  91455 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  91455 tv    speak        text=o73.wav voice=clip delayMs=0
  91546 tv    hush
  91547 tv    clip         src=g50.wav muted=false ready=true delayMs=0
  91547 tv    speak        text=g50.wav voice=clip delayMs=0
  91643 tv    hush
  91643 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  91643 tv    speak        text=g48.wav voice=clip delayMs=0
  91735 tv    hush
  91735 tv    clip         src=b12.wav muted=false ready=true delayMs=0
  91735 tv    speak        text=b12.wav voice=clip delayMs=0
  91832 tv    hush
  91832 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  91832 tv    speak        text=n45.wav voice=clip delayMs=0
  91931 tv    hush
  91931 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  91931 tv    speak        text=b4.wav voice=clip delayMs=0
  92040 tv    hush
  92040 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  92040 tv    speak        text=g46.wav voice=clip delayMs=0
  92132 tv    hush
  92132 tv    clip         src=o74.wav muted=false ready=true delayMs=0
  92132 tv    speak        text=o74.wav voice=clip delayMs=0
  92229 tv    hush
  92229 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  92229 tv    speak        text=g47.wav voice=clip delayMs=0
  92322 tv    hush
  92322 tv    clip         src=n31.wav muted=false ready=true delayMs=0
  92322 tv    speak        text=n31.wav voice=clip delayMs=0
  92417 tv    hush
  92417 tv    clip         src=o62.wav muted=false ready=true delayMs=0
  92417 tv    speak        text=o62.wav voice=clip delayMs=0
  92515 tv    hush
  92515 tv    clip         src=b10.wav muted=false ready=true delayMs=0
  92515 tv    speak        text=b10.wav voice=clip delayMs=0
  92614 tv    hush
  92614 tv    clip         src=g60.wav muted=false ready=true delayMs=0
  92614 tv    speak        text=g60.wav voice=clip delayMs=0
  92703 tv    hush
  92703 tv    clip         src=n38.wav muted=false ready=true delayMs=0
  92703 tv    speak        text=n38.wav voice=clip delayMs=0
  92796 tv    hush
  92796 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  92796 tv    speak        text=n39.wav voice=clip delayMs=0
  92892 tv    hush
  92892 tv    clip         src=o70.wav muted=false ready=true delayMs=0
  92892 tv    speak        text=o70.wav voice=clip delayMs=0
  92989 tv    hush
  92989 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  92989 tv    speak        text=b11.wav voice=clip delayMs=0
  93096 tv    hush
  93096 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  93096 tv    speak        text=o75.wav voice=clip delayMs=0
  93190 tv    hush
  93190 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  93190 tv    speak        text=g58.wav voice=clip delayMs=0
  93286 tv    hush
  93286 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  93286 tv    speak        text=b15.wav voice=clip delayMs=0
  93382 tv    hush
  93382 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  93382 tv    speak        text=i24.wav voice=clip delayMs=0
  93475 tv    hush
  93475 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  93475 tv    speak        text=o72.wav voice=clip delayMs=0
  93570 tv    hush
  93570 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  93570 tv    speak        text=g56.wav voice=clip delayMs=0
  93664 tv    hush
  93664 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  93664 tv    speak        text=i20.wav voice=clip delayMs=0
  93758 tv    hush
  93758 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  93758 tv    speak        text=n44.wav voice=clip delayMs=0
  93854 tv    hush
  93854 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  93854 tv    speak        text=b3.wav voice=clip delayMs=0
  93948 tv    hush
  93948 tv    clip         src=o68.wav muted=false ready=true delayMs=0
  93948 tv    speak        text=o68.wav voice=clip delayMs=0
  94039 tv    hush
  94039 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  94039 tv    speak        text=b2.wav voice=clip delayMs=0
  94134 tv    hush
  94134 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  94134 tv    speak        text=n41.wav voice=clip delayMs=0
  94230 tv    hush
  94230 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  94230 tv    speak        text=o65.wav voice=clip delayMs=0
  94325 tv    hush
  94325 tv    clip         src=i17.wav muted=false ready=true delayMs=0
  94325 tv    speak        text=i17.wav voice=clip delayMs=0
  94419 tv    hush
  94419 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  94419 tv    speak        text=i25.wav voice=clip delayMs=0
  94513 tv    hush
  94513 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  94513 tv    speak        text=i19.wav voice=clip delayMs=0
  94613 tv    hush
  94613 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  94613 tv    speak        text=g57.wav voice=clip delayMs=0
  94703 tv    hush
  94703 tv    clip         src=g59.wav muted=false ready=true delayMs=0
  94703 tv    speak        text=g59.wav voice=clip delayMs=0
  94895 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  95924 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  96189 tv    hush
  96189 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  96189 tv    hush
 103793 tv    music:duck   ms=9000
 103793 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108816 tv    hush
 108817 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108817 tv    hush
 112812 tv    ss:cancel    speaking=false pending=false
 112812 tv    music:plan   from=game:bingo to=null
 112812 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 114313 tv    music:stop   track=wallpaper.mp3
 114398 tv    ss:cancel    speaking=false pending=false
 114398 tv    music:plan   from=null to=lobby
 114399 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 116910 tv    ss:cancel    speaking=false pending=false
 116915 tv    music:plan   from=lobby to=game:bingo
 116915 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 116915 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116918 tv    hush
 116918 tv    hush
 117554 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 117556 tv    hush
 117556 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 117556 tv    speak        text=i21.wav voice=clip delayMs=0
 117556 tv    hush
 117572 tv    hush
 117572 tv    clip         src=n32.wav muted=false ready=true delayMs=0
 117572 tv    speak        text=n32.wav voice=clip delayMs=0
 117670 tv    hush
 117670 tv    clip         src=i18.wav muted=false ready=true delayMs=0
 117670 tv    speak        text=i18.wav voice=clip delayMs=0
 117716 tv    music:stop   track=local-forecast-elevator.mp3
 117760 tv    hush
 117760 tv    clip         src=n40.wav muted=false ready=true delayMs=0
 117760 tv    speak        text=n40.wav voice=clip delayMs=0
 117856 tv    hush
 117856 tv    clip         src=i30.wav muted=false ready=true delayMs=0
 117856 tv    speak        text=i30.wav voice=clip delayMs=0
 117952 tv    hush
 117952 tv    clip         src=o69.wav muted=false ready=true delayMs=0
 117952 tv    speak        text=o69.wav voice=clip delayMs=0
 118040 tv    hush
 118040 tv    clip         src=o61.wav muted=false ready=true delayMs=0
 118040 tv    speak        text=o61.wav voice=clip delayMs=0
 118139 tv    hush
 118139 tv    clip         src=n34.wav muted=false ready=true delayMs=0
 118139 tv    speak        text=n34.wav voice=clip delayMs=0
 118232 tv    hush
 118232 tv    clip         src=n35.wav muted=false ready=true delayMs=0
 118232 tv    speak        text=n35.wav voice=clip delayMs=0
 118324 tv    hush
 118324 tv    clip         src=o67.wav muted=false ready=true delayMs=0
 118324 tv    speak        text=o67.wav voice=clip delayMs=0
 118416 tv    hush
 118416 tv    clip         src=g55.wav muted=false ready=true delayMs=0
 118416 tv    speak        text=g55.wav voice=clip delayMs=0
 118514 tv    hush
 118514 tv    clip         src=i26.wav muted=false ready=true delayMs=0
 118514 tv    speak        text=i26.wav voice=clip delayMs=0
 118610 tv    hush
 118610 tv    clip         src=i22.wav muted=false ready=true delayMs=0
 118610 tv    speak        text=i22.wav voice=clip delayMs=0
 118687 tv    hush
 118687 tv    clip         src=i29.wav muted=false ready=true delayMs=0
 118687 tv    speak        text=i29.wav voice=clip delayMs=0
 118781 tv    hush
 118781 tv    clip         src=o66.wav muted=false ready=true delayMs=0
 118781 tv    speak        text=o66.wav voice=clip delayMs=0
 118879 tv    hush
 118879 tv    clip         src=g51.wav muted=false ready=true delayMs=0
 118879 tv    speak        text=g51.wav voice=clip delayMs=0
 118968 tv    hush
 118968 tv    clip         src=g53.wav muted=false ready=true delayMs=0
 118968 tv    speak        text=g53.wav voice=clip delayMs=0
 119069 tv    hush
 119069 tv    clip         src=b9.wav muted=false ready=true delayMs=0
 119069 tv    speak        text=b9.wav voice=clip delayMs=0
 119159 tv    hush
 119159 tv    clip         src=n36.wav muted=false ready=true delayMs=0
 119159 tv    speak        text=n36.wav voice=clip delayMs=0
 119263 tv    hush
 119263 tv    clip         src=g52.wav muted=false ready=true delayMs=0
 119263 tv    speak        text=g52.wav voice=clip delayMs=0
 119356 tv    hush
 119356 tv    clip         src=b1.wav muted=false ready=true delayMs=0
 119356 tv    speak        text=b1.wav voice=clip delayMs=0
 119441 tv    hush
 119441 tv    clip         src=b13.wav muted=false ready=true delayMs=0
 119441 tv    speak        text=b13.wav voice=clip delayMs=0
 119535 tv    hush
 119535 tv    clip         src=n37.wav muted=false ready=true delayMs=0
 119535 tv    speak        text=n37.wav voice=clip delayMs=0
 119630 tv    hush
 119630 tv    clip         src=o71.wav muted=false ready=true delayMs=0
 119630 tv    speak        text=o71.wav voice=clip delayMs=0
 119722 tv    hush
 119722 tv    clip         src=b8.wav muted=false ready=true delayMs=0
 119722 tv    speak        text=b8.wav voice=clip delayMs=0
 119816 tv    hush
 119816 tv    clip         src=b5.wav muted=false ready=true delayMs=0
 119816 tv    speak        text=b5.wav voice=clip delayMs=0
 119909 tv    hush
 119909 tv    clip         src=b7.wav muted=false ready=true delayMs=0
 119909 tv    speak        text=b7.wav voice=clip delayMs=0
 120001 tv    hush
 120001 tv    clip         src=n42.wav muted=false ready=true delayMs=0
 120001 tv    speak        text=n42.wav voice=clip delayMs=0
 120102 tv    hush
 120102 tv    clip         src=i28.wav muted=false ready=true delayMs=0
 120102 tv    speak        text=i28.wav voice=clip delayMs=0
 120176 tv    hush
 120176 tv    clip         src=i27.wav muted=false ready=true delayMs=0
 120176 tv    speak        text=i27.wav voice=clip delayMs=0
 120262 tv    hush
 120262 tv    clip         src=o63.wav muted=false ready=true delayMs=0
 120262 tv    speak        text=o63.wav voice=clip delayMs=0
 120366 tv    hush
 120366 tv    clip         src=o64.wav muted=false ready=true delayMs=0
 120366 tv    speak        text=o64.wav voice=clip delayMs=0
 120439 tv    hush
 120439 tv    clip         src=o73.wav muted=false ready=true delayMs=0
 120439 tv    speak        text=o73.wav voice=clip delayMs=0
 120540 tv    hush
 120540 tv    clip         src=g50.wav muted=false ready=true delayMs=0
 120540 tv    speak        text=g50.wav voice=clip delayMs=0
 120634 tv    hush
 120634 tv    clip         src=g48.wav muted=false ready=true delayMs=0
 120634 tv    speak        text=g48.wav voice=clip delayMs=0
 120726 tv    hush
 120726 tv    clip         src=b12.wav muted=false ready=true delayMs=0
 120726 tv    speak        text=b12.wav voice=clip delayMs=0
 120805 tv    hush
 120805 tv    clip         src=n45.wav muted=false ready=true delayMs=0
 120805 tv    speak        text=n45.wav voice=clip delayMs=0
 120918 tv    hush
 120918 tv    clip         src=b4.wav muted=false ready=true delayMs=0
 120918 tv    speak        text=b4.wav voice=clip delayMs=0
 120994 tv    hush
 120994 tv    clip         src=g46.wav muted=false ready=true delayMs=0
 120994 tv    speak        text=g46.wav voice=clip delayMs=0
 121109 tv    hush
 121109 tv    clip         src=o74.wav muted=false ready=true delayMs=0
 121109 tv    speak        text=o74.wav voice=clip delayMs=0
 121195 tv    hush
 121195 tv    clip         src=g47.wav muted=false ready=true delayMs=0
 121196 tv    speak        text=g47.wav voice=clip delayMs=0
 121298 tv    hush
 121298 tv    clip         src=n31.wav muted=false ready=true delayMs=0
 121298 tv    speak        text=n31.wav voice=clip delayMs=0
 121389 tv    hush
 121389 tv    clip         src=o62.wav muted=false ready=true delayMs=0
 121389 tv    speak        text=o62.wav voice=clip delayMs=0
 121463 tv    hush
 121463 tv    clip         src=b10.wav muted=false ready=true delayMs=0
 121463 tv    speak        text=b10.wav voice=clip delayMs=0
 121558 tv    hush
 121558 tv    clip         src=g60.wav muted=false ready=true delayMs=0
 121558 tv    speak        text=g60.wav voice=clip delayMs=0
 121653 tv    hush
 121653 tv    clip         src=n38.wav muted=false ready=true delayMs=0
 121653 tv    speak        text=n38.wav voice=clip delayMs=0
 121742 tv    hush
 121742 tv    clip         src=n39.wav muted=false ready=true delayMs=0
 121742 tv    speak        text=n39.wav voice=clip delayMs=0
 121842 tv    hush
 121842 tv    clip         src=o70.wav muted=false ready=true delayMs=0
 121842 tv    speak        text=o70.wav voice=clip delayMs=0
 121935 tv    hush
 121935 tv    clip         src=b11.wav muted=false ready=true delayMs=0
 121935 tv    speak        text=b11.wav voice=clip delayMs=0
 122025 tv    hush
 122025 tv    clip         src=o75.wav muted=false ready=true delayMs=0
 122025 tv    speak        text=o75.wav voice=clip delayMs=0
 122120 tv    hush
 122120 tv    clip         src=g58.wav muted=false ready=true delayMs=0
 122120 tv    speak        text=g58.wav voice=clip delayMs=0
 122221 tv    hush
 122221 tv    clip         src=b15.wav muted=false ready=true delayMs=0
 122221 tv    speak        text=b15.wav voice=clip delayMs=0
 122295 tv    hush
 122295 tv    clip         src=i24.wav muted=false ready=true delayMs=0
 122295 tv    speak        text=i24.wav voice=clip delayMs=0
 122390 tv    hush
 122390 tv    clip         src=o72.wav muted=false ready=true delayMs=0
 122390 tv    speak        text=o72.wav voice=clip delayMs=0
 122484 tv    hush
 122484 tv    clip         src=g56.wav muted=false ready=true delayMs=0
 122484 tv    speak        text=g56.wav voice=clip delayMs=0
 122585 tv    hush
 122585 tv    clip         src=i20.wav muted=false ready=true delayMs=0
 122585 tv    speak        text=i20.wav voice=clip delayMs=0
 122661 tv    hush
 122661 tv    clip         src=n44.wav muted=false ready=true delayMs=0
 122661 tv    speak        text=n44.wav voice=clip delayMs=0
 122759 tv    hush
 122759 tv    clip         src=b3.wav muted=false ready=true delayMs=0
 122759 tv    speak        text=b3.wav voice=clip delayMs=0
 122860 tv    hush
 122860 tv    clip         src=o68.wav muted=false ready=true delayMs=0
 122860 tv    speak        text=o68.wav voice=clip delayMs=0
 122956 tv    hush
 122956 tv    clip         src=b2.wav muted=false ready=true delayMs=0
 122956 tv    speak        text=b2.wav voice=clip delayMs=0
 123052 tv    hush
 123052 tv    clip         src=n41.wav muted=false ready=true delayMs=0
 123052 tv    speak        text=n41.wav voice=clip delayMs=0
 123150 tv    hush
 123150 tv    clip         src=o65.wav muted=false ready=true delayMs=0
 123150 tv    speak        text=o65.wav voice=clip delayMs=0
 123243 tv    hush
 123243 tv    clip         src=i17.wav muted=false ready=true delayMs=0
 123243 tv    speak        text=i17.wav voice=clip delayMs=0
 123337 tv    hush
 123337 tv    clip         src=i25.wav muted=false ready=true delayMs=0
 123337 tv    speak        text=i25.wav voice=clip delayMs=0
 123434 tv    hush
 123434 tv    clip         src=i19.wav muted=false ready=true delayMs=0
 123434 tv    speak        text=i19.wav voice=clip delayMs=0
 123530 tv    hush
 123530 tv    clip         src=g57.wav muted=false ready=true delayMs=0
 123530 tv    speak        text=g57.wav voice=clip delayMs=0
 123625 tv    hush
 123625 tv    clip         src=g59.wav muted=false ready=true delayMs=0
 123625 tv    speak        text=g59.wav voice=clip delayMs=0
 123817 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124876 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 125148 tv    hush
 125148 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 125148 tv    hush
 132751 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 132756 tv    music:duck   ms=9000
 132756 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 137761 tv    hush
 137762 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 137762 tv    hush
 139330 tv    ss:cancel    speaking=false pending=false
 139330 tv    music:plan   from=game:bingo to=null
 139333 tv    ss:cancel    speaking=false pending=false
 139333 tv    music:plan   from=null to=lobby
 139333 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 140133 tv    music:stop   track=cool-vibes.mp3
 141847 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 141857 tv    ss:cancel    speaking=false pending=false
 141859 tv    music:plan   from=lobby to=game:bingo
 141859 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 141859 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 141862 tv    hush
 141862 tv    hush
 142512 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 142661 tv    music:stop   track=airport-lounge.mp3
 143091 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
 143987 tv    ss:cancel    speaking=false pending=false
 143987 tv    music:plan   from=game:bingo to=null
 143987 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 145488 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 146130 tv    ss:cancel    speaking=false pending=false
 146130 tv    music:plan   from=null to=lobby
 146130 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 149494 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 149503 tv    ss:cancel    speaking=false pending=false
 149505 tv    music:plan   from=lobby to=game:bingo
 149505 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 149505 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149508 tv    hush
 149509 tv    hush
 149921 tv    cue          cue=lock surface=tv muted=false ready=true semitones=8
 149924 tv    hush
 149924 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 149924 tv    speak        text=i21.wav voice=clip delayMs=0
 149924 tv    hush
 150116 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 150306 tv    music:stop   track=local-forecast-elevator.mp3
 150433 tv    ss:cancel    speaking=false pending=false
 150433 tv    music:plan   from=game:bingo to=null
 150436 tv    ss:cancel    speaking=false pending=false
 150436 tv    music:plan   from=null to=lobby
 150436 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 151238 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"airport-lounge.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 156018 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156433 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156866 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157282 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157698 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158800 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 159393 tv    ss:cancel    speaking=false pending=false
 159399 tv    music:plan   from=lobby to=null
 159399 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 160652 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 160900 tv    music:stop   track=airport-lounge.mp3
 162234 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 163517 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 164818 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 165862 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 166906 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 169462 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 169650 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 169835 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 170009 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 171129 tv    ss:cancel    speaking=false pending=false
 171131 tv    ss:cancel    speaking=false pending=false
 171131 tv    music:plan   from=null to=lobby
 171131 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 173139 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 173154 tv    ss:cancel    speaking=false pending=false
 173155 tv    music:plan   from=lobby to=null
 173155 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 174657 tv    music:stop   track=bossa-antigua.mp3
 174710 tv    music:plan   from=null to=game:broken-pencil
 174710 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 174711 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 176199 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 176655 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 176812 tv    music:plan   from=game:broken-pencil to=null
 176812 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 178313 tv    music:stop   track=hep-cats.mp3
```
