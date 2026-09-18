# Audio interaction trace

Captured 2026-09-18T16:22:56.707Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**54 / 54 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.4}]

```
   1748 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1774 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3084 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3203 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3901 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4535 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
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
   6235 tv    music:plan   from=lobby to=null
   6235 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7736 tv    music:stop   track=airport-lounge.mp3
   8181 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9478 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16431 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17442 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18439 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19438 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20434 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21239 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22049 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22204 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22358 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22516 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22675 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22834 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22976 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23134 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23290 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23447 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23606 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23761 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23918 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24075 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24239 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24394 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24551 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24707 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24868 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25750 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26068 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27876 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29599 tv    ss:cancel    speaking=false pending=false
  29599 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31148 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33299 tv    ss:cancel    speaking=false pending=false
  33299 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34849 tv    ss:cancel    speaking=false pending=false
  34849 tv    music:plan   from=null to=lobby
  34849 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+956ms phone@+960ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18}]
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
  36409 tv    music:plan   from=lobby to=game:bingo
  36409 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36409 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36714 tv    hush
  36714 tv    hush
  37210 tv    music:stop   track=bossa-antigua.mp3
  37325 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38416 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39417 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40416 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41413 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  41413 tv    speak        text=b9.wav voice=clip delayMs=190
  41414 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41606 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43044 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  43044 tv    speak        text=b8.wav voice=clip delayMs=190
  43235 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44874 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  44874 tv    speak        text=n34.wav voice=clip delayMs=190
  45065 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46732 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  46996 tv    hush
  46996 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  46996 tv    hush
  52349 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55348 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56349 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57350 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58349 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  58349 tv    speak        text=n35.wav voice=clip delayMs=190
  58540 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60150 tv    music:paused paused=true
  60150 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61399 tv    music:paused paused=false
  61399 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62705 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  62705 tv    speak        text=i25.wav voice=clip delayMs=190
  62831 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  62831 tv    speak        text=n45.wav voice=clip delayMs=190
  62940 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  62940 tv    speak        text=n33.wav voice=clip delayMs=190
  63066 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  63066 tv    speak        text=g49.wav voice=clip delayMs=190
  63193 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  63193 tv    speak        text=b4.wav voice=clip delayMs=190
  63320 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  63320 tv    speak        text=i20.wav voice=clip delayMs=190
  63447 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  63447 tv    speak        text=o69.wav voice=clip delayMs=190
  63572 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  63572 tv    speak        text=o67.wav voice=clip delayMs=190
  63698 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  63698 tv    speak        text=o65.wav voice=clip delayMs=190
  63823 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  63823 tv    speak        text=o73.wav voice=clip delayMs=190
  63952 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  63952 tv    speak        text=i21.wav voice=clip delayMs=190
  64076 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  64076 tv    speak        text=i18.wav voice=clip delayMs=190
  64201 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  64201 tv    speak        text=g58.wav voice=clip delayMs=190
  64326 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  64326 tv    speak        text=n36.wav voice=clip delayMs=190
  64454 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  64454 tv    speak        text=o61.wav voice=clip delayMs=190
  64580 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  64580 tv    speak        text=n37.wav voice=clip delayMs=190
  64706 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  64706 tv    speak        text=i16.wav voice=clip delayMs=190
  64834 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  64834 tv    speak        text=g47.wav voice=clip delayMs=190
  64960 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  64960 tv    speak        text=n41.wav voice=clip delayMs=190
  65086 tv    clip         src=b6.wav muted=false ready=true delayMs=190
  65086 tv    speak        text=b6.wav voice=clip delayMs=190
  65212 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  65212 tv    speak        text=o72.wav voice=clip delayMs=190
  65338 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  65338 tv    speak        text=b3.wav voice=clip delayMs=190
  65464 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  65464 tv    speak        text=i30.wav voice=clip delayMs=190
  65591 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  65591 tv    speak        text=g56.wav voice=clip delayMs=190
  65716 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  65716 tv    speak        text=o75.wav voice=clip delayMs=190
  65842 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  65842 tv    speak        text=b1.wav voice=clip delayMs=190
  65967 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  65967 tv    speak        text=b2.wav voice=clip delayMs=190
  66094 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  66094 tv    speak        text=n32.wav voice=clip delayMs=190
  66221 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  66221 tv    speak        text=g48.wav voice=clip delayMs=190
  66330 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  66330 tv    speak        text=i23.wav voice=clip delayMs=190
  66442 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  66442 tv    speak        text=i26.wav voice=clip delayMs=190
  66568 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  66568 tv    speak        text=o66.wav voice=clip delayMs=190
  66694 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  66694 tv    speak        text=i19.wav voice=clip delayMs=190
  66821 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  66821 tv    speak        text=n42.wav voice=clip delayMs=190
  66948 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  66948 tv    speak        text=i24.wav voice=clip delayMs=190
  67074 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  67074 tv    speak        text=n39.wav voice=clip delayMs=190
  67201 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  67201 tv    speak        text=g46.wav voice=clip delayMs=190
  67325 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  67325 tv    speak        text=n44.wav voice=clip delayMs=190
  67450 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  67450 tv    speak        text=b15.wav voice=clip delayMs=190
  67576 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  67576 tv    speak        text=b11.wav voice=clip delayMs=190
  67702 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  67702 tv    speak        text=g57.wav voice=clip delayMs=190
  67893 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  68315 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68591 tv    hush
  68592 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68592 tv    hush
  70465 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73946 tv    music:duck   ms=9000
  73946 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  78738 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79065 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80067 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81067 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82061 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  82062 tv    speak        text=g57.wav voice=clip delayMs=190
  82253 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84376 tv    ss:cancel    speaking=false pending=false
  84376 tv    music:plan   from=game:bingo to=null
  84379 tv    ss:cancel    speaking=false pending=false
  84379 tv    music:plan   from=null to=lobby
  84379 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  85181 tv    music:stop   track=wallpaper.mp3
  86893 tv    ss:cancel    speaking=false pending=false
  86903 tv    music:plan   from=lobby to=game:bingo
  86903 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86903 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86907 tv    hush
  86908 tv    hush
  87512 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  87512 tv    speak        text=i21.wav voice=clip delayMs=190
  87512 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  87528 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  87528 tv    speak        text=n32.wav voice=clip delayMs=190
  87621 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  87621 tv    speak        text=i18.wav voice=clip delayMs=190
  87704 tv    music:stop   track=airport-lounge.mp3
  87711 tv    clip         src=n40.wav muted=false ready=true delayMs=190
  87711 tv    speak        text=n40.wav voice=clip delayMs=190
  87813 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  87813 tv    speak        text=i30.wav voice=clip delayMs=190
  87906 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  87906 tv    speak        text=o69.wav voice=clip delayMs=190
  88000 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  88000 tv    speak        text=o61.wav voice=clip delayMs=190
  88094 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  88094 tv    speak        text=n34.wav voice=clip delayMs=190
  88189 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  88189 tv    speak        text=n35.wav voice=clip delayMs=190
  88283 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  88283 tv    speak        text=o67.wav voice=clip delayMs=190
  88378 tv    clip         src=g55.wav muted=false ready=true delayMs=190
  88378 tv    speak        text=g55.wav voice=clip delayMs=190
  88471 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  88471 tv    speak        text=i26.wav voice=clip delayMs=190
  88568 tv    clip         src=i22.wav muted=false ready=true delayMs=190
  88568 tv    speak        text=i22.wav voice=clip delayMs=190
  88663 tv    clip         src=i29.wav muted=false ready=true delayMs=190
  88663 tv    speak        text=i29.wav voice=clip delayMs=190
  88758 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  88758 tv    speak        text=o66.wav voice=clip delayMs=190
  88852 tv    clip         src=g51.wav muted=false ready=true delayMs=190
  88852 tv    speak        text=g51.wav voice=clip delayMs=190
  88947 tv    clip         src=g53.wav muted=false ready=true delayMs=190
  88947 tv    speak        text=g53.wav voice=clip delayMs=190
  89044 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  89044 tv    speak        text=b9.wav voice=clip delayMs=190
  89139 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  89139 tv    speak        text=n36.wav voice=clip delayMs=190
  89234 tv    clip         src=g52.wav muted=false ready=true delayMs=190
  89234 tv    speak        text=g52.wav voice=clip delayMs=190
  89330 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  89330 tv    speak        text=b1.wav voice=clip delayMs=190
  89421 tv    clip         src=b13.wav muted=false ready=true delayMs=190
  89421 tv    speak        text=b13.wav voice=clip delayMs=190
  89500 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  89500 tv    speak        text=n37.wav voice=clip delayMs=190
  89594 tv    clip         src=o71.wav muted=false ready=true delayMs=190
  89594 tv    speak        text=o71.wav voice=clip delayMs=190
  89690 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  89690 tv    speak        text=b8.wav voice=clip delayMs=190
  89783 tv    clip         src=b5.wav muted=false ready=true delayMs=190
  89783 tv    speak        text=b5.wav voice=clip delayMs=190
  89878 tv    clip         src=b7.wav muted=false ready=true delayMs=190
  89878 tv    speak        text=b7.wav voice=clip delayMs=190
  89973 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  89973 tv    speak        text=n42.wav voice=clip delayMs=190
  90068 tv    clip         src=i28.wav muted=false ready=true delayMs=190
  90068 tv    speak        text=i28.wav voice=clip delayMs=190
  90161 tv    clip         src=i27.wav muted=false ready=true delayMs=190
  90161 tv    speak        text=i27.wav voice=clip delayMs=190
  90241 tv    clip         src=o63.wav muted=false ready=true delayMs=190
  90241 tv    speak        text=o63.wav voice=clip delayMs=190
  90335 tv    clip         src=o64.wav muted=false ready=true delayMs=190
  90335 tv    speak        text=o64.wav voice=clip delayMs=190
  90430 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  90430 tv    speak        text=o73.wav voice=clip delayMs=190
  90526 tv    clip         src=g50.wav muted=false ready=true delayMs=190
  90526 tv    speak        text=g50.wav voice=clip delayMs=190
  90606 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  90606 tv    speak        text=g48.wav voice=clip delayMs=190
  90699 tv    clip         src=b12.wav muted=false ready=true delayMs=190
  90699 tv    speak        text=b12.wav voice=clip delayMs=190
  90794 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  90794 tv    speak        text=n45.wav voice=clip delayMs=190
  90890 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  90890 tv    speak        text=b4.wav voice=clip delayMs=190
  90984 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  90984 tv    speak        text=g46.wav voice=clip delayMs=190
  91079 tv    clip         src=o74.wav muted=false ready=true delayMs=190
  91079 tv    speak        text=o74.wav voice=clip delayMs=190
  91173 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  91173 tv    speak        text=g47.wav voice=clip delayMs=190
  91269 tv    clip         src=n31.wav muted=false ready=true delayMs=190
  91269 tv    speak        text=n31.wav voice=clip delayMs=190
  91363 tv    clip         src=o62.wav muted=false ready=true delayMs=190
  91363 tv    speak        text=o62.wav voice=clip delayMs=190
  91457 tv    clip         src=b10.wav muted=false ready=true delayMs=190
  91457 tv    speak        text=b10.wav voice=clip delayMs=190
  91553 tv    clip         src=g60.wav muted=false ready=true delayMs=190
  91553 tv    speak        text=g60.wav voice=clip delayMs=190
  91649 tv    clip         src=n38.wav muted=false ready=true delayMs=190
  91649 tv    speak        text=n38.wav voice=clip delayMs=190
  91743 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  91743 tv    speak        text=n39.wav voice=clip delayMs=190
  91836 tv    clip         src=o70.wav muted=false ready=true delayMs=190
  91836 tv    speak        text=o70.wav voice=clip delayMs=190
  91929 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  91929 tv    speak        text=b11.wav voice=clip delayMs=190
  92023 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  92023 tv    speak        text=o75.wav voice=clip delayMs=190
  92118 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  92118 tv    speak        text=g58.wav voice=clip delayMs=190
  92214 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  92214 tv    speak        text=b15.wav voice=clip delayMs=190
  92308 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  92308 tv    speak        text=i24.wav voice=clip delayMs=190
  92402 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  92402 tv    speak        text=o72.wav voice=clip delayMs=190
  92496 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  92496 tv    speak        text=g56.wav voice=clip delayMs=190
  92589 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  92589 tv    speak        text=i20.wav voice=clip delayMs=190
  92683 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  92683 tv    speak        text=n44.wav voice=clip delayMs=190
  92778 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  92778 tv    speak        text=b3.wav voice=clip delayMs=190
  92872 tv    clip         src=o68.wav muted=false ready=true delayMs=190
  92872 tv    speak        text=o68.wav voice=clip delayMs=190
  92967 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  92967 tv    speak        text=b2.wav voice=clip delayMs=190
  93061 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  93061 tv    speak        text=n41.wav voice=clip delayMs=190
  93156 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  93156 tv    speak        text=o65.wav voice=clip delayMs=190
  93251 tv    clip         src=i17.wav muted=false ready=true delayMs=190
  93251 tv    speak        text=i17.wav voice=clip delayMs=190
  93346 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  93346 tv    speak        text=i25.wav voice=clip delayMs=190
  93441 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  93441 tv    speak        text=i19.wav voice=clip delayMs=190
  93534 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  93534 tv    speak        text=g57.wav voice=clip delayMs=190
  93630 tv    clip         src=g59.wav muted=false ready=true delayMs=190
  93630 tv    speak        text=g59.wav voice=clip delayMs=190
  93725 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  93725 tv    speak        text=g49.wav voice=clip delayMs=190
  93819 tv    clip         src=n43.wav muted=false ready=true delayMs=190
  93819 tv    speak        text=n43.wav voice=clip delayMs=190
  93913 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  93913 tv    speak        text=i16.wav voice=clip delayMs=190
  94009 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  94009 tv    speak        text=n33.wav voice=clip delayMs=190
  94103 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  94103 tv    speak        text=i23.wav voice=clip delayMs=190
  94199 tv    clip         src=g54.wav muted=false ready=true delayMs=190
  94199 tv    speak        text=g54.wav voice=clip delayMs=190
  94292 tv    clip         src=b14.wav muted=false ready=true delayMs=190
  94292 tv    speak        text=b14.wav voice=clip delayMs=190
  94483 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  95514 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95778 tv    hush
  95779 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95779 tv    hush
 103384 tv    music:duck   ms=9000
 103384 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108396 tv    hush
 108397 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108397 tv    hush
 112395 tv    ss:cancel    speaking=false pending=false
 112395 tv    music:plan   from=game:bingo to=null
 112395 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113896 tv    music:stop   track=wallpaper.mp3
 114008 tv    ss:cancel    speaking=false pending=false
 114008 tv    music:plan   from=null to=lobby
 114008 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 116521 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 116530 tv    ss:cancel    speaking=false pending=false
 116532 tv    music:plan   from=lobby to=game:bingo
 116532 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116532 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116536 tv    hush
 116536 tv    hush
 117148 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117334 tv    music:stop   track=local-forecast-elevator.mp3
 118538 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 118679 tv    ss:cancel    speaking=false pending=false
 118679 tv    music:plan   from=game:bingo to=null
 118679 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 120179 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 120791 tv    ss:cancel    speaking=false pending=false
 120791 tv    music:plan   from=null to=lobby
 120791 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 124145 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 124154 tv    ss:cancel    speaking=false pending=false
 124157 tv    music:plan   from=lobby to=game:bingo
 124157 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 124157 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 124160 tv    hush
 124161 tv    hush
 124573 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 124573 tv    speak        text=i21.wav voice=clip delayMs=190
 124573 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 124765 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124959 tv    music:stop   track=george-street-shuffle.mp3
 125076 tv    ss:cancel    speaking=false pending=false
 125076 tv    music:plan   from=game:bingo to=null
 125079 tv    ss:cancel    speaking=false pending=false
 125079 tv    music:plan   from=null to=lobby
 125079 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 125881 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 130645 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131078 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131496 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131928 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132344 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 133427 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 134034 tv    ss:cancel    speaking=false pending=false
 134039 tv    music:plan   from=lobby to=null
 134039 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 135297 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135539 tv    music:stop   track=local-forecast-elevator.mp3
 136879 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 138180 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 139480 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140479 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141522 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144080 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144268 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144459 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144649 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 145723 tv    ss:cancel    speaking=false pending=false
 145726 tv    ss:cancel    speaking=false pending=false
 145726 tv    music:plan   from=null to=lobby
 145726 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 147744 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 147750 tv    ss:cancel    speaking=false pending=false
 147752 tv    music:plan   from=lobby to=null
 147752 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149253 tv    music:stop   track=bossa-antigua.mp3
 149308 tv    music:plan   from=null to=game:broken-pencil
 149308 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 149308 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150788 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151261 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151418 tv    music:plan   from=game:broken-pencil to=null
 151418 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 152919 tv    music:stop   track=hep-cats.mp3
```
