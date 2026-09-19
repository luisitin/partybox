# Audio interaction trace

Captured 2026-09-19T04:29:17.528Z on port 42071. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**68 / 71 checks passed.** Failed: F: the writing track eases in (under 0.2 a third of a second in), never a hard start; F: answer → one Wisecrack track at 0.2 × its trim while everyone writes, the bed gone; G: draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.5}]

```
   1796 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1828 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3153 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3308 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   4008 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4642 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5511 tv    ss:cancel    speaking=false pending=false
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
   6367 tv    music:plan   from=lobby to=null
   6367 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7874 tv    music:stop   track=airport-lounge.mp3
   8322 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   8322 tv    bed:duck     bed=pulse cue=phase
   9611 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16575 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17574 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18574 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19573 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20575 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21362 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  21362 tv    bed:duck     bed=pulse cue=reveal
  22180 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22180 tv    bed:duck     bed=pulse cue=phase
  22340 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22340 tv    bed:duck     bed=pulse cue=reveal
  22495 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22495 tv    bed:duck     bed=pulse cue=phase
  22650 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22650 tv    bed:duck     bed=pulse cue=reveal
  22808 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22808 tv    bed:duck     bed=pulse cue=phase
  22961 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22961 tv    bed:duck     bed=pulse cue=reveal
  23119 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23119 tv    bed:duck     bed=pulse cue=phase
  23276 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23276 tv    bed:duck     bed=pulse cue=reveal
  23436 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23436 tv    bed:duck     bed=pulse cue=phase
  23576 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23576 tv    bed:duck     bed=pulse cue=reveal
  23718 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23718 tv    bed:duck     bed=pulse cue=phase
  23873 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23873 tv    bed:duck     bed=pulse cue=reveal
  24031 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24031 tv    bed:duck     bed=pulse cue=phase
  24187 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24187 tv    bed:duck     bed=pulse cue=reveal
  24345 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24345 tv    bed:duck     bed=pulse cue=phase
  24502 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24502 tv    bed:duck     bed=pulse cue=reveal
  24659 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24659 tv    bed:duck     bed=pulse cue=phase
  24817 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24818 tv    bed:duck     bed=pulse cue=reveal
  24963 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  24963 tv    bed:duck     bed=latenight cue=wager
  25839 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  25839 tv    bed:duck     bed=pulse cue=phase
  26170 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  26170 tv    bed:duck     bed=pulse cue=silence
  27975 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  27975 tv    bed:duck     bed=pulse cue=bust
  29711 tv    ss:cancel    speaking=false pending=false
  29711 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":1.5}]

```
  31283 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33434 tv    ss:cancel    speaking=false pending=false
  33434 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  35001 tv    ss:cancel    speaking=false pending=false
  35001 tv    music:plan   from=null to=lobby
  35001 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:george-street-shuffle.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":3}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime** — cues=start,card,lock,lock,tick,tick,tick,call
