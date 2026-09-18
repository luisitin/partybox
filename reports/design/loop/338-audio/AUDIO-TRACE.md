# Audio interaction trace

Captured 2026-09-18T22:31:59.670Z on port 42166. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**59 / 59 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.4}]

```
   1755 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1781 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3108 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3245 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3937 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4578 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5428 tv    ss:cancel    speaking=false pending=false
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
   6270 tv    music:plan   from=lobby to=null
   6270 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7772 tv    music:stop   track=airport-lounge.mp3
   8208 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9479 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16468 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17461 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18468 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19465 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20466 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21279 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22071 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22230 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22382 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22541 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22698 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22856 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23014 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23170 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23327 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23484 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23641 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23797 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23951 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24112 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24266 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24423 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24579 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24738 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24894 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25780 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26111 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27919 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29657 tv    ss:cancel    speaking=false pending=false
  29657 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31205 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33374 tv    ss:cancel    speaking=false pending=false
  33374 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34924 tv    ss:cancel    speaking=false pending=false
  34924 tv    music:plan   from=null to=lobby
  34924 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+964ms phone@+972ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **each voice starts on the push (no delay); its boing lands on the squash, 170–230 ms later** — delays=0,0 boing lags=191,190ms
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,silence,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,silence,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":24.9}]
- ✅ **skipping through the deck: a hush before every call, one voice at a time** — clips=41 hushes=41
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer,silence cheer@+5354ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the winner's celebration buzz (320 ms) runs whole — nothing shorter cuts it** — celebration@73603 cut by=[]
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5408ms cheer@+5365ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36501 tv    music:plan   from=lobby to=game:bingo
  36501 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36501 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36806 tv    hush
  36806 tv    hush
  37302 tv    music:stop   track=bossa-antigua.mp3
  37416 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38507 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39507 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40508 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41507 tv    hush
  41507 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  41507 tv    speak        text=b9.wav voice=clip delayMs=0
  41508 tv    hush
  41699 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43135 tv    hush
  43135 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  43135 tv    speak        text=b8.wav voice=clip delayMs=0
  43326 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44959 tv    hush
  44959 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  44959 tv    speak        text=n34.wav voice=clip delayMs=0
  45149 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46825 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47087 tv    hush
  47087 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47087 tv    hush
  52433 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  52440 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55447 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56449 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57449 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58447 tv    hush
  58447 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  58447 tv    speak        text=n35.wav voice=clip delayMs=0
  58639 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60241 tv    music:paused paused=true
  60241 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61508 tv    music:paused paused=false
  61508 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62814 tv    hush
  62814 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  62814 tv    speak        text=i25.wav voice=clip delayMs=0
  62940 tv    hush
  62940 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  62940 tv    speak        text=n45.wav voice=clip delayMs=0
  63071 tv    hush
  63071 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  63071 tv    speak        text=n33.wav voice=clip delayMs=0
  63191 tv    hush
  63191 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  63191 tv    speak        text=g49.wav voice=clip delayMs=0
  63310 tv    hush
  63310 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  63310 tv    speak        text=b4.wav voice=clip delayMs=0
  63430 tv    hush
  63430 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  63430 tv    speak        text=i20.wav voice=clip delayMs=0
  63550 tv    hush
  63550 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  63550 tv    speak        text=o69.wav voice=clip delayMs=0
  63678 tv    hush
  63678 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  63678 tv    speak        text=o67.wav voice=clip delayMs=0
  63804 tv    hush
  63804 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  63804 tv    speak        text=o65.wav voice=clip delayMs=0
  63929 tv    hush
  63929 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  63929 tv    speak        text=o73.wav voice=clip delayMs=0
  64060 tv    hush
  64060 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  64060 tv    speak        text=i21.wav voice=clip delayMs=0
  64189 tv    hush
  64189 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  64189 tv    speak        text=i18.wav voice=clip delayMs=0
  64312 tv    hush
  64312 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  64312 tv    speak        text=g58.wav voice=clip delayMs=0
  64438 tv    hush
  64438 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  64438 tv    speak        text=n36.wav voice=clip delayMs=0
  64561 tv    hush
  64561 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  64561 tv    speak        text=o61.wav voice=clip delayMs=0
  64684 tv    hush
  64684 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  64684 tv    speak        text=n37.wav voice=clip delayMs=0
  64807 tv    hush
  64807 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  64807 tv    speak        text=i16.wav voice=clip delayMs=0
  64941 tv    hush
  64941 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  64941 tv    speak        text=g47.wav voice=clip delayMs=0
  65060 tv    hush
  65060 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  65060 tv    speak        text=n41.wav voice=clip delayMs=0
  65192 tv    hush
  65192 tv    clip         src=b6.wav muted=false ready=true delayMs=0
  65192 tv    speak        text=b6.wav voice=clip delayMs=0
  65311 tv    hush
  65311 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  65311 tv    speak        text=o72.wav voice=clip delayMs=0
  65437 tv    hush
  65437 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  65437 tv    speak        text=b3.wav voice=clip delayMs=0
  65566 tv    hush
  65566 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  65566 tv    speak        text=i30.wav voice=clip delayMs=0
  65677 tv    hush
  65677 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  65677 tv    speak        text=g56.wav voice=clip delayMs=0
  65795 tv    hush
  65795 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  65795 tv    speak        text=o75.wav voice=clip delayMs=0
  65926 tv    hush
  65926 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  65926 tv    speak        text=b1.wav voice=clip delayMs=0
  66050 tv    hush
  66050 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  66050 tv    speak        text=b2.wav voice=clip delayMs=0
  66182 tv    hush
  66182 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  66182 tv    speak        text=n32.wav voice=clip delayMs=0
  66301 tv    hush
  66301 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  66301 tv    speak        text=g48.wav voice=clip delayMs=0
  66425 tv    hush
  66425 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  66425 tv    speak        text=i23.wav voice=clip delayMs=0
  66559 tv    hush
  66559 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  66559 tv    speak        text=i26.wav voice=clip delayMs=0
  66682 tv    hush
  66682 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  66682 tv    speak        text=o66.wav voice=clip delayMs=0
  66805 tv    hush
  66805 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  66805 tv    speak        text=i19.wav voice=clip delayMs=0
  66934 tv    hush
  66934 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  66934 tv    speak        text=n42.wav voice=clip delayMs=0
  67057 tv    hush
  67057 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  67057 tv    speak        text=i24.wav voice=clip delayMs=0
  67166 tv    hush
  67166 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  67166 tv    speak        text=n39.wav voice=clip delayMs=0
  67295 tv    hush
  67295 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  67295 tv    speak        text=g46.wav voice=clip delayMs=0
  67409 tv    hush
  67409 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  67409 tv    speak        text=n44.wav voice=clip delayMs=0
  67528 tv    hush
  67528 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  67528 tv    speak        text=b15.wav voice=clip delayMs=0
  67655 tv    hush
  67655 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  67655 tv    speak        text=b11.wav voice=clip delayMs=0
  67777 tv    hush
  67777 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  67777 tv    speak        text=g57.wav voice=clip delayMs=0
  67967 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  68407 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68691 tv    hush
  68691 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68691 tv    hush
  70564 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  74045 tv    music:duck   ms=9000
  74045 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  74096 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  78846 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79175 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80177 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81176 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82182 tv    hush
  82182 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  82182 tv    speak        text=g57.wav voice=clip delayMs=0
  82372 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84483 tv    ss:cancel    speaking=false pending=false
  84483 tv    music:plan   from=game:bingo to=null
  84486 tv    ss:cancel    speaking=false pending=false
  84486 tv    music:plan   from=null to=lobby
  84486 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  85296 tv    music:stop   track=cool-vibes.mp3
  87004 tv    ss:cancel    speaking=false pending=false
  87012 tv    music:plan   from=lobby to=game:bingo
  87012 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  87012 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  87015 tv    hush
  87016 tv    hush
  87627 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  87633 tv    hush
  87633 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  87633 tv    speak        text=i21.wav voice=clip delayMs=0
  87633 tv    hush
  87648 tv    hush
  87648 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  87648 tv    speak        text=n32.wav voice=clip delayMs=0
  87742 tv    hush
  87742 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  87742 tv    speak        text=i18.wav voice=clip delayMs=0
  87813 tv    music:stop   track=local-forecast-elevator.mp3
  87836 tv    hush
  87836 tv    clip         src=n40.wav muted=false ready=true delayMs=0
  87836 tv    speak        text=n40.wav voice=clip delayMs=0
  87931 tv    hush
  87931 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  87931 tv    speak        text=i30.wav voice=clip delayMs=0
  88025 tv    hush
  88025 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  88025 tv    speak        text=o69.wav voice=clip delayMs=0
  88119 tv    hush
  88119 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  88119 tv    speak        text=o61.wav voice=clip delayMs=0
  88217 tv    hush
  88217 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  88217 tv    speak        text=n34.wav voice=clip delayMs=0
  88310 tv    hush
  88310 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  88310 tv    speak        text=n35.wav voice=clip delayMs=0
  88402 tv    hush
  88402 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  88402 tv    speak        text=o67.wav voice=clip delayMs=0
  88497 tv    hush
  88497 tv    clip         src=g55.wav muted=false ready=true delayMs=0
  88497 tv    speak        text=g55.wav voice=clip delayMs=0
  88590 tv    hush
  88590 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  88590 tv    speak        text=i26.wav voice=clip delayMs=0
  88686 tv    hush
  88686 tv    clip         src=i22.wav muted=false ready=true delayMs=0
  88686 tv    speak        text=i22.wav voice=clip delayMs=0
  88780 tv    hush
  88780 tv    clip         src=i29.wav muted=false ready=true delayMs=0
  88780 tv    speak        text=i29.wav voice=clip delayMs=0
  88874 tv    hush
  88874 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  88874 tv    speak        text=o66.wav voice=clip delayMs=0
  88969 tv    hush
  88969 tv    clip         src=g51.wav muted=false ready=true delayMs=0
  88969 tv    speak        text=g51.wav voice=clip delayMs=0
  89064 tv    hush
  89064 tv    clip         src=g53.wav muted=false ready=true delayMs=0
  89064 tv    speak        text=g53.wav voice=clip delayMs=0
  89159 tv    hush
  89159 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  89159 tv    speak        text=b9.wav voice=clip delayMs=0
  89253 tv    hush
  89253 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  89253 tv    speak        text=n36.wav voice=clip delayMs=0
  89347 tv    hush
  89347 tv    clip         src=g52.wav muted=false ready=true delayMs=0
  89347 tv    speak        text=g52.wav voice=clip delayMs=0
  89442 tv    hush
  89442 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  89442 tv    speak        text=b1.wav voice=clip delayMs=0
  89537 tv    hush
  89537 tv    clip         src=b13.wav muted=false ready=true delayMs=0
  89537 tv    speak        text=b13.wav voice=clip delayMs=0
  89632 tv    hush
  89632 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  89632 tv    speak        text=n37.wav voice=clip delayMs=0
  89725 tv    hush
  89725 tv    clip         src=o71.wav muted=false ready=true delayMs=0
  89725 tv    speak        text=o71.wav voice=clip delayMs=0
  89819 tv    hush
  89819 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  89819 tv    speak        text=b8.wav voice=clip delayMs=0
  89914 tv    hush
  89914 tv    clip         src=b5.wav muted=false ready=true delayMs=0
  89914 tv    speak        text=b5.wav voice=clip delayMs=0
  90009 tv    hush
  90009 tv    clip         src=b7.wav muted=false ready=true delayMs=0
  90009 tv    speak        text=b7.wav voice=clip delayMs=0
  90105 tv    hush
  90105 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  90105 tv    speak        text=n42.wav voice=clip delayMs=0
  90201 tv    hush
  90201 tv    clip         src=i28.wav muted=false ready=true delayMs=0
  90201 tv    speak        text=i28.wav voice=clip delayMs=0
  90307 tv    hush
  90307 tv    clip         src=i27.wav muted=false ready=true delayMs=0
  90307 tv    speak        text=i27.wav voice=clip delayMs=0
  90417 tv    hush
  90417 tv    clip         src=o63.wav muted=false ready=true delayMs=0
  90417 tv    speak        text=o63.wav voice=clip delayMs=0
  90511 tv    hush
  90511 tv    clip         src=o64.wav muted=false ready=true delayMs=0
  90511 tv    speak        text=o64.wav voice=clip delayMs=0
  90605 tv    hush
  90605 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  90605 tv    speak        text=o73.wav voice=clip delayMs=0
  90713 tv    hush
  90713 tv    clip         src=g50.wav muted=false ready=true delayMs=0
  90713 tv    speak        text=g50.wav voice=clip delayMs=0
  90807 tv    hush
  90807 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  90807 tv    speak        text=g48.wav voice=clip delayMs=0
  90901 tv    hush
  90901 tv    clip         src=b12.wav muted=false ready=true delayMs=0
  90901 tv    speak        text=b12.wav voice=clip delayMs=0
  90995 tv    hush
  90995 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  90995 tv    speak        text=n45.wav voice=clip delayMs=0
  91090 tv    hush
  91090 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  91090 tv    speak        text=b4.wav voice=clip delayMs=0
  91170 tv    hush
  91170 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  91170 tv    speak        text=g46.wav voice=clip delayMs=0
  91266 tv    hush
  91266 tv    clip         src=o74.wav muted=false ready=true delayMs=0
  91266 tv    speak        text=o74.wav voice=clip delayMs=0
  91360 tv    hush
  91360 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  91360 tv    speak        text=g47.wav voice=clip delayMs=0
  91455 tv    hush
  91455 tv    clip         src=n31.wav muted=false ready=true delayMs=0
  91455 tv    speak        text=n31.wav voice=clip delayMs=0
  91550 tv    hush
  91550 tv    clip         src=o62.wav muted=false ready=true delayMs=0
  91550 tv    speak        text=o62.wav voice=clip delayMs=0
  91643 tv    hush
  91643 tv    clip         src=b10.wav muted=false ready=true delayMs=0
  91643 tv    speak        text=b10.wav voice=clip delayMs=0
  91738 tv    hush
  91738 tv    clip         src=g60.wav muted=false ready=true delayMs=0
  91738 tv    speak        text=g60.wav voice=clip delayMs=0
  91832 tv    hush
  91832 tv    clip         src=n38.wav muted=false ready=true delayMs=0
  91832 tv    speak        text=n38.wav voice=clip delayMs=0
  91926 tv    hush
  91926 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  91926 tv    speak        text=n39.wav voice=clip delayMs=0
  92021 tv    hush
  92021 tv    clip         src=o70.wav muted=false ready=true delayMs=0
  92021 tv    speak        text=o70.wav voice=clip delayMs=0
  92115 tv    hush
  92115 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  92115 tv    speak        text=b11.wav voice=clip delayMs=0
  92209 tv    hush
  92209 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  92209 tv    speak        text=o75.wav voice=clip delayMs=0
  92305 tv    hush
  92305 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  92305 tv    speak        text=g58.wav voice=clip delayMs=0
  92400 tv    hush
  92400 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  92400 tv    speak        text=b15.wav voice=clip delayMs=0
  92496 tv    hush
  92496 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  92496 tv    speak        text=i24.wav voice=clip delayMs=0
  92589 tv    hush
  92589 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  92589 tv    speak        text=o72.wav voice=clip delayMs=0
  92684 tv    hush
  92684 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  92684 tv    speak        text=g56.wav voice=clip delayMs=0
  92778 tv    hush
  92778 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  92778 tv    speak        text=i20.wav voice=clip delayMs=0
  92873 tv    hush
  92873 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  92873 tv    speak        text=n44.wav voice=clip delayMs=0
  92967 tv    hush
  92967 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  92967 tv    speak        text=b3.wav voice=clip delayMs=0
  93062 tv    hush
  93062 tv    clip         src=o68.wav muted=false ready=true delayMs=0
  93062 tv    speak        text=o68.wav voice=clip delayMs=0
  93156 tv    hush
  93156 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  93156 tv    speak        text=b2.wav voice=clip delayMs=0
  93251 tv    hush
  93251 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  93251 tv    speak        text=n41.wav voice=clip delayMs=0
  93346 tv    hush
  93346 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  93346 tv    speak        text=o65.wav voice=clip delayMs=0
  93425 tv    hush
  93425 tv    clip         src=i17.wav muted=false ready=true delayMs=0
  93425 tv    speak        text=i17.wav voice=clip delayMs=0
  93518 tv    hush
  93518 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  93518 tv    speak        text=i25.wav voice=clip delayMs=0
  93613 tv    hush
  93613 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  93613 tv    speak        text=i19.wav voice=clip delayMs=0
  93693 tv    hush
  93693 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  93693 tv    speak        text=g57.wav voice=clip delayMs=0
  93786 tv    hush
  93786 tv    clip         src=g59.wav muted=false ready=true delayMs=0
  93786 tv    speak        text=g59.wav voice=clip delayMs=0
  93879 tv    hush
  93879 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  93879 tv    speak        text=g49.wav voice=clip delayMs=0
  93972 tv    hush
  93972 tv    clip         src=n43.wav muted=false ready=true delayMs=0
  93972 tv    speak        text=n43.wav voice=clip delayMs=0
  94066 tv    hush
  94066 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  94066 tv    speak        text=i16.wav voice=clip delayMs=0
  94161 tv    hush
  94161 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  94161 tv    speak        text=n33.wav voice=clip delayMs=0
  94256 tv    hush
  94256 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  94256 tv    speak        text=i23.wav voice=clip delayMs=0
  94351 tv    hush
  94351 tv    clip         src=g54.wav muted=false ready=true delayMs=0
  94351 tv    speak        text=g54.wav voice=clip delayMs=0
  94447 tv    hush
  94447 tv    clip         src=b14.wav muted=false ready=true delayMs=0
  94447 tv    speak        text=b14.wav voice=clip delayMs=0
  94638 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  95672 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95933 tv    hush
  95933 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95933 tv    hush
 103537 tv    music:duck   ms=9000
 103537 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108554 tv    hush
 108554 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108554 tv    hush
 112554 tv    ss:cancel    speaking=false pending=false
 112554 tv    music:plan   from=game:bingo to=null
 112554 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 114055 tv    music:stop   track=wallpaper.mp3
 114166 tv    ss:cancel    speaking=false pending=false
 114166 tv    music:plan   from=null to=lobby
 114166 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 116683 tv    ss:cancel    speaking=false pending=false
 116691 tv    music:plan   from=lobby to=game:bingo
 116691 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116692 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116695 tv    hush
 116695 tv    hush
 117306 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117316 tv    hush
 117316 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 117316 tv    speak        text=i21.wav voice=clip delayMs=0
 117316 tv    hush
 117322 tv    hush
 117322 tv    clip         src=n32.wav muted=false ready=true delayMs=0
 117322 tv    speak        text=n32.wav voice=clip delayMs=0
 117428 tv    hush
 117428 tv    clip         src=i18.wav muted=false ready=true delayMs=0
 117428 tv    speak        text=i18.wav voice=clip delayMs=0
 117492 tv    music:stop   track=george-street-shuffle.mp3
 117520 tv    hush
 117520 tv    clip         src=n40.wav muted=false ready=true delayMs=0
 117520 tv    speak        text=n40.wav voice=clip delayMs=0
 117601 tv    hush
 117601 tv    clip         src=i30.wav muted=false ready=true delayMs=0
 117601 tv    speak        text=i30.wav voice=clip delayMs=0
 117695 tv    hush
 117695 tv    clip         src=o69.wav muted=false ready=true delayMs=0
 117695 tv    speak        text=o69.wav voice=clip delayMs=0
 117791 tv    hush
 117791 tv    clip         src=o61.wav muted=false ready=true delayMs=0
 117791 tv    speak        text=o61.wav voice=clip delayMs=0
 117886 tv    hush
 117886 tv    clip         src=n34.wav muted=false ready=true delayMs=0
 117886 tv    speak        text=n34.wav voice=clip delayMs=0
 117966 tv    hush
 117966 tv    clip         src=n35.wav muted=false ready=true delayMs=0
 117966 tv    speak        text=n35.wav voice=clip delayMs=0
 118057 tv    hush
 118057 tv    clip         src=o67.wav muted=false ready=true delayMs=0
 118057 tv    speak        text=o67.wav voice=clip delayMs=0
 118151 tv    hush
 118151 tv    clip         src=g55.wav muted=false ready=true delayMs=0
 118151 tv    speak        text=g55.wav voice=clip delayMs=0
 118247 tv    hush
 118247 tv    clip         src=i26.wav muted=false ready=true delayMs=0
 118247 tv    speak        text=i26.wav voice=clip delayMs=0
 118340 tv    hush
 118340 tv    clip         src=i22.wav muted=false ready=true delayMs=0
 118340 tv    speak        text=i22.wav voice=clip delayMs=0
 118435 tv    hush
 118435 tv    clip         src=i29.wav muted=false ready=true delayMs=0
 118435 tv    speak        text=i29.wav voice=clip delayMs=0
 118532 tv    hush
 118532 tv    clip         src=o66.wav muted=false ready=true delayMs=0
 118532 tv    speak        text=o66.wav voice=clip delayMs=0
 118626 tv    hush
 118626 tv    clip         src=g51.wav muted=false ready=true delayMs=0
 118626 tv    speak        text=g51.wav voice=clip delayMs=0
 118720 tv    hush
 118720 tv    clip         src=g53.wav muted=false ready=true delayMs=0
 118720 tv    speak        text=g53.wav voice=clip delayMs=0
 118816 tv    hush
 118816 tv    clip         src=b9.wav muted=false ready=true delayMs=0
 118816 tv    speak        text=b9.wav voice=clip delayMs=0
 118910 tv    hush
 118910 tv    clip         src=n36.wav muted=false ready=true delayMs=0
 118910 tv    speak        text=n36.wav voice=clip delayMs=0
 119005 tv    hush
 119005 tv    clip         src=g52.wav muted=false ready=true delayMs=0
 119005 tv    speak        text=g52.wav voice=clip delayMs=0
 119101 tv    hush
 119101 tv    clip         src=b1.wav muted=false ready=true delayMs=0
 119101 tv    speak        text=b1.wav voice=clip delayMs=0
 119194 tv    hush
 119194 tv    clip         src=b13.wav muted=false ready=true delayMs=0
 119194 tv    speak        text=b13.wav voice=clip delayMs=0
 119290 tv    hush
 119290 tv    clip         src=n37.wav muted=false ready=true delayMs=0
 119290 tv    speak        text=n37.wav voice=clip delayMs=0
 119386 tv    hush
 119386 tv    clip         src=o71.wav muted=false ready=true delayMs=0
 119386 tv    speak        text=o71.wav voice=clip delayMs=0
 119479 tv    hush
 119479 tv    clip         src=b8.wav muted=false ready=true delayMs=0
 119479 tv    speak        text=b8.wav voice=clip delayMs=0
 119574 tv    hush
 119574 tv    clip         src=b5.wav muted=false ready=true delayMs=0
 119574 tv    speak        text=b5.wav voice=clip delayMs=0
 119670 tv    hush
 119671 tv    clip         src=b7.wav muted=false ready=true delayMs=0
 119671 tv    speak        text=b7.wav voice=clip delayMs=0
 119765 tv    hush
 119765 tv    clip         src=n42.wav muted=false ready=true delayMs=0
 119765 tv    speak        text=n42.wav voice=clip delayMs=0
 119846 tv    hush
 119846 tv    clip         src=i28.wav muted=false ready=true delayMs=0
 119846 tv    speak        text=i28.wav voice=clip delayMs=0
 119939 tv    hush
 119939 tv    clip         src=i27.wav muted=false ready=true delayMs=0
 119939 tv    speak        text=i27.wav voice=clip delayMs=0
 120036 tv    hush
 120036 tv    clip         src=o63.wav muted=false ready=true delayMs=0
 120036 tv    speak        text=o63.wav voice=clip delayMs=0
 120133 tv    hush
 120133 tv    clip         src=o64.wav muted=false ready=true delayMs=0
 120133 tv    speak        text=o64.wav voice=clip delayMs=0
 120226 tv    hush
 120226 tv    clip         src=o73.wav muted=false ready=true delayMs=0
 120226 tv    speak        text=o73.wav voice=clip delayMs=0
 120320 tv    hush
 120320 tv    clip         src=g50.wav muted=false ready=true delayMs=0
 120320 tv    speak        text=g50.wav voice=clip delayMs=0
 120413 tv    hush
 120413 tv    clip         src=g48.wav muted=false ready=true delayMs=0
 120413 tv    speak        text=g48.wav voice=clip delayMs=0
 120493 tv    hush
 120493 tv    clip         src=b12.wav muted=false ready=true delayMs=0
 120493 tv    speak        text=b12.wav voice=clip delayMs=0
 120587 tv    hush
 120587 tv    clip         src=n45.wav muted=false ready=true delayMs=0
 120587 tv    speak        text=n45.wav voice=clip delayMs=0
 120667 tv    hush
 120667 tv    clip         src=b4.wav muted=false ready=true delayMs=0
 120667 tv    speak        text=b4.wav voice=clip delayMs=0
 120745 tv    hush
 120745 tv    clip         src=g46.wav muted=false ready=true delayMs=0
 120745 tv    speak        text=g46.wav voice=clip delayMs=0
 120840 tv    hush
 120840 tv    clip         src=o74.wav muted=false ready=true delayMs=0
 120840 tv    speak        text=o74.wav voice=clip delayMs=0
 120937 tv    hush
 120937 tv    clip         src=g47.wav muted=false ready=true delayMs=0
 120937 tv    speak        text=g47.wav voice=clip delayMs=0
 121029 tv    hush
 121029 tv    clip         src=n31.wav muted=false ready=true delayMs=0
 121029 tv    speak        text=n31.wav voice=clip delayMs=0
 121123 tv    hush
 121123 tv    clip         src=o62.wav muted=false ready=true delayMs=0
 121123 tv    speak        text=o62.wav voice=clip delayMs=0
 121219 tv    hush
 121219 tv    clip         src=b10.wav muted=false ready=true delayMs=0
 121219 tv    speak        text=b10.wav voice=clip delayMs=0
 121311 tv    hush
 121311 tv    clip         src=g60.wav muted=false ready=true delayMs=0
 121311 tv    speak        text=g60.wav voice=clip delayMs=0
 121398 tv    hush
 121398 tv    clip         src=n38.wav muted=false ready=true delayMs=0
 121398 tv    speak        text=n38.wav voice=clip delayMs=0
 121502 tv    hush
 121502 tv    clip         src=n39.wav muted=false ready=true delayMs=0
 121502 tv    speak        text=n39.wav voice=clip delayMs=0
 121598 tv    hush
 121598 tv    clip         src=o70.wav muted=false ready=true delayMs=0
 121598 tv    speak        text=o70.wav voice=clip delayMs=0
 121695 tv    hush
 121695 tv    clip         src=b11.wav muted=false ready=true delayMs=0
 121695 tv    speak        text=b11.wav voice=clip delayMs=0
 121789 tv    hush
 121789 tv    clip         src=o75.wav muted=false ready=true delayMs=0
 121789 tv    speak        text=o75.wav voice=clip delayMs=0
 121882 tv    hush
 121882 tv    clip         src=g58.wav muted=false ready=true delayMs=0
 121882 tv    speak        text=g58.wav voice=clip delayMs=0
 121976 tv    hush
 121976 tv    clip         src=b15.wav muted=false ready=true delayMs=0
 121976 tv    speak        text=b15.wav voice=clip delayMs=0
 122073 tv    hush
 122073 tv    clip         src=i24.wav muted=false ready=true delayMs=0
 122073 tv    speak        text=i24.wav voice=clip delayMs=0
 122149 tv    hush
 122149 tv    clip         src=o72.wav muted=false ready=true delayMs=0
 122149 tv    speak        text=o72.wav voice=clip delayMs=0
 122244 tv    hush
 122244 tv    clip         src=g56.wav muted=false ready=true delayMs=0
 122244 tv    speak        text=g56.wav voice=clip delayMs=0
 122339 tv    hush
 122339 tv    clip         src=i20.wav muted=false ready=true delayMs=0
 122339 tv    speak        text=i20.wav voice=clip delayMs=0
 122435 tv    hush
 122435 tv    clip         src=n44.wav muted=false ready=true delayMs=0
 122435 tv    speak        text=n44.wav voice=clip delayMs=0
 122529 tv    hush
 122529 tv    clip         src=b3.wav muted=false ready=true delayMs=0
 122529 tv    speak        text=b3.wav voice=clip delayMs=0
 122625 tv    hush
 122625 tv    clip         src=o68.wav muted=false ready=true delayMs=0
 122625 tv    speak        text=o68.wav voice=clip delayMs=0
 122719 tv    hush
 122719 tv    clip         src=b2.wav muted=false ready=true delayMs=0
 122719 tv    speak        text=b2.wav voice=clip delayMs=0
 122815 tv    hush
 122815 tv    clip         src=n41.wav muted=false ready=true delayMs=0
 122815 tv    speak        text=n41.wav voice=clip delayMs=0
 122909 tv    hush
 122909 tv    clip         src=o65.wav muted=false ready=true delayMs=0
 122909 tv    speak        text=o65.wav voice=clip delayMs=0
 123003 tv    hush
 123003 tv    clip         src=i17.wav muted=false ready=true delayMs=0
 123003 tv    speak        text=i17.wav voice=clip delayMs=0
 123100 tv    hush
 123100 tv    clip         src=i25.wav muted=false ready=true delayMs=0
 123100 tv    speak        text=i25.wav voice=clip delayMs=0
 123193 tv    hush
 123193 tv    clip         src=i19.wav muted=false ready=true delayMs=0
 123193 tv    speak        text=i19.wav voice=clip delayMs=0
 123287 tv    hush
 123287 tv    clip         src=g57.wav muted=false ready=true delayMs=0
 123287 tv    speak        text=g57.wav voice=clip delayMs=0
 123382 tv    hush
 123382 tv    clip         src=g59.wav muted=false ready=true delayMs=0
 123382 tv    speak        text=g59.wav voice=clip delayMs=0
 123477 tv    hush
 123477 tv    clip         src=g49.wav muted=false ready=true delayMs=0
 123477 tv    speak        text=g49.wav voice=clip delayMs=0
 123572 tv    hush
 123572 tv    clip         src=n43.wav muted=false ready=true delayMs=0
 123572 tv    speak        text=n43.wav voice=clip delayMs=0
 123667 tv    hush
 123667 tv    clip         src=i16.wav muted=false ready=true delayMs=0
 123667 tv    speak        text=i16.wav voice=clip delayMs=0
 123761 tv    hush
 123761 tv    clip         src=n33.wav muted=false ready=true delayMs=0
 123761 tv    speak        text=n33.wav voice=clip delayMs=0
 123856 tv    hush
 123856 tv    clip         src=i23.wav muted=false ready=true delayMs=0
 123856 tv    speak        text=i23.wav voice=clip delayMs=0
 123950 tv    hush
 123950 tv    clip         src=g54.wav muted=false ready=true delayMs=0
 123950 tv    speak        text=g54.wav voice=clip delayMs=0
 124046 tv    hush
 124046 tv    clip         src=b14.wav muted=false ready=true delayMs=0
 124046 tv    speak        text=b14.wav voice=clip delayMs=0
 124237 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 125271 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 125531 tv    hush
 125531 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 125531 tv    hush
 133136 tv    music:duck   ms=9000
 133136 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 138157 tv    hush
 138157 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 138157 tv    hush
 139698 tv    ss:cancel    speaking=false pending=false
 139698 tv    music:plan   from=game:bingo to=null
 139701 tv    ss:cancel    speaking=false pending=false
 139701 tv    music:plan   from=null to=lobby
 139701 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 140502 tv    music:stop   track=wallpaper.mp3
 142220 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 142236 tv    ss:cancel    speaking=false pending=false
 142240 tv    music:plan   from=lobby to=game:bingo
 142240 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 142240 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 142246 tv    hush
 142247 tv    hush
 142857 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 143040 tv    music:stop   track=george-street-shuffle.mp3
 144250 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 144384 tv    ss:cancel    speaking=false pending=false
 144384 tv    music:plan   from=game:bingo to=null
 144384 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 145885 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 146515 tv    ss:cancel    speaking=false pending=false
 146515 tv    music:plan   from=null to=lobby
 146515 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 149878 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 149886 tv    ss:cancel    speaking=false pending=false
 149888 tv    music:plan   from=lobby to=game:bingo
 149888 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 149888 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149891 tv    hush
 149892 tv    hush
 150304 tv    hush
 150304 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 150304 tv    speak        text=i21.wav voice=clip delayMs=0
 150305 tv    hush
 150495 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 150690 tv    music:stop   track=george-street-shuffle.mp3
 150800 tv    ss:cancel    speaking=false pending=false
 150800 tv    music:plan   from=game:bingo to=null
 150803 tv    ss:cancel    speaking=false pending=false
 150803 tv    music:plan   from=null to=lobby
 150803 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 151604 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"airport-lounge.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 156403 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156837 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157267 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157684 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158118 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 159184 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 159786 tv    ss:cancel    speaking=false pending=false
 159787 tv    music:plan   from=lobby to=null
 159787 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 161030 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 161289 tv    music:stop   track=airport-lounge.mp3
 162637 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 164052 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 165352 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 166370 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 167417 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 169990 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 170183 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 170374 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 170559 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 171682 tv    ss:cancel    speaking=false pending=false
 171684 tv    ss:cancel    speaking=false pending=false
 171684 tv    music:plan   from=null to=lobby
 171684 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 173701 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 173707 tv    ss:cancel    speaking=false pending=false
 173709 tv    music:plan   from=lobby to=null
 173709 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 175210 tv    music:stop   track=bossa-antigua.mp3
 175283 tv    music:plan   from=null to=game:broken-pencil
 175283 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 175283 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 176763 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 177234 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 177396 tv    music:plan   from=game:broken-pencil to=null
 177396 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 178896 tv    music:stop   track=backbay-lounge.mp3
```
