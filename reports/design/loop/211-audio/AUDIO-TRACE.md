# Audio interaction trace

Captured 2026-09-17T22:49:01.250Z on port 42093. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**45 / 45 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:bossa-antigua
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":4.4}]

```
   1808 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   1809 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3139 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3277 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3993 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4616 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5467 tv    ss:cancel    speaking=false pending=false
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
   6318 tv    music:plan   from=lobby to=null
   6318 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7821 tv    music:stop   track=bossa-antigua.mp3
   8294 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9585 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16546 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17547 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18546 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19548 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20547 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21306 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22124 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22285 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22444 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22599 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22756 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22914 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23056 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23212 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23370 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23526 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23681 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23841 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23996 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24154 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24310 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24468 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24624 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24784 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24943 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25818 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26150 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27964 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29684 tv    ss:cancel    speaking=false pending=false
  29684 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":1.5}]

```
  31255 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33408 tv    ss:cancel    speaking=false pending=false
  33408 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34958 tv    ss:cancel    speaking=false pending=false
  34958 tv    music:plan   from=null to=lobby
  34958 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:george-street-shuffle.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=hush,silence,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":12.9}]
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":16.4}]
- ✅ **BINGO → caller hushed, sweep as the line turns, cheer once at the verdict (~4.4 s), no chime on entry, music continues** — cues=silence,sweep,cheer cheer@+3516ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":27.1}]
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going → play resumes, next number spoken, no start/phase chime** — cues=lock,call spoken=b11.wav
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36536 tv    music:plan   from=lobby to=game:bingo
  36536 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36536 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36846 tv    hush
  36849 tv    hush
  37346 tv    music:stop   track=george-street-shuffle.mp3
  39600 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39600 tv    clip         src=b9.wav muted=false ready=true
  39600 tv    speak        text=b9.wav voice=clip
  41428 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41428 tv    clip         src=b8.wav muted=false ready=true
  41428 tv    speak        text=b8.wav voice=clip
  43594 tv    hush
  43594 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  43594 tv    hush
  47098 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  49629 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  49629 tv    clip         src=n34.wav muted=false ready=true
  49629 tv    speak        text=n34.wav voice=clip
  51848 tv    music:paused paused=true
  51848 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  53112 tv    music:paused paused=false
  53112 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  54409 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54409 tv    clip         src=n35.wav muted=false ready=true
  54409 tv    speak        text=n35.wav voice=clip
  54519 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54519 tv    clip         src=i25.wav muted=false ready=true
  54519 tv    speak        text=i25.wav voice=clip
  54613 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54613 tv    clip         src=n45.wav muted=false ready=true
  54613 tv    speak        text=n45.wav voice=clip
  54695 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54695 tv    clip         src=n33.wav muted=false ready=true
  54695 tv    speak        text=n33.wav voice=clip
  54790 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54790 tv    clip         src=g49.wav muted=false ready=true
  54790 tv    speak        text=g49.wav voice=clip
  54895 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54896 tv    clip         src=b4.wav muted=false ready=true
  54896 tv    speak        text=b4.wav voice=clip
  54993 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54993 tv    clip         src=i20.wav muted=false ready=true
  54993 tv    speak        text=i20.wav voice=clip
  55089 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55089 tv    clip         src=o69.wav muted=false ready=true
  55089 tv    speak        text=o69.wav voice=clip
  55184 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55184 tv    clip         src=o67.wav muted=false ready=true
  55184 tv    speak        text=o67.wav voice=clip
  55276 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55276 tv    clip         src=o65.wav muted=false ready=true
  55276 tv    speak        text=o65.wav voice=clip
  55371 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55371 tv    clip         src=o73.wav muted=false ready=true
  55371 tv    speak        text=o73.wav voice=clip
  55466 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55466 tv    clip         src=i21.wav muted=false ready=true
  55466 tv    speak        text=i21.wav voice=clip
  55562 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55562 tv    clip         src=i18.wav muted=false ready=true
  55562 tv    speak        text=i18.wav voice=clip
  55673 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55673 tv    clip         src=g58.wav muted=false ready=true
  55673 tv    speak        text=g58.wav voice=clip
  55766 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55766 tv    clip         src=n36.wav muted=false ready=true
  55766 tv    speak        text=n36.wav voice=clip
  55860 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55860 tv    clip         src=o61.wav muted=false ready=true
  55860 tv    speak        text=o61.wav voice=clip
  55971 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55971 tv    clip         src=n37.wav muted=false ready=true
  55971 tv    speak        text=n37.wav voice=clip
  56063 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56063 tv    clip         src=i16.wav muted=false ready=true
  56063 tv    speak        text=i16.wav voice=clip
  56161 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56161 tv    clip         src=g47.wav muted=false ready=true
  56161 tv    speak        text=g47.wav voice=clip
  56240 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56240 tv    clip         src=n41.wav muted=false ready=true
  56240 tv    speak        text=n41.wav voice=clip
  56330 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56330 tv    clip         src=b6.wav muted=false ready=true
  56330 tv    speak        text=b6.wav voice=clip
  56440 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56440 tv    clip         src=o72.wav muted=false ready=true
  56440 tv    speak        text=o72.wav voice=clip
  56520 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56520 tv    clip         src=b3.wav muted=false ready=true
  56520 tv    speak        text=b3.wav voice=clip
  56629 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56629 tv    clip         src=i30.wav muted=false ready=true
  56629 tv    speak        text=i30.wav voice=clip
  56725 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56725 tv    clip         src=g56.wav muted=false ready=true
  56725 tv    speak        text=g56.wav voice=clip
  56807 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56807 tv    clip         src=o75.wav muted=false ready=true
  56807 tv    speak        text=o75.wav voice=clip
  56908 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56909 tv    clip         src=b1.wav muted=false ready=true
  56909 tv    speak        text=b1.wav voice=clip
  57005 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57005 tv    clip         src=b2.wav muted=false ready=true
  57005 tv    speak        text=b2.wav voice=clip
  57099 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57099 tv    clip         src=n32.wav muted=false ready=true
  57099 tv    speak        text=n32.wav voice=clip
  57193 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57193 tv    clip         src=g48.wav muted=false ready=true
  57193 tv    speak        text=g48.wav voice=clip
  57304 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57304 tv    clip         src=i23.wav muted=false ready=true
  57304 tv    speak        text=i23.wav voice=clip
  57398 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57398 tv    clip         src=i26.wav muted=false ready=true
  57398 tv    speak        text=i26.wav voice=clip
  57491 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57491 tv    clip         src=o66.wav muted=false ready=true
  57491 tv    speak        text=o66.wav voice=clip
  57585 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57585 tv    clip         src=i19.wav muted=false ready=true
  57585 tv    speak        text=i19.wav voice=clip
  57679 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57679 tv    clip         src=n42.wav muted=false ready=true
  57679 tv    speak        text=n42.wav voice=clip
  57776 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57776 tv    clip         src=i24.wav muted=false ready=true
  57776 tv    speak        text=i24.wav voice=clip
  57871 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57871 tv    clip         src=n39.wav muted=false ready=true
  57871 tv    speak        text=n39.wav voice=clip
  57964 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57965 tv    clip         src=g46.wav muted=false ready=true
  57965 tv    speak        text=g46.wav voice=clip
  58061 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58062 tv    clip         src=n44.wav muted=false ready=true
  58062 tv    speak        text=n44.wav voice=clip
  58141 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58141 tv    clip         src=b15.wav muted=false ready=true
  58141 tv    speak        text=b15.wav voice=clip
  59005 tv    hush
  59005 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  59005 tv    hush
  59882 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  62521 tv    music:duck   ms=9000
  62521 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  66611 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  66619 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  66619 tv    clip         src=b11.wav muted=false ready=true
  66619 tv    speak        text=b11.wav voice=clip
  69070 tv    ss:cancel    speaking=false pending=false
  69070 tv    music:plan   from=game:bingo to=null
  69070 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  70571 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
  71201 tv    ss:cancel    speaking=false pending=false
  71201 tv    music:plan   from=null to=lobby
  71201 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  74575 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
  74591 tv    ss:cancel    speaking=false pending=false
  74594 tv    music:plan   from=lobby to=game:bingo
  74595 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  74595 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  74601 tv    hush
  74602 tv    hush
  75023 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  75023 tv    clip         src=i21.wav muted=false ready=true
  75023 tv    speak        text=i21.wav voice=clip
  75395 tv    music:stop   track=george-street-shuffle.mp3
  75517 tv    ss:cancel    speaking=false pending=false
  75518 tv    music:plan   from=game:bingo to=null
  75526 tv    ss:cancel    speaking=false pending=false
  75526 tv    music:plan   from=null to=lobby
  75526 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  76341 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,join,start playing=[{"track":"airport-lounge.mp3","vol":0.07,"t":9.4}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
  81106 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  81539 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  81956 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  83123 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
  83730 tv    ss:cancel    speaking=false pending=false
  83739 tv    music:plan   from=lobby to=null
  83739 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  84989 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  85243 tv    music:stop   track=airport-lounge.mp3
  86610 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  87908 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
  89225 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  90285 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  91337 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  93903 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  94089 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  94279 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  94457 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
  95582 tv    ss:cancel    speaking=false pending=false
  95588 tv    ss:cancel    speaking=false pending=false
  95588 tv    music:plan   from=null to=lobby
  95588 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  97628 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
  97646 tv    ss:cancel    speaking=false pending=false
  97651 tv    music:plan   from=lobby to=null
  97651 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  99160 tv    music:stop   track=local-forecast-elevator.mp3
  99214 tv    music:plan   from=null to=game:broken-pencil
  99214 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
  99214 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 100707 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 101180 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 101337 tv    music:plan   from=game:broken-pencil to=null
 101337 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 102844 tv    music:stop   track=hep-cats.mp3
```
