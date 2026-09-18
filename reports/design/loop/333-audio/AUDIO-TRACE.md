# Audio interaction trace

Captured 2026-09-18T21:21:23.097Z on port 42166. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**57 / 57 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.4}]

```
   1796 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1822 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3150 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3286 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3994 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4619 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
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
   6316 tv    music:plan   from=lobby to=null
   6316 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7824 tv    music:stop   track=airport-lounge.mp3
   8256 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9540 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16509 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17509 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18510 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19510 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20510 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21322 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22130 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22288 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22444 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22599 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22758 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22915 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23072 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23231 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23383 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23541 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23697 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23856 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24015 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24171 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24326 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24470 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24625 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24788 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24938 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25820 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26145 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27953 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29688 tv    ss:cancel    speaking=false pending=false
  29688 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":1.5}]

```
  31237 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33387 tv    ss:cancel    speaking=false pending=false
  33387 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34948 tv    ss:cancel    speaking=false pending=false
  34948 tv    music:plan   from=null to=lobby
  34948 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:local-forecast-elevator.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+955ms phone@+973ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":24.9}]
- ✅ **skipping through the deck: a hush before every call, one voice at a time** — clips=41 hushes=41
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5354ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5394ms cheer@+5370ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36506 tv    music:plan   from=lobby to=game:bingo
  36506 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36506 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36809 tv    hush
  36809 tv    hush
  37307 tv    music:stop   track=local-forecast-elevator.mp3
  37420 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38511 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39510 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40510 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41512 tv    hush
  41512 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  41512 tv    speak        text=b9.wav voice=clip delayMs=190
  41513 tv    hush
  41703 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43140 tv    hush
  43140 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  43140 tv    speak        text=b8.wav voice=clip delayMs=190
  43330 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44979 tv    hush
  44979 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  44979 tv    speak        text=n34.wav voice=clip delayMs=190
  45170 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46833 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47106 tv    hush
  47106 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47106 tv    hush
  52458 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55467 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56468 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57468 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58470 tv    hush
  58470 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  58470 tv    speak        text=n35.wav voice=clip delayMs=190
  58662 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60249 tv    music:paused paused=true
  60249 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61482 tv    music:paused paused=false
  61482 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62786 tv    hush
  62786 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  62786 tv    speak        text=i25.wav voice=clip delayMs=190
  62919 tv    hush
  62919 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  62919 tv    speak        text=n45.wav voice=clip delayMs=190
  63051 tv    hush
  63051 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  63051 tv    speak        text=n33.wav voice=clip delayMs=190
  63170 tv    hush
  63170 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  63170 tv    speak        text=g49.wav voice=clip delayMs=190
  63288 tv    hush
  63288 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  63288 tv    speak        text=b4.wav voice=clip delayMs=190
  63416 tv    hush
  63416 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  63416 tv    speak        text=i20.wav voice=clip delayMs=190
  63541 tv    hush
  63541 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  63541 tv    speak        text=o69.wav voice=clip delayMs=190
  63666 tv    hush
  63666 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  63666 tv    speak        text=o67.wav voice=clip delayMs=190
  63790 tv    hush
  63790 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  63790 tv    speak        text=o65.wav voice=clip delayMs=190
  63918 tv    hush
  63918 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  63918 tv    speak        text=o73.wav voice=clip delayMs=190
  64039 tv    hush
  64039 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  64039 tv    speak        text=i21.wav voice=clip delayMs=190
  64173 tv    hush
  64173 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  64173 tv    speak        text=i18.wav voice=clip delayMs=190
  64297 tv    hush
  64297 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  64297 tv    speak        text=g58.wav voice=clip delayMs=190
  64419 tv    hush
  64419 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  64419 tv    speak        text=n36.wav voice=clip delayMs=190
  64544 tv    hush
  64544 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  64544 tv    speak        text=o61.wav voice=clip delayMs=190
  64673 tv    hush
  64673 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  64673 tv    speak        text=n37.wav voice=clip delayMs=190
  64795 tv    hush
  64795 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  64795 tv    speak        text=i16.wav voice=clip delayMs=190
  64921 tv    hush
  64921 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  64921 tv    speak        text=g47.wav voice=clip delayMs=190
  65051 tv    hush
  65051 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  65051 tv    speak        text=n41.wav voice=clip delayMs=190
  65178 tv    hush
  65178 tv    clip         src=b6.wav muted=false ready=true delayMs=190
  65178 tv    speak        text=b6.wav voice=clip delayMs=190
  65303 tv    hush
  65303 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  65303 tv    speak        text=o72.wav voice=clip delayMs=190
  65430 tv    hush
  65430 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  65430 tv    speak        text=b3.wav voice=clip delayMs=190
  65559 tv    hush
  65559 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  65559 tv    speak        text=i30.wav voice=clip delayMs=190
  65679 tv    hush
  65679 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  65679 tv    speak        text=g56.wav voice=clip delayMs=190
  65802 tv    hush
  65802 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  65802 tv    speak        text=o75.wav voice=clip delayMs=190
  65917 tv    hush
  65917 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  65917 tv    speak        text=b1.wav voice=clip delayMs=190
  66045 tv    hush
  66045 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  66045 tv    speak        text=b2.wav voice=clip delayMs=190
  66161 tv    hush
  66161 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  66161 tv    speak        text=n32.wav voice=clip delayMs=190
  66292 tv    hush
  66292 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  66292 tv    speak        text=g48.wav voice=clip delayMs=190
  66412 tv    hush
  66412 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  66412 tv    speak        text=i23.wav voice=clip delayMs=190
  66543 tv    hush
  66543 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  66543 tv    speak        text=i26.wav voice=clip delayMs=190
  66670 tv    hush
  66670 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  66670 tv    speak        text=o66.wav voice=clip delayMs=190
  66789 tv    hush
  66789 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  66789 tv    speak        text=i19.wav voice=clip delayMs=190
  66915 tv    hush
  66915 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  66915 tv    speak        text=n42.wav voice=clip delayMs=190
  67045 tv    hush
  67045 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  67045 tv    speak        text=i24.wav voice=clip delayMs=190
  67169 tv    hush
  67169 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  67169 tv    speak        text=n39.wav voice=clip delayMs=190
  67277 tv    hush
  67277 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  67277 tv    speak        text=g46.wav voice=clip delayMs=190
  67386 tv    hush
  67386 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  67386 tv    speak        text=n44.wav voice=clip delayMs=190
  67510 tv    hush
  67510 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  67510 tv    speak        text=b15.wav voice=clip delayMs=190
  67646 tv    hush
  67646 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  67646 tv    speak        text=b11.wav voice=clip delayMs=190
  67761 tv    hush
  67761 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  67761 tv    speak        text=g57.wav voice=clip delayMs=190
  67955 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  68382 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68667 tv    hush
  68667 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68667 tv    hush
  70540 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  74021 tv    music:duck   ms=9000
  74021 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  78822 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79154 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80155 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81155 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82158 tv    hush
  82158 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  82158 tv    speak        text=g57.wav voice=clip delayMs=190
  82349 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84459 tv    ss:cancel    speaking=false pending=false
  84459 tv    music:plan   from=game:bingo to=null
  84462 tv    ss:cancel    speaking=false pending=false
  84462 tv    music:plan   from=null to=lobby
  84462 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  85264 tv    music:stop   track=wallpaper.mp3
  86979 tv    ss:cancel    speaking=false pending=false
  86988 tv    music:plan   from=lobby to=game:bingo
  86988 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86988 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86991 tv    hush
  86991 tv    hush
  87602 tv    hush
  87602 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  87602 tv    speak        text=i21.wav voice=clip delayMs=190
  87602 tv    hush
  87618 tv    hush
  87618 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  87618 tv    speak        text=n32.wav voice=clip delayMs=190
  87717 tv    hush
  87717 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  87717 tv    speak        text=i18.wav voice=clip delayMs=190
  87788 tv    music:stop   track=local-forecast-elevator.mp3
  87797 tv    hush
  87797 tv    clip         src=n40.wav muted=false ready=true delayMs=190
  87797 tv    speak        text=n40.wav voice=clip delayMs=190
  87900 tv    hush
  87900 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  87900 tv    speak        text=i30.wav voice=clip delayMs=190
  88006 tv    hush
  88006 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  88006 tv    speak        text=o69.wav voice=clip delayMs=190
  88109 tv    hush
  88109 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  88109 tv    speak        text=o61.wav voice=clip delayMs=190
  88204 tv    hush
  88204 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  88204 tv    speak        text=n34.wav voice=clip delayMs=190
  88306 tv    hush
  88306 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  88306 tv    speak        text=n35.wav voice=clip delayMs=190
  88404 tv    hush
  88404 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  88404 tv    speak        text=o67.wav voice=clip delayMs=190
  88495 tv    hush
  88495 tv    clip         src=g55.wav muted=false ready=true delayMs=190
  88495 tv    speak        text=g55.wav voice=clip delayMs=190
  88593 tv    hush
  88593 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  88593 tv    speak        text=i26.wav voice=clip delayMs=190
  88684 tv    hush
  88684 tv    clip         src=i22.wav muted=false ready=true delayMs=190
  88684 tv    speak        text=i22.wav voice=clip delayMs=190
  88785 tv    hush
  88785 tv    clip         src=i29.wav muted=false ready=true delayMs=190
  88785 tv    speak        text=i29.wav voice=clip delayMs=190
  88875 tv    hush
  88875 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  88875 tv    speak        text=o66.wav voice=clip delayMs=190
  88969 tv    hush
  88969 tv    clip         src=g51.wav muted=false ready=true delayMs=190
  88969 tv    speak        text=g51.wav voice=clip delayMs=190
  89065 tv    hush
  89065 tv    clip         src=g53.wav muted=false ready=true delayMs=190
  89065 tv    speak        text=g53.wav voice=clip delayMs=190
  89158 tv    hush
  89158 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  89158 tv    speak        text=b9.wav voice=clip delayMs=190
  89249 tv    hush
  89249 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  89249 tv    speak        text=n36.wav voice=clip delayMs=190
  89352 tv    hush
  89352 tv    clip         src=g52.wav muted=false ready=true delayMs=190
  89352 tv    speak        text=g52.wav voice=clip delayMs=190
  89455 tv    hush
  89455 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  89455 tv    speak        text=b1.wav voice=clip delayMs=190
  89549 tv    hush
  89549 tv    clip         src=b13.wav muted=false ready=true delayMs=190
  89549 tv    speak        text=b13.wav voice=clip delayMs=190
  89641 tv    hush
  89641 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  89641 tv    speak        text=n37.wav voice=clip delayMs=190
  89745 tv    hush
  89745 tv    clip         src=o71.wav muted=false ready=true delayMs=190
  89745 tv    speak        text=o71.wav voice=clip delayMs=190
  89830 tv    hush
  89830 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  89830 tv    speak        text=b8.wav voice=clip delayMs=190
  89935 tv    hush
  89935 tv    clip         src=b5.wav muted=false ready=true delayMs=190
  89935 tv    speak        text=b5.wav voice=clip delayMs=190
  90023 tv    hush
  90023 tv    clip         src=b7.wav muted=false ready=true delayMs=190
  90023 tv    speak        text=b7.wav voice=clip delayMs=190
  90116 tv    hush
  90116 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  90116 tv    speak        text=n42.wav voice=clip delayMs=190
  90210 tv    hush
  90210 tv    clip         src=i28.wav muted=false ready=true delayMs=190
  90210 tv    speak        text=i28.wav voice=clip delayMs=190
  90285 tv    hush
  90285 tv    clip         src=i27.wav muted=false ready=true delayMs=190
  90285 tv    speak        text=i27.wav voice=clip delayMs=190
  90380 tv    hush
  90380 tv    clip         src=o63.wav muted=false ready=true delayMs=190
  90380 tv    speak        text=o63.wav voice=clip delayMs=190
  90479 tv    hush
  90479 tv    clip         src=o64.wav muted=false ready=true delayMs=190
  90479 tv    speak        text=o64.wav voice=clip delayMs=190
  90570 tv    hush
  90570 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  90570 tv    speak        text=o73.wav voice=clip delayMs=190
  90665 tv    hush
  90665 tv    clip         src=g50.wav muted=false ready=true delayMs=190
  90665 tv    speak        text=g50.wav voice=clip delayMs=190
  90761 tv    hush
  90761 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  90761 tv    speak        text=g48.wav voice=clip delayMs=190
  90850 tv    hush
  90850 tv    clip         src=b12.wav muted=false ready=true delayMs=190
  90850 tv    speak        text=b12.wav voice=clip delayMs=190
  90952 tv    hush
  90952 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  90952 tv    speak        text=n45.wav voice=clip delayMs=190
  91056 tv    hush
  91056 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  91056 tv    speak        text=b4.wav voice=clip delayMs=190
  91151 tv    hush
  91151 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  91151 tv    speak        text=g46.wav voice=clip delayMs=190
  91244 tv    hush
  91244 tv    clip         src=o74.wav muted=false ready=true delayMs=190
  91244 tv    speak        text=o74.wav voice=clip delayMs=190
  91341 tv    hush
  91341 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  91341 tv    speak        text=g47.wav voice=clip delayMs=190
  91436 tv    hush
  91436 tv    clip         src=n31.wav muted=false ready=true delayMs=190
  91436 tv    speak        text=n31.wav voice=clip delayMs=190
  91525 tv    hush
  91525 tv    clip         src=o62.wav muted=false ready=true delayMs=190
  91525 tv    speak        text=o62.wav voice=clip delayMs=190
  91622 tv    hush
  91622 tv    clip         src=b10.wav muted=false ready=true delayMs=190
  91622 tv    speak        text=b10.wav voice=clip delayMs=190
  91704 tv    hush
  91704 tv    clip         src=g60.wav muted=false ready=true delayMs=190
  91704 tv    speak        text=g60.wav voice=clip delayMs=190
  91788 tv    hush
  91788 tv    clip         src=n38.wav muted=false ready=true delayMs=190
  91788 tv    speak        text=n38.wav voice=clip delayMs=190
  91885 tv    hush
  91885 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  91885 tv    speak        text=n39.wav voice=clip delayMs=190
  91978 tv    hush
  91978 tv    clip         src=o70.wav muted=false ready=true delayMs=190
  91978 tv    speak        text=o70.wav voice=clip delayMs=190
  92076 tv    hush
  92076 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  92076 tv    speak        text=b11.wav voice=clip delayMs=190
  92166 tv    hush
  92166 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  92166 tv    speak        text=o75.wav voice=clip delayMs=190
  92243 tv    hush
  92243 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  92243 tv    speak        text=g58.wav voice=clip delayMs=190
  92358 tv    hush
  92358 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  92358 tv    speak        text=b15.wav voice=clip delayMs=190
  92453 tv    hush
  92453 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  92453 tv    speak        text=i24.wav voice=clip delayMs=190
  92544 tv    hush
  92544 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  92544 tv    speak        text=o72.wav voice=clip delayMs=190
  92627 tv    hush
  92627 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  92627 tv    speak        text=g56.wav voice=clip delayMs=190
  92704 tv    hush
  92704 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  92704 tv    speak        text=i20.wav voice=clip delayMs=190
  92797 tv    hush
  92797 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  92797 tv    speak        text=n44.wav voice=clip delayMs=190
  92889 tv    hush
  92889 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  92889 tv    speak        text=b3.wav voice=clip delayMs=190
  92984 tv    hush
  92984 tv    clip         src=o68.wav muted=false ready=true delayMs=190
  92984 tv    speak        text=o68.wav voice=clip delayMs=190
  93077 tv    hush
  93077 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  93077 tv    speak        text=b2.wav voice=clip delayMs=190
  93167 tv    hush
  93167 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  93167 tv    speak        text=n41.wav voice=clip delayMs=190
  93261 tv    hush
  93261 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  93261 tv    speak        text=o65.wav voice=clip delayMs=190
  93363 tv    hush
  93363 tv    clip         src=i17.wav muted=false ready=true delayMs=190
  93363 tv    speak        text=i17.wav voice=clip delayMs=190
  93457 tv    hush
  93457 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  93457 tv    speak        text=i25.wav voice=clip delayMs=190
  93543 tv    hush
  93543 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  93543 tv    speak        text=i19.wav voice=clip delayMs=190
  93642 tv    hush
  93642 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  93642 tv    speak        text=g57.wav voice=clip delayMs=190
  93736 tv    hush
  93736 tv    clip         src=g59.wav muted=false ready=true delayMs=190
  93736 tv    speak        text=g59.wav voice=clip delayMs=190
  93927 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  94963 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95227 tv    hush
  95227 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95227 tv    hush
 102835 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 102843 tv    music:duck   ms=9000
 102843 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 107839 tv    hush
 107839 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 107840 tv    hush
 111849 tv    ss:cancel    speaking=false pending=false
 111849 tv    music:plan   from=game:bingo to=null
 111849 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113349 tv    music:stop   track=wallpaper.mp3
 113474 tv    ss:cancel    speaking=false pending=false
 113474 tv    music:plan   from=null to=lobby
 113474 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 116000 tv    ss:cancel    speaking=false pending=false
 116008 tv    music:plan   from=lobby to=game:bingo
 116008 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 116008 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116011 tv    hush
 116012 tv    hush
 116622 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 116629 tv    hush
 116629 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 116629 tv    speak        text=i21.wav voice=clip delayMs=190
 116630 tv    hush
 116637 tv    hush
 116637 tv    clip         src=n32.wav muted=false ready=true delayMs=190
 116637 tv    speak        text=n32.wav voice=clip delayMs=190
 116741 tv    hush
 116741 tv    clip         src=i18.wav muted=false ready=true delayMs=190
 116741 tv    speak        text=i18.wav voice=clip delayMs=190
 116810 tv    music:stop   track=local-forecast-elevator.mp3
 116836 tv    hush
 116836 tv    clip         src=n40.wav muted=false ready=true delayMs=190
 116836 tv    speak        text=n40.wav voice=clip delayMs=190
 116927 tv    hush
 116927 tv    clip         src=i30.wav muted=false ready=true delayMs=190
 116927 tv    speak        text=i30.wav voice=clip delayMs=190
 117018 tv    hush
 117018 tv    clip         src=o69.wav muted=false ready=true delayMs=190
 117018 tv    speak        text=o69.wav voice=clip delayMs=190
 117113 tv    hush
 117113 tv    clip         src=o61.wav muted=false ready=true delayMs=190
 117113 tv    speak        text=o61.wav voice=clip delayMs=190
 117213 tv    hush
 117213 tv    clip         src=n34.wav muted=false ready=true delayMs=190
 117213 tv    speak        text=n34.wav voice=clip delayMs=190
 117306 tv    hush
 117306 tv    clip         src=n35.wav muted=false ready=true delayMs=190
 117306 tv    speak        text=n35.wav voice=clip delayMs=190
 117395 tv    hush
 117395 tv    clip         src=o67.wav muted=false ready=true delayMs=190
 117395 tv    speak        text=o67.wav voice=clip delayMs=190
 117488 tv    hush
 117488 tv    clip         src=g55.wav muted=false ready=true delayMs=190
 117488 tv    speak        text=g55.wav voice=clip delayMs=190
 117600 tv    hush
 117600 tv    clip         src=i26.wav muted=false ready=true delayMs=190
 117600 tv    speak        text=i26.wav voice=clip delayMs=190
 117692 tv    hush
 117692 tv    clip         src=i22.wav muted=false ready=true delayMs=190
 117692 tv    speak        text=i22.wav voice=clip delayMs=190
 117789 tv    hush
 117789 tv    clip         src=i29.wav muted=false ready=true delayMs=190
 117789 tv    speak        text=i29.wav voice=clip delayMs=190
 117882 tv    hush
 117882 tv    clip         src=o66.wav muted=false ready=true delayMs=190
 117882 tv    speak        text=o66.wav voice=clip delayMs=190
 117974 tv    hush
 117974 tv    clip         src=g51.wav muted=false ready=true delayMs=190
 117974 tv    speak        text=g51.wav voice=clip delayMs=190
 118074 tv    hush
 118074 tv    clip         src=g53.wav muted=false ready=true delayMs=190
 118074 tv    speak        text=g53.wav voice=clip delayMs=190
 118163 tv    hush
 118163 tv    clip         src=b9.wav muted=false ready=true delayMs=190
 118163 tv    speak        text=b9.wav voice=clip delayMs=190
 118263 tv    hush
 118263 tv    clip         src=n36.wav muted=false ready=true delayMs=190
 118263 tv    speak        text=n36.wav voice=clip delayMs=190
 118352 tv    hush
 118352 tv    clip         src=g52.wav muted=false ready=true delayMs=190
 118352 tv    speak        text=g52.wav voice=clip delayMs=190
 118458 tv    hush
 118458 tv    clip         src=b1.wav muted=false ready=true delayMs=190
 118458 tv    speak        text=b1.wav voice=clip delayMs=190
 118557 tv    hush
 118557 tv    clip         src=b13.wav muted=false ready=true delayMs=190
 118557 tv    speak        text=b13.wav voice=clip delayMs=190
 118649 tv    hush
 118649 tv    clip         src=n37.wav muted=false ready=true delayMs=190
 118649 tv    speak        text=n37.wav voice=clip delayMs=190
 118757 tv    hush
 118757 tv    clip         src=o71.wav muted=false ready=true delayMs=190
 118757 tv    speak        text=o71.wav voice=clip delayMs=190
 118856 tv    hush
 118856 tv    clip         src=b8.wav muted=false ready=true delayMs=190
 118856 tv    speak        text=b8.wav voice=clip delayMs=190
 118958 tv    hush
 118958 tv    clip         src=b5.wav muted=false ready=true delayMs=190
 118958 tv    speak        text=b5.wav voice=clip delayMs=190
 119041 tv    hush
 119041 tv    clip         src=b7.wav muted=false ready=true delayMs=190
 119041 tv    speak        text=b7.wav voice=clip delayMs=190
 119139 tv    hush
 119139 tv    clip         src=n42.wav muted=false ready=true delayMs=190
 119139 tv    speak        text=n42.wav voice=clip delayMs=190
 119232 tv    hush
 119232 tv    clip         src=i28.wav muted=false ready=true delayMs=190
 119232 tv    speak        text=i28.wav voice=clip delayMs=190
 119321 tv    hush
 119321 tv    clip         src=i27.wav muted=false ready=true delayMs=190
 119321 tv    speak        text=i27.wav voice=clip delayMs=190
 119418 tv    hush
 119418 tv    clip         src=o63.wav muted=false ready=true delayMs=190
 119418 tv    speak        text=o63.wav voice=clip delayMs=190
 119510 tv    hush
 119510 tv    clip         src=o64.wav muted=false ready=true delayMs=190
 119510 tv    speak        text=o64.wav voice=clip delayMs=190
 119610 tv    hush
 119610 tv    clip         src=o73.wav muted=false ready=true delayMs=190
 119610 tv    speak        text=o73.wav voice=clip delayMs=190
 119702 tv    hush
 119702 tv    clip         src=g50.wav muted=false ready=true delayMs=190
 119702 tv    speak        text=g50.wav voice=clip delayMs=190
 119792 tv    hush
 119792 tv    clip         src=g48.wav muted=false ready=true delayMs=190
 119792 tv    speak        text=g48.wav voice=clip delayMs=190
 119892 tv    hush
 119892 tv    clip         src=b12.wav muted=false ready=true delayMs=190
 119892 tv    speak        text=b12.wav voice=clip delayMs=190
 119977 tv    hush
 119977 tv    clip         src=n45.wav muted=false ready=true delayMs=190
 119977 tv    speak        text=n45.wav voice=clip delayMs=190
 120072 tv    hush
 120072 tv    clip         src=b4.wav muted=false ready=true delayMs=190
 120072 tv    speak        text=b4.wav voice=clip delayMs=190
 120169 tv    hush
 120169 tv    clip         src=g46.wav muted=false ready=true delayMs=190
 120169 tv    speak        text=g46.wav voice=clip delayMs=190
 120257 tv    hush
 120257 tv    clip         src=o74.wav muted=false ready=true delayMs=190
 120257 tv    speak        text=o74.wav voice=clip delayMs=190
 120358 tv    hush
 120358 tv    clip         src=g47.wav muted=false ready=true delayMs=190
 120358 tv    speak        text=g47.wav voice=clip delayMs=190
 120462 tv    hush
 120462 tv    clip         src=n31.wav muted=false ready=true delayMs=190
 120462 tv    speak        text=n31.wav voice=clip delayMs=190
 120554 tv    hush
 120554 tv    clip         src=o62.wav muted=false ready=true delayMs=190
 120554 tv    speak        text=o62.wav voice=clip delayMs=190
 120652 tv    hush
 120652 tv    clip         src=b10.wav muted=false ready=true delayMs=190
 120652 tv    speak        text=b10.wav voice=clip delayMs=190
 120743 tv    hush
 120743 tv    clip         src=g60.wav muted=false ready=true delayMs=190
 120743 tv    speak        text=g60.wav voice=clip delayMs=190
 120843 tv    hush
 120843 tv    clip         src=n38.wav muted=false ready=true delayMs=190
 120843 tv    speak        text=n38.wav voice=clip delayMs=190
 120935 tv    hush
 120935 tv    clip         src=n39.wav muted=false ready=true delayMs=190
 120935 tv    speak        text=n39.wav voice=clip delayMs=190
 121041 tv    hush
 121041 tv    clip         src=o70.wav muted=false ready=true delayMs=190
 121041 tv    speak        text=o70.wav voice=clip delayMs=190
 121137 tv    hush
 121137 tv    clip         src=b11.wav muted=false ready=true delayMs=190
 121137 tv    speak        text=b11.wav voice=clip delayMs=190
 121231 tv    hush
 121231 tv    clip         src=o75.wav muted=false ready=true delayMs=190
 121231 tv    speak        text=o75.wav voice=clip delayMs=190
 121308 tv    hush
 121308 tv    clip         src=g58.wav muted=false ready=true delayMs=190
 121308 tv    speak        text=g58.wav voice=clip delayMs=190
 121399 tv    hush
 121399 tv    clip         src=b15.wav muted=false ready=true delayMs=190
 121399 tv    speak        text=b15.wav voice=clip delayMs=190
 121499 tv    hush
 121499 tv    clip         src=i24.wav muted=false ready=true delayMs=190
 121499 tv    speak        text=i24.wav voice=clip delayMs=190
 121590 tv    hush
 121590 tv    clip         src=o72.wav muted=false ready=true delayMs=190
 121590 tv    speak        text=o72.wav voice=clip delayMs=190
 121684 tv    hush
 121684 tv    clip         src=g56.wav muted=false ready=true delayMs=190
 121684 tv    speak        text=g56.wav voice=clip delayMs=190
 121777 tv    hush
 121777 tv    clip         src=i20.wav muted=false ready=true delayMs=190
 121777 tv    speak        text=i20.wav voice=clip delayMs=190
 121870 tv    hush
 121870 tv    clip         src=n44.wav muted=false ready=true delayMs=190
 121870 tv    speak        text=n44.wav voice=clip delayMs=190
 121968 tv    hush
 121968 tv    clip         src=b3.wav muted=false ready=true delayMs=190
 121968 tv    speak        text=b3.wav voice=clip delayMs=190
 122061 tv    hush
 122061 tv    clip         src=o68.wav muted=false ready=true delayMs=190
 122061 tv    speak        text=o68.wav voice=clip delayMs=190
 122162 tv    hush
 122162 tv    clip         src=b2.wav muted=false ready=true delayMs=190
 122162 tv    speak        text=b2.wav voice=clip delayMs=190
 122270 tv    hush
 122270 tv    clip         src=n41.wav muted=false ready=true delayMs=190
 122270 tv    speak        text=n41.wav voice=clip delayMs=190
 122363 tv    hush
 122363 tv    clip         src=o65.wav muted=false ready=true delayMs=190
 122363 tv    speak        text=o65.wav voice=clip delayMs=190
 122456 tv    hush
 122456 tv    clip         src=i17.wav muted=false ready=true delayMs=190
 122456 tv    speak        text=i17.wav voice=clip delayMs=190
 122549 tv    hush
 122549 tv    clip         src=i25.wav muted=false ready=true delayMs=190
 122549 tv    speak        text=i25.wav voice=clip delayMs=190
 122640 tv    hush
 122640 tv    clip         src=i19.wav muted=false ready=true delayMs=190
 122640 tv    speak        text=i19.wav voice=clip delayMs=190
 122739 tv    hush
 122739 tv    clip         src=g57.wav muted=false ready=true delayMs=190
 122739 tv    speak        text=g57.wav voice=clip delayMs=190
 122831 tv    hush
 122831 tv    clip         src=g59.wav muted=false ready=true delayMs=190
 122831 tv    speak        text=g59.wav voice=clip delayMs=190
 123022 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124072 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 124351 tv    hush
 124351 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 124351 tv    hush
 131961 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 131965 tv    music:duck   ms=9000
 131965 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 136964 tv    hush
 136965 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 136965 tv    hush
 138525 tv    ss:cancel    speaking=false pending=false
 138525 tv    music:plan   from=game:bingo to=null
 138528 tv    ss:cancel    speaking=false pending=false
 138528 tv    music:plan   from=null to=lobby
 138528 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 139329 tv    music:stop   track=cool-vibes.mp3
 141037 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 141046 tv    ss:cancel    speaking=false pending=false
 141048 tv    music:plan   from=lobby to=game:bingo
 141048 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 141048 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 141051 tv    hush
 141051 tv    hush
 141662 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 141848 tv    music:stop   track=george-street-shuffle.mp3
 143052 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 143194 tv    ss:cancel    speaking=false pending=false
 143194 tv    music:plan   from=game:bingo to=null
 143194 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 144695 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 145340 tv    ss:cancel    speaking=false pending=false
 145340 tv    music:plan   from=null to=lobby
 145340 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 148706 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 148715 tv    ss:cancel    speaking=false pending=false
 148717 tv    music:plan   from=lobby to=game:bingo
 148717 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 148717 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 148720 tv    hush
 148721 tv    hush
 149146 tv    hush
 149146 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 149146 tv    speak        text=i21.wav voice=clip delayMs=190
 149147 tv    hush
 149338 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 149518 tv    music:stop   track=george-street-shuffle.mp3
 149657 tv    ss:cancel    speaking=false pending=false
 149657 tv    music:plan   from=game:bingo to=null
 149660 tv    ss:cancel    speaking=false pending=false
 149660 tv    music:plan   from=null to=lobby
 149660 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 150461 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"airport-lounge.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 155260 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 155679 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156109 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156545 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156979 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158044 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 158630 tv    ss:cancel    speaking=false pending=false
 158634 tv    music:plan   from=lobby to=null
 158634 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 159903 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 160136 tv    music:stop   track=airport-lounge.mp3
 161494 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 162794 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 164113 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 165128 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 166182 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 168750 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 168943 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 169129 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 169317 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 170440 tv    ss:cancel    speaking=false pending=false
 170443 tv    ss:cancel    speaking=false pending=false
 170443 tv    music:plan   from=null to=lobby
 170443 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 172446 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 172452 tv    ss:cancel    speaking=false pending=false
 172454 tv    music:plan   from=lobby to=null
 172454 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 173955 tv    music:stop   track=george-street-shuffle.mp3
 174033 tv    music:plan   from=null to=game:broken-pencil
 174033 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 174033 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 175525 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 175991 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 176148 tv    music:plan   from=game:broken-pencil to=null
 176148 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 177649 tv    music:stop   track=hep-cats.mp3
```
