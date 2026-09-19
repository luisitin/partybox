# Audio interaction trace

Captured 2026-09-19T01:54:10.183Z on port 42166. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**61 / 61 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.4}]

```
   1981 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   2012 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3320 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3478 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   4174 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4805 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5662 tv    ss:cancel    speaking=false pending=false
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
   6497 tv    music:plan   from=lobby to=null
   6497 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   8004 tv    music:stop   track=airport-lounge.mp3
   8451 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9744 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16711 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17710 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18705 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19702 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20708 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21504 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22316 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22473 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22629 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22770 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22924 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23081 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23239 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23393 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23550 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23706 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23865 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24023 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24177 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24333 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24490 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24649 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24788 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24942 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  25099 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25982 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26311 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  28123 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29848 tv    ss:cancel    speaking=false pending=false
  29848 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":1.5}]

```
  31400 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33567 tv    ss:cancel    speaking=false pending=false
  33567 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  35100 tv    ss:cancel    speaking=false pending=false
  35100 tv    music:plan   from=null to=lobby
  35100 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:local-forecast-elevator.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime** — cues=start,card,lock,lock,tick,tick,tick,call
- ✅ **the hand feels each card land (one 12 ms tap per card) and then the first call** — taps(12)=2 (1 card + the first call)
- ✅ **each Ready ticks (lock, rising); the 3 · 2 · 1's first tick comes a breath (≥ 300 ms) after the last** — locks=2 last lock→first tick=429ms
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+997ms phone@+1013ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "another" is a 20 ms tap and one card pluck; Ready a 20 ms tap and the submit cue** — taps=3 cues=card,submit
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **each voice starts on the push (no delay); its boing lands on the squash, 170–230 ms later** — delays=0,0 boing lags=191,192ms
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18.9}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":25.8}]
- ✅ **skipping through the deck: a hush before every call, one voice at a time** — clips=41 hushes=41
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5356ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":40.2}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the winner's celebration buzz (320 ms) runs whole — nothing shorter cuts it** — celebration@74477 cut by=[]
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5399ms cheer@+5366ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36669 tv    music:plan   from=lobby to=game:bingo
  36669 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36669 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36975 tv    hush
  36975 tv    hush
  37471 tv    music:stop   track=local-forecast-elevator.mp3
  37626 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  39734 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  40249 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
  40678 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41677 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  42677 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  43655 tv    hush
  43655 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  43656 tv    speak        text=b9.wav voice=clip delayMs=0
  43656 tv    hush
  43848 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44222 tv    hush
  44222 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  44222 tv    speak        text=b8.wav voice=clip delayMs=0
  44413 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46037 tv    hush
  46037 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  46037 tv    speak        text=n34.wav voice=clip delayMs=0
  46229 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  47902 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  48171 tv    hush
  48171 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  48172 tv    hush
  53524 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  56536 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57537 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58537 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  59542 tv    hush
  59542 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  59542 tv    speak        text=n35.wav voice=clip delayMs=0
  59732 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61335 tv    music:paused paused=true
  61336 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  62585 tv    music:paused paused=false
  62585 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  63866 tv    hush
  63867 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  63867 tv    speak        text=i25.wav voice=clip delayMs=0
  63992 tv    hush
  63992 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  63992 tv    speak        text=n45.wav voice=clip delayMs=0
  64118 tv    hush
  64118 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  64118 tv    speak        text=n33.wav voice=clip delayMs=0
  64243 tv    hush
  64243 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  64243 tv    speak        text=g49.wav voice=clip delayMs=0
  64371 tv    hush
  64371 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  64371 tv    speak        text=b4.wav voice=clip delayMs=0
  64495 tv    hush
  64495 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  64495 tv    speak        text=i20.wav voice=clip delayMs=0
  64619 tv    hush
  64619 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  64619 tv    speak        text=o69.wav voice=clip delayMs=0
  64745 tv    hush
  64745 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  64745 tv    speak        text=o67.wav voice=clip delayMs=0
  64872 tv    hush
  64872 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  64872 tv    speak        text=o65.wav voice=clip delayMs=0
  64996 tv    hush
  64996 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  64996 tv    speak        text=o73.wav voice=clip delayMs=0
  65121 tv    hush
  65121 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  65121 tv    speak        text=i21.wav voice=clip delayMs=0
  65247 tv    hush
  65247 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  65247 tv    speak        text=i18.wav voice=clip delayMs=0
  65356 tv    hush
  65356 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  65356 tv    speak        text=g58.wav voice=clip delayMs=0
  65481 tv    hush
  65481 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  65481 tv    speak        text=n36.wav voice=clip delayMs=0
  65605 tv    hush
  65605 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  65605 tv    speak        text=o61.wav voice=clip delayMs=0
  65729 tv    hush
  65729 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  65729 tv    speak        text=n37.wav voice=clip delayMs=0
  65856 tv    hush
  65856 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  65856 tv    speak        text=i16.wav voice=clip delayMs=0
  65967 tv    hush
  65967 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  65967 tv    speak        text=g47.wav voice=clip delayMs=0
  66076 tv    hush
  66076 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  66076 tv    speak        text=n41.wav voice=clip delayMs=0
  66199 tv    hush
  66200 tv    clip         src=b6.wav muted=false ready=true delayMs=0
  66200 tv    speak        text=b6.wav voice=clip delayMs=0
  66325 tv    hush
  66325 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  66325 tv    speak        text=o72.wav voice=clip delayMs=0
  66450 tv    hush
  66450 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  66450 tv    speak        text=b3.wav voice=clip delayMs=0
  66575 tv    hush
  66575 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  66575 tv    speak        text=i30.wav voice=clip delayMs=0
  66704 tv    hush
  66704 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  66704 tv    speak        text=g56.wav voice=clip delayMs=0
  66824 tv    hush
  66824 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  66824 tv    speak        text=o75.wav voice=clip delayMs=0
  66951 tv    hush
  66951 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  66951 tv    speak        text=b1.wav voice=clip delayMs=0
  67072 tv    hush
  67072 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  67072 tv    speak        text=b2.wav voice=clip delayMs=0
  67198 tv    hush
  67198 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  67198 tv    speak        text=n32.wav voice=clip delayMs=0
  67324 tv    hush
  67324 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  67324 tv    speak        text=g48.wav voice=clip delayMs=0
  67431 tv    hush
  67431 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  67431 tv    speak        text=i23.wav voice=clip delayMs=0
  67540 tv    hush
  67540 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  67540 tv    speak        text=i26.wav voice=clip delayMs=0
  67665 tv    hush
  67665 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  67665 tv    speak        text=o66.wav voice=clip delayMs=0
  67789 tv    hush
  67789 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  67789 tv    speak        text=i19.wav voice=clip delayMs=0
  67915 tv    hush
  67915 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  67915 tv    speak        text=n42.wav voice=clip delayMs=0
  68042 tv    hush
  68042 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  68042 tv    speak        text=i24.wav voice=clip delayMs=0
  68167 tv    hush
  68167 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  68167 tv    speak        text=n39.wav voice=clip delayMs=0
  68291 tv    hush
  68291 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  68291 tv    speak        text=g46.wav voice=clip delayMs=0
  68417 tv    hush
  68417 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  68417 tv    speak        text=n44.wav voice=clip delayMs=0
  68542 tv    hush
  68542 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  68542 tv    speak        text=b15.wav voice=clip delayMs=0
  68669 tv    hush
  68669 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  68669 tv    speak        text=b11.wav voice=clip delayMs=0
  68780 tv    hush
  68780 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  68780 tv    speak        text=g57.wav voice=clip delayMs=0
  68970 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  69400 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  69682 tv    hush
  69682 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  69683 tv    hush
  71555 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  75038 tv    music:duck   ms=9000
  75038 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  79844 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  80164 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81166 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82165 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  83173 tv    hush
  83173 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  83173 tv    speak        text=g57.wav voice=clip delayMs=0
  83364 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  85478 tv    ss:cancel    speaking=false pending=false
  85478 tv    music:plan   from=game:bingo to=null
  85483 tv    ss:cancel    speaking=false pending=false
  85483 tv    music:plan   from=null to=lobby
  85483 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  86283 tv    music:stop   track=wallpaper.mp3
  87993 tv    ss:cancel    speaking=false pending=false
  88005 tv    music:plan   from=lobby to=game:bingo
  88005 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  88005 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  88012 tv    hush
  88012 tv    hush
  88618 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  88621 tv    hush
  88621 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  88621 tv    speak        text=i21.wav voice=clip delayMs=0
  88621 tv    hush
  88634 tv    hush
  88634 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  88634 tv    speak        text=n32.wav voice=clip delayMs=0
  88731 tv    hush
  88731 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  88731 tv    speak        text=i18.wav voice=clip delayMs=0
  88807 tv    music:stop   track=local-forecast-elevator.mp3
  88829 tv    hush
  88829 tv    clip         src=n40.wav muted=false ready=true delayMs=0
  88829 tv    speak        text=n40.wav voice=clip delayMs=0
  88905 tv    hush
  88905 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  88905 tv    speak        text=i30.wav voice=clip delayMs=0
  88999 tv    hush
  88999 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  88999 tv    speak        text=o69.wav voice=clip delayMs=0
  89077 tv    hush
  89077 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  89077 tv    speak        text=o61.wav voice=clip delayMs=0
  89156 tv    hush
  89156 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  89156 tv    speak        text=n34.wav voice=clip delayMs=0
  89253 tv    hush
  89253 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  89253 tv    speak        text=n35.wav voice=clip delayMs=0
  89346 tv    hush
  89346 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  89346 tv    speak        text=o67.wav voice=clip delayMs=0
  89441 tv    hush
  89441 tv    clip         src=g55.wav muted=false ready=true delayMs=0
  89441 tv    speak        text=g55.wav voice=clip delayMs=0
  89548 tv    hush
  89548 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  89548 tv    speak        text=i26.wav voice=clip delayMs=0
  89629 tv    hush
  89630 tv    clip         src=i22.wav muted=false ready=true delayMs=0
  89630 tv    speak        text=i22.wav voice=clip delayMs=0
  89736 tv    hush
  89736 tv    clip         src=i29.wav muted=false ready=true delayMs=0
  89736 tv    speak        text=i29.wav voice=clip delayMs=0
  89832 tv    hush
  89832 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  89832 tv    speak        text=o66.wav voice=clip delayMs=0
  89911 tv    hush
  89911 tv    clip         src=g51.wav muted=false ready=true delayMs=0
  89911 tv    speak        text=g51.wav voice=clip delayMs=0
  89991 tv    hush
  89991 tv    clip         src=g53.wav muted=false ready=true delayMs=0
  89991 tv    speak        text=g53.wav voice=clip delayMs=0
  90082 tv    hush
  90082 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  90082 tv    speak        text=b9.wav voice=clip delayMs=0
  90179 tv    hush
  90179 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  90179 tv    speak        text=n36.wav voice=clip delayMs=0
  90270 tv    hush
  90270 tv    clip         src=g52.wav muted=false ready=true delayMs=0
  90270 tv    speak        text=g52.wav voice=clip delayMs=0
  90363 tv    hush
  90363 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  90363 tv    speak        text=b1.wav voice=clip delayMs=0
  90458 tv    hush
  90458 tv    clip         src=b13.wav muted=false ready=true delayMs=0
  90458 tv    speak        text=b13.wav voice=clip delayMs=0
  90551 tv    hush
  90551 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  90551 tv    speak        text=n37.wav voice=clip delayMs=0
  90645 tv    hush
  90645 tv    clip         src=o71.wav muted=false ready=true delayMs=0
  90645 tv    speak        text=o71.wav voice=clip delayMs=0
  90720 tv    hush
  90720 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  90720 tv    speak        text=b8.wav voice=clip delayMs=0
  90813 tv    hush
  90813 tv    clip         src=b5.wav muted=false ready=true delayMs=0
  90813 tv    speak        text=b5.wav voice=clip delayMs=0
  90908 tv    hush
  90908 tv    clip         src=b7.wav muted=false ready=true delayMs=0
  90908 tv    speak        text=b7.wav voice=clip delayMs=0
  91002 tv    hush
  91002 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  91002 tv    speak        text=n42.wav voice=clip delayMs=0
  91095 tv    hush
  91095 tv    clip         src=i28.wav muted=false ready=true delayMs=0
  91095 tv    speak        text=i28.wav voice=clip delayMs=0
  91191 tv    hush
  91191 tv    clip         src=i27.wav muted=false ready=true delayMs=0
  91191 tv    speak        text=i27.wav voice=clip delayMs=0
  91285 tv    hush
  91285 tv    clip         src=o63.wav muted=false ready=true delayMs=0
  91285 tv    speak        text=o63.wav voice=clip delayMs=0
  91379 tv    hush
  91379 tv    clip         src=o64.wav muted=false ready=true delayMs=0
  91379 tv    speak        text=o64.wav voice=clip delayMs=0
  91473 tv    hush
  91473 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  91473 tv    speak        text=o73.wav voice=clip delayMs=0
  91568 tv    hush
  91568 tv    clip         src=g50.wav muted=false ready=true delayMs=0
  91568 tv    speak        text=g50.wav voice=clip delayMs=0
  91662 tv    hush
  91662 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  91662 tv    speak        text=g48.wav voice=clip delayMs=0
  91758 tv    hush
  91758 tv    clip         src=b12.wav muted=false ready=true delayMs=0
  91758 tv    speak        text=b12.wav voice=clip delayMs=0
  91850 tv    hush
  91850 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  91850 tv    speak        text=n45.wav voice=clip delayMs=0
  91944 tv    hush
  91944 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  91944 tv    speak        text=b4.wav voice=clip delayMs=0
  92022 tv    hush
  92022 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  92022 tv    speak        text=g46.wav voice=clip delayMs=0
  92115 tv    hush
  92115 tv    clip         src=o74.wav muted=false ready=true delayMs=0
  92115 tv    speak        text=o74.wav voice=clip delayMs=0
  92208 tv    hush
  92208 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  92208 tv    speak        text=g47.wav voice=clip delayMs=0
  92303 tv    hush
  92303 tv    clip         src=n31.wav muted=false ready=true delayMs=0
  92303 tv    speak        text=n31.wav voice=clip delayMs=0
  92399 tv    hush
  92399 tv    clip         src=o62.wav muted=false ready=true delayMs=0
  92399 tv    speak        text=o62.wav voice=clip delayMs=0
  92489 tv    hush
  92489 tv    clip         src=b10.wav muted=false ready=true delayMs=0
  92489 tv    speak        text=b10.wav voice=clip delayMs=0
  92581 tv    hush
  92581 tv    clip         src=g60.wav muted=false ready=true delayMs=0
  92581 tv    speak        text=g60.wav voice=clip delayMs=0
  92674 tv    hush
  92674 tv    clip         src=n38.wav muted=false ready=true delayMs=0
  92674 tv    speak        text=n38.wav voice=clip delayMs=0
  92769 tv    hush
  92769 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  92769 tv    speak        text=n39.wav voice=clip delayMs=0
  92862 tv    hush
  92862 tv    clip         src=o70.wav muted=false ready=true delayMs=0
  92862 tv    speak        text=o70.wav voice=clip delayMs=0
  92957 tv    hush
  92957 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  92957 tv    speak        text=b11.wav voice=clip delayMs=0
  93051 tv    hush
  93051 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  93051 tv    speak        text=o75.wav voice=clip delayMs=0
  93145 tv    hush
  93145 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  93145 tv    speak        text=g58.wav voice=clip delayMs=0
  93238 tv    hush
  93238 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  93238 tv    speak        text=b15.wav voice=clip delayMs=0
  93334 tv    hush
  93334 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  93334 tv    speak        text=i24.wav voice=clip delayMs=0
  93441 tv    hush
  93441 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  93441 tv    speak        text=o72.wav voice=clip delayMs=0
  93538 tv    hush
  93538 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  93538 tv    speak        text=g56.wav voice=clip delayMs=0
  93629 tv    hush
  93629 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  93629 tv    speak        text=i20.wav voice=clip delayMs=0
  93723 tv    hush
  93723 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  93723 tv    speak        text=n44.wav voice=clip delayMs=0
  93817 tv    hush
  93817 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  93817 tv    speak        text=b3.wav voice=clip delayMs=0
  93912 tv    hush
  93912 tv    clip         src=o68.wav muted=false ready=true delayMs=0
  93912 tv    speak        text=o68.wav voice=clip delayMs=0
  94013 tv    hush
  94013 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  94013 tv    speak        text=b2.wav voice=clip delayMs=0
  94102 tv    hush
  94102 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  94102 tv    speak        text=n41.wav voice=clip delayMs=0
  94195 tv    hush
  94195 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  94195 tv    speak        text=o65.wav voice=clip delayMs=0
  94294 tv    hush
  94294 tv    clip         src=i17.wav muted=false ready=true delayMs=0
  94294 tv    speak        text=i17.wav voice=clip delayMs=0
  94382 tv    hush
  94382 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  94382 tv    speak        text=i25.wav voice=clip delayMs=0
  94478 tv    hush
  94478 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  94478 tv    speak        text=i19.wav voice=clip delayMs=0
  94570 tv    hush
  94570 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  94570 tv    speak        text=g57.wav voice=clip delayMs=0
  94663 tv    hush
  94663 tv    clip         src=g59.wav muted=false ready=true delayMs=0
  94663 tv    speak        text=g59.wav voice=clip delayMs=0
  94757 tv    hush
  94757 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  94757 tv    speak        text=g49.wav voice=clip delayMs=0
  94853 tv    hush
  94853 tv    clip         src=n43.wav muted=false ready=true delayMs=0
  94853 tv    speak        text=n43.wav voice=clip delayMs=0
  94946 tv    hush
  94946 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  94946 tv    speak        text=i16.wav voice=clip delayMs=0
  95042 tv    hush
  95042 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  95042 tv    speak        text=n33.wav voice=clip delayMs=0
  95137 tv    hush
  95137 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  95137 tv    speak        text=i23.wav voice=clip delayMs=0
  95228 tv    hush
  95228 tv    clip         src=g54.wav muted=false ready=true delayMs=0
  95228 tv    speak        text=g54.wav voice=clip delayMs=0
  95324 tv    hush
  95324 tv    clip         src=b14.wav muted=false ready=true delayMs=0
  95324 tv    speak        text=b14.wav voice=clip delayMs=0
  95516 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  96565 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  96828 tv    hush
  96828 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  96828 tv    hush
 104434 tv    music:duck   ms=9000
 104434 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 109455 tv    hush
 109455 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 109456 tv    hush
 113452 tv    ss:cancel    speaking=false pending=false
 113452 tv    music:plan   from=game:bingo to=null
 113452 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 114953 tv    music:stop   track=cool-vibes.mp3
 115076 tv    ss:cancel    speaking=false pending=false
 115076 tv    music:plan   from=null to=lobby
 115076 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 117582 tv    ss:cancel    speaking=false pending=false
 117592 tv    music:plan   from=lobby to=game:bingo
 117592 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 117592 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 117595 tv    hush
 117596 tv    hush
 118203 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 118206 tv    hush
 118206 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 118206 tv    speak        text=i21.wav voice=clip delayMs=0
 118206 tv    hush
 118213 tv    hush
 118213 tv    clip         src=n32.wav muted=false ready=true delayMs=0
 118213 tv    speak        text=n32.wav voice=clip delayMs=0
 118316 tv    hush
 118316 tv    clip         src=i18.wav muted=false ready=true delayMs=0
 118316 tv    speak        text=i18.wav voice=clip delayMs=0
 118393 tv    music:stop   track=george-street-shuffle.mp3
 118399 tv    hush
 118399 tv    clip         src=n40.wav muted=false ready=true delayMs=0
 118399 tv    speak        text=n40.wav voice=clip delayMs=0
 118502 tv    hush
 118502 tv    clip         src=i30.wav muted=false ready=true delayMs=0
 118502 tv    speak        text=i30.wav voice=clip delayMs=0
 118598 tv    hush
 118598 tv    clip         src=o69.wav muted=false ready=true delayMs=0
 118598 tv    speak        text=o69.wav voice=clip delayMs=0
 118690 tv    hush
 118690 tv    clip         src=o61.wav muted=false ready=true delayMs=0
 118690 tv    speak        text=o61.wav voice=clip delayMs=0
 118784 tv    hush
 118784 tv    clip         src=n34.wav muted=false ready=true delayMs=0
 118784 tv    speak        text=n34.wav voice=clip delayMs=0
 118878 tv    hush
 118878 tv    clip         src=n35.wav muted=false ready=true delayMs=0
 118878 tv    speak        text=n35.wav voice=clip delayMs=0
 118969 tv    hush
 118969 tv    clip         src=o67.wav muted=false ready=true delayMs=0
 118969 tv    speak        text=o67.wav voice=clip delayMs=0
 119063 tv    hush
 119063 tv    clip         src=g55.wav muted=false ready=true delayMs=0
 119063 tv    speak        text=g55.wav voice=clip delayMs=0
 119159 tv    hush
 119159 tv    clip         src=i26.wav muted=false ready=true delayMs=0
 119159 tv    speak        text=i26.wav voice=clip delayMs=0
 119251 tv    hush
 119251 tv    clip         src=i22.wav muted=false ready=true delayMs=0
 119251 tv    speak        text=i22.wav voice=clip delayMs=0
 119346 tv    hush
 119346 tv    clip         src=i29.wav muted=false ready=true delayMs=0
 119346 tv    speak        text=i29.wav voice=clip delayMs=0
 119440 tv    hush
 119440 tv    clip         src=o66.wav muted=false ready=true delayMs=0
 119440 tv    speak        text=o66.wav voice=clip delayMs=0
 119537 tv    hush
 119537 tv    clip         src=g51.wav muted=false ready=true delayMs=0
 119537 tv    speak        text=g51.wav voice=clip delayMs=0
 119629 tv    hush
 119629 tv    clip         src=g53.wav muted=false ready=true delayMs=0
 119629 tv    speak        text=g53.wav voice=clip delayMs=0
 119720 tv    hush
 119720 tv    clip         src=b9.wav muted=false ready=true delayMs=0
 119720 tv    speak        text=b9.wav voice=clip delayMs=0
 119816 tv    hush
 119816 tv    clip         src=n36.wav muted=false ready=true delayMs=0
 119816 tv    speak        text=n36.wav voice=clip delayMs=0
 119910 tv    hush
 119910 tv    clip         src=g52.wav muted=false ready=true delayMs=0
 119910 tv    speak        text=g52.wav voice=clip delayMs=0
 120004 tv    hush
 120004 tv    clip         src=b1.wav muted=false ready=true delayMs=0
 120004 tv    speak        text=b1.wav voice=clip delayMs=0
 120099 tv    hush
 120099 tv    clip         src=b13.wav muted=false ready=true delayMs=0
 120099 tv    speak        text=b13.wav voice=clip delayMs=0
 120193 tv    hush
 120193 tv    clip         src=n37.wav muted=false ready=true delayMs=0
 120193 tv    speak        text=n37.wav voice=clip delayMs=0
 120287 tv    hush
 120287 tv    clip         src=o71.wav muted=false ready=true delayMs=0
 120287 tv    speak        text=o71.wav voice=clip delayMs=0
 120379 tv    hush
 120379 tv    clip         src=b8.wav muted=false ready=true delayMs=0
 120379 tv    speak        text=b8.wav voice=clip delayMs=0
 120454 tv    hush
 120454 tv    clip         src=b5.wav muted=false ready=true delayMs=0
 120454 tv    speak        text=b5.wav voice=clip delayMs=0
 120552 tv    hush
 120552 tv    clip         src=b7.wav muted=false ready=true delayMs=0
 120552 tv    speak        text=b7.wav voice=clip delayMs=0
 120647 tv    hush
 120647 tv    clip         src=n42.wav muted=false ready=true delayMs=0
 120647 tv    speak        text=n42.wav voice=clip delayMs=0
 120740 tv    hush
 120740 tv    clip         src=i28.wav muted=false ready=true delayMs=0
 120740 tv    speak        text=i28.wav voice=clip delayMs=0
 120833 tv    hush
 120833 tv    clip         src=i27.wav muted=false ready=true delayMs=0
 120833 tv    speak        text=i27.wav voice=clip delayMs=0
 120924 tv    hush
 120924 tv    clip         src=o63.wav muted=false ready=true delayMs=0
 120924 tv    speak        text=o63.wav voice=clip delayMs=0
 121019 tv    hush
 121019 tv    clip         src=o64.wav muted=false ready=true delayMs=0
 121019 tv    speak        text=o64.wav voice=clip delayMs=0
 121116 tv    hush
 121116 tv    clip         src=o73.wav muted=false ready=true delayMs=0
 121116 tv    speak        text=o73.wav voice=clip delayMs=0
 121208 tv    hush
 121208 tv    clip         src=g50.wav muted=false ready=true delayMs=0
 121208 tv    speak        text=g50.wav voice=clip delayMs=0
 121303 tv    hush
 121303 tv    clip         src=g48.wav muted=false ready=true delayMs=0
 121303 tv    speak        text=g48.wav voice=clip delayMs=0
 121395 tv    hush
 121395 tv    clip         src=b12.wav muted=false ready=true delayMs=0
 121395 tv    speak        text=b12.wav voice=clip delayMs=0
 121490 tv    hush
 121490 tv    clip         src=n45.wav muted=false ready=true delayMs=0
 121490 tv    speak        text=n45.wav voice=clip delayMs=0
 121587 tv    hush
 121587 tv    clip         src=b4.wav muted=false ready=true delayMs=0
 121587 tv    speak        text=b4.wav voice=clip delayMs=0
 121665 tv    hush
 121665 tv    clip         src=g46.wav muted=false ready=true delayMs=0
 121665 tv    speak        text=g46.wav voice=clip delayMs=0
 121756 tv    hush
 121756 tv    clip         src=o74.wav muted=false ready=true delayMs=0
 121756 tv    speak        text=o74.wav voice=clip delayMs=0
 121852 tv    hush
 121852 tv    clip         src=g47.wav muted=false ready=true delayMs=0
 121852 tv    speak        text=g47.wav voice=clip delayMs=0
 121944 tv    hush
 121944 tv    clip         src=n31.wav muted=false ready=true delayMs=0
 121944 tv    speak        text=n31.wav voice=clip delayMs=0
 122040 tv    hush
 122040 tv    clip         src=o62.wav muted=false ready=true delayMs=0
 122040 tv    speak        text=o62.wav voice=clip delayMs=0
 122134 tv    hush
 122134 tv    clip         src=b10.wav muted=false ready=true delayMs=0
 122134 tv    speak        text=b10.wav voice=clip delayMs=0
 122228 tv    hush
 122228 tv    clip         src=g60.wav muted=false ready=true delayMs=0
 122228 tv    speak        text=g60.wav voice=clip delayMs=0
 122321 tv    hush
 122321 tv    clip         src=n38.wav muted=false ready=true delayMs=0
 122321 tv    speak        text=n38.wav voice=clip delayMs=0
 122416 tv    hush
 122416 tv    clip         src=n39.wav muted=false ready=true delayMs=0
 122416 tv    speak        text=n39.wav voice=clip delayMs=0
 122496 tv    hush
 122496 tv    clip         src=o70.wav muted=false ready=true delayMs=0
 122496 tv    speak        text=o70.wav voice=clip delayMs=0
 122589 tv    hush
 122589 tv    clip         src=b11.wav muted=false ready=true delayMs=0
 122589 tv    speak        text=b11.wav voice=clip delayMs=0
 122681 tv    hush
 122681 tv    clip         src=o75.wav muted=false ready=true delayMs=0
 122681 tv    speak        text=o75.wav voice=clip delayMs=0
 122788 tv    hush
 122788 tv    clip         src=g58.wav muted=false ready=true delayMs=0
 122788 tv    speak        text=g58.wav voice=clip delayMs=0
 122882 tv    hush
 122882 tv    clip         src=b15.wav muted=false ready=true delayMs=0
 122882 tv    speak        text=b15.wav voice=clip delayMs=0
 122977 tv    hush
 122977 tv    clip         src=i24.wav muted=false ready=true delayMs=0
 122977 tv    speak        text=i24.wav voice=clip delayMs=0
 123071 tv    hush
 123071 tv    clip         src=o72.wav muted=false ready=true delayMs=0
 123071 tv    speak        text=o72.wav voice=clip delayMs=0
 123164 tv    hush
 123164 tv    clip         src=g56.wav muted=false ready=true delayMs=0
 123164 tv    speak        text=g56.wav voice=clip delayMs=0
 123257 tv    hush
 123257 tv    clip         src=i20.wav muted=false ready=true delayMs=0
 123257 tv    speak        text=i20.wav voice=clip delayMs=0
 123352 tv    hush
 123352 tv    clip         src=n44.wav muted=false ready=true delayMs=0
 123352 tv    speak        text=n44.wav voice=clip delayMs=0
 123447 tv    hush
 123447 tv    clip         src=b3.wav muted=false ready=true delayMs=0
 123447 tv    speak        text=b3.wav voice=clip delayMs=0
 123541 tv    hush
 123541 tv    clip         src=o68.wav muted=false ready=true delayMs=0
 123541 tv    speak        text=o68.wav voice=clip delayMs=0
 123634 tv    hush
 123634 tv    clip         src=b2.wav muted=false ready=true delayMs=0
 123634 tv    speak        text=b2.wav voice=clip delayMs=0
 123729 tv    hush
 123729 tv    clip         src=n41.wav muted=false ready=true delayMs=0
 123729 tv    speak        text=n41.wav voice=clip delayMs=0
 123823 tv    hush
 123823 tv    clip         src=o65.wav muted=false ready=true delayMs=0
 123823 tv    speak        text=o65.wav voice=clip delayMs=0
 123916 tv    hush
 123916 tv    clip         src=i17.wav muted=false ready=true delayMs=0
 123916 tv    speak        text=i17.wav voice=clip delayMs=0
 124009 tv    hush
 124009 tv    clip         src=i25.wav muted=false ready=true delayMs=0
 124009 tv    speak        text=i25.wav voice=clip delayMs=0
 124107 tv    hush
 124107 tv    clip         src=i19.wav muted=false ready=true delayMs=0
 124107 tv    speak        text=i19.wav voice=clip delayMs=0
 124199 tv    hush
 124199 tv    clip         src=g57.wav muted=false ready=true delayMs=0
 124199 tv    speak        text=g57.wav voice=clip delayMs=0
 124280 tv    hush
 124280 tv    clip         src=g59.wav muted=false ready=true delayMs=0
 124280 tv    speak        text=g59.wav voice=clip delayMs=0
 124388 tv    hush
 124388 tv    clip         src=g49.wav muted=false ready=true delayMs=0
 124388 tv    speak        text=g49.wav voice=clip delayMs=0
 124466 tv    hush
 124466 tv    clip         src=n43.wav muted=false ready=true delayMs=0
 124466 tv    speak        text=n43.wav voice=clip delayMs=0
 124561 tv    hush
 124561 tv    clip         src=i16.wav muted=false ready=true delayMs=0
 124561 tv    speak        text=i16.wav voice=clip delayMs=0
 124655 tv    hush
 124655 tv    clip         src=n33.wav muted=false ready=true delayMs=0
 124655 tv    speak        text=n33.wav voice=clip delayMs=0
 124751 tv    hush
 124751 tv    clip         src=i23.wav muted=false ready=true delayMs=0
 124751 tv    speak        text=i23.wav voice=clip delayMs=0
 124845 tv    hush
 124845 tv    clip         src=g54.wav muted=false ready=true delayMs=0
 124845 tv    speak        text=g54.wav voice=clip delayMs=0
 124939 tv    hush
 124939 tv    clip         src=b14.wav muted=false ready=true delayMs=0
 124939 tv    speak        text=b14.wav voice=clip delayMs=0
 125130 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 126180 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 126445 tv    hush
 126445 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 126445 tv    hush
 134053 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 134061 tv    music:duck   ms=9000
 134061 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 139058 tv    hush
 139058 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 139058 tv    hush
 140611 tv    ss:cancel    speaking=false pending=false
 140611 tv    music:plan   from=game:bingo to=null
 140616 tv    ss:cancel    speaking=false pending=false
 140616 tv    music:plan   from=null to=lobby
 140616 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 141416 tv    music:stop   track=wallpaper.mp3
 143130 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 143138 tv    ss:cancel    speaking=false pending=false
 143140 tv    music:plan   from=lobby to=game:bingo
 143140 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 143140 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 143143 tv    hush
 143144 tv    hush
 143800 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 143941 tv    music:stop   track=bossa-antigua.mp3
 144369 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
 145279 tv    ss:cancel    speaking=false pending=false
 145279 tv    music:plan   from=game:bingo to=null
 145279 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 146780 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 147409 tv    ss:cancel    speaking=false pending=false
 147409 tv    music:plan   from=null to=lobby
 147409 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 150757 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 150766 tv    ss:cancel    speaking=false pending=false
 150768 tv    music:plan   from=lobby to=game:bingo
 150768 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 150768 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 150771 tv    hush
 150772 tv    hush
 151168 tv    cue          cue=lock surface=tv muted=false ready=true semitones=8
 151173 tv    hush
 151173 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 151173 tv    speak        text=i21.wav voice=clip delayMs=0
 151173 tv    hush
 151364 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 151569 tv    music:stop   track=george-street-shuffle.mp3
 151658 tv    ss:cancel    speaking=false pending=false
 151658 tv    music:plan   from=game:bingo to=null
 151661 tv    ss:cancel    speaking=false pending=false
 151661 tv    music:plan   from=null to=lobby
 151661 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 152463 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 157247 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157661 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158095 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158528 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158946 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 159994 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 160601 tv    ss:cancel    speaking=false pending=false
 160606 tv    music:plan   from=lobby to=null
 160606 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 161856 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 162107 tv    music:stop   track=bossa-antigua.mp3
 163463 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 164765 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 166072 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 167108 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 168155 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 170735 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 170925 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 171109 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 171301 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 172440 tv    ss:cancel    speaking=false pending=false
 172442 tv    ss:cancel    speaking=false pending=false
 172442 tv    music:plan   from=null to=lobby
 172442 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 174461 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 174467 tv    ss:cancel    speaking=false pending=false
 174469 tv    music:plan   from=lobby to=null
 174469 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 175970 tv    music:stop   track=airport-lounge.mp3
 176034 tv    music:plan   from=null to=game:broken-pencil
 176034 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 176034 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 177507 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 177947 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 178104 tv    music:plan   from=game:broken-pencil to=null
 178105 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 179606 tv    music:stop   track=backbay-lounge.mp3
```
