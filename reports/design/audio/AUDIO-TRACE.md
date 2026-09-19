# Audio interaction trace

Captured 2026-09-19T10:56:22.383Z on port 42112. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**73 / 73 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:george-street-shuffle
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":4.4}]

```
   1752 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   1785 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3109 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3246 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3946 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4580 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5432 tv    ss:cancel    speaking=false pending=false
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
   6286 tv    music:plan   from=lobby to=null
   6286 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7792 tv    music:stop   track=george-street-shuffle.mp3
   8246 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   8246 tv    bed:duck     bed=pulse cue=phase
   9537 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16506 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17497 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18506 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19510 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20502 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21282 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  21282 tv    bed:duck     bed=pulse cue=reveal
  22087 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22087 tv    bed:duck     bed=pulse cue=phase
  22244 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22244 tv    bed:duck     bed=pulse cue=reveal
  22400 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22400 tv    bed:duck     bed=pulse cue=phase
  22558 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22558 tv    bed:duck     bed=pulse cue=reveal
  22714 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22714 tv    bed:duck     bed=pulse cue=phase
  22872 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22872 tv    bed:duck     bed=pulse cue=reveal
  23028 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23028 tv    bed:duck     bed=pulse cue=phase
  23184 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23184 tv    bed:duck     bed=pulse cue=reveal
  23341 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23341 tv    bed:duck     bed=pulse cue=phase
  23494 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23494 tv    bed:duck     bed=pulse cue=reveal
  23651 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23651 tv    bed:duck     bed=pulse cue=phase
  23811 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23811 tv    bed:duck     bed=pulse cue=reveal
  23966 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23966 tv    bed:duck     bed=pulse cue=phase
  24123 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24123 tv    bed:duck     bed=pulse cue=reveal
  24282 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24282 tv    bed:duck     bed=pulse cue=phase
  24439 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24439 tv    bed:duck     bed=pulse cue=reveal
  24597 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24597 tv    bed:duck     bed=pulse cue=phase
  24754 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24754 tv    bed:duck     bed=pulse cue=reveal
  24912 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  24912 tv    bed:duck     bed=latenight cue=wager
  25788 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  25788 tv    bed:duck     bed=pulse cue=phase
  26120 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  26120 tv    bed:duck     bed=pulse cue=silence
  27930 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  27930 tv    bed:duck     bed=pulse cue=bust
  29658 tv    ss:cancel    speaking=false pending=false
  29658 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31222 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33408 tv    ss:cancel    speaking=false pending=false
  33408 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34959 tv    ss:cancel    speaking=false pending=false
  34959 tv    music:plan   from=null to=lobby
  34959 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime** — cues=start,card,lock,lock,tick,tick,tick,call
- ✅ **the hand feels each card land (one 12 ms tap per card) and then the first call** — taps(12)=2 (1 card + the first call)
- ✅ **each Ready ticks (lock, rising); the 3 · 2 · 1's first tick comes a breath (≥ 300 ms) after the last** — locks=2 last lock→first tick=397ms
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+1039ms phone@+1052ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "another" is a 20 ms tap and one card pluck; Ready a 20 ms tap and the submit cue** — taps=3 cues=card,submit
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **each voice starts on the push (no delay); its boing lands on the squash, 170–230 ms later** — delays=0,0 boing lags=191,193ms
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":19}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":25.8}]
- ✅ **skipping through the deck: a hush before every call, one voice at a time** — clips=41 hushes=41
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5370ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":40.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,close,daub,claim,correct
- ✅ **one 'close' between the penultimate and the last daub (one square to go), once for the card** — phone cues=daub,daub,daub,close,daub,claim,correct
- ✅ **the winner's celebration buzz (320 ms) runs whole — nothing shorter cuts it** — celebration@74691 cut by=[]
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5408ms cheer@+5386ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36548 tv    music:plan   from=lobby to=game:bingo
  36548 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36548 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36863 tv    hush
  36867 tv    hush
  37362 tv    music:stop   track=bossa-antigua.mp3
  37522 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  39606 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  40131 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
  40528 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41569 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  42529 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  43531 tv    hush
  43531 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  43532 tv    speak        text=b9.wav voice=clip delayMs=0
  43533 tv    hush
  43728 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44095 tv    hush
  44095 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  44095 tv    speak        text=b8.wav voice=clip delayMs=0
  44286 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45926 tv    hush
  45926 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  45926 tv    speak        text=n34.wav voice=clip delayMs=0
  46119 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  47810 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  48074 tv    hush
  48074 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  48075 tv    hush
  53429 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  56438 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57444 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58443 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  59446 tv    hush
  59446 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  59446 tv    speak        text=n35.wav voice=clip delayMs=0
  59647 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61238 tv    music:paused paused=true
  61238 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  62506 tv    music:paused paused=false
  62506 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  63802 tv    hush
  63802 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  63802 tv    speak        text=i25.wav voice=clip delayMs=0
  63919 tv    hush
  63919 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  63919 tv    speak        text=n45.wav voice=clip delayMs=0
  64042 tv    hush
  64042 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  64042 tv    speak        text=n33.wav voice=clip delayMs=0
  64167 tv    hush
  64167 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  64167 tv    speak        text=g49.wav voice=clip delayMs=0
  64279 tv    hush
  64279 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  64279 tv    speak        text=b4.wav voice=clip delayMs=0
  64406 tv    hush
  64406 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  64406 tv    speak        text=i20.wav voice=clip delayMs=0
  64533 tv    hush
  64533 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  64533 tv    speak        text=o69.wav voice=clip delayMs=0
  64660 tv    hush
  64660 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  64660 tv    speak        text=o67.wav voice=clip delayMs=0
  64805 tv    hush
  64805 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  64805 tv    speak        text=o65.wav voice=clip delayMs=0
  64913 tv    hush
  64913 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  64913 tv    speak        text=o73.wav voice=clip delayMs=0
  65037 tv    hush
  65037 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  65037 tv    speak        text=i21.wav voice=clip delayMs=0
  65160 tv    hush
  65160 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  65160 tv    speak        text=i18.wav voice=clip delayMs=0
  65288 tv    hush
  65288 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  65288 tv    speak        text=g58.wav voice=clip delayMs=0
  65411 tv    hush
  65411 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  65411 tv    speak        text=n36.wav voice=clip delayMs=0
  65535 tv    hush
  65535 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  65535 tv    speak        text=o61.wav voice=clip delayMs=0
  65663 tv    hush
  65663 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  65663 tv    speak        text=n37.wav voice=clip delayMs=0
  65781 tv    hush
  65782 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  65782 tv    speak        text=i16.wav voice=clip delayMs=0
  65910 tv    hush
  65910 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  65910 tv    speak        text=g47.wav voice=clip delayMs=0
  66034 tv    hush
  66034 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  66034 tv    speak        text=n41.wav voice=clip delayMs=0
  66152 tv    hush
  66152 tv    clip         src=b6.wav muted=false ready=true delayMs=0
  66152 tv    speak        text=b6.wav voice=clip delayMs=0
  66283 tv    hush
  66283 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  66283 tv    speak        text=o72.wav voice=clip delayMs=0
  66411 tv    hush
  66411 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  66411 tv    speak        text=b3.wav voice=clip delayMs=0
  66528 tv    hush
  66528 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  66528 tv    speak        text=i30.wav voice=clip delayMs=0
  66655 tv    hush
  66655 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  66655 tv    speak        text=g56.wav voice=clip delayMs=0
  66788 tv    hush
  66788 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  66788 tv    speak        text=o75.wav voice=clip delayMs=0
  66907 tv    hush
  66907 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  66907 tv    speak        text=b1.wav voice=clip delayMs=0
  67033 tv    hush
  67033 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  67033 tv    speak        text=b2.wav voice=clip delayMs=0
  67162 tv    hush
  67162 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  67162 tv    speak        text=n32.wav voice=clip delayMs=0
  67289 tv    hush
  67289 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  67289 tv    speak        text=g48.wav voice=clip delayMs=0
  67418 tv    hush
  67418 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  67418 tv    speak        text=i23.wav voice=clip delayMs=0
  67552 tv    hush
  67552 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  67552 tv    speak        text=i26.wav voice=clip delayMs=0
  67658 tv    hush
  67658 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  67658 tv    speak        text=o66.wav voice=clip delayMs=0
  67799 tv    hush
  67799 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  67799 tv    speak        text=i19.wav voice=clip delayMs=0
  67916 tv    hush
  67916 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  67916 tv    speak        text=n42.wav voice=clip delayMs=0
  68047 tv    hush
  68047 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  68047 tv    speak        text=i24.wav voice=clip delayMs=0
  68156 tv    hush
  68156 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  68156 tv    speak        text=n39.wav voice=clip delayMs=0
  68274 tv    hush
  68274 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  68274 tv    speak        text=g46.wav voice=clip delayMs=0
  68407 tv    hush
  68407 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  68407 tv    speak        text=n44.wav voice=clip delayMs=0
  68526 tv    hush
  68526 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  68526 tv    speak        text=b15.wav voice=clip delayMs=0
  68653 tv    hush
  68653 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  68653 tv    speak        text=b11.wav voice=clip delayMs=0
  68784 tv    hush
  68784 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  68784 tv    speak        text=g57.wav voice=clip delayMs=0
  68975 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  69475 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  69763 tv    hush
  69764 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  69764 tv    hush
  71647 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  75133 tv    music:duck   ms=9000
  75133 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  79956 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  80281 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81282 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82287 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  83280 tv    hush
  83280 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  83280 tv    speak        text=g57.wav voice=clip delayMs=0
  83471 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  85599 tv    ss:cancel    speaking=false pending=false
  85599 tv    music:plan   from=game:bingo to=null
  85605 tv    ss:cancel    speaking=false pending=false
  85605 tv    music:plan   from=null to=lobby
  85605 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  86407 tv    music:stop   track=cool-vibes.mp3
  88163 tv    ss:cancel    speaking=false pending=false
  88179 tv    music:plan   from=lobby to=game:bingo
  88179 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  88179 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  88185 tv    hush
  88186 tv    hush
  88775 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  88779 tv    hush
  88779 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  88779 tv    speak        text=i21.wav voice=clip delayMs=0
  88780 tv    hush
  88791 tv    hush
  88791 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  88791 tv    speak        text=n32.wav voice=clip delayMs=0
  88888 tv    hush
  88888 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  88888 tv    speak        text=i18.wav voice=clip delayMs=0
  88981 tv    music:stop   track=bossa-antigua.mp3
  88985 tv    hush
  88985 tv    clip         src=n40.wav muted=false ready=true delayMs=0
  88985 tv    speak        text=n40.wav voice=clip delayMs=0
  89076 tv    hush
  89076 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  89076 tv    speak        text=i30.wav voice=clip delayMs=0
  89175 tv    hush
  89175 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  89175 tv    speak        text=o69.wav voice=clip delayMs=0
  89288 tv    hush
  89288 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  89288 tv    speak        text=o61.wav voice=clip delayMs=0
  89391 tv    hush
  89391 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  89391 tv    speak        text=n34.wav voice=clip delayMs=0
  89469 tv    hush
  89469 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  89469 tv    speak        text=n35.wav voice=clip delayMs=0
  89577 tv    hush
  89577 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  89577 tv    speak        text=o67.wav voice=clip delayMs=0
  89672 tv    hush
  89672 tv    clip         src=g55.wav muted=false ready=true delayMs=0
  89672 tv    speak        text=g55.wav voice=clip delayMs=0
  89771 tv    hush
  89771 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  89771 tv    speak        text=i26.wav voice=clip delayMs=0
  89860 tv    hush
  89860 tv    clip         src=i22.wav muted=false ready=true delayMs=0
  89860 tv    speak        text=i22.wav voice=clip delayMs=0
  89969 tv    hush
  89969 tv    clip         src=i29.wav muted=false ready=true delayMs=0
  89969 tv    speak        text=i29.wav voice=clip delayMs=0
  90063 tv    hush
  90063 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  90063 tv    speak        text=o66.wav voice=clip delayMs=0
  90160 tv    hush
  90160 tv    clip         src=g51.wav muted=false ready=true delayMs=0
  90160 tv    speak        text=g51.wav voice=clip delayMs=0
  90251 tv    hush
  90251 tv    clip         src=g53.wav muted=false ready=true delayMs=0
  90251 tv    speak        text=g53.wav voice=clip delayMs=0
  90360 tv    hush
  90360 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  90360 tv    speak        text=b9.wav voice=clip delayMs=0
  90440 tv    hush
  90440 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  90440 tv    speak        text=n36.wav voice=clip delayMs=0
  90549 tv    hush
  90549 tv    clip         src=g52.wav muted=false ready=true delayMs=0
  90549 tv    speak        text=g52.wav voice=clip delayMs=0
  90643 tv    hush
  90643 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  90643 tv    speak        text=b1.wav voice=clip delayMs=0
  90738 tv    hush
  90738 tv    clip         src=b13.wav muted=false ready=true delayMs=0
  90738 tv    speak        text=b13.wav voice=clip delayMs=0
  90836 tv    hush
  90836 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  90836 tv    speak        text=n37.wav voice=clip delayMs=0
  90926 tv    hush
  90926 tv    clip         src=o71.wav muted=false ready=true delayMs=0
  90926 tv    speak        text=o71.wav voice=clip delayMs=0
  91021 tv    hush
  91021 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  91021 tv    speak        text=b8.wav voice=clip delayMs=0
  91101 tv    hush
  91101 tv    clip         src=b5.wav muted=false ready=true delayMs=0
  91101 tv    speak        text=b5.wav voice=clip delayMs=0
  91195 tv    hush
  91195 tv    clip         src=b7.wav muted=false ready=true delayMs=0
  91195 tv    speak        text=b7.wav voice=clip delayMs=0
  91288 tv    hush
  91288 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  91288 tv    speak        text=n42.wav voice=clip delayMs=0
  91370 tv    hush
  91370 tv    clip         src=i28.wav muted=false ready=true delayMs=0
  91370 tv    speak        text=i28.wav voice=clip delayMs=0
  91477 tv    hush
  91477 tv    clip         src=i27.wav muted=false ready=true delayMs=0
  91477 tv    speak        text=i27.wav voice=clip delayMs=0
  91573 tv    hush
  91573 tv    clip         src=o63.wav muted=false ready=true delayMs=0
  91573 tv    speak        text=o63.wav voice=clip delayMs=0
  91687 tv    hush
  91687 tv    clip         src=o64.wav muted=false ready=true delayMs=0
  91687 tv    speak        text=o64.wav voice=clip delayMs=0
  91774 tv    hush
  91774 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  91774 tv    speak        text=o73.wav voice=clip delayMs=0
  91871 tv    hush
  91871 tv    clip         src=g50.wav muted=false ready=true delayMs=0
  91871 tv    speak        text=g50.wav voice=clip delayMs=0
  91978 tv    hush
  91978 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  91978 tv    speak        text=g48.wav voice=clip delayMs=0
  92086 tv    hush
  92086 tv    clip         src=b12.wav muted=false ready=true delayMs=0
  92086 tv    speak        text=b12.wav voice=clip delayMs=0
  92180 tv    hush
  92180 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  92180 tv    speak        text=n45.wav voice=clip delayMs=0
  92273 tv    hush
  92273 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  92273 tv    speak        text=b4.wav voice=clip delayMs=0
  92368 tv    hush
  92368 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  92368 tv    speak        text=g46.wav voice=clip delayMs=0
  92477 tv    hush
  92477 tv    clip         src=o74.wav muted=false ready=true delayMs=0
  92477 tv    speak        text=o74.wav voice=clip delayMs=0
  92573 tv    hush
  92573 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  92573 tv    speak        text=g47.wav voice=clip delayMs=0
  92670 tv    hush
  92670 tv    clip         src=n31.wav muted=false ready=true delayMs=0
  92670 tv    speak        text=n31.wav voice=clip delayMs=0
  92762 tv    hush
  92762 tv    clip         src=o62.wav muted=false ready=true delayMs=0
  92762 tv    speak        text=o62.wav voice=clip delayMs=0
  92841 tv    hush
  92841 tv    clip         src=b10.wav muted=false ready=true delayMs=0
  92841 tv    speak        text=b10.wav voice=clip delayMs=0
  92966 tv    hush
  92966 tv    clip         src=g60.wav muted=false ready=true delayMs=0
  92966 tv    speak        text=g60.wav voice=clip delayMs=0
  93056 tv    hush
  93056 tv    clip         src=n38.wav muted=false ready=true delayMs=0
  93056 tv    speak        text=n38.wav voice=clip delayMs=0
  93151 tv    hush
  93151 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  93151 tv    speak        text=n39.wav voice=clip delayMs=0
  93277 tv    hush
  93277 tv    clip         src=o70.wav muted=false ready=true delayMs=0
  93277 tv    speak        text=o70.wav voice=clip delayMs=0
  93360 tv    hush
  93360 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  93360 tv    speak        text=b11.wav voice=clip delayMs=0
  93456 tv    hush
  93456 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  93456 tv    speak        text=o75.wav voice=clip delayMs=0
  93547 tv    hush
  93547 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  93547 tv    speak        text=g58.wav voice=clip delayMs=0
  93626 tv    hush
  93626 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  93626 tv    speak        text=b15.wav voice=clip delayMs=0
  93718 tv    hush
  93718 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  93718 tv    speak        text=i24.wav voice=clip delayMs=0
  93813 tv    hush
  93813 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  93813 tv    speak        text=o72.wav voice=clip delayMs=0
  93919 tv    hush
  93919 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  93919 tv    speak        text=g56.wav voice=clip delayMs=0
  94014 tv    hush
  94014 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  94014 tv    speak        text=i20.wav voice=clip delayMs=0
  94109 tv    hush
  94109 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  94109 tv    speak        text=n44.wav voice=clip delayMs=0
  94204 tv    hush
  94204 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  94204 tv    speak        text=b3.wav voice=clip delayMs=0
  94312 tv    hush
  94312 tv    clip         src=o68.wav muted=false ready=true delayMs=0
  94312 tv    speak        text=o68.wav voice=clip delayMs=0
  94409 tv    hush
  94409 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  94409 tv    speak        text=b2.wav voice=clip delayMs=0
  94502 tv    hush
  94502 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  94502 tv    speak        text=n41.wav voice=clip delayMs=0
  94597 tv    hush
  94597 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  94597 tv    speak        text=o65.wav voice=clip delayMs=0
  94704 tv    hush
  94704 tv    clip         src=i17.wav muted=false ready=true delayMs=0
  94704 tv    speak        text=i17.wav voice=clip delayMs=0
  94815 tv    hush
  94815 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  94815 tv    speak        text=i25.wav voice=clip delayMs=0
  94908 tv    hush
  94908 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  94908 tv    speak        text=i19.wav voice=clip delayMs=0
  95003 tv    hush
  95003 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  95003 tv    speak        text=g57.wav voice=clip delayMs=0
  95110 tv    hush
  95110 tv    clip         src=g59.wav muted=false ready=true delayMs=0
  95110 tv    speak        text=g59.wav voice=clip delayMs=0
  95307 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  96441 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  96708 tv    hush
  96708 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  96708 tv    hush
 104317 tv    music:duck   ms=9000
 104317 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 109347 tv    hush
 109347 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 109348 tv    hush
 113341 tv    ss:cancel    speaking=false pending=false
 113341 tv    music:plan   from=game:bingo to=null
 113341 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 114842 tv    music:stop   track=cool-vibes.mp3
 114964 tv    ss:cancel    speaking=false pending=false
 114965 tv    music:plan   from=null to=lobby
 114965 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 117485 tv    ss:cancel    speaking=false pending=false
 117503 tv    music:plan   from=lobby to=game:bingo
 117503 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 117503 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 117510 tv    hush
 117511 tv    hush
 118110 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 118115 tv    hush
 118115 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 118115 tv    speak        text=i21.wav voice=clip delayMs=0
 118115 tv    hush
 118127 tv    hush
 118127 tv    clip         src=n32.wav muted=false ready=true delayMs=0
 118127 tv    speak        text=n32.wav voice=clip delayMs=0
 118222 tv    hush
 118222 tv    clip         src=i18.wav muted=false ready=true delayMs=0
 118222 tv    speak        text=i18.wav voice=clip delayMs=0
 118306 tv    music:stop   track=bossa-antigua.mp3
 118317 tv    hush
 118317 tv    clip         src=n40.wav muted=false ready=true delayMs=0
 118317 tv    speak        text=n40.wav voice=clip delayMs=0
 118410 tv    hush
 118410 tv    clip         src=i30.wav muted=false ready=true delayMs=0
 118410 tv    speak        text=i30.wav voice=clip delayMs=0
 118506 tv    hush
 118506 tv    clip         src=o69.wav muted=false ready=true delayMs=0
 118506 tv    speak        text=o69.wav voice=clip delayMs=0
 118585 tv    hush
 118585 tv    clip         src=o61.wav muted=false ready=true delayMs=0
 118585 tv    speak        text=o61.wav voice=clip delayMs=0
 118692 tv    hush
 118692 tv    clip         src=n34.wav muted=false ready=true delayMs=0
 118692 tv    speak        text=n34.wav voice=clip delayMs=0
 118772 tv    hush
 118772 tv    clip         src=n35.wav muted=false ready=true delayMs=0
 118772 tv    speak        text=n35.wav voice=clip delayMs=0
 118882 tv    hush
 118882 tv    clip         src=o67.wav muted=false ready=true delayMs=0
 118882 tv    speak        text=o67.wav voice=clip delayMs=0
 118978 tv    hush
 118978 tv    clip         src=g55.wav muted=false ready=true delayMs=0
 118978 tv    speak        text=g55.wav voice=clip delayMs=0
 119086 tv    hush
 119086 tv    clip         src=i26.wav muted=false ready=true delayMs=0
 119086 tv    speak        text=i26.wav voice=clip delayMs=0
 119168 tv    hush
 119168 tv    clip         src=i22.wav muted=false ready=true delayMs=0
 119168 tv    speak        text=i22.wav voice=clip delayMs=0
 119275 tv    hush
 119275 tv    clip         src=i29.wav muted=false ready=true delayMs=0
 119275 tv    speak        text=i29.wav voice=clip delayMs=0
 119356 tv    hush
 119356 tv    clip         src=o66.wav muted=false ready=true delayMs=0
 119356 tv    speak        text=o66.wav voice=clip delayMs=0
 119448 tv    hush
 119448 tv    clip         src=g51.wav muted=false ready=true delayMs=0
 119448 tv    speak        text=g51.wav voice=clip delayMs=0
 119544 tv    hush
 119544 tv    clip         src=g53.wav muted=false ready=true delayMs=0
 119544 tv    speak        text=g53.wav voice=clip delayMs=0
 119651 tv    hush
 119651 tv    clip         src=b9.wav muted=false ready=true delayMs=0
 119651 tv    speak        text=b9.wav voice=clip delayMs=0
 119747 tv    hush
 119747 tv    clip         src=n36.wav muted=false ready=true delayMs=0
 119747 tv    speak        text=n36.wav voice=clip delayMs=0
 119842 tv    hush
 119842 tv    clip         src=g52.wav muted=false ready=true delayMs=0
 119842 tv    speak        text=g52.wav voice=clip delayMs=0
 119951 tv    hush
 119951 tv    clip         src=b1.wav muted=false ready=true delayMs=0
 119951 tv    speak        text=b1.wav voice=clip delayMs=0
 120046 tv    hush
 120046 tv    clip         src=b13.wav muted=false ready=true delayMs=0
 120046 tv    speak        text=b13.wav voice=clip delayMs=0
 120156 tv    hush
 120156 tv    clip         src=n37.wav muted=false ready=true delayMs=0
 120156 tv    speak        text=n37.wav voice=clip delayMs=0
 120251 tv    hush
 120251 tv    clip         src=o71.wav muted=false ready=true delayMs=0
 120251 tv    speak        text=o71.wav voice=clip delayMs=0
 120343 tv    hush
 120343 tv    clip         src=b8.wav muted=false ready=true delayMs=0
 120343 tv    speak        text=b8.wav voice=clip delayMs=0
 120423 tv    hush
 120423 tv    clip         src=b5.wav muted=false ready=true delayMs=0
 120423 tv    speak        text=b5.wav voice=clip delayMs=0
 120531 tv    hush
 120531 tv    clip         src=b7.wav muted=false ready=true delayMs=0
 120531 tv    speak        text=b7.wav voice=clip delayMs=0
 120627 tv    hush
 120627 tv    clip         src=n42.wav muted=false ready=true delayMs=0
 120627 tv    speak        text=n42.wav voice=clip delayMs=0
 120721 tv    hush
 120721 tv    clip         src=i28.wav muted=false ready=true delayMs=0
 120721 tv    speak        text=i28.wav voice=clip delayMs=0
 120816 tv    hush
 120816 tv    clip         src=i27.wav muted=false ready=true delayMs=0
 120816 tv    speak        text=i27.wav voice=clip delayMs=0
 120908 tv    hush
 120908 tv    clip         src=o63.wav muted=false ready=true delayMs=0
 120908 tv    speak        text=o63.wav voice=clip delayMs=0
 121002 tv    hush
 121002 tv    clip         src=o64.wav muted=false ready=true delayMs=0
 121002 tv    speak        text=o64.wav voice=clip delayMs=0
 121111 tv    hush
 121111 tv    clip         src=o73.wav muted=false ready=true delayMs=0
 121111 tv    speak        text=o73.wav voice=clip delayMs=0
 121202 tv    hush
 121202 tv    clip         src=g50.wav muted=false ready=true delayMs=0
 121202 tv    speak        text=g50.wav voice=clip delayMs=0
 121298 tv    hush
 121298 tv    clip         src=g48.wav muted=false ready=true delayMs=0
 121298 tv    speak        text=g48.wav voice=clip delayMs=0
 121390 tv    hush
 121390 tv    clip         src=b12.wav muted=false ready=true delayMs=0
 121390 tv    speak        text=b12.wav voice=clip delayMs=0
 121484 tv    hush
 121484 tv    clip         src=n45.wav muted=false ready=true delayMs=0
 121484 tv    speak        text=n45.wav voice=clip delayMs=0
 121578 tv    hush
 121578 tv    clip         src=b4.wav muted=false ready=true delayMs=0
 121578 tv    speak        text=b4.wav voice=clip delayMs=0
 121657 tv    hush
 121657 tv    clip         src=g46.wav muted=false ready=true delayMs=0
 121657 tv    speak        text=g46.wav voice=clip delayMs=0
 121752 tv    hush
 121752 tv    clip         src=o74.wav muted=false ready=true delayMs=0
 121752 tv    speak        text=o74.wav voice=clip delayMs=0
 121863 tv    hush
 121863 tv    clip         src=g47.wav muted=false ready=true delayMs=0
 121863 tv    speak        text=g47.wav voice=clip delayMs=0
 121969 tv    hush
 121969 tv    clip         src=n31.wav muted=false ready=true delayMs=0
 121969 tv    speak        text=n31.wav voice=clip delayMs=0
 122063 tv    hush
 122063 tv    clip         src=o62.wav muted=false ready=true delayMs=0
 122063 tv    speak        text=o62.wav voice=clip delayMs=0
 122157 tv    hush
 122157 tv    clip         src=b10.wav muted=false ready=true delayMs=0
 122157 tv    speak        text=b10.wav voice=clip delayMs=0
 122235 tv    hush
 122235 tv    clip         src=g60.wav muted=false ready=true delayMs=0
 122235 tv    speak        text=g60.wav voice=clip delayMs=0
 122328 tv    hush
 122328 tv    clip         src=n38.wav muted=false ready=true delayMs=0
 122328 tv    speak        text=n38.wav voice=clip delayMs=0
 122422 tv    hush
 122422 tv    clip         src=n39.wav muted=false ready=true delayMs=0
 122422 tv    speak        text=n39.wav voice=clip delayMs=0
 122517 tv    hush
 122517 tv    clip         src=o70.wav muted=false ready=true delayMs=0
 122517 tv    speak        text=o70.wav voice=clip delayMs=0
 122611 tv    hush
 122611 tv    clip         src=b11.wav muted=false ready=true delayMs=0
 122611 tv    speak        text=b11.wav voice=clip delayMs=0
 122707 tv    hush
 122707 tv    clip         src=o75.wav muted=false ready=true delayMs=0
 122707 tv    speak        text=o75.wav voice=clip delayMs=0
 122802 tv    hush
 122802 tv    clip         src=g58.wav muted=false ready=true delayMs=0
 122802 tv    speak        text=g58.wav voice=clip delayMs=0
 122881 tv    hush
 122881 tv    clip         src=b15.wav muted=false ready=true delayMs=0
 122881 tv    speak        text=b15.wav voice=clip delayMs=0
 122972 tv    hush
 122972 tv    clip         src=i24.wav muted=false ready=true delayMs=0
 122972 tv    speak        text=i24.wav voice=clip delayMs=0
 123068 tv    hush
 123068 tv    clip         src=o72.wav muted=false ready=true delayMs=0
 123068 tv    speak        text=o72.wav voice=clip delayMs=0
 123161 tv    hush
 123161 tv    clip         src=g56.wav muted=false ready=true delayMs=0
 123161 tv    speak        text=g56.wav voice=clip delayMs=0
 123257 tv    hush
 123257 tv    clip         src=i20.wav muted=false ready=true delayMs=0
 123257 tv    speak        text=i20.wav voice=clip delayMs=0
 123366 tv    hush
 123366 tv    clip         src=n44.wav muted=false ready=true delayMs=0
 123366 tv    speak        text=n44.wav voice=clip delayMs=0
 123475 tv    hush
 123475 tv    clip         src=b3.wav muted=false ready=true delayMs=0
 123475 tv    speak        text=b3.wav voice=clip delayMs=0
 123582 tv    hush
 123582 tv    clip         src=o68.wav muted=false ready=true delayMs=0
 123582 tv    speak        text=o68.wav voice=clip delayMs=0
 123676 tv    hush
 123676 tv    clip         src=b2.wav muted=false ready=true delayMs=0
 123676 tv    speak        text=b2.wav voice=clip delayMs=0
 123788 tv    hush
 123788 tv    clip         src=n41.wav muted=false ready=true delayMs=0
 123788 tv    speak        text=n41.wav voice=clip delayMs=0
 123899 tv    hush
 123899 tv    clip         src=o65.wav muted=false ready=true delayMs=0
 123899 tv    speak        text=o65.wav voice=clip delayMs=0
 123992 tv    hush
 123992 tv    clip         src=i17.wav muted=false ready=true delayMs=0
 123992 tv    speak        text=i17.wav voice=clip delayMs=0
 124101 tv    hush
 124101 tv    clip         src=i25.wav muted=false ready=true delayMs=0
 124101 tv    speak        text=i25.wav voice=clip delayMs=0
 124198 tv    hush
 124198 tv    clip         src=i19.wav muted=false ready=true delayMs=0
 124198 tv    speak        text=i19.wav voice=clip delayMs=0
 124289 tv    hush
 124289 tv    clip         src=g57.wav muted=false ready=true delayMs=0
 124289 tv    speak        text=g57.wav voice=clip delayMs=0
 124370 tv    hush
 124370 tv    clip         src=g59.wav muted=false ready=true delayMs=0
 124370 tv    speak        text=g59.wav voice=clip delayMs=0
 124565 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 125620 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 125880 tv    hush
 125880 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 125881 tv    hush
 133498 tv    music:duck   ms=9000
 133498 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 138515 tv    hush
 138515 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 138516 tv    hush
 140067 tv    ss:cancel    speaking=false pending=false
 140067 tv    music:plan   from=game:bingo to=null
 140073 tv    ss:cancel    speaking=false pending=false
 140073 tv    music:plan   from=null to=lobby
 140073 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 140874 tv    music:stop   track=wallpaper.mp3
 142591 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 142608 tv    ss:cancel    speaking=false pending=false
 142614 tv    music:plan   from=lobby to=game:bingo
 142614 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 142614 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 142623 tv    hush
 142624 tv    hush
 143275 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 143424 tv    music:stop   track=george-street-shuffle.mp3
 143849 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
 144768 tv    ss:cancel    speaking=false pending=false
 144768 tv    music:plan   from=game:bingo to=null
 144768 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 146279 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 146948 tv    ss:cancel    speaking=false pending=false
 146948 tv    music:plan   from=null to=lobby
 146948 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 150337 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 150359 tv    ss:cancel    speaking=false pending=false
 150364 tv    music:plan   from=lobby to=game:bingo
 150364 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 150364 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 150374 tv    hush
 150374 tv    hush
 150780 tv    cue          cue=lock surface=tv muted=false ready=true semitones=8
 150787 tv    hush
 150787 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 150787 tv    speak        text=i21.wav voice=clip delayMs=0
 150787 tv    hush
 150990 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 151174 tv    music:stop   track=bossa-antigua.mp3
 151283 tv    ss:cancel    speaking=false pending=false
 151283 tv    music:plan   from=game:bingo to=null
 151294 tv    ss:cancel    speaking=false pending=false
 151294 tv    music:plan   from=null to=lobby
 151294 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 152103 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, the lobby track only fading out, the warm bed under the intro** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.06,"t":10.5}] bed=warm
- ✅ **the writing track eases in (under 0.2 a third of a second in), never a hard start** — playing=[{"track":"local-forecast-elevator.mp3","vol":0.04,"t":10.9},{"track":"carefree.mp3","vol":0.11,"t":0.3}]
- ✅ **answer → one Wisecrack track at 0.2 × its trim while everyone writes, the bed gone** — playing=[{"track":"carefree.mp3","vol":0.31,"t":2.4}] bed=null
- ✅ **pause while writing → pause cue, the writing track holds (nothing playing), no bed** — cues=phase,pause playing=[]
- ✅ **resume → phase chime, the same writing track carries on at its level (no music:start)** — cues=phase playing=[{"track":"carefree.mp3","vol":0.31,"t":3.4}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,pause,phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **vote → the marimba bed (the first prompt), the track fading out** — bed=marimba playing=[]
- ✅ **reveal keeps the vote’s bed (same list, same turn: no crossfade on the cut)** — bed=marimba playing=[]
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal
- ✅ **scores phase → tally ping (mapped), the lounge bed** — cues=phase,reveal,phase,reveal,tally bed=lounge

```
 156990 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157422 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157854 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158291 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158737 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 159991 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 160599 tv    ss:cancel    speaking=false pending=false
 160608 tv    music:plan   from=lobby to=null
 160608 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 161886 tv    music:plan   from=null to=game:wisecrack
 161886 tv    music:start  plan=game:wisecrack track=carefree mode=chain volume=0.30600000000000005
 161886 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 162689 tv    music:stop   track=local-forecast-elevator.mp3
 164424 tv    music:paused paused=true
 164424 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
 165419 tv    music:paused paused=false
 165419 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 167439 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 168788 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 170128 tv    music:plan   from=game:wisecrack to=null
 170129 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 170129 tv    bed:duck     bed=marimba cue=phase
 171232 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 171232 tv    bed:duck     bed=marimba cue=reveal
 171640 tv    music:stop   track=carefree.mp3
 174885 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 174885 tv    bed:duck     bed=lofi cue=phase
 175070 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 175070 tv    bed:duck     bed=lofi cue=reveal
 175260 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 175260 tv    bed:duck     bed=marimba cue=phase
 175449 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 175449 tv    bed:duck     bed=marimba cue=reveal
 175626 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 175626 tv    bed:duck     bed=lounge cue=tally
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.3}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 176796 tv    ss:cancel    speaking=false pending=false
 176801 tv    ss:cancel    speaking=false pending=false
 176801 tv    music:plan   from=null to=lobby
 176801 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 178821 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 178838 tv    ss:cancel    speaking=false pending=false
 178842 tv    music:plan   from=lobby to=null
 178842 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 180355 tv    music:stop   track=bossa-antigua.mp3
 180432 tv    music:plan   from=null to=game:broken-pencil
 180432 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 180432 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 181895 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 182371 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 182526 tv    music:plan   from=game:broken-pencil to=null
 182526 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 184038 tv    music:stop   track=backbay-lounge.mp3
```
