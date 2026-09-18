# Audio interaction trace

Captured 2026-09-18T20:42:53.822Z on port 42166. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**56 / 56 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:george-street-shuffle
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":4.4}]

```
   1806 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   1831 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3144 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3279 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3979 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4612 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5464 tv    ss:cancel    speaking=false pending=false
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
   6310 tv    music:plan   from=lobby to=null
   6310 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7814 tv    music:stop   track=george-street-shuffle.mp3
   8264 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9547 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16515 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17520 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18519 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19516 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20519 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21314 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22119 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22278 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22434 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22590 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22748 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22908 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23064 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23220 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23380 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23538 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23693 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23852 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24008 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24167 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24328 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24482 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24640 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24798 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24958 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25841 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26174 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27985 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29714 tv    ss:cancel    speaking=false pending=false
  29714 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31256 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33391 tv    ss:cancel    speaking=false pending=false
  33391 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34941 tv    ss:cancel    speaking=false pending=false
  34941 tv    music:plan   from=null to=lobby
  34941 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+960ms phone@+980ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,silence,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,silence,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5361ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5401ms cheer@+5371ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36497 tv    music:plan   from=lobby to=game:bingo
  36497 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36497 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36804 tv    hush
  36805 tv    hush
  37299 tv    music:stop   track=airport-lounge.mp3
  37415 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38506 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39506 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40505 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41504 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  41504 tv    speak        text=b9.wav voice=clip delayMs=190
  41505 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41696 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43148 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  43148 tv    speak        text=b8.wav voice=clip delayMs=190
  43340 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44968 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  44968 tv    speak        text=n34.wav voice=clip delayMs=190
  45160 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46845 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47117 tv    hush
  47117 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47118 tv    hush
  52472 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  52473 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55476 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56476 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57476 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58477 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  58477 tv    speak        text=n35.wav voice=clip delayMs=190
  58667 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60276 tv    music:paused paused=true
  60276 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61510 tv    music:paused paused=false
  61510 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62798 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  62798 tv    speak        text=i25.wav voice=clip delayMs=190
  62925 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  62925 tv    speak        text=n45.wav voice=clip delayMs=190
  63051 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  63051 tv    speak        text=n33.wav voice=clip delayMs=190
  63177 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  63177 tv    speak        text=g49.wav voice=clip delayMs=190
  63301 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  63301 tv    speak        text=b4.wav voice=clip delayMs=190
  63412 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  63412 tv    speak        text=i20.wav voice=clip delayMs=190
  63537 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  63537 tv    speak        text=o69.wav voice=clip delayMs=190
  63663 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  63663 tv    speak        text=o67.wav voice=clip delayMs=190
  63789 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  63789 tv    speak        text=o65.wav voice=clip delayMs=190
  63916 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  63916 tv    speak        text=o73.wav voice=clip delayMs=190
  64042 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  64042 tv    speak        text=i21.wav voice=clip delayMs=190
  64167 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  64167 tv    speak        text=i18.wav voice=clip delayMs=190
  64295 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  64295 tv    speak        text=g58.wav voice=clip delayMs=190
  64421 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  64421 tv    speak        text=n36.wav voice=clip delayMs=190
  64547 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  64547 tv    speak        text=o61.wav voice=clip delayMs=190
  64674 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  64674 tv    speak        text=n37.wav voice=clip delayMs=190
  64801 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  64801 tv    speak        text=i16.wav voice=clip delayMs=190
  64928 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  64928 tv    speak        text=g47.wav voice=clip delayMs=190
  65055 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  65055 tv    speak        text=n41.wav voice=clip delayMs=190
  65166 tv    clip         src=b6.wav muted=false ready=true delayMs=190
  65166 tv    speak        text=b6.wav voice=clip delayMs=190
  65292 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  65292 tv    speak        text=o72.wav voice=clip delayMs=190
  65416 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  65416 tv    speak        text=b3.wav voice=clip delayMs=190
  65543 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  65543 tv    speak        text=i30.wav voice=clip delayMs=190
  65670 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  65670 tv    speak        text=g56.wav voice=clip delayMs=190
  65796 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  65796 tv    speak        text=o75.wav voice=clip delayMs=190
  65928 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  65928 tv    speak        text=b1.wav voice=clip delayMs=190
  66049 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  66049 tv    speak        text=b2.wav voice=clip delayMs=190
  66173 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  66173 tv    speak        text=n32.wav voice=clip delayMs=190
  66299 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  66299 tv    speak        text=g48.wav voice=clip delayMs=190
  66426 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  66426 tv    speak        text=i23.wav voice=clip delayMs=190
  66549 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  66549 tv    speak        text=i26.wav voice=clip delayMs=190
  66675 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  66675 tv    speak        text=o66.wav voice=clip delayMs=190
  66801 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  66801 tv    speak        text=i19.wav voice=clip delayMs=190
  66927 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  66927 tv    speak        text=n42.wav voice=clip delayMs=190
  67054 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  67054 tv    speak        text=i24.wav voice=clip delayMs=190
  67181 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  67181 tv    speak        text=n39.wav voice=clip delayMs=190
  67307 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  67307 tv    speak        text=g46.wav voice=clip delayMs=190
  67432 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  67432 tv    speak        text=n44.wav voice=clip delayMs=190
  67559 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  67559 tv    speak        text=b15.wav voice=clip delayMs=190
  67687 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  67687 tv    speak        text=b11.wav voice=clip delayMs=190
  67810 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  67810 tv    speak        text=g57.wav voice=clip delayMs=190
  68001 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  68442 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68727 tv    hush
  68728 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68728 tv    hush
  70602 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  74088 tv    music:duck   ms=9000
  74088 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  78897 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79228 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80229 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81229 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82228 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  82228 tv    speak        text=g57.wav voice=clip delayMs=190
  82419 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84536 tv    ss:cancel    speaking=false pending=false
  84536 tv    music:plan   from=game:bingo to=null
  84539 tv    ss:cancel    speaking=false pending=false
  84539 tv    music:plan   from=null to=lobby
  84539 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  85339 tv    music:stop   track=wallpaper.mp3
  87042 tv    ss:cancel    speaking=false pending=false
  87051 tv    music:plan   from=lobby to=game:bingo
  87051 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  87051 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  87054 tv    hush
  87055 tv    hush
  87666 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  87674 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  87674 tv    speak        text=i21.wav voice=clip delayMs=190
  87680 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  87680 tv    speak        text=n32.wav voice=clip delayMs=190
  87782 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  87782 tv    speak        text=i18.wav voice=clip delayMs=190
  87852 tv    music:stop   track=local-forecast-elevator.mp3
  87861 tv    clip         src=n40.wav muted=false ready=true delayMs=190
  87861 tv    speak        text=n40.wav voice=clip delayMs=190
  87955 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  87955 tv    speak        text=i30.wav voice=clip delayMs=190
  88048 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  88048 tv    speak        text=o69.wav voice=clip delayMs=190
  88142 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  88142 tv    speak        text=o61.wav voice=clip delayMs=190
  88237 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  88237 tv    speak        text=n34.wav voice=clip delayMs=190
  88330 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  88330 tv    speak        text=n35.wav voice=clip delayMs=190
  88424 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  88424 tv    speak        text=o67.wav voice=clip delayMs=190
  88519 tv    clip         src=g55.wav muted=false ready=true delayMs=190
  88519 tv    speak        text=g55.wav voice=clip delayMs=190
  88612 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  88612 tv    speak        text=i26.wav voice=clip delayMs=190
  88708 tv    clip         src=i22.wav muted=false ready=true delayMs=190
  88708 tv    speak        text=i22.wav voice=clip delayMs=190
  88787 tv    clip         src=i29.wav muted=false ready=true delayMs=190
  88787 tv    speak        text=i29.wav voice=clip delayMs=190
  88880 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  88880 tv    speak        text=o66.wav voice=clip delayMs=190
  88973 tv    clip         src=g51.wav muted=false ready=true delayMs=190
  88973 tv    speak        text=g51.wav voice=clip delayMs=190
  89066 tv    clip         src=g53.wav muted=false ready=true delayMs=190
  89066 tv    speak        text=g53.wav voice=clip delayMs=190
  89158 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  89158 tv    speak        text=b9.wav voice=clip delayMs=190
  89254 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  89254 tv    speak        text=n36.wav voice=clip delayMs=190
  89334 tv    clip         src=g52.wav muted=false ready=true delayMs=190
  89334 tv    speak        text=g52.wav voice=clip delayMs=190
  89426 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  89426 tv    speak        text=b1.wav voice=clip delayMs=190
  89520 tv    clip         src=b13.wav muted=false ready=true delayMs=190
  89520 tv    speak        text=b13.wav voice=clip delayMs=190
  89615 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  89615 tv    speak        text=n37.wav voice=clip delayMs=190
  89708 tv    clip         src=o71.wav muted=false ready=true delayMs=190
  89708 tv    speak        text=o71.wav voice=clip delayMs=190
  89800 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  89800 tv    speak        text=b8.wav voice=clip delayMs=190
  89895 tv    clip         src=b5.wav muted=false ready=true delayMs=190
  89895 tv    speak        text=b5.wav voice=clip delayMs=190
  89989 tv    clip         src=b7.wav muted=false ready=true delayMs=190
  89989 tv    speak        text=b7.wav voice=clip delayMs=190
  90086 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  90086 tv    speak        text=n42.wav voice=clip delayMs=190
  90181 tv    clip         src=i28.wav muted=false ready=true delayMs=190
  90181 tv    speak        text=i28.wav voice=clip delayMs=190
  90273 tv    clip         src=i27.wav muted=false ready=true delayMs=190
  90273 tv    speak        text=i27.wav voice=clip delayMs=190
  90370 tv    clip         src=o63.wav muted=false ready=true delayMs=190
  90370 tv    speak        text=o63.wav voice=clip delayMs=190
  90462 tv    clip         src=o64.wav muted=false ready=true delayMs=190
  90462 tv    speak        text=o64.wav voice=clip delayMs=190
  90558 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  90558 tv    speak        text=o73.wav voice=clip delayMs=190
  90664 tv    clip         src=g50.wav muted=false ready=true delayMs=190
  90664 tv    speak        text=g50.wav voice=clip delayMs=190
  90744 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  90744 tv    speak        text=g48.wav voice=clip delayMs=190
  90822 tv    clip         src=b12.wav muted=false ready=true delayMs=190
  90822 tv    speak        text=b12.wav voice=clip delayMs=190
  90903 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  90903 tv    speak        text=n45.wav voice=clip delayMs=190
  90980 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  90980 tv    speak        text=b4.wav voice=clip delayMs=190
  91075 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  91075 tv    speak        text=g46.wav voice=clip delayMs=190
  91170 tv    clip         src=o74.wav muted=false ready=true delayMs=190
  91170 tv    speak        text=o74.wav voice=clip delayMs=190
  91264 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  91264 tv    speak        text=g47.wav voice=clip delayMs=190
  91358 tv    clip         src=n31.wav muted=false ready=true delayMs=190
  91358 tv    speak        text=n31.wav voice=clip delayMs=190
  91437 tv    clip         src=o62.wav muted=false ready=true delayMs=190
  91437 tv    speak        text=o62.wav voice=clip delayMs=190
  91532 tv    clip         src=b10.wav muted=false ready=true delayMs=190
  91532 tv    speak        text=b10.wav voice=clip delayMs=190
  91625 tv    clip         src=g60.wav muted=false ready=true delayMs=190
  91625 tv    speak        text=g60.wav voice=clip delayMs=190
  91705 tv    clip         src=n38.wav muted=false ready=true delayMs=190
  91705 tv    speak        text=n38.wav voice=clip delayMs=190
  91798 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  91798 tv    speak        text=n39.wav voice=clip delayMs=190
  91893 tv    clip         src=o70.wav muted=false ready=true delayMs=190
  91893 tv    speak        text=o70.wav voice=clip delayMs=190
  91986 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  91986 tv    speak        text=b11.wav voice=clip delayMs=190
  92079 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  92079 tv    speak        text=o75.wav voice=clip delayMs=190
  92175 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  92175 tv    speak        text=g58.wav voice=clip delayMs=190
  92268 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  92268 tv    speak        text=b15.wav voice=clip delayMs=190
  92363 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  92363 tv    speak        text=i24.wav voice=clip delayMs=190
  92459 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  92459 tv    speak        text=o72.wav voice=clip delayMs=190
  92565 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  92565 tv    speak        text=g56.wav voice=clip delayMs=190
  92646 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  92646 tv    speak        text=i20.wav voice=clip delayMs=190
  92741 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  92741 tv    speak        text=n44.wav voice=clip delayMs=190
  92835 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  92835 tv    speak        text=b3.wav voice=clip delayMs=190
  92930 tv    clip         src=o68.wav muted=false ready=true delayMs=190
  92930 tv    speak        text=o68.wav voice=clip delayMs=190
  93023 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  93023 tv    speak        text=b2.wav voice=clip delayMs=190
  93118 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  93118 tv    speak        text=n41.wav voice=clip delayMs=190
  93198 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  93198 tv    speak        text=o65.wav voice=clip delayMs=190
  93292 tv    clip         src=i17.wav muted=false ready=true delayMs=190
  93292 tv    speak        text=i17.wav voice=clip delayMs=190
  93386 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  93386 tv    speak        text=i25.wav voice=clip delayMs=190
  93481 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  93481 tv    speak        text=i19.wav voice=clip delayMs=190
  93576 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  93576 tv    speak        text=g57.wav voice=clip delayMs=190
  93670 tv    clip         src=g59.wav muted=false ready=true delayMs=190
  93670 tv    speak        text=g59.wav voice=clip delayMs=190
  93749 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  93749 tv    speak        text=g49.wav voice=clip delayMs=190
  93843 tv    clip         src=n43.wav muted=false ready=true delayMs=190
  93843 tv    speak        text=n43.wav voice=clip delayMs=190
  93938 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  93938 tv    speak        text=i16.wav voice=clip delayMs=190
  94031 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  94031 tv    speak        text=n33.wav voice=clip delayMs=190
  94126 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  94126 tv    speak        text=i23.wav voice=clip delayMs=190
  94222 tv    clip         src=g54.wav muted=false ready=true delayMs=190
  94222 tv    speak        text=g54.wav voice=clip delayMs=190
  94316 tv    clip         src=b14.wav muted=false ready=true delayMs=190
  94316 tv    speak        text=b14.wav voice=clip delayMs=190
  94507 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  95555 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95824 tv    hush
  95824 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95824 tv    hush
 103428 tv    music:duck   ms=9000
 103428 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108444 tv    hush
 108445 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108445 tv    hush
 112450 tv    ss:cancel    speaking=false pending=false
 112450 tv    music:plan   from=game:bingo to=null
 112450 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113951 tv    music:stop   track=cool-vibes.mp3
 114035 tv    ss:cancel    speaking=false pending=false
 114035 tv    music:plan   from=null to=lobby
 114035 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 116544 tv    ss:cancel    speaking=false pending=false
 116552 tv    music:plan   from=lobby to=game:bingo
 116552 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116552 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116555 tv    hush
 116556 tv    hush
 117167 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117176 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 117176 tv    speak        text=i21.wav voice=clip delayMs=190
 117191 tv    clip         src=n32.wav muted=false ready=true delayMs=190
 117191 tv    speak        text=n32.wav voice=clip delayMs=190
 117286 tv    clip         src=i18.wav muted=false ready=true delayMs=190
 117286 tv    speak        text=i18.wav voice=clip delayMs=190
 117352 tv    music:stop   track=bossa-antigua.mp3
 117365 tv    clip         src=n40.wav muted=false ready=true delayMs=190
 117365 tv    speak        text=n40.wav voice=clip delayMs=190
 117459 tv    clip         src=i30.wav muted=false ready=true delayMs=190
 117459 tv    speak        text=i30.wav voice=clip delayMs=190
 117537 tv    clip         src=o69.wav muted=false ready=true delayMs=190
 117537 tv    speak        text=o69.wav voice=clip delayMs=190
 117631 tv    clip         src=o61.wav muted=false ready=true delayMs=190
 117631 tv    speak        text=o61.wav voice=clip delayMs=190
 117726 tv    clip         src=n34.wav muted=false ready=true delayMs=190
 117726 tv    speak        text=n34.wav voice=clip delayMs=190
 117806 tv    clip         src=n35.wav muted=false ready=true delayMs=190
 117806 tv    speak        text=n35.wav voice=clip delayMs=190
 117900 tv    clip         src=o67.wav muted=false ready=true delayMs=190
 117900 tv    speak        text=o67.wav voice=clip delayMs=190
 117994 tv    clip         src=g55.wav muted=false ready=true delayMs=190
 117994 tv    speak        text=g55.wav voice=clip delayMs=190
 118089 tv    clip         src=i26.wav muted=false ready=true delayMs=190
 118089 tv    speak        text=i26.wav voice=clip delayMs=190
 118184 tv    clip         src=i22.wav muted=false ready=true delayMs=190
 118184 tv    speak        text=i22.wav voice=clip delayMs=190
 118264 tv    clip         src=i29.wav muted=false ready=true delayMs=190
 118264 tv    speak        text=i29.wav voice=clip delayMs=190
 118359 tv    clip         src=o66.wav muted=false ready=true delayMs=190
 118359 tv    speak        text=o66.wav voice=clip delayMs=190
 118455 tv    clip         src=g51.wav muted=false ready=true delayMs=190
 118455 tv    speak        text=g51.wav voice=clip delayMs=190
 118549 tv    clip         src=g53.wav muted=false ready=true delayMs=190
 118549 tv    speak        text=g53.wav voice=clip delayMs=190
 118644 tv    clip         src=b9.wav muted=false ready=true delayMs=190
 118644 tv    speak        text=b9.wav voice=clip delayMs=190
 118738 tv    clip         src=n36.wav muted=false ready=true delayMs=190
 118738 tv    speak        text=n36.wav voice=clip delayMs=190
 118817 tv    clip         src=g52.wav muted=false ready=true delayMs=190
 118817 tv    speak        text=g52.wav voice=clip delayMs=190
 118911 tv    clip         src=b1.wav muted=false ready=true delayMs=190
 118911 tv    speak        text=b1.wav voice=clip delayMs=190
 119006 tv    clip         src=b13.wav muted=false ready=true delayMs=190
 119006 tv    speak        text=b13.wav voice=clip delayMs=190
 119100 tv    clip         src=n37.wav muted=false ready=true delayMs=190
 119100 tv    speak        text=n37.wav voice=clip delayMs=190
 119194 tv    clip         src=o71.wav muted=false ready=true delayMs=190
 119194 tv    speak        text=o71.wav voice=clip delayMs=190
 119290 tv    clip         src=b8.wav muted=false ready=true delayMs=190
 119290 tv    speak        text=b8.wav voice=clip delayMs=190
 119383 tv    clip         src=b5.wav muted=false ready=true delayMs=190
 119383 tv    speak        text=b5.wav voice=clip delayMs=190
 119477 tv    clip         src=b7.wav muted=false ready=true delayMs=190
 119477 tv    speak        text=b7.wav voice=clip delayMs=190
 119571 tv    clip         src=n42.wav muted=false ready=true delayMs=190
 119571 tv    speak        text=n42.wav voice=clip delayMs=190
 119666 tv    clip         src=i28.wav muted=false ready=true delayMs=190
 119666 tv    speak        text=i28.wav voice=clip delayMs=190
 119760 tv    clip         src=i27.wav muted=false ready=true delayMs=190
 119760 tv    speak        text=i27.wav voice=clip delayMs=190
 119855 tv    clip         src=o63.wav muted=false ready=true delayMs=190
 119855 tv    speak        text=o63.wav voice=clip delayMs=190
 119950 tv    clip         src=o64.wav muted=false ready=true delayMs=190
 119950 tv    speak        text=o64.wav voice=clip delayMs=190
 120046 tv    clip         src=o73.wav muted=false ready=true delayMs=190
 120046 tv    speak        text=o73.wav voice=clip delayMs=190
 120140 tv    clip         src=g50.wav muted=false ready=true delayMs=190
 120140 tv    speak        text=g50.wav voice=clip delayMs=190
 120220 tv    clip         src=g48.wav muted=false ready=true delayMs=190
 120220 tv    speak        text=g48.wav voice=clip delayMs=190
 120315 tv    clip         src=b12.wav muted=false ready=true delayMs=190
 120315 tv    speak        text=b12.wav voice=clip delayMs=190
 120377 tv    clip         src=n45.wav muted=false ready=true delayMs=190
 120377 tv    speak        text=n45.wav voice=clip delayMs=190
 120476 tv    clip         src=b4.wav muted=false ready=true delayMs=190
 120476 tv    speak        text=b4.wav voice=clip delayMs=190
 120569 tv    clip         src=g46.wav muted=false ready=true delayMs=190
 120569 tv    speak        text=g46.wav voice=clip delayMs=190
 120664 tv    clip         src=o74.wav muted=false ready=true delayMs=190
 120664 tv    speak        text=o74.wav voice=clip delayMs=190
 120758 tv    clip         src=g47.wav muted=false ready=true delayMs=190
 120758 tv    speak        text=g47.wav voice=clip delayMs=190
 120854 tv    clip         src=n31.wav muted=false ready=true delayMs=190
 120854 tv    speak        text=n31.wav voice=clip delayMs=190
 120962 tv    clip         src=o62.wav muted=false ready=true delayMs=190
 120962 tv    speak        text=o62.wav voice=clip delayMs=190
 121057 tv    clip         src=b10.wav muted=false ready=true delayMs=190
 121057 tv    speak        text=b10.wav voice=clip delayMs=190
 121151 tv    clip         src=g60.wav muted=false ready=true delayMs=190
 121151 tv    speak        text=g60.wav voice=clip delayMs=190
 121247 tv    clip         src=n38.wav muted=false ready=true delayMs=190
 121247 tv    speak        text=n38.wav voice=clip delayMs=190
 121342 tv    clip         src=n39.wav muted=false ready=true delayMs=190
 121342 tv    speak        text=n39.wav voice=clip delayMs=190
 121437 tv    clip         src=o70.wav muted=false ready=true delayMs=190
 121437 tv    speak        text=o70.wav voice=clip delayMs=190
 121532 tv    clip         src=b11.wav muted=false ready=true delayMs=190
 121532 tv    speak        text=b11.wav voice=clip delayMs=190
 121640 tv    clip         src=o75.wav muted=false ready=true delayMs=190
 121640 tv    speak        text=o75.wav voice=clip delayMs=190
 121735 tv    clip         src=g58.wav muted=false ready=true delayMs=190
 121735 tv    speak        text=g58.wav voice=clip delayMs=190
 121829 tv    clip         src=b15.wav muted=false ready=true delayMs=190
 121829 tv    speak        text=b15.wav voice=clip delayMs=190
 121923 tv    clip         src=i24.wav muted=false ready=true delayMs=190
 121923 tv    speak        text=i24.wav voice=clip delayMs=190
 122015 tv    clip         src=o72.wav muted=false ready=true delayMs=190
 122015 tv    speak        text=o72.wav voice=clip delayMs=190
 122111 tv    clip         src=g56.wav muted=false ready=true delayMs=190
 122111 tv    speak        text=g56.wav voice=clip delayMs=190
 122206 tv    clip         src=i20.wav muted=false ready=true delayMs=190
 122206 tv    speak        text=i20.wav voice=clip delayMs=190
 122302 tv    clip         src=n44.wav muted=false ready=true delayMs=190
 122302 tv    speak        text=n44.wav voice=clip delayMs=190
 122395 tv    clip         src=b3.wav muted=false ready=true delayMs=190
 122395 tv    speak        text=b3.wav voice=clip delayMs=190
 122489 tv    clip         src=o68.wav muted=false ready=true delayMs=190
 122489 tv    speak        text=o68.wav voice=clip delayMs=190
 122584 tv    clip         src=b2.wav muted=false ready=true delayMs=190
 122584 tv    speak        text=b2.wav voice=clip delayMs=190
 122679 tv    clip         src=n41.wav muted=false ready=true delayMs=190
 122679 tv    speak        text=n41.wav voice=clip delayMs=190
 122775 tv    clip         src=o65.wav muted=false ready=true delayMs=190
 122775 tv    speak        text=o65.wav voice=clip delayMs=190
 122868 tv    clip         src=i17.wav muted=false ready=true delayMs=190
 122868 tv    speak        text=i17.wav voice=clip delayMs=190
 122963 tv    clip         src=i25.wav muted=false ready=true delayMs=190
 122963 tv    speak        text=i25.wav voice=clip delayMs=190
 123057 tv    clip         src=i19.wav muted=false ready=true delayMs=190
 123057 tv    speak        text=i19.wav voice=clip delayMs=190
 123152 tv    clip         src=g57.wav muted=false ready=true delayMs=190
 123152 tv    speak        text=g57.wav voice=clip delayMs=190
 123249 tv    clip         src=g59.wav muted=false ready=true delayMs=190
 123249 tv    speak        text=g59.wav voice=clip delayMs=190
 123343 tv    clip         src=g49.wav muted=false ready=true delayMs=190
 123343 tv    speak        text=g49.wav voice=clip delayMs=190
 123438 tv    clip         src=n43.wav muted=false ready=true delayMs=190
 123438 tv    speak        text=n43.wav voice=clip delayMs=190
 123534 tv    clip         src=i16.wav muted=false ready=true delayMs=190
 123534 tv    speak        text=i16.wav voice=clip delayMs=190
 123628 tv    clip         src=n33.wav muted=false ready=true delayMs=190
 123628 tv    speak        text=n33.wav voice=clip delayMs=190
 123722 tv    clip         src=i23.wav muted=false ready=true delayMs=190
 123722 tv    speak        text=i23.wav voice=clip delayMs=190
 123818 tv    clip         src=g54.wav muted=false ready=true delayMs=190
 123818 tv    speak        text=g54.wav voice=clip delayMs=190
 123925 tv    clip         src=b14.wav muted=false ready=true delayMs=190
 123925 tv    speak        text=b14.wav voice=clip delayMs=190
 124116 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 125172 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 125434 tv    hush
 125434 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 125435 tv    hush
 133040 tv    music:duck   ms=9000
 133040 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 138062 tv    hush
 138062 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 138063 tv    hush
 139619 tv    ss:cancel    speaking=false pending=false
 139619 tv    music:plan   from=game:bingo to=null
 139621 tv    ss:cancel    speaking=false pending=false
 139621 tv    music:plan   from=null to=lobby
 139621 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 140423 tv    music:stop   track=wallpaper.mp3
 142127 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 142135 tv    ss:cancel    speaking=false pending=false
 142141 tv    music:plan   from=lobby to=game:bingo
 142141 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 142141 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 142145 tv    hush
 142145 tv    hush
 142757 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 142943 tv    music:stop   track=george-street-shuffle.mp3
 144146 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 144270 tv    ss:cancel    speaking=false pending=false
 144270 tv    music:plan   from=game:bingo to=null
 144270 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 145770 tv    music:stop   track=cool-vibes.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 146400 tv    ss:cancel    speaking=false pending=false
 146400 tv    music:plan   from=null to=lobby
 146400 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 149748 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 149757 tv    ss:cancel    speaking=false pending=false
 149759 tv    music:plan   from=lobby to=game:bingo
 149759 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 149759 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149762 tv    hush
 149763 tv    hush
 150192 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 150192 tv    speak        text=i21.wav voice=clip delayMs=190
 150192 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150383 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 150561 tv    music:stop   track=bossa-antigua.mp3
 150703 tv    ss:cancel    speaking=false pending=false
 150703 tv    music:plan   from=game:bingo to=null
 150708 tv    ss:cancel    speaking=false pending=false
 150708 tv    music:plan   from=null to=lobby
 150708 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 151509 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":10.2}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 156303 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156738 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157152 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157587 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158020 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 159102 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 159711 tv    ss:cancel    speaking=false pending=false
 159715 tv    music:plan   from=lobby to=null
 159715 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 160964 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 161216 tv    music:stop   track=bossa-antigua.mp3
 162571 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 163988 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 165404 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 166404 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 167448 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 170014 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 170204 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 170393 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 170586 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 171700 tv    ss:cancel    speaking=false pending=false
 171703 tv    ss:cancel    speaking=false pending=false
 171703 tv    music:plan   from=null to=lobby
 171703 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 173719 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 173725 tv    ss:cancel    speaking=false pending=false
 173727 tv    music:plan   from=lobby to=null
 173727 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 175228 tv    music:stop   track=local-forecast-elevator.mp3
 175263 tv    music:plan   from=null to=game:broken-pencil
 175263 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 175263 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 176751 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 177210 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 177366 tv    music:plan   from=game:broken-pencil to=null
 177366 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 178867 tv    music:stop   track=backbay-lounge.mp3
```
