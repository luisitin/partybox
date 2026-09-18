# Audio interaction trace

Captured 2026-09-18T12:55:16.673Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**54 / 54 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:george-street-shuffle
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":4.4}]

```
   1759 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   1784 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3097 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3232 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3936 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4549 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
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
   6244 tv    music:plan   from=lobby to=null
   6244 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7749 tv    music:stop   track=george-street-shuffle.mp3
   8195 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9485 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16456 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17455 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18456 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19457 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20457 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21255 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22045 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22205 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22359 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22516 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22676 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22831 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22987 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23143 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23316 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23476 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23635 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23788 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23942 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24102 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24258 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24431 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24586 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24744 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24902 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25781 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26106 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27914 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29639 tv    ss:cancel    speaking=false pending=false
  29639 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31176 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33327 tv    ss:cancel    speaking=false pending=false
  33327 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34879 tv    ss:cancel    speaking=false pending=false
  34879 tv    music:plan   from=null to=lobby
  34879 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+958ms phone@+974ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":25}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,lock cheer@+5354ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.5}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5405ms cheer@+5366ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=3 lastTickIdx=2
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36440 tv    music:plan   from=lobby to=game:bingo
  36440 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36440 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36744 tv    hush
  36745 tv    hush
  37241 tv    music:stop   track=airport-lounge.mp3
  37356 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38497 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39496 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40497 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41446 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41636 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41636 tv    clip         src=b9.wav muted=false ready=true
  41636 tv    speak        text=b9.wav voice=clip
  43279 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43279 tv    clip         src=b8.wav muted=false ready=true
  43279 tv    speak        text=b8.wav voice=clip
  45112 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45113 tv    clip         src=n34.wav muted=false ready=true
  45113 tv    speak        text=n34.wav voice=clip
  46796 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47066 tv    hush
  47066 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47067 tv    hush
  52418 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55420 tv    hush
  55420 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  55420 tv    hush
  56421 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57421 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58620 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58620 tv    clip         src=n35.wav muted=false ready=true
  58620 tv    speak        text=n35.wav voice=clip
  60231 tv    music:paused paused=true
  60231 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61480 tv    music:paused paused=false
  61481 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  67993 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  67993 tv    clip         src=g57.wav muted=false ready=true
  67993 tv    speak        text=g57.wav voice=clip
  68435 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68731 tv    hush
  68731 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68731 tv    hush
  70604 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  74085 tv    music:duck   ms=9000
  74085 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  74132 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  78869 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79195 tv    hush
  79196 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  79196 tv    hush
  80198 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81198 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82397 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  82397 tv    clip         src=g57.wav muted=false ready=true
  82397 tv    speak        text=g57.wav voice=clip
  84506 tv    ss:cancel    speaking=false pending=false
  84506 tv    music:plan   from=game:bingo to=null
  84509 tv    ss:cancel    speaking=false pending=false
  84509 tv    music:plan   from=null to=lobby
  84509 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  85310 tv    music:stop   track=wallpaper.mp3
  87034 tv    ss:cancel    speaking=false pending=false
  87044 tv    music:plan   from=lobby to=game:bingo
  87044 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  87045 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  87048 tv    hush
  87048 tv    hush
  87649 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  87849 tv    music:stop   track=george-street-shuffle.mp3
  94641 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  94641 tv    clip         src=b14.wav muted=false ready=true
  94641 tv    speak        text=b14.wav voice=clip
  95694 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95957 tv    hush
  95957 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95958 tv    hush
 103562 tv    music:duck   ms=9000
 103562 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 103575 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 108568 tv    hush
 108568 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108569 tv    hush
 112576 tv    ss:cancel    speaking=false pending=false
 112577 tv    music:plan   from=game:bingo to=null
 112577 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 114078 tv    music:stop   track=cool-vibes.mp3
 114154 tv    ss:cancel    speaking=false pending=false
 114154 tv    music:plan   from=null to=lobby
 114154 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 116675 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 116682 tv    ss:cancel    speaking=false pending=false
 116684 tv    music:plan   from=lobby to=game:bingo
 116684 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116684 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116688 tv    hush
 116688 tv    hush
 117298 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117485 tv    music:stop   track=airport-lounge.mp3
 118690 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 118825 tv    ss:cancel    speaking=false pending=false
 118825 tv    music:plan   from=game:bingo to=null
 118825 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 120326 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 120939 tv    ss:cancel    speaking=false pending=false
 120939 tv    music:plan   from=null to=lobby
 120939 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 124297 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 124327 tv    ss:cancel    speaking=false pending=false
 124329 tv    music:plan   from=lobby to=game:bingo
 124329 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 124329 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 124332 tv    hush
 124333 tv    hush
 124762 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 124954 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124954 tv    clip         src=i21.wav muted=false ready=true
 124954 tv    speak        text=i21.wav voice=clip
 125129 tv    music:stop   track=bossa-antigua.mp3
 125255 tv    ss:cancel    speaking=false pending=false
 125255 tv    music:plan   from=game:bingo to=null
 125258 tv    ss:cancel    speaking=false pending=false
 125258 tv    music:plan   from=null to=lobby
 125258 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 126060 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"airport-lounge.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 130810 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131247 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131679 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132112 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132544 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 133609 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 134208 tv    ss:cancel    speaking=false pending=false
 134213 tv    music:plan   from=lobby to=null
 134213 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 135440 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135714 tv    music:stop   track=airport-lounge.mp3
 137036 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 138345 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 139631 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140653 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141710 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144268 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144459 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144648 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144836 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 145920 tv    ss:cancel    speaking=false pending=false
 145923 tv    ss:cancel    speaking=false pending=false
 145923 tv    music:plan   from=null to=lobby
 145923 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 147956 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 147970 tv    ss:cancel    speaking=false pending=false
 147978 tv    music:plan   from=lobby to=null
 147978 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149480 tv    music:stop   track=george-street-shuffle.mp3
 149525 tv    music:plan   from=null to=game:broken-pencil
 149525 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 149525 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151005 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151476 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151633 tv    music:plan   from=game:broken-pencil to=null
 151633 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 153134 tv    music:stop   track=backbay-lounge.mp3
```
