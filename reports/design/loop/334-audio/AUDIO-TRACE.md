# Audio interaction trace

Captured 2026-09-18T21:37:44.947Z on port 42166. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**58 / 58 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:bossa-antigua
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":4.4}]

```
   1780 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   1811 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3117 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3253 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3955 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4599 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5453 tv    ss:cancel    speaking=false pending=false
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
   6302 tv    music:plan   from=lobby to=null
   6302 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7805 tv    music:stop   track=bossa-antigua.mp3
   8250 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9520 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16509 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17506 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18504 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19501 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20508 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21298 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22080 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22237 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22390 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22552 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22707 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22875 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23018 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23175 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23333 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23488 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23644 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23798 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23953 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24110 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24269 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24424 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24578 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24734 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24890 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25769 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26097 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27909 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29633 tv    ss:cancel    speaking=false pending=false
  29633 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":1.5}]

```
  31197 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33330 tv    ss:cancel    speaking=false pending=false
  33330 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34880 tv    ss:cancel    speaking=false pending=false
  34880 tv    music:plan   from=null to=lobby
  34880 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:george-street-shuffle.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+953ms phone@+967ms
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
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5355ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.3}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the winner's celebration buzz (320 ms) runs whole — nothing shorter cuts it** — celebration@73494 cut by=[]
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5402ms cheer@+5368ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36443 tv    music:plan   from=lobby to=game:bingo
  36443 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36443 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36746 tv    hush
  36746 tv    hush
  37244 tv    music:stop   track=george-street-shuffle.mp3
  37357 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38447 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39448 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40447 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41452 tv    hush
  41452 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  41452 tv    speak        text=b9.wav voice=clip delayMs=190
  41455 tv    hush
  41646 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43090 tv    hush
  43090 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  43090 tv    speak        text=b8.wav voice=clip delayMs=190
  43280 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44912 tv    hush
  44912 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  44912 tv    speak        text=n34.wav voice=clip delayMs=190
  45103 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46783 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47050 tv    hush
  47050 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47050 tv    hush
  52403 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55407 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56409 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57410 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58415 tv    hush
  58415 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  58415 tv    speak        text=n35.wav voice=clip delayMs=190
  58606 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60199 tv    music:paused paused=true
  60199 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61450 tv    music:paused paused=false
  61450 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62744 tv    hush
  62744 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  62744 tv    speak        text=i25.wav voice=clip delayMs=190
  62870 tv    hush
  62870 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  62870 tv    speak        text=n45.wav voice=clip delayMs=190
  62996 tv    hush
  62996 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  62996 tv    speak        text=n33.wav voice=clip delayMs=190
  63119 tv    hush
  63119 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  63119 tv    speak        text=g49.wav voice=clip delayMs=190
  63214 tv    hush
  63214 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  63214 tv    speak        text=b4.wav voice=clip delayMs=190
  63344 tv    hush
  63344 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  63344 tv    speak        text=i20.wav voice=clip delayMs=190
  63462 tv    hush
  63462 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  63462 tv    speak        text=o69.wav voice=clip delayMs=190
  63589 tv    hush
  63589 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  63589 tv    speak        text=o67.wav voice=clip delayMs=190
  63713 tv    hush
  63713 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  63713 tv    speak        text=o65.wav voice=clip delayMs=190
  63838 tv    hush
  63838 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  63838 tv    speak        text=o73.wav voice=clip delayMs=190
  63963 tv    hush
  63963 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  63964 tv    speak        text=i21.wav voice=clip delayMs=190
  64094 tv    hush
  64094 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  64094 tv    speak        text=i18.wav voice=clip delayMs=190
  64205 tv    hush
  64205 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  64205 tv    speak        text=g58.wav voice=clip delayMs=190
  64326 tv    hush
  64326 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  64326 tv    speak        text=n36.wav voice=clip delayMs=190
  64460 tv    hush
  64460 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  64460 tv    speak        text=o61.wav voice=clip delayMs=190
  64583 tv    hush
  64583 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  64583 tv    speak        text=n37.wav voice=clip delayMs=190
  64705 tv    hush
  64705 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  64705 tv    speak        text=i16.wav voice=clip delayMs=190
  64834 tv    hush
  64834 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  64834 tv    speak        text=g47.wav voice=clip delayMs=190
  64951 tv    hush
  64951 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  64951 tv    speak        text=n41.wav voice=clip delayMs=190
  65081 tv    hush
  65081 tv    clip         src=b6.wav muted=false ready=true delayMs=190
  65081 tv    speak        text=b6.wav voice=clip delayMs=190
  65200 tv    hush
  65200 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  65200 tv    speak        text=o72.wav voice=clip delayMs=190
  65329 tv    hush
  65329 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  65329 tv    speak        text=b3.wav voice=clip delayMs=190
  65458 tv    hush
  65458 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  65458 tv    speak        text=i30.wav voice=clip delayMs=190
  65580 tv    hush
  65580 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  65580 tv    speak        text=g56.wav voice=clip delayMs=190
  65687 tv    hush
  65687 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  65687 tv    speak        text=o75.wav voice=clip delayMs=190
  65812 tv    hush
  65812 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  65812 tv    speak        text=b1.wav voice=clip delayMs=190
  65936 tv    hush
  65936 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  65936 tv    speak        text=b2.wav voice=clip delayMs=190
  66062 tv    hush
  66062 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  66062 tv    speak        text=n32.wav voice=clip delayMs=190
  66185 tv    hush
  66185 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  66185 tv    speak        text=g48.wav voice=clip delayMs=190
  66315 tv    hush
  66315 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  66315 tv    speak        text=i23.wav voice=clip delayMs=190
  66435 tv    hush
  66435 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  66435 tv    speak        text=i26.wav voice=clip delayMs=190
  66563 tv    hush
  66563 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  66563 tv    speak        text=o66.wav voice=clip delayMs=190
  66689 tv    hush
  66689 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  66689 tv    speak        text=i19.wav voice=clip delayMs=190
  66810 tv    hush
  66810 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  66810 tv    speak        text=n42.wav voice=clip delayMs=190
  66937 tv    hush
  66937 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  66937 tv    speak        text=i24.wav voice=clip delayMs=190
  67060 tv    hush
  67060 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  67060 tv    speak        text=n39.wav voice=clip delayMs=190
  67184 tv    hush
  67184 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  67184 tv    speak        text=g46.wav voice=clip delayMs=190
  67314 tv    hush
  67314 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  67314 tv    speak        text=n44.wav voice=clip delayMs=190
  67436 tv    hush
  67436 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  67436 tv    speak        text=b15.wav voice=clip delayMs=190
  67560 tv    hush
  67560 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  67560 tv    speak        text=b11.wav voice=clip delayMs=190
  67684 tv    hush
  67684 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  67684 tv    speak        text=g57.wav voice=clip delayMs=190
  67876 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  68315 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68597 tv    hush
  68597 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68597 tv    hush
  70470 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73952 tv    music:duck   ms=9000
  73952 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  78739 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79071 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80072 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81073 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82070 tv    hush
  82070 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  82070 tv    speak        text=g57.wav voice=clip delayMs=190
  82260 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84376 tv    ss:cancel    speaking=false pending=false
  84376 tv    music:plan   from=game:bingo to=null
  84379 tv    ss:cancel    speaking=false pending=false
  84379 tv    music:plan   from=null to=lobby
  84379 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  85180 tv    music:stop   track=wallpaper.mp3
  86885 tv    ss:cancel    speaking=false pending=false
  86894 tv    music:plan   from=lobby to=game:bingo
  86894 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  86894 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86897 tv    hush
  86898 tv    hush
  87507 tv    hush
  87507 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  87507 tv    speak        text=i21.wav voice=clip delayMs=190
  87507 tv    hush
  87514 tv    hush
  87514 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  87514 tv    speak        text=n32.wav voice=clip delayMs=190
  87616 tv    hush
  87616 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  87616 tv    speak        text=i18.wav voice=clip delayMs=190
  87694 tv    music:stop   track=george-street-shuffle.mp3
  87700 tv    hush
  87700 tv    clip         src=n40.wav muted=false ready=true delayMs=190
  87700 tv    speak        text=n40.wav voice=clip delayMs=190
  87801 tv    hush
  87801 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  87801 tv    speak        text=i30.wav voice=clip delayMs=190
  87894 tv    hush
  87894 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  87894 tv    speak        text=o69.wav voice=clip delayMs=190
  88001 tv    hush
  88001 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  88001 tv    speak        text=o61.wav voice=clip delayMs=190
  88095 tv    hush
  88095 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  88095 tv    speak        text=n34.wav voice=clip delayMs=190
  88202 tv    hush
  88202 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  88202 tv    speak        text=n35.wav voice=clip delayMs=190
  88309 tv    hush
  88309 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  88309 tv    speak        text=o67.wav voice=clip delayMs=190
  88407 tv    hush
  88407 tv    clip         src=g55.wav muted=false ready=true delayMs=190
  88407 tv    speak        text=g55.wav voice=clip delayMs=190
  88505 tv    hush
  88505 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  88505 tv    speak        text=i26.wav voice=clip delayMs=190
  88598 tv    hush
  88598 tv    clip         src=i22.wav muted=false ready=true delayMs=190
  88598 tv    speak        text=i22.wav voice=clip delayMs=190
  88687 tv    hush
  88687 tv    clip         src=i29.wav muted=false ready=true delayMs=190
  88687 tv    speak        text=i29.wav voice=clip delayMs=190
  88781 tv    hush
  88781 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  88781 tv    speak        text=o66.wav voice=clip delayMs=190
  88877 tv    hush
  88877 tv    clip         src=g51.wav muted=false ready=true delayMs=190
  88877 tv    speak        text=g51.wav voice=clip delayMs=190
  88957 tv    hush
  88957 tv    clip         src=g53.wav muted=false ready=true delayMs=190
  88957 tv    speak        text=g53.wav voice=clip delayMs=190
  89048 tv    hush
  89048 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  89048 tv    speak        text=b9.wav voice=clip delayMs=190
  89159 tv    hush
  89159 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  89159 tv    speak        text=n36.wav voice=clip delayMs=190
  89251 tv    hush
  89251 tv    clip         src=g52.wav muted=false ready=true delayMs=190
  89251 tv    speak        text=g52.wav voice=clip delayMs=190
  89347 tv    hush
  89347 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  89347 tv    speak        text=b1.wav voice=clip delayMs=190
  89438 tv    hush
  89438 tv    clip         src=b13.wav muted=false ready=true delayMs=190
  89438 tv    speak        text=b13.wav voice=clip delayMs=190
  89536 tv    hush
  89536 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  89536 tv    speak        text=n37.wav voice=clip delayMs=190
  89628 tv    hush
  89628 tv    clip         src=o71.wav muted=false ready=true delayMs=190
  89628 tv    speak        text=o71.wav voice=clip delayMs=190
  89717 tv    hush
  89717 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  89717 tv    speak        text=b8.wav voice=clip delayMs=190
  89811 tv    hush
  89811 tv    clip         src=b5.wav muted=false ready=true delayMs=190
  89811 tv    speak        text=b5.wav voice=clip delayMs=190
  89904 tv    hush
  89904 tv    clip         src=b7.wav muted=false ready=true delayMs=190
  89904 tv    speak        text=b7.wav voice=clip delayMs=190
  89998 tv    hush
  89998 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  89998 tv    speak        text=n42.wav voice=clip delayMs=190
  90092 tv    hush
  90092 tv    clip         src=i28.wav muted=false ready=true delayMs=190
  90092 tv    speak        text=i28.wav voice=clip delayMs=190
  90185 tv    hush
  90185 tv    clip         src=i27.wav muted=false ready=true delayMs=190
  90185 tv    speak        text=i27.wav voice=clip delayMs=190
  90270 tv    hush
  90270 tv    clip         src=o63.wav muted=false ready=true delayMs=190
  90270 tv    speak        text=o63.wav voice=clip delayMs=190
  90356 tv    hush
  90356 tv    clip         src=o64.wav muted=false ready=true delayMs=190
  90356 tv    speak        text=o64.wav voice=clip delayMs=190
  90420 tv    hush
  90420 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  90420 tv    speak        text=o73.wav voice=clip delayMs=190
  90529 tv    hush
  90529 tv    clip         src=g50.wav muted=false ready=true delayMs=190
  90529 tv    speak        text=g50.wav voice=clip delayMs=190
  90622 tv    hush
  90622 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  90622 tv    speak        text=g48.wav voice=clip delayMs=190
  90701 tv    hush
  90701 tv    clip         src=b12.wav muted=false ready=true delayMs=190
  90701 tv    speak        text=b12.wav voice=clip delayMs=190
  90774 tv    hush
  90774 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  90774 tv    speak        text=n45.wav voice=clip delayMs=190
  90856 tv    hush
  90856 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  90856 tv    speak        text=b4.wav voice=clip delayMs=190
  90951 tv    hush
  90951 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  90951 tv    speak        text=g46.wav voice=clip delayMs=190
  91044 tv    hush
  91044 tv    clip         src=o74.wav muted=false ready=true delayMs=190
  91044 tv    speak        text=o74.wav voice=clip delayMs=190
  91139 tv    hush
  91139 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  91139 tv    speak        text=g47.wav voice=clip delayMs=190
  91236 tv    hush
  91236 tv    clip         src=n31.wav muted=false ready=true delayMs=190
  91236 tv    speak        text=n31.wav voice=clip delayMs=190
  91326 tv    hush
  91326 tv    clip         src=o62.wav muted=false ready=true delayMs=190
  91326 tv    speak        text=o62.wav voice=clip delayMs=190
  91421 tv    hush
  91421 tv    clip         src=b10.wav muted=false ready=true delayMs=190
  91421 tv    speak        text=b10.wav voice=clip delayMs=190
  91515 tv    hush
  91515 tv    clip         src=g60.wav muted=false ready=true delayMs=190
  91515 tv    speak        text=g60.wav voice=clip delayMs=190
  91611 tv    hush
  91611 tv    clip         src=n38.wav muted=false ready=true delayMs=190
  91611 tv    speak        text=n38.wav voice=clip delayMs=190
  91704 tv    hush
  91704 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  91704 tv    speak        text=n39.wav voice=clip delayMs=190
  91798 tv    hush
  91798 tv    clip         src=o70.wav muted=false ready=true delayMs=190
  91798 tv    speak        text=o70.wav voice=clip delayMs=190
  91888 tv    hush
  91888 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  91888 tv    speak        text=b11.wav voice=clip delayMs=190
  91981 tv    hush
  91981 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  91981 tv    speak        text=o75.wav voice=clip delayMs=190
  92073 tv    hush
  92073 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  92073 tv    speak        text=g58.wav voice=clip delayMs=190
  92153 tv    hush
  92153 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  92153 tv    speak        text=b15.wav voice=clip delayMs=190
  92239 tv    hush
  92239 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  92239 tv    speak        text=i24.wav voice=clip delayMs=190
  92340 tv    hush
  92340 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  92340 tv    speak        text=o72.wav voice=clip delayMs=190
  92433 tv    hush
  92433 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  92433 tv    speak        text=g56.wav voice=clip delayMs=190
  92510 tv    hush
  92510 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  92510 tv    speak        text=i20.wav voice=clip delayMs=190
  92589 tv    hush
  92589 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  92589 tv    speak        text=n44.wav voice=clip delayMs=190
  92700 tv    hush
  92700 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  92700 tv    speak        text=b3.wav voice=clip delayMs=190
  92792 tv    hush
  92792 tv    clip         src=o68.wav muted=false ready=true delayMs=190
  92792 tv    speak        text=o68.wav voice=clip delayMs=190
  92884 tv    hush
  92884 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  92884 tv    speak        text=b2.wav voice=clip delayMs=190
  92976 tv    hush
  92976 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  92976 tv    speak        text=n41.wav voice=clip delayMs=190
  93070 tv    hush
  93070 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  93070 tv    speak        text=o65.wav voice=clip delayMs=190
  93163 tv    hush
  93163 tv    clip         src=i17.wav muted=false ready=true delayMs=190
  93163 tv    speak        text=i17.wav voice=clip delayMs=190
  93257 tv    hush
  93257 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  93257 tv    speak        text=i25.wav voice=clip delayMs=190
  93352 tv    hush
  93352 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  93352 tv    speak        text=i19.wav voice=clip delayMs=190
  93444 tv    hush
  93444 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  93444 tv    speak        text=g57.wav voice=clip delayMs=190
  93537 tv    hush
  93537 tv    clip         src=g59.wav muted=false ready=true delayMs=190
  93537 tv    speak        text=g59.wav voice=clip delayMs=190
  93728 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  94764 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95037 tv    hush
  95037 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95037 tv    hush
 102645 tv    music:duck   ms=9000
 102645 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 107654 tv    hush
 107655 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 107655 tv    hush
 111653 tv    ss:cancel    speaking=false pending=false
 111653 tv    music:plan   from=game:bingo to=null
 111653 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113154 tv    music:stop   track=cool-vibes.mp3
 113275 tv    ss:cancel    speaking=false pending=false
 113275 tv    music:plan   from=null to=lobby
 113275 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 115792 tv    ss:cancel    speaking=false pending=false
 115797 tv    music:plan   from=lobby to=game:bingo
 115797 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 115797 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 115800 tv    hush
 115800 tv    hush
 116412 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 116417 tv    hush
 116417 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 116417 tv    speak        text=i21.wav voice=clip delayMs=190
 116417 tv    hush
 116422 tv    hush
 116422 tv    clip         src=n32.wav muted=false ready=true delayMs=190
 116422 tv    speak        text=n32.wav voice=clip delayMs=190
 116523 tv    hush
 116523 tv    clip         src=i18.wav muted=false ready=true delayMs=190
 116523 tv    speak        text=i18.wav voice=clip delayMs=190
 116599 tv    music:stop   track=george-street-shuffle.mp3
 116616 tv    hush
 116616 tv    clip         src=n40.wav muted=false ready=true delayMs=190
 116616 tv    speak        text=n40.wav voice=clip delayMs=190
 116709 tv    hush
 116709 tv    clip         src=i30.wav muted=false ready=true delayMs=190
 116709 tv    speak        text=i30.wav voice=clip delayMs=190
 116804 tv    hush
 116804 tv    clip         src=o69.wav muted=false ready=true delayMs=190
 116804 tv    speak        text=o69.wav voice=clip delayMs=190
 116897 tv    hush
 116897 tv    clip         src=o61.wav muted=false ready=true delayMs=190
 116897 tv    speak        text=o61.wav voice=clip delayMs=190
 116992 tv    hush
 116992 tv    clip         src=n34.wav muted=false ready=true delayMs=190
 116992 tv    speak        text=n34.wav voice=clip delayMs=190
 117086 tv    hush
 117086 tv    clip         src=n35.wav muted=false ready=true delayMs=190
 117086 tv    speak        text=n35.wav voice=clip delayMs=190
 117181 tv    hush
 117181 tv    clip         src=o67.wav muted=false ready=true delayMs=190
 117181 tv    speak        text=o67.wav voice=clip delayMs=190
 117288 tv    hush
 117288 tv    clip         src=g55.wav muted=false ready=true delayMs=190
 117288 tv    speak        text=g55.wav voice=clip delayMs=190
 117382 tv    hush
 117382 tv    clip         src=i26.wav muted=false ready=true delayMs=190
 117382 tv    speak        text=i26.wav voice=clip delayMs=190
 117474 tv    hush
 117474 tv    clip         src=i22.wav muted=false ready=true delayMs=190
 117474 tv    speak        text=i22.wav voice=clip delayMs=190
 117570 tv    hush
 117570 tv    clip         src=i29.wav muted=false ready=true delayMs=190
 117570 tv    speak        text=i29.wav voice=clip delayMs=190
 117663 tv    hush
 117663 tv    clip         src=o66.wav muted=false ready=true delayMs=190
 117663 tv    speak        text=o66.wav voice=clip delayMs=190
 117756 tv    hush
 117756 tv    clip         src=g51.wav muted=false ready=true delayMs=190
 117756 tv    speak        text=g51.wav voice=clip delayMs=190
 117851 tv    hush
 117851 tv    clip         src=g53.wav muted=false ready=true delayMs=190
 117851 tv    speak        text=g53.wav voice=clip delayMs=190
 117942 tv    hush
 117942 tv    clip         src=b9.wav muted=false ready=true delayMs=190
 117942 tv    speak        text=b9.wav voice=clip delayMs=190
 118036 tv    hush
 118036 tv    clip         src=n36.wav muted=false ready=true delayMs=190
 118036 tv    speak        text=n36.wav voice=clip delayMs=190
 118130 tv    hush
 118130 tv    clip         src=g52.wav muted=false ready=true delayMs=190
 118130 tv    speak        text=g52.wav voice=clip delayMs=190
 118224 tv    hush
 118224 tv    clip         src=b1.wav muted=false ready=true delayMs=190
 118224 tv    speak        text=b1.wav voice=clip delayMs=190
 118317 tv    hush
 118317 tv    clip         src=b13.wav muted=false ready=true delayMs=190
 118317 tv    speak        text=b13.wav voice=clip delayMs=190
 118408 tv    hush
 118408 tv    clip         src=n37.wav muted=false ready=true delayMs=190
 118408 tv    speak        text=n37.wav voice=clip delayMs=190
 118501 tv    hush
 118501 tv    clip         src=o71.wav muted=false ready=true delayMs=190
 118501 tv    speak        text=o71.wav voice=clip delayMs=190
 118595 tv    hush
 118595 tv    clip         src=b8.wav muted=false ready=true delayMs=190
 118595 tv    speak        text=b8.wav voice=clip delayMs=190
 118674 tv    hush
 118674 tv    clip         src=b5.wav muted=false ready=true delayMs=190
 118674 tv    speak        text=b5.wav voice=clip delayMs=190
 118768 tv    hush
 118768 tv    clip         src=b7.wav muted=false ready=true delayMs=190
 118768 tv    speak        text=b7.wav voice=clip delayMs=190
 118877 tv    hush
 118877 tv    clip         src=n42.wav muted=false ready=true delayMs=190
 118877 tv    speak        text=n42.wav voice=clip delayMs=190
 118968 tv    hush
 118968 tv    clip         src=i28.wav muted=false ready=true delayMs=190
 118968 tv    speak        text=i28.wav voice=clip delayMs=190
 119063 tv    hush
 119063 tv    clip         src=i27.wav muted=false ready=true delayMs=190
 119063 tv    speak        text=i27.wav voice=clip delayMs=190
 119156 tv    hush
 119156 tv    clip         src=o63.wav muted=false ready=true delayMs=190
 119156 tv    speak        text=o63.wav voice=clip delayMs=190
 119253 tv    hush
 119253 tv    clip         src=o64.wav muted=false ready=true delayMs=190
 119253 tv    speak        text=o64.wav voice=clip delayMs=190
 119346 tv    hush
 119346 tv    clip         src=o73.wav muted=false ready=true delayMs=190
 119346 tv    speak        text=o73.wav voice=clip delayMs=190
 119439 tv    hush
 119439 tv    clip         src=g50.wav muted=false ready=true delayMs=190
 119439 tv    speak        text=g50.wav voice=clip delayMs=190
 119523 tv    hush
 119523 tv    clip         src=g48.wav muted=false ready=true delayMs=190
 119523 tv    speak        text=g48.wav voice=clip delayMs=190
 119610 tv    hush
 119610 tv    clip         src=b12.wav muted=false ready=true delayMs=190
 119610 tv    speak        text=b12.wav voice=clip delayMs=190
 119722 tv    hush
 119722 tv    clip         src=n45.wav muted=false ready=true delayMs=190
 119722 tv    speak        text=n45.wav voice=clip delayMs=190
 119809 tv    hush
 119809 tv    clip         src=b4.wav muted=false ready=true delayMs=190
 119809 tv    speak        text=b4.wav voice=clip delayMs=190
 119904 tv    hush
 119904 tv    clip         src=g46.wav muted=false ready=true delayMs=190
 119904 tv    speak        text=g46.wav voice=clip delayMs=190
 119998 tv    hush
 119998 tv    clip         src=o74.wav muted=false ready=true delayMs=190
 119998 tv    speak        text=o74.wav voice=clip delayMs=190
 120088 tv    hush
 120088 tv    clip         src=g47.wav muted=false ready=true delayMs=190
 120088 tv    speak        text=g47.wav voice=clip delayMs=190
 120186 tv    hush
 120186 tv    clip         src=n31.wav muted=false ready=true delayMs=190
 120186 tv    speak        text=n31.wav voice=clip delayMs=190
 120260 tv    hush
 120260 tv    clip         src=o62.wav muted=false ready=true delayMs=190
 120260 tv    speak        text=o62.wav voice=clip delayMs=190
 120353 tv    hush
 120353 tv    clip         src=b10.wav muted=false ready=true delayMs=190
 120353 tv    speak        text=b10.wav voice=clip delayMs=190
 120448 tv    hush
 120448 tv    clip         src=g60.wav muted=false ready=true delayMs=190
 120448 tv    speak        text=g60.wav voice=clip delayMs=190
 120534 tv    hush
 120534 tv    clip         src=n38.wav muted=false ready=true delayMs=190
 120534 tv    speak        text=n38.wav voice=clip delayMs=190
 120605 tv    hush
 120605 tv    clip         src=n39.wav muted=false ready=true delayMs=190
 120605 tv    speak        text=n39.wav voice=clip delayMs=190
 120696 tv    hush
 120696 tv    clip         src=o70.wav muted=false ready=true delayMs=190
 120696 tv    speak        text=o70.wav voice=clip delayMs=190
 120789 tv    hush
 120789 tv    clip         src=b11.wav muted=false ready=true delayMs=190
 120789 tv    speak        text=b11.wav voice=clip delayMs=190
 120883 tv    hush
 120883 tv    clip         src=o75.wav muted=false ready=true delayMs=190
 120883 tv    speak        text=o75.wav voice=clip delayMs=190
 120978 tv    hush
 120978 tv    clip         src=g58.wav muted=false ready=true delayMs=190
 120978 tv    speak        text=g58.wav voice=clip delayMs=190
 121087 tv    hush
 121087 tv    clip         src=b15.wav muted=false ready=true delayMs=190
 121087 tv    speak        text=b15.wav voice=clip delayMs=190
 121181 tv    hush
 121181 tv    clip         src=i24.wav muted=false ready=true delayMs=190
 121181 tv    speak        text=i24.wav voice=clip delayMs=190
 121275 tv    hush
 121275 tv    clip         src=o72.wav muted=false ready=true delayMs=190
 121275 tv    speak        text=o72.wav voice=clip delayMs=190
 121367 tv    hush
 121367 tv    clip         src=g56.wav muted=false ready=true delayMs=190
 121367 tv    speak        text=g56.wav voice=clip delayMs=190
 121462 tv    hush
 121462 tv    clip         src=i20.wav muted=false ready=true delayMs=190
 121462 tv    speak        text=i20.wav voice=clip delayMs=190
 121556 tv    hush
 121556 tv    clip         src=n44.wav muted=false ready=true delayMs=190
 121556 tv    speak        text=n44.wav voice=clip delayMs=190
 121639 tv    hush
 121639 tv    clip         src=b3.wav muted=false ready=true delayMs=190
 121639 tv    speak        text=b3.wav voice=clip delayMs=190
 121729 tv    hush
 121729 tv    clip         src=o68.wav muted=false ready=true delayMs=190
 121729 tv    speak        text=o68.wav voice=clip delayMs=190
 121826 tv    hush
 121826 tv    clip         src=b2.wav muted=false ready=true delayMs=190
 121826 tv    speak        text=b2.wav voice=clip delayMs=190
 121917 tv    hush
 121917 tv    clip         src=n41.wav muted=false ready=true delayMs=190
 121917 tv    speak        text=n41.wav voice=clip delayMs=190
 122014 tv    hush
 122014 tv    clip         src=o65.wav muted=false ready=true delayMs=190
 122014 tv    speak        text=o65.wav voice=clip delayMs=190
 122102 tv    hush
 122102 tv    clip         src=i17.wav muted=false ready=true delayMs=190
 122102 tv    speak        text=i17.wav voice=clip delayMs=190
 122196 tv    hush
 122196 tv    clip         src=i25.wav muted=false ready=true delayMs=190
 122196 tv    speak        text=i25.wav voice=clip delayMs=190
 122288 tv    hush
 122288 tv    clip         src=i19.wav muted=false ready=true delayMs=190
 122288 tv    speak        text=i19.wav voice=clip delayMs=190
 122383 tv    hush
 122383 tv    clip         src=g57.wav muted=false ready=true delayMs=190
 122383 tv    speak        text=g57.wav voice=clip delayMs=190
 122477 tv    hush
 122477 tv    clip         src=g59.wav muted=false ready=true delayMs=190
 122477 tv    speak        text=g59.wav voice=clip delayMs=190
 122668 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 123694 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 123950 tv    hush
 123950 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 123950 tv    hush
 131552 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 131559 tv    music:duck   ms=9000
 131559 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 136569 tv    hush
 136569 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 136569 tv    hush
 138123 tv    ss:cancel    speaking=false pending=false
 138123 tv    music:plan   from=game:bingo to=null
 138126 tv    ss:cancel    speaking=false pending=false
 138126 tv    music:plan   from=null to=lobby
 138126 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 138927 tv    music:stop   track=cool-vibes.mp3
 140644 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 140652 tv    ss:cancel    speaking=false pending=false
 140654 tv    music:plan   from=lobby to=game:bingo
 140654 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 140654 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 140658 tv    hush
 140658 tv    hush
 141269 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 141454 tv    music:stop   track=airport-lounge.mp3
 142660 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 142776 tv    ss:cancel    speaking=false pending=false
 142776 tv    music:plan   from=game:bingo to=null
 142776 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 144276 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 144923 tv    ss:cancel    speaking=false pending=false
 144923 tv    music:plan   from=null to=lobby
 144923 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 148270 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 148281 tv    ss:cancel    speaking=false pending=false
 148283 tv    music:plan   from=lobby to=game:bingo
 148283 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 148283 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 148286 tv    hush
 148287 tv    hush
 148713 tv    hush
 148713 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 148713 tv    speak        text=i21.wav voice=clip delayMs=190
 148713 tv    hush
 148903 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 149083 tv    music:stop   track=local-forecast-elevator.mp3
 149208 tv    ss:cancel    speaking=false pending=false
 149208 tv    music:plan   from=game:bingo to=null
 149211 tv    ss:cancel    speaking=false pending=false
 149211 tv    music:plan   from=null to=lobby
 149211 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 150019 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 154793 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 155226 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 155643 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156076 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156510 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157576 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 158181 tv    ss:cancel    speaking=false pending=false
 158185 tv    music:plan   from=lobby to=null
 158185 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 159441 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 159687 tv    music:stop   track=bossa-antigua.mp3
 161043 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 162330 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 163647 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 164658 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 165722 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 168297 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 168483 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 168672 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 168860 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 169972 tv    ss:cancel    speaking=false pending=false
 169975 tv    ss:cancel    speaking=false pending=false
 169975 tv    music:plan   from=null to=lobby
 169975 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 172004 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 172012 tv    ss:cancel    speaking=false pending=false
 172013 tv    music:plan   from=lobby to=null
 172014 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 173514 tv    music:stop   track=george-street-shuffle.mp3
 173556 tv    music:plan   from=null to=game:broken-pencil
 173556 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 173556 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 175042 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 175511 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 175651 tv    music:plan   from=game:broken-pencil to=null
 175651 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 177152 tv    music:stop   track=backbay-lounge.mp3
```
