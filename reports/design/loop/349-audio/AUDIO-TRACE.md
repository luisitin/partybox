# Audio interaction trace

Captured 2026-09-18T23:34:14.637Z on port 42166. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**60 / 60 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.4}]

```
   1720 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1744 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3058 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3194 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3894 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4528 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5379 tv    ss:cancel    speaking=false pending=false
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
   7729 tv    music:stop   track=local-forecast-elevator.mp3
   8165 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9446 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16417 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17417 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18418 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19418 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20418 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21222 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22018 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22177 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22331 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22490 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22648 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22805 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22964 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23120 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23273 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23404 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23554 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23715 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23869 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24027 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24182 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24340 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24478 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24637 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24795 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25668 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  25997 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27800 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29533 tv    ss:cancel    speaking=false pending=false
  29533 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31071 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33226 tv    ss:cancel    speaking=false pending=false
  33227 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34790 tv    ss:cancel    speaking=false pending=false
  34790 tv    music:plan   from=null to=lobby
  34790 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime** — cues=start,card,lock,lock,tick,tick,tick,call
- ✅ **each Ready ticks (lock, rising); the 3 · 2 · 1's first tick comes a breath (≥ 300 ms) after the last** — locks=2 last lock→first tick=425ms
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+996ms phone@+1005ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "another" is a 20 ms tap and one card pluck; Ready a 20 ms tap and the submit cue** — taps=3 cues=card,submit
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **each voice starts on the push (no delay); its boing lands on the squash, 170–230 ms later** — delays=0,0 boing lags=191,192ms
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":18.9}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":25.8}]
- ✅ **skipping through the deck: a hush before every call, one voice at a time** — clips=41 hushes=41
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5356ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":40.2}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the winner's celebration buzz (320 ms) runs whole — nothing shorter cuts it** — celebration@74324 cut by=[]
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5401ms cheer@+5369ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36351 tv    music:plan   from=lobby to=game:bingo
  36351 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36352 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36655 tv    hush
  36655 tv    hush
  37152 tv    music:stop   track=airport-lounge.mp3
  37306 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  39406 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  39932 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
  40357 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41357 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  42357 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  43331 tv    hush
  43331 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  43332 tv    speak        text=b9.wav voice=clip delayMs=0
  43332 tv    hush
  43523 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43898 tv    hush
  43898 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  43898 tv    speak        text=b8.wav voice=clip delayMs=0
  44089 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45737 tv    hush
  45737 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  45737 tv    speak        text=n34.wav voice=clip delayMs=0
  45929 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  47608 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47872 tv    hush
  47872 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47872 tv    hush
  53225 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  56240 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57241 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58242 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  59248 tv    hush
  59249 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  59249 tv    speak        text=n35.wav voice=clip delayMs=0
  59439 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61026 tv    music:paused paused=true
  61026 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  62273 tv    music:paused paused=false
  62273 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  63573 tv    hush
  63573 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  63573 tv    speak        text=i25.wav voice=clip delayMs=0
  63704 tv    hush
  63704 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  63704 tv    speak        text=n45.wav voice=clip delayMs=0
  63824 tv    hush
  63824 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  63824 tv    speak        text=n33.wav voice=clip delayMs=0
  63950 tv    hush
  63950 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  63950 tv    speak        text=g49.wav voice=clip delayMs=0
  64082 tv    hush
  64082 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  64082 tv    speak        text=b4.wav voice=clip delayMs=0
  64187 tv    hush
  64187 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  64187 tv    speak        text=i20.wav voice=clip delayMs=0
  64296 tv    hush
  64296 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  64296 tv    speak        text=o69.wav voice=clip delayMs=0
  64421 tv    hush
  64421 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  64421 tv    speak        text=o67.wav voice=clip delayMs=0
  64545 tv    hush
  64545 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  64545 tv    speak        text=o65.wav voice=clip delayMs=0
  64671 tv    hush
  64671 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  64671 tv    speak        text=o73.wav voice=clip delayMs=0
  64786 tv    hush
  64786 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  64786 tv    speak        text=i21.wav voice=clip delayMs=0
  64891 tv    hush
  64891 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  64891 tv    speak        text=i18.wav voice=clip delayMs=0
  65019 tv    hush
  65019 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  65019 tv    speak        text=g58.wav voice=clip delayMs=0
  65148 tv    hush
  65148 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  65148 tv    speak        text=n36.wav voice=clip delayMs=0
  65270 tv    hush
  65270 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  65270 tv    speak        text=o61.wav voice=clip delayMs=0
  65398 tv    hush
  65398 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  65398 tv    speak        text=n37.wav voice=clip delayMs=0
  65505 tv    hush
  65505 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  65505 tv    speak        text=i16.wav voice=clip delayMs=0
  65632 tv    hush
  65632 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  65632 tv    speak        text=g47.wav voice=clip delayMs=0
  65761 tv    hush
  65761 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  65761 tv    speak        text=n41.wav voice=clip delayMs=0
  65877 tv    hush
  65877 tv    clip         src=b6.wav muted=false ready=true delayMs=0
  65877 tv    speak        text=b6.wav voice=clip delayMs=0
  66003 tv    hush
  66003 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  66003 tv    speak        text=o72.wav voice=clip delayMs=0
  66130 tv    hush
  66130 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  66130 tv    speak        text=b3.wav voice=clip delayMs=0
  66256 tv    hush
  66256 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  66256 tv    speak        text=i30.wav voice=clip delayMs=0
  66382 tv    hush
  66382 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  66382 tv    speak        text=g56.wav voice=clip delayMs=0
  66508 tv    hush
  66508 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  66508 tv    speak        text=o75.wav voice=clip delayMs=0
  66641 tv    hush
  66641 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  66641 tv    speak        text=b1.wav voice=clip delayMs=0
  66756 tv    hush
  66756 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  66756 tv    speak        text=b2.wav voice=clip delayMs=0
  66882 tv    hush
  66882 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  66882 tv    speak        text=n32.wav voice=clip delayMs=0
  66995 tv    hush
  66995 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  66995 tv    speak        text=g48.wav voice=clip delayMs=0
  67116 tv    hush
  67116 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  67116 tv    speak        text=i23.wav voice=clip delayMs=0
  67246 tv    hush
  67246 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  67246 tv    speak        text=i26.wav voice=clip delayMs=0
  67372 tv    hush
  67372 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  67372 tv    speak        text=o66.wav voice=clip delayMs=0
  67492 tv    hush
  67492 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  67492 tv    speak        text=i19.wav voice=clip delayMs=0
  67617 tv    hush
  67617 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  67617 tv    speak        text=n42.wav voice=clip delayMs=0
  67743 tv    hush
  67743 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  67743 tv    speak        text=i24.wav voice=clip delayMs=0
  67868 tv    hush
  67868 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  67868 tv    speak        text=n39.wav voice=clip delayMs=0
  67991 tv    hush
  67991 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  67991 tv    speak        text=g46.wav voice=clip delayMs=0
  68117 tv    hush
  68117 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  68117 tv    speak        text=n44.wav voice=clip delayMs=0
  68245 tv    hush
  68245 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  68245 tv    speak        text=b15.wav voice=clip delayMs=0
  68364 tv    hush
  68364 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  68364 tv    speak        text=b11.wav voice=clip delayMs=0
  68497 tv    hush
  68497 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  68497 tv    speak        text=g57.wav voice=clip delayMs=0
  68688 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  69105 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  69388 tv    hush
  69388 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  69388 tv    hush
  71262 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  74744 tv    music:duck   ms=9000
  74744 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  79529 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79860 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80861 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81861 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82868 tv    hush
  82868 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  82868 tv    speak        text=g57.wav voice=clip delayMs=0
  83058 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  85167 tv    ss:cancel    speaking=false pending=false
  85167 tv    music:plan   from=game:bingo to=null
  85169 tv    ss:cancel    speaking=false pending=false
  85169 tv    music:plan   from=null to=lobby
  85169 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  85969 tv    music:stop   track=cool-vibes.mp3
  87690 tv    ss:cancel    speaking=false pending=false
  87699 tv    music:plan   from=lobby to=game:bingo
  87699 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  87699 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  87702 tv    hush
  87703 tv    hush
  88319 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  88322 tv    hush
  88322 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  88322 tv    speak        text=i21.wav voice=clip delayMs=0
  88322 tv    hush
  88337 tv    hush
  88337 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  88337 tv    speak        text=n32.wav voice=clip delayMs=0
  88430 tv    hush
  88430 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  88430 tv    speak        text=i18.wav voice=clip delayMs=0
  88500 tv    music:stop   track=george-street-shuffle.mp3
  88508 tv    hush
  88508 tv    clip         src=n40.wav muted=false ready=true delayMs=0
  88508 tv    speak        text=n40.wav voice=clip delayMs=0
  88605 tv    hush
  88605 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  88605 tv    speak        text=i30.wav voice=clip delayMs=0
  88699 tv    hush
  88699 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  88699 tv    speak        text=o69.wav voice=clip delayMs=0
  88792 tv    hush
  88792 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  88792 tv    speak        text=o61.wav voice=clip delayMs=0
  88886 tv    hush
  88886 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  88886 tv    speak        text=n34.wav voice=clip delayMs=0
  88980 tv    hush
  88980 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  88980 tv    speak        text=n35.wav voice=clip delayMs=0
  89074 tv    hush
  89074 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  89074 tv    speak        text=o67.wav voice=clip delayMs=0
  89168 tv    hush
  89168 tv    clip         src=g55.wav muted=false ready=true delayMs=0
  89168 tv    speak        text=g55.wav voice=clip delayMs=0
  89264 tv    hush
  89264 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  89264 tv    speak        text=i26.wav voice=clip delayMs=0
  89357 tv    hush
  89357 tv    clip         src=i22.wav muted=false ready=true delayMs=0
  89357 tv    speak        text=i22.wav voice=clip delayMs=0
  89452 tv    hush
  89452 tv    clip         src=i29.wav muted=false ready=true delayMs=0
  89452 tv    speak        text=i29.wav voice=clip delayMs=0
  89547 tv    hush
  89547 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  89547 tv    speak        text=o66.wav voice=clip delayMs=0
  89640 tv    hush
  89640 tv    clip         src=g51.wav muted=false ready=true delayMs=0
  89640 tv    speak        text=g51.wav voice=clip delayMs=0
  89735 tv    hush
  89735 tv    clip         src=g53.wav muted=false ready=true delayMs=0
  89735 tv    speak        text=g53.wav voice=clip delayMs=0
  89829 tv    hush
  89829 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  89829 tv    speak        text=b9.wav voice=clip delayMs=0
  89912 tv    hush
  89912 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  89912 tv    speak        text=n36.wav voice=clip delayMs=0
  90004 tv    hush
  90004 tv    clip         src=g52.wav muted=false ready=true delayMs=0
  90004 tv    speak        text=g52.wav voice=clip delayMs=0
  90098 tv    hush
  90098 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  90098 tv    speak        text=b1.wav voice=clip delayMs=0
  90191 tv    hush
  90191 tv    clip         src=b13.wav muted=false ready=true delayMs=0
  90191 tv    speak        text=b13.wav voice=clip delayMs=0
  90286 tv    hush
  90286 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  90286 tv    speak        text=n37.wav voice=clip delayMs=0
  90380 tv    hush
  90380 tv    clip         src=o71.wav muted=false ready=true delayMs=0
  90380 tv    speak        text=o71.wav voice=clip delayMs=0
  90475 tv    hush
  90475 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  90475 tv    speak        text=b8.wav voice=clip delayMs=0
  90570 tv    hush
  90570 tv    clip         src=b5.wav muted=false ready=true delayMs=0
  90570 tv    speak        text=b5.wav voice=clip delayMs=0
  90665 tv    hush
  90665 tv    clip         src=b7.wav muted=false ready=true delayMs=0
  90665 tv    speak        text=b7.wav voice=clip delayMs=0
  90730 tv    hush
  90730 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  90730 tv    speak        text=n42.wav voice=clip delayMs=0
  90838 tv    hush
  90838 tv    clip         src=i28.wav muted=false ready=true delayMs=0
  90838 tv    speak        text=i28.wav voice=clip delayMs=0
  90931 tv    hush
  90931 tv    clip         src=i27.wav muted=false ready=true delayMs=0
  90931 tv    speak        text=i27.wav voice=clip delayMs=0
  91026 tv    hush
  91026 tv    clip         src=o63.wav muted=false ready=true delayMs=0
  91026 tv    speak        text=o63.wav voice=clip delayMs=0
  91120 tv    hush
  91120 tv    clip         src=o64.wav muted=false ready=true delayMs=0
  91120 tv    speak        text=o64.wav voice=clip delayMs=0
  91216 tv    hush
  91216 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  91216 tv    speak        text=o73.wav voice=clip delayMs=0
  91309 tv    hush
  91309 tv    clip         src=g50.wav muted=false ready=true delayMs=0
  91309 tv    speak        text=g50.wav voice=clip delayMs=0
  91402 tv    hush
  91402 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  91402 tv    speak        text=g48.wav voice=clip delayMs=0
  91496 tv    hush
  91496 tv    clip         src=b12.wav muted=false ready=true delayMs=0
  91496 tv    speak        text=b12.wav voice=clip delayMs=0
  91591 tv    hush
  91591 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  91591 tv    speak        text=n45.wav voice=clip delayMs=0
  91685 tv    hush
  91685 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  91685 tv    speak        text=b4.wav voice=clip delayMs=0
  91780 tv    hush
  91780 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  91780 tv    speak        text=g46.wav voice=clip delayMs=0
  91873 tv    hush
  91873 tv    clip         src=o74.wav muted=false ready=true delayMs=0
  91873 tv    speak        text=o74.wav voice=clip delayMs=0
  91968 tv    hush
  91968 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  91968 tv    speak        text=g47.wav voice=clip delayMs=0
  92062 tv    hush
  92062 tv    clip         src=n31.wav muted=false ready=true delayMs=0
  92062 tv    speak        text=n31.wav voice=clip delayMs=0
  92157 tv    hush
  92157 tv    clip         src=o62.wav muted=false ready=true delayMs=0
  92157 tv    speak        text=o62.wav voice=clip delayMs=0
  92253 tv    hush
  92253 tv    clip         src=b10.wav muted=false ready=true delayMs=0
  92253 tv    speak        text=b10.wav voice=clip delayMs=0
  92347 tv    hush
  92347 tv    clip         src=g60.wav muted=false ready=true delayMs=0
  92347 tv    speak        text=g60.wav voice=clip delayMs=0
  92441 tv    hush
  92441 tv    clip         src=n38.wav muted=false ready=true delayMs=0
  92441 tv    speak        text=n38.wav voice=clip delayMs=0
  92520 tv    hush
  92520 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  92520 tv    speak        text=n39.wav voice=clip delayMs=0
  92615 tv    hush
  92615 tv    clip         src=o70.wav muted=false ready=true delayMs=0
  92615 tv    speak        text=o70.wav voice=clip delayMs=0
  92709 tv    hush
  92709 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  92709 tv    speak        text=b11.wav voice=clip delayMs=0
  92805 tv    hush
  92805 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  92805 tv    speak        text=o75.wav voice=clip delayMs=0
  92900 tv    hush
  92900 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  92900 tv    speak        text=g58.wav voice=clip delayMs=0
  92994 tv    hush
  92994 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  92994 tv    speak        text=b15.wav voice=clip delayMs=0
  93090 tv    hush
  93090 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  93090 tv    speak        text=i24.wav voice=clip delayMs=0
  93181 tv    hush
  93181 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  93181 tv    speak        text=o72.wav voice=clip delayMs=0
  93276 tv    hush
  93276 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  93276 tv    speak        text=g56.wav voice=clip delayMs=0
  93369 tv    hush
  93369 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  93369 tv    speak        text=i20.wav voice=clip delayMs=0
  93463 tv    hush
  93463 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  93463 tv    speak        text=n44.wav voice=clip delayMs=0
  93560 tv    hush
  93560 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  93560 tv    speak        text=b3.wav voice=clip delayMs=0
  93654 tv    hush
  93654 tv    clip         src=o68.wav muted=false ready=true delayMs=0
  93654 tv    speak        text=o68.wav voice=clip delayMs=0
  93748 tv    hush
  93748 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  93748 tv    speak        text=b2.wav voice=clip delayMs=0
  93842 tv    hush
  93842 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  93842 tv    speak        text=n41.wav voice=clip delayMs=0
  93937 tv    hush
  93937 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  93937 tv    speak        text=o65.wav voice=clip delayMs=0
  94032 tv    hush
  94032 tv    clip         src=i17.wav muted=false ready=true delayMs=0
  94032 tv    speak        text=i17.wav voice=clip delayMs=0
  94128 tv    hush
  94128 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  94128 tv    speak        text=i25.wav voice=clip delayMs=0
  94222 tv    hush
  94222 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  94222 tv    speak        text=i19.wav voice=clip delayMs=0
  94315 tv    hush
  94315 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  94315 tv    speak        text=g57.wav voice=clip delayMs=0
  94409 tv    hush
  94409 tv    clip         src=g59.wav muted=false ready=true delayMs=0
  94409 tv    speak        text=g59.wav voice=clip delayMs=0
  94505 tv    hush
  94505 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  94505 tv    speak        text=g49.wav voice=clip delayMs=0
  94601 tv    hush
  94601 tv    clip         src=n43.wav muted=false ready=true delayMs=0
  94601 tv    speak        text=n43.wav voice=clip delayMs=0
  94696 tv    hush
  94696 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  94696 tv    speak        text=i16.wav voice=clip delayMs=0
  94791 tv    hush
  94791 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  94791 tv    speak        text=n33.wav voice=clip delayMs=0
  94884 tv    hush
  94884 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  94884 tv    speak        text=i23.wav voice=clip delayMs=0
  94979 tv    hush
  94979 tv    clip         src=g54.wav muted=false ready=true delayMs=0
  94979 tv    speak        text=g54.wav voice=clip delayMs=0
  95058 tv    hush
  95058 tv    clip         src=b14.wav muted=false ready=true delayMs=0
  95058 tv    speak        text=b14.wav voice=clip delayMs=0
  95250 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  96287 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  96553 tv    hush
  96553 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  96553 tv    hush
 104159 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 104163 tv    music:duck   ms=9000
 104163 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 109163 tv    hush
 109163 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 109163 tv    hush
 113172 tv    ss:cancel    speaking=false pending=false
 113172 tv    music:plan   from=game:bingo to=null
 113172 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 114672 tv    music:stop   track=wallpaper.mp3
 114783 tv    ss:cancel    speaking=false pending=false
 114783 tv    music:plan   from=null to=lobby
 114783 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 117293 tv    ss:cancel    speaking=false pending=false
 117301 tv    music:plan   from=lobby to=game:bingo
 117301 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 117301 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 117304 tv    hush
 117304 tv    hush
 117908 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 117910 tv    hush
 117910 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 117910 tv    speak        text=i21.wav voice=clip delayMs=0
 117910 tv    hush
 117925 tv    hush
 117925 tv    clip         src=n32.wav muted=false ready=true delayMs=0
 117925 tv    speak        text=n32.wav voice=clip delayMs=0
 118009 tv    hush
 118009 tv    clip         src=i18.wav muted=false ready=true delayMs=0
 118009 tv    speak        text=i18.wav voice=clip delayMs=0
 118102 tv    music:stop   track=airport-lounge.mp3
 118108 tv    hush
 118108 tv    clip         src=n40.wav muted=false ready=true delayMs=0
 118108 tv    speak        text=n40.wav voice=clip delayMs=0
 118207 tv    hush
 118207 tv    clip         src=i30.wav muted=false ready=true delayMs=0
 118207 tv    speak        text=i30.wav voice=clip delayMs=0
 118302 tv    hush
 118302 tv    clip         src=o69.wav muted=false ready=true delayMs=0
 118302 tv    speak        text=o69.wav voice=clip delayMs=0
 118398 tv    hush
 118398 tv    clip         src=o61.wav muted=false ready=true delayMs=0
 118398 tv    speak        text=o61.wav voice=clip delayMs=0
 118492 tv    hush
 118492 tv    clip         src=n34.wav muted=false ready=true delayMs=0
 118492 tv    speak        text=n34.wav voice=clip delayMs=0
 118587 tv    hush
 118587 tv    clip         src=n35.wav muted=false ready=true delayMs=0
 118587 tv    speak        text=n35.wav voice=clip delayMs=0
 118681 tv    hush
 118681 tv    clip         src=o67.wav muted=false ready=true delayMs=0
 118681 tv    speak        text=o67.wav voice=clip delayMs=0
 118775 tv    hush
 118775 tv    clip         src=g55.wav muted=false ready=true delayMs=0
 118775 tv    speak        text=g55.wav voice=clip delayMs=0
 118870 tv    hush
 118870 tv    clip         src=i26.wav muted=false ready=true delayMs=0
 118870 tv    speak        text=i26.wav voice=clip delayMs=0
 118962 tv    hush
 118962 tv    clip         src=i22.wav muted=false ready=true delayMs=0
 118962 tv    speak        text=i22.wav voice=clip delayMs=0
 119055 tv    hush
 119056 tv    clip         src=i29.wav muted=false ready=true delayMs=0
 119056 tv    speak        text=i29.wav voice=clip delayMs=0
 119150 tv    hush
 119150 tv    clip         src=o66.wav muted=false ready=true delayMs=0
 119150 tv    speak        text=o66.wav voice=clip delayMs=0
 119243 tv    hush
 119243 tv    clip         src=g51.wav muted=false ready=true delayMs=0
 119243 tv    speak        text=g51.wav voice=clip delayMs=0
 119337 tv    hush
 119337 tv    clip         src=g53.wav muted=false ready=true delayMs=0
 119337 tv    speak        text=g53.wav voice=clip delayMs=0
 119430 tv    hush
 119430 tv    clip         src=b9.wav muted=false ready=true delayMs=0
 119430 tv    speak        text=b9.wav voice=clip delayMs=0
 119525 tv    hush
 119525 tv    clip         src=n36.wav muted=false ready=true delayMs=0
 119525 tv    speak        text=n36.wav voice=clip delayMs=0
 119621 tv    hush
 119621 tv    clip         src=g52.wav muted=false ready=true delayMs=0
 119621 tv    speak        text=g52.wav voice=clip delayMs=0
 119716 tv    hush
 119716 tv    clip         src=b1.wav muted=false ready=true delayMs=0
 119716 tv    speak        text=b1.wav voice=clip delayMs=0
 119810 tv    hush
 119810 tv    clip         src=b13.wav muted=false ready=true delayMs=0
 119810 tv    speak        text=b13.wav voice=clip delayMs=0
 119904 tv    hush
 119904 tv    clip         src=n37.wav muted=false ready=true delayMs=0
 119904 tv    speak        text=n37.wav voice=clip delayMs=0
 119999 tv    hush
 119999 tv    clip         src=o71.wav muted=false ready=true delayMs=0
 119999 tv    speak        text=o71.wav voice=clip delayMs=0
 120092 tv    hush
 120092 tv    clip         src=b8.wav muted=false ready=true delayMs=0
 120092 tv    speak        text=b8.wav voice=clip delayMs=0
 120187 tv    hush
 120187 tv    clip         src=b5.wav muted=false ready=true delayMs=0
 120187 tv    speak        text=b5.wav voice=clip delayMs=0
 120282 tv    hush
 120282 tv    clip         src=b7.wav muted=false ready=true delayMs=0
 120282 tv    speak        text=b7.wav voice=clip delayMs=0
 120375 tv    hush
 120375 tv    clip         src=n42.wav muted=false ready=true delayMs=0
 120375 tv    speak        text=n42.wav voice=clip delayMs=0
 120470 tv    hush
 120470 tv    clip         src=i28.wav muted=false ready=true delayMs=0
 120470 tv    speak        text=i28.wav voice=clip delayMs=0
 120566 tv    hush
 120566 tv    clip         src=i27.wav muted=false ready=true delayMs=0
 120566 tv    speak        text=i27.wav voice=clip delayMs=0
 120659 tv    hush
 120659 tv    clip         src=o63.wav muted=false ready=true delayMs=0
 120659 tv    speak        text=o63.wav voice=clip delayMs=0
 120738 tv    hush
 120738 tv    clip         src=o64.wav muted=false ready=true delayMs=0
 120738 tv    speak        text=o64.wav voice=clip delayMs=0
 120832 tv    hush
 120832 tv    clip         src=o73.wav muted=false ready=true delayMs=0
 120832 tv    speak        text=o73.wav voice=clip delayMs=0
 120912 tv    hush
 120912 tv    clip         src=g50.wav muted=false ready=true delayMs=0
 120912 tv    speak        text=g50.wav voice=clip delayMs=0
 121007 tv    hush
 121007 tv    clip         src=g48.wav muted=false ready=true delayMs=0
 121007 tv    speak        text=g48.wav voice=clip delayMs=0
 121100 tv    hush
 121100 tv    clip         src=b12.wav muted=false ready=true delayMs=0
 121100 tv    speak        text=b12.wav voice=clip delayMs=0
 121195 tv    hush
 121195 tv    clip         src=n45.wav muted=false ready=true delayMs=0
 121195 tv    speak        text=n45.wav voice=clip delayMs=0
 121304 tv    hush
 121304 tv    clip         src=b4.wav muted=false ready=true delayMs=0
 121304 tv    speak        text=b4.wav voice=clip delayMs=0
 121383 tv    hush
 121383 tv    clip         src=g46.wav muted=false ready=true delayMs=0
 121383 tv    speak        text=g46.wav voice=clip delayMs=0
 121477 tv    hush
 121477 tv    clip         src=o74.wav muted=false ready=true delayMs=0
 121477 tv    speak        text=o74.wav voice=clip delayMs=0
 121571 tv    hush
 121571 tv    clip         src=g47.wav muted=false ready=true delayMs=0
 121571 tv    speak        text=g47.wav voice=clip delayMs=0
 121666 tv    hush
 121666 tv    clip         src=n31.wav muted=false ready=true delayMs=0
 121666 tv    speak        text=n31.wav voice=clip delayMs=0
 121760 tv    hush
 121760 tv    clip         src=o62.wav muted=false ready=true delayMs=0
 121760 tv    speak        text=o62.wav voice=clip delayMs=0
 121855 tv    hush
 121855 tv    clip         src=b10.wav muted=false ready=true delayMs=0
 121855 tv    speak        text=b10.wav voice=clip delayMs=0
 121951 tv    hush
 121951 tv    clip         src=g60.wav muted=false ready=true delayMs=0
 121951 tv    speak        text=g60.wav voice=clip delayMs=0
 122043 tv    hush
 122043 tv    clip         src=n38.wav muted=false ready=true delayMs=0
 122043 tv    speak        text=n38.wav voice=clip delayMs=0
 122138 tv    hush
 122138 tv    clip         src=n39.wav muted=false ready=true delayMs=0
 122138 tv    speak        text=n39.wav voice=clip delayMs=0
 122234 tv    hush
 122234 tv    clip         src=o70.wav muted=false ready=true delayMs=0
 122234 tv    speak        text=o70.wav voice=clip delayMs=0
 122313 tv    hush
 122313 tv    clip         src=b11.wav muted=false ready=true delayMs=0
 122313 tv    speak        text=b11.wav voice=clip delayMs=0
 122408 tv    hush
 122408 tv    clip         src=o75.wav muted=false ready=true delayMs=0
 122408 tv    speak        text=o75.wav voice=clip delayMs=0
 122503 tv    hush
 122503 tv    clip         src=g58.wav muted=false ready=true delayMs=0
 122503 tv    speak        text=g58.wav voice=clip delayMs=0
 122599 tv    hush
 122599 tv    clip         src=b15.wav muted=false ready=true delayMs=0
 122599 tv    speak        text=b15.wav voice=clip delayMs=0
 122694 tv    hush
 122694 tv    clip         src=i24.wav muted=false ready=true delayMs=0
 122694 tv    speak        text=i24.wav voice=clip delayMs=0
 122788 tv    hush
 122788 tv    clip         src=o72.wav muted=false ready=true delayMs=0
 122788 tv    speak        text=o72.wav voice=clip delayMs=0
 122882 tv    hush
 122882 tv    clip         src=g56.wav muted=false ready=true delayMs=0
 122882 tv    speak        text=g56.wav voice=clip delayMs=0
 122977 tv    hush
 122977 tv    clip         src=i20.wav muted=false ready=true delayMs=0
 122977 tv    speak        text=i20.wav voice=clip delayMs=0
 123071 tv    hush
 123071 tv    clip         src=n44.wav muted=false ready=true delayMs=0
 123071 tv    speak        text=n44.wav voice=clip delayMs=0
 123167 tv    hush
 123167 tv    clip         src=b3.wav muted=false ready=true delayMs=0
 123167 tv    speak        text=b3.wav voice=clip delayMs=0
 123262 tv    hush
 123262 tv    clip         src=o68.wav muted=false ready=true delayMs=0
 123262 tv    speak        text=o68.wav voice=clip delayMs=0
 123357 tv    hush
 123357 tv    clip         src=b2.wav muted=false ready=true delayMs=0
 123357 tv    speak        text=b2.wav voice=clip delayMs=0
 123451 tv    hush
 123451 tv    clip         src=n41.wav muted=false ready=true delayMs=0
 123451 tv    speak        text=n41.wav voice=clip delayMs=0
 123545 tv    hush
 123545 tv    clip         src=o65.wav muted=false ready=true delayMs=0
 123545 tv    speak        text=o65.wav voice=clip delayMs=0
 123640 tv    hush
 123640 tv    clip         src=i17.wav muted=false ready=true delayMs=0
 123640 tv    speak        text=i17.wav voice=clip delayMs=0
 123719 tv    hush
 123719 tv    clip         src=i25.wav muted=false ready=true delayMs=0
 123719 tv    speak        text=i25.wav voice=clip delayMs=0
 123814 tv    hush
 123814 tv    clip         src=i19.wav muted=false ready=true delayMs=0
 123814 tv    speak        text=i19.wav voice=clip delayMs=0
 123909 tv    hush
 123909 tv    clip         src=g57.wav muted=false ready=true delayMs=0
 123909 tv    speak        text=g57.wav voice=clip delayMs=0
 124003 tv    hush
 124003 tv    clip         src=g59.wav muted=false ready=true delayMs=0
 124003 tv    speak        text=g59.wav voice=clip delayMs=0
 124098 tv    hush
 124098 tv    clip         src=g49.wav muted=false ready=true delayMs=0
 124098 tv    speak        text=g49.wav voice=clip delayMs=0
 124192 tv    hush
 124192 tv    clip         src=n43.wav muted=false ready=true delayMs=0
 124192 tv    speak        text=n43.wav voice=clip delayMs=0
 124286 tv    hush
 124286 tv    clip         src=i16.wav muted=false ready=true delayMs=0
 124286 tv    speak        text=i16.wav voice=clip delayMs=0
 124380 tv    hush
 124380 tv    clip         src=n33.wav muted=false ready=true delayMs=0
 124380 tv    speak        text=n33.wav voice=clip delayMs=0
 124475 tv    hush
 124475 tv    clip         src=i23.wav muted=false ready=true delayMs=0
 124475 tv    speak        text=i23.wav voice=clip delayMs=0
 124570 tv    hush
 124570 tv    clip         src=g54.wav muted=false ready=true delayMs=0
 124570 tv    speak        text=g54.wav voice=clip delayMs=0
 124665 tv    hush
 124665 tv    clip         src=b14.wav muted=false ready=true delayMs=0
 124665 tv    speak        text=b14.wav voice=clip delayMs=0
 124855 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 125886 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 126149 tv    hush
 126149 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 126149 tv    hush
 133754 tv    music:duck   ms=9000
 133754 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 138770 tv    hush
 138771 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 138771 tv    hush
 140333 tv    ss:cancel    speaking=false pending=false
 140333 tv    music:plan   from=game:bingo to=null
 140335 tv    ss:cancel    speaking=false pending=false
 140335 tv    music:plan   from=null to=lobby
 140335 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 141137 tv    music:stop   track=wallpaper.mp3
 142854 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 142862 tv    ss:cancel    speaking=false pending=false
 142864 tv    music:plan   from=lobby to=game:bingo
 142864 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 142864 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 142867 tv    hush
 142867 tv    hush
 143529 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 143665 tv    music:stop   track=airport-lounge.mp3
 144103 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
 145019 tv    ss:cancel    speaking=false pending=false
 145019 tv    music:plan   from=game:bingo to=null
 145019 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 146519 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 147165 tv    ss:cancel    speaking=false pending=false
 147165 tv    music:plan   from=null to=lobby
 147165 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 150519 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 150538 tv    ss:cancel    speaking=false pending=false
 150539 tv    music:plan   from=lobby to=game:bingo
 150539 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 150539 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 150543 tv    hush
 150543 tv    hush
 150961 tv    cue          cue=lock surface=tv muted=false ready=true semitones=8
 150965 tv    hush
 150965 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 150965 tv    speak        text=i21.wav voice=clip delayMs=0
 150965 tv    hush
 151156 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 151340 tv    music:stop   track=local-forecast-elevator.mp3
 151466 tv    ss:cancel    speaking=false pending=false
 151466 tv    music:plan   from=game:bingo to=null
 151470 tv    ss:cancel    speaking=false pending=false
 151470 tv    music:plan   from=null to=lobby
 151470 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 152271 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 157069 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157484 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157917 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158336 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158767 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 159817 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 160413 tv    ss:cancel    speaking=false pending=false
 160417 tv    music:plan   from=lobby to=null
 160417 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 161676 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 161918 tv    music:stop   track=local-forecast-elevator.mp3
 163268 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 164535 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 165836 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 166853 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 167892 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 170449 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 170648 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 170828 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 171020 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 172131 tv    ss:cancel    speaking=false pending=false
 172133 tv    ss:cancel    speaking=false pending=false
 172133 tv    music:plan   from=null to=lobby
 172133 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 174158 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 174166 tv    ss:cancel    speaking=false pending=false
 174168 tv    music:plan   from=lobby to=null
 174168 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 175668 tv    music:stop   track=george-street-shuffle.mp3
 175725 tv    music:plan   from=null to=game:broken-pencil
 175725 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 175725 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 177216 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 177690 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 177846 tv    music:plan   from=game:broken-pencil to=null
 177846 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 179346 tv    music:stop   track=hep-cats.mp3
```
