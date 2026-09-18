# Audio interaction trace

Captured 2026-09-18T23:12:27.358Z on port 42166. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**59 / 59 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:bossa-antigua
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":4.4}]

```
   1748 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   1775 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3084 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3203 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3908 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4535 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5387 tv    ss:cancel    speaking=false pending=false
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
   7723 tv    music:stop   track=bossa-antigua.mp3
   8176 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9454 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16427 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17430 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18426 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19436 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20434 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21238 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22028 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22185 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22338 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22482 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22641 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22799 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22958 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23116 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23272 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23431 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23587 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23747 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23900 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24059 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24216 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24375 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24530 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24689 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24845 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25734 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26063 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27877 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29595 tv    ss:cancel    speaking=false pending=false
  29595 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31148 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33281 tv    ss:cancel    speaking=false pending=false
  33281 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34833 tv    ss:cancel    speaking=false pending=false
  34833 tv    music:plan   from=null to=lobby
  34833 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":3}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime** — cues=start,card,lock,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+1011ms phone@+1014ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "another" is a 20 ms tap and one card pluck; Ready a 20 ms tap and the submit cue** — taps=3 cues=card,submit
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **each voice starts on the push (no delay); its boing lands on the squash, 170–230 ms later** — delays=0,0 boing lags=191,190ms
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18.1}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":25}]
- ✅ **skipping through the deck: a hush before every call, one voice at a time** — clips=41 hushes=41
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer,silence cheer@+5355ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.6}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the winner's celebration buzz (320 ms) runs whole — nothing shorter cuts it** — celebration@73655 cut by=[]
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5415ms cheer@+5367ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36406 tv    music:plan   from=lobby to=game:bingo
  36406 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36406 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36713 tv    hush
  36713 tv    hush
  37207 tv    music:stop   track=airport-lounge.mp3
  37364 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  39465 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  39716 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40714 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41715 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  42723 tv    hush
  42723 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  42723 tv    speak        text=b9.wav voice=clip delayMs=0
  42724 tv    hush
  42915 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43075 tv    hush
  43075 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  43075 tv    speak        text=b8.wav voice=clip delayMs=0
  43266 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44913 tv    hush
  44913 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  44913 tv    speak        text=n34.wav voice=clip delayMs=0
  45103 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46799 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47067 tv    hush
  47067 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47067 tv    hush
  52419 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55428 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56429 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57430 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58438 tv    hush
  58438 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  58438 tv    speak        text=n35.wav voice=clip delayMs=0
  58629 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60250 tv    music:paused paused=true
  60250 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61500 tv    music:paused paused=false
  61500 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62789 tv    hush
  62789 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  62789 tv    speak        text=i25.wav voice=clip delayMs=0
  62914 tv    hush
  62914 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  62914 tv    speak        text=n45.wav voice=clip delayMs=0
  63043 tv    hush
  63043 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  63043 tv    speak        text=n33.wav voice=clip delayMs=0
  63172 tv    hush
  63172 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  63172 tv    speak        text=g49.wav voice=clip delayMs=0
  63293 tv    hush
  63293 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  63293 tv    speak        text=b4.wav voice=clip delayMs=0
  63420 tv    hush
  63420 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  63420 tv    speak        text=i20.wav voice=clip delayMs=0
  63544 tv    hush
  63544 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  63544 tv    speak        text=o69.wav voice=clip delayMs=0
  63672 tv    hush
  63672 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  63672 tv    speak        text=o67.wav voice=clip delayMs=0
  63797 tv    hush
  63797 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  63797 tv    speak        text=o65.wav voice=clip delayMs=0
  63921 tv    hush
  63921 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  63921 tv    speak        text=o73.wav voice=clip delayMs=0
  64051 tv    hush
  64051 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  64051 tv    speak        text=i21.wav voice=clip delayMs=0
  64164 tv    hush
  64164 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  64164 tv    speak        text=i18.wav voice=clip delayMs=0
  64285 tv    hush
  64285 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  64285 tv    speak        text=g58.wav voice=clip delayMs=0
  64414 tv    hush
  64414 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  64414 tv    speak        text=n36.wav voice=clip delayMs=0
  64541 tv    hush
  64541 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  64541 tv    speak        text=o61.wav voice=clip delayMs=0
  64664 tv    hush
  64664 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  64664 tv    speak        text=n37.wav voice=clip delayMs=0
  64790 tv    hush
  64790 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  64790 tv    speak        text=i16.wav voice=clip delayMs=0
  64914 tv    hush
  64914 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  64914 tv    speak        text=g47.wav voice=clip delayMs=0
  65039 tv    hush
  65039 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  65039 tv    speak        text=n41.wav voice=clip delayMs=0
  65168 tv    hush
  65168 tv    clip         src=b6.wav muted=false ready=true delayMs=0
  65168 tv    speak        text=b6.wav voice=clip delayMs=0
  65286 tv    hush
  65286 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  65286 tv    speak        text=o72.wav voice=clip delayMs=0
  65422 tv    hush
  65422 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  65422 tv    speak        text=b3.wav voice=clip delayMs=0
  65537 tv    hush
  65537 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  65537 tv    speak        text=i30.wav voice=clip delayMs=0
  65666 tv    hush
  65666 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  65666 tv    speak        text=g56.wav voice=clip delayMs=0
  65789 tv    hush
  65789 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  65789 tv    speak        text=o75.wav voice=clip delayMs=0
  65913 tv    hush
  65913 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  65913 tv    speak        text=b1.wav voice=clip delayMs=0
  66040 tv    hush
  66040 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  66040 tv    speak        text=b2.wav voice=clip delayMs=0
  66171 tv    hush
  66171 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  66171 tv    speak        text=n32.wav voice=clip delayMs=0
  66292 tv    hush
  66292 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  66292 tv    speak        text=g48.wav voice=clip delayMs=0
  66421 tv    hush
  66421 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  66421 tv    speak        text=i23.wav voice=clip delayMs=0
  66549 tv    hush
  66549 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  66549 tv    speak        text=i26.wav voice=clip delayMs=0
  66664 tv    hush
  66664 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  66664 tv    speak        text=o66.wav voice=clip delayMs=0
  66794 tv    hush
  66794 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  66794 tv    speak        text=i19.wav voice=clip delayMs=0
  66917 tv    hush
  66917 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  66917 tv    speak        text=n42.wav voice=clip delayMs=0
  67046 tv    hush
  67046 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  67046 tv    speak        text=i24.wav voice=clip delayMs=0
  67177 tv    hush
  67177 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  67177 tv    speak        text=n39.wav voice=clip delayMs=0
  67295 tv    hush
  67295 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  67295 tv    speak        text=g46.wav voice=clip delayMs=0
  67426 tv    hush
  67426 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  67426 tv    speak        text=n44.wav voice=clip delayMs=0
  67543 tv    hush
  67543 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  67543 tv    speak        text=b15.wav voice=clip delayMs=0
  67670 tv    hush
  67670 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  67670 tv    speak        text=b11.wav voice=clip delayMs=0
  67796 tv    hush
  67796 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  67796 tv    speak        text=g57.wav voice=clip delayMs=0
  67987 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  68415 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68709 tv    hush
  68709 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68710 tv    hush
  70582 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  74064 tv    music:duck   ms=9000
  74064 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  74119 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  78888 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79216 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80217 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81217 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82216 tv    hush
  82216 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  82216 tv    speak        text=g57.wav voice=clip delayMs=0
  82407 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84526 tv    ss:cancel    speaking=false pending=false
  84526 tv    music:plan   from=game:bingo to=null
  84529 tv    ss:cancel    speaking=false pending=false
  84529 tv    music:plan   from=null to=lobby
  84529 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  85329 tv    music:stop   track=wallpaper.mp3
  87049 tv    ss:cancel    speaking=false pending=false
  87058 tv    music:plan   from=lobby to=game:bingo
  87058 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  87058 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  87062 tv    hush
  87063 tv    hush
  87676 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  87678 tv    hush
  87678 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  87678 tv    speak        text=i21.wav voice=clip delayMs=0
  87678 tv    hush
  87690 tv    hush
  87690 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  87690 tv    speak        text=n32.wav voice=clip delayMs=0
  87788 tv    hush
  87788 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  87788 tv    speak        text=i18.wav voice=clip delayMs=0
  87859 tv    music:stop   track=bossa-antigua.mp3
  87882 tv    hush
  87882 tv    clip         src=n40.wav muted=false ready=true delayMs=0
  87882 tv    speak        text=n40.wav voice=clip delayMs=0
  87977 tv    hush
  87977 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  87977 tv    speak        text=i30.wav voice=clip delayMs=0
  88070 tv    hush
  88070 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  88070 tv    speak        text=o69.wav voice=clip delayMs=0
  88149 tv    hush
  88149 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  88149 tv    speak        text=o61.wav voice=clip delayMs=0
  88245 tv    hush
  88245 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  88245 tv    speak        text=n34.wav voice=clip delayMs=0
  88338 tv    hush
  88338 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  88338 tv    speak        text=n35.wav voice=clip delayMs=0
  88433 tv    hush
  88433 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  88433 tv    speak        text=o67.wav voice=clip delayMs=0
  88528 tv    hush
  88528 tv    clip         src=g55.wav muted=false ready=true delayMs=0
  88528 tv    speak        text=g55.wav voice=clip delayMs=0
  88622 tv    hush
  88622 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  88622 tv    speak        text=i26.wav voice=clip delayMs=0
  88720 tv    hush
  88720 tv    clip         src=i22.wav muted=false ready=true delayMs=0
  88720 tv    speak        text=i22.wav voice=clip delayMs=0
  88816 tv    hush
  88816 tv    clip         src=i29.wav muted=false ready=true delayMs=0
  88816 tv    speak        text=i29.wav voice=clip delayMs=0
  88911 tv    hush
  88911 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  88911 tv    speak        text=o66.wav voice=clip delayMs=0
  89005 tv    hush
  89005 tv    clip         src=g51.wav muted=false ready=true delayMs=0
  89005 tv    speak        text=g51.wav voice=clip delayMs=0
  89098 tv    hush
  89098 tv    clip         src=g53.wav muted=false ready=true delayMs=0
  89098 tv    speak        text=g53.wav voice=clip delayMs=0
  89203 tv    hush
  89203 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  89203 tv    speak        text=b9.wav voice=clip delayMs=0
  89298 tv    hush
  89298 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  89298 tv    speak        text=n36.wav voice=clip delayMs=0
  89392 tv    hush
  89392 tv    clip         src=g52.wav muted=false ready=true delayMs=0
  89392 tv    speak        text=g52.wav voice=clip delayMs=0
  89487 tv    hush
  89487 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  89487 tv    speak        text=b1.wav voice=clip delayMs=0
  89581 tv    hush
  89581 tv    clip         src=b13.wav muted=false ready=true delayMs=0
  89581 tv    speak        text=b13.wav voice=clip delayMs=0
  89677 tv    hush
  89677 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  89677 tv    speak        text=n37.wav voice=clip delayMs=0
  89772 tv    hush
  89772 tv    clip         src=o71.wav muted=false ready=true delayMs=0
  89772 tv    speak        text=o71.wav voice=clip delayMs=0
  89866 tv    hush
  89866 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  89866 tv    speak        text=b8.wav voice=clip delayMs=0
  89946 tv    hush
  89946 tv    clip         src=b5.wav muted=false ready=true delayMs=0
  89946 tv    speak        text=b5.wav voice=clip delayMs=0
  90040 tv    hush
  90040 tv    clip         src=b7.wav muted=false ready=true delayMs=0
  90040 tv    speak        text=b7.wav voice=clip delayMs=0
  90135 tv    hush
  90135 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  90135 tv    speak        text=n42.wav voice=clip delayMs=0
  90231 tv    hush
  90231 tv    clip         src=i28.wav muted=false ready=true delayMs=0
  90231 tv    speak        text=i28.wav voice=clip delayMs=0
  90325 tv    hush
  90325 tv    clip         src=i27.wav muted=false ready=true delayMs=0
  90325 tv    speak        text=i27.wav voice=clip delayMs=0
  90419 tv    hush
  90420 tv    clip         src=o63.wav muted=false ready=true delayMs=0
  90420 tv    speak        text=o63.wav voice=clip delayMs=0
  90512 tv    hush
  90512 tv    clip         src=o64.wav muted=false ready=true delayMs=0
  90512 tv    speak        text=o64.wav voice=clip delayMs=0
  90609 tv    hush
  90609 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  90609 tv    speak        text=o73.wav voice=clip delayMs=0
  90687 tv    hush
  90687 tv    clip         src=g50.wav muted=false ready=true delayMs=0
  90687 tv    speak        text=g50.wav voice=clip delayMs=0
  90781 tv    hush
  90781 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  90781 tv    speak        text=g48.wav voice=clip delayMs=0
  90861 tv    hush
  90861 tv    clip         src=b12.wav muted=false ready=true delayMs=0
  90861 tv    speak        text=b12.wav voice=clip delayMs=0
  90956 tv    hush
  90956 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  90956 tv    speak        text=n45.wav voice=clip delayMs=0
  91050 tv    hush
  91050 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  91050 tv    speak        text=b4.wav voice=clip delayMs=0
  91144 tv    hush
  91144 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  91144 tv    speak        text=g46.wav voice=clip delayMs=0
  91237 tv    hush
  91237 tv    clip         src=o74.wav muted=false ready=true delayMs=0
  91237 tv    speak        text=o74.wav voice=clip delayMs=0
  91333 tv    hush
  91333 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  91333 tv    speak        text=g47.wav voice=clip delayMs=0
  91428 tv    hush
  91428 tv    clip         src=n31.wav muted=false ready=true delayMs=0
  91428 tv    speak        text=n31.wav voice=clip delayMs=0
  91522 tv    hush
  91522 tv    clip         src=o62.wav muted=false ready=true delayMs=0
  91522 tv    speak        text=o62.wav voice=clip delayMs=0
  91616 tv    hush
  91616 tv    clip         src=b10.wav muted=false ready=true delayMs=0
  91616 tv    speak        text=b10.wav voice=clip delayMs=0
  91711 tv    hush
  91711 tv    clip         src=g60.wav muted=false ready=true delayMs=0
  91711 tv    speak        text=g60.wav voice=clip delayMs=0
  91806 tv    hush
  91806 tv    clip         src=n38.wav muted=false ready=true delayMs=0
  91806 tv    speak        text=n38.wav voice=clip delayMs=0
  91899 tv    hush
  91899 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  91899 tv    speak        text=n39.wav voice=clip delayMs=0
  91995 tv    hush
  91995 tv    clip         src=o70.wav muted=false ready=true delayMs=0
  91995 tv    speak        text=o70.wav voice=clip delayMs=0
  92090 tv    hush
  92090 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  92090 tv    speak        text=b11.wav voice=clip delayMs=0
  92183 tv    hush
  92183 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  92183 tv    speak        text=o75.wav voice=clip delayMs=0
  92279 tv    hush
  92279 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  92279 tv    speak        text=g58.wav voice=clip delayMs=0
  92373 tv    hush
  92373 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  92373 tv    speak        text=b15.wav voice=clip delayMs=0
  92468 tv    hush
  92468 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  92468 tv    speak        text=i24.wav voice=clip delayMs=0
  92548 tv    hush
  92548 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  92548 tv    speak        text=o72.wav voice=clip delayMs=0
  92627 tv    hush
  92627 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  92627 tv    speak        text=g56.wav voice=clip delayMs=0
  92721 tv    hush
  92721 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  92721 tv    speak        text=i20.wav voice=clip delayMs=0
  92814 tv    hush
  92814 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  92814 tv    speak        text=n44.wav voice=clip delayMs=0
  92909 tv    hush
  92909 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  92909 tv    speak        text=b3.wav voice=clip delayMs=0
  93001 tv    hush
  93001 tv    clip         src=o68.wav muted=false ready=true delayMs=0
  93001 tv    speak        text=o68.wav voice=clip delayMs=0
  93096 tv    hush
  93096 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  93096 tv    speak        text=b2.wav voice=clip delayMs=0
  93190 tv    hush
  93190 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  93190 tv    speak        text=n41.wav voice=clip delayMs=0
  93285 tv    hush
  93285 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  93285 tv    speak        text=o65.wav voice=clip delayMs=0
  93379 tv    hush
  93379 tv    clip         src=i17.wav muted=false ready=true delayMs=0
  93379 tv    speak        text=i17.wav voice=clip delayMs=0
  93460 tv    hush
  93460 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  93460 tv    speak        text=i25.wav voice=clip delayMs=0
  93554 tv    hush
  93554 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  93554 tv    speak        text=i19.wav voice=clip delayMs=0
  93649 tv    hush
  93649 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  93649 tv    speak        text=g57.wav voice=clip delayMs=0
  93745 tv    hush
  93745 tv    clip         src=g59.wav muted=false ready=true delayMs=0
  93745 tv    speak        text=g59.wav voice=clip delayMs=0
  93937 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  94964 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95230 tv    hush
  95230 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95230 tv    hush
 102834 tv    music:duck   ms=9000
 102834 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 107861 tv    hush
 107861 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 107861 tv    hush
 111854 tv    ss:cancel    speaking=false pending=false
 111854 tv    music:plan   from=game:bingo to=null
 111854 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113355 tv    music:stop   track=wallpaper.mp3
 113477 tv    ss:cancel    speaking=false pending=false
 113477 tv    music:plan   from=null to=lobby
 113477 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 115996 tv    ss:cancel    speaking=false pending=false
 116007 tv    music:plan   from=lobby to=game:bingo
 116007 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 116007 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116010 tv    hush
 116011 tv    hush
 116621 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 116624 tv    hush
 116624 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 116624 tv    speak        text=i21.wav voice=clip delayMs=0
 116624 tv    hush
 116638 tv    hush
 116638 tv    clip         src=n32.wav muted=false ready=true delayMs=0
 116638 tv    speak        text=n32.wav voice=clip delayMs=0
 116733 tv    hush
 116733 tv    clip         src=i18.wav muted=false ready=true delayMs=0
 116733 tv    speak        text=i18.wav voice=clip delayMs=0
 116807 tv    music:stop   track=airport-lounge.mp3
 116829 tv    hush
 116829 tv    clip         src=n40.wav muted=false ready=true delayMs=0
 116829 tv    speak        text=n40.wav voice=clip delayMs=0
 116926 tv    hush
 116926 tv    clip         src=i30.wav muted=false ready=true delayMs=0
 116926 tv    speak        text=i30.wav voice=clip delayMs=0
 117019 tv    hush
 117019 tv    clip         src=o69.wav muted=false ready=true delayMs=0
 117019 tv    speak        text=o69.wav voice=clip delayMs=0
 117114 tv    hush
 117114 tv    clip         src=o61.wav muted=false ready=true delayMs=0
 117114 tv    speak        text=o61.wav voice=clip delayMs=0
 117210 tv    hush
 117210 tv    clip         src=n34.wav muted=false ready=true delayMs=0
 117210 tv    speak        text=n34.wav voice=clip delayMs=0
 117303 tv    hush
 117303 tv    clip         src=n35.wav muted=false ready=true delayMs=0
 117303 tv    speak        text=n35.wav voice=clip delayMs=0
 117397 tv    hush
 117397 tv    clip         src=o67.wav muted=false ready=true delayMs=0
 117397 tv    speak        text=o67.wav voice=clip delayMs=0
 117493 tv    hush
 117493 tv    clip         src=g55.wav muted=false ready=true delayMs=0
 117493 tv    speak        text=g55.wav voice=clip delayMs=0
 117588 tv    hush
 117588 tv    clip         src=i26.wav muted=false ready=true delayMs=0
 117588 tv    speak        text=i26.wav voice=clip delayMs=0
 117684 tv    hush
 117684 tv    clip         src=i22.wav muted=false ready=true delayMs=0
 117684 tv    speak        text=i22.wav voice=clip delayMs=0
 117779 tv    hush
 117779 tv    clip         src=i29.wav muted=false ready=true delayMs=0
 117779 tv    speak        text=i29.wav voice=clip delayMs=0
 117859 tv    hush
 117859 tv    clip         src=o66.wav muted=false ready=true delayMs=0
 117859 tv    speak        text=o66.wav voice=clip delayMs=0
 117953 tv    hush
 117953 tv    clip         src=g51.wav muted=false ready=true delayMs=0
 117953 tv    speak        text=g51.wav voice=clip delayMs=0
 118047 tv    hush
 118047 tv    clip         src=g53.wav muted=false ready=true delayMs=0
 118047 tv    speak        text=g53.wav voice=clip delayMs=0
 118141 tv    hush
 118142 tv    clip         src=b9.wav muted=false ready=true delayMs=0
 118142 tv    speak        text=b9.wav voice=clip delayMs=0
 118205 tv    hush
 118205 tv    clip         src=n36.wav muted=false ready=true delayMs=0
 118205 tv    speak        text=n36.wav voice=clip delayMs=0
 118283 tv    hush
 118283 tv    clip         src=g52.wav muted=false ready=true delayMs=0
 118283 tv    speak        text=g52.wav voice=clip delayMs=0
 118379 tv    hush
 118379 tv    clip         src=b1.wav muted=false ready=true delayMs=0
 118379 tv    speak        text=b1.wav voice=clip delayMs=0
 118475 tv    hush
 118475 tv    clip         src=b13.wav muted=false ready=true delayMs=0
 118475 tv    speak        text=b13.wav voice=clip delayMs=0
 118570 tv    hush
 118570 tv    clip         src=n37.wav muted=false ready=true delayMs=0
 118570 tv    speak        text=n37.wav voice=clip delayMs=0
 118665 tv    hush
 118665 tv    clip         src=o71.wav muted=false ready=true delayMs=0
 118665 tv    speak        text=o71.wav voice=clip delayMs=0
 118745 tv    hush
 118745 tv    clip         src=b8.wav muted=false ready=true delayMs=0
 118745 tv    speak        text=b8.wav voice=clip delayMs=0
 118841 tv    hush
 118841 tv    clip         src=b5.wav muted=false ready=true delayMs=0
 118841 tv    speak        text=b5.wav voice=clip delayMs=0
 118936 tv    hush
 118936 tv    clip         src=b7.wav muted=false ready=true delayMs=0
 118936 tv    speak        text=b7.wav voice=clip delayMs=0
 119034 tv    hush
 119034 tv    clip         src=n42.wav muted=false ready=true delayMs=0
 119034 tv    speak        text=n42.wav voice=clip delayMs=0
 119129 tv    hush
 119129 tv    clip         src=i28.wav muted=false ready=true delayMs=0
 119129 tv    speak        text=i28.wav voice=clip delayMs=0
 119219 tv    hush
 119219 tv    clip         src=i27.wav muted=false ready=true delayMs=0
 119219 tv    speak        text=i27.wav voice=clip delayMs=0
 119314 tv    hush
 119314 tv    clip         src=o63.wav muted=false ready=true delayMs=0
 119314 tv    speak        text=o63.wav voice=clip delayMs=0
 119381 tv    hush
 119381 tv    clip         src=o64.wav muted=false ready=true delayMs=0
 119381 tv    speak        text=o64.wav voice=clip delayMs=0
 119474 tv    hush
 119474 tv    clip         src=o73.wav muted=false ready=true delayMs=0
 119474 tv    speak        text=o73.wav voice=clip delayMs=0
 119568 tv    hush
 119568 tv    clip         src=g50.wav muted=false ready=true delayMs=0
 119568 tv    speak        text=g50.wav voice=clip delayMs=0
 119662 tv    hush
 119662 tv    clip         src=g48.wav muted=false ready=true delayMs=0
 119662 tv    speak        text=g48.wav voice=clip delayMs=0
 119756 tv    hush
 119756 tv    clip         src=b12.wav muted=false ready=true delayMs=0
 119756 tv    speak        text=b12.wav voice=clip delayMs=0
 119850 tv    hush
 119850 tv    clip         src=n45.wav muted=false ready=true delayMs=0
 119850 tv    speak        text=n45.wav voice=clip delayMs=0
 119944 tv    hush
 119944 tv    clip         src=b4.wav muted=false ready=true delayMs=0
 119944 tv    speak        text=b4.wav voice=clip delayMs=0
 120024 tv    hush
 120024 tv    clip         src=g46.wav muted=false ready=true delayMs=0
 120024 tv    speak        text=g46.wav voice=clip delayMs=0
 120117 tv    hush
 120117 tv    clip         src=o74.wav muted=false ready=true delayMs=0
 120117 tv    speak        text=o74.wav voice=clip delayMs=0
 120213 tv    hush
 120213 tv    clip         src=g47.wav muted=false ready=true delayMs=0
 120213 tv    speak        text=g47.wav voice=clip delayMs=0
 120308 tv    hush
 120308 tv    clip         src=n31.wav muted=false ready=true delayMs=0
 120308 tv    speak        text=n31.wav voice=clip delayMs=0
 120403 tv    hush
 120403 tv    clip         src=o62.wav muted=false ready=true delayMs=0
 120403 tv    speak        text=o62.wav voice=clip delayMs=0
 120500 tv    hush
 120500 tv    clip         src=b10.wav muted=false ready=true delayMs=0
 120500 tv    speak        text=b10.wav voice=clip delayMs=0
 120596 tv    hush
 120596 tv    clip         src=g60.wav muted=false ready=true delayMs=0
 120596 tv    speak        text=g60.wav voice=clip delayMs=0
 120690 tv    hush
 120690 tv    clip         src=n38.wav muted=false ready=true delayMs=0
 120690 tv    speak        text=n38.wav voice=clip delayMs=0
 120786 tv    hush
 120786 tv    clip         src=n39.wav muted=false ready=true delayMs=0
 120786 tv    speak        text=n39.wav voice=clip delayMs=0
 120881 tv    hush
 120881 tv    clip         src=o70.wav muted=false ready=true delayMs=0
 120881 tv    speak        text=o70.wav voice=clip delayMs=0
 120972 tv    hush
 120972 tv    clip         src=b11.wav muted=false ready=true delayMs=0
 120972 tv    speak        text=b11.wav voice=clip delayMs=0
 121071 tv    hush
 121071 tv    clip         src=o75.wav muted=false ready=true delayMs=0
 121071 tv    speak        text=o75.wav voice=clip delayMs=0
 121162 tv    hush
 121162 tv    clip         src=g58.wav muted=false ready=true delayMs=0
 121162 tv    speak        text=g58.wav voice=clip delayMs=0
 121257 tv    hush
 121257 tv    clip         src=b15.wav muted=false ready=true delayMs=0
 121257 tv    speak        text=b15.wav voice=clip delayMs=0
 121335 tv    hush
 121335 tv    clip         src=i24.wav muted=false ready=true delayMs=0
 121335 tv    speak        text=i24.wav voice=clip delayMs=0
 121429 tv    hush
 121429 tv    clip         src=o72.wav muted=false ready=true delayMs=0
 121429 tv    speak        text=o72.wav voice=clip delayMs=0
 121525 tv    hush
 121525 tv    clip         src=g56.wav muted=false ready=true delayMs=0
 121525 tv    speak        text=g56.wav voice=clip delayMs=0
 121619 tv    hush
 121619 tv    clip         src=i20.wav muted=false ready=true delayMs=0
 121619 tv    speak        text=i20.wav voice=clip delayMs=0
 121713 tv    hush
 121713 tv    clip         src=n44.wav muted=false ready=true delayMs=0
 121713 tv    speak        text=n44.wav voice=clip delayMs=0
 121807 tv    hush
 121807 tv    clip         src=b3.wav muted=false ready=true delayMs=0
 121807 tv    speak        text=b3.wav voice=clip delayMs=0
 121903 tv    hush
 121903 tv    clip         src=o68.wav muted=false ready=true delayMs=0
 121903 tv    speak        text=o68.wav voice=clip delayMs=0
 121996 tv    hush
 121996 tv    clip         src=b2.wav muted=false ready=true delayMs=0
 121996 tv    speak        text=b2.wav voice=clip delayMs=0
 122090 tv    hush
 122090 tv    clip         src=n41.wav muted=false ready=true delayMs=0
 122090 tv    speak        text=n41.wav voice=clip delayMs=0
 122185 tv    hush
 122185 tv    clip         src=o65.wav muted=false ready=true delayMs=0
 122185 tv    speak        text=o65.wav voice=clip delayMs=0
 122280 tv    hush
 122280 tv    clip         src=i17.wav muted=false ready=true delayMs=0
 122280 tv    speak        text=i17.wav voice=clip delayMs=0
 122373 tv    hush
 122373 tv    clip         src=i25.wav muted=false ready=true delayMs=0
 122373 tv    speak        text=i25.wav voice=clip delayMs=0
 122468 tv    hush
 122468 tv    clip         src=i19.wav muted=false ready=true delayMs=0
 122468 tv    speak        text=i19.wav voice=clip delayMs=0
 122548 tv    hush
 122548 tv    clip         src=g57.wav muted=false ready=true delayMs=0
 122549 tv    speak        text=g57.wav voice=clip delayMs=0
 122642 tv    hush
 122642 tv    clip         src=g59.wav muted=false ready=true delayMs=0
 122642 tv    speak        text=g59.wav voice=clip delayMs=0
 122834 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 123879 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 124142 tv    hush
 124142 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 124142 tv    hush
 131746 tv    music:duck   ms=9000
 131746 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 136770 tv    hush
 136770 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 136771 tv    hush
 138325 tv    ss:cancel    speaking=false pending=false
 138325 tv    music:plan   from=game:bingo to=null
 138328 tv    ss:cancel    speaking=false pending=false
 138328 tv    music:plan   from=null to=lobby
 138328 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 139129 tv    music:stop   track=cool-vibes.mp3
 140838 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 140846 tv    ss:cancel    speaking=false pending=false
 140848 tv    music:plan   from=lobby to=game:bingo
 140848 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 140848 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 140851 tv    hush
 140852 tv    hush
 141503 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 141648 tv    music:stop   track=george-street-shuffle.mp3
 142064 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
 142994 tv    ss:cancel    speaking=false pending=false
 142994 tv    music:plan   from=game:bingo to=null
 142994 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 144494 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 145140 tv    ss:cancel    speaking=false pending=false
 145140 tv    music:plan   from=null to=lobby
 145140 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 148498 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 148507 tv    ss:cancel    speaking=false pending=false
 148509 tv    music:plan   from=lobby to=game:bingo
 148509 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 148509 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 148513 tv    hush
 148514 tv    hush
 148925 tv    cue          cue=lock surface=tv muted=false ready=true semitones=8
 148928 tv    hush
 148928 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 148928 tv    speak        text=i21.wav voice=clip delayMs=0
 148928 tv    hush
 149119 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 149309 tv    music:stop   track=airport-lounge.mp3
 149424 tv    ss:cancel    speaking=false pending=false
 149424 tv    music:plan   from=game:bingo to=null
 149427 tv    ss:cancel    speaking=false pending=false
 149427 tv    music:plan   from=null to=lobby
 149427 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 150228 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":10.2}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 155015 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 155444 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 155861 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156294 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156710 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157810 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 158415 tv    ss:cancel    speaking=false pending=false
 158417 tv    music:plan   from=lobby to=null
 158417 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 159679 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 159918 tv    music:stop   track=george-street-shuffle.mp3
 161262 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 162530 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 163814 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 164856 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 165898 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 168478 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 168664 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 168852 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 169043 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 170156 tv    ss:cancel    speaking=false pending=false
 170159 tv    ss:cancel    speaking=false pending=false
 170159 tv    music:plan   from=null to=lobby
 170159 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 172168 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 172176 tv    ss:cancel    speaking=false pending=false
 172178 tv    music:plan   from=lobby to=null
 172178 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 173679 tv    music:stop   track=bossa-antigua.mp3
 173722 tv    music:plan   from=null to=game:broken-pencil
 173722 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 173722 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 175213 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 175684 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 175842 tv    music:plan   from=game:broken-pencil to=null
 175842 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 177342 tv    music:stop   track=hep-cats.mp3
```
