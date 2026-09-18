# Audio interaction trace

Captured 2026-09-18T05:35:34.072Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**48 / 48 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:george-street-shuffle
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":4.4}]

```
   1787 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   1814 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3141 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3281 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3972 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4615 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5469 tv    ss:cancel    speaking=false pending=false
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
   6324 tv    music:plan   from=lobby to=null
   6324 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7827 tv    music:stop   track=george-street-shuffle.mp3
   8285 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9570 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16544 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17538 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18550 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19542 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20550 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21320 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22125 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22280 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22437 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22595 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22748 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22904 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23062 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23206 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23346 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23502 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23659 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23806 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23959 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24117 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24275 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24432 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24574 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24729 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24888 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25773 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26106 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27917 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29639 tv    ss:cancel    speaking=false pending=false
  29640 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31209 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33375 tv    ss:cancel    speaking=false pending=false
  33375 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34928 tv    ss:cancel    speaking=false pending=false
  34928 tv    music:plan   from=null to=lobby
  34928 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":3}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=phase,call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":15.5}]
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":19}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer cheer@+5366ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":31.1}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,claim,correct
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=lock,silence,phase,call spoken=o72.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=lock,tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36508 tv    music:plan   from=lobby to=game:bingo
  36508 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36508 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36816 tv    hush
  36817 tv    hush
  37309 tv    music:stop   track=bossa-antigua.mp3
  39582 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  39773 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39773 tv    clip         src=b9.wav muted=false ready=true
  39773 tv    speak        text=b9.wav voice=clip
  41598 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41599 tv    clip         src=b8.wav muted=false ready=true
  41599 tv    speak        text=b8.wav voice=clip
  43558 tv    hush
  43559 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  43559 tv    hush
  48919 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  52118 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  52309 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52309 tv    clip         src=n34.wav muted=false ready=true
  52309 tv    speak        text=n34.wav voice=clip
  54313 tv    music:paused paused=true
  54313 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  55565 tv    music:paused paused=false
  55565 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  59674 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  59674 tv    clip         src=o72.wav muted=false ready=true
  59674 tv    speak        text=o72.wav voice=clip
  60372 tv    hush
  60373 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  60373 tv    hush
  62249 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  65738 tv    music:duck   ms=9000
  65738 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  70480 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  70494 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  70810 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  71005 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  71005 tv    clip         src=o72.wav muted=false ready=true
  71005 tv    speak        text=o72.wav voice=clip
  74419 tv    ss:cancel    speaking=false pending=false
  74419 tv    music:plan   from=game:bingo to=null
  74424 tv    ss:cancel    speaking=false pending=false
  74425 tv    music:plan   from=null to=lobby
  74425 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  75233 tv    music:stop   track=cool-vibes.mp3
  76951 tv    ss:cancel    speaking=false pending=false
  76969 tv    music:plan   from=lobby to=game:bingo
  76969 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  76969 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  76976 tv    hush
  76977 tv    hush
  77584 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  77774 tv    music:stop   track=bossa-antigua.mp3
  84709 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84709 tv    clip         src=b14.wav muted=false ready=true
  84709 tv    speak        text=b14.wav voice=clip
  86038 tv    hush
  86038 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  86039 tv    hush
  93658 tv    music:duck   ms=9000
  93658 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  98657 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  98665 tv    hush
  98665 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
  98666 tv    hush
 102648 tv    ss:cancel    speaking=false pending=false
 102648 tv    music:plan   from=game:bingo to=null
 102648 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 104154 tv    music:stop   track=wallpaper.mp3
 104235 tv    ss:cancel    speaking=false pending=false
 104236 tv    music:plan   from=null to=lobby
 104236 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 106751 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 106766 tv    ss:cancel    speaking=false pending=false
 106769 tv    music:plan   from=lobby to=game:bingo
 106769 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 106769 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 106776 tv    hush
 106776 tv    hush
 107573 tv    music:stop   track=bossa-antigua.mp3
 108923 tv    ss:cancel    speaking=false pending=false
 108923 tv    music:plan   from=game:bingo to=null
 108923 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 110440 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 111035 tv    ss:cancel    speaking=false pending=false
 111035 tv    music:plan   from=null to=lobby
 111035 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 114405 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 114424 tv    ss:cancel    speaking=false pending=false
 114428 tv    music:plan   from=lobby to=game:bingo
 114428 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 114428 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 114435 tv    hush
 114436 tv    hush
 114855 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 115047 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 115047 tv    clip         src=i21.wav muted=false ready=true
 115047 tv    speak        text=i21.wav voice=clip
 115230 tv    music:stop   track=george-street-shuffle.mp3
 115354 tv    ss:cancel    speaking=false pending=false
 115354 tv    music:plan   from=game:bingo to=null
 115362 tv    ss:cancel    speaking=false pending=false
 115362 tv    music:plan   from=null to=lobby
 115362 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 116175 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":10.3}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 120942 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 121376 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 121808 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 122243 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 122674 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 123871 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 124471 tv    ss:cancel    speaking=false pending=false
 124482 tv    music:plan   from=lobby to=null
 124482 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 125746 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 125992 tv    music:stop   track=bossa-antigua.mp3
 127378 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 128710 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 130026 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 131089 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 132153 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 134723 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 134909 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135097 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 135271 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 136383 tv    ss:cancel    speaking=false pending=false
 136388 tv    ss:cancel    speaking=false pending=false
 136388 tv    music:plan   from=null to=lobby
 136388 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 138400 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 138412 tv    ss:cancel    speaking=false pending=false
 138416 tv    music:plan   from=lobby to=null
 138416 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 139929 tv    music:stop   track=local-forecast-elevator.mp3
 139974 tv    music:plan   from=null to=game:broken-pencil
 139974 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 139974 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 141441 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 141909 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 142069 tv    music:plan   from=game:broken-pencil to=null
 142069 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 143577 tv    music:stop   track=backbay-lounge.mp3
```
