# Audio interaction trace

Captured 2026-09-16T22:59:31.476Z on port 42145. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**45 / 45 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:bossa-antigua
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":4.4}]

```
   1732 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   1732 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3045 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3177 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3868 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4499 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5348 tv    ss:cancel    speaking=false pending=false
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
   6198 tv    music:plan   from=lobby to=null
   6198 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7704 tv    music:stop   track=bossa-antigua.mp3
   8145 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9414 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16401 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17404 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18405 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19403 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20398 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21203 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22018 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22176 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22331 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22486 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22642 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22797 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22951 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23107 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23264 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23422 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23578 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23737 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23893 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24049 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24188 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24345 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24499 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24657 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24813 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25686 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26020 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27829 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29554 tv    ss:cancel    speaking=false pending=false
  29554 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31090 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33242 tv    ss:cancel    speaking=false pending=false
  33242 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34793 tv    ss:cancel    speaking=false pending=false
  34793 tv    music:plan   from=null to=lobby
  34793 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":3}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=hush,silence,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":12.7}]
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":16.2}]
- ✅ **BINGO → caller hushed, sweep as the line turns, cheer once at the verdict (~4.4 s), no chime on entry, music continues** — cues=silence,sweep,sweep,sweep,sweep,cheer cheer@+4409ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":24.8}]
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going → play resumes, next number spoken, no start/phase chime** — cues=sweep,lock,call spoken=b3.wav
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36360 tv    music:plan   from=lobby to=game:bingo
  36360 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36360 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36667 tv    hush
  36667 tv    hush
  37164 tv    music:stop   track=airport-lounge.mp3
  39415 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39415 tv    clip         src=b9.wav muted=false ready=true
  39415 tv    speak        text=b9.wav voice=clip
  41243 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41243 tv    clip         src=b8.wav muted=false ready=true
  41243 tv    speak        text=b8.wav voice=clip
  43112 tv    hush
  43112 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  43112 tv    hush
  47520 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  49144 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  49144 tv    clip         src=n34.wav muted=false ready=true
  49144 tv    speak        text=n34.wav voice=clip
  51345 tv    music:paused paused=true
  51345 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  52595 tv    music:paused paused=false
  52595 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  53906 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  53906 tv    clip         src=n35.wav muted=false ready=true
  53906 tv    speak        text=n35.wav voice=clip
  54002 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54002 tv    clip         src=i25.wav muted=false ready=true
  54002 tv    speak        text=i25.wav voice=clip
  54075 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54075 tv    clip         src=n45.wav muted=false ready=true
  54075 tv    speak        text=n45.wav voice=clip
  54155 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54155 tv    clip         src=n33.wav muted=false ready=true
  54155 tv    speak        text=n33.wav voice=clip
  54263 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54263 tv    clip         src=g49.wav muted=false ready=true
  54263 tv    speak        text=g49.wav voice=clip
  54358 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54358 tv    clip         src=b4.wav muted=false ready=true
  54358 tv    speak        text=b4.wav voice=clip
  54453 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54453 tv    clip         src=i20.wav muted=false ready=true
  54453 tv    speak        text=i20.wav voice=clip
  54545 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54545 tv    clip         src=o69.wav muted=false ready=true
  54545 tv    speak        text=o69.wav voice=clip
  54638 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54638 tv    clip         src=o67.wav muted=false ready=true
  54638 tv    speak        text=o67.wav voice=clip
  54735 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54735 tv    clip         src=o65.wav muted=false ready=true
  54735 tv    speak        text=o65.wav voice=clip
  54841 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54841 tv    clip         src=o73.wav muted=false ready=true
  54841 tv    speak        text=o73.wav voice=clip
  54936 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54936 tv    clip         src=i21.wav muted=false ready=true
  54936 tv    speak        text=i21.wav voice=clip
  55045 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55045 tv    clip         src=i18.wav muted=false ready=true
  55045 tv    speak        text=i18.wav voice=clip
  55128 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55128 tv    clip         src=g58.wav muted=false ready=true
  55128 tv    speak        text=g58.wav voice=clip
  55213 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55214 tv    clip         src=n36.wav muted=false ready=true
  55214 tv    speak        text=n36.wav voice=clip
  55307 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55307 tv    clip         src=o61.wav muted=false ready=true
  55307 tv    speak        text=o61.wav voice=clip
  55402 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55402 tv    clip         src=n37.wav muted=false ready=true
  55402 tv    speak        text=n37.wav voice=clip
  55497 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55497 tv    clip         src=i16.wav muted=false ready=true
  55497 tv    speak        text=i16.wav voice=clip
  55591 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55591 tv    clip         src=g47.wav muted=false ready=true
  55591 tv    speak        text=g47.wav voice=clip
  55685 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55685 tv    clip         src=n41.wav muted=false ready=true
  55685 tv    speak        text=n41.wav voice=clip
  55780 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55780 tv    clip         src=b6.wav muted=false ready=true
  55780 tv    speak        text=b6.wav voice=clip
  55873 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55873 tv    clip         src=o72.wav muted=false ready=true
  55873 tv    speak        text=o72.wav voice=clip
  56446 tv    hush
  56446 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  56446 tv    hush
  57149 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  58653 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  60249 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  60855 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  60855 tv    music:duck   ms=9000
  60855 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  64028 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  64028 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  64030 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  64030 tv    clip         src=b3.wav muted=false ready=true
  64030 tv    speak        text=b3.wav voice=clip
  66479 tv    ss:cancel    speaking=false pending=false
  66479 tv    music:plan   from=game:bingo to=null
  66479 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  67986 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
  68571 tv    ss:cancel    speaking=false pending=false
  68571 tv    music:plan   from=null to=lobby
  68571 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  71917 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
  71926 tv    ss:cancel    speaking=false pending=false
  71928 tv    music:plan   from=lobby to=game:bingo
  71928 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  71928 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  71931 tv    hush
  71931 tv    hush
  72359 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  72359 tv    clip         src=i21.wav muted=false ready=true
  72359 tv    speak        text=i21.wav voice=clip
  72729 tv    music:stop   track=bossa-antigua.mp3
  72856 tv    ss:cancel    speaking=false pending=false
  72856 tv    music:plan   from=game:bingo to=null
  72858 tv    ss:cancel    speaking=false pending=false
  72858 tv    music:plan   from=null to=lobby
  72858 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  73665 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":9.2}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
  78408 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  78842 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  79274 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  80323 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
  80905 tv    ss:cancel    speaking=false pending=false
  80906 tv    music:plan   from=lobby to=null
  80906 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  82141 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  82417 tv    music:stop   track=bossa-antigua.mp3
  83742 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  85025 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
  86310 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  87309 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  88375 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  90931 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  91114 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  91303 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  91490 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"lobby-time.mp3","vol":0.2,"t":1.4}]
- ✅ **show → reveal sting (mapped), music stops (show)** — cues=phase,phase,reveal playing=[]

```
  92588 tv    ss:cancel    speaking=false pending=false
  92590 tv    ss:cancel    speaking=false pending=false
  92590 tv    music:plan   from=null to=lobby
  92590 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  94620 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
  94630 tv    ss:cancel    speaking=false pending=false
  94632 tv    music:plan   from=lobby to=null
  94632 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  96133 tv    music:stop   track=airport-lounge.mp3
  96174 tv    music:plan   from=null to=game:broken-pencil
  96174 tv    music:start  plan=game:broken-pencil track=lobby-time mode=chain volume=0.2
  96174 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  97661 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  98095 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  98255 tv    music:plan   from=game:broken-pencil to=null
  98255 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  99765 tv    music:stop   track=lobby-time.mp3
```
