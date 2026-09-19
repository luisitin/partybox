# Audio interaction trace

Captured 2026-09-19T04:20:55.409Z on port 42112. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**72 / 72 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:bossa-antigua
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":4.4}]

```
   1768 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   1795 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3109 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3264 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3963 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4597 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5447 tv    ss:cancel    speaking=false pending=false
```

## B · Lightning Round: start, phases, lock-in, last five seconds, final reveal, results

- ✅ **game start → start cue, lobby music fades to none (Lightning plays beds, not tracks)** — cues=start; plan=lobby→null
- ✅ **no track audible during Lightning; the intro bed is the marimba** — playing=[] bed=marimba
- ✅ **question phase → the generic phase chime (unmapped)** — cues=phase
- ✅ **question → the pulse bed** — bed=pulse
- ✅ **the phase chime ducks the pulse bed once** — bed:duck events=1
- ✅ **a lock tick does not duck the pulse bed (light cue)** — bed:duck events=0
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
   6304 tv    music:plan   from=lobby to=null
   6304 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7808 tv    music:stop   track=bossa-antigua.mp3
   8250 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   8250 tv    bed:duck     bed=pulse cue=phase
   9549 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16514 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17501 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18507 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19503 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20513 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21317 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  21317 tv    bed:duck     bed=pulse cue=reveal
  22117 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22117 tv    bed:duck     bed=pulse cue=phase
  22261 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22261 tv    bed:duck     bed=pulse cue=reveal
  22417 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22417 tv    bed:duck     bed=pulse cue=phase
  22575 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22575 tv    bed:duck     bed=pulse cue=reveal
  22730 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22730 tv    bed:duck     bed=pulse cue=phase
  22887 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22887 tv    bed:duck     bed=pulse cue=reveal
  23044 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23044 tv    bed:duck     bed=pulse cue=phase
  23201 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23201 tv    bed:duck     bed=pulse cue=reveal
  23344 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23344 tv    bed:duck     bed=pulse cue=phase
  23501 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23501 tv    bed:duck     bed=pulse cue=reveal
  23658 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23658 tv    bed:duck     bed=pulse cue=phase
  23817 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23817 tv    bed:duck     bed=pulse cue=reveal
  23974 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23974 tv    bed:duck     bed=pulse cue=phase
  24128 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24128 tv    bed:duck     bed=pulse cue=reveal
  24271 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24271 tv    bed:duck     bed=pulse cue=phase
  24426 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24426 tv    bed:duck     bed=pulse cue=reveal
  24570 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24570 tv    bed:duck     bed=pulse cue=phase
  24727 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24727 tv    bed:duck     bed=pulse cue=reveal
  24875 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  24875 tv    bed:duck     bed=latenight cue=wager
  25755 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  25755 tv    bed:duck     bed=pulse cue=phase
  26086 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  26086 tv    bed:duck     bed=pulse cue=silence
  27898 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  27898 tv    bed:duck     bed=pulse cue=bust
  29624 tv    ss:cancel    speaking=false pending=false
  29624 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":1.5}]

