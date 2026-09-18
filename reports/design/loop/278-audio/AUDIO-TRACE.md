# Audio interaction trace

Captured 2026-09-18T11:36:50.752Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**53 / 53 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:george-street-shuffle
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":4.4}]

```
   1741 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   1767 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3078 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3213 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3909 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4530 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5383 tv    ss:cancel    speaking=false pending=false
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
   6231 tv    music:plan   from=lobby to=null
   6231 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7737 tv    music:stop   track=george-street-shuffle.mp3
   8171 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9432 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16421 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17423 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18425 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19428 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20424 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21242 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22033 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22173 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22327 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22490 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22642 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22782 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22938 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23101 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23268 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23409 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23565 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23722 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23881 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24042 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24200 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24352 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24508 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24665 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24823 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25706 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26031 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27837 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29562 tv    ss:cancel    speaking=false pending=false
  29562 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31108 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33246 tv    ss:cancel    speaking=false pending=false
  33246 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34793 tv    ss:cancel    speaking=false pending=false
  34793 tv    music:plan   from=null to=lobby
  34793 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":3}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+954ms phone@+953ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":19.1}]
- ✅ **play resumes → the next number is spoken** — spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":22.6}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,silence,lock cheer@+5355ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":37}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5419ms cheer@+5370ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36357 tv    music:plan   from=lobby to=game:bingo
  36357 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36357 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36659 tv    hush
  36659 tv    hush
  37158 tv    music:stop   track=airport-lounge.mp3
  37270 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38411 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39411 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40410 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41371 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41562 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41562 tv    clip         src=b9.wav muted=false ready=true
  41562 tv    speak        text=b9.wav voice=clip
  43220 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43220 tv    clip         src=b8.wav muted=false ready=true
  43220 tv    speak        text=b8.wav voice=clip
  45033 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45033 tv    clip         src=n34.wav muted=false ready=true
  45033 tv    speak        text=n34.wav voice=clip
  46715 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  46982 tv    hush
  46982 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  46982 tv    hush
  52334 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55519 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  55711 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  55711 tv    clip         src=n35.wav muted=false ready=true
  55711 tv    speak        text=n35.wav voice=clip
  57744 tv    music:paused paused=true
  57744 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  58995 tv    music:paused paused=false
  58995 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  65424 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  65424 tv    clip         src=g57.wav muted=false ready=true
  65424 tv    speak        text=g57.wav voice=clip
  65843 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  66128 tv    hush
  66128 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  66128 tv    hush
  68005 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  71483 tv    music:duck   ms=9000
  71483 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  71541 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  71541 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  76286 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  76620 tv    hush
  76620 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  76620 tv    hush
  77620 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  78622 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  79825 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  79825 tv    clip         src=g57.wav muted=false ready=true
  79825 tv    speak        text=g57.wav voice=clip
  81922 tv    ss:cancel    speaking=false pending=false
  81922 tv    music:plan   from=game:bingo to=null
  81924 tv    ss:cancel    speaking=false pending=false
  81924 tv    music:plan   from=null to=lobby
  81924 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  82725 tv    music:stop   track=cool-vibes.mp3
  84434 tv    ss:cancel    speaking=false pending=false
  84450 tv    music:plan   from=lobby to=game:bingo
  84450 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  84450 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  84454 tv    hush
  84454 tv    hush
  85065 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  85250 tv    music:stop   track=airport-lounge.mp3
  92000 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  92000 tv    clip         src=b14.wav muted=false ready=true
  92000 tv    speak        text=b14.wav voice=clip
  93035 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  93316 tv    hush
  93316 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  93317 tv    hush
 100923 tv    music:duck   ms=9000
 100923 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 100934 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 105918 tv    hush
 105919 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 105919 tv    hush
 109928 tv    ss:cancel    speaking=false pending=false
 109928 tv    music:plan   from=game:bingo to=null
 109928 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 111428 tv    music:stop   track=wallpaper.mp3
 111502 tv    ss:cancel    speaking=false pending=false
 111502 tv    music:plan   from=null to=lobby
 111502 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 114014 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 114026 tv    ss:cancel    speaking=false pending=false
 114027 tv    music:plan   from=lobby to=game:bingo
 114028 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 114028 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 114031 tv    hush
 114031 tv    hush
 114642 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 114829 tv    music:stop   track=airport-lounge.mp3
 116033 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 116158 tv    ss:cancel    speaking=false pending=false
 116158 tv    music:plan   from=game:bingo to=null
 116158 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 117664 tv    music:stop   track=cool-vibes.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 118269 tv    ss:cancel    speaking=false pending=false
 118269 tv    music:plan   from=null to=lobby
 118269 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 121617 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 121625 tv    ss:cancel    speaking=false pending=false
 121627 tv    music:plan   from=lobby to=game:bingo
 121627 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 121627 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 121630 tv    hush
 121630 tv    hush
 122043 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 122233 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 122233 tv    clip         src=i21.wav muted=false ready=true
 122233 tv    speak        text=i21.wav voice=clip
 122428 tv    music:stop   track=bossa-antigua.mp3
 122536 tv    ss:cancel    speaking=false pending=false
 122536 tv    music:plan   from=game:bingo to=null
 122539 tv    ss:cancel    speaking=false pending=false
 122539 tv    music:plan   from=null to=lobby
 122539 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 123340 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 128106 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 128528 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 128958 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 129389 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 129811 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 130888 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 131484 tv    ss:cancel    speaking=false pending=false
 131489 tv    music:plan   from=lobby to=null
 131489 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 132734 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 132991 tv    music:stop   track=bossa-antigua.mp3
 134344 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 135644 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 136944 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 137941 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 138995 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 141555 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141741 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 141931 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 142119 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"lobby-time.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 143217 tv    ss:cancel    speaking=false pending=false
 143219 tv    ss:cancel    speaking=false pending=false
 143219 tv    music:plan   from=null to=lobby
 143219 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 145253 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 145260 tv    ss:cancel    speaking=false pending=false
 145261 tv    music:plan   from=lobby to=null
 145262 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 146763 tv    music:stop   track=george-street-shuffle.mp3
 146801 tv    music:plan   from=null to=game:broken-pencil
 146801 tv    music:start  plan=game:broken-pencil track=lobby-time mode=chain volume=0.2
 146801 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 148272 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 148754 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 148904 tv    music:plan   from=game:broken-pencil to=null
 148904 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 150406 tv    music:stop   track=lobby-time.mp3
```
