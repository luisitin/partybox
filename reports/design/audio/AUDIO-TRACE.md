# Audio interaction trace

Captured 2026-09-19T02:36:47.220Z on port 42112. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**70 / 70 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.3}]

```
   1798 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1831 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3153 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3289 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3979 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4607 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5440 tv    ss:cancel    speaking=false pending=false
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
   6288 tv    music:plan   from=lobby to=null
   6288 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7789 tv    music:stop   track=airport-lounge.mp3
   8243 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   8243 tv    bed:duck     bed=pulse cue=phase
   9522 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16494 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17494 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18494 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19495 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20494 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21294 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  21294 tv    bed:duck     bed=pulse cue=reveal
  22094 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22094 tv    bed:duck     bed=pulse cue=phase
  22256 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22256 tv    bed:duck     bed=pulse cue=reveal
  22412 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22412 tv    bed:duck     bed=pulse cue=phase
  22567 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22567 tv    bed:duck     bed=pulse cue=reveal
  22724 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22724 tv    bed:duck     bed=pulse cue=phase
  22882 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22882 tv    bed:duck     bed=pulse cue=reveal
  23037 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23037 tv    bed:duck     bed=pulse cue=phase
  23195 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23195 tv    bed:duck     bed=pulse cue=reveal
  23353 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23353 tv    bed:duck     bed=pulse cue=phase
  23493 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23493 tv    bed:duck     bed=pulse cue=reveal
  23650 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23650 tv    bed:duck     bed=pulse cue=phase
  23808 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23808 tv    bed:duck     bed=pulse cue=reveal
  23961 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23961 tv    bed:duck     bed=pulse cue=phase
  24118 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24118 tv    bed:duck     bed=pulse cue=reveal
  24276 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24276 tv    bed:duck     bed=pulse cue=phase
  24436 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24436 tv    bed:duck     bed=pulse cue=reveal
  24589 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24589 tv    bed:duck     bed=pulse cue=phase
  24748 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24748 tv    bed:duck     bed=pulse cue=reveal
  24903 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  24903 tv    bed:duck     bed=latenight cue=wager
  25777 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  25777 tv    bed:duck     bed=pulse cue=phase
  26109 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  26109 tv    bed:duck     bed=pulse cue=silence
  27911 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  27911 tv    bed:duck     bed=pulse cue=bust
  29646 tv    ss:cancel    speaking=false pending=false
  29647 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":1.4}]

```
  31200 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33350 tv    ss:cancel    speaking=false pending=false
  33350 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34885 tv    ss:cancel    speaking=false pending=false
  34885 tv    music:plan   from=null to=lobby
  34885 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:george-street-shuffle.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime** — cues=start,card,lock,lock,tick,tick,tick,call
