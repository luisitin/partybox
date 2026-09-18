# Audio interaction trace

Captured 2026-09-18T14:29:09.895Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**54 / 54 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:bossa-antigua
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":4.4}]

```
   1732 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   1762 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3070 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3205 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3885 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4522 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5373 tv    ss:cancel    speaking=false pending=false
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
   6220 tv    music:plan   from=lobby to=null
   6220 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7728 tv    music:stop   track=bossa-antigua.mp3
   8169 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9457 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16428 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17426 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18423 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19429 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20428 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21235 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22030 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22190 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22348 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22504 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22661 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22821 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22965 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23106 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23263 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23406 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23562 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23719 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23876 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24034 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24176 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24334 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24491 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24650 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24791 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25658 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  25989 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27795 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29530 tv    ss:cancel    speaking=false pending=false
  29530 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":1.5}]

```
  31083 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33216 tv    ss:cancel    speaking=false pending=false
  33216 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34767 tv    ss:cancel    speaking=false pending=false
  34767 tv    music:plan   from=null to=lobby
  34767 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:george-street-shuffle.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+954ms phone@+966ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5354ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5404ms cheer@+5366ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=3 lastTickIdx=2
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36335 tv    music:plan   from=lobby to=game:bingo
  36335 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36335 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36639 tv    hush
  36639 tv    hush
  37136 tv    music:stop   track=george-street-shuffle.mp3
  37249 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38390 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39390 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40391 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41341 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41533 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41534 tv    clip         src=b9.wav muted=false ready=true
  41534 tv    speak        text=b9.wav voice=clip
  43159 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43159 tv    clip         src=b8.wav muted=false ready=true
  43159 tv    speak        text=b8.wav voice=clip
  44989 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44989 tv    clip         src=n34.wav muted=false ready=true
  44989 tv    speak        text=n34.wav voice=clip
  46669 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  46942 tv    hush
  46943 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  46943 tv    hush
  52295 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55310 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56311 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57311 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58496 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58496 tv    clip         src=n35.wav muted=false ready=true
  58496 tv    speak        text=n35.wav voice=clip
  60109 tv    music:paused paused=true
  60109 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61370 tv    music:paused paused=false
  61370 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  67840 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  67840 tv    clip         src=g57.wav muted=false ready=true
  67840 tv    speak        text=g57.wav voice=clip
  68275 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68563 tv    hush
  68563 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68563 tv    hush
  70436 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73917 tv    music:duck   ms=9000
  73917 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  78709 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79041 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80042 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81043 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82234 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  82234 tv    clip         src=g57.wav muted=false ready=true
  82234 tv    speak        text=g57.wav voice=clip
  84345 tv    ss:cancel    speaking=false pending=false
  84345 tv    music:plan   from=game:bingo to=null
  84348 tv    ss:cancel    speaking=false pending=false
  84348 tv    music:plan   from=null to=lobby
  84348 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  85151 tv    music:stop   track=wallpaper.mp3
  86858 tv    ss:cancel    speaking=false pending=false
  86868 tv    music:plan   from=lobby to=game:bingo
  86868 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86868 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86872 tv    hush
  86872 tv    hush
  87484 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  87669 tv    music:stop   track=airport-lounge.mp3
  93761 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  93761 tv    clip         src=g59.wav muted=false ready=true
  93761 tv    speak        text=g59.wav voice=clip
  94799 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95057 tv    hush
  95057 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95058 tv    hush
 102665 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 102669 tv    music:duck   ms=9000
 102669 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 107670 tv    hush
 107670 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 107670 tv    hush
 111672 tv    ss:cancel    speaking=false pending=false
 111672 tv    music:plan   from=game:bingo to=null
 111672 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113174 tv    music:stop   track=wallpaper.mp3
 113261 tv    ss:cancel    speaking=false pending=false
 113261 tv    music:plan   from=null to=lobby
 113261 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 115773 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 115782 tv    ss:cancel    speaking=false pending=false
 115784 tv    music:plan   from=lobby to=game:bingo
 115784 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 115784 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 115787 tv    hush
 115787 tv    hush
 116398 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 116584 tv    music:stop   track=airport-lounge.mp3
 117789 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 117947 tv    ss:cancel    speaking=false pending=false
 117947 tv    music:plan   from=game:bingo to=null
 117947 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 119448 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 120044 tv    ss:cancel    speaking=false pending=false
 120044 tv    music:plan   from=null to=lobby
 120044 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 123386 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 123397 tv    ss:cancel    speaking=false pending=false
 123399 tv    music:plan   from=lobby to=game:bingo
 123399 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 123399 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 123403 tv    hush
 123403 tv    hush
 123815 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 124005 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124005 tv    clip         src=i21.wav muted=false ready=true
 124005 tv    speak        text=i21.wav voice=clip
 124202 tv    music:stop   track=airport-lounge.mp3
 124312 tv    ss:cancel    speaking=false pending=false
 124312 tv    music:plan   from=game:bingo to=null
 124316 tv    ss:cancel    speaking=false pending=false
 124316 tv    music:plan   from=null to=lobby
 124316 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 125116 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"airport-lounge.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 129882 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 130313 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 130729 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131147 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131564 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132613 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 133210 tv    ss:cancel    speaking=false pending=false
 133215 tv    music:plan   from=lobby to=null
 133215 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 134444 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 134716 tv    music:stop   track=airport-lounge.mp3
 136049 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 137330 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 138655 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 139653 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 140694 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143237 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 143429 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143621 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 143807 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 144894 tv    ss:cancel    speaking=false pending=false
 144896 tv    ss:cancel    speaking=false pending=false
 144896 tv    music:plan   from=null to=lobby
 144896 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 146917 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 146923 tv    ss:cancel    speaking=false pending=false
 146924 tv    music:plan   from=lobby to=null
 146924 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 148426 tv    music:stop   track=local-forecast-elevator.mp3
 148472 tv    music:plan   from=null to=game:broken-pencil
 148472 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 148472 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 149941 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150418 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150573 tv    music:plan   from=game:broken-pencil to=null
 150573 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 152074 tv    music:stop   track=backbay-lounge.mp3
```
