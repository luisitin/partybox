# Audio interaction trace

Captured 2026-09-18T11:54:24.292Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**54 / 54 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:george-street-shuffle
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":4.4}]

```
   1729 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   1755 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3065 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3201 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3902 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4535 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5384 tv    ss:cancel    speaking=false pending=false
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
   6226 tv    music:plan   from=lobby to=null
   6226 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7734 tv    music:stop   track=george-street-shuffle.mp3
   8185 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9471 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16441 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17441 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18440 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19440 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20442 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21244 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22011 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22165 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22319 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22479 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22635 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22792 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22945 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23102 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23256 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23413 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23571 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23717 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23867 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24025 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24187 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24329 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24482 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24638 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24795 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25671 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26001 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27807 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29542 tv    ss:cancel    speaking=false pending=false
  29542 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":1.5}]

```
  31078 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33235 tv    ss:cancel    speaking=false pending=false
  33235 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34781 tv    ss:cancel    speaking=false pending=false
  34781 tv    music:plan   from=null to=lobby
  34781 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:local-forecast-elevator.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+955ms phone@+954ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":19.1}]
- ✅ **play resumes → the next number is spoken** — spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":22.5}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,silence,lock cheer@+5354ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":37}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5409ms cheer@+5365ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=3 lastTickIdx=2
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36339 tv    music:plan   from=lobby to=game:bingo
  36339 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36339 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36645 tv    hush
  36645 tv    hush
  37139 tv    music:stop   track=local-forecast-elevator.mp3
  37256 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38397 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39399 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40397 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41358 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41549 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41549 tv    clip         src=b9.wav muted=false ready=true
  41549 tv    speak        text=b9.wav voice=clip
  43170 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43170 tv    clip         src=b8.wav muted=false ready=true
  43170 tv    speak        text=b8.wav voice=clip
  45001 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45001 tv    clip         src=n34.wav muted=false ready=true
  45001 tv    speak        text=n34.wav voice=clip
  46681 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  46954 tv    hush
  46954 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  46955 tv    hush
  52307 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55496 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  55687 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55687 tv    clip         src=n35.wav muted=false ready=true
  55687 tv    speak        text=n35.wav voice=clip
  57703 tv    music:paused paused=true
  57703 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  58964 tv    music:paused paused=false
  58964 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  65400 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  65400 tv    clip         src=g57.wav muted=false ready=true
  65400 tv    speak        text=g57.wav voice=clip
  65838 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  66128 tv    hush
  66128 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  66128 tv    hush
  68003 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  71482 tv    music:duck   ms=9000
  71482 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  71535 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  71535 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  76302 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  76634 tv    hush
  76635 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  76635 tv    hush
  77638 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  78636 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  79832 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  79832 tv    clip         src=g57.wav muted=false ready=true
  79832 tv    speak        text=g57.wav voice=clip
  81941 tv    ss:cancel    speaking=false pending=false
  81941 tv    music:plan   from=game:bingo to=null
  81944 tv    ss:cancel    speaking=false pending=false
  81944 tv    music:plan   from=null to=lobby
  81944 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  82744 tv    music:stop   track=wallpaper.mp3
  84467 tv    ss:cancel    speaking=false pending=false
  84476 tv    music:plan   from=lobby to=game:bingo
  84476 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  84476 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  84480 tv    hush
  84480 tv    hush
  85096 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  85277 tv    music:stop   track=airport-lounge.mp3
  92109 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  92109 tv    clip         src=b14.wav muted=false ready=true
  92109 tv    speak        text=b14.wav voice=clip
  93130 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  93400 tv    hush
  93400 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  93400 tv    hush
 101016 tv    music:duck   ms=9000
 101016 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 101028 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 106018 tv    hush
 106018 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 106019 tv    hush
 110020 tv    ss:cancel    speaking=false pending=false
 110020 tv    music:plan   from=game:bingo to=null
 110020 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 111521 tv    music:stop   track=wallpaper.mp3
 111591 tv    ss:cancel    speaking=false pending=false
 111591 tv    music:plan   from=null to=lobby
 111591 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 114107 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 114116 tv    ss:cancel    speaking=false pending=false
 114118 tv    music:plan   from=lobby to=game:bingo
 114118 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 114118 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 114121 tv    hush
 114122 tv    hush
 114733 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 114919 tv    music:stop   track=george-street-shuffle.mp3
 116123 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 116259 tv    ss:cancel    speaking=false pending=false
 116259 tv    music:plan   from=game:bingo to=null
 116259 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 117760 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 118357 tv    ss:cancel    speaking=false pending=false
 118357 tv    music:plan   from=null to=lobby
 118357 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 121707 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 121719 tv    ss:cancel    speaking=false pending=false
 121724 tv    music:plan   from=lobby to=game:bingo
 121725 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 121725 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 121728 tv    hush
 121729 tv    hush
 122152 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 122343 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 122343 tv    clip         src=i21.wav muted=false ready=true
 122344 tv    speak        text=i21.wav voice=clip
 122525 tv    music:stop   track=local-forecast-elevator.mp3
 122655 tv    ss:cancel    speaking=false pending=false
 122655 tv    music:plan   from=game:bingo to=null
 122658 tv    ss:cancel    speaking=false pending=false
 122658 tv    music:plan   from=null to=lobby
 122659 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 123460 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 128210 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 128649 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 129083 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 129509 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 129942 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 130991 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 131595 tv    ss:cancel    speaking=false pending=false
 131601 tv    music:plan   from=lobby to=null
 131601 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 132835 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 133103 tv    music:stop   track=george-street-shuffle.mp3
 134430 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 135731 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 137034 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 138051 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 139114 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 141672 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141857 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 142017 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 142212 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 143288 tv    ss:cancel    speaking=false pending=false
 143290 tv    ss:cancel    speaking=false pending=false
 143290 tv    music:plan   from=null to=lobby
 143290 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 145305 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 145312 tv    ss:cancel    speaking=false pending=false
 145314 tv    music:plan   from=lobby to=null
 145314 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 146815 tv    music:stop   track=local-forecast-elevator.mp3
 146853 tv    music:plan   from=null to=game:broken-pencil
 146853 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 146853 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 148345 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 148821 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 148976 tv    music:plan   from=game:broken-pencil to=null
 148976 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 150477 tv    music:stop   track=backbay-lounge.mp3
```
