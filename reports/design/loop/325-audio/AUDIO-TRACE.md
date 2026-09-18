# Audio interaction trace

Captured 2026-09-18T18:52:45.553Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**56 / 56 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.4}]

```
   1766 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1792 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3104 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3240 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3923 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4557 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5407 tv    ss:cancel    speaking=false pending=false
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
   6255 tv    music:plan   from=lobby to=null
   6255 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7758 tv    music:stop   track=local-forecast-elevator.mp3
   8193 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9474 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16446 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17445 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18444 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19445 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20446 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21252 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22060 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22200 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22360 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22519 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22673 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22818 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22974 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23135 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23289 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23448 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23605 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23761 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23918 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24076 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24232 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24376 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24535 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24692 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24860 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25725 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26054 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27863 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29593 tv    ss:cancel    speaking=false pending=false
  29594 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31150 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33291 tv    ss:cancel    speaking=false pending=false
  33291 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34852 tv    ss:cancel    speaking=false pending=false
  34852 tv    music:plan   from=null to=lobby
  34852 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+958ms phone@+967ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":24.8}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5356ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.3}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5396ms cheer@+5367ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36430 tv    music:plan   from=lobby to=game:bingo
  36430 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36430 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36734 tv    hush
  36735 tv    hush
  37231 tv    music:stop   track=bossa-antigua.mp3
  37345 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38436 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39436 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40436 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41433 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  41433 tv    speak        text=b9.wav voice=clip delayMs=190
  41434 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41625 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43060 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  43060 tv    speak        text=b8.wav voice=clip delayMs=190
  43251 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44879 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  44879 tv    speak        text=n34.wav voice=clip delayMs=190
  45069 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46753 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47010 tv    hush
  47010 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47010 tv    hush
  52362 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55376 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56378 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57377 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58391 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  58391 tv    speak        text=n35.wav voice=clip delayMs=190
  58582 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60172 tv    music:paused paused=true
  60172 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61418 tv    music:paused paused=false
  61419 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62687 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  62687 tv    speak        text=i25.wav voice=clip delayMs=190
  62812 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  62812 tv    speak        text=n45.wav voice=clip delayMs=190
  62939 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  62939 tv    speak        text=n33.wav voice=clip delayMs=190
  63062 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  63062 tv    speak        text=g49.wav voice=clip delayMs=190
  63192 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  63192 tv    speak        text=b4.wav voice=clip delayMs=190
  63317 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  63317 tv    speak        text=i20.wav voice=clip delayMs=190
  63441 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  63441 tv    speak        text=o69.wav voice=clip delayMs=190
  63567 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  63567 tv    speak        text=o67.wav voice=clip delayMs=190
  63694 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  63694 tv    speak        text=o65.wav voice=clip delayMs=190
  63820 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  63820 tv    speak        text=o73.wav voice=clip delayMs=190
  63945 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  63945 tv    speak        text=i21.wav voice=clip delayMs=190
  64055 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  64055 tv    speak        text=i18.wav voice=clip delayMs=190
  64181 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  64181 tv    speak        text=g58.wav voice=clip delayMs=190
  64304 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  64304 tv    speak        text=n36.wav voice=clip delayMs=190
  64432 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  64432 tv    speak        text=o61.wav voice=clip delayMs=190
  64559 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  64559 tv    speak        text=n37.wav voice=clip delayMs=190
  64683 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  64683 tv    speak        text=i16.wav voice=clip delayMs=190
  64816 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  64816 tv    speak        text=g47.wav voice=clip delayMs=190
  64936 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  64936 tv    speak        text=n41.wav voice=clip delayMs=190
  65064 tv    clip         src=b6.wav muted=false ready=true delayMs=190
  65064 tv    speak        text=b6.wav voice=clip delayMs=190
  65185 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  65185 tv    speak        text=o72.wav voice=clip delayMs=190
  65312 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  65312 tv    speak        text=b3.wav voice=clip delayMs=190
  65437 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  65437 tv    speak        text=i30.wav voice=clip delayMs=190
  65565 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  65565 tv    speak        text=g56.wav voice=clip delayMs=190
  65691 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  65691 tv    speak        text=o75.wav voice=clip delayMs=190
  65817 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  65817 tv    speak        text=b1.wav voice=clip delayMs=190
  65929 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  65929 tv    speak        text=b2.wav voice=clip delayMs=190
  66056 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  66056 tv    speak        text=n32.wav voice=clip delayMs=190
  66164 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  66164 tv    speak        text=g48.wav voice=clip delayMs=190
  66289 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  66289 tv    speak        text=i23.wav voice=clip delayMs=190
  66414 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  66414 tv    speak        text=i26.wav voice=clip delayMs=190
  66539 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  66539 tv    speak        text=o66.wav voice=clip delayMs=190
  66665 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  66665 tv    speak        text=i19.wav voice=clip delayMs=190
  66792 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  66792 tv    speak        text=n42.wav voice=clip delayMs=190
  66917 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  66917 tv    speak        text=i24.wav voice=clip delayMs=190
  67045 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  67045 tv    speak        text=n39.wav voice=clip delayMs=190
  67169 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  67169 tv    speak        text=g46.wav voice=clip delayMs=190
  67293 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  67293 tv    speak        text=n44.wav voice=clip delayMs=190
  67420 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  67420 tv    speak        text=b15.wav voice=clip delayMs=190
  67530 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  67530 tv    speak        text=b11.wav voice=clip delayMs=190
  67655 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  67655 tv    speak        text=g57.wav voice=clip delayMs=190
  67846 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  68269 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68558 tv    hush
  68558 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68559 tv    hush
  70433 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73914 tv    music:duck   ms=9000
  73914 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  78724 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79042 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80043 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81043 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82048 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  82048 tv    speak        text=g57.wav voice=clip delayMs=190
  82241 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84345 tv    ss:cancel    speaking=false pending=false
  84345 tv    music:plan   from=game:bingo to=null
  84348 tv    ss:cancel    speaking=false pending=false
  84348 tv    music:plan   from=null to=lobby
  84348 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  85149 tv    music:stop   track=wallpaper.mp3
  86872 tv    ss:cancel    speaking=false pending=false
  86882 tv    music:plan   from=lobby to=game:bingo
  86882 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86882 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86885 tv    hush
  86885 tv    hush
  87496 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  87501 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  87501 tv    speak        text=i21.wav voice=clip delayMs=190
  87509 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  87509 tv    speak        text=n32.wav voice=clip delayMs=190
  87614 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  87614 tv    speak        text=i18.wav voice=clip delayMs=190
  87682 tv    music:stop   track=local-forecast-elevator.mp3
  87706 tv    clip         src=n40.wav muted=false ready=true delayMs=190
  87706 tv    speak        text=n40.wav voice=clip delayMs=190
  87800 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  87800 tv    speak        text=i30.wav voice=clip delayMs=190
  87896 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  87896 tv    speak        text=o69.wav voice=clip delayMs=190
  87990 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  87990 tv    speak        text=o61.wav voice=clip delayMs=190
  88083 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  88083 tv    speak        text=n34.wav voice=clip delayMs=190
  88178 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  88178 tv    speak        text=n35.wav voice=clip delayMs=190
  88273 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  88273 tv    speak        text=o67.wav voice=clip delayMs=190
  88369 tv    clip         src=g55.wav muted=false ready=true delayMs=190
  88369 tv    speak        text=g55.wav voice=clip delayMs=190
  88462 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  88462 tv    speak        text=i26.wav voice=clip delayMs=190
  88556 tv    clip         src=i22.wav muted=false ready=true delayMs=190
  88556 tv    speak        text=i22.wav voice=clip delayMs=190
  88637 tv    clip         src=i29.wav muted=false ready=true delayMs=190
  88637 tv    speak        text=i29.wav voice=clip delayMs=190
  88728 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  88728 tv    speak        text=o66.wav voice=clip delayMs=190
  88823 tv    clip         src=g51.wav muted=false ready=true delayMs=190
  88823 tv    speak        text=g51.wav voice=clip delayMs=190
  88916 tv    clip         src=g53.wav muted=false ready=true delayMs=190
  88916 tv    speak        text=g53.wav voice=clip delayMs=190
  89021 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  89021 tv    speak        text=b9.wav voice=clip delayMs=190
  89105 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  89105 tv    speak        text=n36.wav voice=clip delayMs=190
  89205 tv    clip         src=g52.wav muted=false ready=true delayMs=190
  89205 tv    speak        text=g52.wav voice=clip delayMs=190
  89295 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  89295 tv    speak        text=b1.wav voice=clip delayMs=190
  89397 tv    clip         src=b13.wav muted=false ready=true delayMs=190
  89397 tv    speak        text=b13.wav voice=clip delayMs=190
  89488 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  89488 tv    speak        text=n37.wav voice=clip delayMs=190
  89578 tv    clip         src=o71.wav muted=false ready=true delayMs=190
  89578 tv    speak        text=o71.wav voice=clip delayMs=190
  89674 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  89674 tv    speak        text=b8.wav voice=clip delayMs=190
  89752 tv    clip         src=b5.wav muted=false ready=true delayMs=190
  89752 tv    speak        text=b5.wav voice=clip delayMs=190
  89846 tv    clip         src=b7.wav muted=false ready=true delayMs=190
  89846 tv    speak        text=b7.wav voice=clip delayMs=190
  89941 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  89941 tv    speak        text=n42.wav voice=clip delayMs=190
  90035 tv    clip         src=i28.wav muted=false ready=true delayMs=190
  90035 tv    speak        text=i28.wav voice=clip delayMs=190
  90127 tv    clip         src=i27.wav muted=false ready=true delayMs=190
  90127 tv    speak        text=i27.wav voice=clip delayMs=190
  90207 tv    clip         src=o63.wav muted=false ready=true delayMs=190
  90207 tv    speak        text=o63.wav voice=clip delayMs=190
  90302 tv    clip         src=o64.wav muted=false ready=true delayMs=190
  90302 tv    speak        text=o64.wav voice=clip delayMs=190
  90401 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  90401 tv    speak        text=o73.wav voice=clip delayMs=190
  90493 tv    clip         src=g50.wav muted=false ready=true delayMs=190
  90493 tv    speak        text=g50.wav voice=clip delayMs=190
  90581 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  90581 tv    speak        text=g48.wav voice=clip delayMs=190
  90677 tv    clip         src=b12.wav muted=false ready=true delayMs=190
  90677 tv    speak        text=b12.wav voice=clip delayMs=190
  90765 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  90765 tv    speak        text=n45.wav voice=clip delayMs=190
  90872 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  90872 tv    speak        text=b4.wav voice=clip delayMs=190
  90968 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  90968 tv    speak        text=g46.wav voice=clip delayMs=190
  91056 tv    clip         src=o74.wav muted=false ready=true delayMs=190
  91056 tv    speak        text=o74.wav voice=clip delayMs=190
  91149 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  91149 tv    speak        text=g47.wav voice=clip delayMs=190
  91246 tv    clip         src=n31.wav muted=false ready=true delayMs=190
  91246 tv    speak        text=n31.wav voice=clip delayMs=190
  91339 tv    clip         src=o62.wav muted=false ready=true delayMs=190
  91339 tv    speak        text=o62.wav voice=clip delayMs=190
  91435 tv    clip         src=b10.wav muted=false ready=true delayMs=190
  91435 tv    speak        text=b10.wav voice=clip delayMs=190
  91528 tv    clip         src=g60.wav muted=false ready=true delayMs=190
  91528 tv    speak        text=g60.wav voice=clip delayMs=190
  91623 tv    clip         src=n38.wav muted=false ready=true delayMs=190
  91623 tv    speak        text=n38.wav voice=clip delayMs=190
  91717 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  91717 tv    speak        text=n39.wav voice=clip delayMs=190
  91796 tv    clip         src=o70.wav muted=false ready=true delayMs=190
  91796 tv    speak        text=o70.wav voice=clip delayMs=190
  91866 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  91866 tv    speak        text=b11.wav voice=clip delayMs=190
  91953 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  91953 tv    speak        text=o75.wav voice=clip delayMs=190
  92050 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  92050 tv    speak        text=g58.wav voice=clip delayMs=190
  92149 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  92149 tv    speak        text=b15.wav voice=clip delayMs=190
  92241 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  92241 tv    speak        text=i24.wav voice=clip delayMs=190
  92330 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  92330 tv    speak        text=o72.wav voice=clip delayMs=190
  92425 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  92425 tv    speak        text=g56.wav voice=clip delayMs=190
  92520 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  92520 tv    speak        text=i20.wav voice=clip delayMs=190
  92632 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  92632 tv    speak        text=n44.wav voice=clip delayMs=190
  92727 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  92727 tv    speak        text=b3.wav voice=clip delayMs=190
  92817 tv    clip         src=o68.wav muted=false ready=true delayMs=190
  92817 tv    speak        text=o68.wav voice=clip delayMs=190
  92910 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  92910 tv    speak        text=b2.wav voice=clip delayMs=190
  93005 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  93005 tv    speak        text=n41.wav voice=clip delayMs=190
  93082 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  93082 tv    speak        text=o65.wav voice=clip delayMs=190
  93177 tv    clip         src=i17.wav muted=false ready=true delayMs=190
  93177 tv    speak        text=i17.wav voice=clip delayMs=190
  93287 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  93287 tv    speak        text=i25.wav voice=clip delayMs=190
  93380 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  93380 tv    speak        text=i19.wav voice=clip delayMs=190
  93475 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  93475 tv    speak        text=g57.wav voice=clip delayMs=190
  93570 tv    clip         src=g59.wav muted=false ready=true delayMs=190
  93570 tv    speak        text=g59.wav voice=clip delayMs=190
  93664 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  93664 tv    speak        text=g49.wav voice=clip delayMs=190
  93758 tv    clip         src=n43.wav muted=false ready=true delayMs=190
  93758 tv    speak        text=n43.wav voice=clip delayMs=190
  93851 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  93851 tv    speak        text=i16.wav voice=clip delayMs=190
  93931 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  93931 tv    speak        text=n33.wav voice=clip delayMs=190
  94025 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  94025 tv    speak        text=i23.wav voice=clip delayMs=190
  94121 tv    clip         src=g54.wav muted=false ready=true delayMs=190
  94121 tv    speak        text=g54.wav voice=clip delayMs=190
  94215 tv    clip         src=b14.wav muted=false ready=true delayMs=190
  94215 tv    speak        text=b14.wav voice=clip delayMs=190
  94406 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  95435 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95706 tv    hush
  95706 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95706 tv    hush
 103314 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 103318 tv    music:duck   ms=9000
 103318 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108323 tv    hush
 108323 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108323 tv    hush
 112334 tv    ss:cancel    speaking=false pending=false
 112334 tv    music:plan   from=game:bingo to=null
 112334 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113836 tv    music:stop   track=wallpaper.mp3
 113945 tv    ss:cancel    speaking=false pending=false
 113945 tv    music:plan   from=null to=lobby
 113945 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 116450 tv    ss:cancel    speaking=false pending=false
 116457 tv    music:plan   from=lobby to=game:bingo
 116458 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116458 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116461 tv    hush
 116461 tv    hush
 117075 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 117075 tv    speak        text=i21.wav voice=clip delayMs=190
 117075 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 117089 tv    clip         src=n32.wav muted=false ready=true delayMs=190
 117089 tv    speak        text=n32.wav voice=clip delayMs=190
 117168 tv    clip         src=i18.wav muted=false ready=true delayMs=190
 117168 tv    speak        text=i18.wav voice=clip delayMs=190
 117248 tv    clip         src=n40.wav muted=false ready=true delayMs=190
 117248 tv    speak        text=n40.wav voice=clip delayMs=190
 117258 tv    music:stop   track=airport-lounge.mp3
 117341 tv    clip         src=i30.wav muted=false ready=true delayMs=190
 117341 tv    speak        text=i30.wav voice=clip delayMs=190
 117439 tv    clip         src=o69.wav muted=false ready=true delayMs=190
 117439 tv    speak        text=o69.wav voice=clip delayMs=190
 117527 tv    clip         src=o61.wav muted=false ready=true delayMs=190
 117527 tv    speak        text=o61.wav voice=clip delayMs=190
 117620 tv    clip         src=n34.wav muted=false ready=true delayMs=190
 117620 tv    speak        text=n34.wav voice=clip delayMs=190
 117713 tv    clip         src=n35.wav muted=false ready=true delayMs=190
 117713 tv    speak        text=n35.wav voice=clip delayMs=190
 117807 tv    clip         src=o67.wav muted=false ready=true delayMs=190
 117807 tv    speak        text=o67.wav voice=clip delayMs=190
 117904 tv    clip         src=g55.wav muted=false ready=true delayMs=190
 117904 tv    speak        text=g55.wav voice=clip delayMs=190
 117997 tv    clip         src=i26.wav muted=false ready=true delayMs=190
 117997 tv    speak        text=i26.wav voice=clip delayMs=190
 118090 tv    clip         src=i22.wav muted=false ready=true delayMs=190
 118090 tv    speak        text=i22.wav voice=clip delayMs=190
 118189 tv    clip         src=i29.wav muted=false ready=true delayMs=190
 118189 tv    speak        text=i29.wav voice=clip delayMs=190
 118280 tv    clip         src=o66.wav muted=false ready=true delayMs=190
 118280 tv    speak        text=o66.wav voice=clip delayMs=190
 118374 tv    clip         src=g51.wav muted=false ready=true delayMs=190
 118374 tv    speak        text=g51.wav voice=clip delayMs=190
 118469 tv    clip         src=g53.wav muted=false ready=true delayMs=190
 118469 tv    speak        text=g53.wav voice=clip delayMs=190
 118563 tv    clip         src=b9.wav muted=false ready=true delayMs=190
 118563 tv    speak        text=b9.wav voice=clip delayMs=190
 118657 tv    clip         src=n36.wav muted=false ready=true delayMs=190
 118657 tv    speak        text=n36.wav voice=clip delayMs=190
 118751 tv    clip         src=g52.wav muted=false ready=true delayMs=190
 118751 tv    speak        text=g52.wav voice=clip delayMs=190
 118861 tv    clip         src=b1.wav muted=false ready=true delayMs=190
 118861 tv    speak        text=b1.wav voice=clip delayMs=190
 118956 tv    clip         src=b13.wav muted=false ready=true delayMs=190
 118956 tv    speak        text=b13.wav voice=clip delayMs=190
 119049 tv    clip         src=n37.wav muted=false ready=true delayMs=190
 119049 tv    speak        text=n37.wav voice=clip delayMs=190
 119147 tv    clip         src=o71.wav muted=false ready=true delayMs=190
 119147 tv    speak        text=o71.wav voice=clip delayMs=190
 119239 tv    clip         src=b8.wav muted=false ready=true delayMs=190
 119239 tv    speak        text=b8.wav voice=clip delayMs=190
 119335 tv    clip         src=b5.wav muted=false ready=true delayMs=190
 119335 tv    speak        text=b5.wav voice=clip delayMs=190
 119447 tv    clip         src=b7.wav muted=false ready=true delayMs=190
 119447 tv    speak        text=b7.wav voice=clip delayMs=190
 119538 tv    clip         src=n42.wav muted=false ready=true delayMs=190
 119538 tv    speak        text=n42.wav voice=clip delayMs=190
 119636 tv    clip         src=i28.wav muted=false ready=true delayMs=190
 119636 tv    speak        text=i28.wav voice=clip delayMs=190
 119727 tv    clip         src=i27.wav muted=false ready=true delayMs=190
 119727 tv    speak        text=i27.wav voice=clip delayMs=190
 119807 tv    clip         src=o63.wav muted=false ready=true delayMs=190
 119807 tv    speak        text=o63.wav voice=clip delayMs=190
 119899 tv    clip         src=o64.wav muted=false ready=true delayMs=190
 119899 tv    speak        text=o64.wav voice=clip delayMs=190
 119979 tv    clip         src=o73.wav muted=false ready=true delayMs=190
 119979 tv    speak        text=o73.wav voice=clip delayMs=190
 120075 tv    clip         src=g50.wav muted=false ready=true delayMs=190
 120075 tv    speak        text=g50.wav voice=clip delayMs=190
 120179 tv    clip         src=g48.wav muted=false ready=true delayMs=190
 120179 tv    speak        text=g48.wav voice=clip delayMs=190
 120249 tv    clip         src=b12.wav muted=false ready=true delayMs=190
 120249 tv    speak        text=b12.wav voice=clip delayMs=190
 120356 tv    clip         src=n45.wav muted=false ready=true delayMs=190
 120356 tv    speak        text=n45.wav voice=clip delayMs=190
 120455 tv    clip         src=b4.wav muted=false ready=true delayMs=190
 120455 tv    speak        text=b4.wav voice=clip delayMs=190
 120558 tv    clip         src=g46.wav muted=false ready=true delayMs=190
 120558 tv    speak        text=g46.wav voice=clip delayMs=190
 120654 tv    clip         src=o74.wav muted=false ready=true delayMs=190
 120654 tv    speak        text=o74.wav voice=clip delayMs=190
 120729 tv    clip         src=g47.wav muted=false ready=true delayMs=190
 120729 tv    speak        text=g47.wav voice=clip delayMs=190
 120822 tv    clip         src=n31.wav muted=false ready=true delayMs=190
 120822 tv    speak        text=n31.wav voice=clip delayMs=190
 120917 tv    clip         src=o62.wav muted=false ready=true delayMs=190
 120917 tv    speak        text=o62.wav voice=clip delayMs=190
 121012 tv    clip         src=b10.wav muted=false ready=true delayMs=190
 121012 tv    speak        text=b10.wav voice=clip delayMs=190
 121105 tv    clip         src=g60.wav muted=false ready=true delayMs=190
 121105 tv    speak        text=g60.wav voice=clip delayMs=190
 121200 tv    clip         src=n38.wav muted=false ready=true delayMs=190
 121200 tv    speak        text=n38.wav voice=clip delayMs=190
 121294 tv    clip         src=n39.wav muted=false ready=true delayMs=190
 121294 tv    speak        text=n39.wav voice=clip delayMs=190
 121389 tv    clip         src=o70.wav muted=false ready=true delayMs=190
 121389 tv    speak        text=o70.wav voice=clip delayMs=190
 121481 tv    clip         src=b11.wav muted=false ready=true delayMs=190
 121481 tv    speak        text=b11.wav voice=clip delayMs=190
 121576 tv    clip         src=o75.wav muted=false ready=true delayMs=190
 121576 tv    speak        text=o75.wav voice=clip delayMs=190
 121674 tv    clip         src=g58.wav muted=false ready=true delayMs=190
 121674 tv    speak        text=g58.wav voice=clip delayMs=190
 121764 tv    clip         src=b15.wav muted=false ready=true delayMs=190
 121764 tv    speak        text=b15.wav voice=clip delayMs=190
 121860 tv    clip         src=i24.wav muted=false ready=true delayMs=190
 121860 tv    speak        text=i24.wav voice=clip delayMs=190
 121938 tv    clip         src=o72.wav muted=false ready=true delayMs=190
 121938 tv    speak        text=o72.wav voice=clip delayMs=190
 122033 tv    clip         src=g56.wav muted=false ready=true delayMs=190
 122033 tv    speak        text=g56.wav voice=clip delayMs=190
 122130 tv    clip         src=i20.wav muted=false ready=true delayMs=190
 122130 tv    speak        text=i20.wav voice=clip delayMs=190
 122205 tv    clip         src=n44.wav muted=false ready=true delayMs=190
 122205 tv    speak        text=n44.wav voice=clip delayMs=190
 122298 tv    clip         src=b3.wav muted=false ready=true delayMs=190
 122298 tv    speak        text=b3.wav voice=clip delayMs=190
 122397 tv    clip         src=o68.wav muted=false ready=true delayMs=190
 122397 tv    speak        text=o68.wav voice=clip delayMs=190
 122488 tv    clip         src=b2.wav muted=false ready=true delayMs=190
 122488 tv    speak        text=b2.wav voice=clip delayMs=190
 122570 tv    clip         src=n41.wav muted=false ready=true delayMs=190
 122570 tv    speak        text=n41.wav voice=clip delayMs=190
 122659 tv    clip         src=o65.wav muted=false ready=true delayMs=190
 122659 tv    speak        text=o65.wav voice=clip delayMs=190
 122737 tv    clip         src=i17.wav muted=false ready=true delayMs=190
 122737 tv    speak        text=i17.wav voice=clip delayMs=190
 122833 tv    clip         src=i25.wav muted=false ready=true delayMs=190
 122833 tv    speak        text=i25.wav voice=clip delayMs=190
 122930 tv    clip         src=i19.wav muted=false ready=true delayMs=190
 122930 tv    speak        text=i19.wav voice=clip delayMs=190
 123021 tv    clip         src=g57.wav muted=false ready=true delayMs=190
 123021 tv    speak        text=g57.wav voice=clip delayMs=190
 123102 tv    clip         src=g59.wav muted=false ready=true delayMs=190
 123102 tv    speak        text=g59.wav voice=clip delayMs=190
 123208 tv    clip         src=g49.wav muted=false ready=true delayMs=190
 123208 tv    speak        text=g49.wav voice=clip delayMs=190
 123302 tv    clip         src=n43.wav muted=false ready=true delayMs=190
 123302 tv    speak        text=n43.wav voice=clip delayMs=190
 123398 tv    clip         src=i16.wav muted=false ready=true delayMs=190
 123398 tv    speak        text=i16.wav voice=clip delayMs=190
 123498 tv    clip         src=n33.wav muted=false ready=true delayMs=190
 123498 tv    speak        text=n33.wav voice=clip delayMs=190
 123586 tv    clip         src=i23.wav muted=false ready=true delayMs=190
 123586 tv    speak        text=i23.wav voice=clip delayMs=190
 123695 tv    clip         src=g54.wav muted=false ready=true delayMs=190
 123695 tv    speak        text=g54.wav voice=clip delayMs=190
 123791 tv    clip         src=b14.wav muted=false ready=true delayMs=190
 123791 tv    speak        text=b14.wav voice=clip delayMs=190
 123982 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 125014 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 125270 tv    hush
 125270 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 125270 tv    hush
 132875 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 132880 tv    music:duck   ms=9000
 132880 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 137882 tv    hush
 137882 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 137882 tv    hush
 139444 tv    ss:cancel    speaking=false pending=false
 139444 tv    music:plan   from=game:bingo to=null
 139446 tv    ss:cancel    speaking=false pending=false
 139446 tv    music:plan   from=null to=lobby
 139446 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 140248 tv    music:stop   track=wallpaper.mp3
 141959 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 141969 tv    ss:cancel    speaking=false pending=false
 141971 tv    music:plan   from=lobby to=game:bingo
 141971 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 141971 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 141975 tv    hush
 141975 tv    hush
 142586 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 142772 tv    music:stop   track=bossa-antigua.mp3
 143976 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 144079 tv    ss:cancel    speaking=false pending=false
 144079 tv    music:plan   from=game:bingo to=null
 144079 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 145581 tv    music:stop   track=cool-vibes.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 146210 tv    ss:cancel    speaking=false pending=false
 146210 tv    music:plan   from=null to=lobby
 146210 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 149572 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 149582 tv    ss:cancel    speaking=false pending=false
 149584 tv    music:plan   from=lobby to=game:bingo
 149584 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 149584 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149587 tv    hush
 149588 tv    hush
 150014 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 150014 tv    speak        text=i21.wav voice=clip delayMs=190
 150015 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150206 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 150385 tv    music:stop   track=bossa-antigua.mp3
 150511 tv    ss:cancel    speaking=false pending=false
 150511 tv    music:plan   from=game:bingo to=null
 150514 tv    ss:cancel    speaking=false pending=false
 150514 tv    music:plan   from=null to=lobby
 150514 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 151316 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 156114 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156549 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156980 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157399 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157831 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158879 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 159473 tv    ss:cancel    speaking=false pending=false
 159475 tv    music:plan   from=lobby to=null
 159475 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 160726 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 160977 tv    music:stop   track=george-street-shuffle.mp3
 162331 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 163598 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 165019 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 166051 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 167091 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 169660 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 169852 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 170037 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 170215 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 171326 tv    ss:cancel    speaking=false pending=false
 171328 tv    ss:cancel    speaking=false pending=false
 171328 tv    music:plan   from=null to=lobby
 171328 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 173345 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 173354 tv    ss:cancel    speaking=false pending=false
 173355 tv    music:plan   from=lobby to=null
 173355 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 174856 tv    music:stop   track=airport-lounge.mp3
 174912 tv    music:plan   from=null to=game:broken-pencil
 174912 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 174912 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 176396 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 176871 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 177030 tv    music:plan   from=game:broken-pencil to=null
 177030 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 178531 tv    music:stop   track=hep-cats.mp3
```
