# Audio interaction trace

Captured 2026-09-18T18:38:57.921Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**56 / 56 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:bossa-antigua
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":4.4}]

```
   1852 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   1884 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3206 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3343 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   4056 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4693 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5543 tv    ss:cancel    speaking=false pending=false
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
   6387 tv    music:plan   from=lobby to=null
   6387 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7896 tv    music:stop   track=bossa-antigua.mp3
   8330 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9627 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16582 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17581 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18581 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19581 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20581 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21397 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22204 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22363 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22522 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22680 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22840 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22998 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23138 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23295 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23453 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23610 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23768 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23927 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24084 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24241 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24400 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24554 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24695 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24853 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  25013 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25876 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26209 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  28016 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29751 tv    ss:cancel    speaking=false pending=false
  29751 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":1.5}]

```
  31305 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33469 tv    ss:cancel    speaking=false pending=false
  33469 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  35021 tv    ss:cancel    speaking=false pending=false
  35021 tv    music:plan   from=null to=lobby
  35021 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:local-forecast-elevator.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+955ms phone@+972ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,silence,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,silence,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer,silence cheer@+5355ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5410ms cheer@+5365ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36583 tv    music:plan   from=lobby to=game:bingo
  36583 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36583 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36886 tv    hush
  36886 tv    hush
  37384 tv    music:stop   track=local-forecast-elevator.mp3
  37497 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38589 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39588 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40587 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41584 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  41584 tv    speak        text=b9.wav voice=clip delayMs=190
  41585 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41776 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43223 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  43223 tv    speak        text=b8.wav voice=clip delayMs=190
  43414 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45052 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  45052 tv    speak        text=n34.wav voice=clip delayMs=190
  45242 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46923 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47178 tv    hush
  47178 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47179 tv    hush
  52535 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  52537 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55538 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56539 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57539 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58546 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  58546 tv    speak        text=n35.wav voice=clip delayMs=190
  58737 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60355 tv    music:paused paused=true
  60355 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61606 tv    music:paused paused=false
  61606 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62890 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  62890 tv    speak        text=i25.wav voice=clip delayMs=190
  63017 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  63017 tv    speak        text=n45.wav voice=clip delayMs=190
  63142 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  63142 tv    speak        text=n33.wav voice=clip delayMs=190
  63271 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  63271 tv    speak        text=g49.wav voice=clip delayMs=190
  63394 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  63394 tv    speak        text=b4.wav voice=clip delayMs=190
  63518 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  63518 tv    speak        text=i20.wav voice=clip delayMs=190
  63641 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  63641 tv    speak        text=o69.wav voice=clip delayMs=190
  63766 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  63766 tv    speak        text=o67.wav voice=clip delayMs=190
  63892 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  63892 tv    speak        text=o65.wav voice=clip delayMs=190
  64019 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  64019 tv    speak        text=o73.wav voice=clip delayMs=190
  64145 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  64145 tv    speak        text=i21.wav voice=clip delayMs=190
  64276 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  64276 tv    speak        text=i18.wav voice=clip delayMs=190
  64396 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  64396 tv    speak        text=g58.wav voice=clip delayMs=190
  64524 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  64524 tv    speak        text=n36.wav voice=clip delayMs=190
  64653 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  64653 tv    speak        text=o61.wav voice=clip delayMs=190
  64772 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  64772 tv    speak        text=n37.wav voice=clip delayMs=190
  64900 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  64900 tv    speak        text=i16.wav voice=clip delayMs=190
  65021 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  65021 tv    speak        text=g47.wav voice=clip delayMs=190
  65151 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  65151 tv    speak        text=n41.wav voice=clip delayMs=190
  65277 tv    clip         src=b6.wav muted=false ready=true delayMs=190
  65277 tv    speak        text=b6.wav voice=clip delayMs=190
  65398 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  65398 tv    speak        text=o72.wav voice=clip delayMs=190
  65525 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  65525 tv    speak        text=b3.wav voice=clip delayMs=190
  65650 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  65650 tv    speak        text=i30.wav voice=clip delayMs=190
  65775 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  65775 tv    speak        text=g56.wav voice=clip delayMs=190
  65901 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  65901 tv    speak        text=o75.wav voice=clip delayMs=190
  66027 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  66027 tv    speak        text=b1.wav voice=clip delayMs=190
  66140 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  66140 tv    speak        text=b2.wav voice=clip delayMs=190
  66268 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  66268 tv    speak        text=n32.wav voice=clip delayMs=190
  66390 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  66390 tv    speak        text=g48.wav voice=clip delayMs=190
  66519 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  66519 tv    speak        text=i23.wav voice=clip delayMs=190
  66644 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  66644 tv    speak        text=i26.wav voice=clip delayMs=190
  66770 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  66770 tv    speak        text=o66.wav voice=clip delayMs=190
  66896 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  66896 tv    speak        text=i19.wav voice=clip delayMs=190
  67023 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  67023 tv    speak        text=n42.wav voice=clip delayMs=190
  67152 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  67152 tv    speak        text=i24.wav voice=clip delayMs=190
  67278 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  67278 tv    speak        text=n39.wav voice=clip delayMs=190
  67406 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  67406 tv    speak        text=g46.wav voice=clip delayMs=190
  67530 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  67530 tv    speak        text=n44.wav voice=clip delayMs=190
  67657 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  67657 tv    speak        text=b15.wav voice=clip delayMs=190
  67788 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  67788 tv    speak        text=b11.wav voice=clip delayMs=190
  67912 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  67912 tv    speak        text=g57.wav voice=clip delayMs=190
  68109 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  68533 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68819 tv    hush
  68819 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68820 tv    hush
  70694 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  74173 tv    music:duck   ms=9000
  74174 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  74225 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79003 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79318 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80319 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81320 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82328 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  82328 tv    speak        text=g57.wav voice=clip delayMs=190
  82519 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84632 tv    ss:cancel    speaking=false pending=false
  84632 tv    music:plan   from=game:bingo to=null
  84634 tv    ss:cancel    speaking=false pending=false
  84634 tv    music:plan   from=null to=lobby
  84634 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  85435 tv    music:stop   track=cool-vibes.mp3
  87151 tv    ss:cancel    speaking=false pending=false
  87160 tv    music:plan   from=lobby to=game:bingo
  87160 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  87160 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  87163 tv    hush
  87164 tv    hush
  87778 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  87778 tv    speak        text=i21.wav voice=clip delayMs=190
  87778 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  87821 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  87821 tv    speak        text=n32.wav voice=clip delayMs=190
  87917 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  87917 tv    speak        text=i18.wav voice=clip delayMs=190
  87961 tv    music:stop   track=bossa-antigua.mp3
  88011 tv    clip         src=n40.wav muted=false ready=true delayMs=190
  88011 tv    speak        text=n40.wav voice=clip delayMs=190
  88106 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  88106 tv    speak        text=i30.wav voice=clip delayMs=190
  88201 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  88201 tv    speak        text=o69.wav voice=clip delayMs=190
  88301 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  88301 tv    speak        text=o61.wav voice=clip delayMs=190
  88390 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  88390 tv    speak        text=n34.wav voice=clip delayMs=190
  88489 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  88489 tv    speak        text=n35.wav voice=clip delayMs=190
  88594 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  88594 tv    speak        text=o67.wav voice=clip delayMs=190
  88694 tv    clip         src=g55.wav muted=false ready=true delayMs=190
  88694 tv    speak        text=g55.wav voice=clip delayMs=190
  88784 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  88784 tv    speak        text=i26.wav voice=clip delayMs=190
  88876 tv    clip         src=i22.wav muted=false ready=true delayMs=190
  88876 tv    speak        text=i22.wav voice=clip delayMs=190
  88973 tv    clip         src=i29.wav muted=false ready=true delayMs=190
  88973 tv    speak        text=i29.wav voice=clip delayMs=190
  89064 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  89064 tv    speak        text=o66.wav voice=clip delayMs=190
  89143 tv    clip         src=g51.wav muted=false ready=true delayMs=190
  89143 tv    speak        text=g51.wav voice=clip delayMs=190
  89243 tv    clip         src=g53.wav muted=false ready=true delayMs=190
  89243 tv    speak        text=g53.wav voice=clip delayMs=190
  89335 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  89335 tv    speak        text=b9.wav voice=clip delayMs=190
  89431 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  89431 tv    speak        text=n36.wav voice=clip delayMs=190
  89518 tv    clip         src=g52.wav muted=false ready=true delayMs=190
  89518 tv    speak        text=g52.wav voice=clip delayMs=190
  89614 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  89614 tv    speak        text=b1.wav voice=clip delayMs=190
  89707 tv    clip         src=b13.wav muted=false ready=true delayMs=190
  89707 tv    speak        text=b13.wav voice=clip delayMs=190
  89801 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  89801 tv    speak        text=n37.wav voice=clip delayMs=190
  89901 tv    clip         src=o71.wav muted=false ready=true delayMs=190
  89901 tv    speak        text=o71.wav voice=clip delayMs=190
  90006 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  90006 tv    speak        text=b8.wav voice=clip delayMs=190
  90103 tv    clip         src=b5.wav muted=false ready=true delayMs=190
  90103 tv    speak        text=b5.wav voice=clip delayMs=190
  90197 tv    clip         src=b7.wav muted=false ready=true delayMs=190
  90197 tv    speak        text=b7.wav voice=clip delayMs=190
  90293 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  90293 tv    speak        text=n42.wav voice=clip delayMs=190
  90404 tv    clip         src=i28.wav muted=false ready=true delayMs=190
  90404 tv    speak        text=i28.wav voice=clip delayMs=190
  90480 tv    clip         src=i27.wav muted=false ready=true delayMs=190
  90480 tv    speak        text=i27.wav voice=clip delayMs=190
  90590 tv    clip         src=o63.wav muted=false ready=true delayMs=190
  90590 tv    speak        text=o63.wav voice=clip delayMs=190
  90683 tv    clip         src=o64.wav muted=false ready=true delayMs=190
  90683 tv    speak        text=o64.wav voice=clip delayMs=190
  90775 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  90775 tv    speak        text=o73.wav voice=clip delayMs=190
  90871 tv    clip         src=g50.wav muted=false ready=true delayMs=190
  90871 tv    speak        text=g50.wav voice=clip delayMs=190
  90963 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  90963 tv    speak        text=g48.wav voice=clip delayMs=190
  91052 tv    clip         src=b12.wav muted=false ready=true delayMs=190
  91052 tv    speak        text=b12.wav voice=clip delayMs=190
  91147 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  91147 tv    speak        text=n45.wav voice=clip delayMs=190
  91227 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  91227 tv    speak        text=b4.wav voice=clip delayMs=190
  91331 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  91331 tv    speak        text=g46.wav voice=clip delayMs=190
  91428 tv    clip         src=o74.wav muted=false ready=true delayMs=190
  91428 tv    speak        text=o74.wav voice=clip delayMs=190
  91525 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  91525 tv    speak        text=g47.wav voice=clip delayMs=190
  91603 tv    clip         src=n31.wav muted=false ready=true delayMs=190
  91603 tv    speak        text=n31.wav voice=clip delayMs=190
  91698 tv    clip         src=o62.wav muted=false ready=true delayMs=190
  91698 tv    speak        text=o62.wav voice=clip delayMs=190
  91790 tv    clip         src=b10.wav muted=false ready=true delayMs=190
  91790 tv    speak        text=b10.wav voice=clip delayMs=190
  91884 tv    clip         src=g60.wav muted=false ready=true delayMs=190
  91884 tv    speak        text=g60.wav voice=clip delayMs=190
  91977 tv    clip         src=n38.wav muted=false ready=true delayMs=190
  91977 tv    speak        text=n38.wav voice=clip delayMs=190
  92073 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  92073 tv    speak        text=n39.wav voice=clip delayMs=190
  92167 tv    clip         src=o70.wav muted=false ready=true delayMs=190
  92167 tv    speak        text=o70.wav voice=clip delayMs=190
  92257 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  92257 tv    speak        text=b11.wav voice=clip delayMs=190
  92355 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  92355 tv    speak        text=o75.wav voice=clip delayMs=190
  92450 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  92450 tv    speak        text=g58.wav voice=clip delayMs=190
  92542 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  92542 tv    speak        text=b15.wav voice=clip delayMs=190
  92637 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  92637 tv    speak        text=i24.wav voice=clip delayMs=190
  92735 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  92735 tv    speak        text=o72.wav voice=clip delayMs=190
  92827 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  92827 tv    speak        text=g56.wav voice=clip delayMs=190
  92917 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  92917 tv    speak        text=i20.wav voice=clip delayMs=190
  92997 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  92997 tv    speak        text=n44.wav voice=clip delayMs=190
  93095 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  93095 tv    speak        text=b3.wav voice=clip delayMs=190
  93186 tv    clip         src=o68.wav muted=false ready=true delayMs=190
  93186 tv    speak        text=o68.wav voice=clip delayMs=190
  93278 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  93278 tv    speak        text=b2.wav voice=clip delayMs=190
  93376 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  93376 tv    speak        text=n41.wav voice=clip delayMs=190
  93470 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  93470 tv    speak        text=o65.wav voice=clip delayMs=190
  93563 tv    clip         src=i17.wav muted=false ready=true delayMs=190
  93563 tv    speak        text=i17.wav voice=clip delayMs=190
  93658 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  93658 tv    speak        text=i25.wav voice=clip delayMs=190
  93748 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  93748 tv    speak        text=i19.wav voice=clip delayMs=190
  93844 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  93844 tv    speak        text=g57.wav voice=clip delayMs=190
  93943 tv    clip         src=g59.wav muted=false ready=true delayMs=190
  93943 tv    speak        text=g59.wav voice=clip delayMs=190
  94037 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  94037 tv    speak        text=g49.wav voice=clip delayMs=190
  94129 tv    clip         src=n43.wav muted=false ready=true delayMs=190
  94129 tv    speak        text=n43.wav voice=clip delayMs=190
  94220 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  94220 tv    speak        text=i16.wav voice=clip delayMs=190
  94317 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  94317 tv    speak        text=n33.wav voice=clip delayMs=190
  94408 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  94408 tv    speak        text=i23.wav voice=clip delayMs=190
  94509 tv    clip         src=g54.wav muted=false ready=true delayMs=190
  94509 tv    speak        text=g54.wav voice=clip delayMs=190
  94604 tv    clip         src=b14.wav muted=false ready=true delayMs=190
  94604 tv    speak        text=b14.wav voice=clip delayMs=190
  94795 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  95820 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  96089 tv    hush
  96089 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  96089 tv    hush
 103692 tv    music:duck   ms=9000
 103692 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108716 tv    hush
 108717 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108717 tv    hush
 112710 tv    ss:cancel    speaking=false pending=false
 112710 tv    music:plan   from=game:bingo to=null
 112710 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 114211 tv    music:stop   track=wallpaper.mp3
 114314 tv    ss:cancel    speaking=false pending=false
 114314 tv    music:plan   from=null to=lobby
 114314 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 116830 tv    ss:cancel    speaking=false pending=false
 116839 tv    music:plan   from=lobby to=game:bingo
 116839 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116839 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116843 tv    hush
 116843 tv    hush
 117454 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117460 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 117460 tv    speak        text=i21.wav voice=clip delayMs=190
 117476 tv    clip         src=n32.wav muted=false ready=true delayMs=190
 117476 tv    speak        text=n32.wav voice=clip delayMs=190
 117570 tv    clip         src=i18.wav muted=false ready=true delayMs=190
 117570 tv    speak        text=i18.wav voice=clip delayMs=190
 117640 tv    music:stop   track=local-forecast-elevator.mp3
 117649 tv    clip         src=n40.wav muted=false ready=true delayMs=190
 117649 tv    speak        text=n40.wav voice=clip delayMs=190
 117744 tv    clip         src=i30.wav muted=false ready=true delayMs=190
 117744 tv    speak        text=i30.wav voice=clip delayMs=190
 117840 tv    clip         src=o69.wav muted=false ready=true delayMs=190
 117840 tv    speak        text=o69.wav voice=clip delayMs=190
 117919 tv    clip         src=o61.wav muted=false ready=true delayMs=190
 117920 tv    speak        text=o61.wav voice=clip delayMs=190
 118014 tv    clip         src=n34.wav muted=false ready=true delayMs=190
 118014 tv    speak        text=n34.wav voice=clip delayMs=190
 118108 tv    clip         src=n35.wav muted=false ready=true delayMs=190
 118108 tv    speak        text=n35.wav voice=clip delayMs=190
 118201 tv    clip         src=o67.wav muted=false ready=true delayMs=190
 118201 tv    speak        text=o67.wav voice=clip delayMs=190
 118297 tv    clip         src=g55.wav muted=false ready=true delayMs=190
 118297 tv    speak        text=g55.wav voice=clip delayMs=190
 118390 tv    clip         src=i26.wav muted=false ready=true delayMs=190
 118390 tv    speak        text=i26.wav voice=clip delayMs=190
 118485 tv    clip         src=i22.wav muted=false ready=true delayMs=190
 118485 tv    speak        text=i22.wav voice=clip delayMs=190
 118582 tv    clip         src=i29.wav muted=false ready=true delayMs=190
 118582 tv    speak        text=i29.wav voice=clip delayMs=190
 118676 tv    clip         src=o66.wav muted=false ready=true delayMs=190
 118676 tv    speak        text=o66.wav voice=clip delayMs=190
 118769 tv    clip         src=g51.wav muted=false ready=true delayMs=190
 118769 tv    speak        text=g51.wav voice=clip delayMs=190
 118865 tv    clip         src=g53.wav muted=false ready=true delayMs=190
 118865 tv    speak        text=g53.wav voice=clip delayMs=190
 118959 tv    clip         src=b9.wav muted=false ready=true delayMs=190
 118959 tv    speak        text=b9.wav voice=clip delayMs=190
 119053 tv    clip         src=n36.wav muted=false ready=true delayMs=190
 119053 tv    speak        text=n36.wav voice=clip delayMs=190
 119148 tv    clip         src=g52.wav muted=false ready=true delayMs=190
 119148 tv    speak        text=g52.wav voice=clip delayMs=190
 119242 tv    clip         src=b1.wav muted=false ready=true delayMs=190
 119242 tv    speak        text=b1.wav voice=clip delayMs=190
 119335 tv    clip         src=b13.wav muted=false ready=true delayMs=190
 119335 tv    speak        text=b13.wav voice=clip delayMs=190
 119430 tv    clip         src=n37.wav muted=false ready=true delayMs=190
 119430 tv    speak        text=n37.wav voice=clip delayMs=190
 119525 tv    clip         src=o71.wav muted=false ready=true delayMs=190
 119525 tv    speak        text=o71.wav voice=clip delayMs=190
 119620 tv    clip         src=b8.wav muted=false ready=true delayMs=190
 119620 tv    speak        text=b8.wav voice=clip delayMs=190
 119715 tv    clip         src=b5.wav muted=false ready=true delayMs=190
 119715 tv    speak        text=b5.wav voice=clip delayMs=190
 119809 tv    clip         src=b7.wav muted=false ready=true delayMs=190
 119809 tv    speak        text=b7.wav voice=clip delayMs=190
 119887 tv    clip         src=n42.wav muted=false ready=true delayMs=190
 119887 tv    speak        text=n42.wav voice=clip delayMs=190
 119981 tv    clip         src=i28.wav muted=false ready=true delayMs=190
 119981 tv    speak        text=i28.wav voice=clip delayMs=190
 120081 tv    clip         src=i27.wav muted=false ready=true delayMs=190
 120081 tv    speak        text=i27.wav voice=clip delayMs=190
 120171 tv    clip         src=o63.wav muted=false ready=true delayMs=190
 120171 tv    speak        text=o63.wav voice=clip delayMs=190
 120267 tv    clip         src=o64.wav muted=false ready=true delayMs=190
 120267 tv    speak        text=o64.wav voice=clip delayMs=190
 120360 tv    clip         src=o73.wav muted=false ready=true delayMs=190
 120360 tv    speak        text=o73.wav voice=clip delayMs=190
 120453 tv    clip         src=g50.wav muted=false ready=true delayMs=190
 120453 tv    speak        text=g50.wav voice=clip delayMs=190
 120546 tv    clip         src=g48.wav muted=false ready=true delayMs=190
 120546 tv    speak        text=g48.wav voice=clip delayMs=190
 120641 tv    clip         src=b12.wav muted=false ready=true delayMs=190
 120641 tv    speak        text=b12.wav voice=clip delayMs=190
 120738 tv    clip         src=n45.wav muted=false ready=true delayMs=190
 120738 tv    speak        text=n45.wav voice=clip delayMs=190
 120833 tv    clip         src=b4.wav muted=false ready=true delayMs=190
 120833 tv    speak        text=b4.wav voice=clip delayMs=190
 120928 tv    clip         src=g46.wav muted=false ready=true delayMs=190
 120928 tv    speak        text=g46.wav voice=clip delayMs=190
 121023 tv    clip         src=o74.wav muted=false ready=true delayMs=190
 121023 tv    speak        text=o74.wav voice=clip delayMs=190
 121116 tv    clip         src=g47.wav muted=false ready=true delayMs=190
 121116 tv    speak        text=g47.wav voice=clip delayMs=190
 121212 tv    clip         src=n31.wav muted=false ready=true delayMs=190
 121212 tv    speak        text=n31.wav voice=clip delayMs=190
 121307 tv    clip         src=o62.wav muted=false ready=true delayMs=190
 121307 tv    speak        text=o62.wav voice=clip delayMs=190
 121401 tv    clip         src=b10.wav muted=false ready=true delayMs=190
 121401 tv    speak        text=b10.wav voice=clip delayMs=190
 121496 tv    clip         src=g60.wav muted=false ready=true delayMs=190
 121496 tv    speak        text=g60.wav voice=clip delayMs=190
 121590 tv    clip         src=n38.wav muted=false ready=true delayMs=190
 121590 tv    speak        text=n38.wav voice=clip delayMs=190
 121699 tv    clip         src=n39.wav muted=false ready=true delayMs=190
 121699 tv    speak        text=n39.wav voice=clip delayMs=190
 121794 tv    clip         src=o70.wav muted=false ready=true delayMs=190
 121794 tv    speak        text=o70.wav voice=clip delayMs=190
 121887 tv    clip         src=b11.wav muted=false ready=true delayMs=190
 121887 tv    speak        text=b11.wav voice=clip delayMs=190
 121981 tv    clip         src=o75.wav muted=false ready=true delayMs=190
 121981 tv    speak        text=o75.wav voice=clip delayMs=190
 122076 tv    clip         src=g58.wav muted=false ready=true delayMs=190
 122076 tv    speak        text=g58.wav voice=clip delayMs=190
 122171 tv    clip         src=b15.wav muted=false ready=true delayMs=190
 122171 tv    speak        text=b15.wav voice=clip delayMs=190
 122267 tv    clip         src=i24.wav muted=false ready=true delayMs=190
 122267 tv    speak        text=i24.wav voice=clip delayMs=190
 122375 tv    clip         src=o72.wav muted=false ready=true delayMs=190
 122375 tv    speak        text=o72.wav voice=clip delayMs=190
 122469 tv    clip         src=g56.wav muted=false ready=true delayMs=190
 122469 tv    speak        text=g56.wav voice=clip delayMs=190
 122549 tv    clip         src=i20.wav muted=false ready=true delayMs=190
 122549 tv    speak        text=i20.wav voice=clip delayMs=190
 122643 tv    clip         src=n44.wav muted=false ready=true delayMs=190
 122643 tv    speak        text=n44.wav voice=clip delayMs=190
 122738 tv    clip         src=b3.wav muted=false ready=true delayMs=190
 122738 tv    speak        text=b3.wav voice=clip delayMs=190
 122817 tv    clip         src=o68.wav muted=false ready=true delayMs=190
 122817 tv    speak        text=o68.wav voice=clip delayMs=190
 122912 tv    clip         src=b2.wav muted=false ready=true delayMs=190
 122912 tv    speak        text=b2.wav voice=clip delayMs=190
 122993 tv    clip         src=n41.wav muted=false ready=true delayMs=190
 122993 tv    speak        text=n41.wav voice=clip delayMs=190
 123087 tv    clip         src=o65.wav muted=false ready=true delayMs=190
 123087 tv    speak        text=o65.wav voice=clip delayMs=190
 123179 tv    clip         src=i17.wav muted=false ready=true delayMs=190
 123179 tv    speak        text=i17.wav voice=clip delayMs=190
 123273 tv    clip         src=i25.wav muted=false ready=true delayMs=190
 123273 tv    speak        text=i25.wav voice=clip delayMs=190
 123368 tv    clip         src=i19.wav muted=false ready=true delayMs=190
 123368 tv    speak        text=i19.wav voice=clip delayMs=190
 123462 tv    clip         src=g57.wav muted=false ready=true delayMs=190
 123462 tv    speak        text=g57.wav voice=clip delayMs=190
 123542 tv    clip         src=g59.wav muted=false ready=true delayMs=190
 123542 tv    speak        text=g59.wav voice=clip delayMs=190
 123637 tv    clip         src=g49.wav muted=false ready=true delayMs=190
 123637 tv    speak        text=g49.wav voice=clip delayMs=190
 123731 tv    clip         src=n43.wav muted=false ready=true delayMs=190
 123731 tv    speak        text=n43.wav voice=clip delayMs=190
 123827 tv    clip         src=i16.wav muted=false ready=true delayMs=190
 123827 tv    speak        text=i16.wav voice=clip delayMs=190
 123920 tv    clip         src=n33.wav muted=false ready=true delayMs=190
 123920 tv    speak        text=n33.wav voice=clip delayMs=190
 124018 tv    clip         src=i23.wav muted=false ready=true delayMs=190
 124018 tv    speak        text=i23.wav voice=clip delayMs=190
 124109 tv    clip         src=g54.wav muted=false ready=true delayMs=190
 124109 tv    speak        text=g54.wav voice=clip delayMs=190
 124203 tv    clip         src=b14.wav muted=false ready=true delayMs=190
 124203 tv    speak        text=b14.wav voice=clip delayMs=190
 124393 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 125451 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 125714 tv    hush
 125714 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 125715 tv    hush
 133323 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 133331 tv    music:duck   ms=9000
 133331 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 138330 tv    hush
 138330 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 138330 tv    hush
 139879 tv    ss:cancel    speaking=false pending=false
 139879 tv    music:plan   from=game:bingo to=null
 139882 tv    ss:cancel    speaking=false pending=false
 139882 tv    music:plan   from=null to=lobby
 139882 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 140682 tv    music:stop   track=wallpaper.mp3
 142387 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 142399 tv    ss:cancel    speaking=false pending=false
 142402 tv    music:plan   from=lobby to=game:bingo
 142402 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 142402 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 142406 tv    hush
 142407 tv    hush
 143017 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 143202 tv    music:stop   track=local-forecast-elevator.mp3
 144408 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 144549 tv    ss:cancel    speaking=false pending=false
 144550 tv    music:plan   from=game:bingo to=null
 144550 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 146050 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 146666 tv    ss:cancel    speaking=false pending=false
 146666 tv    music:plan   from=null to=lobby
 146666 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 150019 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 150030 tv    ss:cancel    speaking=false pending=false
 150035 tv    music:plan   from=lobby to=game:bingo
 150035 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 150035 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 150039 tv    hush
 150039 tv    hush
 150463 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 150463 tv    speak        text=i21.wav voice=clip delayMs=190
 150464 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150654 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 150836 tv    music:stop   track=local-forecast-elevator.mp3
 150964 tv    ss:cancel    speaking=false pending=false
 150964 tv    music:plan   from=game:bingo to=null
 150967 tv    ss:cancel    speaking=false pending=false
 150967 tv    music:plan   from=null to=lobby
 150967 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 151768 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 156550 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156967 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157399 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157814 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158232 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 159315 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 159916 tv    ss:cancel    speaking=false pending=false
 159920 tv    music:plan   from=lobby to=null
 159920 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 161179 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 161421 tv    music:stop   track=george-street-shuffle.mp3
 162783 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 164083 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 165385 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 166399 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 167440 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 170010 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 170201 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 170391 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 170579 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 171678 tv    ss:cancel    speaking=false pending=false
 171681 tv    ss:cancel    speaking=false pending=false
 171681 tv    music:plan   from=null to=lobby
 171681 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 173697 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 173704 tv    ss:cancel    speaking=false pending=false
 173706 tv    music:plan   from=lobby to=null
 173706 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 175207 tv    music:stop   track=airport-lounge.mp3
 175250 tv    music:plan   from=null to=game:broken-pencil
 175250 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 175250 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 176732 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 177207 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 177362 tv    music:plan   from=game:broken-pencil to=null
 177362 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 178863 tv    music:stop   track=hep-cats.mp3
```
