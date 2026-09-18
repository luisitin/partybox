# Audio interaction trace

Captured 2026-09-18T19:51:54.128Z on port 42166. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**56 / 56 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.4}]

```
   1756 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1781 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3095 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3213 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3914 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4547 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5399 tv    ss:cancel    speaking=false pending=false
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
   7767 tv    music:stop   track=local-forecast-elevator.mp3
   8212 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9498 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16469 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17470 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18468 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19469 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20470 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21254 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22057 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22214 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22372 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22530 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22675 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22830 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22987 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23144 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23301 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23460 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23600 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23758 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23914 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24072 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24229 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24388 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24541 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24699 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24840 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25720 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26052 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27858 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29598 tv    ss:cancel    speaking=false pending=false
  29598 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":1.5}]

```
  31140 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33274 tv    ss:cancel    speaking=false pending=false
  33274 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34826 tv    ss:cancel    speaking=false pending=false
  34826 tv    music:plan   from=null to=lobby
  34826 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:george-street-shuffle.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+955ms phone@+959ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,silence,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,silence,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer,silence cheer@+5356ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5412ms cheer@+5368ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36387 tv    music:plan   from=lobby to=game:bingo
  36387 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36387 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36692 tv    hush
  36692 tv    hush
  37187 tv    music:stop   track=george-street-shuffle.mp3
  37302 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38395 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39393 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40393 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41384 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  41384 tv    speak        text=b9.wav voice=clip delayMs=190
  41385 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41577 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43041 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  43041 tv    speak        text=b8.wav voice=clip delayMs=190
  43233 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44875 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  44875 tv    speak        text=n34.wav voice=clip delayMs=190
  45067 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46743 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47001 tv    hush
  47001 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47001 tv    hush
  52354 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  52357 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55353 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56355 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57355 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58362 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  58362 tv    speak        text=n35.wav voice=clip delayMs=190
  58554 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60159 tv    music:paused paused=true
  60159 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61409 tv    music:paused paused=false
  61409 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62719 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  62719 tv    speak        text=i25.wav voice=clip delayMs=190
  62847 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  62847 tv    speak        text=n45.wav voice=clip delayMs=190
  62968 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  62968 tv    speak        text=n33.wav voice=clip delayMs=190
  63096 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  63096 tv    speak        text=g49.wav voice=clip delayMs=190
  63222 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  63222 tv    speak        text=b4.wav voice=clip delayMs=190
  63353 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  63353 tv    speak        text=i20.wav voice=clip delayMs=190
  63476 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  63476 tv    speak        text=o69.wav voice=clip delayMs=190
  63603 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  63603 tv    speak        text=o67.wav voice=clip delayMs=190
  63727 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  63727 tv    speak        text=o65.wav voice=clip delayMs=190
  63853 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  63853 tv    speak        text=o73.wav voice=clip delayMs=190
  63980 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  63980 tv    speak        text=i21.wav voice=clip delayMs=190
  64107 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  64107 tv    speak        text=i18.wav voice=clip delayMs=190
  64233 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  64233 tv    speak        text=g58.wav voice=clip delayMs=190
  64358 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  64358 tv    speak        text=n36.wav voice=clip delayMs=190
  64485 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  64485 tv    speak        text=o61.wav voice=clip delayMs=190
  64611 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  64611 tv    speak        text=n37.wav voice=clip delayMs=190
  64738 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  64738 tv    speak        text=i16.wav voice=clip delayMs=190
  64864 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  64864 tv    speak        text=g47.wav voice=clip delayMs=190
  64974 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  64974 tv    speak        text=n41.wav voice=clip delayMs=190
  65101 tv    clip         src=b6.wav muted=false ready=true delayMs=190
  65101 tv    speak        text=b6.wav voice=clip delayMs=190
  65227 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  65227 tv    speak        text=o72.wav voice=clip delayMs=190
  65354 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  65354 tv    speak        text=b3.wav voice=clip delayMs=190
  65479 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  65479 tv    speak        text=i30.wav voice=clip delayMs=190
  65605 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  65605 tv    speak        text=g56.wav voice=clip delayMs=190
  65732 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  65732 tv    speak        text=o75.wav voice=clip delayMs=190
  65859 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  65859 tv    speak        text=b1.wav voice=clip delayMs=190
  65985 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  65985 tv    speak        text=b2.wav voice=clip delayMs=190
  66095 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  66095 tv    speak        text=n32.wav voice=clip delayMs=190
  66220 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  66220 tv    speak        text=g48.wav voice=clip delayMs=190
  66347 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  66347 tv    speak        text=i23.wav voice=clip delayMs=190
  66474 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  66474 tv    speak        text=i26.wav voice=clip delayMs=190
  66599 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  66599 tv    speak        text=o66.wav voice=clip delayMs=190
  66725 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  66725 tv    speak        text=i19.wav voice=clip delayMs=190
  66852 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  66852 tv    speak        text=n42.wav voice=clip delayMs=190
  66978 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  66978 tv    speak        text=i24.wav voice=clip delayMs=190
  67103 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  67103 tv    speak        text=n39.wav voice=clip delayMs=190
  67230 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  67230 tv    speak        text=g46.wav voice=clip delayMs=190
  67357 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  67357 tv    speak        text=n44.wav voice=clip delayMs=190
  67481 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  67481 tv    speak        text=b15.wav voice=clip delayMs=190
  67608 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  67608 tv    speak        text=b11.wav voice=clip delayMs=190
  67734 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  67734 tv    speak        text=g57.wav voice=clip delayMs=190
  67925 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  68342 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68624 tv    hush
  68624 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68625 tv    hush
  70499 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73980 tv    music:duck   ms=9000
  73980 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  74030 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  78799 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79121 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80122 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81122 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82127 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  82127 tv    speak        text=g57.wav voice=clip delayMs=190
  82317 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84435 tv    ss:cancel    speaking=false pending=false
  84435 tv    music:plan   from=game:bingo to=null
  84438 tv    ss:cancel    speaking=false pending=false
  84438 tv    music:plan   from=null to=lobby
  84438 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  85240 tv    music:stop   track=wallpaper.mp3
  86945 tv    ss:cancel    speaking=false pending=false
  86957 tv    music:plan   from=lobby to=game:bingo
  86957 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86957 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86962 tv    hush
  86962 tv    hush
  87578 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  87578 tv    speak        text=i21.wav voice=clip delayMs=190
  87578 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  87591 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  87591 tv    speak        text=n32.wav voice=clip delayMs=190
  87685 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  87685 tv    speak        text=i18.wav voice=clip delayMs=190
  87758 tv    music:stop   track=local-forecast-elevator.mp3
  87781 tv    clip         src=n40.wav muted=false ready=true delayMs=190
  87781 tv    speak        text=n40.wav voice=clip delayMs=190
  87875 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  87875 tv    speak        text=i30.wav voice=clip delayMs=190
  87970 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  87970 tv    speak        text=o69.wav voice=clip delayMs=190
  88063 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  88063 tv    speak        text=o61.wav voice=clip delayMs=190
  88158 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  88158 tv    speak        text=n34.wav voice=clip delayMs=190
  88253 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  88253 tv    speak        text=n35.wav voice=clip delayMs=190
  88348 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  88348 tv    speak        text=o67.wav voice=clip delayMs=190
  88443 tv    clip         src=g55.wav muted=false ready=true delayMs=190
  88443 tv    speak        text=g55.wav voice=clip delayMs=190
  88538 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  88538 tv    speak        text=i26.wav voice=clip delayMs=190
  88633 tv    clip         src=i22.wav muted=false ready=true delayMs=190
  88633 tv    speak        text=i22.wav voice=clip delayMs=190
  88727 tv    clip         src=i29.wav muted=false ready=true delayMs=190
  88727 tv    speak        text=i29.wav voice=clip delayMs=190
  88821 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  88821 tv    speak        text=o66.wav voice=clip delayMs=190
  88916 tv    clip         src=g51.wav muted=false ready=true delayMs=190
  88916 tv    speak        text=g51.wav voice=clip delayMs=190
  88997 tv    clip         src=g53.wav muted=false ready=true delayMs=190
  88997 tv    speak        text=g53.wav voice=clip delayMs=190
  89090 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  89090 tv    speak        text=b9.wav voice=clip delayMs=190
  89186 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  89186 tv    speak        text=n36.wav voice=clip delayMs=190
  89281 tv    clip         src=g52.wav muted=false ready=true delayMs=190
  89281 tv    speak        text=g52.wav voice=clip delayMs=190
  89376 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  89376 tv    speak        text=b1.wav voice=clip delayMs=190
  89469 tv    clip         src=b13.wav muted=false ready=true delayMs=190
  89469 tv    speak        text=b13.wav voice=clip delayMs=190
  89549 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  89549 tv    speak        text=n37.wav voice=clip delayMs=190
  89645 tv    clip         src=o71.wav muted=false ready=true delayMs=190
  89645 tv    speak        text=o71.wav voice=clip delayMs=190
  89742 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  89742 tv    speak        text=b8.wav voice=clip delayMs=190
  89834 tv    clip         src=b5.wav muted=false ready=true delayMs=190
  89834 tv    speak        text=b5.wav voice=clip delayMs=190
  89943 tv    clip         src=b7.wav muted=false ready=true delayMs=190
  89943 tv    speak        text=b7.wav voice=clip delayMs=190
  90039 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  90039 tv    speak        text=n42.wav voice=clip delayMs=190
  90133 tv    clip         src=i28.wav muted=false ready=true delayMs=190
  90133 tv    speak        text=i28.wav voice=clip delayMs=190
  90226 tv    clip         src=i27.wav muted=false ready=true delayMs=190
  90226 tv    speak        text=i27.wav voice=clip delayMs=190
  90321 tv    clip         src=o63.wav muted=false ready=true delayMs=190
  90321 tv    speak        text=o63.wav voice=clip delayMs=190
  90416 tv    clip         src=o64.wav muted=false ready=true delayMs=190
  90416 tv    speak        text=o64.wav voice=clip delayMs=190
  90510 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  90510 tv    speak        text=o73.wav voice=clip delayMs=190
  90606 tv    clip         src=g50.wav muted=false ready=true delayMs=190
  90606 tv    speak        text=g50.wav voice=clip delayMs=190
  90714 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  90714 tv    speak        text=g48.wav voice=clip delayMs=190
  90780 tv    clip         src=b12.wav muted=false ready=true delayMs=190
  90780 tv    speak        text=b12.wav voice=clip delayMs=190
  90888 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  90888 tv    speak        text=n45.wav voice=clip delayMs=190
  90982 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  90982 tv    speak        text=b4.wav voice=clip delayMs=190
  91077 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  91077 tv    speak        text=g46.wav voice=clip delayMs=190
  91186 tv    clip         src=o74.wav muted=false ready=true delayMs=190
  91186 tv    speak        text=o74.wav voice=clip delayMs=190
  91280 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  91280 tv    speak        text=g47.wav voice=clip delayMs=190
  91376 tv    clip         src=n31.wav muted=false ready=true delayMs=190
  91376 tv    speak        text=n31.wav voice=clip delayMs=190
  91471 tv    clip         src=o62.wav muted=false ready=true delayMs=190
  91471 tv    speak        text=o62.wav voice=clip delayMs=190
  91566 tv    clip         src=b10.wav muted=false ready=true delayMs=190
  91566 tv    speak        text=b10.wav voice=clip delayMs=190
  91661 tv    clip         src=g60.wav muted=false ready=true delayMs=190
  91661 tv    speak        text=g60.wav voice=clip delayMs=190
  91755 tv    clip         src=n38.wav muted=false ready=true delayMs=190
  91755 tv    speak        text=n38.wav voice=clip delayMs=190
  91849 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  91849 tv    speak        text=n39.wav voice=clip delayMs=190
  91943 tv    clip         src=o70.wav muted=false ready=true delayMs=190
  91943 tv    speak        text=o70.wav voice=clip delayMs=190
  92037 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  92037 tv    speak        text=b11.wav voice=clip delayMs=190
  92132 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  92132 tv    speak        text=o75.wav voice=clip delayMs=190
  92227 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  92227 tv    speak        text=g58.wav voice=clip delayMs=190
  92323 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  92323 tv    speak        text=b15.wav voice=clip delayMs=190
  92416 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  92416 tv    speak        text=i24.wav voice=clip delayMs=190
  92510 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  92510 tv    speak        text=o72.wav voice=clip delayMs=190
  92606 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  92606 tv    speak        text=g56.wav voice=clip delayMs=190
  92700 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  92700 tv    speak        text=i20.wav voice=clip delayMs=190
  92795 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  92795 tv    speak        text=n44.wav voice=clip delayMs=190
  92888 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  92888 tv    speak        text=b3.wav voice=clip delayMs=190
  92981 tv    clip         src=o68.wav muted=false ready=true delayMs=190
  92981 tv    speak        text=o68.wav voice=clip delayMs=190
  93077 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  93077 tv    speak        text=b2.wav voice=clip delayMs=190
  93170 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  93170 tv    speak        text=n41.wav voice=clip delayMs=190
  93249 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  93249 tv    speak        text=o65.wav voice=clip delayMs=190
  93344 tv    clip         src=i17.wav muted=false ready=true delayMs=190
  93344 tv    speak        text=i17.wav voice=clip delayMs=190
  93440 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  93440 tv    speak        text=i25.wav voice=clip delayMs=190
  93535 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  93535 tv    speak        text=i19.wav voice=clip delayMs=190
  93630 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  93630 tv    speak        text=g57.wav voice=clip delayMs=190
  93725 tv    clip         src=g59.wav muted=false ready=true delayMs=190
  93725 tv    speak        text=g59.wav voice=clip delayMs=190
  93819 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  93819 tv    speak        text=g49.wav voice=clip delayMs=190
  93912 tv    clip         src=n43.wav muted=false ready=true delayMs=190
  93912 tv    speak        text=n43.wav voice=clip delayMs=190
  94007 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  94007 tv    speak        text=i16.wav voice=clip delayMs=190
  94107 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  94107 tv    speak        text=n33.wav voice=clip delayMs=190
  94202 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  94202 tv    speak        text=i23.wav voice=clip delayMs=190
  94294 tv    clip         src=g54.wav muted=false ready=true delayMs=190
  94294 tv    speak        text=g54.wav voice=clip delayMs=190
  94388 tv    clip         src=b14.wav muted=false ready=true delayMs=190
  94388 tv    speak        text=b14.wav voice=clip delayMs=190
  94579 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  95623 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95887 tv    hush
  95887 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95887 tv    hush
 103492 tv    music:duck   ms=9000
 103492 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108514 tv    hush
 108515 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108515 tv    hush
 112516 tv    ss:cancel    speaking=false pending=false
 112516 tv    music:plan   from=game:bingo to=null
 112516 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 114017 tv    music:stop   track=wallpaper.mp3
 114120 tv    ss:cancel    speaking=false pending=false
 114120 tv    music:plan   from=null to=lobby
 114120 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 116638 tv    ss:cancel    speaking=false pending=false
 116646 tv    music:plan   from=lobby to=game:bingo
 116646 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 116646 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116649 tv    hush
 116649 tv    hush
 117260 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117270 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 117270 tv    speak        text=i21.wav voice=clip delayMs=190
 117276 tv    clip         src=n32.wav muted=false ready=true delayMs=190
 117276 tv    speak        text=n32.wav voice=clip delayMs=190
 117379 tv    clip         src=i18.wav muted=false ready=true delayMs=190
 117379 tv    speak        text=i18.wav voice=clip delayMs=190
 117446 tv    music:stop   track=airport-lounge.mp3
 117454 tv    clip         src=n40.wav muted=false ready=true delayMs=190
 117454 tv    speak        text=n40.wav voice=clip delayMs=190
 117557 tv    clip         src=i30.wav muted=false ready=true delayMs=190
 117557 tv    speak        text=i30.wav voice=clip delayMs=190
 117633 tv    clip         src=o69.wav muted=false ready=true delayMs=190
 117633 tv    speak        text=o69.wav voice=clip delayMs=190
 117727 tv    clip         src=o61.wav muted=false ready=true delayMs=190
 117727 tv    speak        text=o61.wav voice=clip delayMs=190
 117822 tv    clip         src=n34.wav muted=false ready=true delayMs=190
 117822 tv    speak        text=n34.wav voice=clip delayMs=190
 117902 tv    clip         src=n35.wav muted=false ready=true delayMs=190
 117902 tv    speak        text=n35.wav voice=clip delayMs=190
 117995 tv    clip         src=o67.wav muted=false ready=true delayMs=190
 117995 tv    speak        text=o67.wav voice=clip delayMs=190
 118089 tv    clip         src=g55.wav muted=false ready=true delayMs=190
 118089 tv    speak        text=g55.wav voice=clip delayMs=190
 118168 tv    clip         src=i26.wav muted=false ready=true delayMs=190
 118168 tv    speak        text=i26.wav voice=clip delayMs=190
 118262 tv    clip         src=i22.wav muted=false ready=true delayMs=190
 118262 tv    speak        text=i22.wav voice=clip delayMs=190
 118343 tv    clip         src=i29.wav muted=false ready=true delayMs=190
 118343 tv    speak        text=i29.wav voice=clip delayMs=190
 118436 tv    clip         src=o66.wav muted=false ready=true delayMs=190
 118436 tv    speak        text=o66.wav voice=clip delayMs=190
 118532 tv    clip         src=g51.wav muted=false ready=true delayMs=190
 118532 tv    speak        text=g51.wav voice=clip delayMs=190
 118625 tv    clip         src=g53.wav muted=false ready=true delayMs=190
 118625 tv    speak        text=g53.wav voice=clip delayMs=190
 118718 tv    clip         src=b9.wav muted=false ready=true delayMs=190
 118718 tv    speak        text=b9.wav voice=clip delayMs=190
 118813 tv    clip         src=n36.wav muted=false ready=true delayMs=190
 118813 tv    speak        text=n36.wav voice=clip delayMs=190
 118908 tv    clip         src=g52.wav muted=false ready=true delayMs=190
 118908 tv    speak        text=g52.wav voice=clip delayMs=190
 119003 tv    clip         src=b1.wav muted=false ready=true delayMs=190
 119003 tv    speak        text=b1.wav voice=clip delayMs=190
 119097 tv    clip         src=b13.wav muted=false ready=true delayMs=190
 119097 tv    speak        text=b13.wav voice=clip delayMs=190
 119193 tv    clip         src=n37.wav muted=false ready=true delayMs=190
 119193 tv    speak        text=n37.wav voice=clip delayMs=190
 119286 tv    clip         src=o71.wav muted=false ready=true delayMs=190
 119286 tv    speak        text=o71.wav voice=clip delayMs=190
 119381 tv    clip         src=b8.wav muted=false ready=true delayMs=190
 119381 tv    speak        text=b8.wav voice=clip delayMs=190
 119476 tv    clip         src=b5.wav muted=false ready=true delayMs=190
 119476 tv    speak        text=b5.wav voice=clip delayMs=190
 119571 tv    clip         src=b7.wav muted=false ready=true delayMs=190
 119571 tv    speak        text=b7.wav voice=clip delayMs=190
 119665 tv    clip         src=n42.wav muted=false ready=true delayMs=190
 119665 tv    speak        text=n42.wav voice=clip delayMs=190
 119761 tv    clip         src=i28.wav muted=false ready=true delayMs=190
 119761 tv    speak        text=i28.wav voice=clip delayMs=190
 119855 tv    clip         src=i27.wav muted=false ready=true delayMs=190
 119855 tv    speak        text=i27.wav voice=clip delayMs=190
 119950 tv    clip         src=o63.wav muted=false ready=true delayMs=190
 119950 tv    speak        text=o63.wav voice=clip delayMs=190
 120045 tv    clip         src=o64.wav muted=false ready=true delayMs=190
 120045 tv    speak        text=o64.wav voice=clip delayMs=190
 120141 tv    clip         src=o73.wav muted=false ready=true delayMs=190
 120141 tv    speak        text=o73.wav voice=clip delayMs=190
 120235 tv    clip         src=g50.wav muted=false ready=true delayMs=190
 120235 tv    speak        text=g50.wav voice=clip delayMs=190
 120330 tv    clip         src=g48.wav muted=false ready=true delayMs=190
 120330 tv    speak        text=g48.wav voice=clip delayMs=190
 120426 tv    clip         src=b12.wav muted=false ready=true delayMs=190
 120426 tv    speak        text=b12.wav voice=clip delayMs=190
 120504 tv    clip         src=n45.wav muted=false ready=true delayMs=190
 120504 tv    speak        text=n45.wav voice=clip delayMs=190
 120598 tv    clip         src=b4.wav muted=false ready=true delayMs=190
 120598 tv    speak        text=b4.wav voice=clip delayMs=190
 120693 tv    clip         src=g46.wav muted=false ready=true delayMs=190
 120693 tv    speak        text=g46.wav voice=clip delayMs=190
 120787 tv    clip         src=o74.wav muted=false ready=true delayMs=190
 120787 tv    speak        text=o74.wav voice=clip delayMs=190
 120865 tv    clip         src=g47.wav muted=false ready=true delayMs=190
 120865 tv    speak        text=g47.wav voice=clip delayMs=190
 120959 tv    clip         src=n31.wav muted=false ready=true delayMs=190
 120959 tv    speak        text=n31.wav voice=clip delayMs=190
 121054 tv    clip         src=o62.wav muted=false ready=true delayMs=190
 121054 tv    speak        text=o62.wav voice=clip delayMs=190
 121148 tv    clip         src=b10.wav muted=false ready=true delayMs=190
 121148 tv    speak        text=b10.wav voice=clip delayMs=190
 121244 tv    clip         src=g60.wav muted=false ready=true delayMs=190
 121244 tv    speak        text=g60.wav voice=clip delayMs=190
 121337 tv    clip         src=n38.wav muted=false ready=true delayMs=190
 121337 tv    speak        text=n38.wav voice=clip delayMs=190
 121430 tv    clip         src=n39.wav muted=false ready=true delayMs=190
 121430 tv    speak        text=n39.wav voice=clip delayMs=190
 121539 tv    clip         src=o70.wav muted=false ready=true delayMs=190
 121539 tv    speak        text=o70.wav voice=clip delayMs=190
 121619 tv    clip         src=b11.wav muted=false ready=true delayMs=190
 121619 tv    speak        text=b11.wav voice=clip delayMs=190
 121712 tv    clip         src=o75.wav muted=false ready=true delayMs=190
 121712 tv    speak        text=o75.wav voice=clip delayMs=190
 121806 tv    clip         src=g58.wav muted=false ready=true delayMs=190
 121806 tv    speak        text=g58.wav voice=clip delayMs=190
 121901 tv    clip         src=b15.wav muted=false ready=true delayMs=190
 121901 tv    speak        text=b15.wav voice=clip delayMs=190
 121995 tv    clip         src=i24.wav muted=false ready=true delayMs=190
 121995 tv    speak        text=i24.wav voice=clip delayMs=190
 122090 tv    clip         src=o72.wav muted=false ready=true delayMs=190
 122090 tv    speak        text=o72.wav voice=clip delayMs=190
 122170 tv    clip         src=g56.wav muted=false ready=true delayMs=190
 122170 tv    speak        text=g56.wav voice=clip delayMs=190
 122279 tv    clip         src=i20.wav muted=false ready=true delayMs=190
 122279 tv    speak        text=i20.wav voice=clip delayMs=190
 122374 tv    clip         src=n44.wav muted=false ready=true delayMs=190
 122374 tv    speak        text=n44.wav voice=clip delayMs=190
 122468 tv    clip         src=b3.wav muted=false ready=true delayMs=190
 122468 tv    speak        text=b3.wav voice=clip delayMs=190
 122563 tv    clip         src=o68.wav muted=false ready=true delayMs=190
 122563 tv    speak        text=o68.wav voice=clip delayMs=190
 122658 tv    clip         src=b2.wav muted=false ready=true delayMs=190
 122658 tv    speak        text=b2.wav voice=clip delayMs=190
 122753 tv    clip         src=n41.wav muted=false ready=true delayMs=190
 122753 tv    speak        text=n41.wav voice=clip delayMs=190
 122847 tv    clip         src=o65.wav muted=false ready=true delayMs=190
 122847 tv    speak        text=o65.wav voice=clip delayMs=190
 122942 tv    clip         src=i17.wav muted=false ready=true delayMs=190
 122942 tv    speak        text=i17.wav voice=clip delayMs=190
 123035 tv    clip         src=i25.wav muted=false ready=true delayMs=190
 123035 tv    speak        text=i25.wav voice=clip delayMs=190
 123131 tv    clip         src=i19.wav muted=false ready=true delayMs=190
 123131 tv    speak        text=i19.wav voice=clip delayMs=190
 123225 tv    clip         src=g57.wav muted=false ready=true delayMs=190
 123225 tv    speak        text=g57.wav voice=clip delayMs=190
 123319 tv    clip         src=g59.wav muted=false ready=true delayMs=190
 123319 tv    speak        text=g59.wav voice=clip delayMs=190
 123413 tv    clip         src=g49.wav muted=false ready=true delayMs=190
 123413 tv    speak        text=g49.wav voice=clip delayMs=190
 123508 tv    clip         src=n43.wav muted=false ready=true delayMs=190
 123508 tv    speak        text=n43.wav voice=clip delayMs=190
 123603 tv    clip         src=i16.wav muted=false ready=true delayMs=190
 123603 tv    speak        text=i16.wav voice=clip delayMs=190
 123683 tv    clip         src=n33.wav muted=false ready=true delayMs=190
 123683 tv    speak        text=n33.wav voice=clip delayMs=190
 123791 tv    clip         src=i23.wav muted=false ready=true delayMs=190
 123791 tv    speak        text=i23.wav voice=clip delayMs=190
 123886 tv    clip         src=g54.wav muted=false ready=true delayMs=190
 123886 tv    speak        text=g54.wav voice=clip delayMs=190
 123982 tv    clip         src=b14.wav muted=false ready=true delayMs=190
 123982 tv    speak        text=b14.wav voice=clip delayMs=190
 124173 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 125205 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 125464 tv    hush
 125465 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 125465 tv    hush
 133068 tv    music:duck   ms=9000
 133068 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 138086 tv    hush
 138086 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 138086 tv    hush
 139634 tv    ss:cancel    speaking=false pending=false
 139634 tv    music:plan   from=game:bingo to=null
 139636 tv    ss:cancel    speaking=false pending=false
 139636 tv    music:plan   from=null to=lobby
 139636 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 140445 tv    music:stop   track=cool-vibes.mp3
 142141 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 142150 tv    ss:cancel    speaking=false pending=false
 142152 tv    music:plan   from=lobby to=game:bingo
 142152 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 142152 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 142155 tv    hush
 142156 tv    hush
 142767 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 142953 tv    music:stop   track=george-street-shuffle.mp3
 144157 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 144287 tv    ss:cancel    speaking=false pending=false
 144287 tv    music:plan   from=game:bingo to=null
 144287 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 145788 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 146417 tv    ss:cancel    speaking=false pending=false
 146417 tv    music:plan   from=null to=lobby
 146417 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 149772 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 149781 tv    ss:cancel    speaking=false pending=false
 149783 tv    music:plan   from=lobby to=game:bingo
 149783 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 149783 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149786 tv    hush
 149787 tv    hush
 150204 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 150204 tv    speak        text=i21.wav voice=clip delayMs=190
 150204 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150396 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 150584 tv    music:stop   track=bossa-antigua.mp3
 150718 tv    ss:cancel    speaking=false pending=false
 150718 tv    music:plan   from=game:bingo to=null
 150721 tv    ss:cancel    speaking=false pending=false
 150721 tv    music:plan   from=null to=lobby
 150721 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 151521 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 156321 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156754 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157171 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157602 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158019 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 159088 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 159696 tv    ss:cancel    speaking=false pending=false
 159698 tv    music:plan   from=lobby to=null
 159699 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 160950 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 161199 tv    music:stop   track=george-street-shuffle.mp3
 162538 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 163838 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 165122 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 166146 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 167184 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 169760 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 169935 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 170109 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 170297 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 171399 tv    ss:cancel    speaking=false pending=false
 171402 tv    ss:cancel    speaking=false pending=false
 171402 tv    music:plan   from=null to=lobby
 171402 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 173423 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 173430 tv    ss:cancel    speaking=false pending=false
 173432 tv    music:plan   from=lobby to=null
 173432 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 174933 tv    music:stop   track=local-forecast-elevator.mp3
 175002 tv    music:plan   from=null to=game:broken-pencil
 175002 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 175002 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 176486 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 176961 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 177116 tv    music:plan   from=game:broken-pencil to=null
 177116 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 178618 tv    music:stop   track=backbay-lounge.mp3
```