- ✅ **the hand feels each card land (one 12 ms tap per card) and then the first call** — taps(12)=2 (1 card + the first call)
- ✅ **each Ready ticks (lock, rising); the 3 · 2 · 1's first tick comes a breath (≥ 300 ms) after the last** — locks=2 last lock→first tick=416ms
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+1001ms phone@+1001ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "another" is a 20 ms tap and one card pluck; Ready a 20 ms tap and the submit cue** — taps=3 cues=card,submit
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **each voice starts on the push (no delay); its boing lands on the squash, 170–230 ms later** — delays=0,0 boing lags=198,193ms
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":19}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":25.9}]
- ✅ **skipping through the deck: a hush before every call, one voice at a time** — clips=41 hushes=41
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5356ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":40.3}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the winner's celebration buzz (320 ms) runs whole — nothing shorter cuts it** — celebration@74428 cut by=[]
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5397ms cheer@+5368ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36438 tv    music:plan   from=lobby to=game:bingo
  36438 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36438 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36743 tv    hush
  36743 tv    hush
  37242 tv    music:stop   track=george-street-shuffle.mp3
  37400 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  39516 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  40028 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
  40444 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41444 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  42444 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  43431 tv    hush
  43431 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  43431 tv    speak        text=b9.wav voice=clip delayMs=0
  43432 tv    hush
  43626 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43994 tv    hush
  43994 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  43994 tv    speak        text=b8.wav voice=clip delayMs=0
  44192 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45824 tv    hush
  45824 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  45824 tv    speak        text=n34.wav voice=clip delayMs=0
  46017 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  47701 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47962 tv    hush
  47962 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47963 tv    hush
  53322 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  56329 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57338 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58343 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  59343 tv    hush
  59343 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  59343 tv    speak        text=n35.wav voice=clip delayMs=0
  59542 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61138 tv    music:paused paused=true
  61138 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  62400 tv    music:paused paused=false
  62400 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  63700 tv    hush
  63700 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  63700 tv    speak        text=i25.wav voice=clip delayMs=0
  63828 tv    hush
  63828 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  63828 tv    speak        text=n45.wav voice=clip delayMs=0
  63938 tv    hush
  63938 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  63938 tv    speak        text=n33.wav voice=clip delayMs=0
  64067 tv    hush
  64067 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  64067 tv    speak        text=g49.wav voice=clip delayMs=0
  64187 tv    hush
  64187 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  64187 tv    speak        text=b4.wav voice=clip delayMs=0
  64315 tv    hush
  64315 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  64315 tv    speak        text=i20.wav voice=clip delayMs=0
  64435 tv    hush
  64435 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  64435 tv    speak        text=o69.wav voice=clip delayMs=0
  64561 tv    hush
  64561 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  64561 tv    speak        text=o67.wav voice=clip delayMs=0
  64685 tv    hush
  64685 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  64685 tv    speak        text=o65.wav voice=clip delayMs=0
  64812 tv    hush
  64812 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  64812 tv    speak        text=o73.wav voice=clip delayMs=0
  64936 tv    hush
  64936 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  64936 tv    speak        text=i21.wav voice=clip delayMs=0
  65061 tv    hush
  65061 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  65061 tv    speak        text=i18.wav voice=clip delayMs=0
  65182 tv    hush
  65182 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  65182 tv    speak        text=g58.wav voice=clip delayMs=0
  65295 tv    hush
  65295 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  65295 tv    speak        text=n36.wav voice=clip delayMs=0
  65415 tv    hush
  65415 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  65415 tv    speak        text=o61.wav voice=clip delayMs=0
  65539 tv    hush
  65539 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  65539 tv    speak        text=n37.wav voice=clip delayMs=0
  65666 tv    hush
  65666 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  65666 tv    speak        text=i16.wav voice=clip delayMs=0
  65791 tv    hush
  65791 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  65791 tv    speak        text=g47.wav voice=clip delayMs=0
  65920 tv    hush
  65920 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  65920 tv    speak        text=n41.wav voice=clip delayMs=0
  66037 tv    hush
  66037 tv    clip         src=b6.wav muted=false ready=true delayMs=0
  66037 tv    speak        text=b6.wav voice=clip delayMs=0
  66153 tv    hush
  66153 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  66153 tv    speak        text=o72.wav voice=clip delayMs=0
  66274 tv    hush
  66274 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  66274 tv    speak        text=b3.wav voice=clip delayMs=0
  66400 tv    hush
  66400 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  66400 tv    speak        text=i30.wav voice=clip delayMs=0
  66521 tv    hush
  66521 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  66521 tv    speak        text=g56.wav voice=clip delayMs=0
  66647 tv    hush
  66647 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  66647 tv    speak        text=o75.wav voice=clip delayMs=0
  66778 tv    hush
  66778 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  66778 tv    speak        text=b1.wav voice=clip delayMs=0
  66902 tv    hush
  66902 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  66902 tv    speak        text=b2.wav voice=clip delayMs=0
  67030 tv    hush
  67031 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  67031 tv    speak        text=n32.wav voice=clip delayMs=0
  67153 tv    hush
  67153 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  67153 tv    speak        text=g48.wav voice=clip delayMs=0
  67274 tv    hush
  67274 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  67274 tv    speak        text=i23.wav voice=clip delayMs=0
  67398 tv    hush
  67398 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  67398 tv    speak        text=i26.wav voice=clip delayMs=0
  67521 tv    hush
  67521 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  67521 tv    speak        text=o66.wav voice=clip delayMs=0
  67647 tv    hush
  67647 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  67647 tv    speak        text=i19.wav voice=clip delayMs=0
  67772 tv    hush
  67772 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  67772 tv    speak        text=n42.wav voice=clip delayMs=0
  67902 tv    hush
  67902 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  67902 tv    speak        text=i24.wav voice=clip delayMs=0
  68032 tv    hush
  68032 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  68032 tv    speak        text=n39.wav voice=clip delayMs=0
  68152 tv    hush
  68152 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  68152 tv    speak        text=g46.wav voice=clip delayMs=0
  68280 tv    hush
  68280 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  68280 tv    speak        text=n44.wav voice=clip delayMs=0
  68400 tv    hush
  68400 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  68400 tv    speak        text=b15.wav voice=clip delayMs=0
  68522 tv    hush
  68522 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  68522 tv    speak        text=b11.wav voice=clip delayMs=0
  68649 tv    hush
  68649 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  68649 tv    speak        text=g57.wav voice=clip delayMs=0
  68839 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  69267 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  69543 tv    hush
  69543 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  69543 tv    hush
  71415 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  74899 tv    music:duck   ms=9000
  74899 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  79689 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  80003 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81004 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82007 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  83016 tv    hush
  83016 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  83016 tv    speak        text=g57.wav voice=clip delayMs=0
  83208 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  85328 tv    ss:cancel    speaking=false pending=false
  85328 tv    music:plan   from=game:bingo to=null
  85330 tv    ss:cancel    speaking=false pending=false
  85330 tv    music:plan   from=null to=lobby
  85330 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  86132 tv    music:stop   track=cool-vibes.mp3
  87842 tv    ss:cancel    speaking=false pending=false
  87851 tv    music:plan   from=lobby to=game:bingo
  87851 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  87851 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  87854 tv    hush
  87854 tv    hush
  88468 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  88470 tv    hush
  88470 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  88470 tv    speak        text=i21.wav voice=clip delayMs=0
  88471 tv    hush
  88484 tv    hush
  88484 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  88484 tv    speak        text=n32.wav voice=clip delayMs=0
  88579 tv    hush
  88580 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  88580 tv    speak        text=i18.wav voice=clip delayMs=0
  88651 tv    music:stop   track=airport-lounge.mp3
  88673 tv    hush
  88673 tv    clip         src=n40.wav muted=false ready=true delayMs=0
  88673 tv    speak        text=n40.wav voice=clip delayMs=0
  88751 tv    hush
  88751 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  88751 tv    speak        text=i30.wav voice=clip delayMs=0
  88846 tv    hush
  88846 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  88846 tv    speak        text=o69.wav voice=clip delayMs=0
  88945 tv    hush
  88945 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  88945 tv    speak        text=o61.wav voice=clip delayMs=0
  89037 tv    hush
  89037 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  89037 tv    speak        text=n34.wav voice=clip delayMs=0
  89130 tv    hush
  89130 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  89130 tv    speak        text=n35.wav voice=clip delayMs=0
  89223 tv    hush
  89223 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  89223 tv    speak        text=o67.wav voice=clip delayMs=0
  89337 tv    hush
  89337 tv    clip         src=g55.wav muted=false ready=true delayMs=0
  89337 tv    speak        text=g55.wav voice=clip delayMs=0
  89428 tv    hush
  89428 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  89428 tv    speak        text=i26.wav voice=clip delayMs=0
  89523 tv    hush
  89523 tv    clip         src=i22.wav muted=false ready=true delayMs=0
  89523 tv    speak        text=i22.wav voice=clip delayMs=0
  89617 tv    hush
  89617 tv    clip         src=i29.wav muted=false ready=true delayMs=0
  89617 tv    speak        text=i29.wav voice=clip delayMs=0
  89710 tv    hush
  89710 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  89710 tv    speak        text=o66.wav voice=clip delayMs=0
  89805 tv    hush
  89805 tv    clip         src=g51.wav muted=false ready=true delayMs=0
  89805 tv    speak        text=g51.wav voice=clip delayMs=0
  89915 tv    hush
  89915 tv    clip         src=g53.wav muted=false ready=true delayMs=0
  89915 tv    speak        text=g53.wav voice=clip delayMs=0
  90006 tv    hush
  90006 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  90006 tv    speak        text=b9.wav voice=clip delayMs=0
  90101 tv    hush
  90101 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  90101 tv    speak        text=n36.wav voice=clip delayMs=0
  90208 tv    hush
  90208 tv    clip         src=g52.wav muted=false ready=true delayMs=0
  90208 tv    speak        text=g52.wav voice=clip delayMs=0
  90318 tv    hush
  90318 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  90318 tv    speak        text=b1.wav voice=clip delayMs=0
  90425 tv    hush
  90425 tv    clip         src=b13.wav muted=false ready=true delayMs=0
  90425 tv    speak        text=b13.wav voice=clip delayMs=0
  90524 tv    hush
  90524 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  90524 tv    speak        text=n37.wav voice=clip delayMs=0
  90615 tv    hush
  90615 tv    clip         src=o71.wav muted=false ready=true delayMs=0
  90615 tv    speak        text=o71.wav voice=clip delayMs=0
  90706 tv    hush
  90706 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  90706 tv    speak        text=b8.wav voice=clip delayMs=0
  90799 tv    hush
  90799 tv    clip         src=b5.wav muted=false ready=true delayMs=0
  90799 tv    speak        text=b5.wav voice=clip delayMs=0
  90896 tv    hush
  90896 tv    clip         src=b7.wav muted=false ready=true delayMs=0
  90896 tv    speak        text=b7.wav voice=clip delayMs=0
  90989 tv    hush
  90989 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  90989 tv    speak        text=n42.wav voice=clip delayMs=0
  91085 tv    hush
  91085 tv    clip         src=i28.wav muted=false ready=true delayMs=0
  91085 tv    speak        text=i28.wav voice=clip delayMs=0
  91194 tv    hush
  91194 tv    clip         src=i27.wav muted=false ready=true delayMs=0
  91194 tv    speak        text=i27.wav voice=clip delayMs=0
  91284 tv    hush
  91284 tv    clip         src=o63.wav muted=false ready=true delayMs=0
  91284 tv    speak        text=o63.wav voice=clip delayMs=0
  91377 tv    hush
  91377 tv    clip         src=o64.wav muted=false ready=true delayMs=0
  91377 tv    speak        text=o64.wav voice=clip delayMs=0
  91455 tv    hush
  91455 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  91455 tv    speak        text=o73.wav voice=clip delayMs=0
  91549 tv    hush
  91549 tv    clip         src=g50.wav muted=false ready=true delayMs=0
  91549 tv    speak        text=g50.wav voice=clip delayMs=0
  91628 tv    hush
  91628 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  91628 tv    speak        text=g48.wav voice=clip delayMs=0
  91731 tv    hush
  91731 tv    clip         src=b12.wav muted=false ready=true delayMs=0
  91731 tv    speak        text=b12.wav voice=clip delayMs=0
  91832 tv    hush
  91832 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  91832 tv    speak        text=n45.wav voice=clip delayMs=0
  91925 tv    hush
  91925 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  91925 tv    speak        text=b4.wav voice=clip delayMs=0
  92021 tv    hush
  92021 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  92021 tv    speak        text=g46.wav voice=clip delayMs=0
  92114 tv    hush
  92114 tv    clip         src=o74.wav muted=false ready=true delayMs=0
  92114 tv    speak        text=o74.wav voice=clip delayMs=0
  92217 tv    hush
  92217 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  92217 tv    speak        text=g47.wav voice=clip delayMs=0
  92312 tv    hush
  92312 tv    clip         src=n31.wav muted=false ready=true delayMs=0
  92312 tv    speak        text=n31.wav voice=clip delayMs=0
  92400 tv    hush
  92400 tv    clip         src=o62.wav muted=false ready=true delayMs=0
  92400 tv    speak        text=o62.wav voice=clip delayMs=0
  92492 tv    hush
  92492 tv    clip         src=b10.wav muted=false ready=true delayMs=0
  92492 tv    speak        text=b10.wav voice=clip delayMs=0
  92586 tv    hush
  92586 tv    clip         src=g60.wav muted=false ready=true delayMs=0
  92586 tv    speak        text=g60.wav voice=clip delayMs=0
  92679 tv    hush
  92679 tv    clip         src=n38.wav muted=false ready=true delayMs=0
  92679 tv    speak        text=n38.wav voice=clip delayMs=0
  92792 tv    hush
  92792 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  92792 tv    speak        text=n39.wav voice=clip delayMs=0
  92882 tv    hush
  92882 tv    clip         src=o70.wav muted=false ready=true delayMs=0
  92882 tv    speak        text=o70.wav voice=clip delayMs=0
  92963 tv    hush
  92963 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  92963 tv    speak        text=b11.wav voice=clip delayMs=0
  93068 tv    hush
  93068 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  93068 tv    speak        text=o75.wav voice=clip delayMs=0
  93162 tv    hush
  93162 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  93162 tv    speak        text=g58.wav voice=clip delayMs=0
  93256 tv    hush
  93256 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  93256 tv    speak        text=b15.wav voice=clip delayMs=0
  93355 tv    hush
  93355 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  93355 tv    speak        text=i24.wav voice=clip delayMs=0
  93452 tv    hush
  93452 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  93452 tv    speak        text=o72.wav voice=clip delayMs=0
  93544 tv    hush
  93544 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  93544 tv    speak        text=g56.wav voice=clip delayMs=0
  93635 tv    hush
  93635 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  93635 tv    speak        text=i20.wav voice=clip delayMs=0
  93728 tv    hush
  93728 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  93728 tv    speak        text=n44.wav voice=clip delayMs=0
  93824 tv    hush
  93824 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  93824 tv    speak        text=b3.wav voice=clip delayMs=0
  93915 tv    hush
  93915 tv    clip         src=o68.wav muted=false ready=true delayMs=0
  93915 tv    speak        text=o68.wav voice=clip delayMs=0
  94027 tv    hush
  94027 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  94027 tv    speak        text=b2.wav voice=clip delayMs=0
  94114 tv    hush
  94114 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  94114 tv    speak        text=n41.wav voice=clip delayMs=0
  94207 tv    hush
  94207 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  94207 tv    speak        text=o65.wav voice=clip delayMs=0
  94307 tv    hush
  94307 tv    clip         src=i17.wav muted=false ready=true delayMs=0
  94307 tv    speak        text=i17.wav voice=clip delayMs=0
  94394 tv    hush
  94394 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  94394 tv    speak        text=i25.wav voice=clip delayMs=0
  94487 tv    hush
  94487 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  94487 tv    speak        text=i19.wav voice=clip delayMs=0
  94583 tv    hush
  94583 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  94583 tv    speak        text=g57.wav voice=clip delayMs=0
  94678 tv    hush
  94678 tv    clip         src=g59.wav muted=false ready=true delayMs=0
  94678 tv    speak        text=g59.wav voice=clip delayMs=0
  94770 tv    hush
  94770 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  94770 tv    speak        text=g49.wav voice=clip delayMs=0
  94866 tv    hush
  94866 tv    clip         src=n43.wav muted=false ready=true delayMs=0
  94866 tv    speak        text=n43.wav voice=clip delayMs=0
  94964 tv    hush
  94964 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  94964 tv    speak        text=i16.wav voice=clip delayMs=0
  95060 tv    hush
  95060 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  95060 tv    speak        text=n33.wav voice=clip delayMs=0
  95149 tv    hush
  95149 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  95149 tv    speak        text=i23.wav voice=clip delayMs=0
  95247 tv    hush
  95247 tv    clip         src=g54.wav muted=false ready=true delayMs=0
  95247 tv    speak        text=g54.wav voice=clip delayMs=0
  95340 tv    hush
  95340 tv    clip         src=b14.wav muted=false ready=true delayMs=0
  95340 tv    speak        text=b14.wav voice=clip delayMs=0
  95531 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  96572 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  96842 tv    hush
  96842 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  96842 tv    hush
 104446 tv    music:duck   ms=9000
 104446 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 109456 tv    hush
 109456 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 109456 tv    hush
 113462 tv    ss:cancel    speaking=false pending=false
 113462 tv    music:plan   from=game:bingo to=null
 113462 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 114963 tv    music:stop   track=cool-vibes.mp3
 115094 tv    ss:cancel    speaking=false pending=false
 115094 tv    music:plan   from=null to=lobby
 115094 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 117615 tv    ss:cancel    speaking=false pending=false
 117625 tv    music:plan   from=lobby to=game:bingo
 117625 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 117625 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 117629 tv    hush
 117629 tv    hush
 118238 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 118241 tv    hush
 118241 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 118241 tv    speak        text=i21.wav voice=clip delayMs=0
 118241 tv    hush
 118247 tv    hush
 118247 tv    clip         src=n32.wav muted=false ready=true delayMs=0
 118247 tv    speak        text=n32.wav voice=clip delayMs=0
 118350 tv    hush
 118350 tv    clip         src=i18.wav muted=false ready=true delayMs=0
 118350 tv    speak        text=i18.wav voice=clip delayMs=0
 118425 tv    music:stop   track=local-forecast-elevator.mp3
 118431 tv    hush
 118431 tv    clip         src=n40.wav muted=false ready=true delayMs=0
 118431 tv    speak        text=n40.wav voice=clip delayMs=0
 118534 tv    hush
 118534 tv    clip         src=i30.wav muted=false ready=true delayMs=0
 118534 tv    speak        text=i30.wav voice=clip delayMs=0
 118628 tv    hush
 118628 tv    clip         src=o69.wav muted=false ready=true delayMs=0
 118628 tv    speak        text=o69.wav voice=clip delayMs=0
 118702 tv    hush
 118702 tv    clip         src=o61.wav muted=false ready=true delayMs=0
 118702 tv    speak        text=o61.wav voice=clip delayMs=0
 118785 tv    hush
 118785 tv    clip         src=n34.wav muted=false ready=true delayMs=0
 118785 tv    speak        text=n34.wav voice=clip delayMs=0
 118878 tv    hush
 118878 tv    clip         src=n35.wav muted=false ready=true delayMs=0
 118878 tv    speak        text=n35.wav voice=clip delayMs=0
 118961 tv    hush
 118961 tv    clip         src=o67.wav muted=false ready=true delayMs=0
 118961 tv    speak        text=o67.wav voice=clip delayMs=0
 119052 tv    hush
 119052 tv    clip         src=g55.wav muted=false ready=true delayMs=0
 119052 tv    speak        text=g55.wav voice=clip delayMs=0
 119145 tv    hush
 119145 tv    clip         src=i26.wav muted=false ready=true delayMs=0
 119145 tv    speak        text=i26.wav voice=clip delayMs=0
 119248 tv    hush
 119248 tv    clip         src=i22.wav muted=false ready=true delayMs=0
 119248 tv    speak        text=i22.wav voice=clip delayMs=0
 119336 tv    hush
 119336 tv    clip         src=i29.wav muted=false ready=true delayMs=0
 119336 tv    speak        text=i29.wav voice=clip delayMs=0
 119428 tv    hush
 119428 tv    clip         src=o66.wav muted=false ready=true delayMs=0
 119428 tv    speak        text=o66.wav voice=clip delayMs=0
 119521 tv    hush
 119521 tv    clip         src=g51.wav muted=false ready=true delayMs=0
 119521 tv    speak        text=g51.wav voice=clip delayMs=0
 119616 tv    hush
 119616 tv    clip         src=g53.wav muted=false ready=true delayMs=0
 119616 tv    speak        text=g53.wav voice=clip delayMs=0
 119709 tv    hush
 119709 tv    clip         src=b9.wav muted=false ready=true delayMs=0
 119709 tv    speak        text=b9.wav voice=clip delayMs=0
 119803 tv    hush
 119803 tv    clip         src=n36.wav muted=false ready=true delayMs=0
 119803 tv    speak        text=n36.wav voice=clip delayMs=0
 119912 tv    hush
 119912 tv    clip         src=g52.wav muted=false ready=true delayMs=0
 119912 tv    speak        text=g52.wav voice=clip delayMs=0
 120011 tv    hush
 120011 tv    clip         src=b1.wav muted=false ready=true delayMs=0
 120011 tv    speak        text=b1.wav voice=clip delayMs=0
 120104 tv    hush
 120104 tv    clip         src=b13.wav muted=false ready=true delayMs=0
 120104 tv    speak        text=b13.wav voice=clip delayMs=0
 120197 tv    hush
 120197 tv    clip         src=n37.wav muted=false ready=true delayMs=0
 120197 tv    speak        text=n37.wav voice=clip delayMs=0
 120288 tv    hush
 120288 tv    clip         src=o71.wav muted=false ready=true delayMs=0
 120288 tv    speak        text=o71.wav voice=clip delayMs=0
 120383 tv    hush
 120383 tv    clip         src=b8.wav muted=false ready=true delayMs=0
 120383 tv    speak        text=b8.wav voice=clip delayMs=0
 120457 tv    hush
 120457 tv    clip         src=b5.wav muted=false ready=true delayMs=0
 120457 tv    speak        text=b5.wav voice=clip delayMs=0
 120556 tv    hush
 120556 tv    clip         src=b7.wav muted=false ready=true delayMs=0
 120556 tv    speak        text=b7.wav voice=clip delayMs=0
 120634 tv    hush
 120634 tv    clip         src=n42.wav muted=false ready=true delayMs=0
 120634 tv    speak        text=n42.wav voice=clip delayMs=0
 120727 tv    hush
 120727 tv    clip         src=i28.wav muted=false ready=true delayMs=0
 120727 tv    speak        text=i28.wav voice=clip delayMs=0
 120806 tv    hush
 120806 tv    clip         src=i27.wav muted=false ready=true delayMs=0
 120806 tv    speak        text=i27.wav voice=clip delayMs=0
 120885 tv    hush
 120885 tv    clip         src=o63.wav muted=false ready=true delayMs=0
 120885 tv    speak        text=o63.wav voice=clip delayMs=0
 120996 tv    hush
 120996 tv    clip         src=o64.wav muted=false ready=true delayMs=0
 120996 tv    speak        text=o64.wav voice=clip delayMs=0
 121087 tv    hush
 121087 tv    clip         src=o73.wav muted=false ready=true delayMs=0
 121087 tv    speak        text=o73.wav voice=clip delayMs=0
 121179 tv    hush
 121179 tv    clip         src=g50.wav muted=false ready=true delayMs=0
 121179 tv    speak        text=g50.wav voice=clip delayMs=0
 121275 tv    hush
 121275 tv    clip         src=g48.wav muted=false ready=true delayMs=0
 121275 tv    speak        text=g48.wav voice=clip delayMs=0
 121371 tv    hush
 121371 tv    clip         src=b12.wav muted=false ready=true delayMs=0
 121371 tv    speak        text=b12.wav voice=clip delayMs=0
 121464 tv    hush
 121464 tv    clip         src=n45.wav muted=false ready=true delayMs=0
 121464 tv    speak        text=n45.wav voice=clip delayMs=0
 121561 tv    hush
 121561 tv    clip         src=b4.wav muted=false ready=true delayMs=0
 121561 tv    speak        text=b4.wav voice=clip delayMs=0
 121637 tv    hush
 121637 tv    clip         src=g46.wav muted=false ready=true delayMs=0
 121637 tv    speak        text=g46.wav voice=clip delayMs=0
 121729 tv    hush
 121729 tv    clip         src=o74.wav muted=false ready=true delayMs=0
 121729 tv    speak        text=o74.wav voice=clip delayMs=0
 121824 tv    hush
 121824 tv    clip         src=g47.wav muted=false ready=true delayMs=0
 121824 tv    speak        text=g47.wav voice=clip delayMs=0
 121904 tv    hush
 121904 tv    clip         src=n31.wav muted=false ready=true delayMs=0
 121904 tv    speak        text=n31.wav voice=clip delayMs=0
 121997 tv    hush
 121997 tv    clip         src=o62.wav muted=false ready=true delayMs=0
 121997 tv    speak        text=o62.wav voice=clip delayMs=0
 122094 tv    hush
 122094 tv    clip         src=b10.wav muted=false ready=true delayMs=0
 122094 tv    speak        text=b10.wav voice=clip delayMs=0
 122185 tv    hush
 122185 tv    clip         src=g60.wav muted=false ready=true delayMs=0
 122185 tv    speak        text=g60.wav voice=clip delayMs=0
 122279 tv    hush
 122279 tv    clip         src=n38.wav muted=false ready=true delayMs=0
 122279 tv    speak        text=n38.wav voice=clip delayMs=0
 122374 tv    hush
 122374 tv    clip         src=n39.wav muted=false ready=true delayMs=0
 122374 tv    speak        text=n39.wav voice=clip delayMs=0
 122467 tv    hush
 122467 tv    clip         src=o70.wav muted=false ready=true delayMs=0
 122467 tv    speak        text=o70.wav voice=clip delayMs=0
 122567 tv    hush
 122567 tv    clip         src=b11.wav muted=false ready=true delayMs=0
 122567 tv    speak        text=b11.wav voice=clip delayMs=0
 122655 tv    hush
 122655 tv    clip         src=o75.wav muted=false ready=true delayMs=0
 122655 tv    speak        text=o75.wav voice=clip delayMs=0
 122748 tv    hush
 122748 tv    clip         src=g58.wav muted=false ready=true delayMs=0
 122748 tv    speak        text=g58.wav voice=clip delayMs=0
 122848 tv    hush
 122848 tv    clip         src=b15.wav muted=false ready=true delayMs=0
 122848 tv    speak        text=b15.wav voice=clip delayMs=0
 122939 tv    hush
 122939 tv    clip         src=i24.wav muted=false ready=true delayMs=0
 122939 tv    speak        text=i24.wav voice=clip delayMs=0
 123019 tv    hush
 123019 tv    clip         src=o72.wav muted=false ready=true delayMs=0
 123019 tv    speak        text=o72.wav voice=clip delayMs=0
 123115 tv    hush
 123115 tv    clip         src=g56.wav muted=false ready=true delayMs=0
 123115 tv    speak        text=g56.wav voice=clip delayMs=0
 123222 tv    hush
 123222 tv    clip         src=i20.wav muted=false ready=true delayMs=0
 123222 tv    speak        text=i20.wav voice=clip delayMs=0
 123321 tv    hush
 123321 tv    clip         src=n44.wav muted=false ready=true delayMs=0
 123321 tv    speak        text=n44.wav voice=clip delayMs=0
 123409 tv    hush
 123409 tv    clip         src=b3.wav muted=false ready=true delayMs=0
 123409 tv    speak        text=b3.wav voice=clip delayMs=0
 123503 tv    hush
 123503 tv    clip         src=o68.wav muted=false ready=true delayMs=0
 123503 tv    speak        text=o68.wav voice=clip delayMs=0
 123601 tv    hush
 123601 tv    clip         src=b2.wav muted=false ready=true delayMs=0
 123601 tv    speak        text=b2.wav voice=clip delayMs=0
 123695 tv    hush
 123695 tv    clip         src=n41.wav muted=false ready=true delayMs=0
 123695 tv    speak        text=n41.wav voice=clip delayMs=0
 123803 tv    hush
 123803 tv    clip         src=o65.wav muted=false ready=true delayMs=0
 123803 tv    speak        text=o65.wav voice=clip delayMs=0
 123881 tv    hush
 123881 tv    clip         src=i17.wav muted=false ready=true delayMs=0
 123881 tv    speak        text=i17.wav voice=clip delayMs=0
 123976 tv    hush
 123976 tv    clip         src=i25.wav muted=false ready=true delayMs=0
 123976 tv    speak        text=i25.wav voice=clip delayMs=0
 124069 tv    hush
 124069 tv    clip         src=i19.wav muted=false ready=true delayMs=0
 124069 tv    speak        text=i19.wav voice=clip delayMs=0
 124168 tv    hush
 124168 tv    clip         src=g57.wav muted=false ready=true delayMs=0
 124168 tv    speak        text=g57.wav voice=clip delayMs=0
 124256 tv    hush
 124256 tv    clip         src=g59.wav muted=false ready=true delayMs=0
 124256 tv    speak        text=g59.wav voice=clip delayMs=0
 124350 tv    hush
 124350 tv    clip         src=g49.wav muted=false ready=true delayMs=0
 124350 tv    speak        text=g49.wav voice=clip delayMs=0
 124445 tv    hush
 124445 tv    clip         src=n43.wav muted=false ready=true delayMs=0
 124445 tv    speak        text=n43.wav voice=clip delayMs=0
 124539 tv    hush
 124539 tv    clip         src=i16.wav muted=false ready=true delayMs=0
 124539 tv    speak        text=i16.wav voice=clip delayMs=0
 124634 tv    hush
 124634 tv    clip         src=n33.wav muted=false ready=true delayMs=0
 124634 tv    speak        text=n33.wav voice=clip delayMs=0
 124740 tv    hush
 124740 tv    clip         src=i23.wav muted=false ready=true delayMs=0
 124740 tv    speak        text=i23.wav voice=clip delayMs=0
 124834 tv    hush
 124834 tv    clip         src=g54.wav muted=false ready=true delayMs=0
 124834 tv    speak        text=g54.wav voice=clip delayMs=0
 124928 tv    hush
 124928 tv    clip         src=b14.wav muted=false ready=true delayMs=0
 124928 tv    speak        text=b14.wav voice=clip delayMs=0
 125118 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 126148 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 126419 tv    hush
 126419 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 126419 tv    hush
 134028 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 134033 tv    music:duck   ms=9000
 134033 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 139041 tv    hush
 139042 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 139042 tv    hush
 140594 tv    ss:cancel    speaking=false pending=false
 140594 tv    music:plan   from=game:bingo to=null
 140596 tv    ss:cancel    speaking=false pending=false
 140596 tv    music:plan   from=null to=lobby
 140596 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 141397 tv    music:stop   track=wallpaper.mp3
 143110 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 143120 tv    ss:cancel    speaking=false pending=false
 143122 tv    music:plan   from=lobby to=game:bingo
 143122 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 143122 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 143125 tv    hush
 143125 tv    hush
 143776 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 143922 tv    music:stop   track=bossa-antigua.mp3
 144365 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
 145244 tv    ss:cancel    speaking=false pending=false
 145244 tv    music:plan   from=game:bingo to=null
 145244 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 146746 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 147375 tv    ss:cancel    speaking=false pending=false
 147375 tv    music:plan   from=null to=lobby
 147375 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 150724 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 150733 tv    ss:cancel    speaking=false pending=false
 150735 tv    music:plan   from=lobby to=game:bingo
 150735 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 150735 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 150738 tv    hush
 150739 tv    hush
 151162 tv    cue          cue=lock surface=tv muted=false ready=true semitones=8
 151165 tv    hush
 151165 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 151165 tv    speak        text=i21.wav voice=clip delayMs=0
 151166 tv    hush
 151357 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 151536 tv    music:stop   track=local-forecast-elevator.mp3
 151659 tv    ss:cancel    speaking=false pending=false
 151659 tv    music:plan   from=game:bingo to=null
 151663 tv    ss:cancel    speaking=false pending=false
 151663 tv    music:plan   from=null to=lobby
 151663 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 152463 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, the lobby track only fading out, the warm bed under the intro** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.07,"t":10.1}] bed=warm
