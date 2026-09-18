# Audio interaction trace

Captured 2026-09-18T13:06:17.416Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**54 / 54 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.4}]

```
   1749 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1774 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3087 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3223 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3911 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4539 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5389 tv    ss:cancel    speaking=false pending=false
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
   6223 tv    music:plan   from=lobby to=null
   6223 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7729 tv    music:stop   track=airport-lounge.mp3
   8169 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9458 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16429 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17429 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18425 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19426 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20429 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21225 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22017 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22173 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22327 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22486 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22641 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22799 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22955 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23099 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23252 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23410 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23567 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23726 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23879 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24036 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24190 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24348 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24503 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24659 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24816 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25692 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26014 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27815 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29552 tv    ss:cancel    speaking=false pending=false
  29552 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31099 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33268 tv    ss:cancel    speaking=false pending=false
  33268 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34818 tv    ss:cancel    speaking=false pending=false
  34818 tv    music:plan   from=null to=lobby
  34818 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+942ms phone@+939ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer,silence,lock cheer@+5354ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5416ms cheer@+5369ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=3 lastTickIdx=2
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36364 tv    music:plan   from=lobby to=game:bingo
  36364 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36364 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36668 tv    hush
  36668 tv    hush
  37164 tv    music:stop   track=bossa-antigua.mp3
  37279 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38421 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39421 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40420 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41369 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41561 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41561 tv    clip         src=b9.wav muted=false ready=true
  41561 tv    speak        text=b9.wav voice=clip
  43200 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43200 tv    clip         src=b8.wav muted=false ready=true
  43200 tv    speak        text=b8.wav voice=clip
  45024 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45024 tv    clip         src=n34.wav muted=false ready=true
  45024 tv    speak        text=n34.wav voice=clip
  46704 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  46969 tv    hush
  46970 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  46970 tv    hush
  52321 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55337 tv    hush
  55338 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  55338 tv    hush
  56343 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57339 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58532 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  58532 tv    clip         src=n35.wav muted=false ready=true
  58532 tv    speak        text=n35.wav voice=clip
  60092 tv    music:paused paused=true
  60092 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61351 tv    music:paused paused=false
  61351 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  67844 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  67844 tv    clip         src=g57.wav muted=false ready=true
  67844 tv    speak        text=g57.wav voice=clip
  68286 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68583 tv    hush
  68583 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68583 tv    hush
  70455 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73937 tv    music:duck   ms=9000
  73937 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  73994 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  73994 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  78743 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79061 tv    hush
  79061 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  79062 tv    hush
  80063 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81063 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82252 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  82252 tv    clip         src=g57.wav muted=false ready=true
  82252 tv    speak        text=g57.wav voice=clip
  84363 tv    ss:cancel    speaking=false pending=false
  84363 tv    music:plan   from=game:bingo to=null
  84365 tv    ss:cancel    speaking=false pending=false
  84365 tv    music:plan   from=null to=lobby
  84365 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  85167 tv    music:stop   track=cool-vibes.mp3
  86891 tv    ss:cancel    speaking=false pending=false
  86903 tv    music:plan   from=lobby to=game:bingo
  86903 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86903 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86907 tv    hush
  86908 tv    hush
  87518 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  87704 tv    music:stop   track=local-forecast-elevator.mp3
  94446 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  94446 tv    clip         src=b14.wav muted=false ready=true
  94446 tv    speak        text=b14.wav voice=clip
  95500 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95767 tv    hush
  95767 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95767 tv    hush
 103370 tv    music:duck   ms=9000
 103370 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 103380 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 108377 tv    hush
 108378 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108378 tv    hush
 112378 tv    ss:cancel    speaking=false pending=false
 112378 tv    music:plan   from=game:bingo to=null
 112378 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113879 tv    music:stop   track=wallpaper.mp3
 113978 tv    ss:cancel    speaking=false pending=false
 113978 tv    music:plan   from=null to=lobby
 113978 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 116485 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 116493 tv    ss:cancel    speaking=false pending=false
 116496 tv    music:plan   from=lobby to=game:bingo
 116496 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116496 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116499 tv    hush
 116499 tv    hush
 117111 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117297 tv    music:stop   track=bossa-antigua.mp3
 118501 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 118632 tv    ss:cancel    speaking=false pending=false
 118632 tv    music:plan   from=game:bingo to=null
 118632 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 120132 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 120727 tv    ss:cancel    speaking=false pending=false
 120727 tv    music:plan   from=null to=lobby
 120727 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 124075 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 124084 tv    ss:cancel    speaking=false pending=false
 124086 tv    music:plan   from=lobby to=game:bingo
 124086 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 124087 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 124092 tv    hush
 124093 tv    hush
 124507 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 124699 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124699 tv    clip         src=i21.wav muted=false ready=true
 124699 tv    speak        text=i21.wav voice=clip
 124888 tv    music:stop   track=bossa-antigua.mp3
 125012 tv    ss:cancel    speaking=false pending=false
 125012 tv    music:plan   from=game:bingo to=null
 125015 tv    ss:cancel    speaking=false pending=false
 125015 tv    music:plan   from=null to=lobby
 125015 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 125816 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 130582 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131015 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131431 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131847 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132280 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 133347 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 133949 tv    ss:cancel    speaking=false pending=false
 133955 tv    music:plan   from=lobby to=null
 133955 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 135202 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135455 tv    music:stop   track=george-street-shuffle.mp3
 136915 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 138215 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 139516 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140522 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141571 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144124 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144318 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144506 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144695 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 145776 tv    ss:cancel    speaking=false pending=false
 145779 tv    ss:cancel    speaking=false pending=false
 145779 tv    music:plan   from=null to=lobby
 145779 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 147790 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 147798 tv    ss:cancel    speaking=false pending=false
 147800 tv    music:plan   from=lobby to=null
 147800 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149301 tv    music:stop   track=airport-lounge.mp3
 149345 tv    music:plan   from=null to=game:broken-pencil
 149345 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 149345 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150801 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151256 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151418 tv    music:plan   from=game:broken-pencil to=null
 151418 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 152920 tv    music:stop   track=backbay-lounge.mp3
```
