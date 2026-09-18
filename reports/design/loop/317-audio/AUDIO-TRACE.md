# Audio interaction trace

Captured 2026-09-18T17:43:11.486Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**54 / 54 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:bossa-antigua
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":4.4}]

```
   1839 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   1869 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3194 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3330 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   4036 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4681 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5515 tv    ss:cancel    speaking=false pending=false
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
   6369 tv    music:plan   from=lobby to=null
   6369 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7871 tv    music:stop   track=bossa-antigua.mp3
   8292 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9564 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16553 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17552 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18547 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19547 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20544 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21376 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22153 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22313 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22466 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22624 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22779 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22938 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23094 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23236 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23390 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23547 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23701 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23864 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24015 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24173 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24332 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24487 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24642 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24799 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24956 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25831 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26158 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27964 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29688 tv    ss:cancel    speaking=false pending=false
  29688 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31240 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33390 tv    ss:cancel    speaking=false pending=false
  33390 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34925 tv    ss:cancel    speaking=false pending=false
  34925 tv    music:plan   from=null to=lobby
  34925 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+956ms phone@+968ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,silence,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,silence,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18.1}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5355ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5396ms cheer@+5365ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=3 lastTickIdx=2
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36487 tv    music:plan   from=lobby to=game:bingo
  36487 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36487 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36792 tv    hush
  36792 tv    hush
  37288 tv    music:stop   track=airport-lounge.mp3
  37403 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38493 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39493 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40494 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41500 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  41500 tv    speak        text=b9.wav voice=clip delayMs=190
  41501 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41692 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43140 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  43140 tv    speak        text=b8.wav voice=clip delayMs=190
  43332 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44971 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  44971 tv    speak        text=n34.wav voice=clip delayMs=190
  45162 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46843 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47119 tv    hush
  47119 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47119 tv    hush
  52474 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  52477 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55483 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56485 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57486 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58487 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  58487 tv    speak        text=n35.wav voice=clip delayMs=190
  58678 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60260 tv    music:paused paused=true
  60260 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61493 tv    music:paused paused=false
  61493 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62802 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  62802 tv    speak        text=i25.wav voice=clip delayMs=190
  62929 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  62929 tv    speak        text=n45.wav voice=clip delayMs=190
  63056 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  63056 tv    speak        text=n33.wav voice=clip delayMs=190
  63183 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  63183 tv    speak        text=g49.wav voice=clip delayMs=190
  63309 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  63309 tv    speak        text=b4.wav voice=clip delayMs=190
  63437 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  63437 tv    speak        text=i20.wav voice=clip delayMs=190
  63560 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  63560 tv    speak        text=o69.wav voice=clip delayMs=190
  63657 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  63657 tv    speak        text=o67.wav voice=clip delayMs=190
  63781 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  63781 tv    speak        text=o65.wav voice=clip delayMs=190
  63912 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  63912 tv    speak        text=o73.wav voice=clip delayMs=190
  64037 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  64037 tv    speak        text=i21.wav voice=clip delayMs=190
  64163 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  64163 tv    speak        text=i18.wav voice=clip delayMs=190
  64291 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  64291 tv    speak        text=g58.wav voice=clip delayMs=190
  64399 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  64399 tv    speak        text=n36.wav voice=clip delayMs=190
  64527 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  64527 tv    speak        text=o61.wav voice=clip delayMs=190
  64656 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  64656 tv    speak        text=n37.wav voice=clip delayMs=190
  64780 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  64780 tv    speak        text=i16.wav voice=clip delayMs=190
  64909 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  64909 tv    speak        text=g47.wav voice=clip delayMs=190
  65035 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  65035 tv    speak        text=n41.wav voice=clip delayMs=190
  65160 tv    clip         src=b6.wav muted=false ready=true delayMs=190
  65160 tv    speak        text=b6.wav voice=clip delayMs=190
  65272 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  65272 tv    speak        text=o72.wav voice=clip delayMs=190
  65396 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  65396 tv    speak        text=b3.wav voice=clip delayMs=190
  65523 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  65523 tv    speak        text=i30.wav voice=clip delayMs=190
  65648 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  65648 tv    speak        text=g56.wav voice=clip delayMs=190
  65775 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  65775 tv    speak        text=o75.wav voice=clip delayMs=190
  65886 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  65886 tv    speak        text=b1.wav voice=clip delayMs=190
  66011 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  66011 tv    speak        text=b2.wav voice=clip delayMs=190
  66138 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  66138 tv    speak        text=n32.wav voice=clip delayMs=190
  66264 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  66264 tv    speak        text=g48.wav voice=clip delayMs=190
  66389 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  66389 tv    speak        text=i23.wav voice=clip delayMs=190
  66499 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  66499 tv    speak        text=i26.wav voice=clip delayMs=190
  66625 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  66625 tv    speak        text=o66.wav voice=clip delayMs=190
  66751 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  66751 tv    speak        text=i19.wav voice=clip delayMs=190
  66878 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  66878 tv    speak        text=n42.wav voice=clip delayMs=190
  67004 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  67004 tv    speak        text=i24.wav voice=clip delayMs=190
  67130 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  67130 tv    speak        text=n39.wav voice=clip delayMs=190
  67254 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  67254 tv    speak        text=g46.wav voice=clip delayMs=190
  67379 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  67379 tv    speak        text=n44.wav voice=clip delayMs=190
  67506 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  67506 tv    speak        text=b15.wav voice=clip delayMs=190
  67631 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  67631 tv    speak        text=b11.wav voice=clip delayMs=190
  67755 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  67755 tv    speak        text=g57.wav voice=clip delayMs=190
  67947 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  68357 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68637 tv    hush
  68638 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68638 tv    hush
  70511 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73991 tv    music:duck   ms=9000
  73992 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  78783 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79110 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80111 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81112 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82121 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  82121 tv    speak        text=g57.wav voice=clip delayMs=190
  82313 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84420 tv    ss:cancel    speaking=false pending=false
  84420 tv    music:plan   from=game:bingo to=null
  84422 tv    ss:cancel    speaking=false pending=false
  84422 tv    music:plan   from=null to=lobby
  84422 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  85223 tv    music:stop   track=wallpaper.mp3
  86932 tv    ss:cancel    speaking=false pending=false
  86940 tv    music:plan   from=lobby to=game:bingo
  86940 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86940 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86944 tv    hush
  86944 tv    hush
  87556 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  87564 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  87564 tv    speak        text=i21.wav voice=clip delayMs=190
  87571 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  87571 tv    speak        text=n32.wav voice=clip delayMs=190
  87674 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  87674 tv    speak        text=i18.wav voice=clip delayMs=190
  87741 tv    music:stop   track=bossa-antigua.mp3
  87752 tv    clip         src=n40.wav muted=false ready=true delayMs=190
  87752 tv    speak        text=n40.wav voice=clip delayMs=190
  87847 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  87847 tv    speak        text=i30.wav voice=clip delayMs=190
  87926 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  87926 tv    speak        text=o69.wav voice=clip delayMs=190
  88035 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  88035 tv    speak        text=o61.wav voice=clip delayMs=190
  88115 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  88115 tv    speak        text=n34.wav voice=clip delayMs=190
  88210 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  88210 tv    speak        text=n35.wav voice=clip delayMs=190
  88304 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  88304 tv    speak        text=o67.wav voice=clip delayMs=190
  88399 tv    clip         src=g55.wav muted=false ready=true delayMs=190
  88399 tv    speak        text=g55.wav voice=clip delayMs=190
  88494 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  88494 tv    speak        text=i26.wav voice=clip delayMs=190
  88589 tv    clip         src=i22.wav muted=false ready=true delayMs=190
  88589 tv    speak        text=i22.wav voice=clip delayMs=190
  88683 tv    clip         src=i29.wav muted=false ready=true delayMs=190
  88683 tv    speak        text=i29.wav voice=clip delayMs=190
  88777 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  88777 tv    speak        text=o66.wav voice=clip delayMs=190
  88859 tv    clip         src=g51.wav muted=false ready=true delayMs=190
  88859 tv    speak        text=g51.wav voice=clip delayMs=190
  88952 tv    clip         src=g53.wav muted=false ready=true delayMs=190
  88952 tv    speak        text=g53.wav voice=clip delayMs=190
  89046 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  89046 tv    speak        text=b9.wav voice=clip delayMs=190
  89141 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  89141 tv    speak        text=n36.wav voice=clip delayMs=190
  89237 tv    clip         src=g52.wav muted=false ready=true delayMs=190
  89237 tv    speak        text=g52.wav voice=clip delayMs=190
  89315 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  89315 tv    speak        text=b1.wav voice=clip delayMs=190
  89424 tv    clip         src=b13.wav muted=false ready=true delayMs=190
  89424 tv    speak        text=b13.wav voice=clip delayMs=190
  89517 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  89517 tv    speak        text=n37.wav voice=clip delayMs=190
  89613 tv    clip         src=o71.wav muted=false ready=true delayMs=190
  89613 tv    speak        text=o71.wav voice=clip delayMs=190
  89707 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  89707 tv    speak        text=b8.wav voice=clip delayMs=190
  89802 tv    clip         src=b5.wav muted=false ready=true delayMs=190
  89802 tv    speak        text=b5.wav voice=clip delayMs=190
  89896 tv    clip         src=b7.wav muted=false ready=true delayMs=190
  89896 tv    speak        text=b7.wav voice=clip delayMs=190
  89991 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  89991 tv    speak        text=n42.wav voice=clip delayMs=190
  90084 tv    clip         src=i28.wav muted=false ready=true delayMs=190
  90084 tv    speak        text=i28.wav voice=clip delayMs=190
  90177 tv    clip         src=i27.wav muted=false ready=true delayMs=190
  90177 tv    speak        text=i27.wav voice=clip delayMs=190
  90272 tv    clip         src=o63.wav muted=false ready=true delayMs=190
  90272 tv    speak        text=o63.wav voice=clip delayMs=190
  90367 tv    clip         src=o64.wav muted=false ready=true delayMs=190
  90367 tv    speak        text=o64.wav voice=clip delayMs=190
  90462 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  90462 tv    speak        text=o73.wav voice=clip delayMs=190
  90557 tv    clip         src=g50.wav muted=false ready=true delayMs=190
  90557 tv    speak        text=g50.wav voice=clip delayMs=190
  90651 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  90651 tv    speak        text=g48.wav voice=clip delayMs=190
  90747 tv    clip         src=b12.wav muted=false ready=true delayMs=190
  90747 tv    speak        text=b12.wav voice=clip delayMs=190
  90839 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  90839 tv    speak        text=n45.wav voice=clip delayMs=190
  90936 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  90936 tv    speak        text=b4.wav voice=clip delayMs=190
  91014 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  91014 tv    speak        text=g46.wav voice=clip delayMs=190
  91110 tv    clip         src=o74.wav muted=false ready=true delayMs=190
  91110 tv    speak        text=o74.wav voice=clip delayMs=190
  91205 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  91205 tv    speak        text=g47.wav voice=clip delayMs=190
  91299 tv    clip         src=n31.wav muted=false ready=true delayMs=190
  91299 tv    speak        text=n31.wav voice=clip delayMs=190
  91393 tv    clip         src=o62.wav muted=false ready=true delayMs=190
  91393 tv    speak        text=o62.wav voice=clip delayMs=190
  91487 tv    clip         src=b10.wav muted=false ready=true delayMs=190
  91487 tv    speak        text=b10.wav voice=clip delayMs=190
  91582 tv    clip         src=g60.wav muted=false ready=true delayMs=190
  91582 tv    speak        text=g60.wav voice=clip delayMs=190
  91677 tv    clip         src=n38.wav muted=false ready=true delayMs=190
  91677 tv    speak        text=n38.wav voice=clip delayMs=190
  91772 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  91772 tv    speak        text=n39.wav voice=clip delayMs=190
  91880 tv    clip         src=o70.wav muted=false ready=true delayMs=190
  91880 tv    speak        text=o70.wav voice=clip delayMs=190
  91976 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  91976 tv    speak        text=b11.wav voice=clip delayMs=190
  92070 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  92070 tv    speak        text=o75.wav voice=clip delayMs=190
  92166 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  92166 tv    speak        text=g58.wav voice=clip delayMs=190
  92261 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  92261 tv    speak        text=b15.wav voice=clip delayMs=190
  92356 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  92356 tv    speak        text=i24.wav voice=clip delayMs=190
  92450 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  92450 tv    speak        text=o72.wav voice=clip delayMs=190
  92545 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  92545 tv    speak        text=g56.wav voice=clip delayMs=190
  92639 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  92639 tv    speak        text=i20.wav voice=clip delayMs=190
  92733 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  92733 tv    speak        text=n44.wav voice=clip delayMs=190
  92828 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  92828 tv    speak        text=b3.wav voice=clip delayMs=190
  92922 tv    clip         src=o68.wav muted=false ready=true delayMs=190
  92922 tv    speak        text=o68.wav voice=clip delayMs=190
  93016 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  93016 tv    speak        text=b2.wav voice=clip delayMs=190
  93110 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  93110 tv    speak        text=n41.wav voice=clip delayMs=190
  93206 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  93206 tv    speak        text=o65.wav voice=clip delayMs=190
  93301 tv    clip         src=i17.wav muted=false ready=true delayMs=190
  93301 tv    speak        text=i17.wav voice=clip delayMs=190
  93395 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  93395 tv    speak        text=i25.wav voice=clip delayMs=190
  93489 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  93489 tv    speak        text=i19.wav voice=clip delayMs=190
  93585 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  93585 tv    speak        text=g57.wav voice=clip delayMs=190
  93664 tv    clip         src=g59.wav muted=false ready=true delayMs=190
  93664 tv    speak        text=g59.wav voice=clip delayMs=190
  93757 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  93757 tv    speak        text=g49.wav voice=clip delayMs=190
  93854 tv    clip         src=n43.wav muted=false ready=true delayMs=190
  93854 tv    speak        text=n43.wav voice=clip delayMs=190
  93946 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  93946 tv    speak        text=i16.wav voice=clip delayMs=190
  94041 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  94041 tv    speak        text=n33.wav voice=clip delayMs=190
  94121 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  94121 tv    speak        text=i23.wav voice=clip delayMs=190
  94216 tv    clip         src=g54.wav muted=false ready=true delayMs=190
  94216 tv    speak        text=g54.wav voice=clip delayMs=190
  94309 tv    clip         src=b14.wav muted=false ready=true delayMs=190
  94309 tv    speak        text=b14.wav voice=clip delayMs=190
  94500 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  95539 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95801 tv    hush
  95801 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95801 tv    hush
 103405 tv    music:duck   ms=9000
 103405 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108422 tv    hush
 108422 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108422 tv    hush
 112423 tv    ss:cancel    speaking=false pending=false
 112423 tv    music:plan   from=game:bingo to=null
 112423 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113923 tv    music:stop   track=wallpaper.mp3
 114018 tv    ss:cancel    speaking=false pending=false
 114018 tv    music:plan   from=null to=lobby
 114018 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 116537 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 116545 tv    ss:cancel    speaking=false pending=false
 116546 tv    music:plan   from=lobby to=game:bingo
 116546 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 116546 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116550 tv    hush
 116550 tv    hush
 117160 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117347 tv    music:stop   track=local-forecast-elevator.mp3
 118552 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 118689 tv    ss:cancel    speaking=false pending=false
 118689 tv    music:plan   from=game:bingo to=null
 118689 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 120191 tv    music:stop   track=cool-vibes.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 120817 tv    ss:cancel    speaking=false pending=false
 120817 tv    music:plan   from=null to=lobby
 120817 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 124163 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 124171 tv    ss:cancel    speaking=false pending=false
 124173 tv    music:plan   from=lobby to=game:bingo
 124173 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 124173 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 124177 tv    hush
 124177 tv    hush
 124600 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 124600 tv    speak        text=i21.wav voice=clip delayMs=190
 124600 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 124791 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124975 tv    music:stop   track=bossa-antigua.mp3
 125103 tv    ss:cancel    speaking=false pending=false
 125103 tv    music:plan   from=game:bingo to=null
 125107 tv    ss:cancel    speaking=false pending=false
 125107 tv    music:plan   from=null to=lobby
 125107 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 125909 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 130672 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131104 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131537 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131970 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132387 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 133436 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 134033 tv    ss:cancel    speaking=false pending=false
 134038 tv    music:plan   from=lobby to=null
 134038 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 135298 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135541 tv    music:stop   track=bossa-antigua.mp3
 136889 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 138191 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 139506 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140518 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141560 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144106 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144295 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144482 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144671 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.3}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 145767 tv    ss:cancel    speaking=false pending=false
 145769 tv    ss:cancel    speaking=false pending=false
 145769 tv    music:plan   from=null to=lobby
 145769 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 147796 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 147801 tv    ss:cancel    speaking=false pending=false
 147808 tv    music:plan   from=lobby to=null
 147808 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149309 tv    music:stop   track=george-street-shuffle.mp3
 149344 tv    music:plan   from=null to=game:broken-pencil
 149344 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 149344 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150812 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151286 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151444 tv    music:plan   from=game:broken-pencil to=null
 151444 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 152944 tv    music:stop   track=backbay-lounge.mp3
```