- ✅ **the writing track eases in (under 0.2 a third of a second in), never a hard start** — playing=[{"track":"local-forecast-elevator.mp3","vol":0.04,"t":10.5},{"track":"carefree.mp3","vol":0.08,"t":0.3}]
- ✅ **answer → one Wisecrack track at 0.2 while everyone writes, the bed gone** — playing=[{"track":"carefree.mp3","vol":0.2,"t":2.4}] bed=null
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **vote → the marimba bed (the first prompt), the track fading out** — bed=marimba playing=[]
- ✅ **reveal keeps the vote’s bed (same list, same turn: no crossfade on the cut)** — bed=marimba playing=[]
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal
- ✅ **scores phase → tally ping (mapped), the lounge bed** — cues=phase,reveal,phase,reveal,tally bed=lounge

```
 157262 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157695 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158128 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158545 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158981 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 160027 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 160623 tv    ss:cancel    speaking=false pending=false
 160629 tv    music:plan   from=lobby to=null
 160629 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 161876 tv    music:plan   from=null to=game:wisecrack
 161876 tv    music:start  plan=game:wisecrack track=carefree mode=chain volume=0.2
 161876 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 162683 tv    music:stop   track=local-forecast-elevator.mp3
 165381 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 166681 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 167984 tv    music:plan   from=game:wisecrack to=null
 167984 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 167984 tv    bed:duck     bed=marimba cue=phase
 169034 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 169034 tv    bed:duck     bed=marimba cue=reveal
 169488 tv    music:stop   track=carefree.mp3
 172634 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 172634 tv    bed:duck     bed=lofi cue=phase
 172821 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 172821 tv    bed:duck     bed=lofi cue=reveal
 173013 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 173013 tv    bed:duck     bed=marimba cue=phase
 173213 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 173213 tv    bed:duck     bed=marimba cue=reveal
 173404 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 173404 tv    bed:duck     bed=lounge cue=tally
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 174507 tv    ss:cancel    speaking=false pending=false
 174509 tv    ss:cancel    speaking=false pending=false
 174509 tv    music:plan   from=null to=lobby
 174509 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 176526 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 176532 tv    ss:cancel    speaking=false pending=false
 176533 tv    music:plan   from=lobby to=null
 176533 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 178037 tv    music:stop   track=george-street-shuffle.mp3
 178108 tv    music:plan   from=null to=game:broken-pencil
 178108 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 178108 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 179590 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 180060 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 180219 tv    music:plan   from=game:broken-pencil to=null
 180219 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 181720 tv    music:stop   track=hep-cats.mp3
```
