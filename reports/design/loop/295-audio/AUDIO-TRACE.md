# Audio interaction trace

Captured 2026-09-18T13:52:35.014Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**54 / 54 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:bossa-antigua
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":4.4}]

```
   1772 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   1796 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3109 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3245 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3943 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4577 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5411 tv    ss:cancel    speaking=false pending=false
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
   6252 tv    music:plan   from=lobby to=null
   6252 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7768 tv    music:stop   track=bossa-antigua.mp3
   8204 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9496 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16456 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17462 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18467 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19461 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20456 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21253 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22071 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22231 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22372 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22529 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22686 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22845 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22986 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23144 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23301 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23458 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23599 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23755 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23911 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24069 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24225 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24384 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24540 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24698 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24856 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25740 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26070 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27876 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29606 tv    ss:cancel    speaking=false pending=false
  29606 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31155 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33308 tv    ss:cancel    speaking=false pending=false
  33308 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34856 tv    ss:cancel    speaking=false pending=false
  34856 tv    music:plan   from=null to=lobby
  34856 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+959ms phone@+969ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,lock cheer@+5354ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5394ms cheer@+5366ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=3 lastTickIdx=2
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36422 tv    music:plan   from=lobby to=game:bingo
  36422 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36422 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36729 tv    hush
  36729 tv    hush
  37223 tv    music:stop   track=airport-lounge.mp3
  37340 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38480 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39481 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40480 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41435 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41626 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41626 tv    clip         src=b9.wav muted=false ready=true
  41626 tv    speak        text=b9.wav voice=clip
  43255 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43255 tv    clip         src=b8.wav muted=false ready=true
  43255 tv    speak        text=b8.wav voice=clip
  45086 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45087 tv    clip         src=n34.wav muted=false ready=true
  45087 tv    speak        text=n34.wav voice=clip
  46776 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47047 tv    hush
  47047 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47047 tv    hush
  52400 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55412 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56415 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57415 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58605 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58605 tv    clip         src=n35.wav muted=false ready=true
  58605 tv    speak        text=n35.wav voice=clip
  60209 tv    music:paused paused=true
  60209 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61458 tv    music:paused paused=false
  61458 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  67920 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  67920 tv    clip         src=g57.wav muted=false ready=true
  67920 tv    speak        text=g57.wav voice=clip
  68341 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68635 tv    hush
  68635 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68635 tv    hush
  70509 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73989 tv    music:duck   ms=9000
  73989 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  74025 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  78763 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79092 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80093 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81094 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82292 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  82292 tv    clip         src=g57.wav muted=false ready=true
  82292 tv    speak        text=g57.wav voice=clip
  84384 tv    ss:cancel    speaking=false pending=false
  84384 tv    music:plan   from=game:bingo to=null
  84387 tv    ss:cancel    speaking=false pending=false
  84387 tv    music:plan   from=null to=lobby
  84387 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  85188 tv    music:stop   track=wallpaper.mp3
  86899 tv    ss:cancel    speaking=false pending=false
  86908 tv    music:plan   from=lobby to=game:bingo
  86908 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86908 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86911 tv    hush
  86911 tv    hush
  87522 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  87709 tv    music:stop   track=george-street-shuffle.mp3
  94500 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  94500 tv    clip         src=b14.wav muted=false ready=true
  94500 tv    speak        text=b14.wav voice=clip
  95555 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95823 tv    hush
  95823 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95823 tv    hush
 103430 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 103430 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 103437 tv    music:duck   ms=9000
 103437 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108432 tv    hush
 108432 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108432 tv    hush
 112434 tv    ss:cancel    speaking=false pending=false
 112434 tv    music:plan   from=game:bingo to=null
 112434 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113934 tv    music:stop   track=wallpaper.mp3
 114033 tv    ss:cancel    speaking=false pending=false
 114033 tv    music:plan   from=null to=lobby
 114034 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 116536 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 116545 tv    ss:cancel    speaking=false pending=false
 116547 tv    music:plan   from=lobby to=game:bingo
 116547 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116547 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116551 tv    hush
 116551 tv    hush
 117162 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117349 tv    music:stop   track=bossa-antigua.mp3
 118554 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 118670 tv    ss:cancel    speaking=false pending=false
 118670 tv    music:plan   from=game:bingo to=null
 118670 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 120171 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 120784 tv    ss:cancel    speaking=false pending=false
 120784 tv    music:plan   from=null to=lobby
 120784 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 124137 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 124146 tv    ss:cancel    speaking=false pending=false
 124152 tv    music:plan   from=lobby to=game:bingo
 124152 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 124152 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 124157 tv    hush
 124157 tv    hush
 124566 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 124757 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124758 tv    clip         src=i21.wav muted=false ready=true
 124758 tv    speak        text=i21.wav voice=clip
 124952 tv    music:stop   track=george-street-shuffle.mp3
 125068 tv    ss:cancel    speaking=false pending=false
 125068 tv    music:plan   from=game:bingo to=null
 125071 tv    ss:cancel    speaking=false pending=false
 125071 tv    music:plan   from=null to=lobby
 125071 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 125872 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"airport-lounge.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 130621 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131053 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131469 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131886 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132303 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 133368 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 133965 tv    ss:cancel    speaking=false pending=false
 133969 tv    music:plan   from=lobby to=null
 133969 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 135212 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135470 tv    music:stop   track=airport-lounge.mp3
 136804 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 138089 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 139390 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140417 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141459 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144010 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144202 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144391 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144566 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 145650 tv    ss:cancel    speaking=false pending=false
 145653 tv    ss:cancel    speaking=false pending=false
 145653 tv    music:plan   from=null to=lobby
 145653 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 147669 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 147675 tv    ss:cancel    speaking=false pending=false
 147676 tv    music:plan   from=lobby to=null
 147676 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149177 tv    music:stop   track=bossa-antigua.mp3
 149215 tv    music:plan   from=null to=game:broken-pencil
 149215 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 149215 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150697 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151155 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151312 tv    music:plan   from=game:broken-pencil to=null
 151312 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 152813 tv    music:stop   track=hep-cats.mp3
```
