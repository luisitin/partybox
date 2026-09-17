# Audio interaction trace

Captured 2026-09-16T23:53:08.066Z on port 42145. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**45 / 45 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.4}]

```
   1757 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1757 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3071 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3201 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3887 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4520 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5355 tv    ss:cancel    speaking=false pending=false
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
   6201 tv    music:plan   from=lobby to=null
   6201 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7705 tv    music:stop   track=local-forecast-elevator.mp3
   8150 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9439 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16412 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17411 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18405 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19409 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20409 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21215 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  21995 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22156 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22311 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22451 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22590 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22743 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22901 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23060 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23213 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23371 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23525 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23686 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23837 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23995 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24148 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24308 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24447 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24604 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24763 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25635 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  25976 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27779 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29509 tv    ss:cancel    speaking=false pending=false
  29509 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31067 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33253 tv    ss:cancel    speaking=false pending=false
  33253 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34821 tv    ss:cancel    speaking=false pending=false
  34821 tv    music:plan   from=null to=lobby
  34821 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
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
- ✅ **BINGO → caller hushed, sweep as the line turns, cheer once at the verdict (~4.4 s), no chime on entry, music continues** — cues=silence,sweep,cheer cheer@+3511ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":26.5}]
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going → play resumes, next number spoken, no start/phase chime** — cues=lock,call spoken=b11.wav
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36384 tv    music:plan   from=lobby to=game:bingo
  36384 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36385 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36689 tv    hush
  36689 tv    hush
  37188 tv    music:stop   track=airport-lounge.mp3
  39451 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39451 tv    clip         src=b9.wav muted=false ready=true
  39451 tv    speak        text=b9.wav voice=clip
  41283 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41283 tv    clip         src=b8.wav muted=false ready=true
  41283 tv    speak        text=b8.wav voice=clip
  43155 tv    hush
  43155 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  43155 tv    hush
  46661 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  49188 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  49188 tv    clip         src=n34.wav muted=false ready=true
  49188 tv    speak        text=n34.wav voice=clip
  51406 tv    music:paused paused=true
  51406 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  52651 tv    music:paused paused=false
  52652 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  53941 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  53942 tv    clip         src=n35.wav muted=false ready=true
  53942 tv    speak        text=n35.wav voice=clip
  54048 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54048 tv    clip         src=i25.wav muted=false ready=true
  54048 tv    speak        text=i25.wav voice=clip
  54142 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54142 tv    clip         src=n45.wav muted=false ready=true
  54142 tv    speak        text=n45.wav voice=clip
  54236 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54237 tv    clip         src=n33.wav muted=false ready=true
  54237 tv    speak        text=n33.wav voice=clip
  54330 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54330 tv    clip         src=g49.wav muted=false ready=true
  54330 tv    speak        text=g49.wav voice=clip
  54425 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54425 tv    clip         src=b4.wav muted=false ready=true
  54425 tv    speak        text=b4.wav voice=clip
  54518 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54518 tv    clip         src=i20.wav muted=false ready=true
  54518 tv    speak        text=i20.wav voice=clip
  54610 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54610 tv    clip         src=o69.wav muted=false ready=true
  54610 tv    speak        text=o69.wav voice=clip
  54705 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54706 tv    clip         src=o67.wav muted=false ready=true
  54706 tv    speak        text=o67.wav voice=clip
  54798 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54798 tv    clip         src=o65.wav muted=false ready=true
  54798 tv    speak        text=o65.wav voice=clip
  54892 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54892 tv    clip         src=o73.wav muted=false ready=true
  54892 tv    speak        text=o73.wav voice=clip
  54987 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  54987 tv    clip         src=i21.wav muted=false ready=true
  54987 tv    speak        text=i21.wav voice=clip
  55082 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55082 tv    clip         src=i18.wav muted=false ready=true
  55082 tv    speak        text=i18.wav voice=clip
  55175 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55175 tv    clip         src=g58.wav muted=false ready=true
  55175 tv    speak        text=g58.wav voice=clip
  55254 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55254 tv    clip         src=n36.wav muted=false ready=true
  55254 tv    speak        text=n36.wav voice=clip
  55361 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55361 tv    clip         src=o61.wav muted=false ready=true
  55361 tv    speak        text=o61.wav voice=clip
  55440 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55440 tv    clip         src=n37.wav muted=false ready=true
  55440 tv    speak        text=n37.wav voice=clip
  55548 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55548 tv    clip         src=i16.wav muted=false ready=true
  55548 tv    speak        text=i16.wav voice=clip
  55628 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55628 tv    clip         src=g47.wav muted=false ready=true
  55628 tv    speak        text=g47.wav voice=clip
  55721 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55721 tv    clip         src=n41.wav muted=false ready=true
  55721 tv    speak        text=n41.wav voice=clip
  55815 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55815 tv    clip         src=b6.wav muted=false ready=true
  55815 tv    speak        text=b6.wav voice=clip
  55909 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55909 tv    clip         src=o72.wav muted=false ready=true
  55909 tv    speak        text=o72.wav voice=clip
  56004 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56004 tv    clip         src=b3.wav muted=false ready=true
  56004 tv    speak        text=b3.wav voice=clip
  56099 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56099 tv    clip         src=i30.wav muted=false ready=true
  56099 tv    speak        text=i30.wav voice=clip
  56192 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56192 tv    clip         src=g56.wav muted=false ready=true
  56192 tv    speak        text=g56.wav voice=clip
  56287 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56287 tv    clip         src=o75.wav muted=false ready=true
  56287 tv    speak        text=o75.wav voice=clip
  56378 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56378 tv    clip         src=b1.wav muted=false ready=true
  56378 tv    speak        text=b1.wav voice=clip
  56473 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56473 tv    clip         src=b2.wav muted=false ready=true
  56473 tv    speak        text=b2.wav voice=clip
  56566 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56567 tv    clip         src=n32.wav muted=false ready=true
  56567 tv    speak        text=n32.wav voice=clip
  56675 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56675 tv    clip         src=g48.wav muted=false ready=true
  56675 tv    speak        text=g48.wav voice=clip
  56772 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56772 tv    clip         src=i23.wav muted=false ready=true
  56772 tv    speak        text=i23.wav voice=clip
  56865 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56865 tv    clip         src=i26.wav muted=false ready=true
  56865 tv    speak        text=i26.wav voice=clip
  56973 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56973 tv    clip         src=o66.wav muted=false ready=true
  56973 tv    speak        text=o66.wav voice=clip
  57065 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57065 tv    clip         src=i19.wav muted=false ready=true
  57065 tv    speak        text=i19.wav voice=clip
  57159 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57159 tv    clip         src=n42.wav muted=false ready=true
  57159 tv    speak        text=n42.wav voice=clip
  57237 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57237 tv    clip         src=i24.wav muted=false ready=true
  57237 tv    speak        text=i24.wav voice=clip
  57332 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57332 tv    clip         src=n39.wav muted=false ready=true
  57332 tv    speak        text=n39.wav voice=clip
  57423 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57424 tv    clip         src=g46.wav muted=false ready=true
  57424 tv    speak        text=g46.wav voice=clip
  57518 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57518 tv    clip         src=n44.wav muted=false ready=true
  57518 tv    speak        text=n44.wav voice=clip
  57597 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57597 tv    clip         src=b15.wav muted=false ready=true
  57597 tv    speak        text=b15.wav voice=clip
  58173 tv    hush
  58173 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  58173 tv    hush
  59051 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  61684 tv    music:duck   ms=9000
  61684 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  65768 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  65770 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  65770 tv    clip         src=b11.wav muted=false ready=true
  65770 tv    speak        text=b11.wav voice=clip
  68198 tv    ss:cancel    speaking=false pending=false
  68198 tv    music:plan   from=game:bingo to=null
  68198 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  69702 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
  70295 tv    ss:cancel    speaking=false pending=false
  70295 tv    music:plan   from=null to=lobby
  70295 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  73641 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
  73652 tv    ss:cancel    speaking=false pending=false
  73653 tv    music:plan   from=lobby to=game:bingo
  73654 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  73654 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  73657 tv    hush
  73657 tv    hush
  74069 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  74069 tv    clip         src=i21.wav muted=false ready=true
  74069 tv    speak        text=i21.wav voice=clip
  74457 tv    music:stop   track=airport-lounge.mp3
  74579 tv    ss:cancel    speaking=false pending=false
  74579 tv    music:plan   from=game:bingo to=null
  74581 tv    ss:cancel    speaking=false pending=false
  74581 tv    music:plan   from=null to=lobby
  74581 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  75390 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":9.2}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
  80150 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  80565 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  80999 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  82064 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
  82651 tv    ss:cancel    speaking=false pending=false
  82654 tv    music:plan   from=lobby to=null
  82654 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  83900 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  84160 tv    music:stop   track=george-street-shuffle.mp3
  85500 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  86783 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
  88067 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  89088 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  90120 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  92671 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  92858 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  93046 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  93232 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → reveal sting (mapped), music stops (show)** — cues=phase,phase,reveal playing=[]

```
  94329 tv    ss:cancel    speaking=false pending=false
  94331 tv    ss:cancel    speaking=false pending=false
  94331 tv    music:plan   from=null to=lobby
  94331 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  96341 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
  96349 tv    ss:cancel    speaking=false pending=false
  96351 tv    music:plan   from=lobby to=null
  96351 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  97855 tv    music:stop   track=bossa-antigua.mp3
  97907 tv    music:plan   from=null to=game:broken-pencil
  97907 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
  97907 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  99392 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  99862 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 100017 tv    music:plan   from=game:broken-pencil to=null
 100017 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 101519 tv    music:stop   track=backbay-lounge.mp3
```
