# Audio interaction trace

Captured 2026-09-18T16:14:13.054Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**54 / 54 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.4}]
```
   1773 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1802 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3112 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3247 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3939 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4578 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5430 tv    ss:cancel    speaking=false pending=false
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
   6271 tv    music:plan   from=lobby to=null
   6271 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7772 tv    music:stop   track=local-forecast-elevator.mp3
   8236 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9514 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16491 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17486 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18486 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19498 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20500 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21275 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22075 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22232 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22388 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22545 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22703 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22862 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23017 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23174 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23332 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23487 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23643 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23802 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23956 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24113 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24271 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24416 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24571 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24716 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24871 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25753 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26080 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27886 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29612 tv    ss:cancel    speaking=false pending=false
  29612 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]
```
  31156 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33325 tv    ss:cancel    speaking=false pending=false
  33325 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34875 tv    ss:cancel    speaking=false pending=false
  34875 tv    music:plan   from=null to=lobby
  34875 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken** 
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+959ms phone@+963ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls** 
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,silence,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,silence,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18.1}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5358ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5404ms cheer@+5368ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken** 
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=3 lastTickIdx=2
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]
```
  36447 tv    music:plan   from=lobby to=game:bingo
  36447 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36447 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36750 tv    hush         
  36752 tv    hush         
  37248 tv    music:stop   track=bossa-antigua.mp3
  37364 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38455 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39454 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40454 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41454 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  41454 tv    speak        text=b9.wav voice=clip delayMs=190
  41455 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41646 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43098 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  43098 tv    speak        text=b8.wav voice=clip delayMs=190
  43289 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44935 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  44935 tv    speak        text=n34.wav voice=clip delayMs=190
  45125 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46810 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47089 tv    hush         
  47089 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47090 tv    hush         
  52445 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  52447 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55452 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56453 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57454 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58448 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  58448 tv    speak        text=n35.wav voice=clip delayMs=190
  58645 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60227 tv    music:paused paused=true
  60227 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61475 tv    music:paused paused=false
  61476 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62757 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  62757 tv    speak        text=i25.wav voice=clip delayMs=190
  62870 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  62870 tv    speak        text=n45.wav voice=clip delayMs=190
  62994 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  62994 tv    speak        text=n33.wav voice=clip delayMs=190
  63116 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  63116 tv    speak        text=g49.wav voice=clip delayMs=190
  63250 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  63250 tv    speak        text=b4.wav voice=clip delayMs=190
  63370 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  63370 tv    speak        text=i20.wav voice=clip delayMs=190
  63500 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  63500 tv    speak        text=o69.wav voice=clip delayMs=190
  63621 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  63621 tv    speak        text=o67.wav voice=clip delayMs=190
  63746 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  63746 tv    speak        text=o65.wav voice=clip delayMs=190
  63876 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  63876 tv    speak        text=o73.wav voice=clip delayMs=190
  63998 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  63998 tv    speak        text=i21.wav voice=clip delayMs=190
  64122 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  64122 tv    speak        text=i18.wav voice=clip delayMs=190
  64251 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  64251 tv    speak        text=g58.wav voice=clip delayMs=190
  64373 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  64373 tv    speak        text=n36.wav voice=clip delayMs=190
  64503 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  64503 tv    speak        text=o61.wav voice=clip delayMs=190
  64624 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  64624 tv    speak        text=n37.wav voice=clip delayMs=190
  64730 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  64730 tv    speak        text=i16.wav voice=clip delayMs=190
  64854 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  64854 tv    speak        text=g47.wav voice=clip delayMs=190
  64980 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  64980 tv    speak        text=n41.wav voice=clip delayMs=190
  65109 tv    clip         src=b6.wav muted=false ready=true delayMs=190
  65109 tv    speak        text=b6.wav voice=clip delayMs=190
  65233 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  65233 tv    speak        text=o72.wav voice=clip delayMs=190
  65360 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  65360 tv    speak        text=b3.wav voice=clip delayMs=190
  65478 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  65478 tv    speak        text=i30.wav voice=clip delayMs=190
  65607 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  65607 tv    speak        text=g56.wav voice=clip delayMs=190
  65729 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  65729 tv    speak        text=o75.wav voice=clip delayMs=190
  65858 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  65858 tv    speak        text=b1.wav voice=clip delayMs=190
  65979 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  65979 tv    speak        text=b2.wav voice=clip delayMs=190
  66110 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  66110 tv    speak        text=n32.wav voice=clip delayMs=190
  66232 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  66232 tv    speak        text=g48.wav voice=clip delayMs=190
  66365 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  66365 tv    speak        text=i23.wav voice=clip delayMs=190
  66486 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  66486 tv    speak        text=i26.wav voice=clip delayMs=190
  66615 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  66615 tv    speak        text=o66.wav voice=clip delayMs=190
  66739 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  66739 tv    speak        text=i19.wav voice=clip delayMs=190
  66847 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  66847 tv    speak        text=n42.wav voice=clip delayMs=190
  66970 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  66970 tv    speak        text=i24.wav voice=clip delayMs=190
  67099 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  67099 tv    speak        text=n39.wav voice=clip delayMs=190
  67222 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  67222 tv    speak        text=g46.wav voice=clip delayMs=190
  67349 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  67349 tv    speak        text=n44.wav voice=clip delayMs=190
  67473 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  67473 tv    speak        text=b15.wav voice=clip delayMs=190
  67600 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  67600 tv    speak        text=b11.wav voice=clip delayMs=190
  67723 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  67723 tv    speak        text=g57.wav voice=clip delayMs=190
  67913 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  68343 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68629 tv    hush         
  68629 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68629 tv    hush         
  70503 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73987 tv    music:duck   ms=9000
  73987 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  78781 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79098 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80099 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81099 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82092 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  82092 tv    speak        text=g57.wav voice=clip delayMs=190
  82283 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84402 tv    ss:cancel    speaking=false pending=false
  84402 tv    music:plan   from=game:bingo to=null
  84405 tv    ss:cancel    speaking=false pending=false
  84405 tv    music:plan   from=null to=lobby
  84405 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  85207 tv    music:stop   track=wallpaper.mp3
  86925 tv    ss:cancel    speaking=false pending=false
  86935 tv    music:plan   from=lobby to=game:bingo
  86935 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  86935 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86938 tv    hush         
  86938 tv    hush         
  87550 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  87550 tv    speak        text=i21.wav voice=clip delayMs=190
  87551 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  87558 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  87558 tv    speak        text=n32.wav voice=clip delayMs=190
  87666 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  87666 tv    speak        text=i18.wav voice=clip delayMs=190
  87737 tv    music:stop   track=airport-lounge.mp3
  87744 tv    clip         src=n40.wav muted=false ready=true delayMs=190
  87744 tv    speak        text=n40.wav voice=clip delayMs=190
  87849 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  87849 tv    speak        text=i30.wav voice=clip delayMs=190
  87947 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  87947 tv    speak        text=o69.wav voice=clip delayMs=190
  88036 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  88036 tv    speak        text=o61.wav voice=clip delayMs=190
  88130 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  88130 tv    speak        text=n34.wav voice=clip delayMs=190
  88224 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  88224 tv    speak        text=n35.wav voice=clip delayMs=190
  88326 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  88326 tv    speak        text=o67.wav voice=clip delayMs=190
  88413 tv    clip         src=g55.wav muted=false ready=true delayMs=190
  88413 tv    speak        text=g55.wav voice=clip delayMs=190
  88509 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  88509 tv    speak        text=i26.wav voice=clip delayMs=190
  88603 tv    clip         src=i22.wav muted=false ready=true delayMs=190
  88603 tv    speak        text=i22.wav voice=clip delayMs=190
  88693 tv    clip         src=i29.wav muted=false ready=true delayMs=190
  88693 tv    speak        text=i29.wav voice=clip delayMs=190
  88789 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  88789 tv    speak        text=o66.wav voice=clip delayMs=190
  88884 tv    clip         src=g51.wav muted=false ready=true delayMs=190
  88884 tv    speak        text=g51.wav voice=clip delayMs=190
  88982 tv    clip         src=g53.wav muted=false ready=true delayMs=190
  88982 tv    speak        text=g53.wav voice=clip delayMs=190
  89061 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  89061 tv    speak        text=b9.wav voice=clip delayMs=190
  89158 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  89158 tv    speak        text=n36.wav voice=clip delayMs=190
  89246 tv    clip         src=g52.wav muted=false ready=true delayMs=190
  89246 tv    speak        text=g52.wav voice=clip delayMs=190
  89344 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  89344 tv    speak        text=b1.wav voice=clip delayMs=190
  89439 tv    clip         src=b13.wav muted=false ready=true delayMs=190
  89439 tv    speak        text=b13.wav voice=clip delayMs=190
  89528 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  89528 tv    speak        text=n37.wav voice=clip delayMs=190
  89625 tv    clip         src=o71.wav muted=false ready=true delayMs=190
  89625 tv    speak        text=o71.wav voice=clip delayMs=190
  89719 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  89719 tv    speak        text=b8.wav voice=clip delayMs=190
  89814 tv    clip         src=b5.wav muted=false ready=true delayMs=190
  89814 tv    speak        text=b5.wav voice=clip delayMs=190
  89906 tv    clip         src=b7.wav muted=false ready=true delayMs=190
  89906 tv    speak        text=b7.wav voice=clip delayMs=190
  90004 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  90004 tv    speak        text=n42.wav voice=clip delayMs=190
  90117 tv    clip         src=i28.wav muted=false ready=true delayMs=190
  90117 tv    speak        text=i28.wav voice=clip delayMs=190
  90210 tv    clip         src=i27.wav muted=false ready=true delayMs=190
  90210 tv    speak        text=i27.wav voice=clip delayMs=190
  90300 tv    clip         src=o63.wav muted=false ready=true delayMs=190
  90300 tv    speak        text=o63.wav voice=clip delayMs=190
  90394 tv    clip         src=o64.wav muted=false ready=true delayMs=190
  90394 tv    speak        text=o64.wav voice=clip delayMs=190
  90490 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  90490 tv    speak        text=o73.wav voice=clip delayMs=190
  90585 tv    clip         src=g50.wav muted=false ready=true delayMs=190
  90585 tv    speak        text=g50.wav voice=clip delayMs=190
  90694 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  90694 tv    speak        text=g48.wav voice=clip delayMs=190
  90789 tv    clip         src=b12.wav muted=false ready=true delayMs=190
  90789 tv    speak        text=b12.wav voice=clip delayMs=190
  90882 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  90882 tv    speak        text=n45.wav voice=clip delayMs=190
  90976 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  90976 tv    speak        text=b4.wav voice=clip delayMs=190
  91072 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  91072 tv    speak        text=g46.wav voice=clip delayMs=190
  91166 tv    clip         src=o74.wav muted=false ready=true delayMs=190
  91166 tv    speak        text=o74.wav voice=clip delayMs=190
  91259 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  91259 tv    speak        text=g47.wav voice=clip delayMs=190
  91354 tv    clip         src=n31.wav muted=false ready=true delayMs=190
  91354 tv    speak        text=n31.wav voice=clip delayMs=190
  91448 tv    clip         src=o62.wav muted=false ready=true delayMs=190
  91448 tv    speak        text=o62.wav voice=clip delayMs=190
  91542 tv    clip         src=b10.wav muted=false ready=true delayMs=190
  91542 tv    speak        text=b10.wav voice=clip delayMs=190
  91636 tv    clip         src=g60.wav muted=false ready=true delayMs=190
  91636 tv    speak        text=g60.wav voice=clip delayMs=190
  91730 tv    clip         src=n38.wav muted=false ready=true delayMs=190
  91730 tv    speak        text=n38.wav voice=clip delayMs=190
  91832 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  91832 tv    speak        text=n39.wav voice=clip delayMs=190
  91937 tv    clip         src=o70.wav muted=false ready=true delayMs=190
  91937 tv    speak        text=o70.wav voice=clip delayMs=190
  92030 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  92030 tv    speak        text=b11.wav voice=clip delayMs=190
  92126 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  92126 tv    speak        text=o75.wav voice=clip delayMs=190
  92220 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  92220 tv    speak        text=g58.wav voice=clip delayMs=190
  92311 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  92311 tv    speak        text=b15.wav voice=clip delayMs=190
  92407 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  92407 tv    speak        text=i24.wav voice=clip delayMs=190
  92504 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  92504 tv    speak        text=o72.wav voice=clip delayMs=190
  92584 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  92584 tv    speak        text=g56.wav voice=clip delayMs=190
  92677 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  92677 tv    speak        text=i20.wav voice=clip delayMs=190
  92786 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  92786 tv    speak        text=n44.wav voice=clip delayMs=190
  92876 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  92876 tv    speak        text=b3.wav voice=clip delayMs=190
  92957 tv    clip         src=o68.wav muted=false ready=true delayMs=190
  92957 tv    speak        text=o68.wav voice=clip delayMs=190
  93052 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  93052 tv    speak        text=b2.wav voice=clip delayMs=190
  93139 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  93139 tv    speak        text=n41.wav voice=clip delayMs=190
  93235 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  93235 tv    speak        text=o65.wav voice=clip delayMs=190
  93335 tv    clip         src=i17.wav muted=false ready=true delayMs=190
  93335 tv    speak        text=i17.wav voice=clip delayMs=190
  93420 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  93420 tv    speak        text=i25.wav voice=clip delayMs=190
  93522 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  93522 tv    speak        text=i19.wav voice=clip delayMs=190
  93612 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  93612 tv    speak        text=g57.wav voice=clip delayMs=190
  93703 tv    clip         src=g59.wav muted=false ready=true delayMs=190
  93703 tv    speak        text=g59.wav voice=clip delayMs=190
  93801 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  93801 tv    speak        text=g49.wav voice=clip delayMs=190
  93897 tv    clip         src=n43.wav muted=false ready=true delayMs=190
  93897 tv    speak        text=n43.wav voice=clip delayMs=190
  93984 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  93984 tv    speak        text=i16.wav voice=clip delayMs=190
  94080 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  94080 tv    speak        text=n33.wav voice=clip delayMs=190
  94172 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  94172 tv    speak        text=i23.wav voice=clip delayMs=190
  94271 tv    clip         src=g54.wav muted=false ready=true delayMs=190
  94271 tv    speak        text=g54.wav voice=clip delayMs=190
  94363 tv    clip         src=b14.wav muted=false ready=true delayMs=190
  94363 tv    speak        text=b14.wav voice=clip delayMs=190
  94555 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  95606 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95870 tv    hush         
  95870 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95871 tv    hush         
 103474 tv    music:duck   ms=9000
 103474 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108498 tv    hush         
 108498 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108498 tv    hush         
 112504 tv    ss:cancel    speaking=false pending=false
 112504 tv    music:plan   from=game:bingo to=null
 112504 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 114005 tv    music:stop   track=cool-vibes.mp3
 114084 tv    ss:cancel    speaking=false pending=false
 114084 tv    music:plan   from=null to=lobby
 114084 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 116602 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 116610 tv    ss:cancel    speaking=false pending=false
 116612 tv    music:plan   from=lobby to=game:bingo
 116612 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116612 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116616 tv    hush         
 116616 tv    hush         
 117230 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117414 tv    music:stop   track=george-street-shuffle.mp3
 118618 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 118771 tv    ss:cancel    speaking=false pending=false
 118771 tv    music:plan   from=game:bingo to=null
 118771 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 120273 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards** 
```
 120884 tv    ss:cancel    speaking=false pending=false
 120884 tv    music:plan   from=null to=lobby
 120884 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 124234 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 124244 tv    ss:cancel    speaking=false pending=false
 124247 tv    music:plan   from=lobby to=game:bingo
 124247 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 124247 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 124251 tv    hush         
 124252 tv    hush         
 124666 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 124666 tv    speak        text=i21.wav voice=clip delayMs=190
 124666 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 124858 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 125047 tv    music:stop   track=george-street-shuffle.mp3
 125169 tv    ss:cancel    speaking=false pending=false
 125169 tv    music:plan   from=game:bingo to=null
 125172 tv    ss:cancel    speaking=false pending=false
 125172 tv    music:plan   from=null to=lobby
 125172 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 125973 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally
```
 130755 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131189 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131603 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132020 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132456 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 133520 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 134122 tv    ss:cancel    speaking=false pending=false
 134127 tv    music:plan   from=lobby to=null
 134127 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 135378 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135630 tv    music:stop   track=bossa-antigua.mp3
 136971 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 138274 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 139576 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140614 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141676 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144225 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144414 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144588 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144780 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]
```
 145866 tv    ss:cancel    speaking=false pending=false
 145869 tv    ss:cancel    speaking=false pending=false
 145869 tv    music:plan   from=null to=lobby
 145869 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 147897 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 147905 tv    ss:cancel    speaking=false pending=false
 147907 tv    music:plan   from=lobby to=null
 147907 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149408 tv    music:stop   track=george-street-shuffle.mp3
 149468 tv    music:plan   from=null to=game:broken-pencil
 149468 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 149468 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150950 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151420 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151575 tv    music:plan   from=game:broken-pencil to=null
 151575 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 153076 tv    music:stop   track=backbay-lounge.mp3
```
