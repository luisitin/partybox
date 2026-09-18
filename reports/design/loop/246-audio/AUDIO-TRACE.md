# Audio interaction trace

Captured 2026-09-18T04:24:08.029Z on port 42152. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**48 / 48 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:george-street-shuffle
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":4.4}]

```
   1818 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   1844 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3179 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3334 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   4034 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4666 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
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
   6363 tv    music:plan   from=lobby to=null
   6363 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7866 tv    music:stop   track=george-street-shuffle.mp3
   8323 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9628 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16582 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17574 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18581 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19575 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20582 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21374 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22168 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22325 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22468 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22631 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22795 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22955 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23112 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23268 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23410 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23565 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23712 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23881 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24039 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24196 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24336 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24492 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24651 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24805 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24965 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25844 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26177 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27982 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29718 tv    ss:cancel    speaking=false pending=false
  29719 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31274 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33442 tv    ss:cancel    speaking=false pending=false
  33442 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  35009 tv    ss:cancel    speaking=false pending=false
  35009 tv    music:plan   from=null to=lobby
  35009 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=phase,call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":15.4}]
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":18.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer cheer@+5379ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":31}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,claim,correct
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=lock,silence,phase,call spoken=o72.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=lock,tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36590 tv    music:plan   from=lobby to=game:bingo
  36590 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36590 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36899 tv    hush
  36899 tv    hush
  37397 tv    music:stop   track=airport-lounge.mp3
  39652 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  39844 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39844 tv    clip         src=b9.wav muted=false ready=true
  39844 tv    speak        text=b9.wav voice=clip
  41665 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41665 tv    clip         src=b8.wav muted=false ready=true
  41665 tv    speak        text=b8.wav voice=clip
  43623 tv    hush
  43623 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  43624 tv    hush
  48978 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  52168 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  52359 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52359 tv    clip         src=n34.wav muted=false ready=true
  52359 tv    speak        text=n34.wav voice=clip
  54378 tv    music:paused paused=true
  54378 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  55630 tv    music:paused paused=false
  55631 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  59715 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  59715 tv    clip         src=o72.wav muted=false ready=true
  59715 tv    speak        text=o72.wav voice=clip
  60399 tv    hush
  60399 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  60399 tv    hush
  62287 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  65778 tv    music:duck   ms=9000
  65778 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  70507 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  70514 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  70842 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  71032 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  71033 tv    clip         src=o72.wav muted=false ready=true
  71033 tv    speak        text=o72.wav voice=clip
  74452 tv    ss:cancel    speaking=false pending=false
  74452 tv    music:plan   from=game:bingo to=null
  74456 tv    ss:cancel    speaking=false pending=false
  74456 tv    music:plan   from=null to=lobby
  74456 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  75270 tv    music:stop   track=cool-vibes.mp3
  76985 tv    ss:cancel    speaking=false pending=false
  77002 tv    music:plan   from=lobby to=game:bingo
  77002 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  77002 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  77008 tv    hush
  77008 tv    hush
  77625 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  77803 tv    music:stop   track=george-street-shuffle.mp3
  84629 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84629 tv    clip         src=b14.wav muted=false ready=true
  84629 tv    speak        text=b14.wav voice=clip
  86178 tv    hush
  86178 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  86178 tv    hush
  93789 tv    music:duck   ms=9000
  93789 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  98788 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  98798 tv    hush
  98798 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
  98799 tv    hush
 102779 tv    ss:cancel    speaking=false pending=false
 102779 tv    music:plan   from=game:bingo to=null
 102779 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 104282 tv    music:stop   track=wallpaper.mp3
 104399 tv    ss:cancel    speaking=false pending=false
 104400 tv    music:plan   from=null to=lobby
 104400 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 106919 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 106936 tv    ss:cancel    speaking=false pending=false
 106945 tv    music:plan   from=lobby to=game:bingo
 106945 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 106945 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 106952 tv    hush
 106953 tv    hush
 107745 tv    music:stop   track=george-street-shuffle.mp3
 109084 tv    ss:cancel    speaking=false pending=false
 109084 tv    music:plan   from=game:bingo to=null
 109084 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 110600 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 111219 tv    ss:cancel    speaking=false pending=false
 111219 tv    music:plan   from=null to=lobby
 111219 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 114595 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 114611 tv    ss:cancel    speaking=false pending=false
 114616 tv    music:plan   from=lobby to=game:bingo
 114616 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 114616 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 114623 tv    hush
 114623 tv    hush
 115039 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 115237 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 115237 tv    clip         src=i21.wav muted=false ready=true
 115237 tv    speak        text=i21.wav voice=clip
 115418 tv    music:stop   track=airport-lounge.mp3
 115519 tv    ss:cancel    speaking=false pending=false
 115519 tv    music:plan   from=game:bingo to=null
 115525 tv    ss:cancel    speaking=false pending=false
 115525 tv    music:plan   from=null to=lobby
 115525 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 116337 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.07,"t":10.2}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 121093 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 121550 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 121994 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 122422 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 122850 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 124016 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 124628 tv    ss:cancel    speaking=false pending=false
 124637 tv    music:plan   from=lobby to=null
 124637 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 125869 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 126140 tv    music:stop   track=local-forecast-elevator.mp3
 127486 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 128812 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 130147 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 131208 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 132262 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 134809 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 135000 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135190 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 135380 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"lobby-time.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 136499 tv    ss:cancel    speaking=false pending=false
 136503 tv    ss:cancel    speaking=false pending=false
 136503 tv    music:plan   from=null to=lobby
 136503 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 138519 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 138531 tv    ss:cancel    speaking=false pending=false
 138541 tv    music:plan   from=lobby to=null
 138541 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 140044 tv    music:stop   track=bossa-antigua.mp3
 140091 tv    music:plan   from=null to=game:broken-pencil
 140091 tv    music:start  plan=game:broken-pencil track=lobby-time mode=chain volume=0.2
 140091 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 141564 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 142035 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 142197 tv    music:plan   from=game:broken-pencil to=null
 142197 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 143710 tv    music:stop   track=lobby-time.mp3
```
