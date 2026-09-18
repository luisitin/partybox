# Audio interaction trace

Captured 2026-09-18T15:17:20.067Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**54 / 54 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.4}]

```
   1773 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1798 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3128 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3265 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3973 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4596 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5448 tv    ss:cancel    speaking=false pending=false
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
   6293 tv    music:plan   from=lobby to=null
   6293 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7794 tv    music:stop   track=airport-lounge.mp3
   8254 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9531 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16509 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17513 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18516 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19507 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20507 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21305 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22098 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22253 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22408 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22565 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22722 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22881 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23006 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23160 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23318 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23474 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23631 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23790 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23948 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24107 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24260 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24418 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24574 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24731 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24889 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25768 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26096 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27903 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29636 tv    ss:cancel    speaking=false pending=false
  29637 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":1.5}]

```
  31174 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33309 tv    ss:cancel    speaking=false pending=false
  33309 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34860 tv    ss:cancel    speaking=false pending=false
  34860 tv    music:plan   from=null to=lobby
  34860 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:local-forecast-elevator.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":3}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+954ms phone@+969ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,silence,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,silence,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18.1}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5360ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5407ms cheer@+5373ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=3 lastTickIdx=2
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36421 tv    music:plan   from=lobby to=game:bingo
  36421 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36421 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36725 tv    hush
  36725 tv    hush
  37221 tv    music:stop   track=local-forecast-elevator.mp3
  37336 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38427 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39426 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40427 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41429 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41620 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41620 tv    clip         src=b9.wav muted=false ready=true
  41620 tv    speak        text=b9.wav voice=clip
  43255 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43255 tv    clip         src=b8.wav muted=false ready=true
  43255 tv    speak        text=b8.wav voice=clip
  45079 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45079 tv    clip         src=n34.wav muted=false ready=true
  45079 tv    speak        text=n34.wav voice=clip
  46761 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47037 tv    hush
  47038 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47038 tv    hush
  52393 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  52396 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55397 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56398 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57397 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58583 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58583 tv    clip         src=n35.wav muted=false ready=true
  58583 tv    speak        text=n35.wav voice=clip
  60195 tv    music:paused paused=true
  60195 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61443 tv    music:paused paused=false
  61443 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  67912 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  67912 tv    clip         src=g57.wav muted=false ready=true
  67912 tv    speak        text=g57.wav voice=clip
  68350 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68632 tv    hush
  68632 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68632 tv    hush
  70506 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73992 tv    music:duck   ms=9000
  73992 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  78780 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79109 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80110 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81109 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82307 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  82307 tv    clip         src=g57.wav muted=false ready=true
  82307 tv    speak        text=g57.wav voice=clip
  84403 tv    ss:cancel    speaking=false pending=false
  84403 tv    music:plan   from=game:bingo to=null
  84406 tv    ss:cancel    speaking=false pending=false
  84406 tv    music:plan   from=null to=lobby
  84406 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  85207 tv    music:stop   track=wallpaper.mp3
  86935 tv    ss:cancel    speaking=false pending=false
  86944 tv    music:plan   from=lobby to=game:bingo
  86944 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86944 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86947 tv    hush
  86948 tv    hush
  87561 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  87746 tv    music:stop   track=george-street-shuffle.mp3
  93874 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  93874 tv    clip         src=g59.wav muted=false ready=true
  93874 tv    speak        text=g59.wav voice=clip
  94907 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95184 tv    hush
  95185 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95185 tv    hush
 102781 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 102789 tv    music:duck   ms=9000
 102789 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 107800 tv    hush
 107801 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 107801 tv    hush
 111797 tv    ss:cancel    speaking=false pending=false
 111797 tv    music:plan   from=game:bingo to=null
 111797 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113298 tv    music:stop   track=wallpaper.mp3
 113369 tv    ss:cancel    speaking=false pending=false
 113369 tv    music:plan   from=null to=lobby
 113369 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 115883 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 115891 tv    ss:cancel    speaking=false pending=false
 115893 tv    music:plan   from=lobby to=game:bingo
 115893 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 115893 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 115897 tv    hush
 115897 tv    hush
 116507 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 116694 tv    music:stop   track=local-forecast-elevator.mp3
 117899 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 118022 tv    ss:cancel    speaking=false pending=false
 118022 tv    music:plan   from=game:bingo to=null
 118022 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 119523 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 120119 tv    ss:cancel    speaking=false pending=false
 120119 tv    music:plan   from=null to=lobby
 120119 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 123486 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 123495 tv    ss:cancel    speaking=false pending=false
 123496 tv    music:plan   from=lobby to=game:bingo
 123496 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 123496 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 123500 tv    hush
 123501 tv    hush
 123921 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 124112 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124112 tv    clip         src=i21.wav muted=false ready=true
 124112 tv    speak        text=i21.wav voice=clip
 124297 tv    music:stop   track=airport-lounge.mp3
 124437 tv    ss:cancel    speaking=false pending=false
 124437 tv    music:plan   from=game:bingo to=null
 124440 tv    ss:cancel    speaking=false pending=false
 124440 tv    music:plan   from=null to=lobby
 124440 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 125240 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 130005 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 130446 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 130896 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131322 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131740 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132804 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 133404 tv    ss:cancel    speaking=false pending=false
 133409 tv    music:plan   from=lobby to=null
 133409 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 134646 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 134910 tv    music:stop   track=george-street-shuffle.mp3
 136242 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 137527 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 138960 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 139984 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141047 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143579 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 143775 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143957 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144147 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 145235 tv    ss:cancel    speaking=false pending=false
 145238 tv    ss:cancel    speaking=false pending=false
 145238 tv    music:plan   from=null to=lobby
 145238 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 147256 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 147274 tv    ss:cancel    speaking=false pending=false
 147275 tv    music:plan   from=lobby to=null
 147275 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 148777 tv    music:stop   track=bossa-antigua.mp3
 148812 tv    music:plan   from=null to=game:broken-pencil
 148812 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 148812 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150298 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150761 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150917 tv    music:plan   from=game:broken-pencil to=null
 150917 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 152417 tv    music:stop   track=hep-cats.mp3
```
