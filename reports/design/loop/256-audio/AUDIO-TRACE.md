# Audio interaction trace

Captured 2026-09-18T06:44:23.813Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**49 / 49 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.4}]

```
   1770 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1799 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3111 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3248 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3933 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4582 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5435 tv    ss:cancel    speaking=false pending=false
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
   6279 tv    music:plan   from=lobby to=null
   6279 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7781 tv    music:stop   track=local-forecast-elevator.mp3
   8274 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9537 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16283 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17283 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18282 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19277 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20284 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21282 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22068 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22226 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22384 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22543 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22684 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22840 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22998 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23157 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23312 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23470 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23628 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23782 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23939 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24080 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24233 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24393 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24549 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24709 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24867 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25745 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26078 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27883 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29619 tv    ss:cancel    speaking=false pending=false
  29619 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.34,"t":1.5}]

```
  31180 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33340 tv    ss:cancel    speaking=false pending=false
  33340 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34891 tv    ss:cancel    speaking=false pending=false
  34891 tv    music:plan   from=null to=lobby
  34891 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=phase,call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":15.4}]
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":18.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer cheer@+5373ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":30.9}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=lock,silence,phase,call spoken=o72.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=lock,tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36478 tv    music:plan   from=lobby to=game:bingo
  36478 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36478 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36784 tv    hush
  36785 tv    hush
  37280 tv    music:stop   track=bossa-antigua.mp3
  39544 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  39744 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39744 tv    clip         src=b9.wav muted=false ready=true
  39744 tv    speak        text=b9.wav voice=clip
  41548 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41548 tv    clip         src=b8.wav muted=false ready=true
  41548 tv    speak        text=b8.wav voice=clip
  43235 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  43496 tv    hush
  43497 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  43497 tv    hush
  48851 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  52060 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  52256 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52256 tv    clip         src=n34.wav muted=false ready=true
  52256 tv    speak        text=n34.wav voice=clip
  54267 tv    music:paused paused=true
  54269 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  55542 tv    music:paused paused=false
  55543 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  59575 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  59575 tv    clip         src=o72.wav muted=false ready=true
  59575 tv    speak        text=o72.wav voice=clip
  59956 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  60253 tv    hush
  60253 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  60254 tv    hush
  62140 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  65626 tv    music:duck   ms=9000
  65626 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  70367 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  70381 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  70707 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  70901 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  70901 tv    clip         src=o72.wav muted=false ready=true
  70901 tv    speak        text=o72.wav voice=clip
  74310 tv    ss:cancel    speaking=false pending=false
  74311 tv    music:plan   from=game:bingo to=null
  74316 tv    ss:cancel    speaking=false pending=false
  74316 tv    music:plan   from=null to=lobby
  74316 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  75127 tv    music:stop   track=wallpaper.mp3
  76875 tv    ss:cancel    speaking=false pending=false
  76891 tv    music:plan   from=lobby to=game:bingo
  76891 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  76891 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  76898 tv    hush
  76898 tv    hush
  77501 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  77694 tv    music:stop   track=local-forecast-elevator.mp3
  84626 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84626 tv    clip         src=b14.wav muted=false ready=true
  84626 tv    speak        text=b14.wav voice=clip
  85889 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  86156 tv    hush
  86157 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  86157 tv    hush
  93761 tv    music:duck   ms=9000
  93761 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  98766 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  98775 tv    hush
  98775 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
  98776 tv    hush
 102769 tv    ss:cancel    speaking=false pending=false
 102769 tv    music:plan   from=game:bingo to=null
 102769 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 104275 tv    music:stop   track=wallpaper.mp3
 104369 tv    ss:cancel    speaking=false pending=false
 104369 tv    music:plan   from=null to=lobby
 104369 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 106905 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 106922 tv    ss:cancel    speaking=false pending=false
 106925 tv    music:plan   from=lobby to=game:bingo
 106925 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 106925 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 106931 tv    hush
 106932 tv    hush
 107728 tv    music:stop   track=airport-lounge.mp3
 109042 tv    ss:cancel    speaking=false pending=false
 109042 tv    music:plan   from=game:bingo to=null
 109042 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 110553 tv    music:stop   track=cool-vibes.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 111166 tv    ss:cancel    speaking=false pending=false
 111167 tv    music:plan   from=null to=lobby
 111167 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 114522 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 114540 tv    ss:cancel    speaking=false pending=false
 114544 tv    music:plan   from=lobby to=game:bingo
 114544 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 114544 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 114551 tv    hush
 114552 tv    hush
 114956 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 115150 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 115151 tv    clip         src=i21.wav muted=false ready=true
 115151 tv    speak        text=i21.wav voice=clip
 115344 tv    music:stop   track=airport-lounge.mp3
 115452 tv    ss:cancel    speaking=false pending=false
 115452 tv    music:plan   from=game:bingo to=null
 115462 tv    ss:cancel    speaking=false pending=false
 115462 tv    music:plan   from=null to=lobby
 115462 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 116277 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.08,"t":10.2}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 121028 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 121454 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 121882 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 122322 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 122764 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 123932 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 124576 tv    ss:cancel    speaking=false pending=false
 124589 tv    music:plan   from=lobby to=null
 124589 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 125805 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 126095 tv    music:stop   track=george-street-shuffle.mp3
 127440 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 128775 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 130114 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 131187 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 132253 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 134823 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 135005 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135199 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 135386 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 136501 tv    ss:cancel    speaking=false pending=false
 136506 tv    ss:cancel    speaking=false pending=false
 136506 tv    music:plan   from=null to=lobby
 136506 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 138544 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 138555 tv    ss:cancel    speaking=false pending=false
 138559 tv    music:plan   from=lobby to=null
 138559 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 140059 tv    music:stop   track=airport-lounge.mp3
 140142 tv    music:plan   from=null to=game:broken-pencil
 140142 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 140142 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 141633 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 142077 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 142234 tv    music:plan   from=game:broken-pencil to=null
 142234 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 143737 tv    music:stop   track=hep-cats.mp3
```
