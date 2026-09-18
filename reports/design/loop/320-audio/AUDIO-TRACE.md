# Audio interaction trace

Captured 2026-09-18T18:09:20.459Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**54 / 54 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.4}]

```
   1728 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1754 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3066 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3202 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3904 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4533 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5403 tv    ss:cancel    speaking=false pending=false
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
   6252 tv    music:plan   from=lobby to=null
   6252 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7759 tv    music:stop   track=airport-lounge.mp3
   8208 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9489 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16461 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17459 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18459 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19460 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20460 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21259 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22054 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22207 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22364 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22521 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22677 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22838 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22993 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23149 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23306 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23464 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23621 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23776 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23932 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24090 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24244 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24401 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24557 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24698 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24857 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25737 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26061 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27875 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29605 tv    ss:cancel    speaking=false pending=false
  29605 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":1.5}]

```
  31164 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33313 tv    ss:cancel    speaking=false pending=false
  33313 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34849 tv    ss:cancel    speaking=false pending=false
  34849 tv    music:plan   from=null to=lobby
  34849 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:george-street-shuffle.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+954ms phone@+970ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,silence,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,silence,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer,silence cheer@+5359ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5415ms cheer@+5371ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=3 lastTickIdx=2
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36406 tv    music:plan   from=lobby to=game:bingo
  36406 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36406 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36709 tv    hush
  36710 tv    hush
  37208 tv    music:stop   track=george-street-shuffle.mp3
  37321 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38413 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39412 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40411 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41417 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  41417 tv    speak        text=b9.wav voice=clip delayMs=190
  41418 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41610 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43063 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  43063 tv    speak        text=b8.wav voice=clip delayMs=190
  43254 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44894 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  44894 tv    speak        text=n34.wav voice=clip delayMs=190
  45085 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46766 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47036 tv    hush
  47037 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47037 tv    hush
  52388 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  52393 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55388 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56390 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57389 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58387 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  58387 tv    speak        text=n35.wav voice=clip delayMs=190
  58578 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60182 tv    music:paused paused=true
  60182 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61433 tv    music:paused paused=false
  61433 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62742 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  62742 tv    speak        text=i25.wav voice=clip delayMs=190
  62855 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  62855 tv    speak        text=n45.wav voice=clip delayMs=190
  62980 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  62980 tv    speak        text=n33.wav voice=clip delayMs=190
  63105 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  63105 tv    speak        text=g49.wav voice=clip delayMs=190
  63231 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  63231 tv    speak        text=b4.wav voice=clip delayMs=190
  63339 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  63339 tv    speak        text=i20.wav voice=clip delayMs=190
  63462 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  63462 tv    speak        text=o69.wav voice=clip delayMs=190
  63589 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  63589 tv    speak        text=o67.wav voice=clip delayMs=190
  63713 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  63713 tv    speak        text=o65.wav voice=clip delayMs=190
  63841 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  63841 tv    speak        text=o73.wav voice=clip delayMs=190
  63965 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  63965 tv    speak        text=i21.wav voice=clip delayMs=190
  64090 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  64090 tv    speak        text=i18.wav voice=clip delayMs=190
  64216 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  64216 tv    speak        text=g58.wav voice=clip delayMs=190
  64343 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  64343 tv    speak        text=n36.wav voice=clip delayMs=190
  64468 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  64468 tv    speak        text=o61.wav voice=clip delayMs=190
  64591 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  64591 tv    speak        text=n37.wav voice=clip delayMs=190
  64704 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  64704 tv    speak        text=i16.wav voice=clip delayMs=190
  64830 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  64830 tv    speak        text=g47.wav voice=clip delayMs=190
  64956 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  64956 tv    speak        text=n41.wav voice=clip delayMs=190
  65081 tv    clip         src=b6.wav muted=false ready=true delayMs=190
  65081 tv    speak        text=b6.wav voice=clip delayMs=190
  65207 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  65207 tv    speak        text=o72.wav voice=clip delayMs=190
  65331 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  65331 tv    speak        text=b3.wav voice=clip delayMs=190
  65456 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  65456 tv    speak        text=i30.wav voice=clip delayMs=190
  65588 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  65588 tv    speak        text=g56.wav voice=clip delayMs=190
  65708 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  65708 tv    speak        text=o75.wav voice=clip delayMs=190
  65832 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  65832 tv    speak        text=b1.wav voice=clip delayMs=190
  65959 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  65959 tv    speak        text=b2.wav voice=clip delayMs=190
  66089 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  66089 tv    speak        text=n32.wav voice=clip delayMs=190
  66213 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  66213 tv    speak        text=g48.wav voice=clip delayMs=190
  66337 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  66337 tv    speak        text=i23.wav voice=clip delayMs=190
  66459 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  66459 tv    speak        text=i26.wav voice=clip delayMs=190
  66586 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  66586 tv    speak        text=o66.wav voice=clip delayMs=190
  66696 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  66696 tv    speak        text=i19.wav voice=clip delayMs=190
  66822 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  66822 tv    speak        text=n42.wav voice=clip delayMs=190
  66947 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  66947 tv    speak        text=i24.wav voice=clip delayMs=190
  67075 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  67075 tv    speak        text=n39.wav voice=clip delayMs=190
  67198 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  67198 tv    speak        text=g46.wav voice=clip delayMs=190
  67323 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  67323 tv    speak        text=n44.wav voice=clip delayMs=190
  67447 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  67447 tv    speak        text=b15.wav voice=clip delayMs=190
  67575 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  67575 tv    speak        text=b11.wav voice=clip delayMs=190
  67697 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  67697 tv    speak        text=g57.wav voice=clip delayMs=190
  67888 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  68315 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68601 tv    hush
  68601 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68601 tv    hush
  70475 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73960 tv    music:duck   ms=9000
  73960 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  74011 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  78770 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79094 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80096 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81097 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82092 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  82092 tv    speak        text=g57.wav voice=clip delayMs=190
  82284 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84408 tv    ss:cancel    speaking=false pending=false
  84408 tv    music:plan   from=game:bingo to=null
  84410 tv    ss:cancel    speaking=false pending=false
  84410 tv    music:plan   from=null to=lobby
  84410 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  85211 tv    music:stop   track=wallpaper.mp3
  86939 tv    ss:cancel    speaking=false pending=false
  86948 tv    music:plan   from=lobby to=game:bingo
  86948 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86948 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86951 tv    hush
  86952 tv    hush
  87558 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  87558 tv    speak        text=i21.wav voice=clip delayMs=190
  87558 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  87565 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  87565 tv    speak        text=n32.wav voice=clip delayMs=190
  87673 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  87673 tv    speak        text=i18.wav voice=clip delayMs=190
  87749 tv    music:stop   track=local-forecast-elevator.mp3
  87757 tv    clip         src=n40.wav muted=false ready=true delayMs=190
  87757 tv    speak        text=n40.wav voice=clip delayMs=190
  87858 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  87858 tv    speak        text=i30.wav voice=clip delayMs=190
  87950 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  87950 tv    speak        text=o69.wav voice=clip delayMs=190
  88045 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  88045 tv    speak        text=o61.wav voice=clip delayMs=190
  88140 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  88140 tv    speak        text=n34.wav voice=clip delayMs=190
  88220 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  88220 tv    speak        text=n35.wav voice=clip delayMs=190
  88315 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  88315 tv    speak        text=o67.wav voice=clip delayMs=190
  88390 tv    clip         src=g55.wav muted=false ready=true delayMs=190
  88390 tv    speak        text=g55.wav voice=clip delayMs=190
  88486 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  88486 tv    speak        text=i26.wav voice=clip delayMs=190
  88593 tv    clip         src=i22.wav muted=false ready=true delayMs=190
  88593 tv    speak        text=i22.wav voice=clip delayMs=190
  88692 tv    clip         src=i29.wav muted=false ready=true delayMs=190
  88692 tv    speak        text=i29.wav voice=clip delayMs=190
  88784 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  88784 tv    speak        text=o66.wav voice=clip delayMs=190
  88861 tv    clip         src=g51.wav muted=false ready=true delayMs=190
  88861 tv    speak        text=g51.wav voice=clip delayMs=190
  88955 tv    clip         src=g53.wav muted=false ready=true delayMs=190
  88955 tv    speak        text=g53.wav voice=clip delayMs=190
  89050 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  89050 tv    speak        text=b9.wav voice=clip delayMs=190
  89144 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  89144 tv    speak        text=n36.wav voice=clip delayMs=190
  89240 tv    clip         src=g52.wav muted=false ready=true delayMs=190
  89240 tv    speak        text=g52.wav voice=clip delayMs=190
  89338 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  89338 tv    speak        text=b1.wav voice=clip delayMs=190
  89427 tv    clip         src=b13.wav muted=false ready=true delayMs=190
  89427 tv    speak        text=b13.wav voice=clip delayMs=190
  89526 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  89526 tv    speak        text=n37.wav voice=clip delayMs=190
  89622 tv    clip         src=o71.wav muted=false ready=true delayMs=190
  89622 tv    speak        text=o71.wav voice=clip delayMs=190
  89725 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  89725 tv    speak        text=b8.wav voice=clip delayMs=190
  89819 tv    clip         src=b5.wav muted=false ready=true delayMs=190
  89819 tv    speak        text=b5.wav voice=clip delayMs=190
  89903 tv    clip         src=b7.wav muted=false ready=true delayMs=190
  89903 tv    speak        text=b7.wav voice=clip delayMs=190
  89993 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  89993 tv    speak        text=n42.wav voice=clip delayMs=190
  90102 tv    clip         src=i28.wav muted=false ready=true delayMs=190
  90102 tv    speak        text=i28.wav voice=clip delayMs=190
  90200 tv    clip         src=i27.wav muted=false ready=true delayMs=190
  90200 tv    speak        text=i27.wav voice=clip delayMs=190
  90293 tv    clip         src=o63.wav muted=false ready=true delayMs=190
  90293 tv    speak        text=o63.wav voice=clip delayMs=190
  90384 tv    clip         src=o64.wav muted=false ready=true delayMs=190
  90384 tv    speak        text=o64.wav voice=clip delayMs=190
  90478 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  90478 tv    speak        text=o73.wav voice=clip delayMs=190
  90571 tv    clip         src=g50.wav muted=false ready=true delayMs=190
  90571 tv    speak        text=g50.wav voice=clip delayMs=190
  90651 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  90651 tv    speak        text=g48.wav voice=clip delayMs=190
  90729 tv    clip         src=b12.wav muted=false ready=true delayMs=190
  90729 tv    speak        text=b12.wav voice=clip delayMs=190
  90825 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  90825 tv    speak        text=n45.wav voice=clip delayMs=190
  90919 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  90919 tv    speak        text=b4.wav voice=clip delayMs=190
  91011 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  91011 tv    speak        text=g46.wav voice=clip delayMs=190
  91107 tv    clip         src=o74.wav muted=false ready=true delayMs=190
  91107 tv    speak        text=o74.wav voice=clip delayMs=190
  91201 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  91201 tv    speak        text=g47.wav voice=clip delayMs=190
  91294 tv    clip         src=n31.wav muted=false ready=true delayMs=190
  91294 tv    speak        text=n31.wav voice=clip delayMs=190
  91389 tv    clip         src=o62.wav muted=false ready=true delayMs=190
  91389 tv    speak        text=o62.wav voice=clip delayMs=190
  91483 tv    clip         src=b10.wav muted=false ready=true delayMs=190
  91483 tv    speak        text=b10.wav voice=clip delayMs=190
  91580 tv    clip         src=g60.wav muted=false ready=true delayMs=190
  91580 tv    speak        text=g60.wav voice=clip delayMs=190
  91679 tv    clip         src=n38.wav muted=false ready=true delayMs=190
  91679 tv    speak        text=n38.wav voice=clip delayMs=190
  91779 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  91779 tv    speak        text=n39.wav voice=clip delayMs=190
  91861 tv    clip         src=o70.wav muted=false ready=true delayMs=190
  91861 tv    speak        text=o70.wav voice=clip delayMs=190
  91953 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  91953 tv    speak        text=b11.wav voice=clip delayMs=190
  92032 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  92032 tv    speak        text=o75.wav voice=clip delayMs=190
  92112 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  92112 tv    speak        text=g58.wav voice=clip delayMs=190
  92211 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  92211 tv    speak        text=b15.wav voice=clip delayMs=190
  92304 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  92304 tv    speak        text=i24.wav voice=clip delayMs=190
  92396 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  92396 tv    speak        text=o72.wav voice=clip delayMs=190
  92494 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  92494 tv    speak        text=g56.wav voice=clip delayMs=190
  92585 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  92585 tv    speak        text=i20.wav voice=clip delayMs=190
  92678 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  92678 tv    speak        text=n44.wav voice=clip delayMs=190
  92789 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  92789 tv    speak        text=b3.wav voice=clip delayMs=190
  92881 tv    clip         src=o68.wav muted=false ready=true delayMs=190
  92881 tv    speak        text=o68.wav voice=clip delayMs=190
  92973 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  92973 tv    speak        text=b2.wav voice=clip delayMs=190
  93070 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  93070 tv    speak        text=n41.wav voice=clip delayMs=190
  93160 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  93160 tv    speak        text=o65.wav voice=clip delayMs=190
  93253 tv    clip         src=i17.wav muted=false ready=true delayMs=190
  93253 tv    speak        text=i17.wav voice=clip delayMs=190
  93349 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  93349 tv    speak        text=i25.wav voice=clip delayMs=190
  93443 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  93443 tv    speak        text=i19.wav voice=clip delayMs=190
  93537 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  93537 tv    speak        text=g57.wav voice=clip delayMs=190
  93636 tv    clip         src=g59.wav muted=false ready=true delayMs=190
  93636 tv    speak        text=g59.wav voice=clip delayMs=190
  93725 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  93725 tv    speak        text=g49.wav voice=clip delayMs=190
  93823 tv    clip         src=n43.wav muted=false ready=true delayMs=190
  93823 tv    speak        text=n43.wav voice=clip delayMs=190
  93917 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  93917 tv    speak        text=i16.wav voice=clip delayMs=190
  94008 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  94008 tv    speak        text=n33.wav voice=clip delayMs=190
  94107 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  94107 tv    speak        text=i23.wav voice=clip delayMs=190
  94198 tv    clip         src=g54.wav muted=false ready=true delayMs=190
  94198 tv    speak        text=g54.wav voice=clip delayMs=190
  94279 tv    clip         src=b14.wav muted=false ready=true delayMs=190
  94279 tv    speak        text=b14.wav voice=clip delayMs=190
  94471 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  95546 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95814 tv    hush
  95814 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95814 tv    hush
 103418 tv    music:duck   ms=9000
 103418 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108449 tv    hush
 108449 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108449 tv    hush
 112447 tv    ss:cancel    speaking=false pending=false
 112447 tv    music:plan   from=game:bingo to=null
 112447 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113949 tv    music:stop   track=wallpaper.mp3
 114007 tv    ss:cancel    speaking=false pending=false
 114007 tv    music:plan   from=null to=lobby
 114007 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 116530 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 116538 tv    ss:cancel    speaking=false pending=false
 116540 tv    music:plan   from=lobby to=game:bingo
 116540 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116540 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116544 tv    hush
 116544 tv    hush
 117154 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117341 tv    music:stop   track=george-street-shuffle.mp3
 118546 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 118660 tv    ss:cancel    speaking=false pending=false
 118660 tv    music:plan   from=game:bingo to=null
 118660 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 120161 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 120774 tv    ss:cancel    speaking=false pending=false
 120774 tv    music:plan   from=null to=lobby
 120774 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 124110 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 124123 tv    ss:cancel    speaking=false pending=false
 124125 tv    music:plan   from=lobby to=game:bingo
 124125 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 124125 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 124128 tv    hush
 124129 tv    hush
 124552 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 124552 tv    speak        text=i21.wav voice=clip delayMs=190
 124553 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 124744 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124925 tv    music:stop   track=bossa-antigua.mp3
 125059 tv    ss:cancel    speaking=false pending=false
 125059 tv    music:plan   from=game:bingo to=null
 125062 tv    ss:cancel    speaking=false pending=false
 125062 tv    music:plan   from=null to=lobby
 125062 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 125865 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"airport-lounge.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 130628 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131059 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131478 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 131909 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 132329 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 133377 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 133977 tv    ss:cancel    speaking=false pending=false
 133982 tv    music:plan   from=lobby to=null
 133982 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 135240 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 135483 tv    music:stop   track=airport-lounge.mp3
 136845 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 138145 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 139445 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 140485 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 141539 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144100 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144289 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 144477 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 144665 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 145756 tv    ss:cancel    speaking=false pending=false
 145758 tv    ss:cancel    speaking=false pending=false
 145758 tv    music:plan   from=null to=lobby
 145758 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 147777 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 147783 tv    ss:cancel    speaking=false pending=false
 147784 tv    music:plan   from=lobby to=null
 147784 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149286 tv    music:stop   track=bossa-antigua.mp3
 149322 tv    music:plan   from=null to=game:broken-pencil
 149322 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 149322 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 150790 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151223 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 151380 tv    music:plan   from=game:broken-pencil to=null
 151380 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 152881 tv    music:stop   track=backbay-lounge.mp3
```
