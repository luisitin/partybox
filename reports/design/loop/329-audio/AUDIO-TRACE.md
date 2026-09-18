# Audio interaction trace

Captured 2026-09-18T20:11:26.217Z on port 42166. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**56 / 56 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.4}]

```
   1747 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1772 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3084 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3220 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3914 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4536 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5388 tv    ss:cancel    speaking=false pending=false
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
   6242 tv    music:plan   from=lobby to=null
   6243 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7743 tv    music:stop   track=local-forecast-elevator.mp3
   8175 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9438 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16426 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17426 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18426 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19426 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20426 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21252 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22029 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22186 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22342 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22499 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22659 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22813 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22940 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23097 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23255 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23416 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23573 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23728 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23871 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24027 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24184 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24340 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24497 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24656 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24798 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25669 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  25999 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27809 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29530 tv    ss:cancel    speaking=false pending=false
  29530 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31081 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33233 tv    ss:cancel    speaking=false pending=false
  33233 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34782 tv    ss:cancel    speaking=false pending=false
  34782 tv    music:plan   from=null to=lobby
  34782 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":3}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+954ms phone@+970ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,silence,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,silence,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":18.1}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5355ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5404ms cheer@+5365ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36345 tv    music:plan   from=lobby to=game:bingo
  36345 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36345 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36648 tv    hush
  36648 tv    hush
  37145 tv    music:stop   track=bossa-antigua.mp3
  37259 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38349 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39350 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40349 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41356 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  41356 tv    speak        text=b9.wav voice=clip delayMs=190
  41357 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41548 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  42991 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  42991 tv    speak        text=b8.wav voice=clip delayMs=190
  43183 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44820 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  44820 tv    speak        text=n34.wav voice=clip delayMs=190
  45012 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46683 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  46949 tv    hush
  46949 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  46949 tv    hush
  52304 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  52306 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55313 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56314 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57314 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58319 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  58319 tv    speak        text=n35.wav voice=clip delayMs=190
  58511 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60100 tv    music:paused paused=true
  60100 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61350 tv    music:paused paused=false
  61350 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62655 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  62655 tv    speak        text=i25.wav voice=clip delayMs=190
  62781 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  62781 tv    speak        text=n45.wav voice=clip delayMs=190
  62906 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  62906 tv    speak        text=n33.wav voice=clip delayMs=190
  63032 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  63032 tv    speak        text=g49.wav voice=clip delayMs=190
  63158 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  63158 tv    speak        text=b4.wav voice=clip delayMs=190
  63286 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  63286 tv    speak        text=i20.wav voice=clip delayMs=190
  63412 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  63412 tv    speak        text=o69.wav voice=clip delayMs=190
  63537 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  63537 tv    speak        text=o67.wav voice=clip delayMs=190
  63665 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  63665 tv    speak        text=o65.wav voice=clip delayMs=190
  63790 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  63790 tv    speak        text=o73.wav voice=clip delayMs=190
  63900 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  63900 tv    speak        text=i21.wav voice=clip delayMs=190
  64028 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  64028 tv    speak        text=i18.wav voice=clip delayMs=190
  64153 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  64153 tv    speak        text=g58.wav voice=clip delayMs=190
  64279 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  64279 tv    speak        text=n36.wav voice=clip delayMs=190
  64406 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  64406 tv    speak        text=o61.wav voice=clip delayMs=190
  64532 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  64532 tv    speak        text=n37.wav voice=clip delayMs=190
  64658 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  64658 tv    speak        text=i16.wav voice=clip delayMs=190
  64784 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  64784 tv    speak        text=g47.wav voice=clip delayMs=190
  64908 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  64908 tv    speak        text=n41.wav voice=clip delayMs=190
  65036 tv    clip         src=b6.wav muted=false ready=true delayMs=190
  65036 tv    speak        text=b6.wav voice=clip delayMs=190
  65162 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  65162 tv    speak        text=o72.wav voice=clip delayMs=190
  65288 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  65288 tv    speak        text=b3.wav voice=clip delayMs=190
  65415 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  65415 tv    speak        text=i30.wav voice=clip delayMs=190
  65543 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  65543 tv    speak        text=g56.wav voice=clip delayMs=190
  65668 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  65668 tv    speak        text=o75.wav voice=clip delayMs=190
  65797 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  65797 tv    speak        text=b1.wav voice=clip delayMs=190
  65905 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  65905 tv    speak        text=b2.wav voice=clip delayMs=190
  66031 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  66031 tv    speak        text=n32.wav voice=clip delayMs=190
  66155 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  66155 tv    speak        text=g48.wav voice=clip delayMs=190
  66283 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  66283 tv    speak        text=i23.wav voice=clip delayMs=190
  66409 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  66409 tv    speak        text=i26.wav voice=clip delayMs=190
  66534 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  66534 tv    speak        text=o66.wav voice=clip delayMs=190
  66660 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  66660 tv    speak        text=i19.wav voice=clip delayMs=190
  66786 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  66786 tv    speak        text=n42.wav voice=clip delayMs=190
  66912 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  66912 tv    speak        text=i24.wav voice=clip delayMs=190
  67037 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  67037 tv    speak        text=n39.wav voice=clip delayMs=190
  67164 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  67164 tv    speak        text=g46.wav voice=clip delayMs=190
  67292 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  67292 tv    speak        text=n44.wav voice=clip delayMs=190
  67417 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  67417 tv    speak        text=b15.wav voice=clip delayMs=190
  67543 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  67543 tv    speak        text=b11.wav voice=clip delayMs=190
  67669 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  67669 tv    speak        text=g57.wav voice=clip delayMs=190
  67861 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  68282 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68557 tv    hush
  68557 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68557 tv    hush
  70437 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73912 tv    music:duck   ms=9000
  73912 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  78705 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79037 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80039 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81039 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82034 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  82034 tv    speak        text=g57.wav voice=clip delayMs=190
  82225 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84343 tv    ss:cancel    speaking=false pending=false
  84343 tv    music:plan   from=game:bingo to=null
  84346 tv    ss:cancel    speaking=false pending=false
  84346 tv    music:plan   from=null to=lobby
  84346 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  85147 tv    music:stop   track=cool-vibes.mp3
  86856 tv    ss:cancel    speaking=false pending=false
  86865 tv    music:plan   from=lobby to=game:bingo
  86865 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86865 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86869 tv    hush
  86869 tv    hush
  87480 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  87488 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  87488 tv    speak        text=i21.wav voice=clip delayMs=190
  87495 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  87495 tv    speak        text=n32.wav voice=clip delayMs=190
  87598 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  87598 tv    speak        text=i18.wav voice=clip delayMs=190
  87666 tv    music:stop   track=airport-lounge.mp3
  87677 tv    clip         src=n40.wav muted=false ready=true delayMs=190
  87677 tv    speak        text=n40.wav voice=clip delayMs=190
  87773 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  87773 tv    speak        text=i30.wav voice=clip delayMs=190
  87866 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  87866 tv    speak        text=o69.wav voice=clip delayMs=190
  87961 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  87961 tv    speak        text=o61.wav voice=clip delayMs=190
  88055 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  88055 tv    speak        text=n34.wav voice=clip delayMs=190
  88152 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  88152 tv    speak        text=n35.wav voice=clip delayMs=190
  88246 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  88246 tv    speak        text=o67.wav voice=clip delayMs=190
  88340 tv    clip         src=g55.wav muted=false ready=true delayMs=190
  88340 tv    speak        text=g55.wav voice=clip delayMs=190
  88434 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  88434 tv    speak        text=i26.wav voice=clip delayMs=190
  88529 tv    clip         src=i22.wav muted=false ready=true delayMs=190
  88529 tv    speak        text=i22.wav voice=clip delayMs=190
  88624 tv    clip         src=i29.wav muted=false ready=true delayMs=190
  88624 tv    speak        text=i29.wav voice=clip delayMs=190
  88719 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  88719 tv    speak        text=o66.wav voice=clip delayMs=190
  88813 tv    clip         src=g51.wav muted=false ready=true delayMs=190
  88813 tv    speak        text=g51.wav voice=clip delayMs=190
  88894 tv    clip         src=g53.wav muted=false ready=true delayMs=190
  88894 tv    speak        text=g53.wav voice=clip delayMs=190
  88988 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  88988 tv    speak        text=b9.wav voice=clip delayMs=190
  89086 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  89086 tv    speak        text=n36.wav voice=clip delayMs=190
  89165 tv    clip         src=g52.wav muted=false ready=true delayMs=190
  89165 tv    speak        text=g52.wav voice=clip delayMs=190
  89272 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  89272 tv    speak        text=b1.wav voice=clip delayMs=190
  89354 tv    clip         src=b13.wav muted=false ready=true delayMs=190
  89354 tv    speak        text=b13.wav voice=clip delayMs=190
  89446 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  89446 tv    speak        text=n37.wav voice=clip delayMs=190
  89542 tv    clip         src=o71.wav muted=false ready=true delayMs=190
  89542 tv    speak        text=o71.wav voice=clip delayMs=190
  89636 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  89636 tv    speak        text=b8.wav voice=clip delayMs=190
  89746 tv    clip         src=b5.wav muted=false ready=true delayMs=190
  89746 tv    speak        text=b5.wav voice=clip delayMs=190
  89841 tv    clip         src=b7.wav muted=false ready=true delayMs=190
  89841 tv    speak        text=b7.wav voice=clip delayMs=190
  89922 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  89922 tv    speak        text=n42.wav voice=clip delayMs=190
  90015 tv    clip         src=i28.wav muted=false ready=true delayMs=190
  90015 tv    speak        text=i28.wav voice=clip delayMs=190
  90108 tv    clip         src=i27.wav muted=false ready=true delayMs=190
  90108 tv    speak        text=i27.wav voice=clip delayMs=190
  90193 tv    clip         src=o63.wav muted=false ready=true delayMs=190
  90193 tv    speak        text=o63.wav voice=clip delayMs=190
  90299 tv    clip         src=o64.wav muted=false ready=true delayMs=190
  90299 tv    speak        text=o64.wav voice=clip delayMs=190
  90393 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  90393 tv    speak        text=o73.wav voice=clip delayMs=190
  90487 tv    clip         src=g50.wav muted=false ready=true delayMs=190
  90487 tv    speak        text=g50.wav voice=clip delayMs=190
  90581 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  90581 tv    speak        text=g48.wav voice=clip delayMs=190
  90676 tv    clip         src=b12.wav muted=false ready=true delayMs=190
  90676 tv    speak        text=b12.wav voice=clip delayMs=190
  90764 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  90764 tv    speak        text=n45.wav voice=clip delayMs=190
  90865 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  90865 tv    speak        text=b4.wav voice=clip delayMs=190
  90944 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  90944 tv    speak        text=g46.wav voice=clip delayMs=190
  91036 tv    clip         src=o74.wav muted=false ready=true delayMs=190
  91036 tv    speak        text=o74.wav voice=clip delayMs=190
  91131 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  91131 tv    speak        text=g47.wav voice=clip delayMs=190
  91230 tv    clip         src=n31.wav muted=false ready=true delayMs=190
  91230 tv    speak        text=n31.wav voice=clip delayMs=190
  91322 tv    clip         src=o62.wav muted=false ready=true delayMs=190
  91322 tv    speak        text=o62.wav voice=clip delayMs=190
  91417 tv    clip         src=b10.wav muted=false ready=true delayMs=190
  91417 tv    speak        text=b10.wav voice=clip delayMs=190
  91512 tv    clip         src=g60.wav muted=false ready=true delayMs=190
  91512 tv    speak        text=g60.wav voice=clip delayMs=190
  91605 tv    clip         src=n38.wav muted=false ready=true delayMs=190
  91605 tv    speak        text=n38.wav voice=clip delayMs=190
  91692 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  91692 tv    speak        text=n39.wav voice=clip delayMs=190
  91794 tv    clip         src=o70.wav muted=false ready=true delayMs=190
  91794 tv    speak        text=o70.wav voice=clip delayMs=190
  91889 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  91889 tv    speak        text=b11.wav voice=clip delayMs=190
  92001 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  92001 tv    speak        text=o75.wav voice=clip delayMs=190
  92101 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  92101 tv    speak        text=g58.wav voice=clip delayMs=190
  92189 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  92189 tv    speak        text=b15.wav voice=clip delayMs=190
  92286 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  92286 tv    speak        text=i24.wav voice=clip delayMs=190
  92379 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  92379 tv    speak        text=o72.wav voice=clip delayMs=190
  92474 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  92474 tv    speak        text=g56.wav voice=clip delayMs=190
  92569 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  92569 tv    speak        text=i20.wav voice=clip delayMs=190
  92662 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  92662 tv    speak        text=n44.wav voice=clip delayMs=190
  92745 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  92745 tv    speak        text=b3.wav voice=clip delayMs=190
  92836 tv    clip         src=o68.wav muted=false ready=true delayMs=190
  92836 tv    speak        text=o68.wav voice=clip delayMs=190
  92931 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  92931 tv    speak        text=b2.wav voice=clip delayMs=190
  93025 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  93025 tv    speak        text=n41.wav voice=clip delayMs=190
  93121 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  93121 tv    speak        text=o65.wav voice=clip delayMs=190
  93215 tv    clip         src=i17.wav muted=false ready=true delayMs=190
  93215 tv    speak        text=i17.wav voice=clip delayMs=190
  93310 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  93310 tv    speak        text=i25.wav voice=clip delayMs=190
  93404 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  93404 tv    speak        text=i19.wav voice=clip delayMs=190
  93500 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  93500 tv    speak        text=g57.wav voice=clip delayMs=190
  93594 tv    clip         src=g59.wav muted=false ready=true delayMs=190
  93594 tv    speak        text=g59.wav voice=clip delayMs=190
  93692 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  93692 tv    speak        text=g49.wav voice=clip delayMs=190
  93784 tv    clip         src=n43.wav muted=false ready=true delayMs=190
  93784 tv    speak        text=n43.wav voice=clip delayMs=190
  93878 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  93878 tv    speak        text=i16.wav voice=clip delayMs=190
  93974 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  93974 tv    speak        text=n33.wav voice=clip delayMs=190
  94069 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  94069 tv    speak        text=i23.wav voice=clip delayMs=190
  94162 tv    clip         src=g54.wav muted=false ready=true delayMs=190
  94162 tv    speak        text=g54.wav voice=clip delayMs=190
  94257 tv    clip         src=b14.wav muted=false ready=true delayMs=190
  94257 tv    speak        text=b14.wav voice=clip delayMs=190
  94448 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  95497 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95762 tv    hush
  95762 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95762 tv    hush
 103368 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 103371 tv    music:duck   ms=9000
 103371 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108369 tv    hush
 108370 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108370 tv    hush
 112371 tv    ss:cancel    speaking=false pending=false
 112371 tv    music:plan   from=game:bingo to=null
 112371 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113873 tv    music:stop   track=wallpaper.mp3
 113976 tv    ss:cancel    speaking=false pending=false
 113976 tv    music:plan   from=null to=lobby
 113976 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 116498 tv    ss:cancel    speaking=false pending=false
 116506 tv    music:plan   from=lobby to=game:bingo
 116506 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116506 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116509 tv    hush
 116510 tv    hush
 117121 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117129 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 117129 tv    speak        text=i21.wav voice=clip delayMs=190
 117142 tv    clip         src=n32.wav muted=false ready=true delayMs=190
 117142 tv    speak        text=n32.wav voice=clip delayMs=190
 117239 tv    clip         src=i18.wav muted=false ready=true delayMs=190
 117239 tv    speak        text=i18.wav voice=clip delayMs=190
 117307 tv    music:stop   track=george-street-shuffle.mp3
 117316 tv    clip         src=n40.wav muted=false ready=true delayMs=190
 117316 tv    speak        text=n40.wav voice=clip delayMs=190
 117409 tv    clip         src=i30.wav muted=false ready=true delayMs=190
 117409 tv    speak        text=i30.wav voice=clip delayMs=190
 117507 tv    clip         src=o69.wav muted=false ready=true delayMs=190
 117507 tv    speak        text=o69.wav voice=clip delayMs=190
 117600 tv    clip         src=o61.wav muted=false ready=true delayMs=190
 117600 tv    speak        text=o61.wav voice=clip delayMs=190
 117695 tv    clip         src=n34.wav muted=false ready=true delayMs=190
 117695 tv    speak        text=n34.wav voice=clip delayMs=190
 117788 tv    clip         src=n35.wav muted=false ready=true delayMs=190
 117788 tv    speak        text=n35.wav voice=clip delayMs=190
 117888 tv    clip         src=o67.wav muted=false ready=true delayMs=190
 117888 tv    speak        text=o67.wav voice=clip delayMs=190
 117979 tv    clip         src=g55.wav muted=false ready=true delayMs=190
 117979 tv    speak        text=g55.wav voice=clip delayMs=190
 118072 tv    clip         src=i26.wav muted=false ready=true delayMs=190
 118072 tv    speak        text=i26.wav voice=clip delayMs=190
 118168 tv    clip         src=i22.wav muted=false ready=true delayMs=190
 118168 tv    speak        text=i22.wav voice=clip delayMs=190
 118261 tv    clip         src=i29.wav muted=false ready=true delayMs=190
 118261 tv    speak        text=i29.wav voice=clip delayMs=190
 118357 tv    clip         src=o66.wav muted=false ready=true delayMs=190
 118357 tv    speak        text=o66.wav voice=clip delayMs=190
 118451 tv    clip         src=g51.wav muted=false ready=true delayMs=190
 118451 tv    speak        text=g51.wav voice=clip delayMs=190
 118547 tv    clip         src=g53.wav muted=false ready=true delayMs=190
 118547 tv    speak        text=g53.wav voice=clip delayMs=190
 118642 tv    clip         src=b9.wav muted=false ready=true delayMs=190
 118642 tv    speak        text=b9.wav voice=clip delayMs=190
 118737 tv    clip         src=n36.wav muted=false ready=true delayMs=190
 118737 tv    speak        text=n36.wav voice=clip delayMs=190
 118831 tv    clip         src=g52.wav muted=false ready=true delayMs=190
 118831 tv    speak        text=g52.wav voice=clip delayMs=190
 118925 tv    clip         src=b1.wav muted=false ready=true delayMs=190
 118925 tv    speak        text=b1.wav voice=clip delayMs=190
 119021 tv    clip         src=b13.wav muted=false ready=true delayMs=190
 119021 tv    speak        text=b13.wav voice=clip delayMs=190
 119118 tv    clip         src=n37.wav muted=false ready=true delayMs=190
 119118 tv    speak        text=n37.wav voice=clip delayMs=190
 119209 tv    clip         src=o71.wav muted=false ready=true delayMs=190
 119209 tv    speak        text=o71.wav voice=clip delayMs=190
 119304 tv    clip         src=b8.wav muted=false ready=true delayMs=190
 119304 tv    speak        text=b8.wav voice=clip delayMs=190
 119403 tv    clip         src=b5.wav muted=false ready=true delayMs=190
 119403 tv    speak        text=b5.wav voice=clip delayMs=190
 119496 tv    clip         src=b7.wav muted=false ready=true delayMs=190
 119496 tv    speak        text=b7.wav voice=clip delayMs=190
 119588 tv    clip         src=n42.wav muted=false ready=true delayMs=190
 119588 tv    speak        text=n42.wav voice=clip delayMs=190
 119683 tv    clip         src=i28.wav muted=false ready=true delayMs=190
 119683 tv    speak        text=i28.wav voice=clip delayMs=190
 119766 tv    clip         src=i27.wav muted=false ready=true delayMs=190
 119766 tv    speak        text=i27.wav voice=clip delayMs=190
 119875 tv    clip         src=o63.wav muted=false ready=true delayMs=190
 119875 tv    speak        text=o63.wav voice=clip delayMs=190
 119966 tv    clip         src=o64.wav muted=false ready=true delayMs=190
 119966 tv    speak        text=o64.wav voice=clip delayMs=190
 120048 tv    clip         src=o73.wav muted=false ready=true delayMs=190
 120048 tv    speak        text=o73.wav voice=clip delayMs=190
 120140 tv    clip         src=g50.wav muted=false ready=true delayMs=190
 120140 tv    speak        text=g50.wav voice=clip delayMs=190
 120236 tv    clip         src=g48.wav muted=false ready=true delayMs=190
 120236 tv    speak        text=g48.wav voice=clip delayMs=190
 120331 tv    clip         src=b12.wav muted=false ready=true delayMs=190
 120331 tv    speak        text=b12.wav voice=clip delayMs=190
 120420 tv    clip         src=n45.wav muted=false ready=true delayMs=190
 120420 tv    speak        text=n45.wav voice=clip delayMs=190
 120524 tv    clip         src=b4.wav muted=false ready=true delayMs=190
 120524 tv    speak        text=b4.wav voice=clip delayMs=190
 120619 tv    clip         src=g46.wav muted=false ready=true delayMs=190
 120619 tv    speak        text=g46.wav voice=clip delayMs=190
 120710 tv    clip         src=o74.wav muted=false ready=true delayMs=190
 120710 tv    speak        text=o74.wav voice=clip delayMs=190
 120804 tv    clip         src=g47.wav muted=false ready=true delayMs=190
 120804 tv    speak        text=g47.wav voice=clip delayMs=190
 120902 tv    clip         src=n31.wav muted=false ready=true delayMs=190
 120902 tv    speak        text=n31.wav voice=clip delayMs=190
 120979 tv    clip         src=o62.wav muted=false ready=true delayMs=190
 120979 tv    speak        text=o62.wav voice=clip delayMs=190
 121075 tv    clip         src=b10.wav muted=false ready=true delayMs=190
 121075 tv    speak        text=b10.wav voice=clip delayMs=190
 121169 tv    clip         src=g60.wav muted=false ready=true delayMs=190
 121169 tv    speak        text=g60.wav voice=clip delayMs=190
 121268 tv    clip         src=n38.wav muted=false ready=true delayMs=190
 121268 tv    speak        text=n38.wav voice=clip delayMs=190
 121359 tv    clip         src=n39.wav muted=false ready=true delayMs=190
 121359 tv    speak        text=n39.wav voice=clip delayMs=190
 121454 tv    clip         src=o70.wav muted=false ready=true delayMs=190
 121454 tv    speak        text=o70.wav voice=clip delayMs=190
 121564 tv    clip         src=b11.wav muted=false ready=true delayMs=190
 121564 tv    speak        text=b11.wav voice=clip delayMs=190
 121659 tv    clip         src=o75.wav muted=false ready=true delayMs=190
 121659 tv    speak        text=o75.wav voice=clip delayMs=190
 121752 tv    clip         src=g58.wav muted=false ready=true delayMs=190
 121752 tv    speak        text=g58.wav voice=clip delayMs=190
 121849 tv    clip         src=b15.wav muted=false ready=true delayMs=190
 121849 tv    speak        text=b15.wav voice=clip delayMs=190
 121943 tv    clip         src=i24.wav muted=false ready=true delayMs=190
 121943 tv    speak        text=i24.wav voice=clip delayMs=190
 122037 tv    clip         src=o72.wav muted=false ready=true delayMs=190
 122037 tv    speak        text=o72.wav voice=clip delayMs=190
 122133 tv    clip         src=g56.wav muted=false ready=true delayMs=190
 122133 tv    speak        text=g56.wav voice=clip delayMs=190
 122230 tv    clip         src=i20.wav muted=false ready=true delayMs=190
 122230 tv    speak        text=i20.wav voice=clip delayMs=190
 122326 tv    clip         src=n44.wav muted=false ready=true delayMs=190
 122326 tv    speak        text=n44.wav voice=clip delayMs=190
 122420 tv    clip         src=b3.wav muted=false ready=true delayMs=190
 122420 tv    speak        text=b3.wav voice=clip delayMs=190
 122514 tv    clip         src=o68.wav muted=false ready=true delayMs=190
 122514 tv    speak        text=o68.wav voice=clip delayMs=190
 122609 tv    clip         src=b2.wav muted=false ready=true delayMs=190
 122609 tv    speak        text=b2.wav voice=clip delayMs=190
 122707 tv    clip         src=n41.wav muted=false ready=true delayMs=190
 122707 tv    speak        text=n41.wav voice=clip delayMs=190
 122797 tv    clip         src=o65.wav muted=false ready=true delayMs=190
 122797 tv    speak        text=o65.wav voice=clip delayMs=190
 122892 tv    clip         src=i17.wav muted=false ready=true delayMs=190
 122892 tv    speak        text=i17.wav voice=clip delayMs=190
 122971 tv    clip         src=i25.wav muted=false ready=true delayMs=190
 122971 tv    speak        text=i25.wav voice=clip delayMs=190
 123065 tv    clip         src=i19.wav muted=false ready=true delayMs=190
 123065 tv    speak        text=i19.wav voice=clip delayMs=190
 123160 tv    clip         src=g57.wav muted=false ready=true delayMs=190
 123160 tv    speak        text=g57.wav voice=clip delayMs=190
 123269 tv    clip         src=g59.wav muted=false ready=true delayMs=190
 123269 tv    speak        text=g59.wav voice=clip delayMs=190
 123351 tv    clip         src=g49.wav muted=false ready=true delayMs=190
 123351 tv    speak        text=g49.wav voice=clip delayMs=190
 123444 tv    clip         src=n43.wav muted=false ready=true delayMs=190
 123444 tv    speak        text=n43.wav voice=clip delayMs=190
 123539 tv    clip         src=i16.wav muted=false ready=true delayMs=190
 123539 tv    speak        text=i16.wav voice=clip delayMs=190
 123634 tv    clip         src=n33.wav muted=false ready=true delayMs=190
 123634 tv    speak        text=n33.wav voice=clip delayMs=190
 123730 tv    clip         src=i23.wav muted=false ready=true delayMs=190
 123730 tv    speak        text=i23.wav voice=clip delayMs=190
 123823 tv    clip         src=g54.wav muted=false ready=true delayMs=190
 123823 tv    speak        text=g54.wav voice=clip delayMs=190
 123917 tv    clip         src=b14.wav muted=false ready=true delayMs=190
 123917 tv    speak        text=b14.wav voice=clip delayMs=190
 124108 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 125162 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 125431 tv    hush
 125431 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 125431 tv    hush
 133035 tv    music:duck   ms=9000
 133035 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 138056 tv    hush
 138056 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 138057 tv    hush
 139609 tv    ss:cancel    speaking=false pending=false
 139609 tv    music:plan   from=game:bingo to=null
 139611 tv    ss:cancel    speaking=false pending=false
 139611 tv    music:plan   from=null to=lobby
 139611 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 140413 tv    music:stop   track=wallpaper.mp3
 142119 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 142127 tv    ss:cancel    speaking=false pending=false
 142129 tv    music:plan   from=lobby to=game:bingo
 142130 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 142130 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 142133 tv    hush
 142133 tv    hush
 142745 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 142930 tv    music:stop   track=local-forecast-elevator.mp3
 144135 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 144277 tv    ss:cancel    speaking=false pending=false
 144277 tv    music:plan   from=game:bingo to=null
 144277 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 145778 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 146408 tv    ss:cancel    speaking=false pending=false
 146408 tv    music:plan   from=null to=lobby
 146408 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 149765 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 149777 tv    ss:cancel    speaking=false pending=false
 149778 tv    music:plan   from=lobby to=game:bingo
 149778 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 149779 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149782 tv    hush
 149782 tv    hush
 150195 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 150195 tv    speak        text=i21.wav voice=clip delayMs=190
 150195 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150386 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 150580 tv    music:stop   track=george-street-shuffle.mp3
 150693 tv    ss:cancel    speaking=false pending=false
 150693 tv    music:plan   from=game:bingo to=null
 150696 tv    ss:cancel    speaking=false pending=false
 150696 tv    music:plan   from=null to=lobby
 150696 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 151497 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 156277 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156693 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157109 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157543 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157977 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 159060 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 159666 tv    ss:cancel    speaking=false pending=false
 159670 tv    music:plan   from=lobby to=null
 159670 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 160923 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 161171 tv    music:stop   track=george-street-shuffle.mp3
 162529 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 163945 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 165362 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 166381 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 167434 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 170001 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 170190 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 170380 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 170568 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 171672 tv    ss:cancel    speaking=false pending=false
 171675 tv    ss:cancel    speaking=false pending=false
 171675 tv    music:plan   from=null to=lobby
 171675 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 173687 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 173696 tv    ss:cancel    speaking=false pending=false
 173698 tv    music:plan   from=lobby to=null
 173698 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 175198 tv    music:stop   track=airport-lounge.mp3
 175246 tv    music:plan   from=null to=game:broken-pencil
 175246 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 175246 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 176735 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 177211 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 177370 tv    music:plan   from=game:broken-pencil to=null
 177370 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 178870 tv    music:stop   track=hep-cats.mp3
```
