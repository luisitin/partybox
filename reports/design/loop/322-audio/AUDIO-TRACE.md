# Audio interaction trace

Captured 2026-09-18T18:29:45.820Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**55 / 55 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.4}]

```
   1771 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1797 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3125 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3260 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3966 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4595 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5445 tv    ss:cancel    speaking=false pending=false
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
   6284 tv    music:plan   from=lobby to=null
   6285 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7795 tv    music:stop   track=local-forecast-elevator.mp3
   8227 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9513 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16479 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17484 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18479 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19483 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20479 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21288 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22107 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22265 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22418 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22577 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22733 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22888 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23045 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23203 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23357 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23515 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23668 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23824 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23979 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24121 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24276 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24418 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24576 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24733 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24893 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25754 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26086 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27899 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29622 tv    ss:cancel    speaking=false pending=false
  29622 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31171 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33323 tv    ss:cancel    speaking=false pending=false
  33323 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34873 tv    ss:cancel    speaking=false pending=false
  34873 tv    music:plan   from=null to=lobby
  34873 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+958ms phone@+969ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,silence,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,silence,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5359ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5403ms cheer@+5370ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36436 tv    music:plan   from=lobby to=game:bingo
  36436 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36437 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36742 tv    hush
  36742 tv    hush
  37238 tv    music:stop   track=airport-lounge.mp3
  37354 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38444 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39444 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40445 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41452 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  41452 tv    speak        text=b9.wav voice=clip delayMs=190
  41454 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41646 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43080 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  43080 tv    speak        text=b8.wav voice=clip delayMs=190
  43271 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44910 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  44910 tv    speak        text=n34.wav voice=clip delayMs=190
  45101 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46774 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47032 tv    hush
  47033 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47033 tv    hush
  52388 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  52390 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55399 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56402 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57401 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58401 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  58401 tv    speak        text=n35.wav voice=clip delayMs=190
  58592 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60174 tv    music:paused paused=true
  60174 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61409 tv    music:paused paused=false
  61409 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62702 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  62702 tv    speak        text=i25.wav voice=clip delayMs=190
  62835 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  62835 tv    speak        text=n45.wav voice=clip delayMs=190
  62954 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  62954 tv    speak        text=n33.wav voice=clip delayMs=190
  63086 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  63086 tv    speak        text=g49.wav voice=clip delayMs=190
  63206 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  63206 tv    speak        text=b4.wav voice=clip delayMs=190
  63316 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  63316 tv    speak        text=i20.wav voice=clip delayMs=190
  63442 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  63442 tv    speak        text=o69.wav voice=clip delayMs=190
  63567 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  63567 tv    speak        text=o67.wav voice=clip delayMs=190
  63691 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  63691 tv    speak        text=o65.wav voice=clip delayMs=190
  63817 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  63817 tv    speak        text=o73.wav voice=clip delayMs=190
  63944 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  63944 tv    speak        text=i21.wav voice=clip delayMs=190
  64074 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  64074 tv    speak        text=i18.wav voice=clip delayMs=190
  64195 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  64195 tv    speak        text=g58.wav voice=clip delayMs=190
  64322 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  64322 tv    speak        text=n36.wav voice=clip delayMs=190
  64447 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  64447 tv    speak        text=o61.wav voice=clip delayMs=190
  64573 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  64573 tv    speak        text=n37.wav voice=clip delayMs=190
  64699 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  64699 tv    speak        text=i16.wav voice=clip delayMs=190
  64824 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  64824 tv    speak        text=g47.wav voice=clip delayMs=190
  64952 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  64952 tv    speak        text=n41.wav voice=clip delayMs=190
  65077 tv    clip         src=b6.wav muted=false ready=true delayMs=190
  65077 tv    speak        text=b6.wav voice=clip delayMs=190
  65204 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  65204 tv    speak        text=o72.wav voice=clip delayMs=190
  65329 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  65329 tv    speak        text=b3.wav voice=clip delayMs=190
  65453 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  65453 tv    speak        text=i30.wav voice=clip delayMs=190
  65580 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  65580 tv    speak        text=g56.wav voice=clip delayMs=190
  65705 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  65705 tv    speak        text=o75.wav voice=clip delayMs=190
  65832 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  65832 tv    speak        text=b1.wav voice=clip delayMs=190
  65957 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  65957 tv    speak        text=b2.wav voice=clip delayMs=190
  66084 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  66084 tv    speak        text=n32.wav voice=clip delayMs=190
  66209 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  66209 tv    speak        text=g48.wav voice=clip delayMs=190
  66334 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  66334 tv    speak        text=i23.wav voice=clip delayMs=190
  66461 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  66461 tv    speak        text=i26.wav voice=clip delayMs=190
  66587 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  66587 tv    speak        text=o66.wav voice=clip delayMs=190
  66712 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  66712 tv    speak        text=i19.wav voice=clip delayMs=190
  66822 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  66822 tv    speak        text=n42.wav voice=clip delayMs=190
  66946 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  66946 tv    speak        text=i24.wav voice=clip delayMs=190
  67072 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  67072 tv    speak        text=n39.wav voice=clip delayMs=190
  67195 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  67195 tv    speak        text=g46.wav voice=clip delayMs=190
  67319 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  67319 tv    speak        text=n44.wav voice=clip delayMs=190
  67429 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  67429 tv    speak        text=b15.wav voice=clip delayMs=190
  67560 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  67560 tv    speak        text=b11.wav voice=clip delayMs=190
  67682 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  67682 tv    speak        text=g57.wav voice=clip delayMs=190
  67874 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  68306 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68592 tv    hush
  68592 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68592 tv    hush
  70465 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73951 tv    music:duck   ms=9000
  73951 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  78745 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79078 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80079 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81081 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82076 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  82076 tv    speak        text=g57.wav voice=clip delayMs=190
  82266 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84383 tv    ss:cancel    speaking=false pending=false
  84383 tv    music:plan   from=game:bingo to=null
  84386 tv    ss:cancel    speaking=false pending=false
  84386 tv    music:plan   from=null to=lobby
  84386 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  85187 tv    music:stop   track=wallpaper.mp3
  86904 tv    ss:cancel    speaking=false pending=false
  86909 tv    music:plan   from=lobby to=game:bingo
  86909 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86909 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86914 tv    hush
  86915 tv    hush
  87527 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  87527 tv    speak        text=i21.wav voice=clip delayMs=190
  87527 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  87557 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  87557 tv    speak        text=n32.wav voice=clip delayMs=190
  87652 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  87652 tv    speak        text=i18.wav voice=clip delayMs=190
  87710 tv    music:stop   track=local-forecast-elevator.mp3
  87732 tv    clip         src=n40.wav muted=false ready=true delayMs=190
  87732 tv    speak        text=n40.wav voice=clip delayMs=190
  87825 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  87825 tv    speak        text=i30.wav voice=clip delayMs=190
  87920 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  87920 tv    speak        text=o69.wav voice=clip delayMs=190
  88016 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  88016 tv    speak        text=o61.wav voice=clip delayMs=190
  88116 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  88116 tv    speak        text=n34.wav voice=clip delayMs=190
  88205 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  88205 tv    speak        text=n35.wav voice=clip delayMs=190
  88300 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  88300 tv    speak        text=o67.wav voice=clip delayMs=190
  88393 tv    clip         src=g55.wav muted=false ready=true delayMs=190
  88393 tv    speak        text=g55.wav voice=clip delayMs=190
  88492 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  88492 tv    speak        text=i26.wav voice=clip delayMs=190
  88583 tv    clip         src=i22.wav muted=false ready=true delayMs=190
  88583 tv    speak        text=i22.wav voice=clip delayMs=190
  88666 tv    clip         src=i29.wav muted=false ready=true delayMs=190
  88666 tv    speak        text=i29.wav voice=clip delayMs=190
  88756 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  88756 tv    speak        text=o66.wav voice=clip delayMs=190
  88849 tv    clip         src=g51.wav muted=false ready=true delayMs=190
  88849 tv    speak        text=g51.wav voice=clip delayMs=190
  88949 tv    clip         src=g53.wav muted=false ready=true delayMs=190
  88949 tv    speak        text=g53.wav voice=clip delayMs=190
  89037 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  89037 tv    speak        text=b9.wav voice=clip delayMs=190
  89133 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  89133 tv    speak        text=n36.wav voice=clip delayMs=190
  89228 tv    clip         src=g52.wav muted=false ready=true delayMs=190
  89228 tv    speak        text=g52.wav voice=clip delayMs=190
  89333 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  89333 tv    speak        text=b1.wav voice=clip delayMs=190
  89430 tv    clip         src=b13.wav muted=false ready=true delayMs=190
  89430 tv    speak        text=b13.wav voice=clip delayMs=190
  89527 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  89527 tv    speak        text=n37.wav voice=clip delayMs=190
  89617 tv    clip         src=o71.wav muted=false ready=true delayMs=190
  89617 tv    speak        text=o71.wav voice=clip delayMs=190
  89694 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  89694 tv    speak        text=b8.wav voice=clip delayMs=190
  89788 tv    clip         src=b5.wav muted=false ready=true delayMs=190
  89788 tv    speak        text=b5.wav voice=clip delayMs=190
  89886 tv    clip         src=b7.wav muted=false ready=true delayMs=190
  89886 tv    speak        text=b7.wav voice=clip delayMs=190
  89979 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  89979 tv    speak        text=n42.wav voice=clip delayMs=190
  90072 tv    clip         src=i28.wav muted=false ready=true delayMs=190
  90072 tv    speak        text=i28.wav voice=clip delayMs=190
  90152 tv    clip         src=i27.wav muted=false ready=true delayMs=190
  90152 tv    speak        text=i27.wav voice=clip delayMs=190
  90231 tv    clip         src=o63.wav muted=false ready=true delayMs=190
  90231 tv    speak        text=o63.wav voice=clip delayMs=190
  90329 tv    clip         src=o64.wav muted=false ready=true delayMs=190
  90329 tv    speak        text=o64.wav voice=clip delayMs=190
  90417 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  90417 tv    speak        text=o73.wav voice=clip delayMs=190
  90538 tv    clip         src=g50.wav muted=false ready=true delayMs=190
  90538 tv    speak        text=g50.wav voice=clip delayMs=190
  90606 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  90606 tv    speak        text=g48.wav voice=clip delayMs=190
  90702 tv    clip         src=b12.wav muted=false ready=true delayMs=190
  90702 tv    speak        text=b12.wav voice=clip delayMs=190
  90777 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  90777 tv    speak        text=n45.wav voice=clip delayMs=190
  90875 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  90875 tv    speak        text=b4.wav voice=clip delayMs=190
  90969 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  90969 tv    speak        text=g46.wav voice=clip delayMs=190
  91066 tv    clip         src=o74.wav muted=false ready=true delayMs=190
  91066 tv    speak        text=o74.wav voice=clip delayMs=190
  91163 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  91163 tv    speak        text=g47.wav voice=clip delayMs=190
  91252 tv    clip         src=n31.wav muted=false ready=true delayMs=190
  91252 tv    speak        text=n31.wav voice=clip delayMs=190
  91346 tv    clip         src=o62.wav muted=false ready=true delayMs=190
  91346 tv    speak        text=o62.wav voice=clip delayMs=190
  91437 tv    clip         src=b10.wav muted=false ready=true delayMs=190
  91437 tv    speak        text=b10.wav voice=clip delayMs=190
  91532 tv    clip         src=g60.wav muted=false ready=true delayMs=190
  91532 tv    speak        text=g60.wav voice=clip delayMs=190
  91615 tv    clip         src=n38.wav muted=false ready=true delayMs=190
  91615 tv    speak        text=n38.wav voice=clip delayMs=190
  91704 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  91704 tv    speak        text=n39.wav voice=clip delayMs=190
  91817 tv    clip         src=o70.wav muted=false ready=true delayMs=190
  91817 tv    speak        text=o70.wav voice=clip delayMs=190
  91906 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  91906 tv    speak        text=b11.wav voice=clip delayMs=190
  92001 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  92001 tv    speak        text=o75.wav voice=clip delayMs=190
  92097 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  92097 tv    speak        text=g58.wav voice=clip delayMs=190
  92192 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  92192 tv    speak        text=b15.wav voice=clip delayMs=190
  92286 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  92286 tv    speak        text=i24.wav voice=clip delayMs=190
  92380 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  92380 tv    speak        text=o72.wav voice=clip delayMs=190
  92472 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  92472 tv    speak        text=g56.wav voice=clip delayMs=190
  92566 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  92566 tv    speak        text=i20.wav voice=clip delayMs=190
  92665 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  92665 tv    speak        text=n44.wav voice=clip delayMs=190
  92753 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  92753 tv    speak        text=b3.wav voice=clip delayMs=190
  92847 tv    clip         src=o68.wav muted=false ready=true delayMs=190
  92847 tv    speak        text=o68.wav voice=clip delayMs=190
  92941 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  92941 tv    speak        text=b2.wav voice=clip delayMs=190
  93035 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  93035 tv    speak        text=n41.wav voice=clip delayMs=190
  93148 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  93148 tv    speak        text=o65.wav voice=clip delayMs=190
  93238 tv    clip         src=i17.wav muted=false ready=true delayMs=190
  93238 tv    speak        text=i17.wav voice=clip delayMs=190
  93331 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  93331 tv    speak        text=i25.wav voice=clip delayMs=190
  93430 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  93430 tv    speak        text=i19.wav voice=clip delayMs=190
  93519 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  93519 tv    speak        text=g57.wav voice=clip delayMs=190
  93615 tv    clip         src=g59.wav muted=false ready=true delayMs=190
  93615 tv    speak        text=g59.wav voice=clip delayMs=190
  93707 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  93707 tv    speak        text=g49.wav voice=clip delayMs=190
  93800 tv    clip         src=n43.wav muted=false ready=true delayMs=190
  93800 tv    speak        text=n43.wav voice=clip delayMs=190
  93894 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  93894 tv    speak        text=i16.wav voice=clip delayMs=190
  93986 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  93986 tv    speak        text=n33.wav voice=clip delayMs=190
  94080 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  94080 tv    speak        text=i23.wav voice=clip delayMs=190
  94175 tv    clip         src=g54.wav muted=false ready=true delayMs=190
  94175 tv    speak        text=g54.wav voice=clip delayMs=190
  94270 tv    clip         src=b14.wav muted=false ready=true delayMs=190
  94270 tv    speak        text=b14.wav voice=clip delayMs=190
  94460 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  95487 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95753 tv    hush
  95753 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95754 tv    hush
 103358 tv    music:duck   ms=9000
 103358 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108387 tv    hush
 108387 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108387 tv    hush
 112383 tv    ss:cancel    speaking=false pending=false
 112383 tv    music:plan   from=game:bingo to=null
 112383 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113883 tv    music:stop   track=wallpaper.mp3
 113983 tv    ss:cancel    speaking=false pending=false
 113983 tv    music:plan   from=null to=lobby
 113983 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 116493 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 116524 tv    ss:cancel    speaking=false pending=false
 116526 tv    music:plan   from=lobby to=game:bingo
 116526 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116526 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116529 tv    hush
 116529 tv    hush
 117141 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117326 tv    music:stop   track=airport-lounge.mp3
 118544 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 118652 tv    ss:cancel    speaking=false pending=false
 118652 tv    music:plan   from=game:bingo to=null
 118652 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 120153 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 120783 tv    ss:cancel    speaking=false pending=false
 120783 tv    music:plan   from=null to=lobby
 120783 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 124138 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 124148 tv    ss:cancel    speaking=false pending=false
 124149 tv    music:plan   from=lobby to=game:bingo
 124149 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 124149 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 124153 tv    hush
 124153 tv    hush
 124577 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 124577 tv    speak        text=i21.wav voice=clip delayMs=190
 124577 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 124769 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124950 tv    music:stop   track=local-forecast-elevator.mp3
 125083 tv    ss:cancel    speaking=false pending=false
 125083 tv    music:plan   from=game:bingo to=null
 125086 tv    ss:cancel    speaking=false pending=false
 125086 tv    music:plan   from=null to=lobby
 125086 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 125887 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"airport-lounge.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 130671 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131104 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131521 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131952 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132368 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 133418 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 134007 tv    ss:cancel    speaking=false pending=false
 134012 tv    music:plan   from=lobby to=null
 134012 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 135265 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135514 tv    music:stop   track=airport-lounge.mp3
 136871 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 138169 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 139471 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140512 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141576 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144139 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144324 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144511 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144705 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 145797 tv    ss:cancel    speaking=false pending=false
 145799 tv    ss:cancel    speaking=false pending=false
 145799 tv    music:plan   from=null to=lobby
 145799 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 147820 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 147828 tv    ss:cancel    speaking=false pending=false
 147836 tv    music:plan   from=lobby to=null
 147836 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149337 tv    music:stop   track=bossa-antigua.mp3
 149394 tv    music:plan   from=null to=game:broken-pencil
 149394 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 149394 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150868 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151327 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151484 tv    music:plan   from=game:broken-pencil to=null
 151484 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 152986 tv    music:stop   track=hep-cats.mp3
```
