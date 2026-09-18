# Audio interaction trace

Captured 2026-09-18T11:45:37.354Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**53 / 53 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.4}]

```
   1744 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1769 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3097 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3216 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3923 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4551 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5400 tv    ss:cancel    speaking=false pending=false
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
   6245 tv    music:plan   from=lobby to=null
   6245 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7750 tv    music:stop   track=local-forecast-elevator.mp3
   8196 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9467 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16457 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17456 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18455 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19456 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20457 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21248 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22055 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22216 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22371 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22528 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22687 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22842 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22997 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23154 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23309 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23468 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23622 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23778 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23933 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24093 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24249 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24405 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24562 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24723 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24877 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25760 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26081 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27887 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29612 tv    ss:cancel    speaking=false pending=false
  29612 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31160 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33301 tv    ss:cancel    speaking=false pending=false
  33302 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34862 tv    ss:cancel    speaking=false pending=false
  34862 tv    music:plan   from=null to=lobby
  34862 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":3}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+956ms phone@+964ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":19}]
- ✅ **play resumes → the next number is spoken** — spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":22.5}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,lock cheer@+5355ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":37}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5401ms cheer@+5366ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36426 tv    music:plan   from=lobby to=game:bingo
  36426 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36426 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36732 tv    hush
  36732 tv    hush
  37227 tv    music:stop   track=airport-lounge.mp3
  37345 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38484 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39485 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40484 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41442 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41633 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41633 tv    clip         src=b9.wav muted=false ready=true
  41633 tv    speak        text=b9.wav voice=clip
  43259 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43259 tv    clip         src=b8.wav muted=false ready=true
  43259 tv    speak        text=b8.wav voice=clip
  45095 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45095 tv    clip         src=n34.wav muted=false ready=true
  45095 tv    speak        text=n34.wav voice=clip
  46765 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47034 tv    hush
  47034 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47034 tv    hush
  52390 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55569 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  55759 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55759 tv    clip         src=n35.wav muted=false ready=true
  55759 tv    speak        text=n35.wav voice=clip
  57762 tv    music:paused paused=true
  57762 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  59030 tv    music:paused paused=false
  59030 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  65478 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  65478 tv    clip         src=g57.wav muted=false ready=true
  65478 tv    speak        text=g57.wav voice=clip
  65917 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  66195 tv    hush
  66195 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  66196 tv    hush
  68070 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  71550 tv    music:duck   ms=9000
  71550 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  71599 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  76351 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  76686 tv    hush
  76686 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  76686 tv    hush
  77687 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  78688 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  79878 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  79878 tv    clip         src=g57.wav muted=false ready=true
  79878 tv    speak        text=g57.wav voice=clip
  81989 tv    ss:cancel    speaking=false pending=false
  81989 tv    music:plan   from=game:bingo to=null
  81992 tv    ss:cancel    speaking=false pending=false
  81992 tv    music:plan   from=null to=lobby
  81992 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  82793 tv    music:stop   track=wallpaper.mp3
  84517 tv    ss:cancel    speaking=false pending=false
  84529 tv    music:plan   from=lobby to=game:bingo
  84529 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  84529 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  84532 tv    hush
  84533 tv    hush
  85145 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  85330 tv    music:stop   track=local-forecast-elevator.mp3
  91424 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  91424 tv    clip         src=g59.wav muted=false ready=true
  91424 tv    speak        text=g59.wav voice=clip
  92477 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  92743 tv    hush
  92743 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  92743 tv    hush
 100347 tv    music:duck   ms=9000
 100347 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 100361 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 105353 tv    hush
 105354 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 105354 tv    hush
 109353 tv    ss:cancel    speaking=false pending=false
 109353 tv    music:plan   from=game:bingo to=null
 109353 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 110853 tv    music:stop   track=wallpaper.mp3
 110955 tv    ss:cancel    speaking=false pending=false
 110955 tv    music:plan   from=null to=lobby
 110955 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 113477 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 113486 tv    ss:cancel    speaking=false pending=false
 113488 tv    music:plan   from=lobby to=game:bingo
 113488 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 113488 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 113492 tv    hush
 113492 tv    hush
 114104 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 114289 tv    music:stop   track=george-street-shuffle.mp3
 115494 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 115643 tv    ss:cancel    speaking=false pending=false
 115643 tv    music:plan   from=game:bingo to=null
 115643 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 117144 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 117756 tv    ss:cancel    speaking=false pending=false
 117756 tv    music:plan   from=null to=lobby
 117756 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 121101 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 121112 tv    ss:cancel    speaking=false pending=false
 121114 tv    music:plan   from=lobby to=game:bingo
 121114 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 121115 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 121119 tv    hush
 121120 tv    hush
 121544 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 121735 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 121735 tv    clip         src=i21.wav muted=false ready=true
 121735 tv    speak        text=i21.wav voice=clip
 121916 tv    music:stop   track=bossa-antigua.mp3
 122040 tv    ss:cancel    speaking=false pending=false
 122040 tv    music:plan   from=game:bingo to=null
 122043 tv    ss:cancel    speaking=false pending=false
 122043 tv    music:plan   from=null to=lobby
 122043 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 122844 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 127609 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 128041 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 128460 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 128894 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 129325 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 130373 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 130984 tv    ss:cancel    speaking=false pending=false
 130990 tv    music:plan   from=lobby to=null
 130990 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 132210 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 132491 tv    music:stop   track=bossa-antigua.mp3
 133809 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 135110 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 136417 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 137418 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 138472 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 141031 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141219 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 141408 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141595 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 142687 tv    ss:cancel    speaking=false pending=false
 142689 tv    ss:cancel    speaking=false pending=false
 142689 tv    music:plan   from=null to=lobby
 142689 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 144702 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 144709 tv    ss:cancel    speaking=false pending=false
 144711 tv    music:plan   from=lobby to=null
 144711 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 146212 tv    music:stop   track=local-forecast-elevator.mp3
 146250 tv    music:plan   from=null to=game:broken-pencil
 146250 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 146250 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 147734 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 148204 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 148358 tv    music:plan   from=game:broken-pencil to=null
 148358 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 149860 tv    music:stop   track=hep-cats.mp3
```
