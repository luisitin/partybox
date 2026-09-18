# Audio interaction trace

Captured 2026-09-18T14:05:17.166Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**54 / 54 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.4}]

```
   1772 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1800 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3127 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3262 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3960 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4596 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5447 tv    ss:cancel    speaking=false pending=false
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
   6286 tv    music:plan   from=lobby to=null
   6286 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7798 tv    music:stop   track=airport-lounge.mp3
   8232 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9500 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16487 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17486 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18486 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19486 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20486 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21299 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22098 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22256 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22414 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22568 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22723 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22864 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23006 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23165 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23320 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23472 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23628 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23785 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23941 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24096 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24252 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24408 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24563 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24720 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24875 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25753 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26084 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27892 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29632 tv    ss:cancel    speaking=false pending=false
  29632 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":1.5}]

```
  31173 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33307 tv    ss:cancel    speaking=false pending=false
  33307 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34858 tv    ss:cancel    speaking=false pending=false
  34858 tv    music:plan   from=null to=lobby
  34858 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:george-street-shuffle.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+954ms phone@+965ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,silence,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,silence,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,lock cheer@+5359ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5408ms cheer@+5369ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=3 lastTickIdx=2
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36426 tv    music:plan   from=lobby to=game:bingo
  36426 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36426 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36729 tv    hush
  36729 tv    hush
  37228 tv    music:stop   track=george-street-shuffle.mp3
  37340 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38482 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39481 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40480 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41434 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41624 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41625 tv    clip         src=b9.wav muted=false ready=true
  41625 tv    speak        text=b9.wav voice=clip
  43239 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43239 tv    clip         src=b8.wav muted=false ready=true
  43239 tv    speak        text=b8.wav voice=clip
  45067 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45067 tv    clip         src=n34.wav muted=false ready=true
  45067 tv    speak        text=n34.wav voice=clip
  46742 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47007 tv    hush
  47007 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47007 tv    hush
  52366 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  52371 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55369 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56370 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57370 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58560 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58560 tv    clip         src=n35.wav muted=false ready=true
  58560 tv    speak        text=n35.wav voice=clip
  60128 tv    music:paused paused=true
  60128 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61376 tv    music:paused paused=false
  61376 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  67860 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  67860 tv    clip         src=g57.wav muted=false ready=true
  67860 tv    speak        text=g57.wav voice=clip
  68274 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68561 tv    hush
  68562 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68562 tv    hush
  70434 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73920 tv    music:duck   ms=9000
  73920 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  73966 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  78696 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79033 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80037 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81033 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82218 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  82218 tv    clip         src=g57.wav muted=false ready=true
  82218 tv    speak        text=g57.wav voice=clip
  84335 tv    ss:cancel    speaking=false pending=false
  84335 tv    music:plan   from=game:bingo to=null
  84338 tv    ss:cancel    speaking=false pending=false
  84338 tv    music:plan   from=null to=lobby
  84338 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  85139 tv    music:stop   track=cool-vibes.mp3
  86859 tv    ss:cancel    speaking=false pending=false
  86868 tv    music:plan   from=lobby to=game:bingo
  86868 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86868 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86871 tv    hush
  86871 tv    hush
  87482 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  87669 tv    music:stop   track=local-forecast-elevator.mp3
  94462 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  94463 tv    clip         src=b14.wav muted=false ready=true
  94463 tv    speak        text=b14.wav voice=clip
  95523 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95785 tv    hush
  95785 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95785 tv    hush
 103389 tv    music:duck   ms=9000
 103389 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 103398 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 108404 tv    hush
 108404 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108404 tv    hush
 112414 tv    ss:cancel    speaking=false pending=false
 112414 tv    music:plan   from=game:bingo to=null
 112414 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113914 tv    music:stop   track=wallpaper.mp3
 114002 tv    ss:cancel    speaking=false pending=false
 114002 tv    music:plan   from=null to=lobby
 114002 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 116509 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 116519 tv    ss:cancel    speaking=false pending=false
 116521 tv    music:plan   from=lobby to=game:bingo
 116521 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 116521 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116525 tv    hush
 116525 tv    hush
 117136 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117322 tv    music:stop   track=george-street-shuffle.mp3
 118526 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 118638 tv    ss:cancel    speaking=false pending=false
 118638 tv    music:plan   from=game:bingo to=null
 118638 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 120139 tv    music:stop   track=cool-vibes.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 120750 tv    ss:cancel    speaking=false pending=false
 120750 tv    music:plan   from=null to=lobby
 120750 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 124105 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 124116 tv    ss:cancel    speaking=false pending=false
 124119 tv    music:plan   from=lobby to=game:bingo
 124119 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 124119 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 124125 tv    hush
 124126 tv    hush
 124535 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 124726 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124726 tv    clip         src=i21.wav muted=false ready=true
 124726 tv    speak        text=i21.wav voice=clip
 124920 tv    music:stop   track=bossa-antigua.mp3
 125035 tv    ss:cancel    speaking=false pending=false
 125035 tv    music:plan   from=game:bingo to=null
 125039 tv    ss:cancel    speaking=false pending=false
 125039 tv    music:plan   from=null to=lobby
 125039 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 125851 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 130605 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131038 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131471 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131888 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132325 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 133386 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 134003 tv    ss:cancel    speaking=false pending=false
 134008 tv    music:plan   from=lobby to=null
 134008 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 135237 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135509 tv    music:stop   track=george-street-shuffle.mp3
 136824 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 138124 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 139444 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140443 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141498 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144043 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144237 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144435 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144625 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"lobby-time.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 145716 tv    ss:cancel    speaking=false pending=false
 145718 tv    ss:cancel    speaking=false pending=false
 145718 tv    music:plan   from=null to=lobby
 145718 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 147730 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 147740 tv    ss:cancel    speaking=false pending=false
 147742 tv    music:plan   from=lobby to=null
 147742 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149242 tv    music:stop   track=bossa-antigua.mp3
 149285 tv    music:plan   from=null to=game:broken-pencil
 149285 tv    music:start  plan=game:broken-pencil track=lobby-time mode=chain volume=0.2
 149285 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150764 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151236 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151393 tv    music:plan   from=game:broken-pencil to=null
 151393 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 152893 tv    music:stop   track=lobby-time.mp3
```
