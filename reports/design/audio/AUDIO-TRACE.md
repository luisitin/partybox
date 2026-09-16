# Audio interaction trace

Captured 2026-09-16T22:23:10.205Z on port 42145. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**45 / 45 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.4}]

```
   1783 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1783 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3096 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3229 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3926 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4547 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5381 tv    ss:cancel    speaking=false pending=false
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
   6217 tv    music:plan   from=lobby to=null
   6217 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7721 tv    music:stop   track=local-forecast-elevator.mp3
   8160 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9449 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16416 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17414 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18419 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19421 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20422 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21227 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22023 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22181 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22334 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22493 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22648 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22806 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22963 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23119 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23249 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23402 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23560 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23700 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23854 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24010 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24168 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24321 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24479 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24636 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24793 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25667 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26002 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27806 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29535 tv    ss:cancel    speaking=false pending=false
  29535 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31093 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33243 tv    ss:cancel    speaking=false pending=false
  33243 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34793 tv    ss:cancel    speaking=false pending=false
  34793 tv    music:plan   from=null to=lobby
  34793 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":3}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=hush,silence,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":10.5}]
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":13.9}]
- ✅ **BINGO → caller hushed, cheer once at the verdict (~3.3 s, after every cell has turned), no chime on entry, music continues** — cues=silence,cheer cheer@+3311ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":22.5}]
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going → play resumes, next number spoken, no start/phase chime** — cues=lock,call spoken=n44.wav
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36360 tv    music:plan   from=lobby to=game:bingo
  36360 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36360 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36672 tv    hush
  36672 tv    hush
  37171 tv    music:stop   track=bossa-antigua.mp3
  39418 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39418 tv    clip         src=b9.wav muted=false ready=true
  39418 tv    speak        text=b9.wav voice=clip
  41241 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41241 tv    clip         src=b8.wav muted=false ready=true
  41241 tv    speak        text=b8.wav voice=clip
  43101 tv    hush
  43102 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  43102 tv    hush
  45532 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  46945 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46945 tv    clip         src=n34.wav muted=false ready=true
  46945 tv    speak        text=n34.wav voice=clip
  49145 tv    music:paused paused=true
  49145 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  50380 tv    music:paused paused=false
  50380 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  51659 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  51659 tv    clip         src=n35.wav muted=false ready=true
  51659 tv    speak        text=n35.wav voice=clip
  51753 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  51753 tv    clip         src=i25.wav muted=false ready=true
  51753 tv    speak        text=i25.wav voice=clip
  51848 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  51848 tv    clip         src=n45.wav muted=false ready=true
  51848 tv    speak        text=n45.wav voice=clip
  51942 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  51942 tv    clip         src=n33.wav muted=false ready=true
  51942 tv    speak        text=n33.wav voice=clip
  52037 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52037 tv    clip         src=g49.wav muted=false ready=true
  52037 tv    speak        text=g49.wav voice=clip
  52131 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52131 tv    clip         src=b4.wav muted=false ready=true
  52131 tv    speak        text=b4.wav voice=clip
  52225 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52225 tv    clip         src=i20.wav muted=false ready=true
  52225 tv    speak        text=i20.wav voice=clip
  52319 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52319 tv    clip         src=o69.wav muted=false ready=true
  52319 tv    speak        text=o69.wav voice=clip
  52413 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52413 tv    clip         src=o67.wav muted=false ready=true
  52413 tv    speak        text=o67.wav voice=clip
  52508 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52509 tv    clip         src=o65.wav muted=false ready=true
  52509 tv    speak        text=o65.wav voice=clip
  52604 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52604 tv    clip         src=o73.wav muted=false ready=true
  52604 tv    speak        text=o73.wav voice=clip
  52682 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52682 tv    clip         src=i21.wav muted=false ready=true
  52682 tv    speak        text=i21.wav voice=clip
  52761 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52761 tv    clip         src=i18.wav muted=false ready=true
  52761 tv    speak        text=i18.wav voice=clip
  52869 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52869 tv    clip         src=g58.wav muted=false ready=true
  52869 tv    speak        text=g58.wav voice=clip
  52966 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52966 tv    clip         src=n36.wav muted=false ready=true
  52966 tv    speak        text=n36.wav voice=clip
  53058 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  53058 tv    clip         src=o61.wav muted=false ready=true
  53058 tv    speak        text=o61.wav voice=clip
  53152 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  53152 tv    clip         src=n37.wav muted=false ready=true
  53152 tv    speak        text=n37.wav voice=clip
  53250 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  53250 tv    clip         src=i16.wav muted=false ready=true
  53250 tv    speak        text=i16.wav voice=clip
  53342 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  53342 tv    clip         src=g47.wav muted=false ready=true
  53342 tv    speak        text=g47.wav voice=clip
  53434 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  53435 tv    clip         src=n41.wav muted=false ready=true
  53435 tv    speak        text=n41.wav voice=clip
  53530 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  53530 tv    clip         src=b6.wav muted=false ready=true
  53530 tv    speak        text=b6.wav voice=clip
  53623 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  53623 tv    clip         src=o72.wav muted=false ready=true
  53623 tv    speak        text=o72.wav voice=clip
  53701 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  53701 tv    clip         src=b3.wav muted=false ready=true
  53701 tv    speak        text=b3.wav voice=clip
  53795 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  53795 tv    clip         src=i30.wav muted=false ready=true
  53795 tv    speak        text=i30.wav voice=clip
  53888 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  53888 tv    clip         src=g56.wav muted=false ready=true
  53888 tv    speak        text=g56.wav voice=clip
  53983 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  53983 tv    clip         src=o75.wav muted=false ready=true
  53983 tv    speak        text=o75.wav voice=clip
  54077 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54077 tv    clip         src=b1.wav muted=false ready=true
  54077 tv    speak        text=b1.wav voice=clip
  54171 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54171 tv    clip         src=b2.wav muted=false ready=true
  54171 tv    speak        text=b2.wav voice=clip
  54265 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54265 tv    clip         src=n32.wav muted=false ready=true
  54265 tv    speak        text=n32.wav voice=clip
  54360 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54360 tv    clip         src=g48.wav muted=false ready=true
  54360 tv    speak        text=g48.wav voice=clip
  54454 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54454 tv    clip         src=i23.wav muted=false ready=true
  54454 tv    speak        text=i23.wav voice=clip
  54547 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54547 tv    clip         src=i26.wav muted=false ready=true
  54547 tv    speak        text=i26.wav voice=clip
  54640 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54641 tv    clip         src=o66.wav muted=false ready=true
  54641 tv    speak        text=o66.wav voice=clip
  54721 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54722 tv    clip         src=i19.wav muted=false ready=true
  54722 tv    speak        text=i19.wav voice=clip
  54815 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54815 tv    clip         src=n42.wav muted=false ready=true
  54815 tv    speak        text=n42.wav voice=clip
  54905 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54905 tv    clip         src=i24.wav muted=false ready=true
  54905 tv    speak        text=i24.wav voice=clip
  55000 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55000 tv    clip         src=n39.wav muted=false ready=true
  55000 tv    speak        text=n39.wav voice=clip
  55094 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55094 tv    clip         src=g46.wav muted=false ready=true
  55094 tv    speak        text=g46.wav voice=clip
  55679 tv    hush
  55679 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  55679 tv    hush
  58990 tv    music:duck   ms=9000
  58990 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  61778 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  61780 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61780 tv    clip         src=n44.wav muted=false ready=true
  61780 tv    speak        text=n44.wav voice=clip
  64208 tv    ss:cancel    speaking=false pending=false
  64208 tv    music:plan   from=game:bingo to=null
  64208 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  65720 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
  66306 tv    ss:cancel    speaking=false pending=false
  66306 tv    music:plan   from=null to=lobby
  66306 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  69647 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
  69655 tv    ss:cancel    speaking=false pending=false
  69660 tv    music:plan   from=lobby to=game:bingo
  69660 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  69660 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  69665 tv    hush
  69665 tv    hush
  70088 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  70088 tv    clip         src=i21.wav muted=false ready=true
  70088 tv    speak        text=i21.wav voice=clip
  70466 tv    music:stop   track=george-street-shuffle.mp3
  70588 tv    ss:cancel    speaking=false pending=false
  70588 tv    music:plan   from=game:bingo to=null
  70591 tv    ss:cancel    speaking=false pending=false
  70591 tv    music:plan   from=null to=lobby
  70591 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  71399 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":9.2}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
  76159 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  76577 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  76993 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  78090 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
  78678 tv    ss:cancel    speaking=false pending=false
  78682 tv    music:plan   from=lobby to=null
  78682 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  79919 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  80185 tv    music:stop   track=bossa-antigua.mp3
  81512 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  82792 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
  84077 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  85081 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  86132 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  88688 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  88879 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  89066 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  89254 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → reveal sting (mapped), music stops (show)** — cues=phase,phase,reveal playing=[]

```
  90338 tv    ss:cancel    speaking=false pending=false
  90340 tv    ss:cancel    speaking=false pending=false
  90340 tv    music:plan   from=null to=lobby
  90340 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  92358 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
  92363 tv    ss:cancel    speaking=false pending=false
  92365 tv    music:plan   from=lobby to=null
  92365 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  93868 tv    music:stop   track=local-forecast-elevator.mp3
  93913 tv    music:plan   from=null to=game:broken-pencil
  93913 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
  93913 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  95395 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  95873 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  96020 tv    music:plan   from=game:broken-pencil to=null
  96020 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  97531 tv    music:stop   track=hep-cats.mp3
```