- ✅ **the hand feels each card land (one 12 ms tap per card) and then the first call** — taps(12)=2 (1 card + the first call)
- ✅ **each Ready ticks (lock, rising); the 3 · 2 · 1's first tick comes a breath (≥ 300 ms) after the last** — locks=2 last lock→first tick=446ms
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+1052ms phone@+1072ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "another" is a 20 ms tap and one card pluck; Ready a 20 ms tap and the submit cue** — taps=3 cues=card,submit
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **each voice starts on the push (no delay); its boing lands on the squash, 170–230 ms later** — delays=0,0 boing lags=194,194ms
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,silence,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,silence,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":19}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":25.9}]
- ✅ **skipping through the deck: a hush before every call, one voice at a time** — clips=41 hushes=41
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5381ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":40.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,close,daub,claim,correct
- ✅ **one 'close' between the penultimate and the last daub (one square to go), once for the card** — phone cues=daub,daub,daub,close,daub,claim,correct
- ✅ **the winner's celebration buzz (320 ms) runs whole — nothing shorter cuts it** — celebration@74663 cut by=[]
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5421ms cheer@+5398ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36564 tv    music:plan   from=lobby to=game:bingo
  36565 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36565 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36915 tv    hush
  36915 tv    hush
  37373 tv    music:stop   track=george-street-shuffle.mp3
  37567 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  39653 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  40178 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
  40624 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41574 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  42623 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  43586 tv    hush
  43587 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  43587 tv    speak        text=b9.wav voice=clip delayMs=0
  43588 tv    hush
  43788 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44162 tv    hush
  44162 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  44162 tv    speak        text=b8.wav voice=clip delayMs=0
  44356 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45986 tv    hush
  45986 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  45986 tv    speak        text=n34.wav voice=clip delayMs=0
  46180 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  47887 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  48149 tv    hush
  48149 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  48149 tv    hush
  53515 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  53519 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  56515 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57522 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58516 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  59518 tv    hush
  59518 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  59518 tv    speak        text=n35.wav voice=clip delayMs=0
  59712 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61338 tv    music:paused paused=true
  61338 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  62587 tv    music:paused paused=false
  62587 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  63882 tv    hush
  63882 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  63882 tv    speak        text=i25.wav voice=clip delayMs=0
  64009 tv    hush
  64009 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  64009 tv    speak        text=n45.wav voice=clip delayMs=0
  64134 tv    hush
  64134 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  64134 tv    speak        text=n33.wav voice=clip delayMs=0
  64259 tv    hush
  64259 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  64259 tv    speak        text=g49.wav voice=clip delayMs=0
  64385 tv    hush
  64385 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  64385 tv    speak        text=b4.wav voice=clip delayMs=0
  64511 tv    hush
  64511 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  64511 tv    speak        text=i20.wav voice=clip delayMs=0
  64636 tv    hush
  64636 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  64636 tv    speak        text=o69.wav voice=clip delayMs=0
  64765 tv    hush
  64765 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  64765 tv    speak        text=o67.wav voice=clip delayMs=0
  64877 tv    hush
  64877 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  64877 tv    speak        text=o65.wav voice=clip delayMs=0
  65000 tv    hush
  65000 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  65000 tv    speak        text=o73.wav voice=clip delayMs=0
  65125 tv    hush
  65125 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  65125 tv    speak        text=i21.wav voice=clip delayMs=0
  65252 tv    hush
  65252 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  65252 tv    speak        text=i18.wav voice=clip delayMs=0
  65377 tv    hush
  65377 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  65377 tv    speak        text=g58.wav voice=clip delayMs=0
  65504 tv    hush
  65504 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  65504 tv    speak        text=n36.wav voice=clip delayMs=0
  65625 tv    hush
  65625 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  65625 tv    speak        text=o61.wav voice=clip delayMs=0
  65737 tv    hush
  65737 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  65737 tv    speak        text=n37.wav voice=clip delayMs=0
  65862 tv    hush
  65862 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  65862 tv    speak        text=i16.wav voice=clip delayMs=0
  65972 tv    hush
  65972 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  65972 tv    speak        text=g47.wav voice=clip delayMs=0
  66098 tv    hush
  66098 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  66098 tv    speak        text=n41.wav voice=clip delayMs=0
  66205 tv    hush
  66205 tv    clip         src=b6.wav muted=false ready=true delayMs=0
  66205 tv    speak        text=b6.wav voice=clip delayMs=0
  66333 tv    hush
  66333 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  66333 tv    speak        text=o72.wav voice=clip delayMs=0
  66457 tv    hush
  66457 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  66457 tv    speak        text=b3.wav voice=clip delayMs=0
  66586 tv    hush
  66586 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  66586 tv    speak        text=i30.wav voice=clip delayMs=0
  66709 tv    hush
  66709 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  66709 tv    speak        text=g56.wav voice=clip delayMs=0
  66821 tv    hush
  66821 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  66821 tv    speak        text=o75.wav voice=clip delayMs=0
  66931 tv    hush
  66931 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  66931 tv    speak        text=b1.wav voice=clip delayMs=0
  67054 tv    hush
  67054 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  67054 tv    speak        text=b2.wav voice=clip delayMs=0
  67181 tv    hush
  67181 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  67181 tv    speak        text=n32.wav voice=clip delayMs=0
  67306 tv    hush
  67306 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  67306 tv    speak        text=g48.wav voice=clip delayMs=0
  67431 tv    hush
  67431 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  67431 tv    speak        text=i23.wav voice=clip delayMs=0
  67553 tv    hush
  67553 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  67553 tv    speak        text=i26.wav voice=clip delayMs=0
  67679 tv    hush
  67679 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  67679 tv    speak        text=o66.wav voice=clip delayMs=0
  67802 tv    hush
  67802 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  67802 tv    speak        text=i19.wav voice=clip delayMs=0
  67929 tv    hush
  67929 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  67929 tv    speak        text=n42.wav voice=clip delayMs=0
  68053 tv    hush
  68053 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  68053 tv    speak        text=i24.wav voice=clip delayMs=0
  68168 tv    hush
  68169 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  68169 tv    speak        text=n39.wav voice=clip delayMs=0
  68290 tv    hush
  68290 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  68290 tv    speak        text=g46.wav voice=clip delayMs=0
  68416 tv    hush
  68416 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  68416 tv    speak        text=n44.wav voice=clip delayMs=0
  68540 tv    hush
  68540 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  68540 tv    speak        text=b15.wav voice=clip delayMs=0
  68663 tv    hush
  68663 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  68663 tv    speak        text=b11.wav voice=clip delayMs=0
  68787 tv    hush
  68787 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  68787 tv    speak        text=g57.wav voice=clip delayMs=0
  68981 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  69453 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  69736 tv    hush
  69737 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  69737 tv    hush
  71614 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  75117 tv    music:duck   ms=9000
  75117 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  79947 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  80251 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81255 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82254 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  83249 tv    hush
  83249 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  83249 tv    speak        text=g57.wav voice=clip delayMs=0
  83450 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  85576 tv    ss:cancel    speaking=false pending=false
  85576 tv    music:plan   from=game:bingo to=null
  85582 tv    ss:cancel    speaking=false pending=false
  85582 tv    music:plan   from=null to=lobby
  85582 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  86383 tv    music:stop   track=wallpaper.mp3
  88092 tv    ss:cancel    speaking=false pending=false
  88112 tv    music:plan   from=lobby to=game:bingo
  88112 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  88112 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  88119 tv    hush
  88119 tv    hush
  88715 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  88720 tv    hush
  88720 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  88720 tv    speak        text=i21.wav voice=clip delayMs=0
  88720 tv    hush
  88733 tv    hush
  88733 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  88733 tv    speak        text=n32.wav voice=clip delayMs=0
  88828 tv    hush
  88828 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  88828 tv    speak        text=i18.wav voice=clip delayMs=0
  88920 tv    music:stop   track=airport-lounge.mp3
  88927 tv    hush
  88927 tv    clip         src=n40.wav muted=false ready=true delayMs=0
  88927 tv    speak        text=n40.wav voice=clip delayMs=0
  89011 tv    hush
  89011 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  89011 tv    speak        text=i30.wav voice=clip delayMs=0
  89105 tv    hush
  89105 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  89105 tv    speak        text=o69.wav voice=clip delayMs=0
  89201 tv    hush
  89201 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  89201 tv    speak        text=o61.wav voice=clip delayMs=0
  89297 tv    hush
  89297 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  89297 tv    speak        text=n34.wav voice=clip delayMs=0
  89385 tv    hush
  89385 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  89385 tv    speak        text=n35.wav voice=clip delayMs=0
  89478 tv    hush
  89478 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  89478 tv    speak        text=o67.wav voice=clip delayMs=0
  89581 tv    hush
  89581 tv    clip         src=g55.wav muted=false ready=true delayMs=0
  89581 tv    speak        text=g55.wav voice=clip delayMs=0
  89686 tv    hush
  89686 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  89686 tv    speak        text=i26.wav voice=clip delayMs=0
  89778 tv    hush
  89779 tv    clip         src=i22.wav muted=false ready=true delayMs=0
  89779 tv    speak        text=i22.wav voice=clip delayMs=0
  89891 tv    hush
  89891 tv    clip         src=i29.wav muted=false ready=true delayMs=0
  89891 tv    speak        text=i29.wav voice=clip delayMs=0
  89988 tv    hush
  89988 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  89988 tv    speak        text=o66.wav voice=clip delayMs=0
  90086 tv    hush
  90086 tv    clip         src=g51.wav muted=false ready=true delayMs=0
  90086 tv    speak        text=g51.wav voice=clip delayMs=0
  90195 tv    hush
  90195 tv    clip         src=g53.wav muted=false ready=true delayMs=0
  90195 tv    speak        text=g53.wav voice=clip delayMs=0
  90293 tv    hush
  90293 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  90293 tv    speak        text=b9.wav voice=clip delayMs=0
  90378 tv    hush
  90378 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  90378 tv    speak        text=n36.wav voice=clip delayMs=0
  90481 tv    hush
  90481 tv    clip         src=g52.wav muted=false ready=true delayMs=0
  90481 tv    speak        text=g52.wav voice=clip delayMs=0
  90566 tv    hush
  90566 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  90566 tv    speak        text=b1.wav voice=clip delayMs=0
  90679 tv    hush
  90679 tv    clip         src=b13.wav muted=false ready=true delayMs=0
  90679 tv    speak        text=b13.wav voice=clip delayMs=0
  90771 tv    hush
  90771 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  90771 tv    speak        text=n37.wav voice=clip delayMs=0
  90860 tv    hush
  90860 tv    clip         src=o71.wav muted=false ready=true delayMs=0
  90860 tv    speak        text=o71.wav voice=clip delayMs=0
  90974 tv    hush
  90974 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  90974 tv    speak        text=b8.wav voice=clip delayMs=0
  91066 tv    hush
  91066 tv    clip         src=b5.wav muted=false ready=true delayMs=0
  91066 tv    speak        text=b5.wav voice=clip delayMs=0
  91163 tv    hush
  91163 tv    clip         src=b7.wav muted=false ready=true delayMs=0
  91163 tv    speak        text=b7.wav voice=clip delayMs=0
  91265 tv    hush
  91265 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  91265 tv    speak        text=n42.wav voice=clip delayMs=0
  91365 tv    hush
  91365 tv    clip         src=i28.wav muted=false ready=true delayMs=0
  91365 tv    speak        text=i28.wav voice=clip delayMs=0
  91446 tv    hush
  91446 tv    clip         src=i27.wav muted=false ready=true delayMs=0
  91446 tv    speak        text=i27.wav voice=clip delayMs=0
  91537 tv    hush
  91537 tv    clip         src=o63.wav muted=false ready=true delayMs=0
  91537 tv    speak        text=o63.wav voice=clip delayMs=0
  91645 tv    hush
  91645 tv    clip         src=o64.wav muted=false ready=true delayMs=0
  91645 tv    speak        text=o64.wav voice=clip delayMs=0
  91748 tv    hush
  91748 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  91748 tv    speak        text=o73.wav voice=clip delayMs=0
  91846 tv    hush
  91846 tv    clip         src=g50.wav muted=false ready=true delayMs=0
  91846 tv    speak        text=g50.wav voice=clip delayMs=0
  91951 tv    hush
  91951 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  91951 tv    speak        text=g48.wav voice=clip delayMs=0
  92030 tv    hush
  92030 tv    clip         src=b12.wav muted=false ready=true delayMs=0
  92030 tv    speak        text=b12.wav voice=clip delayMs=0
  92130 tv    hush
  92130 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  92130 tv    speak        text=n45.wav voice=clip delayMs=0
  92236 tv    hush
  92236 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  92236 tv    speak        text=b4.wav voice=clip delayMs=0
  92298 tv    hush
  92298 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  92298 tv    speak        text=g46.wav voice=clip delayMs=0
  92414 tv    hush
  92414 tv    clip         src=o74.wav muted=false ready=true delayMs=0
  92414 tv    speak        text=o74.wav voice=clip delayMs=0
  92501 tv    hush
  92501 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  92501 tv    speak        text=g47.wav voice=clip delayMs=0
  92598 tv    hush
  92598 tv    clip         src=n31.wav muted=false ready=true delayMs=0
  92598 tv    speak        text=n31.wav voice=clip delayMs=0
  92696 tv    hush
  92696 tv    clip         src=o62.wav muted=false ready=true delayMs=0
  92696 tv    speak        text=o62.wav voice=clip delayMs=0
  92795 tv    hush
  92796 tv    clip         src=b10.wav muted=false ready=true delayMs=0
  92796 tv    speak        text=b10.wav voice=clip delayMs=0
  92884 tv    hush
  92884 tv    clip         src=g60.wav muted=false ready=true delayMs=0
  92884 tv    speak        text=g60.wav voice=clip delayMs=0
  92979 tv    hush
  92979 tv    clip         src=n38.wav muted=false ready=true delayMs=0
  92979 tv    speak        text=n38.wav voice=clip delayMs=0
  93078 tv    hush
  93078 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  93078 tv    speak        text=n39.wav voice=clip delayMs=0
  93191 tv    hush
  93191 tv    clip         src=o70.wav muted=false ready=true delayMs=0
  93191 tv    speak        text=o70.wav voice=clip delayMs=0
  93269 tv    hush
  93269 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  93269 tv    speak        text=b11.wav voice=clip delayMs=0
  93344 tv    hush
  93344 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  93344 tv    speak        text=o75.wav voice=clip delayMs=0
  93447 tv    hush
  93447 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  93447 tv    speak        text=g58.wav voice=clip delayMs=0
  93528 tv    hush
  93528 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  93528 tv    speak        text=b15.wav voice=clip delayMs=0
  93628 tv    hush
  93628 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  93628 tv    speak        text=i24.wav voice=clip delayMs=0
  93725 tv    hush
  93726 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  93726 tv    speak        text=o72.wav voice=clip delayMs=0
  93814 tv    hush
  93814 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  93814 tv    speak        text=g56.wav voice=clip delayMs=0
  93915 tv    hush
  93915 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  93915 tv    speak        text=i20.wav voice=clip delayMs=0
  94034 tv    hush
  94034 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  94034 tv    speak        text=n44.wav voice=clip delayMs=0
  94112 tv    hush
  94112 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  94112 tv    speak        text=b3.wav voice=clip delayMs=0
  94207 tv    hush
  94207 tv    clip         src=o68.wav muted=false ready=true delayMs=0
  94207 tv    speak        text=o68.wav voice=clip delayMs=0
  94287 tv    hush
  94287 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  94287 tv    speak        text=b2.wav voice=clip delayMs=0
  94379 tv    hush
  94379 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  94379 tv    speak        text=n41.wav voice=clip delayMs=0
  94475 tv    hush
  94475 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  94475 tv    speak        text=o65.wav voice=clip delayMs=0
  94567 tv    hush
  94567 tv    clip         src=i17.wav muted=false ready=true delayMs=0
  94567 tv    speak        text=i17.wav voice=clip delayMs=0
  94663 tv    hush
  94663 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  94663 tv    speak        text=i25.wav voice=clip delayMs=0
  94756 tv    hush
  94756 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  94756 tv    speak        text=i19.wav voice=clip delayMs=0
  94847 tv    hush
  94847 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  94847 tv    speak        text=g57.wav voice=clip delayMs=0
  94942 tv    hush
  94942 tv    clip         src=g59.wav muted=false ready=true delayMs=0
  94942 tv    speak        text=g59.wav voice=clip delayMs=0
  95036 tv    hush
  95036 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  95036 tv    speak        text=g49.wav voice=clip delayMs=0
  95146 tv    hush
  95146 tv    clip         src=n43.wav muted=false ready=true delayMs=0
  95146 tv    speak        text=n43.wav voice=clip delayMs=0
  95222 tv    hush
  95222 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  95222 tv    speak        text=i16.wav voice=clip delayMs=0
  95316 tv    hush
  95316 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  95316 tv    speak        text=n33.wav voice=clip delayMs=0
  95428 tv    hush
  95428 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  95428 tv    speak        text=i23.wav voice=clip delayMs=0
  95507 tv    hush
  95507 tv    clip         src=g54.wav muted=false ready=true delayMs=0
  95507 tv    speak        text=g54.wav voice=clip delayMs=0
  95609 tv    hush
  95609 tv    clip         src=b14.wav muted=false ready=true delayMs=0
  95609 tv    speak        text=b14.wav voice=clip delayMs=0
  95803 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  96867 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  97128 tv    hush
  97128 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  97128 tv    hush
 104747 tv    music:duck   ms=9000
 104747 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 109751 tv    hush
 109751 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 109752 tv    hush
 113744 tv    ss:cancel    speaking=false pending=false
 113744 tv    music:plan   from=game:bingo to=null
 113744 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 115252 tv    music:stop   track=wallpaper.mp3
 115374 tv    ss:cancel    speaking=false pending=false
 115374 tv    music:plan   from=null to=lobby
 115374 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 117902 tv    ss:cancel    speaking=false pending=false
 117918 tv    music:plan   from=lobby to=game:bingo
 117918 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 117918 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 117924 tv    hush
 117925 tv    hush
 118531 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 118535 tv    hush
 118535 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 118535 tv    speak        text=i21.wav voice=clip delayMs=0
 118536 tv    hush
 118548 tv    hush
 118548 tv    clip         src=n32.wav muted=false ready=true delayMs=0
 118548 tv    speak        text=n32.wav voice=clip delayMs=0
 118662 tv    hush
 118662 tv    clip         src=i18.wav muted=false ready=true delayMs=0
 118662 tv    speak        text=i18.wav voice=clip delayMs=0
 118720 tv    music:stop   track=bossa-antigua.mp3
 118750 tv    hush
 118750 tv    clip         src=n40.wav muted=false ready=true delayMs=0
 118750 tv    speak        text=n40.wav voice=clip delayMs=0
 118843 tv    hush
 118843 tv    clip         src=i30.wav muted=false ready=true delayMs=0
 118843 tv    speak        text=i30.wav voice=clip delayMs=0
 118954 tv    hush
 118954 tv    clip         src=o69.wav muted=false ready=true delayMs=0
 118954 tv    speak        text=o69.wav voice=clip delayMs=0
 119051 tv    hush
 119051 tv    clip         src=o61.wav muted=false ready=true delayMs=0
 119051 tv    speak        text=o61.wav voice=clip delayMs=0
 119130 tv    hush
 119130 tv    clip         src=n34.wav muted=false ready=true delayMs=0
 119130 tv    speak        text=n34.wav voice=clip delayMs=0
 119233 tv    hush
 119233 tv    clip         src=n35.wav muted=false ready=true delayMs=0
 119233 tv    speak        text=n35.wav voice=clip delayMs=0
 119325 tv    hush
 119325 tv    clip         src=o67.wav muted=false ready=true delayMs=0
 119325 tv    speak        text=o67.wav voice=clip delayMs=0
 119426 tv    hush
 119426 tv    clip         src=g55.wav muted=false ready=true delayMs=0
 119426 tv    speak        text=g55.wav voice=clip delayMs=0
 119520 tv    hush
 119520 tv    clip         src=i26.wav muted=false ready=true delayMs=0
 119520 tv    speak        text=i26.wav voice=clip delayMs=0
 119621 tv    hush
 119621 tv    clip         src=i22.wav muted=false ready=true delayMs=0
 119621 tv    speak        text=i22.wav voice=clip delayMs=0
 119710 tv    hush
 119710 tv    clip         src=i29.wav muted=false ready=true delayMs=0
 119710 tv    speak        text=i29.wav voice=clip delayMs=0
 119800 tv    hush
 119800 tv    clip         src=o66.wav muted=false ready=true delayMs=0
 119800 tv    speak        text=o66.wav voice=clip delayMs=0
 119907 tv    hush
 119907 tv    clip         src=g51.wav muted=false ready=true delayMs=0
 119907 tv    speak        text=g51.wav voice=clip delayMs=0
 120011 tv    hush
 120012 tv    clip         src=g53.wav muted=false ready=true delayMs=0
 120012 tv    speak        text=g53.wav voice=clip delayMs=0
 120119 tv    hush
 120119 tv    clip         src=b9.wav muted=false ready=true delayMs=0
 120119 tv    speak        text=b9.wav voice=clip delayMs=0
 120197 tv    hush
 120197 tv    clip         src=n36.wav muted=false ready=true delayMs=0
 120197 tv    speak        text=n36.wav voice=clip delayMs=0
 120287 tv    hush
 120287 tv    clip         src=g52.wav muted=false ready=true delayMs=0
 120287 tv    speak        text=g52.wav voice=clip delayMs=0
 120392 tv    hush
 120392 tv    clip         src=b1.wav muted=false ready=true delayMs=0
 120392 tv    speak        text=b1.wav voice=clip delayMs=0
 120451 tv    hush
 120451 tv    clip         src=b13.wav muted=false ready=true delayMs=0
 120451 tv    speak        text=b13.wav voice=clip delayMs=0
 120533 tv    hush
 120533 tv    clip         src=n37.wav muted=false ready=true delayMs=0
 120533 tv    speak        text=n37.wav voice=clip delayMs=0
 120626 tv    hush
 120626 tv    clip         src=o71.wav muted=false ready=true delayMs=0
 120626 tv    speak        text=o71.wav voice=clip delayMs=0
 120720 tv    hush
 120720 tv    clip         src=b8.wav muted=false ready=true delayMs=0
 120720 tv    speak        text=b8.wav voice=clip delayMs=0
 120817 tv    hush
 120817 tv    clip         src=b5.wav muted=false ready=true delayMs=0
 120817 tv    speak        text=b5.wav voice=clip delayMs=0
 120909 tv    hush
 120909 tv    clip         src=b7.wav muted=false ready=true delayMs=0
 120909 tv    speak        text=b7.wav voice=clip delayMs=0
 120977 tv    hush
 120977 tv    clip         src=n42.wav muted=false ready=true delayMs=0
 120977 tv    speak        text=n42.wav voice=clip delayMs=0
 121098 tv    hush
 121098 tv    clip         src=i28.wav muted=false ready=true delayMs=0
 121098 tv    speak        text=i28.wav voice=clip delayMs=0
 121185 tv    hush
 121185 tv    clip         src=i27.wav muted=false ready=true delayMs=0
 121185 tv    speak        text=i27.wav voice=clip delayMs=0
 121279 tv    hush
 121279 tv    clip         src=o63.wav muted=false ready=true delayMs=0
 121279 tv    speak        text=o63.wav voice=clip delayMs=0
 121349 tv    hush
 121349 tv    clip         src=o64.wav muted=false ready=true delayMs=0
 121349 tv    speak        text=o64.wav voice=clip delayMs=0
 121462 tv    hush
 121462 tv    clip         src=o73.wav muted=false ready=true delayMs=0
 121462 tv    speak        text=o73.wav voice=clip delayMs=0
 121550 tv    hush
 121550 tv    clip         src=g50.wav muted=false ready=true delayMs=0
 121550 tv    speak        text=g50.wav voice=clip delayMs=0
 121652 tv    hush
 121652 tv    clip         src=g48.wav muted=false ready=true delayMs=0
 121652 tv    speak        text=g48.wav voice=clip delayMs=0
 121758 tv    hush
 121758 tv    clip         src=b12.wav muted=false ready=true delayMs=0
 121758 tv    speak        text=b12.wav voice=clip delayMs=0
 121848 tv    hush
 121848 tv    clip         src=n45.wav muted=false ready=true delayMs=0
 121848 tv    speak        text=n45.wav voice=clip delayMs=0
 121940 tv    hush
 121940 tv    clip         src=b4.wav muted=false ready=true delayMs=0
 121940 tv    speak        text=b4.wav voice=clip delayMs=0
 122045 tv    hush
 122045 tv    clip         src=g46.wav muted=false ready=true delayMs=0
 122045 tv    speak        text=g46.wav voice=clip delayMs=0
 122114 tv    hush
 122114 tv    clip         src=o74.wav muted=false ready=true delayMs=0
 122114 tv    speak        text=o74.wav voice=clip delayMs=0
 122227 tv    hush
 122227 tv    clip         src=g47.wav muted=false ready=true delayMs=0
 122227 tv    speak        text=g47.wav voice=clip delayMs=0
 122315 tv    hush
 122315 tv    clip         src=n31.wav muted=false ready=true delayMs=0
 122315 tv    speak        text=n31.wav voice=clip delayMs=0
 122398 tv    hush
 122398 tv    clip         src=o62.wav muted=false ready=true delayMs=0
 122398 tv    speak        text=o62.wav voice=clip delayMs=0
 122506 tv    hush
 122506 tv    clip         src=b10.wav muted=false ready=true delayMs=0
 122506 tv    speak        text=b10.wav voice=clip delayMs=0
 122603 tv    hush
 122603 tv    clip         src=g60.wav muted=false ready=true delayMs=0
 122603 tv    speak        text=g60.wav voice=clip delayMs=0
 122708 tv    hush
 122708 tv    clip         src=n38.wav muted=false ready=true delayMs=0
 122708 tv    speak        text=n38.wav voice=clip delayMs=0
 122812 tv    hush
 122812 tv    clip         src=n39.wav muted=false ready=true delayMs=0
 122812 tv    speak        text=n39.wav voice=clip delayMs=0
 122893 tv    hush
 122893 tv    clip         src=o70.wav muted=false ready=true delayMs=0
 122893 tv    speak        text=o70.wav voice=clip delayMs=0
 122993 tv    hush
 122993 tv    clip         src=b11.wav muted=false ready=true delayMs=0
 122993 tv    speak        text=b11.wav voice=clip delayMs=0
 123101 tv    hush
 123101 tv    clip         src=o75.wav muted=false ready=true delayMs=0
 123101 tv    speak        text=o75.wav voice=clip delayMs=0
 123173 tv    hush
 123173 tv    clip         src=g58.wav muted=false ready=true delayMs=0
 123173 tv    speak        text=g58.wav voice=clip delayMs=0
 123271 tv    hush
 123271 tv    clip         src=b15.wav muted=false ready=true delayMs=0
 123271 tv    speak        text=b15.wav voice=clip delayMs=0
 123378 tv    hush
 123378 tv    clip         src=i24.wav muted=false ready=true delayMs=0
 123378 tv    speak        text=i24.wav voice=clip delayMs=0
 123466 tv    hush
 123466 tv    clip         src=o72.wav muted=false ready=true delayMs=0
 123466 tv    speak        text=o72.wav voice=clip delayMs=0
 123573 tv    hush
 123573 tv    clip         src=g56.wav muted=false ready=true delayMs=0
 123573 tv    speak        text=g56.wav voice=clip delayMs=0
 123675 tv    hush
 123675 tv    clip         src=i20.wav muted=false ready=true delayMs=0
 123675 tv    speak        text=i20.wav voice=clip delayMs=0
 123775 tv    hush
 123775 tv    clip         src=n44.wav muted=false ready=true delayMs=0
 123775 tv    speak        text=n44.wav voice=clip delayMs=0
 123867 tv    hush
 123867 tv    clip         src=b3.wav muted=false ready=true delayMs=0
 123867 tv    speak        text=b3.wav voice=clip delayMs=0
 123960 tv    hush
 123960 tv    clip         src=o68.wav muted=false ready=true delayMs=0
 123960 tv    speak        text=o68.wav voice=clip delayMs=0
 124059 tv    hush
 124059 tv    clip         src=b2.wav muted=false ready=true delayMs=0
 124059 tv    speak        text=b2.wav voice=clip delayMs=0
 124163 tv    hush
 124163 tv    clip         src=n41.wav muted=false ready=true delayMs=0
 124163 tv    speak        text=n41.wav voice=clip delayMs=0
 124244 tv    hush
 124244 tv    clip         src=o65.wav muted=false ready=true delayMs=0
 124244 tv    speak        text=o65.wav voice=clip delayMs=0
 124338 tv    hush
 124338 tv    clip         src=i17.wav muted=false ready=true delayMs=0
 124338 tv    speak        text=i17.wav voice=clip delayMs=0
 124415 tv    hush
 124415 tv    clip         src=i25.wav muted=false ready=true delayMs=0
 124415 tv    speak        text=i25.wav voice=clip delayMs=0
 124510 tv    hush
 124510 tv    clip         src=i19.wav muted=false ready=true delayMs=0
 124510 tv    speak        text=i19.wav voice=clip delayMs=0
 124606 tv    hush
 124606 tv    clip         src=g57.wav muted=false ready=true delayMs=0
 124606 tv    speak        text=g57.wav voice=clip delayMs=0
 124714 tv    hush
 124714 tv    clip         src=g59.wav muted=false ready=true delayMs=0
 124714 tv    speak        text=g59.wav voice=clip delayMs=0
 124808 tv    hush
 124808 tv    clip         src=g49.wav muted=false ready=true delayMs=0
 124808 tv    speak        text=g49.wav voice=clip delayMs=0
 124900 tv    hush
 124900 tv    clip         src=n43.wav muted=false ready=true delayMs=0
 124900 tv    speak        text=n43.wav voice=clip delayMs=0
 124997 tv    hush
 124997 tv    clip         src=i16.wav muted=false ready=true delayMs=0
 124997 tv    speak        text=i16.wav voice=clip delayMs=0
 125087 tv    hush
 125087 tv    clip         src=n33.wav muted=false ready=true delayMs=0
 125087 tv    speak        text=n33.wav voice=clip delayMs=0
 125199 tv    hush
 125199 tv    clip         src=i23.wav muted=false ready=true delayMs=0
 125199 tv    speak        text=i23.wav voice=clip delayMs=0
 125277 tv    hush
 125277 tv    clip         src=g54.wav muted=false ready=true delayMs=0
 125277 tv    speak        text=g54.wav voice=clip delayMs=0
 125374 tv    hush
 125374 tv    clip         src=b14.wav muted=false ready=true delayMs=0
 125374 tv    speak        text=b14.wav voice=clip delayMs=0
 125565 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 126615 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 126873 tv    hush
 126874 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 126874 tv    hush
 134483 tv    music:duck   ms=9000
 134483 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 139503 tv    hush
 139504 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 139504 tv    hush
 141065 tv    ss:cancel    speaking=false pending=false
 141065 tv    music:plan   from=game:bingo to=null
 141069 tv    ss:cancel    speaking=false pending=false
 141069 tv    music:plan   from=null to=lobby
 141069 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 141870 tv    music:stop   track=cool-vibes.mp3
 143614 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 143629 tv    ss:cancel    speaking=false pending=false
 143640 tv    music:plan   from=lobby to=game:bingo
 143640 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 143640 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 143647 tv    hush
 143647 tv    hush
 144301 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 144443 tv    music:stop   track=airport-lounge.mp3
 144860 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
 145762 tv    ss:cancel    speaking=false pending=false
 145762 tv    music:plan   from=game:bingo to=null
 145762 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 147272 tv    music:stop   track=cool-vibes.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 147923 tv    ss:cancel    speaking=false pending=false
 147923 tv    music:plan   from=null to=lobby
 147923 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 151306 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 151322 tv    ss:cancel    speaking=false pending=false
 151325 tv    music:plan   from=lobby to=game:bingo
 151325 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 151325 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 151333 tv    hush
 151334 tv    hush
 151743 tv    cue          cue=lock surface=tv muted=false ready=true semitones=8
 151748 tv    hush
 151748 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 151748 tv    speak        text=i21.wav voice=clip delayMs=0
 151748 tv    hush
 151940 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 152129 tv    music:stop   track=local-forecast-elevator.mp3
 152258 tv    ss:cancel    speaking=false pending=false
 152258 tv    music:plan   from=game:bingo to=null
 152265 tv    ss:cancel    speaking=false pending=false
 152265 tv    music:plan   from=null to=lobby
 152265 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 153071 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, the lobby track only fading out, the warm bed under the intro** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"airport-lounge.mp3","vol":0.06,"t":10.3}] bed=warm
