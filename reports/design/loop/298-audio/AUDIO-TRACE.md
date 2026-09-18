# Audio interaction trace

Captured 2026-09-18T14:19:23.273Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**54 / 54 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:george-street-shuffle
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":4.4}]

```
   1811 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   1840 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3165 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3301 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3998 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4635 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
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
   6323 tv    music:plan   from=lobby to=null
   6323 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7840 tv    music:stop   track=george-street-shuffle.mp3
   8277 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9568 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16537 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17534 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18530 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19539 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20530 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21327 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22125 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22284 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22442 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22598 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22742 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22885 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23029 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23187 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23326 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23481 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23640 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23796 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23956 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24110 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24273 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24401 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24554 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24716 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24870 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25750 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26081 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27889 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29625 tv    ss:cancel    speaking=false pending=false
  29625 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31177 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33328 tv    ss:cancel    speaking=false pending=false
  33328 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34878 tv    ss:cancel    speaking=false pending=false
  34878 tv    music:plan   from=null to=lobby
  34878 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+955ms phone@+973ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5355ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5401ms cheer@+5366ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=3 lastTickIdx=2
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36432 tv    music:plan   from=lobby to=game:bingo
  36432 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36432 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36738 tv    hush
  36738 tv    hush
  37233 tv    music:stop   track=airport-lounge.mp3
  37350 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38491 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39490 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40489 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41446 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41636 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41636 tv    clip         src=b9.wav muted=false ready=true
  41636 tv    speak        text=b9.wav voice=clip
  43263 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43263 tv    clip         src=b8.wav muted=false ready=true
  43263 tv    speak        text=b8.wav voice=clip
  45082 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45083 tv    clip         src=n34.wav muted=false ready=true
  45083 tv    speak        text=n34.wav voice=clip
  46763 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47029 tv    hush
  47029 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47029 tv    hush
  52382 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55394 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56396 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57396 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58583 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58584 tv    clip         src=n35.wav muted=false ready=true
  58584 tv    speak        text=n35.wav voice=clip
  60184 tv    music:paused paused=true
  60184 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61429 tv    music:paused paused=false
  61430 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  67912 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  67912 tv    clip         src=g57.wav muted=false ready=true
  67913 tv    speak        text=g57.wav voice=clip
  68345 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68629 tv    hush
  68629 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68629 tv    hush
  70502 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73984 tv    music:duck   ms=9000
  73984 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  78752 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79084 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80085 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81087 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82284 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  82284 tv    clip         src=g57.wav muted=false ready=true
  82284 tv    speak        text=g57.wav voice=clip
  84391 tv    ss:cancel    speaking=false pending=false
  84391 tv    music:plan   from=game:bingo to=null
  84394 tv    ss:cancel    speaking=false pending=false
  84394 tv    music:plan   from=null to=lobby
  84394 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
  85195 tv    music:stop   track=cool-vibes.mp3
  86916 tv    ss:cancel    speaking=false pending=false
  86923 tv    music:plan   from=lobby to=game:bingo
  86923 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86923 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86929 tv    hush
  86929 tv    hush
  87539 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  87729 tv    music:stop   track=airport-lounge.mp3
  93839 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  93839 tv    clip         src=g59.wav muted=false ready=true
  93839 tv    speak        text=g59.wav voice=clip
  94877 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95141 tv    hush
  95141 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95141 tv    hush
 102747 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 102750 tv    music:duck   ms=9000
 102750 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 107749 tv    hush
 107749 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 107750 tv    hush
 111747 tv    ss:cancel    speaking=false pending=false
 111747 tv    music:plan   from=game:bingo to=null
 111747 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113249 tv    music:stop   track=wallpaper.mp3
 113339 tv    ss:cancel    speaking=false pending=false
 113339 tv    music:plan   from=null to=lobby
 113339 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 115848 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 115858 tv    ss:cancel    speaking=false pending=false
 115860 tv    music:plan   from=lobby to=game:bingo
 115860 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 115860 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 115863 tv    hush
 115863 tv    hush
 116474 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 116660 tv    music:stop   track=local-forecast-elevator.mp3
 117865 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 117991 tv    ss:cancel    speaking=false pending=false
 117991 tv    music:plan   from=game:bingo to=null
 117991 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 119491 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 120089 tv    ss:cancel    speaking=false pending=false
 120089 tv    music:plan   from=null to=lobby
 120089 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 123422 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 123430 tv    ss:cancel    speaking=false pending=false
 123432 tv    music:plan   from=lobby to=game:bingo
 123432 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 123432 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 123436 tv    hush
 123436 tv    hush
 123852 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 124042 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124042 tv    clip         src=i21.wav muted=false ready=true
 124042 tv    speak        text=i21.wav voice=clip
 124234 tv    music:stop   track=bossa-antigua.mp3
 124355 tv    ss:cancel    speaking=false pending=false
 124355 tv    music:plan   from=game:bingo to=null
 124358 tv    ss:cancel    speaking=false pending=false
 124358 tv    music:plan   from=null to=lobby
 124358 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 125160 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 129925 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 130341 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 130758 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131191 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131608 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132673 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 133269 tv    ss:cancel    speaking=false pending=false
 133270 tv    music:plan   from=lobby to=null
 133270 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 134514 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 134771 tv    music:stop   track=bossa-antigua.mp3
 136225 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 137508 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 138794 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 139805 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 140844 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143407 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 143597 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143784 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 143977 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 145070 tv    ss:cancel    speaking=false pending=false
 145073 tv    ss:cancel    speaking=false pending=false
 145073 tv    music:plan   from=null to=lobby
 145073 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 147088 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 147094 tv    ss:cancel    speaking=false pending=false
 147097 tv    music:plan   from=lobby to=null
 147097 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 148598 tv    music:stop   track=george-street-shuffle.mp3
 148638 tv    music:plan   from=null to=game:broken-pencil
 148638 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 148638 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150111 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150570 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150730 tv    music:plan   from=game:broken-pencil to=null
 150730 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 152232 tv    music:stop   track=hep-cats.mp3
```
