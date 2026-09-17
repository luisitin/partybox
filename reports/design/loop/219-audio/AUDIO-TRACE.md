# Audio interaction trace

Captured 2026-09-17T23:41:14.446Z on port 42100. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**45 / 45 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:george-street-shuffle
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":4.4}]

```
   1853 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   1853 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3178 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3317 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   4020 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4667 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5519 tv    ss:cancel    speaking=false pending=false
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
   6367 tv    music:plan   from=lobby to=null
   6367 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7870 tv    music:stop   track=george-street-shuffle.mp3
   8339 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9636 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16600 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17598 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18599 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19599 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20593 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21355 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22190 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22336 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22491 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22655 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22821 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22982 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23137 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23295 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23449 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23608 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23770 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23940 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24098 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24249 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24412 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24573 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24724 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24877 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  25043 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25916 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26247 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  28050 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29777 tv    ss:cancel    speaking=false pending=false
  29777 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31341 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33508 tv    ss:cancel    speaking=false pending=false
  33508 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  35060 tv    ss:cancel    speaking=false pending=false
  35060 tv    music:plan   from=null to=lobby
  35060 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=hush,silence,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":13}]
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":16.4}]
- ✅ **BINGO → caller hushed, sweep as the line turns, cheer once at the verdict (~4.4 s), no chime on entry, music continues** — cues=silence,sweep,cheer cheer@+3522ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":26.9}]
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going → play resumes, next number spoken, no start/phase chime** — cues=lock,call spoken=n44.wav
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36639 tv    music:plan   from=lobby to=game:bingo
  36639 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36639 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36946 tv    hush
  36946 tv    hush
  37448 tv    music:stop   track=airport-lounge.mp3
  39685 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39685 tv    clip         src=b9.wav muted=false ready=true
  39685 tv    speak        text=b9.wav voice=clip
  41517 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41517 tv    clip         src=b8.wav muted=false ready=true
  41517 tv    speak        text=b8.wav voice=clip
  43668 tv    hush
  43669 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  43669 tv    hush
  47183 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  49714 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  49714 tv    clip         src=n34.wav muted=false ready=true
  49714 tv    speak        text=n34.wav voice=clip
  51933 tv    music:paused paused=true
  51933 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  53196 tv    music:paused paused=false
  53197 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  54481 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54481 tv    clip         src=n35.wav muted=false ready=true
  54481 tv    speak        text=n35.wav voice=clip
  54577 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54577 tv    clip         src=i25.wav muted=false ready=true
  54577 tv    speak        text=i25.wav voice=clip
  54658 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54658 tv    clip         src=n45.wav muted=false ready=true
  54658 tv    speak        text=n45.wav voice=clip
  54750 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54750 tv    clip         src=n33.wav muted=false ready=true
  54750 tv    speak        text=n33.wav voice=clip
  54844 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54844 tv    clip         src=g49.wav muted=false ready=true
  54844 tv    speak        text=g49.wav voice=clip
  54953 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54953 tv    clip         src=b4.wav muted=false ready=true
  54953 tv    speak        text=b4.wav voice=clip
  55031 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55031 tv    clip         src=i20.wav muted=false ready=true
  55031 tv    speak        text=i20.wav voice=clip
  55114 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55114 tv    clip         src=o69.wav muted=false ready=true
  55114 tv    speak        text=o69.wav voice=clip
  55219 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55219 tv    clip         src=o67.wav muted=false ready=true
  55219 tv    speak        text=o67.wav voice=clip
  55314 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55314 tv    clip         src=o65.wav muted=false ready=true
  55314 tv    speak        text=o65.wav voice=clip
  55407 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55407 tv    clip         src=o73.wav muted=false ready=true
  55407 tv    speak        text=o73.wav voice=clip
  55501 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55501 tv    clip         src=i21.wav muted=false ready=true
  55501 tv    speak        text=i21.wav voice=clip
  55596 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55596 tv    clip         src=i18.wav muted=false ready=true
  55596 tv    speak        text=i18.wav voice=clip
  55705 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55705 tv    clip         src=g58.wav muted=false ready=true
  55705 tv    speak        text=g58.wav voice=clip
  55801 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55801 tv    clip         src=n36.wav muted=false ready=true
  55801 tv    speak        text=n36.wav voice=clip
  55896 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55896 tv    clip         src=o61.wav muted=false ready=true
  55896 tv    speak        text=o61.wav voice=clip
  55982 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55982 tv    clip         src=n37.wav muted=false ready=true
  55982 tv    speak        text=n37.wav voice=clip
  56084 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56084 tv    clip         src=i16.wav muted=false ready=true
  56084 tv    speak        text=i16.wav voice=clip
  56179 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56179 tv    clip         src=g47.wav muted=false ready=true
  56179 tv    speak        text=g47.wav voice=clip
  56289 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56289 tv    clip         src=n41.wav muted=false ready=true
  56289 tv    speak        text=n41.wav voice=clip
  56380 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56381 tv    clip         src=b6.wav muted=false ready=true
  56381 tv    speak        text=b6.wav voice=clip
  56485 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56485 tv    clip         src=o72.wav muted=false ready=true
  56485 tv    speak        text=o72.wav voice=clip
  56588 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56588 tv    clip         src=b3.wav muted=false ready=true
  56588 tv    speak        text=b3.wav voice=clip
  56680 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56680 tv    clip         src=i30.wav muted=false ready=true
  56680 tv    speak        text=i30.wav voice=clip
  56774 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56774 tv    clip         src=g56.wav muted=false ready=true
  56774 tv    speak        text=g56.wav voice=clip
  56843 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56843 tv    clip         src=o75.wav muted=false ready=true
  56843 tv    speak        text=o75.wav voice=clip
  56934 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56934 tv    clip         src=b1.wav muted=false ready=true
  56934 tv    speak        text=b1.wav voice=clip
  57043 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57043 tv    clip         src=b2.wav muted=false ready=true
  57043 tv    speak        text=b2.wav voice=clip
  57137 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57137 tv    clip         src=n32.wav muted=false ready=true
  57137 tv    speak        text=n32.wav voice=clip
  57235 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57235 tv    clip         src=g48.wav muted=false ready=true
  57235 tv    speak        text=g48.wav voice=clip
  57333 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57333 tv    clip         src=i23.wav muted=false ready=true
  57333 tv    speak        text=i23.wav voice=clip
  57428 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57428 tv    clip         src=i26.wav muted=false ready=true
  57428 tv    speak        text=i26.wav voice=clip
  57510 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57510 tv    clip         src=o66.wav muted=false ready=true
  57510 tv    speak        text=o66.wav voice=clip
  57597 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57597 tv    clip         src=i19.wav muted=false ready=true
  57597 tv    speak        text=i19.wav voice=clip
  57692 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57692 tv    clip         src=n42.wav muted=false ready=true
  57692 tv    speak        text=n42.wav voice=clip
  57792 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57792 tv    clip         src=i24.wav muted=false ready=true
  57792 tv    speak        text=i24.wav voice=clip
  57883 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57883 tv    clip         src=n39.wav muted=false ready=true
  57883 tv    speak        text=n39.wav voice=clip
  57979 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57979 tv    clip         src=g46.wav muted=false ready=true
  57979 tv    speak        text=g46.wav voice=clip
  58851 tv    hush
  58852 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  58852 tv    hush
  59737 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  62373 tv    music:duck   ms=9000
  62373 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  66485 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  66491 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  66491 tv    clip         src=n44.wav muted=false ready=true
  66491 tv    speak        text=n44.wav voice=clip
  68960 tv    ss:cancel    speaking=false pending=false
  68960 tv    music:plan   from=game:bingo to=null
  68960 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  70462 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
  71119 tv    ss:cancel    speaking=false pending=false
  71119 tv    music:plan   from=null to=lobby
  71119 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  74494 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
  74514 tv    ss:cancel    speaking=false pending=false
  74517 tv    music:plan   from=lobby to=game:bingo
  74517 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  74517 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  74524 tv    hush
  74525 tv    hush
  74944 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  74944 tv    clip         src=i21.wav muted=false ready=true
  74944 tv    speak        text=i21.wav voice=clip
  75327 tv    music:stop   track=local-forecast-elevator.mp3
  75456 tv    ss:cancel    speaking=false pending=false
  75456 tv    music:plan   from=game:bingo to=null
  75464 tv    ss:cancel    speaking=false pending=false
  75464 tv    music:plan   from=null to=lobby
  75464 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  76271 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":9.3}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
  81053 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  81483 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  81911 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  83038 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
  83633 tv    ss:cancel    speaking=false pending=false
  83640 tv    music:plan   from=lobby to=null
  83640 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  84901 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  85145 tv    music:stop   track=bossa-antigua.mp3
  86519 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  87829 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
  89159 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  90235 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  91275 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  93838 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  94024 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  94203 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  94396 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.3}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
  95500 tv    ss:cancel    speaking=false pending=false
  95505 tv    ss:cancel    speaking=false pending=false
  95505 tv    music:plan   from=null to=lobby
  95505 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  97537 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
  97548 tv    ss:cancel    speaking=false pending=false
  97551 tv    music:plan   from=lobby to=null
  97551 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  99060 tv    music:stop   track=george-street-shuffle.mp3
  99122 tv    music:plan   from=null to=game:broken-pencil
  99122 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
  99122 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 100599 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 101060 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 101211 tv    music:plan   from=game:broken-pencil to=null
 101211 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 102711 tv    music:stop   track=backbay-lounge.mp3
```
