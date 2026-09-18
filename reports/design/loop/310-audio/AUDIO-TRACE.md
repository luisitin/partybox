# Audio interaction trace

Captured 2026-09-18T16:06:58.483Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**54 / 54 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.4}]

```
   1832 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1863 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3187 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3322 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   4018 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4642 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5494 tv    ss:cancel    speaking=false pending=false
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
   6337 tv    music:plan   from=lobby to=null
   6337 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7845 tv    music:stop   track=local-forecast-elevator.mp3
   8282 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9575 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16537 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17545 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18539 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19534 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20544 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21342 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22146 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22304 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22459 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22615 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22771 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22931 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23086 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23245 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23404 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23559 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23716 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23874 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24033 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24190 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24348 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24506 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24662 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24818 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24976 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25858 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26189 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27992 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29733 tv    ss:cancel    speaking=false pending=false
  29733 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31283 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33417 tv    ss:cancel    speaking=false pending=false
  33417 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34967 tv    ss:cancel    speaking=false pending=false
  34967 tv    music:plan   from=null to=lobby
  34967 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+960ms phone@+979ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5354ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5396ms cheer@+5366ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=3 lastTickIdx=2
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36537 tv    music:plan   from=lobby to=game:bingo
  36537 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36537 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36843 tv    hush
  36843 tv    hush
  37338 tv    music:stop   track=bossa-antigua.mp3
  37454 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38544 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39544 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40546 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41551 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  41551 tv    speak        text=b9.wav voice=clip delayMs=190
  41551 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41742 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43189 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  43189 tv    speak        text=b8.wav voice=clip delayMs=190
  43381 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45021 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  45021 tv    speak        text=n34.wav voice=clip delayMs=190
  45212 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46903 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47170 tv    hush
  47171 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47171 tv    hush
  52524 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55540 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56541 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57541 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58539 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  58539 tv    speak        text=n35.wav voice=clip delayMs=190
  58730 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60323 tv    music:paused paused=true
  60323 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61570 tv    music:paused paused=false
  61570 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62881 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  62881 tv    speak        text=i25.wav voice=clip delayMs=190
  63005 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  63005 tv    speak        text=n45.wav voice=clip delayMs=190
  63132 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  63132 tv    speak        text=n33.wav voice=clip delayMs=190
  63239 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  63239 tv    speak        text=g49.wav voice=clip delayMs=190
  63363 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  63363 tv    speak        text=b4.wav voice=clip delayMs=190
  63488 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  63488 tv    speak        text=i20.wav voice=clip delayMs=190
  63611 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  63611 tv    speak        text=o69.wav voice=clip delayMs=190
  63737 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  63737 tv    speak        text=o67.wav voice=clip delayMs=190
  63865 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  63865 tv    speak        text=o65.wav voice=clip delayMs=190
  63991 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  63991 tv    speak        text=o73.wav voice=clip delayMs=190
  64099 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  64099 tv    speak        text=i21.wav voice=clip delayMs=190
  64229 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  64229 tv    speak        text=i18.wav voice=clip delayMs=190
  64350 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  64350 tv    speak        text=g58.wav voice=clip delayMs=190
  64478 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  64478 tv    speak        text=n36.wav voice=clip delayMs=190
  64602 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  64602 tv    speak        text=o61.wav voice=clip delayMs=190
  64728 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  64728 tv    speak        text=n37.wav voice=clip delayMs=190
  64847 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  64847 tv    speak        text=i16.wav voice=clip delayMs=190
  64976 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  64976 tv    speak        text=g47.wav voice=clip delayMs=190
  65099 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  65099 tv    speak        text=n41.wav voice=clip delayMs=190
  65229 tv    clip         src=b6.wav muted=false ready=true delayMs=190
  65229 tv    speak        text=b6.wav voice=clip delayMs=190
  65349 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  65349 tv    speak        text=o72.wav voice=clip delayMs=190
  65474 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  65474 tv    speak        text=b3.wav voice=clip delayMs=190
  65599 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  65599 tv    speak        text=i30.wav voice=clip delayMs=190
  65722 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  65722 tv    speak        text=g56.wav voice=clip delayMs=190
  65848 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  65848 tv    speak        text=o75.wav voice=clip delayMs=190
  65974 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  65974 tv    speak        text=b1.wav voice=clip delayMs=190
  66079 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  66079 tv    speak        text=b2.wav voice=clip delayMs=190
  66211 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  66211 tv    speak        text=n32.wav voice=clip delayMs=190
  66330 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  66330 tv    speak        text=g48.wav voice=clip delayMs=190
  66461 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  66461 tv    speak        text=i23.wav voice=clip delayMs=190
  66562 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  66562 tv    speak        text=i26.wav voice=clip delayMs=190
  66685 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  66685 tv    speak        text=o66.wav voice=clip delayMs=190
  66811 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  66811 tv    speak        text=i19.wav voice=clip delayMs=190
  66935 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  66935 tv    speak        text=n42.wav voice=clip delayMs=190
  67064 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  67064 tv    speak        text=i24.wav voice=clip delayMs=190
  67190 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  67190 tv    speak        text=n39.wav voice=clip delayMs=190
  67313 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  67313 tv    speak        text=g46.wav voice=clip delayMs=190
  67439 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  67439 tv    speak        text=n44.wav voice=clip delayMs=190
  67569 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  67570 tv    speak        text=b15.wav voice=clip delayMs=190
  67694 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  67694 tv    speak        text=b11.wav voice=clip delayMs=190
  67817 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  67817 tv    speak        text=g57.wav voice=clip delayMs=190
  68008 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  68435 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68727 tv    hush
  68727 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68727 tv    hush
  70602 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  74081 tv    music:duck   ms=9000
  74081 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  78873 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79197 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80199 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81199 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82194 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  82194 tv    speak        text=g57.wav voice=clip delayMs=190
  82385 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84511 tv    ss:cancel    speaking=false pending=false
  84511 tv    music:plan   from=game:bingo to=null
  84515 tv    ss:cancel    speaking=false pending=false
  84515 tv    music:plan   from=null to=lobby
  84515 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  85316 tv    music:stop   track=cool-vibes.mp3
  87038 tv    ss:cancel    speaking=false pending=false
  87047 tv    music:plan   from=lobby to=game:bingo
  87047 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  87047 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  87050 tv    hush
  87051 tv    hush
  87662 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  87662 tv    speak        text=i21.wav voice=clip delayMs=190
  87663 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  87671 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  87671 tv    speak        text=n32.wav voice=clip delayMs=190
  87773 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  87773 tv    speak        text=i18.wav voice=clip delayMs=190
  87848 tv    music:stop   track=bossa-antigua.mp3
  87854 tv    clip         src=n40.wav muted=false ready=true delayMs=190
  87854 tv    speak        text=n40.wav voice=clip delayMs=190
  87962 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  87962 tv    speak        text=i30.wav voice=clip delayMs=190
  88057 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  88057 tv    speak        text=o69.wav voice=clip delayMs=190
  88153 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  88153 tv    speak        text=o61.wav voice=clip delayMs=190
  88247 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  88247 tv    speak        text=n34.wav voice=clip delayMs=190
  88342 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  88342 tv    speak        text=n35.wav voice=clip delayMs=190
  88436 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  88436 tv    speak        text=o67.wav voice=clip delayMs=190
  88532 tv    clip         src=g55.wav muted=false ready=true delayMs=190
  88532 tv    speak        text=g55.wav voice=clip delayMs=190
  88627 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  88627 tv    speak        text=i26.wav voice=clip delayMs=190
  88723 tv    clip         src=i22.wav muted=false ready=true delayMs=190
  88723 tv    speak        text=i22.wav voice=clip delayMs=190
  88818 tv    clip         src=i29.wav muted=false ready=true delayMs=190
  88818 tv    speak        text=i29.wav voice=clip delayMs=190
  88913 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  88913 tv    speak        text=o66.wav voice=clip delayMs=190
  89008 tv    clip         src=g51.wav muted=false ready=true delayMs=190
  89008 tv    speak        text=g51.wav voice=clip delayMs=190
  89103 tv    clip         src=g53.wav muted=false ready=true delayMs=190
  89103 tv    speak        text=g53.wav voice=clip delayMs=190
  89197 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  89197 tv    speak        text=b9.wav voice=clip delayMs=190
  89291 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  89291 tv    speak        text=n36.wav voice=clip delayMs=190
  89387 tv    clip         src=g52.wav muted=false ready=true delayMs=190
  89387 tv    speak        text=g52.wav voice=clip delayMs=190
  89479 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  89479 tv    speak        text=b1.wav voice=clip delayMs=190
  89575 tv    clip         src=b13.wav muted=false ready=true delayMs=190
  89575 tv    speak        text=b13.wav voice=clip delayMs=190
  89655 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  89655 tv    speak        text=n37.wav voice=clip delayMs=190
  89749 tv    clip         src=o71.wav muted=false ready=true delayMs=190
  89749 tv    speak        text=o71.wav voice=clip delayMs=190
  89843 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  89843 tv    speak        text=b8.wav voice=clip delayMs=190
  89923 tv    clip         src=b5.wav muted=false ready=true delayMs=190
  89923 tv    speak        text=b5.wav voice=clip delayMs=190
  90018 tv    clip         src=b7.wav muted=false ready=true delayMs=190
  90018 tv    speak        text=b7.wav voice=clip delayMs=190
  90098 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  90098 tv    speak        text=n42.wav voice=clip delayMs=190
  90192 tv    clip         src=i28.wav muted=false ready=true delayMs=190
  90192 tv    speak        text=i28.wav voice=clip delayMs=190
  90288 tv    clip         src=i27.wav muted=false ready=true delayMs=190
  90288 tv    speak        text=i27.wav voice=clip delayMs=190
  90382 tv    clip         src=o63.wav muted=false ready=true delayMs=190
  90382 tv    speak        text=o63.wav voice=clip delayMs=190
  90461 tv    clip         src=o64.wav muted=false ready=true delayMs=190
  90461 tv    speak        text=o64.wav voice=clip delayMs=190
  90554 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  90554 tv    speak        text=o73.wav voice=clip delayMs=190
  90650 tv    clip         src=g50.wav muted=false ready=true delayMs=190
  90650 tv    speak        text=g50.wav voice=clip delayMs=190
  90730 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  90730 tv    speak        text=g48.wav voice=clip delayMs=190
  90826 tv    clip         src=b12.wav muted=false ready=true delayMs=190
  90826 tv    speak        text=b12.wav voice=clip delayMs=190
  90925 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  90925 tv    speak        text=n45.wav voice=clip delayMs=190
  91000 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  91000 tv    speak        text=b4.wav voice=clip delayMs=190
  91108 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  91108 tv    speak        text=g46.wav voice=clip delayMs=190
  91204 tv    clip         src=o74.wav muted=false ready=true delayMs=190
  91204 tv    speak        text=o74.wav voice=clip delayMs=190
  91299 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  91299 tv    speak        text=g47.wav voice=clip delayMs=190
  91393 tv    clip         src=n31.wav muted=false ready=true delayMs=190
  91393 tv    speak        text=n31.wav voice=clip delayMs=190
  91488 tv    clip         src=o62.wav muted=false ready=true delayMs=190
  91488 tv    speak        text=o62.wav voice=clip delayMs=190
  91584 tv    clip         src=b10.wav muted=false ready=true delayMs=190
  91584 tv    speak        text=b10.wav voice=clip delayMs=190
  91678 tv    clip         src=g60.wav muted=false ready=true delayMs=190
  91678 tv    speak        text=g60.wav voice=clip delayMs=190
  91772 tv    clip         src=n38.wav muted=false ready=true delayMs=190
  91772 tv    speak        text=n38.wav voice=clip delayMs=190
  91864 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  91864 tv    speak        text=n39.wav voice=clip delayMs=190
  91959 tv    clip         src=o70.wav muted=false ready=true delayMs=190
  91959 tv    speak        text=o70.wav voice=clip delayMs=190
  92053 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  92053 tv    speak        text=b11.wav voice=clip delayMs=190
  92148 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  92148 tv    speak        text=o75.wav voice=clip delayMs=190
  92242 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  92242 tv    speak        text=g58.wav voice=clip delayMs=190
  92322 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  92322 tv    speak        text=b15.wav voice=clip delayMs=190
  92417 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  92417 tv    speak        text=i24.wav voice=clip delayMs=190
  92496 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  92496 tv    speak        text=o72.wav voice=clip delayMs=190
  92590 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  92590 tv    speak        text=g56.wav voice=clip delayMs=190
  92670 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  92670 tv    speak        text=i20.wav voice=clip delayMs=190
  92778 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  92778 tv    speak        text=n44.wav voice=clip delayMs=190
  92871 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  92871 tv    speak        text=b3.wav voice=clip delayMs=190
  92953 tv    clip         src=o68.wav muted=false ready=true delayMs=190
  92953 tv    speak        text=o68.wav voice=clip delayMs=190
  93047 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  93047 tv    speak        text=b2.wav voice=clip delayMs=190
  93141 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  93141 tv    speak        text=n41.wav voice=clip delayMs=190
  93238 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  93238 tv    speak        text=o65.wav voice=clip delayMs=190
  93331 tv    clip         src=i17.wav muted=false ready=true delayMs=190
  93331 tv    speak        text=i17.wav voice=clip delayMs=190
  93426 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  93426 tv    speak        text=i25.wav voice=clip delayMs=190
  93520 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  93520 tv    speak        text=i19.wav voice=clip delayMs=190
  93616 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  93616 tv    speak        text=g57.wav voice=clip delayMs=190
  93710 tv    clip         src=g59.wav muted=false ready=true delayMs=190
  93710 tv    speak        text=g59.wav voice=clip delayMs=190
  93805 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  93805 tv    speak        text=g49.wav voice=clip delayMs=190
  93884 tv    clip         src=n43.wav muted=false ready=true delayMs=190
  93884 tv    speak        text=n43.wav voice=clip delayMs=190
  93977 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  93977 tv    speak        text=i16.wav voice=clip delayMs=190
  94075 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  94075 tv    speak        text=n33.wav voice=clip delayMs=190
  94166 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  94166 tv    speak        text=i23.wav voice=clip delayMs=190
  94261 tv    clip         src=g54.wav muted=false ready=true delayMs=190
  94261 tv    speak        text=g54.wav voice=clip delayMs=190
  94355 tv    clip         src=b14.wav muted=false ready=true delayMs=190
  94355 tv    speak        text=b14.wav voice=clip delayMs=190
  94546 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  95582 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95842 tv    hush
  95842 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95842 tv    hush
 103448 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 103452 tv    music:duck   ms=9000
 103452 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108459 tv    hush
 108459 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108459 tv    hush
 112461 tv    ss:cancel    speaking=false pending=false
 112461 tv    music:plan   from=game:bingo to=null
 112461 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113962 tv    music:stop   track=cool-vibes.mp3
 114044 tv    ss:cancel    speaking=false pending=false
 114044 tv    music:plan   from=null to=lobby
 114044 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 116556 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 116564 tv    ss:cancel    speaking=false pending=false
 116566 tv    music:plan   from=lobby to=game:bingo
 116566 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 116566 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116570 tv    hush
 116571 tv    hush
 117181 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117367 tv    music:stop   track=george-street-shuffle.mp3
 118573 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 118697 tv    ss:cancel    speaking=false pending=false
 118697 tv    music:plan   from=game:bingo to=null
 118697 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 120198 tv    music:stop   track=cool-vibes.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 120811 tv    ss:cancel    speaking=false pending=false
 120811 tv    music:plan   from=null to=lobby
 120811 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 124165 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 124174 tv    ss:cancel    speaking=false pending=false
 124176 tv    music:plan   from=lobby to=game:bingo
 124176 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 124176 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 124180 tv    hush
 124180 tv    hush
 124596 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 124596 tv    speak        text=i21.wav voice=clip delayMs=190
 124596 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 124787 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124978 tv    music:stop   track=airport-lounge.mp3
 125094 tv    ss:cancel    speaking=false pending=false
 125094 tv    music:plan   from=game:bingo to=null
 125097 tv    ss:cancel    speaking=false pending=false
 125097 tv    music:plan   from=null to=lobby
 125097 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 125899 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 130665 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131081 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131513 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131930 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132364 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 133430 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 134029 tv    ss:cancel    speaking=false pending=false
 134034 tv    music:plan   from=lobby to=null
 134034 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 135293 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135535 tv    music:stop   track=local-forecast-elevator.mp3
 136882 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 138181 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 139582 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140608 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141647 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144196 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144385 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144574 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144764 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 145861 tv    ss:cancel    speaking=false pending=false
 145863 tv    ss:cancel    speaking=false pending=false
 145863 tv    music:plan   from=null to=lobby
 145863 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 147875 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 147882 tv    ss:cancel    speaking=false pending=false
 147883 tv    music:plan   from=lobby to=null
 147883 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149384 tv    music:stop   track=george-street-shuffle.mp3
 149426 tv    music:plan   from=null to=game:broken-pencil
 149426 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 149426 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150908 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151382 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151540 tv    music:plan   from=game:broken-pencil to=null
 151540 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 153041 tv    music:stop   track=hep-cats.mp3
```
