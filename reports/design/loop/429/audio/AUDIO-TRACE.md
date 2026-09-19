# Audio interaction trace

Captured 2026-09-19T04:00:19.289Z on port 42071. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**68 / 71 checks passed.** Failed: F: the writing track eases in (under 0.2 a third of a second in), never a hard start; F: answer → one Wisecrack track at 0.2 while everyone writes, the bed gone; G: draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:bossa-antigua
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":4.5}]

```
   1756 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   1790 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3114 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3286 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3982 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4623 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5488 tv    ss:cancel    speaking=false pending=false
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
   6334 tv    music:plan   from=lobby to=null
   6334 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7836 tv    music:stop   track=bossa-antigua.mp3
   8288 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   8288 tv    bed:duck     bed=pulse cue=phase
   9591 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16550 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17539 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18546 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19553 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20540 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21326 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  21326 tv    bed:duck     bed=pulse cue=reveal
  22124 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22124 tv    bed:duck     bed=pulse cue=phase
  22276 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22276 tv    bed:duck     bed=pulse cue=reveal
  22427 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22427 tv    bed:duck     bed=pulse cue=phase
  22581 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22581 tv    bed:duck     bed=pulse cue=reveal
  22737 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22737 tv    bed:duck     bed=pulse cue=phase
  22908 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22909 tv    bed:duck     bed=pulse cue=reveal
  23054 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23054 tv    bed:duck     bed=pulse cue=phase
  23219 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23219 tv    bed:duck     bed=pulse cue=reveal
  23369 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23369 tv    bed:duck     bed=pulse cue=phase
  23531 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23531 tv    bed:duck     bed=pulse cue=reveal
  23672 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23672 tv    bed:duck     bed=pulse cue=phase
  23822 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23822 tv    bed:duck     bed=pulse cue=reveal
  23986 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23986 tv    bed:duck     bed=pulse cue=phase
  24139 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24139 tv    bed:duck     bed=pulse cue=reveal
  24296 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24296 tv    bed:duck     bed=pulse cue=phase
  24454 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24454 tv    bed:duck     bed=pulse cue=reveal
  24608 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24608 tv    bed:duck     bed=pulse cue=phase
  24776 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24776 tv    bed:duck     bed=pulse cue=reveal
  24930 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  24930 tv    bed:duck     bed=latenight cue=wager
  25808 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  25808 tv    bed:duck     bed=pulse cue=phase
  26140 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  26140 tv    bed:duck     bed=pulse cue=silence
  27951 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  27951 tv    bed:duck     bed=pulse cue=bust
  29672 tv    ss:cancel    speaking=false pending=false
  29672 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31244 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33427 tv    ss:cancel    speaking=false pending=false
  33427 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34980 tv    ss:cancel    speaking=false pending=false
  34980 tv    music:plan   from=null to=lobby
  34980 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":3}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime** — cues=start,card,lock,lock,tick,tick,tick,call
- ✅ **the hand feels each card land (one 12 ms tap per card) and then the first call** — taps(12)=2 (1 card + the first call)
- ✅ **each Ready ticks (lock, rising); the 3 · 2 · 1's first tick comes a breath (≥ 300 ms) after the last** — locks=2 last lock→first tick=407ms
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+1152ms phone@+1168ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "another" is a 20 ms tap and one card pluck; Ready a 20 ms tap and the submit cue** — taps=3 cues=card,submit
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **each voice starts on the push (no delay); its boing lands on the squash, 170–230 ms later** — delays=0,0 boing lags=193,192ms
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,silence,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,silence,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":19.1}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":26}]
- ✅ **skipping through the deck: a hush before every call, one voice at a time** — clips=41 hushes=41
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5372ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":40.5}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,close,daub,claim,correct
- ✅ **one 'close' between the penultimate and the last daub (one square to go), once for the card** — phone cues=daub,daub,close,daub,claim,correct
- ✅ **the winner's celebration buzz (320 ms) runs whole — nothing shorter cuts it** — celebration@74789 cut by=[]
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5408ms cheer@+5390ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36562 tv    music:plan   from=lobby to=game:bingo
  36562 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36562 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36992 tv    hush
  36992 tv    hush
  37367 tv    music:stop   track=airport-lounge.mp3
  37650 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  39659 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  40188 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
  40595 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41601 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  42602 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  43591 tv    hush
  43591 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  43591 tv    speak        text=b9.wav voice=clip delayMs=0
  43592 tv    hush
  43783 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44174 tv    hush
  44174 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  44174 tv    speak        text=b8.wav voice=clip delayMs=0
  44367 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46010 tv    hush
  46010 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  46010 tv    speak        text=n34.wav voice=clip delayMs=0
  46202 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  47914 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  48177 tv    hush
  48177 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  48178 tv    hush
  53534 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  53539 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  56536 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57548 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58550 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  59547 tv    hush
  59547 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  59547 tv    speak        text=n35.wav voice=clip delayMs=0
  59741 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61381 tv    music:paused paused=true
  61381 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  62632 tv    music:paused paused=false
  62632 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  63947 tv    hush
  63947 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  63947 tv    speak        text=i25.wav voice=clip delayMs=0
  64069 tv    hush
  64070 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  64070 tv    speak        text=n45.wav voice=clip delayMs=0
  64196 tv    hush
  64196 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  64196 tv    speak        text=n33.wav voice=clip delayMs=0
  64322 tv    hush
  64322 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  64322 tv    speak        text=g49.wav voice=clip delayMs=0
  64447 tv    hush
  64447 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  64447 tv    speak        text=b4.wav voice=clip delayMs=0
  64575 tv    hush
  64575 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  64575 tv    speak        text=i20.wav voice=clip delayMs=0
  64697 tv    hush
  64697 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  64697 tv    speak        text=o69.wav voice=clip delayMs=0
  64810 tv    hush
  64810 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  64810 tv    speak        text=o67.wav voice=clip delayMs=0
  64934 tv    hush
  64934 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  64934 tv    speak        text=o65.wav voice=clip delayMs=0
  65060 tv    hush
  65060 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  65060 tv    speak        text=o73.wav voice=clip delayMs=0
  65185 tv    hush
  65185 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  65185 tv    speak        text=i21.wav voice=clip delayMs=0
  65312 tv    hush
  65312 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  65312 tv    speak        text=i18.wav voice=clip delayMs=0
  65439 tv    hush
  65439 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  65439 tv    speak        text=g58.wav voice=clip delayMs=0
  65562 tv    hush
  65562 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  65562 tv    speak        text=n36.wav voice=clip delayMs=0
  65688 tv    hush
  65688 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  65688 tv    speak        text=o61.wav voice=clip delayMs=0
  65814 tv    hush
  65814 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  65814 tv    speak        text=n37.wav voice=clip delayMs=0
  65941 tv    hush
  65941 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  65941 tv    speak        text=i16.wav voice=clip delayMs=0
  66067 tv    hush
  66067 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  66067 tv    speak        text=g47.wav voice=clip delayMs=0
  66192 tv    hush
  66192 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  66192 tv    speak        text=n41.wav voice=clip delayMs=0
  66318 tv    hush
  66318 tv    clip         src=b6.wav muted=false ready=true delayMs=0
  66318 tv    speak        text=b6.wav voice=clip delayMs=0
  66446 tv    hush
  66446 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  66446 tv    speak        text=o72.wav voice=clip delayMs=0
  66574 tv    hush
  66574 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  66574 tv    speak        text=b3.wav voice=clip delayMs=0
  66685 tv    hush
  66685 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  66685 tv    speak        text=i30.wav voice=clip delayMs=0
  66807 tv    hush
  66807 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  66807 tv    speak        text=g56.wav voice=clip delayMs=0
  66932 tv    hush
  66932 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  66932 tv    speak        text=o75.wav voice=clip delayMs=0
  67059 tv    hush
  67059 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  67059 tv    speak        text=b1.wav voice=clip delayMs=0
  67183 tv    hush
  67183 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  67183 tv    speak        text=b2.wav voice=clip delayMs=0
  67313 tv    hush
  67313 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  67313 tv    speak        text=n32.wav voice=clip delayMs=0
  67437 tv    hush
  67437 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  67437 tv    speak        text=g48.wav voice=clip delayMs=0
  67564 tv    hush
  67564 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  67564 tv    speak        text=i23.wav voice=clip delayMs=0
  67687 tv    hush
  67687 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  67687 tv    speak        text=i26.wav voice=clip delayMs=0
  67813 tv    hush
  67813 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  67813 tv    speak        text=o66.wav voice=clip delayMs=0
  67927 tv    hush
  67927 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  67927 tv    speak        text=i19.wav voice=clip delayMs=0
  68048 tv    hush
  68048 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  68048 tv    speak        text=n42.wav voice=clip delayMs=0
  68176 tv    hush
  68176 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  68176 tv    speak        text=i24.wav voice=clip delayMs=0
  68301 tv    hush
  68301 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  68301 tv    speak        text=n39.wav voice=clip delayMs=0
  68432 tv    hush
  68432 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  68432 tv    speak        text=g46.wav voice=clip delayMs=0
  68555 tv    hush
  68555 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  68555 tv    speak        text=n44.wav voice=clip delayMs=0
  68680 tv    hush
  68680 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  68680 tv    speak        text=b15.wav voice=clip delayMs=0
  68806 tv    hush
  68806 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  68806 tv    speak        text=b11.wav voice=clip delayMs=0
  68930 tv    hush
  68930 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  68930 tv    speak        text=g57.wav voice=clip delayMs=0
  69124 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  69580 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  69867 tv    hush
  69867 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  69868 tv    hush
  71766 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  75239 tv    music:duck   ms=9000
  75239 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  80074 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  80391 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81396 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82392 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  83382 tv    hush
  83382 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  83382 tv    speak        text=g57.wav voice=clip delayMs=0
  83578 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  85720 tv    ss:cancel    speaking=false pending=false
  85720 tv    music:plan   from=game:bingo to=null
  85727 tv    ss:cancel    speaking=false pending=false
  85727 tv    music:plan   from=null to=lobby
  85727 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  86528 tv    music:stop   track=wallpaper.mp3
  88240 tv    ss:cancel    speaking=false pending=false
  88259 tv    music:plan   from=lobby to=game:bingo
  88259 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  88259 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  88265 tv    hush
  88266 tv    hush
  88865 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  88870 tv    hush
  88870 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  88870 tv    speak        text=i21.wav voice=clip delayMs=0
  88870 tv    hush
  88898 tv    hush
  88898 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  88898 tv    speak        text=n32.wav voice=clip delayMs=0
  88992 tv    hush
  88992 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  88992 tv    speak        text=i18.wav voice=clip delayMs=0
  89061 tv    music:stop   track=george-street-shuffle.mp3
  89087 tv    hush
  89087 tv    clip         src=n40.wav muted=false ready=true delayMs=0
  89087 tv    speak        text=n40.wav voice=clip delayMs=0
  89180 tv    hush
  89180 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  89180 tv    speak        text=i30.wav voice=clip delayMs=0
  89276 tv    hush
  89276 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  89276 tv    speak        text=o69.wav voice=clip delayMs=0
  89374 tv    hush
  89374 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  89374 tv    speak        text=o61.wav voice=clip delayMs=0
  89451 tv    hush
  89451 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  89451 tv    speak        text=n34.wav voice=clip delayMs=0
  89558 tv    hush
  89558 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  89558 tv    speak        text=n35.wav voice=clip delayMs=0
  89667 tv    hush
  89667 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  89667 tv    speak        text=o67.wav voice=clip delayMs=0
  89777 tv    hush
  89777 tv    clip         src=g55.wav muted=false ready=true delayMs=0
  89777 tv    speak        text=g55.wav voice=clip delayMs=0
  89856 tv    hush
  89856 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  89856 tv    speak        text=i26.wav voice=clip delayMs=0
  89965 tv    hush
  89965 tv    clip         src=i22.wav muted=false ready=true delayMs=0
  89965 tv    speak        text=i22.wav voice=clip delayMs=0
  90061 tv    hush
  90061 tv    clip         src=i29.wav muted=false ready=true delayMs=0
  90061 tv    speak        text=i29.wav voice=clip delayMs=0
  90157 tv    hush
  90157 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  90157 tv    speak        text=o66.wav voice=clip delayMs=0
  90259 tv    hush
  90259 tv    clip         src=g51.wav muted=false ready=true delayMs=0
  90259 tv    speak        text=g51.wav voice=clip delayMs=0
  90361 tv    hush
  90361 tv    clip         src=g53.wav muted=false ready=true delayMs=0
  90361 tv    speak        text=g53.wav voice=clip delayMs=0
  90439 tv    hush
  90439 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  90439 tv    speak        text=b9.wav voice=clip delayMs=0
  90548 tv    hush
  90548 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  90548 tv    speak        text=n36.wav voice=clip delayMs=0
  90642 tv    hush
  90642 tv    clip         src=g52.wav muted=false ready=true delayMs=0
  90642 tv    speak        text=g52.wav voice=clip delayMs=0
  90737 tv    hush
  90737 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  90737 tv    speak        text=b1.wav voice=clip delayMs=0
  90830 tv    hush
  90830 tv    clip         src=b13.wav muted=false ready=true delayMs=0
  90830 tv    speak        text=b13.wav voice=clip delayMs=0
  90925 tv    hush
  90925 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  90925 tv    speak        text=n37.wav voice=clip delayMs=0
  91006 tv    hush
  91006 tv    clip         src=o71.wav muted=false ready=true delayMs=0
  91006 tv    speak        text=o71.wav voice=clip delayMs=0
  91114 tv    hush
  91114 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  91114 tv    speak        text=b8.wav voice=clip delayMs=0
  91209 tv    hush
  91209 tv    clip         src=b5.wav muted=false ready=true delayMs=0
  91209 tv    speak        text=b5.wav voice=clip delayMs=0
  91302 tv    hush
  91302 tv    clip         src=b7.wav muted=false ready=true delayMs=0
  91302 tv    speak        text=b7.wav voice=clip delayMs=0
  91398 tv    hush
  91398 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  91398 tv    speak        text=n42.wav voice=clip delayMs=0
  91491 tv    hush
  91491 tv    clip         src=i28.wav muted=false ready=true delayMs=0
  91491 tv    speak        text=i28.wav voice=clip delayMs=0
  91587 tv    hush
  91587 tv    clip         src=i27.wav muted=false ready=true delayMs=0
  91587 tv    speak        text=i27.wav voice=clip delayMs=0
  91697 tv    hush
  91697 tv    clip         src=o63.wav muted=false ready=true delayMs=0
  91697 tv    speak        text=o63.wav voice=clip delayMs=0
  91790 tv    hush
  91790 tv    clip         src=o64.wav muted=false ready=true delayMs=0
  91790 tv    speak        text=o64.wav voice=clip delayMs=0
  91885 tv    hush
  91885 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  91885 tv    speak        text=o73.wav voice=clip delayMs=0
  91978 tv    hush
  91978 tv    clip         src=g50.wav muted=false ready=true delayMs=0
  91978 tv    speak        text=g50.wav voice=clip delayMs=0
  92075 tv    hush
  92075 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  92075 tv    speak        text=g48.wav voice=clip delayMs=0
  92169 tv    hush
  92169 tv    clip         src=b12.wav muted=false ready=true delayMs=0
  92169 tv    speak        text=b12.wav voice=clip delayMs=0
  92278 tv    hush
  92278 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  92278 tv    speak        text=n45.wav voice=clip delayMs=0
  92389 tv    hush
  92389 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  92389 tv    speak        text=b4.wav voice=clip delayMs=0
  92499 tv    hush
  92499 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  92499 tv    speak        text=g46.wav voice=clip delayMs=0
  92593 tv    hush
  92593 tv    clip         src=o74.wav muted=false ready=true delayMs=0
  92593 tv    speak        text=o74.wav voice=clip delayMs=0
  92704 tv    hush
  92704 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  92704 tv    speak        text=g47.wav voice=clip delayMs=0
  92800 tv    hush
  92800 tv    clip         src=n31.wav muted=false ready=true delayMs=0
  92800 tv    speak        text=n31.wav voice=clip delayMs=0
  92912 tv    hush
  92912 tv    clip         src=o62.wav muted=false ready=true delayMs=0
  92912 tv    speak        text=o62.wav voice=clip delayMs=0
  93017 tv    hush
  93017 tv    clip         src=b10.wav muted=false ready=true delayMs=0
  93017 tv    speak        text=b10.wav voice=clip delayMs=0
  93127 tv    hush
  93127 tv    clip         src=g60.wav muted=false ready=true delayMs=0
  93127 tv    speak        text=g60.wav voice=clip delayMs=0
  93221 tv    hush
  93221 tv    clip         src=n38.wav muted=false ready=true delayMs=0
  93221 tv    speak        text=n38.wav voice=clip delayMs=0
  93299 tv    hush
  93299 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  93299 tv    speak        text=n39.wav voice=clip delayMs=0
  93407 tv    hush
  93407 tv    clip         src=o70.wav muted=false ready=true delayMs=0
  93407 tv    speak        text=o70.wav voice=clip delayMs=0
  93500 tv    hush
  93500 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  93500 tv    speak        text=b11.wav voice=clip delayMs=0
  93595 tv    hush
  93595 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  93595 tv    speak        text=o75.wav voice=clip delayMs=0
  93692 tv    hush
  93692 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  93692 tv    speak        text=g58.wav voice=clip delayMs=0
  93796 tv    hush
  93796 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  93796 tv    speak        text=b15.wav voice=clip delayMs=0
  93910 tv    hush
  93910 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  93910 tv    speak        text=i24.wav voice=clip delayMs=0
  94013 tv    hush
  94013 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  94013 tv    speak        text=o72.wav voice=clip delayMs=0
  94110 tv    hush
  94110 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  94110 tv    speak        text=g56.wav voice=clip delayMs=0
  94218 tv    hush
  94218 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  94218 tv    speak        text=i20.wav voice=clip delayMs=0
  94309 tv    hush
  94309 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  94309 tv    speak        text=n44.wav voice=clip delayMs=0
  94419 tv    hush
  94419 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  94419 tv    speak        text=b3.wav voice=clip delayMs=0
  94514 tv    hush
  94514 tv    clip         src=o68.wav muted=false ready=true delayMs=0
  94514 tv    speak        text=o68.wav voice=clip delayMs=0
  94608 tv    hush
  94608 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  94608 tv    speak        text=b2.wav voice=clip delayMs=0
  94704 tv    hush
  94704 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  94704 tv    speak        text=n41.wav voice=clip delayMs=0
  94813 tv    hush
  94813 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  94813 tv    speak        text=o65.wav voice=clip delayMs=0
  94907 tv    hush
  94907 tv    clip         src=i17.wav muted=false ready=true delayMs=0
  94907 tv    speak        text=i17.wav voice=clip delayMs=0
  94991 tv    hush
  94991 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  94991 tv    speak        text=i25.wav voice=clip delayMs=0
  95094 tv    hush
  95094 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  95094 tv    speak        text=i19.wav voice=clip delayMs=0
  95189 tv    hush
  95189 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  95189 tv    speak        text=g57.wav voice=clip delayMs=0
  95283 tv    hush
  95283 tv    clip         src=g59.wav muted=false ready=true delayMs=0
  95283 tv    speak        text=g59.wav voice=clip delayMs=0
  95475 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  96679 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  96937 tv    hush
  96938 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  96938 tv    hush
 104557 tv    music:duck   ms=9000
 104557 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 109566 tv    hush
 109567 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 109567 tv    hush
 113554 tv    ss:cancel    speaking=false pending=false
 113554 tv    music:plan   from=game:bingo to=null
 113554 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 115060 tv    music:stop   track=wallpaper.mp3
 115186 tv    ss:cancel    speaking=false pending=false
 115186 tv    music:plan   from=null to=lobby
 115186 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 117709 tv    ss:cancel    speaking=false pending=false
 117727 tv    music:plan   from=lobby to=game:bingo
 117727 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 117727 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 117733 tv    hush
 117734 tv    hush
 118334 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 118339 tv    hush
 118339 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 118339 tv    speak        text=i21.wav voice=clip delayMs=0
 118340 tv    hush
 118367 tv    hush
 118367 tv    clip         src=n32.wav muted=false ready=true delayMs=0
 118367 tv    speak        text=n32.wav voice=clip delayMs=0
 118463 tv    hush
 118463 tv    clip         src=i18.wav muted=false ready=true delayMs=0
 118463 tv    speak        text=i18.wav voice=clip delayMs=0
 118531 tv    music:stop   track=bossa-antigua.mp3
 118556 tv    hush
 118556 tv    clip         src=n40.wav muted=false ready=true delayMs=0
 118556 tv    speak        text=n40.wav voice=clip delayMs=0
 118653 tv    hush
 118653 tv    clip         src=i30.wav muted=false ready=true delayMs=0
 118653 tv    speak        text=i30.wav voice=clip delayMs=0
 118745 tv    hush
 118745 tv    clip         src=o69.wav muted=false ready=true delayMs=0
 118745 tv    speak        text=o69.wav voice=clip delayMs=0
 118839 tv    hush
 118839 tv    clip         src=o61.wav muted=false ready=true delayMs=0
 118839 tv    speak        text=o61.wav voice=clip delayMs=0
 118936 tv    hush
 118936 tv    clip         src=n34.wav muted=false ready=true delayMs=0
 118936 tv    speak        text=n34.wav voice=clip delayMs=0
 119045 tv    hush
 119045 tv    clip         src=n35.wav muted=false ready=true delayMs=0
 119045 tv    speak        text=n35.wav voice=clip delayMs=0
 119139 tv    hush
 119139 tv    clip         src=o67.wav muted=false ready=true delayMs=0
 119139 tv    speak        text=o67.wav voice=clip delayMs=0
 119233 tv    hush
 119233 tv    clip         src=g55.wav muted=false ready=true delayMs=0
 119233 tv    speak        text=g55.wav voice=clip delayMs=0
 119327 tv    hush
 119327 tv    clip         src=i26.wav muted=false ready=true delayMs=0
 119327 tv    speak        text=i26.wav voice=clip delayMs=0
 119422 tv    hush
 119422 tv    clip         src=i22.wav muted=false ready=true delayMs=0
 119422 tv    speak        text=i22.wav voice=clip delayMs=0
 119500 tv    hush
 119500 tv    clip         src=i29.wav muted=false ready=true delayMs=0
 119500 tv    speak        text=i29.wav voice=clip delayMs=0
 119609 tv    hush
 119609 tv    clip         src=o66.wav muted=false ready=true delayMs=0
 119609 tv    speak        text=o66.wav voice=clip delayMs=0
 119719 tv    hush
 119719 tv    clip         src=g51.wav muted=false ready=true delayMs=0
 119719 tv    speak        text=g51.wav voice=clip delayMs=0
 119815 tv    hush
 119815 tv    clip         src=g53.wav muted=false ready=true delayMs=0
 119815 tv    speak        text=g53.wav voice=clip delayMs=0
 119908 tv    hush
 119908 tv    clip         src=b9.wav muted=false ready=true delayMs=0
 119908 tv    speak        text=b9.wav voice=clip delayMs=0
 120003 tv    hush
 120003 tv    clip         src=n36.wav muted=false ready=true delayMs=0
 120003 tv    speak        text=n36.wav voice=clip delayMs=0
 120099 tv    hush
 120099 tv    clip         src=g52.wav muted=false ready=true delayMs=0
 120099 tv    speak        text=g52.wav voice=clip delayMs=0
 120191 tv    hush
 120192 tv    clip         src=b1.wav muted=false ready=true delayMs=0
 120192 tv    speak        text=b1.wav voice=clip delayMs=0
 120271 tv    hush
 120271 tv    clip         src=b13.wav muted=false ready=true delayMs=0
 120271 tv    speak        text=b13.wav voice=clip delayMs=0
 120366 tv    hush
 120366 tv    clip         src=n37.wav muted=false ready=true delayMs=0
 120366 tv    speak        text=n37.wav voice=clip delayMs=0
 120459 tv    hush
 120459 tv    clip         src=o71.wav muted=false ready=true delayMs=0
 120459 tv    speak        text=o71.wav voice=clip delayMs=0
 120539 tv    hush
 120539 tv    clip         src=b8.wav muted=false ready=true delayMs=0
 120539 tv    speak        text=b8.wav voice=clip delayMs=0
 120648 tv    hush
 120648 tv    clip         src=b5.wav muted=false ready=true delayMs=0
 120648 tv    speak        text=b5.wav voice=clip delayMs=0
 120742 tv    hush
 120742 tv    clip         src=b7.wav muted=false ready=true delayMs=0
 120742 tv    speak        text=b7.wav voice=clip delayMs=0
 120837 tv    hush
 120837 tv    clip         src=n42.wav muted=false ready=true delayMs=0
 120837 tv    speak        text=n42.wav voice=clip delayMs=0
 120933 tv    hush
 120933 tv    clip         src=i28.wav muted=false ready=true delayMs=0
 120933 tv    speak        text=i28.wav voice=clip delayMs=0
 121038 tv    hush
 121038 tv    clip         src=i27.wav muted=false ready=true delayMs=0
 121038 tv    speak        text=i27.wav voice=clip delayMs=0
 121132 tv    hush
 121132 tv    clip         src=o63.wav muted=false ready=true delayMs=0
 121132 tv    speak        text=o63.wav voice=clip delayMs=0
 121227 tv    hush
 121227 tv    clip         src=o64.wav muted=false ready=true delayMs=0
 121227 tv    speak        text=o64.wav voice=clip delayMs=0
 121306 tv    hush
 121306 tv    clip         src=o73.wav muted=false ready=true delayMs=0
 121306 tv    speak        text=o73.wav voice=clip delayMs=0
 121412 tv    hush
 121412 tv    clip         src=g50.wav muted=false ready=true delayMs=0
 121412 tv    speak        text=g50.wav voice=clip delayMs=0
 121507 tv    hush
 121507 tv    clip         src=g48.wav muted=false ready=true delayMs=0
 121507 tv    speak        text=g48.wav voice=clip delayMs=0
 121601 tv    hush
 121601 tv    clip         src=b12.wav muted=false ready=true delayMs=0
 121601 tv    speak        text=b12.wav voice=clip delayMs=0
 121695 tv    hush
 121695 tv    clip         src=n45.wav muted=false ready=true delayMs=0
 121695 tv    speak        text=n45.wav voice=clip delayMs=0
 121788 tv    hush
 121788 tv    clip         src=b4.wav muted=false ready=true delayMs=0
 121788 tv    speak        text=b4.wav voice=clip delayMs=0
 121897 tv    hush
 121897 tv    clip         src=g46.wav muted=false ready=true delayMs=0
 121897 tv    speak        text=g46.wav voice=clip delayMs=0
 122007 tv    hush
 122007 tv    clip         src=o74.wav muted=false ready=true delayMs=0
 122007 tv    speak        text=o74.wav voice=clip delayMs=0
 122103 tv    hush
 122103 tv    clip         src=g47.wav muted=false ready=true delayMs=0
 122103 tv    speak        text=g47.wav voice=clip delayMs=0
 122209 tv    hush
 122209 tv    clip         src=n31.wav muted=false ready=true delayMs=0
 122209 tv    speak        text=n31.wav voice=clip delayMs=0
 122302 tv    hush
 122302 tv    clip         src=o62.wav muted=false ready=true delayMs=0
 122302 tv    speak        text=o62.wav voice=clip delayMs=0
 122395 tv    hush
 122395 tv    clip         src=b10.wav muted=false ready=true delayMs=0
 122395 tv    speak        text=b10.wav voice=clip delayMs=0
 122491 tv    hush
 122491 tv    clip         src=g60.wav muted=false ready=true delayMs=0
 122491 tv    speak        text=g60.wav voice=clip delayMs=0
 122586 tv    hush
 122586 tv    clip         src=n38.wav muted=false ready=true delayMs=0
 122586 tv    speak        text=n38.wav voice=clip delayMs=0
 122693 tv    hush
 122694 tv    clip         src=n39.wav muted=false ready=true delayMs=0
 122694 tv    speak        text=n39.wav voice=clip delayMs=0
 122789 tv    hush
 122789 tv    clip         src=o70.wav muted=false ready=true delayMs=0
 122789 tv    speak        text=o70.wav voice=clip delayMs=0
 122883 tv    hush
 122883 tv    clip         src=b11.wav muted=false ready=true delayMs=0
 122883 tv    speak        text=b11.wav voice=clip delayMs=0
 122977 tv    hush
 122977 tv    clip         src=o75.wav muted=false ready=true delayMs=0
 122977 tv    speak        text=o75.wav voice=clip delayMs=0
 123072 tv    hush
 123072 tv    clip         src=g58.wav muted=false ready=true delayMs=0
 123072 tv    speak        text=g58.wav voice=clip delayMs=0
 123180 tv    hush
 123180 tv    clip         src=b15.wav muted=false ready=true delayMs=0
 123180 tv    speak        text=b15.wav voice=clip delayMs=0
 123277 tv    hush
 123277 tv    clip         src=i24.wav muted=false ready=true delayMs=0
 123277 tv    speak        text=i24.wav voice=clip delayMs=0
 123386 tv    hush
 123386 tv    clip         src=o72.wav muted=false ready=true delayMs=0
 123386 tv    speak        text=o72.wav voice=clip delayMs=0
 123478 tv    hush
 123478 tv    clip         src=g56.wav muted=false ready=true delayMs=0
 123478 tv    speak        text=g56.wav voice=clip delayMs=0
 123573 tv    hush
 123573 tv    clip         src=i20.wav muted=false ready=true delayMs=0
 123573 tv    speak        text=i20.wav voice=clip delayMs=0
 123668 tv    hush
 123668 tv    clip         src=n44.wav muted=false ready=true delayMs=0
 123668 tv    speak        text=n44.wav voice=clip delayMs=0
 123763 tv    hush
 123763 tv    clip         src=b3.wav muted=false ready=true delayMs=0
 123763 tv    speak        text=b3.wav voice=clip delayMs=0
 123857 tv    hush
 123857 tv    clip         src=o68.wav muted=false ready=true delayMs=0
 123857 tv    speak        text=o68.wav voice=clip delayMs=0
 123954 tv    hush
 123954 tv    clip         src=b2.wav muted=false ready=true delayMs=0
 123954 tv    speak        text=b2.wav voice=clip delayMs=0
 124045 tv    hush
 124045 tv    clip         src=n41.wav muted=false ready=true delayMs=0
 124045 tv    speak        text=n41.wav voice=clip delayMs=0
 124125 tv    hush
 124125 tv    clip         src=o65.wav muted=false ready=true delayMs=0
 124125 tv    speak        text=o65.wav voice=clip delayMs=0
 124218 tv    hush
 124218 tv    clip         src=i17.wav muted=false ready=true delayMs=0
 124218 tv    speak        text=i17.wav voice=clip delayMs=0
 124313 tv    hush
 124313 tv    clip         src=i25.wav muted=false ready=true delayMs=0
 124313 tv    speak        text=i25.wav voice=clip delayMs=0
 124406 tv    hush
 124406 tv    clip         src=i19.wav muted=false ready=true delayMs=0
 124406 tv    speak        text=i19.wav voice=clip delayMs=0
 124501 tv    hush
 124501 tv    clip         src=g57.wav muted=false ready=true delayMs=0
 124501 tv    speak        text=g57.wav voice=clip delayMs=0
 124595 tv    hush
 124595 tv    clip         src=g59.wav muted=false ready=true delayMs=0
 124595 tv    speak        text=g59.wav voice=clip delayMs=0
 124786 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 125893 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 126152 tv    hush
 126152 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 126152 tv    hush
 133772 tv    music:duck   ms=9000
 133772 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 138780 tv    hush
 138780 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 138781 tv    hush
 140352 tv    ss:cancel    speaking=false pending=false
 140352 tv    music:plan   from=game:bingo to=null
 140356 tv    ss:cancel    speaking=false pending=false
 140356 tv    music:plan   from=null to=lobby
 140356 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 141158 tv    music:stop   track=wallpaper.mp3
 142868 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 142888 tv    ss:cancel    speaking=false pending=false
 142892 tv    music:plan   from=lobby to=game:bingo
 142893 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 142893 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 142902 tv    hush
 142902 tv    hush
 143553 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 143696 tv    music:stop   track=local-forecast-elevator.mp3
 144115 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
 145056 tv    ss:cancel    speaking=false pending=false
 145056 tv    music:plan   from=game:bingo to=null
 145056 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 146560 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 147217 tv    ss:cancel    speaking=false pending=false
 147217 tv    music:plan   from=null to=lobby
 147217 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 150584 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 150602 tv    ss:cancel    speaking=false pending=false
 150611 tv    music:plan   from=lobby to=game:bingo
 150611 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 150611 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 150618 tv    hush
 150619 tv    hush
 151026 tv    cue          cue=lock surface=tv muted=false ready=true semitones=8
 151030 tv    hush
 151030 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 151030 tv    speak        text=i21.wav voice=clip delayMs=0
 151031 tv    hush
 151223 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 151412 tv    music:stop   track=airport-lounge.mp3
 151535 tv    ss:cancel    speaking=false pending=false
 151535 tv    music:plan   from=game:bingo to=null
 151541 tv    ss:cancel    speaking=false pending=false
 151541 tv    music:plan   from=null to=lobby
 151541 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 152356 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, the lobby track only fading out, the warm bed under the intro** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.06,"t":10.3}] bed=warm
- ❌ **the writing track eases in (under 0.2 a third of a second in), never a hard start** — playing=[{"track":"bossa-antigua.mp3","vol":0.04,"t":10.7}]
- ❌ **answer → one Wisecrack track at 0.2 while everyone writes, the bed gone** — playing=[] bed=null
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **vote → the marimba bed (the first prompt), the track fading out** — bed=marimba playing=[]
- ✅ **reveal keeps the vote’s bed (same list, same turn: no crossfade on the cut)** — bed=marimba playing=[]
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal
- ✅ **scores phase → tally ping (mapped), the lounge bed** — cues=phase,reveal,phase,reveal,tally bed=lounge

```
 157208 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157640 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158073 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158505 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158938 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 160107 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 160709 tv    ss:cancel    speaking=false pending=false
 160717 tv    music:plan   from=lobby to=null
 160717 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 161986 tv    music:plan   from=null to=game:wisecrack
 161986 tv    music:start  plan=game:wisecrack track=carefree mode=chain volume=0.2
 161986 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 161993 tv    music:stop   track=carefree.mp3
 161993 tv    music:stop   track=
 162496 tv    music:start  plan=game:wisecrack track=sneaky-snitch mode=chain volume=0.2
 162504 tv    music:stop   track=sneaky-snitch.mp3
 162508 tv    music:stop   track=
 162791 tv    music:stop   track=bossa-antigua.mp3
 163012 tv    music:start  plan=game:wisecrack track=carefree mode=chain volume=0.2
 163019 tv    music:stop   track=carefree.mp3
 163019 tv    music:stop   track=
 163528 tv    music:start  plan=game:wisecrack track=sneaky-snitch mode=chain volume=0.2
 163533 tv    music:stop   track=sneaky-snitch.mp3
 163533 tv    music:stop   track=
 164038 tv    music:start  plan=game:wisecrack track=carefree mode=chain volume=0.2
 164039 tv    music:stop   track=carefree.mp3
 164039 tv    music:stop   track=
 164543 tv    music:start  plan=game:wisecrack track=fluffing-a-duck mode=chain volume=0.2
 164550 tv    music:stop   track=fluffing-a-duck.mp3
 164550 tv    music:stop   track=
 165061 tv    music:start  plan=game:wisecrack track=carefree mode=chain volume=0.2
 165061 tv    music:stop   track=carefree.mp3
 165062 tv    music:stop   track=
 165507 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 165570 tv    music:start  plan=game:wisecrack track=sneaky-snitch mode=chain volume=0.2
 165571 tv    music:stop   track=sneaky-snitch.mp3
 165571 tv    music:stop   track=
 166073 tv    music:start  plan=game:wisecrack track=carefree mode=chain volume=0.2
 166073 tv    music:stop   track=carefree.mp3
 166074 tv    music:stop   track=
 166578 tv    music:start  plan=game:wisecrack track=sneaky-snitch mode=chain volume=0.2
 166579 tv    music:stop   track=sneaky-snitch.mp3
 166580 tv    music:stop   track=
 166814 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 167084 tv    music:start  plan=game:wisecrack track=carefree mode=chain volume=0.2
 167085 tv    music:stop   track=carefree.mp3
 167085 tv    music:stop   track=
 167587 tv    music:start  plan=game:wisecrack track=sneaky-snitch mode=chain volume=0.2
 167588 tv    music:stop   track=sneaky-snitch.mp3
 167588 tv    music:stop   track=
 168096 tv    music:start  plan=game:wisecrack track=carefree mode=chain volume=0.2
 168097 tv    music:stop   track=carefree.mp3
 168097 tv    music:stop   track=
 168144 tv    music:plan   from=game:wisecrack to=null
 168146 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 168146 tv    bed:duck     bed=marimba cue=phase
 169241 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 169241 tv    bed:duck     bed=marimba cue=reveal
 172918 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 172918 tv    bed:duck     bed=lofi cue=phase
 173092 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 173092 tv    bed:duck     bed=lofi cue=reveal
 173281 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 173281 tv    bed:duck     bed=marimba cue=phase
 173469 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 173469 tv    bed:duck     bed=marimba cue=reveal
 173660 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 173660 tv    bed:duck     bed=lounge cue=tally
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ❌ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — []
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 174800 tv    ss:cancel    speaking=false pending=false
 174807 tv    ss:cancel    speaking=false pending=false
 174807 tv    music:plan   from=null to=lobby
 176822 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 176838 tv    ss:cancel    speaking=false pending=false
 176841 tv    music:plan   from=lobby to=null
 176841 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 178426 tv    music:plan   from=null to=game:broken-pencil
 178426 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 179923 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 180425 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 180556 tv    music:plan   from=game:broken-pencil to=null
 180556 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
```
