# Audio interaction trace

Captured 2026-09-18T10:31:10.150Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**52 / 52 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.4}]

```
   1760 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1785 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3115 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3251 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3950 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4582 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5418 tv    ss:cancel    speaking=false pending=false
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
   6271 tv    music:plan   from=lobby to=null
   6271 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7774 tv    music:stop   track=local-forecast-elevator.mp3
   8211 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9500 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16471 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17471 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18473 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19469 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20468 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21288 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22080 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22238 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22392 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22547 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22702 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22861 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23017 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23171 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23327 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23485 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23642 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23802 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23956 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24114 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24270 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24424 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24581 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24727 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24880 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25761 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26085 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27890 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29608 tv    ss:cancel    speaking=false pending=false
  29608 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31145 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33282 tv    ss:cancel    speaking=false pending=false
  33282 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34829 tv    ss:cancel    speaking=false pending=false
  34829 tv    music:plan   from=null to=lobby
  34829 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro counts down: three ticks (3 · 2 · 1), then the first call** — cues=tick,tick,tick,phase,call
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":19}]
- ✅ **play resumes → the next number is spoken** — spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":22.5}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,silence,lock cheer@+5355ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":36.9}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5411ms cheer@+5366ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=silence,phase,call spoken=g57.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36385 tv    music:plan   from=lobby to=game:bingo
  36385 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36385 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36690 tv    hush
  36690 tv    hush
  37186 tv    music:stop   track=airport-lounge.mp3
  38443 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39442 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40442 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41387 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41578 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41579 tv    clip         src=b9.wav muted=false ready=true
  41579 tv    speak        text=b9.wav voice=clip
  43211 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43211 tv    clip         src=b8.wav muted=false ready=true
  43211 tv    speak        text=b8.wav voice=clip
  45044 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45044 tv    clip         src=n34.wav muted=false ready=true
  45044 tv    speak        text=n34.wav voice=clip
  46731 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  46992 tv    hush
  46992 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  46992 tv    hush
  52346 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55535 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  55727 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55727 tv    clip         src=n35.wav muted=false ready=true
  55727 tv    speak        text=n35.wav voice=clip
  57715 tv    music:paused paused=true
  57715 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  58964 tv    music:paused paused=false
  58964 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  65389 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  65389 tv    clip         src=g57.wav muted=false ready=true
  65389 tv    speak        text=g57.wav voice=clip
  65795 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  66076 tv    hush
  66076 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  66076 tv    hush
  67948 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  71431 tv    music:duck   ms=9000
  71431 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  71483 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  71483 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  76235 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  76559 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  76755 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  76755 tv    clip         src=g57.wav muted=false ready=true
  76755 tv    speak        text=g57.wav voice=clip
  80158 tv    ss:cancel    speaking=false pending=false
  80158 tv    music:plan   from=game:bingo to=null
  80160 tv    ss:cancel    speaking=false pending=false
  80160 tv    music:plan   from=null to=lobby
  80160 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  80961 tv    music:stop   track=wallpaper.mp3
  82683 tv    ss:cancel    speaking=false pending=false
  82693 tv    music:plan   from=lobby to=game:bingo
  82693 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  82693 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  82696 tv    hush
  82696 tv    hush
  83309 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  83493 tv    music:stop   track=airport-lounge.mp3
  90289 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  90289 tv    clip         src=b14.wav muted=false ready=true
  90290 tv    speak        text=b14.wav voice=clip
  91350 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  91616 tv    hush
  91617 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  91617 tv    hush
  99227 tv    music:duck   ms=9000
  99227 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  99240 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 104239 tv    hush
 104240 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 104240 tv    hush
 108236 tv    ss:cancel    speaking=false pending=false
 108236 tv    music:plan   from=game:bingo to=null
 108236 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 109737 tv    music:stop   track=wallpaper.mp3
 109823 tv    ss:cancel    speaking=false pending=false
 109823 tv    music:plan   from=null to=lobby
 109823 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 112342 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 112350 tv    ss:cancel    speaking=false pending=false
 112352 tv    music:plan   from=lobby to=game:bingo
 112352 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 112352 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 112355 tv    hush
 112356 tv    hush
 113152 tv    music:stop   track=local-forecast-elevator.mp3
 114357 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 114499 tv    ss:cancel    speaking=false pending=false
 114499 tv    music:plan   from=game:bingo to=null
 114499 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 115999 tv    music:stop   track=cool-vibes.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 116606 tv    ss:cancel    speaking=false pending=false
 116606 tv    music:plan   from=null to=lobby
 116606 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 119956 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 119964 tv    ss:cancel    speaking=false pending=false
 119966 tv    music:plan   from=lobby to=game:bingo
 119966 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 119966 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 119970 tv    hush
 119970 tv    hush
 120368 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 120559 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 120559 tv    clip         src=i21.wav muted=false ready=true
 120559 tv    speak        text=i21.wav voice=clip
 120767 tv    music:stop   track=airport-lounge.mp3
 120857 tv    ss:cancel    speaking=false pending=false
 120857 tv    music:plan   from=game:bingo to=null
 120860 tv    ss:cancel    speaking=false pending=false
 120860 tv    music:plan   from=null to=lobby
 120861 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 121662 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 126409 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 126849 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 127297 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 127726 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 128161 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 129224 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 129826 tv    ss:cancel    speaking=false pending=false
 129827 tv    music:plan   from=lobby to=null
 129827 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 131062 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 131327 tv    music:stop   track=george-street-shuffle.mp3
 132663 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 133959 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 135261 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 136273 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 137299 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 139862 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 140054 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140242 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 140433 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 141538 tv    ss:cancel    speaking=false pending=false
 141540 tv    ss:cancel    speaking=false pending=false
 141540 tv    music:plan   from=null to=lobby
 141540 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 143555 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 143564 tv    ss:cancel    speaking=false pending=false
 143566 tv    music:plan   from=lobby to=null
 143566 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 145066 tv    music:stop   track=bossa-antigua.mp3
 145101 tv    music:plan   from=null to=game:broken-pencil
 145101 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 145101 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 146579 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 147054 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 147208 tv    music:plan   from=game:broken-pencil to=null
 147208 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 148710 tv    music:stop   track=hep-cats.mp3
```
