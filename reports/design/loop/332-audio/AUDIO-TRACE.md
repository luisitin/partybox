# Audio interaction trace

Captured 2026-09-18T21:02:01.828Z on port 42166. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**56 / 56 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.4}]

```
   1762 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1787 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3101 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3235 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3930 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4567 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5420 tv    ss:cancel    speaking=false pending=false
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
   7772 tv    music:stop   track=local-forecast-elevator.mp3
   8218 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9511 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16477 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17475 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18476 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19476 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20475 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21270 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22080 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22236 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22396 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22552 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22710 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22864 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23009 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23167 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23320 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23476 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23633 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23794 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23954 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24123 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24277 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24436 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24590 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24735 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24891 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25773 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26099 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27909 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29639 tv    ss:cancel    speaking=false pending=false
  29639 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":1.5}]

```
  31196 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33335 tv    ss:cancel    speaking=false pending=false
  33335 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34899 tv    ss:cancel    speaking=false pending=false
  34899 tv    music:plan   from=null to=lobby
  34899 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:george-street-shuffle.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+960ms phone@+964ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer,silence cheer@+5354ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.3}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5412ms cheer@+5366ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36472 tv    music:plan   from=lobby to=game:bingo
  36472 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36472 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36777 tv    hush
  36777 tv    hush
  37272 tv    music:stop   track=george-street-shuffle.mp3
  37388 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38478 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39478 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40478 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41477 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  41477 tv    speak        text=b9.wav voice=clip delayMs=190
  41670 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43102 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  43102 tv    speak        text=b8.wav voice=clip delayMs=190
  43295 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44921 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  44921 tv    speak        text=n34.wav voice=clip delayMs=190
  45112 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46800 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47069 tv    hush
  47069 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47069 tv    hush
  52422 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55440 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56442 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57442 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58442 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  58442 tv    speak        text=n35.wav voice=clip delayMs=190
  58633 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60216 tv    music:paused paused=true
  60216 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61465 tv    music:paused paused=false
  61466 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62745 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  62745 tv    speak        text=i25.wav voice=clip delayMs=190
  62867 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  62867 tv    speak        text=n45.wav voice=clip delayMs=190
  62998 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  62998 tv    speak        text=n33.wav voice=clip delayMs=190
  63118 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  63118 tv    speak        text=g49.wav voice=clip delayMs=190
  63245 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  63245 tv    speak        text=b4.wav voice=clip delayMs=190
  63373 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  63373 tv    speak        text=i20.wav voice=clip delayMs=190
  63497 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  63497 tv    speak        text=o69.wav voice=clip delayMs=190
  63625 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  63625 tv    speak        text=o67.wav voice=clip delayMs=190
  63747 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  63747 tv    speak        text=o65.wav voice=clip delayMs=190
  63879 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  63879 tv    speak        text=o73.wav voice=clip delayMs=190
  63999 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  63999 tv    speak        text=i21.wav voice=clip delayMs=190
  64127 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  64127 tv    speak        text=i18.wav voice=clip delayMs=190
  64247 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  64247 tv    speak        text=g58.wav voice=clip delayMs=190
  64379 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  64379 tv    speak        text=n36.wav voice=clip delayMs=190
  64497 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  64497 tv    speak        text=o61.wav voice=clip delayMs=190
  64625 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  64625 tv    speak        text=n37.wav voice=clip delayMs=190
  64753 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  64753 tv    speak        text=i16.wav voice=clip delayMs=190
  64879 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  64879 tv    speak        text=g47.wav voice=clip delayMs=190
  64997 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  64997 tv    speak        text=n41.wav voice=clip delayMs=190
  65128 tv    clip         src=b6.wav muted=false ready=true delayMs=190
  65128 tv    speak        text=b6.wav voice=clip delayMs=190
  65252 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  65252 tv    speak        text=o72.wav voice=clip delayMs=190
  65377 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  65377 tv    speak        text=b3.wav voice=clip delayMs=190
  65505 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  65505 tv    speak        text=i30.wav voice=clip delayMs=190
  65627 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  65627 tv    speak        text=g56.wav voice=clip delayMs=190
  65733 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  65733 tv    speak        text=o75.wav voice=clip delayMs=190
  65855 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  65855 tv    speak        text=b1.wav voice=clip delayMs=190
  65981 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  65981 tv    speak        text=b2.wav voice=clip delayMs=190
  66112 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  66112 tv    speak        text=n32.wav voice=clip delayMs=190
  66235 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  66235 tv    speak        text=g48.wav voice=clip delayMs=190
  66345 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  66345 tv    speak        text=i23.wav voice=clip delayMs=190
  66452 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  66452 tv    speak        text=i26.wav voice=clip delayMs=190
  66580 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  66580 tv    speak        text=o66.wav voice=clip delayMs=190
  66703 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  66703 tv    speak        text=i19.wav voice=clip delayMs=190
  66830 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  66830 tv    speak        text=n42.wav voice=clip delayMs=190
  66956 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  66956 tv    speak        text=i24.wav voice=clip delayMs=190
  67083 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  67083 tv    speak        text=n39.wav voice=clip delayMs=190
  67207 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  67207 tv    speak        text=g46.wav voice=clip delayMs=190
  67332 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  67332 tv    speak        text=n44.wav voice=clip delayMs=190
  67450 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  67450 tv    speak        text=b15.wav voice=clip delayMs=190
  67560 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  67560 tv    speak        text=b11.wav voice=clip delayMs=190
  67687 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  67687 tv    speak        text=g57.wav voice=clip delayMs=190
  67879 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  68302 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68595 tv    hush
  68595 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68595 tv    hush
  70470 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73949 tv    music:duck   ms=9000
  73949 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  74003 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  78755 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79088 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80090 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81089 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82089 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  82089 tv    speak        text=g57.wav voice=clip delayMs=190
  82280 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84392 tv    ss:cancel    speaking=false pending=false
  84392 tv    music:plan   from=game:bingo to=null
  84395 tv    ss:cancel    speaking=false pending=false
  84395 tv    music:plan   from=null to=lobby
  84395 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  85196 tv    music:stop   track=wallpaper.mp3
  86911 tv    ss:cancel    speaking=false pending=false
  86920 tv    music:plan   from=lobby to=game:bingo
  86920 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86920 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86923 tv    hush
  86923 tv    hush
  87533 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  87540 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  87540 tv    speak        text=i21.wav voice=clip delayMs=190
  87552 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  87552 tv    speak        text=n32.wav voice=clip delayMs=190
  87649 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  87649 tv    speak        text=i18.wav voice=clip delayMs=190
  87721 tv    music:stop   track=bossa-antigua.mp3
  87727 tv    clip         src=n40.wav muted=false ready=true delayMs=190
  87727 tv    speak        text=n40.wav voice=clip delayMs=190
  87845 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  87845 tv    speak        text=i30.wav voice=clip delayMs=190
  87944 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  87944 tv    speak        text=o69.wav voice=clip delayMs=190
  88041 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  88041 tv    speak        text=o61.wav voice=clip delayMs=190
  88140 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  88140 tv    speak        text=n34.wav voice=clip delayMs=190
  88228 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  88228 tv    speak        text=n35.wav voice=clip delayMs=190
  88327 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  88327 tv    speak        text=o67.wav voice=clip delayMs=190
  88418 tv    clip         src=g55.wav muted=false ready=true delayMs=190
  88418 tv    speak        text=g55.wav voice=clip delayMs=190
  88514 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  88514 tv    speak        text=i26.wav voice=clip delayMs=190
  88610 tv    clip         src=i22.wav muted=false ready=true delayMs=190
  88610 tv    speak        text=i22.wav voice=clip delayMs=190
  88707 tv    clip         src=i29.wav muted=false ready=true delayMs=190
  88707 tv    speak        text=i29.wav voice=clip delayMs=190
  88796 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  88796 tv    speak        text=o66.wav voice=clip delayMs=190
  88900 tv    clip         src=g51.wav muted=false ready=true delayMs=190
  88900 tv    speak        text=g51.wav voice=clip delayMs=190
  88986 tv    clip         src=g53.wav muted=false ready=true delayMs=190
  88986 tv    speak        text=g53.wav voice=clip delayMs=190
  89084 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  89084 tv    speak        text=b9.wav voice=clip delayMs=190
  89177 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  89177 tv    speak        text=n36.wav voice=clip delayMs=190
  89273 tv    clip         src=g52.wav muted=false ready=true delayMs=190
  89273 tv    speak        text=g52.wav voice=clip delayMs=190
  89363 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  89363 tv    speak        text=b1.wav voice=clip delayMs=190
  89459 tv    clip         src=b13.wav muted=false ready=true delayMs=190
  89459 tv    speak        text=b13.wav voice=clip delayMs=190
  89554 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  89554 tv    speak        text=n37.wav voice=clip delayMs=190
  89643 tv    clip         src=o71.wav muted=false ready=true delayMs=190
  89643 tv    speak        text=o71.wav voice=clip delayMs=190
  89752 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  89752 tv    speak        text=b8.wav voice=clip delayMs=190
  89849 tv    clip         src=b5.wav muted=false ready=true delayMs=190
  89849 tv    speak        text=b5.wav voice=clip delayMs=190
  89959 tv    clip         src=b7.wav muted=false ready=true delayMs=190
  89959 tv    speak        text=b7.wav voice=clip delayMs=190
  90052 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  90052 tv    speak        text=n42.wav voice=clip delayMs=190
  90149 tv    clip         src=i28.wav muted=false ready=true delayMs=190
  90149 tv    speak        text=i28.wav voice=clip delayMs=190
  90236 tv    clip         src=i27.wav muted=false ready=true delayMs=190
  90236 tv    speak        text=i27.wav voice=clip delayMs=190
  90331 tv    clip         src=o63.wav muted=false ready=true delayMs=190
  90331 tv    speak        text=o63.wav voice=clip delayMs=190
  90412 tv    clip         src=o64.wav muted=false ready=true delayMs=190
  90412 tv    speak        text=o64.wav voice=clip delayMs=190
  90509 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  90509 tv    speak        text=o73.wav voice=clip delayMs=190
  90592 tv    clip         src=g50.wav muted=false ready=true delayMs=190
  90592 tv    speak        text=g50.wav voice=clip delayMs=190
  90696 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  90696 tv    speak        text=g48.wav voice=clip delayMs=190
  90792 tv    clip         src=b12.wav muted=false ready=true delayMs=190
  90792 tv    speak        text=b12.wav voice=clip delayMs=190
  90880 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  90880 tv    speak        text=n45.wav voice=clip delayMs=190
  90991 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  90991 tv    speak        text=b4.wav voice=clip delayMs=190
  91084 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  91084 tv    speak        text=g46.wav voice=clip delayMs=190
  91178 tv    clip         src=o74.wav muted=false ready=true delayMs=190
  91178 tv    speak        text=o74.wav voice=clip delayMs=190
  91294 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  91294 tv    speak        text=g47.wav voice=clip delayMs=190
  91380 tv    clip         src=n31.wav muted=false ready=true delayMs=190
  91380 tv    speak        text=n31.wav voice=clip delayMs=190
  91476 tv    clip         src=o62.wav muted=false ready=true delayMs=190
  91476 tv    speak        text=o62.wav voice=clip delayMs=190
  91575 tv    clip         src=b10.wav muted=false ready=true delayMs=190
  91575 tv    speak        text=b10.wav voice=clip delayMs=190
  91669 tv    clip         src=g60.wav muted=false ready=true delayMs=190
  91669 tv    speak        text=g60.wav voice=clip delayMs=190
  91761 tv    clip         src=n38.wav muted=false ready=true delayMs=190
  91761 tv    speak        text=n38.wav voice=clip delayMs=190
  91860 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  91860 tv    speak        text=n39.wav voice=clip delayMs=190
  91956 tv    clip         src=o70.wav muted=false ready=true delayMs=190
  91956 tv    speak        text=o70.wav voice=clip delayMs=190
  92043 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  92043 tv    speak        text=b11.wav voice=clip delayMs=190
  92136 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  92136 tv    speak        text=o75.wav voice=clip delayMs=190
  92234 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  92234 tv    speak        text=g58.wav voice=clip delayMs=190
  92327 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  92327 tv    speak        text=b15.wav voice=clip delayMs=190
  92427 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  92427 tv    speak        text=i24.wav voice=clip delayMs=190
  92515 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  92515 tv    speak        text=o72.wav voice=clip delayMs=190
  92613 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  92613 tv    speak        text=g56.wav voice=clip delayMs=190
  92707 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  92707 tv    speak        text=i20.wav voice=clip delayMs=190
  92797 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  92797 tv    speak        text=n44.wav voice=clip delayMs=190
  92895 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  92895 tv    speak        text=b3.wav voice=clip delayMs=190
  92990 tv    clip         src=o68.wav muted=false ready=true delayMs=190
  92990 tv    speak        text=o68.wav voice=clip delayMs=190
  93083 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  93083 tv    speak        text=b2.wav voice=clip delayMs=190
  93192 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  93192 tv    speak        text=n41.wav voice=clip delayMs=190
  93283 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  93283 tv    speak        text=o65.wav voice=clip delayMs=190
  93382 tv    clip         src=i17.wav muted=false ready=true delayMs=190
  93382 tv    speak        text=i17.wav voice=clip delayMs=190
  93471 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  93471 tv    speak        text=i25.wav voice=clip delayMs=190
  93566 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  93566 tv    speak        text=i19.wav voice=clip delayMs=190
  93659 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  93659 tv    speak        text=g57.wav voice=clip delayMs=190
  93733 tv    clip         src=g59.wav muted=false ready=true delayMs=190
  93733 tv    speak        text=g59.wav voice=clip delayMs=190
  93924 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  94986 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95256 tv    hush
  95257 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95257 tv    hush
 102862 tv    music:duck   ms=9000
 102862 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 107871 tv    hush
 107872 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 107872 tv    hush
 111861 tv    ss:cancel    speaking=false pending=false
 111861 tv    music:plan   from=game:bingo to=null
 111861 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113361 tv    music:stop   track=wallpaper.mp3
 113492 tv    ss:cancel    speaking=false pending=false
 113492 tv    music:plan   from=null to=lobby
 113492 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 116018 tv    ss:cancel    speaking=false pending=false
 116024 tv    music:plan   from=lobby to=game:bingo
 116024 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 116024 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116027 tv    hush
 116028 tv    hush
 116638 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 116655 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 116655 tv    speak        text=i21.wav voice=clip delayMs=190
 116662 tv    clip         src=n32.wav muted=false ready=true delayMs=190
 116662 tv    speak        text=n32.wav voice=clip delayMs=190
 116774 tv    clip         src=i18.wav muted=false ready=true delayMs=190
 116774 tv    speak        text=i18.wav voice=clip delayMs=190
 116826 tv    music:stop   track=george-street-shuffle.mp3
 116851 tv    clip         src=n40.wav muted=false ready=true delayMs=190
 116851 tv    speak        text=n40.wav voice=clip delayMs=190
 116944 tv    clip         src=i30.wav muted=false ready=true delayMs=190
 116944 tv    speak        text=i30.wav voice=clip delayMs=190
 117041 tv    clip         src=o69.wav muted=false ready=true delayMs=190
 117041 tv    speak        text=o69.wav voice=clip delayMs=190
 117136 tv    clip         src=o61.wav muted=false ready=true delayMs=190
 117136 tv    speak        text=o61.wav voice=clip delayMs=190
 117242 tv    clip         src=n34.wav muted=false ready=true delayMs=190
 117242 tv    speak        text=n34.wav voice=clip delayMs=190
 117336 tv    clip         src=n35.wav muted=false ready=true delayMs=190
 117336 tv    speak        text=n35.wav voice=clip delayMs=190
 117415 tv    clip         src=o67.wav muted=false ready=true delayMs=190
 117415 tv    speak        text=o67.wav voice=clip delayMs=190
 117508 tv    clip         src=g55.wav muted=false ready=true delayMs=190
 117508 tv    speak        text=g55.wav voice=clip delayMs=190
 117599 tv    clip         src=i26.wav muted=false ready=true delayMs=190
 117599 tv    speak        text=i26.wav voice=clip delayMs=190
 117697 tv    clip         src=i22.wav muted=false ready=true delayMs=190
 117697 tv    speak        text=i22.wav voice=clip delayMs=190
 117786 tv    clip         src=i29.wav muted=false ready=true delayMs=190
 117786 tv    speak        text=i29.wav voice=clip delayMs=190
 117882 tv    clip         src=o66.wav muted=false ready=true delayMs=190
 117882 tv    speak        text=o66.wav voice=clip delayMs=190
 117976 tv    clip         src=g51.wav muted=false ready=true delayMs=190
 117976 tv    speak        text=g51.wav voice=clip delayMs=190
 118085 tv    clip         src=g53.wav muted=false ready=true delayMs=190
 118085 tv    speak        text=g53.wav voice=clip delayMs=190
 118189 tv    clip         src=b9.wav muted=false ready=true delayMs=190
 118189 tv    speak        text=b9.wav voice=clip delayMs=190
 118296 tv    clip         src=n36.wav muted=false ready=true delayMs=190
 118296 tv    speak        text=n36.wav voice=clip delayMs=190
 118389 tv    clip         src=g52.wav muted=false ready=true delayMs=190
 118389 tv    speak        text=g52.wav voice=clip delayMs=190
 118487 tv    clip         src=b1.wav muted=false ready=true delayMs=190
 118487 tv    speak        text=b1.wav voice=clip delayMs=190
 118579 tv    clip         src=b13.wav muted=false ready=true delayMs=190
 118579 tv    speak        text=b13.wav voice=clip delayMs=190
 118671 tv    clip         src=n37.wav muted=false ready=true delayMs=190
 118671 tv    speak        text=n37.wav voice=clip delayMs=190
 118746 tv    clip         src=o71.wav muted=false ready=true delayMs=190
 118746 tv    speak        text=o71.wav voice=clip delayMs=190
 118847 tv    clip         src=b8.wav muted=false ready=true delayMs=190
 118847 tv    speak        text=b8.wav voice=clip delayMs=190
 118939 tv    clip         src=b5.wav muted=false ready=true delayMs=190
 118939 tv    speak        text=b5.wav voice=clip delayMs=190
 119034 tv    clip         src=b7.wav muted=false ready=true delayMs=190
 119034 tv    speak        text=b7.wav voice=clip delayMs=190
 119123 tv    clip         src=n42.wav muted=false ready=true delayMs=190
 119123 tv    speak        text=n42.wav voice=clip delayMs=190
 119206 tv    clip         src=i28.wav muted=false ready=true delayMs=190
 119206 tv    speak        text=i28.wav voice=clip delayMs=190
 119301 tv    clip         src=i27.wav muted=false ready=true delayMs=190
 119301 tv    speak        text=i27.wav voice=clip delayMs=190
 119391 tv    clip         src=o63.wav muted=false ready=true delayMs=190
 119391 tv    speak        text=o63.wav voice=clip delayMs=190
 119485 tv    clip         src=o64.wav muted=false ready=true delayMs=190
 119485 tv    speak        text=o64.wav voice=clip delayMs=190
 119563 tv    clip         src=o73.wav muted=false ready=true delayMs=190
 119563 tv    speak        text=o73.wav voice=clip delayMs=190
 119663 tv    clip         src=g50.wav muted=false ready=true delayMs=190
 119663 tv    speak        text=g50.wav voice=clip delayMs=190
 119756 tv    clip         src=g48.wav muted=false ready=true delayMs=190
 119756 tv    speak        text=g48.wav voice=clip delayMs=190
 119845 tv    clip         src=b12.wav muted=false ready=true delayMs=190
 119845 tv    speak        text=b12.wav voice=clip delayMs=190
 119943 tv    clip         src=n45.wav muted=false ready=true delayMs=190
 119943 tv    speak        text=n45.wav voice=clip delayMs=190
 120037 tv    clip         src=b4.wav muted=false ready=true delayMs=190
 120037 tv    speak        text=b4.wav voice=clip delayMs=190
 120127 tv    clip         src=g46.wav muted=false ready=true delayMs=190
 120127 tv    speak        text=g46.wav voice=clip delayMs=190
 120241 tv    clip         src=o74.wav muted=false ready=true delayMs=190
 120241 tv    speak        text=o74.wav voice=clip delayMs=190
 120330 tv    clip         src=g47.wav muted=false ready=true delayMs=190
 120330 tv    speak        text=g47.wav voice=clip delayMs=190
 120425 tv    clip         src=n31.wav muted=false ready=true delayMs=190
 120425 tv    speak        text=n31.wav voice=clip delayMs=190
 120526 tv    clip         src=o62.wav muted=false ready=true delayMs=190
 120526 tv    speak        text=o62.wav voice=clip delayMs=190
 120618 tv    clip         src=b10.wav muted=false ready=true delayMs=190
 120618 tv    speak        text=b10.wav voice=clip delayMs=190
 120709 tv    clip         src=g60.wav muted=false ready=true delayMs=190
 120709 tv    speak        text=g60.wav voice=clip delayMs=190
 120801 tv    clip         src=n38.wav muted=false ready=true delayMs=190
 120801 tv    speak        text=n38.wav voice=clip delayMs=190
 120895 tv    clip         src=n39.wav muted=false ready=true delayMs=190
 120895 tv    speak        text=n39.wav voice=clip delayMs=190
 120996 tv    clip         src=o70.wav muted=false ready=true delayMs=190
 120996 tv    speak        text=o70.wav voice=clip delayMs=190
 121103 tv    clip         src=b11.wav muted=false ready=true delayMs=190
 121103 tv    speak        text=b11.wav voice=clip delayMs=190
 121210 tv    clip         src=o75.wav muted=false ready=true delayMs=190
 121210 tv    speak        text=o75.wav voice=clip delayMs=190
 121298 tv    clip         src=g58.wav muted=false ready=true delayMs=190
 121298 tv    speak        text=g58.wav voice=clip delayMs=190
 121399 tv    clip         src=b15.wav muted=false ready=true delayMs=190
 121399 tv    speak        text=b15.wav voice=clip delayMs=190
 121493 tv    clip         src=i24.wav muted=false ready=true delayMs=190
 121493 tv    speak        text=i24.wav voice=clip delayMs=190
 121579 tv    clip         src=o72.wav muted=false ready=true delayMs=190
 121579 tv    speak        text=o72.wav voice=clip delayMs=190
 121678 tv    clip         src=g56.wav muted=false ready=true delayMs=190
 121678 tv    speak        text=g56.wav voice=clip delayMs=190
 121771 tv    clip         src=i20.wav muted=false ready=true delayMs=190
 121771 tv    speak        text=i20.wav voice=clip delayMs=190
 121864 tv    clip         src=n44.wav muted=false ready=true delayMs=190
 121864 tv    speak        text=n44.wav voice=clip delayMs=190
 121953 tv    clip         src=b3.wav muted=false ready=true delayMs=190
 121953 tv    speak        text=b3.wav voice=clip delayMs=190
 122049 tv    clip         src=o68.wav muted=false ready=true delayMs=190
 122049 tv    speak        text=o68.wav voice=clip delayMs=190
 122143 tv    clip         src=b2.wav muted=false ready=true delayMs=190
 122143 tv    speak        text=b2.wav voice=clip delayMs=190
 122242 tv    clip         src=n41.wav muted=false ready=true delayMs=190
 122242 tv    speak        text=n41.wav voice=clip delayMs=190
 122334 tv    clip         src=o65.wav muted=false ready=true delayMs=190
 122334 tv    speak        text=o65.wav voice=clip delayMs=190
 122431 tv    clip         src=i17.wav muted=false ready=true delayMs=190
 122431 tv    speak        text=i17.wav voice=clip delayMs=190
 122516 tv    clip         src=i25.wav muted=false ready=true delayMs=190
 122516 tv    speak        text=i25.wav voice=clip delayMs=190
 122611 tv    clip         src=i19.wav muted=false ready=true delayMs=190
 122611 tv    speak        text=i19.wav voice=clip delayMs=190
 122710 tv    clip         src=g57.wav muted=false ready=true delayMs=190
 122710 tv    speak        text=g57.wav voice=clip delayMs=190
 122804 tv    clip         src=g59.wav muted=false ready=true delayMs=190
 122804 tv    speak        text=g59.wav voice=clip delayMs=190
 122995 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124062 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 124329 tv    hush
 124329 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 124329 tv    hush
 131933 tv    music:duck   ms=9000
 131933 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 136965 tv    hush
 136965 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 136965 tv    hush
 138507 tv    ss:cancel    speaking=false pending=false
 138508 tv    music:plan   from=game:bingo to=null
 138510 tv    ss:cancel    speaking=false pending=false
 138510 tv    music:plan   from=null to=lobby
 138510 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 139311 tv    music:stop   track=cool-vibes.mp3
 141015 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 141024 tv    ss:cancel    speaking=false pending=false
 141030 tv    music:plan   from=lobby to=game:bingo
 141030 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 141030 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 141033 tv    hush
 141034 tv    hush
 141644 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 141832 tv    music:stop   track=george-street-shuffle.mp3
 143035 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 143160 tv    ss:cancel    speaking=false pending=false
 143160 tv    music:plan   from=game:bingo to=null
 143160 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 144661 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 145289 tv    ss:cancel    speaking=false pending=false
 145289 tv    music:plan   from=null to=lobby
 145289 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 148649 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 148657 tv    ss:cancel    speaking=false pending=false
 148659 tv    music:plan   from=lobby to=game:bingo
 148659 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 148659 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 148662 tv    hush
 148663 tv    hush
 149079 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 149079 tv    speak        text=i21.wav voice=clip delayMs=190
 149270 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 149461 tv    music:stop   track=george-street-shuffle.mp3
 149574 tv    ss:cancel    speaking=false pending=false
 149574 tv    music:plan   from=game:bingo to=null
 149578 tv    ss:cancel    speaking=false pending=false
 149578 tv    music:plan   from=null to=lobby
 149578 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 150379 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":10.2}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 155194 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 155614 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156047 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156483 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156931 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157974 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 158575 tv    ss:cancel    speaking=false pending=false
 158579 tv    music:plan   from=lobby to=null
 158579 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 159834 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 160080 tv    music:stop   track=bossa-antigua.mp3
 161420 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 162847 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 164148 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 165162 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 166214 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 168780 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 168970 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 169157 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 169345 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 170457 tv    ss:cancel    speaking=false pending=false
 170459 tv    ss:cancel    speaking=false pending=false
 170459 tv    music:plan   from=null to=lobby
 170459 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 172490 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 172506 tv    ss:cancel    speaking=false pending=false
 172508 tv    music:plan   from=lobby to=null
 172508 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 174009 tv    music:stop   track=george-street-shuffle.mp3
 174075 tv    music:plan   from=null to=game:broken-pencil
 174075 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 174075 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 175544 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 176019 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 176178 tv    music:plan   from=game:broken-pencil to=null
 176178 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 177678 tv    music:stop   track=backbay-lounge.mp3
```