- ❌ **the writing track eases in (under 0.2 a third of a second in), never a hard start** — playing=[{"track":"airport-lounge.mp3","vol":0.03,"t":10.7}]
- ❌ **answer → one Wisecrack track at 0.2 × its trim while everyone writes, the bed gone** — playing=[] bed=null
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **vote → the marimba bed (the first prompt), the track fading out** — bed=marimba playing=[]
- ✅ **reveal keeps the vote’s bed (same list, same turn: no crossfade on the cut)** — bed=marimba playing=[]
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal
- ✅ **scores phase → tally ping (mapped), the lounge bed** — cues=phase,reveal,phase,reveal,tally bed=lounge

```
 157931 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158345 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158779 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 159194 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 159626 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 160759 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 161355 tv    ss:cancel    speaking=false pending=false
 161363 tv    music:plan   from=lobby to=null
 161363 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 162648 tv    music:plan   from=null to=game:wisecrack
 162648 tv    music:start  plan=game:wisecrack track=sneaky-snitch mode=chain volume=0.2
 162648 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 162656 tv    music:stop   track=sneaky-snitch.mp3
 162656 tv    music:stop   track=
 163157 tv    music:start  plan=game:wisecrack track=fluffing-a-duck mode=chain volume=0.18600000000000003
 163163 tv    music:stop   track=fluffing-a-duck.mp3
 163163 tv    music:stop   track=
 163450 tv    music:stop   track=airport-lounge.mp3
 163667 tv    music:start  plan=game:wisecrack track=carefree mode=chain volume=0.30600000000000005
 163672 tv    music:stop   track=carefree.mp3
 163672 tv    music:stop   track=
 164179 tv    music:start  plan=game:wisecrack track=fluffing-a-duck mode=chain volume=0.18600000000000003
 164185 tv    music:stop   track=fluffing-a-duck.mp3
 164185 tv    music:stop   track=
 164700 tv    music:start  plan=game:wisecrack track=carefree mode=chain volume=0.30600000000000005
 164706 tv    music:stop   track=carefree.mp3
 164706 tv    music:stop   track=
 165209 tv    music:start  plan=game:wisecrack track=fluffing-a-duck mode=chain volume=0.18600000000000003
 165223 tv    music:stop   track=fluffing-a-duck.mp3
 165223 tv    music:stop   track=
 165733 tv    music:start  plan=game:wisecrack track=sneaky-snitch mode=chain volume=0.2
 165736 tv    music:stop   track=sneaky-snitch.mp3
 165736 tv    music:stop   track=
 166210 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 166243 tv    music:start  plan=game:wisecrack track=carefree mode=chain volume=0.30600000000000005
 166244 tv    music:stop   track=carefree.mp3
 166244 tv    music:stop   track=
 166750 tv    music:start  plan=game:wisecrack track=sneaky-snitch mode=chain volume=0.2
 166750 tv    music:stop   track=sneaky-snitch.mp3
 166751 tv    music:stop   track=
 167263 tv    music:start  plan=game:wisecrack track=fluffing-a-duck mode=chain volume=0.18600000000000003
 167263 tv    music:stop   track=fluffing-a-duck.mp3
 167264 tv    music:stop   track=
 167560 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 167767 tv    music:start  plan=game:wisecrack track=sneaky-snitch mode=chain volume=0.2
 167767 tv    music:stop   track=sneaky-snitch.mp3
 167768 tv    music:stop   track=
 168270 tv    music:start  plan=game:wisecrack track=fluffing-a-duck mode=chain volume=0.18600000000000003
 168270 tv    music:stop   track=fluffing-a-duck.mp3
 168271 tv    music:stop   track=
 168776 tv    music:start  plan=game:wisecrack track=sneaky-snitch mode=chain volume=0.2
 168777 tv    music:stop   track=sneaky-snitch.mp3
 168777 tv    music:stop   track=
 168874 tv    music:plan   from=game:wisecrack to=null
 168875 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 168875 tv    bed:duck     bed=marimba cue=phase
 170017 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 170017 tv    bed:duck     bed=marimba cue=reveal
 173657 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 173657 tv    bed:duck     bed=lofi cue=phase
 173842 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 173842 tv    bed:duck     bed=lofi cue=reveal
 174033 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 174033 tv    bed:duck     bed=marimba cue=phase
 174222 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 174222 tv    bed:duck     bed=marimba cue=reveal
 174414 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 174414 tv    bed:duck     bed=lounge cue=tally
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ❌ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — []
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 175573 tv    ss:cancel    speaking=false pending=false
 175578 tv    ss:cancel    speaking=false pending=false
 175578 tv    music:plan   from=null to=lobby
 177599 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 177615 tv    ss:cancel    speaking=false pending=false
 177618 tv    music:plan   from=lobby to=null
 177618 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 179222 tv    music:plan   from=null to=game:broken-pencil
 179222 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 180680 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 181143 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 181300 tv    music:plan   from=game:broken-pencil to=null
 181300 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
```
