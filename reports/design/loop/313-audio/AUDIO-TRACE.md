# Audio interaction trace

Captured 2026-09-18T17:14:31.172Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**54 / 54 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:george-street-shuffle
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":4.4}]

```
   1853 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   1885 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3208 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3343 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   4039 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4676 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5526 tv    ss:cancel    speaking=false pending=false
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
   6380 tv    music:plan   from=lobby to=null
   6380 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7881 tv    music:stop   track=george-street-shuffle.mp3
   8335 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9628 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16588 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17598 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18598 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19589 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20598 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21379 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22199 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22361 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22516 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22673 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22828 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22984 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23143 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23301 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23459 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23615 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23759 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23903 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24060 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24217 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24359 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24514 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24670 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24829 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24988 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25866 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26198 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  28007 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29743 tv    ss:cancel    speaking=false pending=false
  29743 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":1.5}]

```
  31287 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33437 tv    ss:cancel    speaking=false pending=false
  33437 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34987 tv    ss:cancel    speaking=false pending=false
  34987 tv    music:plan   from=null to=lobby
  34987 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:local-forecast-elevator.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+956ms phone@+972ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,silence,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,silence,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":24.8}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5358ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":39.3}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5397ms cheer@+5369ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=3 lastTickIdx=2
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36549 tv    music:plan   from=lobby to=game:bingo
  36549 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36549 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36853 tv    hush
  36854 tv    hush
  37351 tv    music:stop   track=local-forecast-elevator.mp3
  37464 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38555 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39555 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40558 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41561 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  41561 tv    speak        text=b9.wav voice=clip delayMs=190
  41562 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41753 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43186 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  43186 tv    speak        text=b8.wav voice=clip delayMs=190
  43377 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45013 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  45013 tv    speak        text=n34.wav voice=clip delayMs=190
  45205 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46890 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47154 tv    hush
  47154 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47154 tv    hush
  52511 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  52513 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55508 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56511 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57509 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58514 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  58514 tv    speak        text=n35.wav voice=clip delayMs=190
  58705 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60272 tv    music:paused paused=true
  60272 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61521 tv    music:paused paused=false
  61521 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62805 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  62805 tv    speak        text=i25.wav voice=clip delayMs=190
  62931 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  62931 tv    speak        text=n45.wav voice=clip delayMs=190
  63057 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  63057 tv    speak        text=n33.wav voice=clip delayMs=190
  63184 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  63184 tv    speak        text=g49.wav voice=clip delayMs=190
  63310 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  63310 tv    speak        text=b4.wav voice=clip delayMs=190
  63434 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  63434 tv    speak        text=i20.wav voice=clip delayMs=190
  63563 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  63563 tv    speak        text=o69.wav voice=clip delayMs=190
  63688 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  63688 tv    speak        text=o67.wav voice=clip delayMs=190
  63814 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  63814 tv    speak        text=o65.wav voice=clip delayMs=190
  63941 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  63941 tv    speak        text=o73.wav voice=clip delayMs=190
  64065 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  64065 tv    speak        text=i21.wav voice=clip delayMs=190
  64176 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  64176 tv    speak        text=i18.wav voice=clip delayMs=190
  64289 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  64289 tv    speak        text=g58.wav voice=clip delayMs=190
  64411 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  64411 tv    speak        text=n36.wav voice=clip delayMs=190
  64539 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  64539 tv    speak        text=o61.wav voice=clip delayMs=190
  64650 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  64650 tv    speak        text=n37.wav voice=clip delayMs=190
  64774 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  64774 tv    speak        text=i16.wav voice=clip delayMs=190
  64899 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  64899 tv    speak        text=g47.wav voice=clip delayMs=190
  65024 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  65024 tv    speak        text=n41.wav voice=clip delayMs=190
  65146 tv    clip         src=b6.wav muted=false ready=true delayMs=190
  65146 tv    speak        text=b6.wav voice=clip delayMs=190
  65271 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  65271 tv    speak        text=o72.wav voice=clip delayMs=190
  65397 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  65397 tv    speak        text=b3.wav voice=clip delayMs=190
  65521 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  65521 tv    speak        text=i30.wav voice=clip delayMs=190
  65649 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  65649 tv    speak        text=g56.wav voice=clip delayMs=190
  65770 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  65770 tv    speak        text=o75.wav voice=clip delayMs=190
  65897 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  65897 tv    speak        text=b1.wav voice=clip delayMs=190
  66021 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  66021 tv    speak        text=b2.wav voice=clip delayMs=190
  66149 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  66149 tv    speak        text=n32.wav voice=clip delayMs=190
  66275 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  66275 tv    speak        text=g48.wav voice=clip delayMs=190
  66402 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  66402 tv    speak        text=i23.wav voice=clip delayMs=190
  66528 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  66528 tv    speak        text=i26.wav voice=clip delayMs=190
  66652 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  66652 tv    speak        text=o66.wav voice=clip delayMs=190
  66778 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  66778 tv    speak        text=i19.wav voice=clip delayMs=190
  66905 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  66905 tv    speak        text=n42.wav voice=clip delayMs=190
  67033 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  67033 tv    speak        text=i24.wav voice=clip delayMs=190
  67157 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  67157 tv    speak        text=n39.wav voice=clip delayMs=190
  67284 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  67284 tv    speak        text=g46.wav voice=clip delayMs=190
  67409 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  67409 tv    speak        text=n44.wav voice=clip delayMs=190
  67536 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  67536 tv    speak        text=b15.wav voice=clip delayMs=190
  67663 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  67663 tv    speak        text=b11.wav voice=clip delayMs=190
  67787 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  67787 tv    speak        text=g57.wav voice=clip delayMs=190
  67978 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  68420 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68693 tv    hush
  68693 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68693 tv    hush
  70566 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  74051 tv    music:duck   ms=9000
  74051 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  78845 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79147 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80149 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81149 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82156 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  82156 tv    speak        text=g57.wav voice=clip delayMs=190
  82346 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84449 tv    ss:cancel    speaking=false pending=false
  84449 tv    music:plan   from=game:bingo to=null
  84452 tv    ss:cancel    speaking=false pending=false
  84452 tv    music:plan   from=null to=lobby
  84452 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  85253 tv    music:stop   track=cool-vibes.mp3
  86970 tv    ss:cancel    speaking=false pending=false
  86980 tv    music:plan   from=lobby to=game:bingo
  86980 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86980 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86984 tv    hush
  86985 tv    hush
  87598 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  87598 tv    speak        text=i21.wav voice=clip delayMs=190
  87598 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  87612 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  87612 tv    speak        text=n32.wav voice=clip delayMs=190
  87706 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  87706 tv    speak        text=i18.wav voice=clip delayMs=190
  87781 tv    music:stop   track=george-street-shuffle.mp3
  87787 tv    clip         src=n40.wav muted=false ready=true delayMs=190
  87787 tv    speak        text=n40.wav voice=clip delayMs=190
  87881 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  87881 tv    speak        text=i30.wav voice=clip delayMs=190
  87976 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  87976 tv    speak        text=o69.wav voice=clip delayMs=190
  88070 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  88070 tv    speak        text=o61.wav voice=clip delayMs=190
  88178 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  88178 tv    speak        text=n34.wav voice=clip delayMs=190
  88273 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  88273 tv    speak        text=n35.wav voice=clip delayMs=190
  88367 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  88367 tv    speak        text=o67.wav voice=clip delayMs=190
  88463 tv    clip         src=g55.wav muted=false ready=true delayMs=190
  88463 tv    speak        text=g55.wav voice=clip delayMs=190
  88558 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  88558 tv    speak        text=i26.wav voice=clip delayMs=190
  88651 tv    clip         src=i22.wav muted=false ready=true delayMs=190
  88651 tv    speak        text=i22.wav voice=clip delayMs=190
  88745 tv    clip         src=i29.wav muted=false ready=true delayMs=190
  88745 tv    speak        text=i29.wav voice=clip delayMs=190
  88841 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  88841 tv    speak        text=o66.wav voice=clip delayMs=190
  88936 tv    clip         src=g51.wav muted=false ready=true delayMs=190
  88936 tv    speak        text=g51.wav voice=clip delayMs=190
  89030 tv    clip         src=g53.wav muted=false ready=true delayMs=190
  89030 tv    speak        text=g53.wav voice=clip delayMs=190
  89125 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  89125 tv    speak        text=b9.wav voice=clip delayMs=190
  89218 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  89218 tv    speak        text=n36.wav voice=clip delayMs=190
  89314 tv    clip         src=g52.wav muted=false ready=true delayMs=190
  89314 tv    speak        text=g52.wav voice=clip delayMs=190
  89408 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  89408 tv    speak        text=b1.wav voice=clip delayMs=190
  89503 tv    clip         src=b13.wav muted=false ready=true delayMs=190
  89503 tv    speak        text=b13.wav voice=clip delayMs=190
  89597 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  89597 tv    speak        text=n37.wav voice=clip delayMs=190
  89692 tv    clip         src=o71.wav muted=false ready=true delayMs=190
  89692 tv    speak        text=o71.wav voice=clip delayMs=190
  89787 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  89787 tv    speak        text=b8.wav voice=clip delayMs=190
  89881 tv    clip         src=b5.wav muted=false ready=true delayMs=190
  89881 tv    speak        text=b5.wav voice=clip delayMs=190
  89975 tv    clip         src=b7.wav muted=false ready=true delayMs=190
  89975 tv    speak        text=b7.wav voice=clip delayMs=190
  90073 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  90073 tv    speak        text=n42.wav voice=clip delayMs=190
  90165 tv    clip         src=i28.wav muted=false ready=true delayMs=190
  90165 tv    speak        text=i28.wav voice=clip delayMs=190
  90259 tv    clip         src=i27.wav muted=false ready=true delayMs=190
  90259 tv    speak        text=i27.wav voice=clip delayMs=190
  90354 tv    clip         src=o63.wav muted=false ready=true delayMs=190
  90354 tv    speak        text=o63.wav voice=clip delayMs=190
  90449 tv    clip         src=o64.wav muted=false ready=true delayMs=190
  90449 tv    speak        text=o64.wav voice=clip delayMs=190
  90544 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  90544 tv    speak        text=o73.wav voice=clip delayMs=190
  90642 tv    clip         src=g50.wav muted=false ready=true delayMs=190
  90642 tv    speak        text=g50.wav voice=clip delayMs=190
  90737 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  90737 tv    speak        text=g48.wav voice=clip delayMs=190
  90829 tv    clip         src=b12.wav muted=false ready=true delayMs=190
  90829 tv    speak        text=b12.wav voice=clip delayMs=190
  90924 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  90924 tv    speak        text=n45.wav voice=clip delayMs=190
  91007 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  91007 tv    speak        text=b4.wav voice=clip delayMs=190
  91098 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  91098 tv    speak        text=g46.wav voice=clip delayMs=190
  91194 tv    clip         src=o74.wav muted=false ready=true delayMs=190
  91194 tv    speak        text=o74.wav voice=clip delayMs=190
  91291 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  91291 tv    speak        text=g47.wav voice=clip delayMs=190
  91383 tv    clip         src=n31.wav muted=false ready=true delayMs=190
  91383 tv    speak        text=n31.wav voice=clip delayMs=190
  91478 tv    clip         src=o62.wav muted=false ready=true delayMs=190
  91478 tv    speak        text=o62.wav voice=clip delayMs=190
  91573 tv    clip         src=b10.wav muted=false ready=true delayMs=190
  91573 tv    speak        text=b10.wav voice=clip delayMs=190
  91667 tv    clip         src=g60.wav muted=false ready=true delayMs=190
  91667 tv    speak        text=g60.wav voice=clip delayMs=190
  91759 tv    clip         src=n38.wav muted=false ready=true delayMs=190
  91759 tv    speak        text=n38.wav voice=clip delayMs=190
  91854 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  91854 tv    speak        text=n39.wav voice=clip delayMs=190
  91950 tv    clip         src=o70.wav muted=false ready=true delayMs=190
  91950 tv    speak        text=o70.wav voice=clip delayMs=190
  92043 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  92043 tv    speak        text=b11.wav voice=clip delayMs=190
  92138 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  92138 tv    speak        text=o75.wav voice=clip delayMs=190
  92234 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  92234 tv    speak        text=g58.wav voice=clip delayMs=190
  92330 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  92330 tv    speak        text=b15.wav voice=clip delayMs=190
  92423 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  92423 tv    speak        text=i24.wav voice=clip delayMs=190
  92516 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  92516 tv    speak        text=o72.wav voice=clip delayMs=190
  92610 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  92610 tv    speak        text=g56.wav voice=clip delayMs=190
  92705 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  92705 tv    speak        text=i20.wav voice=clip delayMs=190
  92800 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  92800 tv    speak        text=n44.wav voice=clip delayMs=190
  92895 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  92895 tv    speak        text=b3.wav voice=clip delayMs=190
  92988 tv    clip         src=o68.wav muted=false ready=true delayMs=190
  92988 tv    speak        text=o68.wav voice=clip delayMs=190
  93085 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  93085 tv    speak        text=b2.wav voice=clip delayMs=190
  93177 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  93177 tv    speak        text=n41.wav voice=clip delayMs=190
  93272 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  93272 tv    speak        text=o65.wav voice=clip delayMs=190
  93369 tv    clip         src=i17.wav muted=false ready=true delayMs=190
  93369 tv    speak        text=i17.wav voice=clip delayMs=190
  93446 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  93446 tv    speak        text=i25.wav voice=clip delayMs=190
  93541 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  93541 tv    speak        text=i19.wav voice=clip delayMs=190
  93635 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  93635 tv    speak        text=g57.wav voice=clip delayMs=190
  93730 tv    clip         src=g59.wav muted=false ready=true delayMs=190
  93730 tv    speak        text=g59.wav voice=clip delayMs=190
  93921 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  94970 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95232 tv    hush
  95232 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95233 tv    hush
 102838 tv    music:duck   ms=9000
 102838 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 107860 tv    hush
 107860 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 107860 tv    hush
 111862 tv    ss:cancel    speaking=false pending=false
 111862 tv    music:plan   from=game:bingo to=null
 111862 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113363 tv    music:stop   track=wallpaper.mp3
 113448 tv    ss:cancel    speaking=false pending=false
 113448 tv    music:plan   from=null to=lobby
 113448 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 115963 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 115972 tv    ss:cancel    speaking=false pending=false
 115974 tv    music:plan   from=lobby to=game:bingo
 115974 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 115974 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 115978 tv    hush
 115979 tv    hush
 116589 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 116777 tv    music:stop   track=bossa-antigua.mp3
 117981 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 118134 tv    ss:cancel    speaking=false pending=false
 118134 tv    music:plan   from=game:bingo to=null
 118134 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 119636 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 120265 tv    ss:cancel    speaking=false pending=false
 120265 tv    music:plan   from=null to=lobby
 120265 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 123618 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 123629 tv    ss:cancel    speaking=false pending=false
 123631 tv    music:plan   from=lobby to=game:bingo
 123631 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 123631 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 123635 tv    hush
 123635 tv    hush
 124049 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 124049 tv    speak        text=i21.wav voice=clip delayMs=190
 124049 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 124240 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124432 tv    music:stop   track=local-forecast-elevator.mp3
 124547 tv    ss:cancel    speaking=false pending=false
 124547 tv    music:plan   from=game:bingo to=null
 124550 tv    ss:cancel    speaking=false pending=false
 124550 tv    music:plan   from=null to=lobby
 124550 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 125352 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 130134 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 130567 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 130982 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131416 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131832 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132916 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 133510 tv    ss:cancel    speaking=false pending=false
 133516 tv    music:plan   from=lobby to=null
 133516 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 134769 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135017 tv    music:stop   track=local-forecast-elevator.mp3
 136352 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 137652 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 138936 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 139953 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 140996 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143552 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 143740 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143917 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144104 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 145195 tv    ss:cancel    speaking=false pending=false
 145198 tv    ss:cancel    speaking=false pending=false
 145198 tv    music:plan   from=null to=lobby
 145198 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 147214 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 147221 tv    ss:cancel    speaking=false pending=false
 147223 tv    music:plan   from=lobby to=null
 147223 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 148723 tv    music:stop   track=george-street-shuffle.mp3
 148761 tv    music:plan   from=null to=game:broken-pencil
 148761 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 148761 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150237 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150711 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150872 tv    music:plan   from=game:broken-pencil to=null
 150872 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 152373 tv    music:stop   track=hep-cats.mp3
```