```
  31189 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33338 tv    ss:cancel    speaking=false pending=false
  33338 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34890 tv    ss:cancel    speaking=false pending=false
  34890 tv    music:plan   from=null to=lobby
  34890 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:george-street-shuffle.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime** — cues=start,card,lock,lock,tick,tick,tick,call
- ✅ **the hand feels each card land (one 12 ms tap per card) and then the first call** — taps(12)=2 (1 card + the first call)
- ✅ **each Ready ticks (lock, rising); the 3 · 2 · 1's first tick comes a breath (≥ 300 ms) after the last** — locks=2 last lock→first tick=418ms
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+1026ms phone@+1025ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "another" is a 20 ms tap and one card pluck; Ready a 20 ms tap and the submit cue** — taps=3 cues=card,submit
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **each voice starts on the push (no delay); its boing lands on the squash, 170–230 ms later** — delays=0,0 boing lags=197,193ms
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":19}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":25.9}]
- ✅ **skipping through the deck: a hush before every call, one voice at a time** — clips=41 hushes=41
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5363ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":40.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the winner's celebration buzz (320 ms) runs whole — nothing shorter cuts it** — celebration@74586 cut by=[]
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5416ms cheer@+5378ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36467 tv    music:plan   from=lobby to=game:bingo
  36467 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36468 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36778 tv    hush
  36779 tv    hush
  37279 tv    music:stop   track=george-street-shuffle.mp3
  37429 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  39541 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  40063 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
  40481 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41485 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  42480 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  43468 tv    hush
  43468 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  43468 tv    speak        text=b9.wav voice=clip delayMs=0
  43469 tv    hush
  43660 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44047 tv    hush
  44048 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  44048 tv    speak        text=b8.wav voice=clip delayMs=0
  44245 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45874 tv    hush
  45874 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  45874 tv    speak        text=n34.wav voice=clip delayMs=0
  46067 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  47759 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  48033 tv    hush
  48033 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  48034 tv    hush
  53387 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  56400 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57406 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58410 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  59417 tv    hush
  59417 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  59417 tv    speak        text=n35.wav voice=clip delayMs=0
  59613 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61209 tv    music:paused paused=true
  61209 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  62458 tv    music:paused paused=false
  62458 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  63764 tv    hush
  63764 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  63764 tv    speak        text=i25.wav voice=clip delayMs=0
  63892 tv    hush
  63892 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  63892 tv    speak        text=n45.wav voice=clip delayMs=0
  64016 tv    hush
  64016 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  64016 tv    speak        text=n33.wav voice=clip delayMs=0
  64141 tv    hush
  64141 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  64141 tv    speak        text=g49.wav voice=clip delayMs=0
  64269 tv    hush
  64269 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  64269 tv    speak        text=b4.wav voice=clip delayMs=0
  64397 tv    hush
  64397 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  64397 tv    speak        text=i20.wav voice=clip delayMs=0
  64521 tv    hush
  64521 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  64521 tv    speak        text=o69.wav voice=clip delayMs=0
  64648 tv    hush
  64648 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  64648 tv    speak        text=o67.wav voice=clip delayMs=0
  64771 tv    hush
  64771 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  64771 tv    speak        text=o65.wav voice=clip delayMs=0
  64903 tv    hush
  64903 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  64903 tv    speak        text=o73.wav voice=clip delayMs=0
  65027 tv    hush
  65027 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  65027 tv    speak        text=i21.wav voice=clip delayMs=0
  65154 tv    hush
  65154 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  65154 tv    speak        text=i18.wav voice=clip delayMs=0
  65279 tv    hush
  65279 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  65279 tv    speak        text=g58.wav voice=clip delayMs=0
  65405 tv    hush
  65405 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  65405 tv    speak        text=n36.wav voice=clip delayMs=0
  65533 tv    hush
  65533 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  65533 tv    speak        text=o61.wav voice=clip delayMs=0
  65658 tv    hush
  65658 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  65658 tv    speak        text=n37.wav voice=clip delayMs=0
  65784 tv    hush
  65784 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  65784 tv    speak        text=i16.wav voice=clip delayMs=0
  65908 tv    hush
  65908 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  65908 tv    speak        text=g47.wav voice=clip delayMs=0
  66032 tv    hush
  66032 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  66032 tv    speak        text=n41.wav voice=clip delayMs=0
  66161 tv    hush
  66161 tv    clip         src=b6.wav muted=false ready=true delayMs=0
  66161 tv    speak        text=b6.wav voice=clip delayMs=0
  66286 tv    hush
  66286 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  66286 tv    speak        text=o72.wav voice=clip delayMs=0
  66398 tv    hush
  66398 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  66398 tv    speak        text=b3.wav voice=clip delayMs=0
  66507 tv    hush
  66507 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  66507 tv    speak        text=i30.wav voice=clip delayMs=0
  66634 tv    hush
  66634 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  66634 tv    speak        text=g56.wav voice=clip delayMs=0
  66762 tv    hush
  66762 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  66762 tv    speak        text=o75.wav voice=clip delayMs=0
  66887 tv    hush
  66887 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  66887 tv    speak        text=b1.wav voice=clip delayMs=0
  67012 tv    hush
  67012 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  67012 tv    speak        text=b2.wav voice=clip delayMs=0
  67139 tv    hush
  67139 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  67139 tv    speak        text=n32.wav voice=clip delayMs=0
  67267 tv    hush
  67267 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  67267 tv    speak        text=g48.wav voice=clip delayMs=0
  67395 tv    hush
  67395 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  67395 tv    speak        text=i23.wav voice=clip delayMs=0
  67518 tv    hush
  67518 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  67518 tv    speak        text=i26.wav voice=clip delayMs=0
  67643 tv    hush
  67643 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  67643 tv    speak        text=o66.wav voice=clip delayMs=0
  67771 tv    hush
  67771 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  67771 tv    speak        text=i19.wav voice=clip delayMs=0
  67898 tv    hush
  67898 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  67898 tv    speak        text=n42.wav voice=clip delayMs=0
  68024 tv    hush
  68024 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  68024 tv    speak        text=i24.wav voice=clip delayMs=0
  68151 tv    hush
  68151 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  68151 tv    speak        text=n39.wav voice=clip delayMs=0
  68274 tv    hush
  68274 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  68274 tv    speak        text=g46.wav voice=clip delayMs=0
  68405 tv    hush
  68405 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  68405 tv    speak        text=n44.wav voice=clip delayMs=0
  68527 tv    hush
  68527 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  68527 tv    speak        text=b15.wav voice=clip delayMs=0
  68656 tv    hush
  68656 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  68656 tv    speak        text=b11.wav voice=clip delayMs=0
  68778 tv    hush
  68778 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  68778 tv    speak        text=g57.wav voice=clip delayMs=0
  68975 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  69407 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  69670 tv    hush
  69670 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  69671 tv    hush
  71562 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  75033 tv    music:duck   ms=9000
  75033 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  79884 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  80206 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81212 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82211 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  83207 tv    hush
  83207 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  83207 tv    speak        text=g57.wav voice=clip delayMs=0
  83403 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  85517 tv    ss:cancel    speaking=false pending=false
  85517 tv    music:plan   from=game:bingo to=null
  85523 tv    ss:cancel    speaking=false pending=false
  85523 tv    music:plan   from=null to=lobby
  85523 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  86339 tv    music:stop   track=cool-vibes.mp3
  88050 tv    ss:cancel    speaking=false pending=false
  88066 tv    music:plan   from=lobby to=game:bingo
  88066 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  88066 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  88073 tv    hush
  88074 tv    hush
  88678 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  88682 tv    hush
  88682 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  88682 tv    speak        text=i21.wav voice=clip delayMs=0
  88682 tv    hush
  88694 tv    hush
  88694 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  88694 tv    speak        text=n32.wav voice=clip delayMs=0
  88791 tv    hush
  88791 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  88791 tv    speak        text=i18.wav voice=clip delayMs=0
  88875 tv    music:stop   track=bossa-antigua.mp3
  88885 tv    hush
  88885 tv    clip         src=n40.wav muted=false ready=true delayMs=0
  88885 tv    speak        text=n40.wav voice=clip delayMs=0
  88994 tv    hush
  88994 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  88994 tv    speak        text=i30.wav voice=clip delayMs=0
  89092 tv    hush
  89092 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  89092 tv    speak        text=o69.wav voice=clip delayMs=0
  89190 tv    hush
  89190 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  89190 tv    speak        text=o61.wav voice=clip delayMs=0
  89274 tv    hush
  89274 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  89274 tv    speak        text=n34.wav voice=clip delayMs=0
  89384 tv    hush
  89384 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  89384 tv    speak        text=n35.wav voice=clip delayMs=0
  89469 tv    hush
  89469 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  89469 tv    speak        text=o67.wav voice=clip delayMs=0
  89580 tv    hush
  89580 tv    clip         src=g55.wav muted=false ready=true delayMs=0
  89580 tv    speak        text=g55.wav voice=clip delayMs=0
  89670 tv    hush
  89670 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  89670 tv    speak        text=i26.wav voice=clip delayMs=0
  89768 tv    hush
  89768 tv    clip         src=i22.wav muted=false ready=true delayMs=0
  89768 tv    speak        text=i22.wav voice=clip delayMs=0
  89866 tv    hush
  89866 tv    clip         src=i29.wav muted=false ready=true delayMs=0
  89866 tv    speak        text=i29.wav voice=clip delayMs=0
  89954 tv    hush
  89954 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  89954 tv    speak        text=o66.wav voice=clip delayMs=0
  90049 tv    hush
  90049 tv    clip         src=g51.wav muted=false ready=true delayMs=0
  90049 tv    speak        text=g51.wav voice=clip delayMs=0
  90143 tv    hush
  90143 tv    clip         src=g53.wav muted=false ready=true delayMs=0
  90143 tv    speak        text=g53.wav voice=clip delayMs=0
  90236 tv    hush
  90236 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  90236 tv    speak        text=b9.wav voice=clip delayMs=0
  90316 tv    hush
  90316 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  90316 tv    speak        text=n36.wav voice=clip delayMs=0
  90425 tv    hush
  90425 tv    clip         src=g52.wav muted=false ready=true delayMs=0
  90425 tv    speak        text=g52.wav voice=clip delayMs=0
  90518 tv    hush
  90518 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  90518 tv    speak        text=b1.wav voice=clip delayMs=0
  90626 tv    hush
  90626 tv    clip         src=b13.wav muted=false ready=true delayMs=0
  90626 tv    speak        text=b13.wav voice=clip delayMs=0
  90723 tv    hush
  90723 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  90723 tv    speak        text=n37.wav voice=clip delayMs=0
  90840 tv    hush
  90840 tv    clip         src=o71.wav muted=false ready=true delayMs=0
  90840 tv    speak        text=o71.wav voice=clip delayMs=0
  90941 tv    hush
  90941 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  90941 tv    speak        text=b8.wav voice=clip delayMs=0
  91041 tv    hush
  91041 tv    clip         src=b5.wav muted=false ready=true delayMs=0
  91041 tv    speak        text=b5.wav voice=clip delayMs=0
  91129 tv    hush
  91129 tv    clip         src=b7.wav muted=false ready=true delayMs=0
  91129 tv    speak        text=b7.wav voice=clip delayMs=0
  91225 tv    hush
  91225 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  91225 tv    speak        text=n42.wav voice=clip delayMs=0
  91319 tv    hush
  91319 tv    clip         src=i28.wav muted=false ready=true delayMs=0
  91319 tv    speak        text=i28.wav voice=clip delayMs=0
  91429 tv    hush
  91429 tv    clip         src=i27.wav muted=false ready=true delayMs=0
  91429 tv    speak        text=i27.wav voice=clip delayMs=0
  91539 tv    hush
  91539 tv    clip         src=o63.wav muted=false ready=true delayMs=0
  91539 tv    speak        text=o63.wav voice=clip delayMs=0
  91631 tv    hush
  91631 tv    clip         src=o64.wav muted=false ready=true delayMs=0
  91631 tv    speak        text=o64.wav voice=clip delayMs=0
  91723 tv    hush
  91723 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  91723 tv    speak        text=o73.wav voice=clip delayMs=0
  91819 tv    hush
  91819 tv    clip         src=g50.wav muted=false ready=true delayMs=0
  91819 tv    speak        text=g50.wav voice=clip delayMs=0
  91914 tv    hush
  91914 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  91914 tv    speak        text=g48.wav voice=clip delayMs=0
  92007 tv    hush
  92007 tv    clip         src=b12.wav muted=false ready=true delayMs=0
  92007 tv    speak        text=b12.wav voice=clip delayMs=0
  92102 tv    hush
  92102 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  92102 tv    speak        text=n45.wav voice=clip delayMs=0
  92200 tv    hush
  92200 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  92200 tv    speak        text=b4.wav voice=clip delayMs=0
  92307 tv    hush
  92307 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  92307 tv    speak        text=g46.wav voice=clip delayMs=0
  92385 tv    hush
  92385 tv    clip         src=o74.wav muted=false ready=true delayMs=0
  92385 tv    speak        text=o74.wav voice=clip delayMs=0
  92486 tv    hush
  92486 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  92486 tv    speak        text=g47.wav voice=clip delayMs=0
  92588 tv    hush
  92588 tv    clip         src=n31.wav muted=false ready=true delayMs=0
  92588 tv    speak        text=n31.wav voice=clip delayMs=0
  92685 tv    hush
  92685 tv    clip         src=o62.wav muted=false ready=true delayMs=0
  92685 tv    speak        text=o62.wav voice=clip delayMs=0
  92777 tv    hush
  92777 tv    clip         src=b10.wav muted=false ready=true delayMs=0
  92777 tv    speak        text=b10.wav voice=clip delayMs=0
  92879 tv    hush
  92879 tv    clip         src=g60.wav muted=false ready=true delayMs=0
  92879 tv    speak        text=g60.wav voice=clip delayMs=0
  92969 tv    hush
  92969 tv    clip         src=n38.wav muted=false ready=true delayMs=0
  92969 tv    speak        text=n38.wav voice=clip delayMs=0
  93065 tv    hush
  93065 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  93065 tv    speak        text=n39.wav voice=clip delayMs=0
  93170 tv    hush
  93170 tv    clip         src=o70.wav muted=false ready=true delayMs=0
  93170 tv    speak        text=o70.wav voice=clip delayMs=0
  93277 tv    hush
  93277 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  93277 tv    speak        text=b11.wav voice=clip delayMs=0
  93386 tv    hush
  93386 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  93386 tv    speak        text=o75.wav voice=clip delayMs=0
  93464 tv    hush
  93464 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  93464 tv    speak        text=g58.wav voice=clip delayMs=0
  93558 tv    hush
  93558 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  93558 tv    speak        text=b15.wav voice=clip delayMs=0
  93654 tv    hush
  93654 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  93654 tv    speak        text=i24.wav voice=clip delayMs=0
  93748 tv    hush
  93748 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  93748 tv    speak        text=o72.wav voice=clip delayMs=0
  93842 tv    hush
  93842 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  93842 tv    speak        text=g56.wav voice=clip delayMs=0
  93954 tv    hush
  93954 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  93954 tv    speak        text=i20.wav voice=clip delayMs=0
  94043 tv    hush
  94043 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  94043 tv    speak        text=n44.wav voice=clip delayMs=0
  94145 tv    hush
  94145 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  94145 tv    speak        text=b3.wav voice=clip delayMs=0
  94235 tv    hush
  94235 tv    clip         src=o68.wav muted=false ready=true delayMs=0
  94235 tv    speak        text=o68.wav voice=clip delayMs=0
  94335 tv    hush
  94335 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  94335 tv    speak        text=b2.wav voice=clip delayMs=0
  94422 tv    hush
  94422 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  94422 tv    speak        text=n41.wav voice=clip delayMs=0
  94517 tv    hush
  94517 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  94517 tv    speak        text=o65.wav voice=clip delayMs=0
  94612 tv    hush
  94612 tv    clip         src=i17.wav muted=false ready=true delayMs=0
  94612 tv    speak        text=i17.wav voice=clip delayMs=0
  94703 tv    hush
  94703 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  94703 tv    speak        text=i25.wav voice=clip delayMs=0
  94801 tv    hush
  94801 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  94801 tv    speak        text=i19.wav voice=clip delayMs=0
  94895 tv    hush
  94895 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  94895 tv    speak        text=g57.wav voice=clip delayMs=0
  94987 tv    hush
  94987 tv    clip         src=g59.wav muted=false ready=true delayMs=0
  94987 tv    speak        text=g59.wav voice=clip delayMs=0
  95078 tv    hush
  95078 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  95078 tv    speak        text=g49.wav voice=clip delayMs=0
  95174 tv    hush
  95174 tv    clip         src=n43.wav muted=false ready=true delayMs=0
  95174 tv    speak        text=n43.wav voice=clip delayMs=0
  95268 tv    hush
  95268 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  95268 tv    speak        text=i16.wav voice=clip delayMs=0
  95363 tv    hush
  95363 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  95363 tv    speak        text=n33.wav voice=clip delayMs=0
  95442 tv    hush
  95442 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  95442 tv    speak        text=i23.wav voice=clip delayMs=0
  95522 tv    hush
  95522 tv    clip         src=g54.wav muted=false ready=true delayMs=0
  95522 tv    speak        text=g54.wav voice=clip delayMs=0
  95617 tv    hush
  95617 tv    clip         src=b14.wav muted=false ready=true delayMs=0
  95617 tv    speak        text=b14.wav voice=clip delayMs=0
  95810 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  96888 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  97153 tv    hush
  97153 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  97153 tv    hush
 104760 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 104768 tv    music:duck   ms=9000
 104768 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 109774 tv    hush
 109774 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 109775 tv    hush
 113780 tv    ss:cancel    speaking=false pending=false
 113780 tv    music:plan   from=game:bingo to=null
 113780 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 115282 tv    music:stop   track=cool-vibes.mp3
 115414 tv    ss:cancel    speaking=false pending=false
 115414 tv    music:plan   from=null to=lobby
 115414 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 117939 tv    ss:cancel    speaking=false pending=false
 117955 tv    music:plan   from=lobby to=game:bingo
 117955 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 117955 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 117962 tv    hush
 117962 tv    hush
 118557 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 118561 tv    hush
 118561 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 118561 tv    speak        text=i21.wav voice=clip delayMs=0
 118561 tv    hush
 118576 tv    hush
 118576 tv    clip         src=n32.wav muted=false ready=true delayMs=0
 118576 tv    speak        text=n32.wav voice=clip delayMs=0
 118656 tv    hush
 118656 tv    clip         src=i18.wav muted=false ready=true delayMs=0
 118656 tv    speak        text=i18.wav voice=clip delayMs=0
 118750 tv    hush
 118750 tv    clip         src=n40.wav muted=false ready=true delayMs=0
 118750 tv    speak        text=n40.wav voice=clip delayMs=0
 118758 tv    music:stop   track=bossa-antigua.mp3
 118843 tv    hush
 118843 tv    clip         src=i30.wav muted=false ready=true delayMs=0
 118843 tv    speak        text=i30.wav voice=clip delayMs=0
 118938 tv    hush
 118938 tv    clip         src=o69.wav muted=false ready=true delayMs=0
 118938 tv    speak        text=o69.wav voice=clip delayMs=0
 119033 tv    hush
 119033 tv    clip         src=o61.wav muted=false ready=true delayMs=0
 119033 tv    speak        text=o61.wav voice=clip delayMs=0
 119127 tv    hush
 119127 tv    clip         src=n34.wav muted=false ready=true delayMs=0
 119127 tv    speak        text=n34.wav voice=clip delayMs=0
 119222 tv    hush
 119222 tv    clip         src=n35.wav muted=false ready=true delayMs=0
 119222 tv    speak        text=n35.wav voice=clip delayMs=0
 119303 tv    hush
 119303 tv    clip         src=o67.wav muted=false ready=true delayMs=0
 119303 tv    speak        text=o67.wav voice=clip delayMs=0
 119411 tv    hush
 119411 tv    clip         src=g55.wav muted=false ready=true delayMs=0
 119411 tv    speak        text=g55.wav voice=clip delayMs=0
 119506 tv    hush
 119506 tv    clip         src=i26.wav muted=false ready=true delayMs=0
 119506 tv    speak        text=i26.wav voice=clip delayMs=0
 119601 tv    hush
 119601 tv    clip         src=i22.wav muted=false ready=true delayMs=0
 119601 tv    speak        text=i22.wav voice=clip delayMs=0
 119694 tv    hush
 119694 tv    clip         src=i29.wav muted=false ready=true delayMs=0
 119694 tv    speak        text=i29.wav voice=clip delayMs=0
 119788 tv    hush
 119789 tv    clip         src=o66.wav muted=false ready=true delayMs=0
 119789 tv    speak        text=o66.wav voice=clip delayMs=0
 119884 tv    hush
 119884 tv    clip         src=g51.wav muted=false ready=true delayMs=0
 119884 tv    speak        text=g51.wav voice=clip delayMs=0
 119979 tv    hush
 119979 tv    clip         src=g53.wav muted=false ready=true delayMs=0
 119979 tv    speak        text=g53.wav voice=clip delayMs=0
 120074 tv    hush
 120074 tv    clip         src=b9.wav muted=false ready=true delayMs=0
 120074 tv    speak        text=b9.wav voice=clip delayMs=0
 120182 tv    hush
 120182 tv    clip         src=n36.wav muted=false ready=true delayMs=0
 120182 tv    speak        text=n36.wav voice=clip delayMs=0
 120259 tv    hush
 120259 tv    clip         src=g52.wav muted=false ready=true delayMs=0
 120259 tv    speak        text=g52.wav voice=clip delayMs=0
 120354 tv    hush
 120354 tv    clip         src=b1.wav muted=false ready=true delayMs=0
 120354 tv    speak        text=b1.wav voice=clip delayMs=0
 120433 tv    hush
 120433 tv    clip         src=b13.wav muted=false ready=true delayMs=0
 120433 tv    speak        text=b13.wav voice=clip delayMs=0
 120527 tv    hush
 120527 tv    clip         src=n37.wav muted=false ready=true delayMs=0
 120527 tv    speak        text=n37.wav voice=clip delayMs=0
 120622 tv    hush
 120622 tv    clip         src=o71.wav muted=false ready=true delayMs=0
 120622 tv    speak        text=o71.wav voice=clip delayMs=0
 120715 tv    hush
 120715 tv    clip         src=b8.wav muted=false ready=true delayMs=0
 120715 tv    speak        text=b8.wav voice=clip delayMs=0
 120810 tv    hush
 120810 tv    clip         src=b5.wav muted=false ready=true delayMs=0
 120810 tv    speak        text=b5.wav voice=clip delayMs=0
 120907 tv    hush
 120907 tv    clip         src=b7.wav muted=false ready=true delayMs=0
 120907 tv    speak        text=b7.wav voice=clip delayMs=0
 120999 tv    hush
 120999 tv    clip         src=n42.wav muted=false ready=true delayMs=0
 120999 tv    speak        text=n42.wav voice=clip delayMs=0
 121094 tv    hush
 121094 tv    clip         src=i28.wav muted=false ready=true delayMs=0
 121094 tv    speak        text=i28.wav voice=clip delayMs=0
 121188 tv    hush
 121188 tv    clip         src=i27.wav muted=false ready=true delayMs=0
 121188 tv    speak        text=i27.wav voice=clip delayMs=0
 121284 tv    hush
 121284 tv    clip         src=o63.wav muted=false ready=true delayMs=0
 121284 tv    speak        text=o63.wav voice=clip delayMs=0
 121364 tv    hush
 121364 tv    clip         src=o64.wav muted=false ready=true delayMs=0
 121364 tv    speak        text=o64.wav voice=clip delayMs=0
 121459 tv    hush
 121459 tv    clip         src=o73.wav muted=false ready=true delayMs=0
 121459 tv    speak        text=o73.wav voice=clip delayMs=0
 121552 tv    hush
 121552 tv    clip         src=g50.wav muted=false ready=true delayMs=0
 121552 tv    speak        text=g50.wav voice=clip delayMs=0
 121650 tv    hush
 121650 tv    clip         src=g48.wav muted=false ready=true delayMs=0
 121650 tv    speak        text=g48.wav voice=clip delayMs=0
 121741 tv    hush
 121741 tv    clip         src=b12.wav muted=false ready=true delayMs=0
 121741 tv    speak        text=b12.wav voice=clip delayMs=0
 121835 tv    hush
 121835 tv    clip         src=n45.wav muted=false ready=true delayMs=0
 121835 tv    speak        text=n45.wav voice=clip delayMs=0
 121931 tv    hush
 121931 tv    clip         src=b4.wav muted=false ready=true delayMs=0
 121931 tv    speak        text=b4.wav voice=clip delayMs=0
 122024 tv    hush
 122024 tv    clip         src=g46.wav muted=false ready=true delayMs=0
 122024 tv    speak        text=g46.wav voice=clip delayMs=0
 122132 tv    hush
 122132 tv    clip         src=o74.wav muted=false ready=true delayMs=0
 122132 tv    speak        text=o74.wav voice=clip delayMs=0
 122227 tv    hush
 122227 tv    clip         src=g47.wav muted=false ready=true delayMs=0
 122227 tv    speak        text=g47.wav voice=clip delayMs=0
 122322 tv    hush
 122322 tv    clip         src=n31.wav muted=false ready=true delayMs=0
 122322 tv    speak        text=n31.wav voice=clip delayMs=0
 122417 tv    hush
 122417 tv    clip         src=o62.wav muted=false ready=true delayMs=0
 122417 tv    speak        text=o62.wav voice=clip delayMs=0
 122513 tv    hush
 122513 tv    clip         src=b10.wav muted=false ready=true delayMs=0
 122513 tv    speak        text=b10.wav voice=clip delayMs=0
 122619 tv    hush
 122619 tv    clip         src=g60.wav muted=false ready=true delayMs=0
 122619 tv    speak        text=g60.wav voice=clip delayMs=0
 122715 tv    hush
 122715 tv    clip         src=n38.wav muted=false ready=true delayMs=0
 122715 tv    speak        text=n38.wav voice=clip delayMs=0
 122811 tv    hush
 122811 tv    clip         src=n39.wav muted=false ready=true delayMs=0
 122811 tv    speak        text=n39.wav voice=clip delayMs=0
 122906 tv    hush
 122906 tv    clip         src=o70.wav muted=false ready=true delayMs=0
 122906 tv    speak        text=o70.wav voice=clip delayMs=0
 123000 tv    hush
 123000 tv    clip         src=b11.wav muted=false ready=true delayMs=0
 123000 tv    speak        text=b11.wav voice=clip delayMs=0
 123110 tv    hush
 123110 tv    clip         src=o75.wav muted=false ready=true delayMs=0
 123110 tv    speak        text=o75.wav voice=clip delayMs=0
 123188 tv    hush
 123188 tv    clip         src=g58.wav muted=false ready=true delayMs=0
 123188 tv    speak        text=g58.wav voice=clip delayMs=0
 123281 tv    hush
 123281 tv    clip         src=b15.wav muted=false ready=true delayMs=0
 123281 tv    speak        text=b15.wav voice=clip delayMs=0
 123375 tv    hush
 123375 tv    clip         src=i24.wav muted=false ready=true delayMs=0
 123375 tv    speak        text=i24.wav voice=clip delayMs=0
 123470 tv    hush
 123470 tv    clip         src=o72.wav muted=false ready=true delayMs=0
 123470 tv    speak        text=o72.wav voice=clip delayMs=0
 123565 tv    hush
 123565 tv    clip         src=g56.wav muted=false ready=true delayMs=0
 123565 tv    speak        text=g56.wav voice=clip delayMs=0
 123659 tv    hush
 123659 tv    clip         src=i20.wav muted=false ready=true delayMs=0
 123659 tv    speak        text=i20.wav voice=clip delayMs=0
 123753 tv    hush
 123753 tv    clip         src=n44.wav muted=false ready=true delayMs=0
 123753 tv    speak        text=n44.wav voice=clip delayMs=0
 123848 tv    hush
 123848 tv    clip         src=b3.wav muted=false ready=true delayMs=0
 123848 tv    speak        text=b3.wav voice=clip delayMs=0
 123942 tv    hush
 123942 tv    clip         src=o68.wav muted=false ready=true delayMs=0
 123942 tv    speak        text=o68.wav voice=clip delayMs=0
 124036 tv    hush
 124036 tv    clip         src=b2.wav muted=false ready=true delayMs=0
 124036 tv    speak        text=b2.wav voice=clip delayMs=0
 124146 tv    hush
 124146 tv    clip         src=n41.wav muted=false ready=true delayMs=0
 124146 tv    speak        text=n41.wav voice=clip delayMs=0
 124242 tv    hush
 124242 tv    clip         src=o65.wav muted=false ready=true delayMs=0
 124242 tv    speak        text=o65.wav voice=clip delayMs=0
 124335 tv    hush
 124335 tv    clip         src=i17.wav muted=false ready=true delayMs=0
 124335 tv    speak        text=i17.wav voice=clip delayMs=0
 124431 tv    hush
 124431 tv    clip         src=i25.wav muted=false ready=true delayMs=0
 124431 tv    speak        text=i25.wav voice=clip delayMs=0
 124539 tv    hush
 124539 tv    clip         src=i19.wav muted=false ready=true delayMs=0
 124539 tv    speak        text=i19.wav voice=clip delayMs=0
 124633 tv    hush
 124633 tv    clip         src=g57.wav muted=false ready=true delayMs=0
 124633 tv    speak        text=g57.wav voice=clip delayMs=0
 124726 tv    hush
 124726 tv    clip         src=g59.wav muted=false ready=true delayMs=0
 124726 tv    speak        text=g59.wav voice=clip delayMs=0
 124822 tv    hush
 124822 tv    clip         src=g49.wav muted=false ready=true delayMs=0
 124822 tv    speak        text=g49.wav voice=clip delayMs=0
 124916 tv    hush
 124916 tv    clip         src=n43.wav muted=false ready=true delayMs=0
 124916 tv    speak        text=n43.wav voice=clip delayMs=0
 125011 tv    hush
 125011 tv    clip         src=i16.wav muted=false ready=true delayMs=0
 125011 tv    speak        text=i16.wav voice=clip delayMs=0
 125108 tv    hush
 125108 tv    clip         src=n33.wav muted=false ready=true delayMs=0
 125108 tv    speak        text=n33.wav voice=clip delayMs=0
 125200 tv    hush
 125200 tv    clip         src=i23.wav muted=false ready=true delayMs=0
 125200 tv    speak        text=i23.wav voice=clip delayMs=0
 125296 tv    hush
 125296 tv    clip         src=g54.wav muted=false ready=true delayMs=0
 125296 tv    speak        text=g54.wav voice=clip delayMs=0
 125390 tv    hush
 125390 tv    clip         src=b14.wav muted=false ready=true delayMs=0
 125390 tv    speak        text=b14.wav voice=clip delayMs=0
 125580 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 126638 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 126899 tv    hush
 126899 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 126900 tv    hush
 134507 tv    music:duck   ms=9000
 134507 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 139523 tv    hush
 139524 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 139524 tv    hush
 141080 tv    ss:cancel    speaking=false pending=false
 141080 tv    music:plan   from=game:bingo to=null
 141084 tv    ss:cancel    speaking=false pending=false
 141084 tv    music:plan   from=null to=lobby
 141085 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 141890 tv    music:stop   track=cool-vibes.mp3
 143603 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 143625 tv    ss:cancel    speaking=false pending=false
 143636 tv    music:plan   from=lobby to=game:bingo
 143636 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 143637 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 143645 tv    hush
 143645 tv    hush
 144301 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 144441 tv    music:stop   track=local-forecast-elevator.mp3
 144867 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
 145804 tv    ss:cancel    speaking=false pending=false
 145804 tv    music:plan   from=game:bingo to=null
 145804 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 147308 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 147997 tv    ss:cancel    speaking=false pending=false
 147997 tv    music:plan   from=null to=lobby
 147997 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 151355 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 151376 tv    ss:cancel    speaking=false pending=false
 151387 tv    music:plan   from=lobby to=game:bingo
 151387 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 151387 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 151399 tv    hush
 151400 tv    hush
 151795 tv    cue          cue=lock surface=tv muted=false ready=true semitones=8
 151802 tv    hush
 151802 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 151802 tv    speak        text=i21.wav voice=clip delayMs=0
 151803 tv    hush
 152007 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 152191 tv    music:stop   track=airport-lounge.mp3
 152281 tv    ss:cancel    speaking=false pending=false
 152281 tv    music:plan   from=game:bingo to=null
 152288 tv    ss:cancel    speaking=false pending=false
 152288 tv    music:plan   from=null to=lobby
 152288 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 153093 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, the lobby track only fading out, the warm bed under the intro** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":10.3}] bed=warm
- ✅ **the writing track eases in (under 0.2 a third of a second in), never a hard start** — playing=[{"track":"bossa-antigua.mp3","vol":0.04,"t":10.7},{"track":"sneaky-snitch.mp3","vol":0.08,"t":0.3}]
- ✅ **answer → one Wisecrack track at 0.2 × its trim while everyone writes, the bed gone** — playing=[{"track":"sneaky-snitch.mp3","vol":0.2,"t":2.4}] bed=null
- ✅ **pause while writing → pause cue, the writing track holds (nothing playing), no bed** — cues=phase,pause playing=[]
- ✅ **resume → phase chime, the same writing track carries on at its level (no music:start)** — cues=phase playing=[{"track":"sneaky-snitch.mp3","vol":0.2,"t":3.4}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,pause,phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **vote → the marimba bed (the first prompt), the track fading out** — bed=marimba playing=[]
- ✅ **reveal keeps the vote’s bed (same list, same turn: no crossfade on the cut)** — bed=marimba playing=[]
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal
- ✅ **scores phase → tally ping (mapped), the lounge bed** — cues=phase,reveal,phase,reveal,tally bed=lounge

```
 157972 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158404 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158819 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 159252 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 159684 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 160851 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 161441 tv    ss:cancel    speaking=false pending=false
 161452 tv    music:plan   from=lobby to=null
 161452 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 162732 tv    music:plan   from=null to=game:wisecrack
 162732 tv    music:start  plan=game:wisecrack track=sneaky-snitch mode=chain volume=0.2
 162732 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 163532 tv    music:stop   track=bossa-antigua.mp3
 165276 tv    music:paused paused=true
 165276 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
 166264 tv    music:paused paused=false
 166264 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 168237 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 169572 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 170888 tv    music:plan   from=game:wisecrack to=null
 170890 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 170890 tv    bed:duck     bed=marimba cue=phase
 171987 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 171987 tv    bed:duck     bed=marimba cue=reveal
 172391 tv    music:stop   track=sneaky-snitch.mp3
 175632 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 175632 tv    bed:duck     bed=lofi cue=phase
 175818 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 175818 tv    bed:duck     bed=lofi cue=reveal
 176009 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 176009 tv    bed:duck     bed=marimba cue=phase
 176198 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 176198 tv    bed:duck     bed=marimba cue=reveal
 176371 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 176371 tv    bed:duck     bed=lounge cue=tally
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.3}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 177529 tv    ss:cancel    speaking=false pending=false
 177537 tv    ss:cancel    speaking=false pending=false
 177537 tv    music:plan   from=null to=lobby
 177537 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 179563 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 179576 tv    ss:cancel    speaking=false pending=false
 179595 tv    music:plan   from=lobby to=null
 179595 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 181096 tv    music:stop   track=george-street-shuffle.mp3
 181169 tv    music:plan   from=null to=game:broken-pencil
 181169 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 181169 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 182644 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 183113 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 183268 tv    music:plan   from=game:broken-pencil to=null
 183268 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 184772 tv    music:stop   track=hep-cats.mp3
```
