# Audio interaction trace

Captured 2026-09-18T02:40:19.352Z on port 42126. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**45 / 45 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:bossa-antigua
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":4.4}]

```
   1859 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   1896 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3213 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3351 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   4053 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4682 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5518 tv    ss:cancel    speaking=false pending=false
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
   6359 tv    music:plan   from=lobby to=null
   6359 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7860 tv    music:stop   track=bossa-antigua.mp3
   8292 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9567 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16556 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17543 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18548 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19552 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20555 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21364 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22163 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22320 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22478 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22635 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22790 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22951 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23104 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23260 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23417 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23574 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23728 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23883 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24039 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24194 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24350 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24492 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24648 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24789 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24945 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25822 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26148 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27952 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29689 tv    ss:cancel    speaking=false pending=false
  29689 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31243 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33395 tv    ss:cancel    speaking=false pending=false
  33395 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34944 tv    ss:cancel    speaking=false pending=false
  34944 tv    music:plan   from=null to=lobby
  34944 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":15.4}]
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":18.8}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer cheer@+5355ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":30.9}]
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=lock,silence,call spoken=o72.wav
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36510 tv    music:plan   from=lobby to=game:bingo
  36511 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36511 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36814 tv    hush
  36815 tv    hush
  37311 tv    music:stop   track=airport-lounge.mp3
  39566 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39566 tv    clip         src=b9.wav muted=false ready=true
  39566 tv    speak        text=b9.wav voice=clip
  41398 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41398 tv    clip         src=b8.wav muted=false ready=true
  41398 tv    speak        text=b8.wav voice=clip
  43520 tv    hush
  43520 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  43520 tv    hush
  48873 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  52067 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52068 tv    clip         src=n34.wav muted=false ready=true
  52068 tv    speak        text=n34.wav voice=clip
  54262 tv    music:paused paused=true
  54262 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  55511 tv    music:paused paused=false
  55511 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  56783 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56783 tv    clip         src=n35.wav muted=false ready=true
  56783 tv    speak        text=n35.wav voice=clip
  56909 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  56909 tv    clip         src=i25.wav muted=false ready=true
  56909 tv    speak        text=i25.wav voice=clip
  57033 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57034 tv    clip         src=n45.wav muted=false ready=true
  57034 tv    speak        text=n45.wav voice=clip
  57159 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57159 tv    clip         src=n33.wav muted=false ready=true
  57159 tv    speak        text=n33.wav voice=clip
  57284 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57284 tv    clip         src=g49.wav muted=false ready=true
  57284 tv    speak        text=g49.wav voice=clip
  57410 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57410 tv    clip         src=b4.wav muted=false ready=true
  57410 tv    speak        text=b4.wav voice=clip
  57538 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57538 tv    clip         src=i20.wav muted=false ready=true
  57538 tv    speak        text=i20.wav voice=clip
  57663 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57663 tv    clip         src=o69.wav muted=false ready=true
  57663 tv    speak        text=o69.wav voice=clip
  57789 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57789 tv    clip         src=o67.wav muted=false ready=true
  57789 tv    speak        text=o67.wav voice=clip
  57913 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  57913 tv    clip         src=o65.wav muted=false ready=true
  57913 tv    speak        text=o65.wav voice=clip
  58038 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58038 tv    clip         src=o73.wav muted=false ready=true
  58038 tv    speak        text=o73.wav voice=clip
  58164 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58164 tv    clip         src=i21.wav muted=false ready=true
  58164 tv    speak        text=i21.wav voice=clip
  58290 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58290 tv    clip         src=i18.wav muted=false ready=true
  58290 tv    speak        text=i18.wav voice=clip
  58415 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58415 tv    clip         src=g58.wav muted=false ready=true
  58415 tv    speak        text=g58.wav voice=clip
  58541 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58541 tv    clip         src=n36.wav muted=false ready=true
  58541 tv    speak        text=n36.wav voice=clip
  58667 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58668 tv    clip         src=o61.wav muted=false ready=true
  58668 tv    speak        text=o61.wav voice=clip
  58777 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58777 tv    clip         src=n37.wav muted=false ready=true
  58777 tv    speak        text=n37.wav voice=clip
  58903 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58903 tv    clip         src=i16.wav muted=false ready=true
  58903 tv    speak        text=i16.wav voice=clip
  59028 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  59028 tv    clip         src=g47.wav muted=false ready=true
  59028 tv    speak        text=g47.wav voice=clip
  59152 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  59153 tv    clip         src=n41.wav muted=false ready=true
  59153 tv    speak        text=n41.wav voice=clip
  59279 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  59279 tv    clip         src=b6.wav muted=false ready=true
  59279 tv    speak        text=b6.wav voice=clip
  59406 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  59406 tv    clip         src=o72.wav muted=false ready=true
  59406 tv    speak        text=o72.wav voice=clip
  60260 tv    hush
  60260 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  60260 tv    hush
  62134 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  65615 tv    music:duck   ms=9000
  65615 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  70363 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  70370 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  70687 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  70687 tv    clip         src=o72.wav muted=false ready=true
  70687 tv    speak        text=o72.wav voice=clip
  74824 tv    ss:cancel    speaking=false pending=false
  74824 tv    music:plan   from=game:bingo to=null
  74824 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  76325 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
  76941 tv    ss:cancel    speaking=false pending=false
  76941 tv    music:plan   from=null to=lobby
  76941 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  80279 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
  80289 tv    ss:cancel    speaking=false pending=false
  80295 tv    music:plan   from=lobby to=game:bingo
  80295 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  80295 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  80300 tv    hush
  80300 tv    hush
  80722 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  80722 tv    clip         src=i21.wav muted=false ready=true
  80722 tv    speak        text=i21.wav voice=clip
  81097 tv    music:stop   track=bossa-antigua.mp3
  81222 tv    ss:cancel    speaking=false pending=false
  81222 tv    music:plan   from=game:bingo to=null
  81226 tv    ss:cancel    speaking=false pending=false
  81226 tv    music:plan   from=null to=lobby
  81226 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  82026 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":9.2}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
  86776 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  87209 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  87625 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
  88708 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
  89293 tv    ss:cancel    speaking=false pending=false
  89295 tv    music:plan   from=lobby to=null
  89295 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  90538 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  90795 tv    music:stop   track=bossa-antigua.mp3
  92144 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  93428 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
  94729 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  95751 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  96811 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  99374 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  99560 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  99749 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  99935 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"lobby-time.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 101038 tv    ss:cancel    speaking=false pending=false
 101041 tv    ss:cancel    speaking=false pending=false
 101041 tv    music:plan   from=null to=lobby
 101041 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 103065 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 103080 tv    ss:cancel    speaking=false pending=false
 103084 tv    music:plan   from=lobby to=null
 103084 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 104585 tv    music:stop   track=george-street-shuffle.mp3
 104625 tv    music:plan   from=null to=game:broken-pencil
 104625 tv    music:start  plan=game:broken-pencil track=lobby-time mode=chain volume=0.2
 104625 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 106129 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 106577 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 106732 tv    music:plan   from=game:broken-pencil to=null
 106732 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 108238 tv    music:stop   track=lobby-time.mp3
```
