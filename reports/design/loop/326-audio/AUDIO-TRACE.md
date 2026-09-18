# Audio interaction trace

Captured 2026-09-18T19:03:07.443Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**56 / 56 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:bossa-antigua
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":4.4}]

```
   1752 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   1779 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3090 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3225 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3924 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4558 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5392 tv    ss:cancel    speaking=false pending=false
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
   6232 tv    music:plan   from=lobby to=null
   6232 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7732 tv    music:stop   track=bossa-antigua.mp3
   8174 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9466 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16432 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17431 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18431 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19427 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20433 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21238 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22044 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22202 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22358 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22518 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22672 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22831 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22988 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23146 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23306 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23465 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23622 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23781 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23940 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24099 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24255 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24412 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24568 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24727 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24883 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25768 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26100 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27907 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29632 tv    ss:cancel    speaking=false pending=false
  29632 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":1.5}]

```
  31169 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33338 tv    ss:cancel    speaking=false pending=false
  33338 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34887 tv    ss:cancel    speaking=false pending=false
  34887 tv    music:plan   from=null to=lobby
  34887 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:local-forecast-elevator.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+963ms phone@+977ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,silence,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,silence,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer,silence cheer@+5355ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5413ms cheer@+5368ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36468 tv    music:plan   from=lobby to=game:bingo
  36468 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36468 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36772 tv    hush
  36772 tv    hush
  37270 tv    music:stop   track=local-forecast-elevator.mp3
  37384 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38474 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39474 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40474 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41465 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  41465 tv    speak        text=b9.wav voice=clip delayMs=190
  41466 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41657 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43118 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  43118 tv    speak        text=b8.wav voice=clip delayMs=190
  43308 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44937 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  44937 tv    speak        text=n34.wav voice=clip delayMs=190
  45128 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46806 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47070 tv    hush
  47070 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47071 tv    hush
  52427 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  52429 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55433 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56438 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57434 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58438 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  58438 tv    speak        text=n35.wav voice=clip delayMs=190
  58628 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60256 tv    music:paused paused=true
  60256 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61507 tv    music:paused paused=false
  61507 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62802 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  62802 tv    speak        text=i25.wav voice=clip delayMs=190
  62927 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  62927 tv    speak        text=n45.wav voice=clip delayMs=190
  63054 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  63054 tv    speak        text=n33.wav voice=clip delayMs=190
  63179 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  63179 tv    speak        text=g49.wav voice=clip delayMs=190
  63302 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  63302 tv    speak        text=b4.wav voice=clip delayMs=190
  63427 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  63427 tv    speak        text=i20.wav voice=clip delayMs=190
  63555 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  63555 tv    speak        text=o69.wav voice=clip delayMs=190
  63676 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  63676 tv    speak        text=o67.wav voice=clip delayMs=190
  63802 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  63802 tv    speak        text=o65.wav voice=clip delayMs=190
  63933 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  63933 tv    speak        text=o73.wav voice=clip delayMs=190
  64054 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  64054 tv    speak        text=i21.wav voice=clip delayMs=190
  64183 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  64183 tv    speak        text=i18.wav voice=clip delayMs=190
  64309 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  64309 tv    speak        text=g58.wav voice=clip delayMs=190
  64440 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  64440 tv    speak        text=n36.wav voice=clip delayMs=190
  64563 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  64563 tv    speak        text=o61.wav voice=clip delayMs=190
  64690 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  64690 tv    speak        text=n37.wav voice=clip delayMs=190
  64799 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  64799 tv    speak        text=i16.wav voice=clip delayMs=190
  64924 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  64924 tv    speak        text=g47.wav voice=clip delayMs=190
  65045 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  65045 tv    speak        text=n41.wav voice=clip delayMs=190
  65169 tv    clip         src=b6.wav muted=false ready=true delayMs=190
  65169 tv    speak        text=b6.wav voice=clip delayMs=190
  65300 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  65300 tv    speak        text=o72.wav voice=clip delayMs=190
  65425 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  65425 tv    speak        text=b3.wav voice=clip delayMs=190
  65546 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  65546 tv    speak        text=i30.wav voice=clip delayMs=190
  65670 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  65670 tv    speak        text=g56.wav voice=clip delayMs=190
  65797 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  65797 tv    speak        text=o75.wav voice=clip delayMs=190
  65927 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  65927 tv    speak        text=b1.wav voice=clip delayMs=190
  66049 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  66049 tv    speak        text=b2.wav voice=clip delayMs=190
  66170 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  66170 tv    speak        text=n32.wav voice=clip delayMs=190
  66295 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  66295 tv    speak        text=g48.wav voice=clip delayMs=190
  66421 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  66421 tv    speak        text=i23.wav voice=clip delayMs=190
  66545 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  66545 tv    speak        text=i26.wav voice=clip delayMs=190
  66673 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  66673 tv    speak        text=o66.wav voice=clip delayMs=190
  66797 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  66797 tv    speak        text=i19.wav voice=clip delayMs=190
  66926 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  66926 tv    speak        text=n42.wav voice=clip delayMs=190
  67052 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  67052 tv    speak        text=i24.wav voice=clip delayMs=190
  67175 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  67175 tv    speak        text=n39.wav voice=clip delayMs=190
  67303 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  67303 tv    speak        text=g46.wav voice=clip delayMs=190
  67432 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  67432 tv    speak        text=n44.wav voice=clip delayMs=190
  67555 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  67555 tv    speak        text=b15.wav voice=clip delayMs=190
  67678 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  67678 tv    speak        text=b11.wav voice=clip delayMs=190
  67804 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  67804 tv    speak        text=g57.wav voice=clip delayMs=190
  67994 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  68404 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68698 tv    hush
  68698 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68698 tv    hush
  70572 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  74053 tv    music:duck   ms=9000
  74053 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  74106 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  78877 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79210 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80212 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81211 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82211 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  82211 tv    speak        text=g57.wav voice=clip delayMs=190
  82402 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84532 tv    ss:cancel    speaking=false pending=false
  84532 tv    music:plan   from=game:bingo to=null
  84535 tv    ss:cancel    speaking=false pending=false
  84535 tv    music:plan   from=null to=lobby
  84535 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  85335 tv    music:stop   track=wallpaper.mp3
  87058 tv    ss:cancel    speaking=false pending=false
  87067 tv    music:plan   from=lobby to=game:bingo
  87067 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  87067 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  87070 tv    hush
  87070 tv    hush
  87680 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  87689 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  87689 tv    speak        text=i21.wav voice=clip delayMs=190
  87716 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  87716 tv    speak        text=n32.wav voice=clip delayMs=190
  87814 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  87814 tv    speak        text=i18.wav voice=clip delayMs=190
  87868 tv    music:stop   track=local-forecast-elevator.mp3
  87906 tv    clip         src=n40.wav muted=false ready=true delayMs=190
  87906 tv    speak        text=n40.wav voice=clip delayMs=190
  87986 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  87986 tv    speak        text=i30.wav voice=clip delayMs=190
  88082 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  88082 tv    speak        text=o69.wav voice=clip delayMs=190
  88177 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  88177 tv    speak        text=o61.wav voice=clip delayMs=190
  88269 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  88269 tv    speak        text=n34.wav voice=clip delayMs=190
  88363 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  88363 tv    speak        text=n35.wav voice=clip delayMs=190
  88459 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  88459 tv    speak        text=o67.wav voice=clip delayMs=190
  88556 tv    clip         src=g55.wav muted=false ready=true delayMs=190
  88556 tv    speak        text=g55.wav voice=clip delayMs=190
  88647 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  88647 tv    speak        text=i26.wav voice=clip delayMs=190
  88747 tv    clip         src=i22.wav muted=false ready=true delayMs=190
  88747 tv    speak        text=i22.wav voice=clip delayMs=190
  88839 tv    clip         src=i29.wav muted=false ready=true delayMs=190
  88839 tv    speak        text=i29.wav voice=clip delayMs=190
  88932 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  88932 tv    speak        text=o66.wav voice=clip delayMs=190
  89025 tv    clip         src=g51.wav muted=false ready=true delayMs=190
  89025 tv    speak        text=g51.wav voice=clip delayMs=190
  89122 tv    clip         src=g53.wav muted=false ready=true delayMs=190
  89122 tv    speak        text=g53.wav voice=clip delayMs=190
  89215 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  89215 tv    speak        text=b9.wav voice=clip delayMs=190
  89327 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  89327 tv    speak        text=n36.wav voice=clip delayMs=190
  89424 tv    clip         src=g52.wav muted=false ready=true delayMs=190
  89424 tv    speak        text=g52.wav voice=clip delayMs=190
  89518 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  89518 tv    speak        text=b1.wav voice=clip delayMs=190
  89606 tv    clip         src=b13.wav muted=false ready=true delayMs=190
  89606 tv    speak        text=b13.wav voice=clip delayMs=190
  89705 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  89705 tv    speak        text=n37.wav voice=clip delayMs=190
  89798 tv    clip         src=o71.wav muted=false ready=true delayMs=190
  89798 tv    speak        text=o71.wav voice=clip delayMs=190
  89906 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  89906 tv    speak        text=b8.wav voice=clip delayMs=190
  89997 tv    clip         src=b5.wav muted=false ready=true delayMs=190
  89997 tv    speak        text=b5.wav voice=clip delayMs=190
  90093 tv    clip         src=b7.wav muted=false ready=true delayMs=190
  90093 tv    speak        text=b7.wav voice=clip delayMs=190
  90182 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  90182 tv    speak        text=n42.wav voice=clip delayMs=190
  90279 tv    clip         src=i28.wav muted=false ready=true delayMs=190
  90279 tv    speak        text=i28.wav voice=clip delayMs=190
  90368 tv    clip         src=i27.wav muted=false ready=true delayMs=190
  90368 tv    speak        text=i27.wav voice=clip delayMs=190
  90447 tv    clip         src=o63.wav muted=false ready=true delayMs=190
  90447 tv    speak        text=o63.wav voice=clip delayMs=190
  90543 tv    clip         src=o64.wav muted=false ready=true delayMs=190
  90543 tv    speak        text=o64.wav voice=clip delayMs=190
  90635 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  90635 tv    speak        text=o73.wav voice=clip delayMs=190
  90719 tv    clip         src=g50.wav muted=false ready=true delayMs=190
  90719 tv    speak        text=g50.wav voice=clip delayMs=190
  90807 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  90807 tv    speak        text=g48.wav voice=clip delayMs=190
  90921 tv    clip         src=b12.wav muted=false ready=true delayMs=190
  90921 tv    speak        text=b12.wav voice=clip delayMs=190
  90994 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  90994 tv    speak        text=n45.wav voice=clip delayMs=190
  91087 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  91087 tv    speak        text=b4.wav voice=clip delayMs=190
  91183 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  91183 tv    speak        text=g46.wav voice=clip delayMs=190
  91276 tv    clip         src=o74.wav muted=false ready=true delayMs=190
  91276 tv    speak        text=o74.wav voice=clip delayMs=190
  91370 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  91370 tv    speak        text=g47.wav voice=clip delayMs=190
  91465 tv    clip         src=n31.wav muted=false ready=true delayMs=190
  91465 tv    speak        text=n31.wav voice=clip delayMs=190
  91527 tv    clip         src=o62.wav muted=false ready=true delayMs=190
  91527 tv    speak        text=o62.wav voice=clip delayMs=190
  91608 tv    clip         src=b10.wav muted=false ready=true delayMs=190
  91608 tv    speak        text=b10.wav voice=clip delayMs=190
  91703 tv    clip         src=g60.wav muted=false ready=true delayMs=190
  91703 tv    speak        text=g60.wav voice=clip delayMs=190
  91797 tv    clip         src=n38.wav muted=false ready=true delayMs=190
  91797 tv    speak        text=n38.wav voice=clip delayMs=190
  91891 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  91891 tv    speak        text=n39.wav voice=clip delayMs=190
  91985 tv    clip         src=o70.wav muted=false ready=true delayMs=190
  91985 tv    speak        text=o70.wav voice=clip delayMs=190
  92078 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  92078 tv    speak        text=b11.wav voice=clip delayMs=190
  92179 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  92179 tv    speak        text=o75.wav voice=clip delayMs=190
  92251 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  92251 tv    speak        text=g58.wav voice=clip delayMs=190
  92349 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  92349 tv    speak        text=b15.wav voice=clip delayMs=190
  92459 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  92459 tv    speak        text=i24.wav voice=clip delayMs=190
  92559 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  92559 tv    speak        text=o72.wav voice=clip delayMs=190
  92652 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  92652 tv    speak        text=g56.wav voice=clip delayMs=190
  92745 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  92745 tv    speak        text=i20.wav voice=clip delayMs=190
  92844 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  92844 tv    speak        text=n44.wav voice=clip delayMs=190
  92938 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  92938 tv    speak        text=b3.wav voice=clip delayMs=190
  93029 tv    clip         src=o68.wav muted=false ready=true delayMs=190
  93029 tv    speak        text=o68.wav voice=clip delayMs=190
  93124 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  93124 tv    speak        text=b2.wav voice=clip delayMs=190
  93208 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  93208 tv    speak        text=n41.wav voice=clip delayMs=190
  93318 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  93318 tv    speak        text=o65.wav voice=clip delayMs=190
  93406 tv    clip         src=i17.wav muted=false ready=true delayMs=190
  93406 tv    speak        text=i17.wav voice=clip delayMs=190
  93499 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  93499 tv    speak        text=i25.wav voice=clip delayMs=190
  93582 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  93582 tv    speak        text=i19.wav voice=clip delayMs=190
  93663 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  93663 tv    speak        text=g57.wav voice=clip delayMs=190
  93757 tv    clip         src=g59.wav muted=false ready=true delayMs=190
  93757 tv    speak        text=g59.wav voice=clip delayMs=190
  93950 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  94972 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95241 tv    hush
  95241 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95241 tv    hush
 102851 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 102855 tv    music:duck   ms=9000
 102855 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 107855 tv    hush
 107855 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 107856 tv    hush
 111862 tv    ss:cancel    speaking=false pending=false
 111862 tv    music:plan   from=game:bingo to=null
 111862 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113363 tv    music:stop   track=wallpaper.mp3
 113447 tv    ss:cancel    speaking=false pending=false
 113447 tv    music:plan   from=null to=lobby
 113447 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 115960 tv    ss:cancel    speaking=false pending=false
 115969 tv    music:plan   from=lobby to=game:bingo
 115969 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 115969 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 115972 tv    hush
 115973 tv    hush
 116583 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 116589 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 116589 tv    speak        text=i21.wav voice=clip delayMs=190
 116604 tv    clip         src=n32.wav muted=false ready=true delayMs=190
 116604 tv    speak        text=n32.wav voice=clip delayMs=190
 116685 tv    clip         src=i18.wav muted=false ready=true delayMs=190
 116685 tv    speak        text=i18.wav voice=clip delayMs=190
 116771 tv    music:stop   track=local-forecast-elevator.mp3
 116776 tv    clip         src=n40.wav muted=false ready=true delayMs=190
 116776 tv    speak        text=n40.wav voice=clip delayMs=190
 116873 tv    clip         src=i30.wav muted=false ready=true delayMs=190
 116873 tv    speak        text=i30.wav voice=clip delayMs=190
 116970 tv    clip         src=o69.wav muted=false ready=true delayMs=190
 116970 tv    speak        text=o69.wav voice=clip delayMs=190
 117062 tv    clip         src=o61.wav muted=false ready=true delayMs=190
 117062 tv    speak        text=o61.wav voice=clip delayMs=190
 117141 tv    clip         src=n34.wav muted=false ready=true delayMs=190
 117141 tv    speak        text=n34.wav voice=clip delayMs=190
 117234 tv    clip         src=n35.wav muted=false ready=true delayMs=190
 117234 tv    speak        text=n35.wav voice=clip delayMs=190
 117331 tv    clip         src=o67.wav muted=false ready=true delayMs=190
 117331 tv    speak        text=o67.wav voice=clip delayMs=190
 117424 tv    clip         src=g55.wav muted=false ready=true delayMs=190
 117424 tv    speak        text=g55.wav voice=clip delayMs=190
 117520 tv    clip         src=i26.wav muted=false ready=true delayMs=190
 117520 tv    speak        text=i26.wav voice=clip delayMs=190
 117614 tv    clip         src=i22.wav muted=false ready=true delayMs=190
 117614 tv    speak        text=i22.wav voice=clip delayMs=190
 117707 tv    clip         src=i29.wav muted=false ready=true delayMs=190
 117707 tv    speak        text=i29.wav voice=clip delayMs=190
 117802 tv    clip         src=o66.wav muted=false ready=true delayMs=190
 117802 tv    speak        text=o66.wav voice=clip delayMs=190
 117897 tv    clip         src=g51.wav muted=false ready=true delayMs=190
 117897 tv    speak        text=g51.wav voice=clip delayMs=190
 117993 tv    clip         src=g53.wav muted=false ready=true delayMs=190
 117993 tv    speak        text=g53.wav voice=clip delayMs=190
 118084 tv    clip         src=b9.wav muted=false ready=true delayMs=190
 118084 tv    speak        text=b9.wav voice=clip delayMs=190
 118164 tv    clip         src=n36.wav muted=false ready=true delayMs=190
 118164 tv    speak        text=n36.wav voice=clip delayMs=190
 118258 tv    clip         src=g52.wav muted=false ready=true delayMs=190
 118258 tv    speak        text=g52.wav voice=clip delayMs=190
 118352 tv    clip         src=b1.wav muted=false ready=true delayMs=190
 118352 tv    speak        text=b1.wav voice=clip delayMs=190
 118446 tv    clip         src=b13.wav muted=false ready=true delayMs=190
 118446 tv    speak        text=b13.wav voice=clip delayMs=190
 118541 tv    clip         src=n37.wav muted=false ready=true delayMs=190
 118541 tv    speak        text=n37.wav voice=clip delayMs=190
 118636 tv    clip         src=o71.wav muted=false ready=true delayMs=190
 118636 tv    speak        text=o71.wav voice=clip delayMs=190
 118732 tv    clip         src=b8.wav muted=false ready=true delayMs=190
 118732 tv    speak        text=b8.wav voice=clip delayMs=190
 118826 tv    clip         src=b5.wav muted=false ready=true delayMs=190
 118826 tv    speak        text=b5.wav voice=clip delayMs=190
 118922 tv    clip         src=b7.wav muted=false ready=true delayMs=190
 118922 tv    speak        text=b7.wav voice=clip delayMs=190
 119016 tv    clip         src=n42.wav muted=false ready=true delayMs=190
 119016 tv    speak        text=n42.wav voice=clip delayMs=190
 119111 tv    clip         src=i28.wav muted=false ready=true delayMs=190
 119111 tv    speak        text=i28.wav voice=clip delayMs=190
 119205 tv    clip         src=i27.wav muted=false ready=true delayMs=190
 119205 tv    speak        text=i27.wav voice=clip delayMs=190
 119299 tv    clip         src=o63.wav muted=false ready=true delayMs=190
 119299 tv    speak        text=o63.wav voice=clip delayMs=190
 119395 tv    clip         src=o64.wav muted=false ready=true delayMs=190
 119395 tv    speak        text=o64.wav voice=clip delayMs=190
 119488 tv    clip         src=o73.wav muted=false ready=true delayMs=190
 119488 tv    speak        text=o73.wav voice=clip delayMs=190
 119582 tv    clip         src=g50.wav muted=false ready=true delayMs=190
 119582 tv    speak        text=g50.wav voice=clip delayMs=190
 119678 tv    clip         src=g48.wav muted=false ready=true delayMs=190
 119678 tv    speak        text=g48.wav voice=clip delayMs=190
 119771 tv    clip         src=b12.wav muted=false ready=true delayMs=190
 119771 tv    speak        text=b12.wav voice=clip delayMs=190
 119867 tv    clip         src=n45.wav muted=false ready=true delayMs=190
 119867 tv    speak        text=n45.wav voice=clip delayMs=190
 119974 tv    clip         src=b4.wav muted=false ready=true delayMs=190
 119974 tv    speak        text=b4.wav voice=clip delayMs=190
 120070 tv    clip         src=g46.wav muted=false ready=true delayMs=190
 120070 tv    speak        text=g46.wav voice=clip delayMs=190
 120164 tv    clip         src=o74.wav muted=false ready=true delayMs=190
 120164 tv    speak        text=o74.wav voice=clip delayMs=190
 120259 tv    clip         src=g47.wav muted=false ready=true delayMs=190
 120259 tv    speak        text=g47.wav voice=clip delayMs=190
 120357 tv    clip         src=n31.wav muted=false ready=true delayMs=190
 120357 tv    speak        text=n31.wav voice=clip delayMs=190
 120425 tv    clip         src=o62.wav muted=false ready=true delayMs=190
 120425 tv    speak        text=o62.wav voice=clip delayMs=190
 120526 tv    clip         src=b10.wav muted=false ready=true delayMs=190
 120526 tv    speak        text=b10.wav voice=clip delayMs=190
 120626 tv    clip         src=g60.wav muted=false ready=true delayMs=190
 120626 tv    speak        text=g60.wav voice=clip delayMs=190
 120702 tv    clip         src=n38.wav muted=false ready=true delayMs=190
 120702 tv    speak        text=n38.wav voice=clip delayMs=190
 120795 tv    clip         src=n39.wav muted=false ready=true delayMs=190
 120795 tv    speak        text=n39.wav voice=clip delayMs=190
 120893 tv    clip         src=o70.wav muted=false ready=true delayMs=190
 120893 tv    speak        text=o70.wav voice=clip delayMs=190
 120989 tv    clip         src=b11.wav muted=false ready=true delayMs=190
 120989 tv    speak        text=b11.wav voice=clip delayMs=190
 121077 tv    clip         src=o75.wav muted=false ready=true delayMs=190
 121077 tv    speak        text=o75.wav voice=clip delayMs=190
 121171 tv    clip         src=g58.wav muted=false ready=true delayMs=190
 121171 tv    speak        text=g58.wav voice=clip delayMs=190
 121266 tv    clip         src=b15.wav muted=false ready=true delayMs=190
 121266 tv    speak        text=b15.wav voice=clip delayMs=190
 121360 tv    clip         src=i24.wav muted=false ready=true delayMs=190
 121360 tv    speak        text=i24.wav voice=clip delayMs=190
 121454 tv    clip         src=o72.wav muted=false ready=true delayMs=190
 121454 tv    speak        text=o72.wav voice=clip delayMs=190
 121549 tv    clip         src=g56.wav muted=false ready=true delayMs=190
 121549 tv    speak        text=g56.wav voice=clip delayMs=190
 121642 tv    clip         src=i20.wav muted=false ready=true delayMs=190
 121642 tv    speak        text=i20.wav voice=clip delayMs=190
 121740 tv    clip         src=n44.wav muted=false ready=true delayMs=190
 121740 tv    speak        text=n44.wav voice=clip delayMs=190
 121831 tv    clip         src=b3.wav muted=false ready=true delayMs=190
 121831 tv    speak        text=b3.wav voice=clip delayMs=190
 121926 tv    clip         src=o68.wav muted=false ready=true delayMs=190
 121926 tv    speak        text=o68.wav voice=clip delayMs=190
 122020 tv    clip         src=b2.wav muted=false ready=true delayMs=190
 122020 tv    speak        text=b2.wav voice=clip delayMs=190
 122116 tv    clip         src=n41.wav muted=false ready=true delayMs=190
 122116 tv    speak        text=n41.wav voice=clip delayMs=190
 122211 tv    clip         src=o65.wav muted=false ready=true delayMs=190
 122211 tv    speak        text=o65.wav voice=clip delayMs=190
 122291 tv    clip         src=i17.wav muted=false ready=true delayMs=190
 122291 tv    speak        text=i17.wav voice=clip delayMs=190
 122385 tv    clip         src=i25.wav muted=false ready=true delayMs=190
 122385 tv    speak        text=i25.wav voice=clip delayMs=190
 122464 tv    clip         src=i19.wav muted=false ready=true delayMs=190
 122464 tv    speak        text=i19.wav voice=clip delayMs=190
 122558 tv    clip         src=g57.wav muted=false ready=true delayMs=190
 122558 tv    speak        text=g57.wav voice=clip delayMs=190
 122653 tv    clip         src=g59.wav muted=false ready=true delayMs=190
 122653 tv    speak        text=g59.wav voice=clip delayMs=190
 122844 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 123903 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 124168 tv    hush
 124168 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 124168 tv    hush
 131774 tv    music:duck   ms=9000
 131774 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 136785 tv    hush
 136785 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 136786 tv    hush
 138330 tv    ss:cancel    speaking=false pending=false
 138330 tv    music:plan   from=game:bingo to=null
 138332 tv    ss:cancel    speaking=false pending=false
 138332 tv    music:plan   from=null to=lobby
 138332 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 139133 tv    music:stop   track=cool-vibes.mp3
 140852 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 140862 tv    ss:cancel    speaking=false pending=false
 140869 tv    music:plan   from=lobby to=game:bingo
 140869 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 140869 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 140872 tv    hush
 140872 tv    hush
 141484 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 141669 tv    music:stop   track=airport-lounge.mp3
 142874 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 143000 tv    ss:cancel    speaking=false pending=false
 143000 tv    music:plan   from=game:bingo to=null
 143000 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 144502 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 145130 tv    ss:cancel    speaking=false pending=false
 145130 tv    music:plan   from=null to=lobby
 145130 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 148476 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 148485 tv    ss:cancel    speaking=false pending=false
 148487 tv    music:plan   from=lobby to=game:bingo
 148487 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 148487 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 148491 tv    hush
 148491 tv    hush
 148904 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 148904 tv    speak        text=i21.wav voice=clip delayMs=190
 148905 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 149096 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 149288 tv    music:stop   track=airport-lounge.mp3
 149396 tv    ss:cancel    speaking=false pending=false
 149396 tv    music:plan   from=game:bingo to=null
 149400 tv    ss:cancel    speaking=false pending=false
 149400 tv    music:plan   from=null to=lobby
 149400 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 150204 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"airport-lounge.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 155001 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 155433 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 155850 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156283 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156697 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157766 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 158358 tv    ss:cancel    speaking=false pending=false
 158363 tv    music:plan   from=lobby to=null
 158363 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 159604 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 159863 tv    music:stop   track=airport-lounge.mp3
 161317 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 162600 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 163900 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 164922 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 165973 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 168545 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 168738 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 168923 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 169113 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"lobby-time.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 170212 tv    ss:cancel    speaking=false pending=false
 170215 tv    ss:cancel    speaking=false pending=false
 170215 tv    music:plan   from=null to=lobby
 170215 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 172233 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 172244 tv    ss:cancel    speaking=false pending=false
 172247 tv    music:plan   from=lobby to=null
 172247 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 173749 tv    music:stop   track=bossa-antigua.mp3
 173788 tv    music:plan   from=null to=game:broken-pencil
 173788 tv    music:start  plan=game:broken-pencil track=lobby-time mode=chain volume=0.2
 173788 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 175264 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 175740 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 175897 tv    music:plan   from=game:broken-pencil to=null
 175897 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 177398 tv    music:stop   track=lobby-time.mp3
```
