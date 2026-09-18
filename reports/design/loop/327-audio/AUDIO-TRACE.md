# Audio interaction trace

Captured 2026-09-18T19:30:11.241Z on port 42166. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**56 / 56 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:george-street-shuffle
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":4.4}]

```
   1764 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   1793 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3102 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3238 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3935 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4571 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5409 tv    ss:cancel    speaking=false pending=false
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
   6254 tv    music:plan   from=lobby to=null
   6254 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7756 tv    music:stop   track=george-street-shuffle.mp3
   8215 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9493 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16471 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17470 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18470 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19475 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20476 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21273 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22065 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22225 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22361 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22518 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22671 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22828 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22982 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23139 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23296 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23452 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23609 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23768 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23921 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24063 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24218 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24372 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24528 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24684 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24843 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25721 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26043 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27846 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29575 tv    ss:cancel    speaking=false pending=false
  29575 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31117 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33284 tv    ss:cancel    speaking=false pending=false
  33284 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34834 tv    ss:cancel    speaking=false pending=false
  34834 tv    music:plan   from=null to=lobby
  34834 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+956ms phone@+968ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5354ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.3}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5401ms cheer@+5366ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36396 tv    music:plan   from=lobby to=game:bingo
  36396 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36396 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36701 tv    hush
  36701 tv    hush
  37198 tv    music:stop   track=bossa-antigua.mp3
  37313 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38403 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39402 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40403 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41408 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  41408 tv    speak        text=b9.wav voice=clip delayMs=190
  41409 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41600 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43050 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  43050 tv    speak        text=b8.wav voice=clip delayMs=190
  43240 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44875 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  44875 tv    speak        text=n34.wav voice=clip delayMs=190
  45067 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46751 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47018 tv    hush
  47018 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47018 tv    hush
  52371 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55377 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56378 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57378 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58377 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  58377 tv    speak        text=n35.wav voice=clip delayMs=190
  58569 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60152 tv    music:paused paused=true
  60152 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61402 tv    music:paused paused=false
  61402 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62673 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  62673 tv    speak        text=i25.wav voice=clip delayMs=190
  62794 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  62794 tv    speak        text=n45.wav voice=clip delayMs=190
  62931 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  62931 tv    speak        text=n33.wav voice=clip delayMs=190
  63047 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  63047 tv    speak        text=g49.wav voice=clip delayMs=190
  63170 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  63170 tv    speak        text=b4.wav voice=clip delayMs=190
  63293 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  63293 tv    speak        text=i20.wav voice=clip delayMs=190
  63405 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  63405 tv    speak        text=o69.wav voice=clip delayMs=190
  63532 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  63532 tv    speak        text=o67.wav voice=clip delayMs=190
  63656 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  63656 tv    speak        text=o65.wav voice=clip delayMs=190
  63782 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  63782 tv    speak        text=o73.wav voice=clip delayMs=190
  63905 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  63905 tv    speak        text=i21.wav voice=clip delayMs=190
  64030 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  64030 tv    speak        text=i18.wav voice=clip delayMs=190
  64158 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  64158 tv    speak        text=g58.wav voice=clip delayMs=190
  64279 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  64279 tv    speak        text=n36.wav voice=clip delayMs=190
  64391 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  64391 tv    speak        text=o61.wav voice=clip delayMs=190
  64517 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  64517 tv    speak        text=n37.wav voice=clip delayMs=190
  64629 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  64629 tv    speak        text=i16.wav voice=clip delayMs=190
  64757 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  64757 tv    speak        text=g47.wav voice=clip delayMs=190
  64883 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  64883 tv    speak        text=n41.wav voice=clip delayMs=190
  65006 tv    clip         src=b6.wav muted=false ready=true delayMs=190
  65006 tv    speak        text=b6.wav voice=clip delayMs=190
  65126 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  65126 tv    speak        text=o72.wav voice=clip delayMs=190
  65238 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  65238 tv    speak        text=b3.wav voice=clip delayMs=190
  65349 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  65349 tv    speak        text=i30.wav voice=clip delayMs=190
  65473 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  65473 tv    speak        text=g56.wav voice=clip delayMs=190
  65597 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  65597 tv    speak        text=o75.wav voice=clip delayMs=190
  65708 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  65708 tv    speak        text=b1.wav voice=clip delayMs=190
  65819 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  65819 tv    speak        text=b2.wav voice=clip delayMs=190
  65942 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  65942 tv    speak        text=n32.wav voice=clip delayMs=190
  66069 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  66069 tv    speak        text=g48.wav voice=clip delayMs=190
  66193 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  66193 tv    speak        text=i23.wav voice=clip delayMs=190
  66326 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  66326 tv    speak        text=i26.wav voice=clip delayMs=190
  66445 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  66445 tv    speak        text=o66.wav voice=clip delayMs=190
  66570 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  66570 tv    speak        text=i19.wav voice=clip delayMs=190
  66693 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  66693 tv    speak        text=n42.wav voice=clip delayMs=190
  66821 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  66821 tv    speak        text=i24.wav voice=clip delayMs=190
  66949 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  66949 tv    speak        text=n39.wav voice=clip delayMs=190
  67071 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  67071 tv    speak        text=g46.wav voice=clip delayMs=190
  67197 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  67197 tv    speak        text=n44.wav voice=clip delayMs=190
  67290 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  67290 tv    speak        text=b15.wav voice=clip delayMs=190
  67419 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  67419 tv    speak        text=b11.wav voice=clip delayMs=190
  67539 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  67539 tv    speak        text=g57.wav voice=clip delayMs=190
  67731 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  68167 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68450 tv    hush
  68450 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68450 tv    hush
  70324 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73804 tv    music:duck   ms=9000
  73804 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  78623 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  78946 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  79948 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80947 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81951 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  81951 tv    speak        text=g57.wav voice=clip delayMs=190
  82141 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84245 tv    ss:cancel    speaking=false pending=false
  84245 tv    music:plan   from=game:bingo to=null
  84247 tv    ss:cancel    speaking=false pending=false
  84247 tv    music:plan   from=null to=lobby
  84247 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  85052 tv    music:stop   track=wallpaper.mp3
  86771 tv    ss:cancel    speaking=false pending=false
  86780 tv    music:plan   from=lobby to=game:bingo
  86780 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86781 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86784 tv    hush
  86784 tv    hush
  87394 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  87399 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  87399 tv    speak        text=i21.wav voice=clip delayMs=190
  87414 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  87414 tv    speak        text=n32.wav voice=clip delayMs=190
  87511 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  87511 tv    speak        text=i18.wav voice=clip delayMs=190
  87582 tv    music:stop   track=george-street-shuffle.mp3
  87589 tv    clip         src=n40.wav muted=false ready=true delayMs=190
  87589 tv    speak        text=n40.wav voice=clip delayMs=190
  87698 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  87698 tv    speak        text=i30.wav voice=clip delayMs=190
  87792 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  87792 tv    speak        text=o69.wav voice=clip delayMs=190
  87900 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  87900 tv    speak        text=o61.wav voice=clip delayMs=190
  87995 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  87995 tv    speak        text=n34.wav voice=clip delayMs=190
  88089 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  88089 tv    speak        text=n35.wav voice=clip delayMs=190
  88183 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  88183 tv    speak        text=o67.wav voice=clip delayMs=190
  88296 tv    clip         src=g55.wav muted=false ready=true delayMs=190
  88296 tv    speak        text=g55.wav voice=clip delayMs=190
  88388 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  88388 tv    speak        text=i26.wav voice=clip delayMs=190
  88481 tv    clip         src=i22.wav muted=false ready=true delayMs=190
  88481 tv    speak        text=i22.wav voice=clip delayMs=190
  88575 tv    clip         src=i29.wav muted=false ready=true delayMs=190
  88575 tv    speak        text=i29.wav voice=clip delayMs=190
  88671 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  88671 tv    speak        text=o66.wav voice=clip delayMs=190
  88764 tv    clip         src=g51.wav muted=false ready=true delayMs=190
  88764 tv    speak        text=g51.wav voice=clip delayMs=190
  88858 tv    clip         src=g53.wav muted=false ready=true delayMs=190
  88858 tv    speak        text=g53.wav voice=clip delayMs=190
  88952 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  88952 tv    speak        text=b9.wav voice=clip delayMs=190
  89046 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  89046 tv    speak        text=n36.wav voice=clip delayMs=190
  89143 tv    clip         src=g52.wav muted=false ready=true delayMs=190
  89143 tv    speak        text=g52.wav voice=clip delayMs=190
  89233 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  89233 tv    speak        text=b1.wav voice=clip delayMs=190
  89315 tv    clip         src=b13.wav muted=false ready=true delayMs=190
  89315 tv    speak        text=b13.wav voice=clip delayMs=190
  89407 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  89407 tv    speak        text=n37.wav voice=clip delayMs=190
  89502 tv    clip         src=o71.wav muted=false ready=true delayMs=190
  89502 tv    speak        text=o71.wav voice=clip delayMs=190
  89599 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  89599 tv    speak        text=b8.wav voice=clip delayMs=190
  89694 tv    clip         src=b5.wav muted=false ready=true delayMs=190
  89694 tv    speak        text=b5.wav voice=clip delayMs=190
  89790 tv    clip         src=b7.wav muted=false ready=true delayMs=190
  89790 tv    speak        text=b7.wav voice=clip delayMs=190
  89878 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  89878 tv    speak        text=n42.wav voice=clip delayMs=190
  89974 tv    clip         src=i28.wav muted=false ready=true delayMs=190
  89974 tv    speak        text=i28.wav voice=clip delayMs=190
  90084 tv    clip         src=i27.wav muted=false ready=true delayMs=190
  90084 tv    speak        text=i27.wav voice=clip delayMs=190
  90179 tv    clip         src=o63.wav muted=false ready=true delayMs=190
  90179 tv    speak        text=o63.wav voice=clip delayMs=190
  90274 tv    clip         src=o64.wav muted=false ready=true delayMs=190
  90274 tv    speak        text=o64.wav voice=clip delayMs=190
  90367 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  90367 tv    speak        text=o73.wav voice=clip delayMs=190
  90458 tv    clip         src=g50.wav muted=false ready=true delayMs=190
  90458 tv    speak        text=g50.wav voice=clip delayMs=190
  90553 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  90553 tv    speak        text=g48.wav voice=clip delayMs=190
  90645 tv    clip         src=b12.wav muted=false ready=true delayMs=190
  90645 tv    speak        text=b12.wav voice=clip delayMs=190
  90738 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  90738 tv    speak        text=n45.wav voice=clip delayMs=190
  90847 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  90847 tv    speak        text=b4.wav voice=clip delayMs=190
  90940 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  90940 tv    speak        text=g46.wav voice=clip delayMs=190
  91034 tv    clip         src=o74.wav muted=false ready=true delayMs=190
  91034 tv    speak        text=o74.wav voice=clip delayMs=190
  91131 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  91131 tv    speak        text=g47.wav voice=clip delayMs=190
  91225 tv    clip         src=n31.wav muted=false ready=true delayMs=190
  91225 tv    speak        text=n31.wav voice=clip delayMs=190
  91319 tv    clip         src=o62.wav muted=false ready=true delayMs=190
  91319 tv    speak        text=o62.wav voice=clip delayMs=190
  91413 tv    clip         src=b10.wav muted=false ready=true delayMs=190
  91413 tv    speak        text=b10.wav voice=clip delayMs=190
  91508 tv    clip         src=g60.wav muted=false ready=true delayMs=190
  91508 tv    speak        text=g60.wav voice=clip delayMs=190
  91601 tv    clip         src=n38.wav muted=false ready=true delayMs=190
  91601 tv    speak        text=n38.wav voice=clip delayMs=190
  91696 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  91696 tv    speak        text=n39.wav voice=clip delayMs=190
  91789 tv    clip         src=o70.wav muted=false ready=true delayMs=190
  91789 tv    speak        text=o70.wav voice=clip delayMs=190
  91885 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  91885 tv    speak        text=b11.wav voice=clip delayMs=190
  91979 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  91979 tv    speak        text=o75.wav voice=clip delayMs=190
  92073 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  92073 tv    speak        text=g58.wav voice=clip delayMs=190
  92167 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  92167 tv    speak        text=b15.wav voice=clip delayMs=190
  92263 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  92263 tv    speak        text=i24.wav voice=clip delayMs=190
  92356 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  92356 tv    speak        text=o72.wav voice=clip delayMs=190
  92450 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  92450 tv    speak        text=g56.wav voice=clip delayMs=190
  92545 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  92545 tv    speak        text=i20.wav voice=clip delayMs=190
  92639 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  92639 tv    speak        text=n44.wav voice=clip delayMs=190
  92732 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  92733 tv    speak        text=b3.wav voice=clip delayMs=190
  92827 tv    clip         src=o68.wav muted=false ready=true delayMs=190
  92827 tv    speak        text=o68.wav voice=clip delayMs=190
  92922 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  92922 tv    speak        text=b2.wav voice=clip delayMs=190
  93017 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  93017 tv    speak        text=n41.wav voice=clip delayMs=190
  93110 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  93110 tv    speak        text=o65.wav voice=clip delayMs=190
  93204 tv    clip         src=i17.wav muted=false ready=true delayMs=190
  93204 tv    speak        text=i17.wav voice=clip delayMs=190
  93299 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  93299 tv    speak        text=i25.wav voice=clip delayMs=190
  93391 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  93391 tv    speak        text=i19.wav voice=clip delayMs=190
  93485 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  93485 tv    speak        text=g57.wav voice=clip delayMs=190
  93578 tv    clip         src=g59.wav muted=false ready=true delayMs=190
  93578 tv    speak        text=g59.wav voice=clip delayMs=190
  93769 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  94816 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95074 tv    hush
  95074 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95075 tv    hush
 102685 tv    music:duck   ms=9000
 102685 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 107688 tv    hush
 107688 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 107688 tv    hush
 111688 tv    ss:cancel    speaking=false pending=false
 111688 tv    music:plan   from=game:bingo to=null
 111688 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113191 tv    music:stop   track=wallpaper.mp3
 113292 tv    ss:cancel    speaking=false pending=false
 113292 tv    music:plan   from=null to=lobby
 113292 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 115812 tv    ss:cancel    speaking=false pending=false
 115820 tv    music:plan   from=lobby to=game:bingo
 115820 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 115821 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 115824 tv    hush
 115824 tv    hush
 116437 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 116443 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 116443 tv    speak        text=i21.wav voice=clip delayMs=190
 116472 tv    clip         src=n32.wav muted=false ready=true delayMs=190
 116472 tv    speak        text=n32.wav voice=clip delayMs=190
 116569 tv    clip         src=i18.wav muted=false ready=true delayMs=190
 116569 tv    speak        text=i18.wav voice=clip delayMs=190
 116621 tv    music:stop   track=local-forecast-elevator.mp3
 116645 tv    clip         src=n40.wav muted=false ready=true delayMs=190
 116645 tv    speak        text=n40.wav voice=clip delayMs=190
 116740 tv    clip         src=i30.wav muted=false ready=true delayMs=190
 116740 tv    speak        text=i30.wav voice=clip delayMs=190
 116838 tv    clip         src=o69.wav muted=false ready=true delayMs=190
 116838 tv    speak        text=o69.wav voice=clip delayMs=190
 116928 tv    clip         src=o61.wav muted=false ready=true delayMs=190
 116928 tv    speak        text=o61.wav voice=clip delayMs=190
 117029 tv    clip         src=n34.wav muted=false ready=true delayMs=190
 117029 tv    speak        text=n34.wav voice=clip delayMs=190
 117117 tv    clip         src=n35.wav muted=false ready=true delayMs=190
 117117 tv    speak        text=n35.wav voice=clip delayMs=190
 117209 tv    clip         src=o67.wav muted=false ready=true delayMs=190
 117209 tv    speak        text=o67.wav voice=clip delayMs=190
 117325 tv    clip         src=g55.wav muted=false ready=true delayMs=190
 117325 tv    speak        text=g55.wav voice=clip delayMs=190
 117413 tv    clip         src=i26.wav muted=false ready=true delayMs=190
 117413 tv    speak        text=i26.wav voice=clip delayMs=190
 117510 tv    clip         src=i22.wav muted=false ready=true delayMs=190
 117510 tv    speak        text=i22.wav voice=clip delayMs=190
 117605 tv    clip         src=i29.wav muted=false ready=true delayMs=190
 117605 tv    speak        text=i29.wav voice=clip delayMs=190
 117695 tv    clip         src=o66.wav muted=false ready=true delayMs=190
 117695 tv    speak        text=o66.wav voice=clip delayMs=190
 117809 tv    clip         src=g51.wav muted=false ready=true delayMs=190
 117809 tv    speak        text=g51.wav voice=clip delayMs=190
 117896 tv    clip         src=g53.wav muted=false ready=true delayMs=190
 117896 tv    speak        text=g53.wav voice=clip delayMs=190
 117993 tv    clip         src=b9.wav muted=false ready=true delayMs=190
 117993 tv    speak        text=b9.wav voice=clip delayMs=190
 118089 tv    clip         src=n36.wav muted=false ready=true delayMs=190
 118089 tv    speak        text=n36.wav voice=clip delayMs=190
 118180 tv    clip         src=g52.wav muted=false ready=true delayMs=190
 118180 tv    speak        text=g52.wav voice=clip delayMs=190
 118261 tv    clip         src=b1.wav muted=false ready=true delayMs=190
 118261 tv    speak        text=b1.wav voice=clip delayMs=190
 118339 tv    clip         src=b13.wav muted=false ready=true delayMs=190
 118339 tv    speak        text=b13.wav voice=clip delayMs=190
 118430 tv    clip         src=n37.wav muted=false ready=true delayMs=190
 118430 tv    speak        text=n37.wav voice=clip delayMs=190
 118529 tv    clip         src=o71.wav muted=false ready=true delayMs=190
 118529 tv    speak        text=o71.wav voice=clip delayMs=190
 118623 tv    clip         src=b8.wav muted=false ready=true delayMs=190
 118623 tv    speak        text=b8.wav voice=clip delayMs=190
 118717 tv    clip         src=b5.wav muted=false ready=true delayMs=190
 118717 tv    speak        text=b5.wav voice=clip delayMs=190
 118806 tv    clip         src=b7.wav muted=false ready=true delayMs=190
 118806 tv    speak        text=b7.wav voice=clip delayMs=190
 118885 tv    clip         src=n42.wav muted=false ready=true delayMs=190
 118885 tv    speak        text=n42.wav voice=clip delayMs=190
 118978 tv    clip         src=i28.wav muted=false ready=true delayMs=190
 118978 tv    speak        text=i28.wav voice=clip delayMs=190
 119071 tv    clip         src=i27.wav muted=false ready=true delayMs=190
 119071 tv    speak        text=i27.wav voice=clip delayMs=190
 119165 tv    clip         src=o63.wav muted=false ready=true delayMs=190
 119165 tv    speak        text=o63.wav voice=clip delayMs=190
 119261 tv    clip         src=o64.wav muted=false ready=true delayMs=190
 119261 tv    speak        text=o64.wav voice=clip delayMs=190
 119350 tv    clip         src=o73.wav muted=false ready=true delayMs=190
 119350 tv    speak        text=o73.wav voice=clip delayMs=190
 119465 tv    clip         src=g50.wav muted=false ready=true delayMs=190
 119465 tv    speak        text=g50.wav voice=clip delayMs=190
 119554 tv    clip         src=g48.wav muted=false ready=true delayMs=190
 119554 tv    speak        text=g48.wav voice=clip delayMs=190
 119651 tv    clip         src=b12.wav muted=false ready=true delayMs=190
 119651 tv    speak        text=b12.wav voice=clip delayMs=190
 119741 tv    clip         src=n45.wav muted=false ready=true delayMs=190
 119741 tv    speak        text=n45.wav voice=clip delayMs=190
 119839 tv    clip         src=b4.wav muted=false ready=true delayMs=190
 119839 tv    speak        text=b4.wav voice=clip delayMs=190
 119928 tv    clip         src=g46.wav muted=false ready=true delayMs=190
 119928 tv    speak        text=g46.wav voice=clip delayMs=190
 120036 tv    clip         src=o74.wav muted=false ready=true delayMs=190
 120036 tv    speak        text=o74.wav voice=clip delayMs=190
 120136 tv    clip         src=g47.wav muted=false ready=true delayMs=190
 120136 tv    speak        text=g47.wav voice=clip delayMs=190
 120223 tv    clip         src=n31.wav muted=false ready=true delayMs=190
 120223 tv    speak        text=n31.wav voice=clip delayMs=190
 120306 tv    clip         src=o62.wav muted=false ready=true delayMs=190
 120306 tv    speak        text=o62.wav voice=clip delayMs=190
 120400 tv    clip         src=b10.wav muted=false ready=true delayMs=190
 120400 tv    speak        text=b10.wav voice=clip delayMs=190
 120495 tv    clip         src=g60.wav muted=false ready=true delayMs=190
 120495 tv    speak        text=g60.wav voice=clip delayMs=190
 120590 tv    clip         src=n38.wav muted=false ready=true delayMs=190
 120590 tv    speak        text=n38.wav voice=clip delayMs=190
 120688 tv    clip         src=n39.wav muted=false ready=true delayMs=190
 120688 tv    speak        text=n39.wav voice=clip delayMs=190
 120773 tv    clip         src=o70.wav muted=false ready=true delayMs=190
 120773 tv    speak        text=o70.wav voice=clip delayMs=190
 120863 tv    clip         src=b11.wav muted=false ready=true delayMs=190
 120863 tv    speak        text=b11.wav voice=clip delayMs=190
 120952 tv    clip         src=o75.wav muted=false ready=true delayMs=190
 120952 tv    speak        text=o75.wav voice=clip delayMs=190
 121046 tv    clip         src=g58.wav muted=false ready=true delayMs=190
 121046 tv    speak        text=g58.wav voice=clip delayMs=190
 121157 tv    clip         src=b15.wav muted=false ready=true delayMs=190
 121157 tv    speak        text=b15.wav voice=clip delayMs=190
 121268 tv    clip         src=i24.wav muted=false ready=true delayMs=190
 121268 tv    speak        text=i24.wav voice=clip delayMs=190
 121348 tv    clip         src=o72.wav muted=false ready=true delayMs=190
 121348 tv    speak        text=o72.wav voice=clip delayMs=190
 121438 tv    clip         src=g56.wav muted=false ready=true delayMs=190
 121438 tv    speak        text=g56.wav voice=clip delayMs=190
 121536 tv    clip         src=i20.wav muted=false ready=true delayMs=190
 121536 tv    speak        text=i20.wav voice=clip delayMs=190
 121644 tv    clip         src=n44.wav muted=false ready=true delayMs=190
 121644 tv    speak        text=n44.wav voice=clip delayMs=190
 121739 tv    clip         src=b3.wav muted=false ready=true delayMs=190
 121739 tv    speak        text=b3.wav voice=clip delayMs=190
 121828 tv    clip         src=o68.wav muted=false ready=true delayMs=190
 121828 tv    speak        text=o68.wav voice=clip delayMs=190
 121923 tv    clip         src=b2.wav muted=false ready=true delayMs=190
 121923 tv    speak        text=b2.wav voice=clip delayMs=190
 122011 tv    clip         src=n41.wav muted=false ready=true delayMs=190
 122011 tv    speak        text=n41.wav voice=clip delayMs=190
 122124 tv    clip         src=o65.wav muted=false ready=true delayMs=190
 122124 tv    speak        text=o65.wav voice=clip delayMs=190
 122219 tv    clip         src=i17.wav muted=false ready=true delayMs=190
 122219 tv    speak        text=i17.wav voice=clip delayMs=190
 122316 tv    clip         src=i25.wav muted=false ready=true delayMs=190
 122316 tv    speak        text=i25.wav voice=clip delayMs=190
 122404 tv    clip         src=i19.wav muted=false ready=true delayMs=190
 122404 tv    speak        text=i19.wav voice=clip delayMs=190
 122499 tv    clip         src=g57.wav muted=false ready=true delayMs=190
 122499 tv    speak        text=g57.wav voice=clip delayMs=190
 122594 tv    clip         src=g59.wav muted=false ready=true delayMs=190
 122594 tv    speak        text=g59.wav voice=clip delayMs=190
 122784 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 123815 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 124091 tv    hush
 124091 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 124091 tv    hush
 131692 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 131697 tv    music:duck   ms=9000
 131697 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 136695 tv    hush
 136696 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 136696 tv    hush
 138259 tv    ss:cancel    speaking=false pending=false
 138259 tv    music:plan   from=game:bingo to=null
 138261 tv    ss:cancel    speaking=false pending=false
 138261 tv    music:plan   from=null to=lobby
 138261 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 139062 tv    music:stop   track=wallpaper.mp3
 140777 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 140785 tv    ss:cancel    speaking=false pending=false
 140787 tv    music:plan   from=lobby to=game:bingo
 140787 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 140787 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 140790 tv    hush
 140790 tv    hush
 141402 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 141588 tv    music:stop   track=george-street-shuffle.mp3
 142792 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 142928 tv    ss:cancel    speaking=false pending=false
 142928 tv    music:plan   from=game:bingo to=null
 142928 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 144428 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 145076 tv    ss:cancel    speaking=false pending=false
 145076 tv    music:plan   from=null to=lobby
 145076 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 148436 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 148448 tv    ss:cancel    speaking=false pending=false
 148450 tv    music:plan   from=lobby to=game:bingo
 148450 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 148451 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 148455 tv    hush
 148456 tv    hush
 148868 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 148868 tv    speak        text=i21.wav voice=clip delayMs=190
 148869 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 149059 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 149251 tv    music:stop   track=george-street-shuffle.mp3
 149375 tv    ss:cancel    speaking=false pending=false
 149375 tv    music:plan   from=game:bingo to=null
 149378 tv    ss:cancel    speaking=false pending=false
 149378 tv    music:plan   from=null to=lobby
 149378 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 150189 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"airport-lounge.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 154962 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 155395 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 155810 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156245 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156660 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157712 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 158304 tv    ss:cancel    speaking=false pending=false
 158309 tv    music:plan   from=lobby to=null
 158309 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 159572 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 159810 tv    music:stop   track=airport-lounge.mp3
 161180 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 162462 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 163746 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 164769 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 165807 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 168363 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 168553 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 168740 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 168932 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 170040 tv    ss:cancel    speaking=false pending=false
 170042 tv    ss:cancel    speaking=false pending=false
 170042 tv    music:plan   from=null to=lobby
 170042 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 172064 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 172081 tv    ss:cancel    speaking=false pending=false
 172082 tv    music:plan   from=lobby to=null
 172082 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 173584 tv    music:stop   track=george-street-shuffle.mp3
 173648 tv    music:plan   from=null to=game:broken-pencil
 173648 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 173648 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 175123 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 175577 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 175732 tv    music:plan   from=game:broken-pencil to=null
 175732 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 177233 tv    music:stop   track=backbay-lounge.mp3
```
