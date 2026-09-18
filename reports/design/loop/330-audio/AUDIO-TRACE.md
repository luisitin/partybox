# Audio interaction trace

Captured 2026-09-18T20:29:49.985Z on port 42166. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**56 / 56 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:bossa-antigua
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":4.4}]

```
   1774 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   1799 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3112 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3247 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3946 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4563 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5421 tv    ss:cancel    speaking=false pending=false
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
   6266 tv    music:plan   from=lobby to=null
   6266 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7770 tv    music:stop   track=bossa-antigua.mp3
   8209 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9499 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16470 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17470 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18470 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19464 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20467 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21275 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22072 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22227 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22382 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22539 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22697 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22853 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23012 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23170 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23325 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23483 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23642 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23797 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23953 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24095 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24252 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24410 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24567 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24722 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24881 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25747 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26077 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27888 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29608 tv    ss:cancel    speaking=false pending=false
  29608 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31158 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33296 tv    ss:cancel    speaking=false pending=false
  33297 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34843 tv    ss:cancel    speaking=false pending=false
  34843 tv    music:plan   from=null to=lobby
  34843 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":3}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+941ms phone@+943ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18.1}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":24.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5359ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5404ms cheer@+5370ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36385 tv    music:plan   from=lobby to=game:bingo
  36385 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36385 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36688 tv    hush
  36689 tv    hush
  37185 tv    music:stop   track=airport-lounge.mp3
  37301 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38390 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39390 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40390 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41396 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  41397 tv    speak        text=b9.wav voice=clip delayMs=190
  41397 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  41589 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43035 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  43035 tv    speak        text=b8.wav voice=clip delayMs=190
  43226 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44867 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  44867 tv    speak        text=n34.wav voice=clip delayMs=190
  45059 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46745 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47001 tv    hush
  47001 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47001 tv    hush
  52354 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55367 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56369 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57368 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58367 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  58367 tv    speak        text=n35.wav voice=clip delayMs=190
  58559 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60111 tv    music:paused paused=true
  60112 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61346 tv    music:paused paused=false
  61346 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62625 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  62625 tv    speak        text=i25.wav voice=clip delayMs=190
  62749 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  62749 tv    speak        text=n45.wav voice=clip delayMs=190
  62875 tv    clip         src=n33.wav muted=false ready=true delayMs=190
  62875 tv    speak        text=n33.wav voice=clip delayMs=190
  63002 tv    clip         src=g49.wav muted=false ready=true delayMs=190
  63002 tv    speak        text=g49.wav voice=clip delayMs=190
  63128 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  63128 tv    speak        text=b4.wav voice=clip delayMs=190
  63242 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  63242 tv    speak        text=i20.wav voice=clip delayMs=190
  63351 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  63351 tv    speak        text=o69.wav voice=clip delayMs=190
  63477 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  63477 tv    speak        text=o67.wav voice=clip delayMs=190
  63602 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  63602 tv    speak        text=o65.wav voice=clip delayMs=190
  63731 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  63731 tv    speak        text=o73.wav voice=clip delayMs=190
  63856 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  63856 tv    speak        text=i21.wav voice=clip delayMs=190
  63983 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  63983 tv    speak        text=i18.wav voice=clip delayMs=190
  64111 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  64111 tv    speak        text=g58.wav voice=clip delayMs=190
  64236 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  64236 tv    speak        text=n36.wav voice=clip delayMs=190
  64362 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  64362 tv    speak        text=o61.wav voice=clip delayMs=190
  64488 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  64488 tv    speak        text=n37.wav voice=clip delayMs=190
  64614 tv    clip         src=i16.wav muted=false ready=true delayMs=190
  64614 tv    speak        text=i16.wav voice=clip delayMs=190
  64743 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  64743 tv    speak        text=g47.wav voice=clip delayMs=190
  64868 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  64868 tv    speak        text=n41.wav voice=clip delayMs=190
  64994 tv    clip         src=b6.wav muted=false ready=true delayMs=190
  64994 tv    speak        text=b6.wav voice=clip delayMs=190
  65121 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  65121 tv    speak        text=o72.wav voice=clip delayMs=190
  65247 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  65247 tv    speak        text=b3.wav voice=clip delayMs=190
  65374 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  65374 tv    speak        text=i30.wav voice=clip delayMs=190
  65499 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  65499 tv    speak        text=g56.wav voice=clip delayMs=190
  65626 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  65626 tv    speak        text=o75.wav voice=clip delayMs=190
  65750 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  65750 tv    speak        text=b1.wav voice=clip delayMs=190
  65877 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  65877 tv    speak        text=b2.wav voice=clip delayMs=190
  66002 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  66002 tv    speak        text=n32.wav voice=clip delayMs=190
  66129 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  66129 tv    speak        text=g48.wav voice=clip delayMs=190
  66240 tv    clip         src=i23.wav muted=false ready=true delayMs=190
  66240 tv    speak        text=i23.wav voice=clip delayMs=190
  66365 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  66365 tv    speak        text=i26.wav voice=clip delayMs=190
  66490 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  66490 tv    speak        text=o66.wav voice=clip delayMs=190
  66617 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  66617 tv    speak        text=i19.wav voice=clip delayMs=190
  66742 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  66742 tv    speak        text=n42.wav voice=clip delayMs=190
  66867 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  66867 tv    speak        text=i24.wav voice=clip delayMs=190
  66978 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  66978 tv    speak        text=n39.wav voice=clip delayMs=190
  67105 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  67105 tv    speak        text=g46.wav voice=clip delayMs=190
  67230 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  67230 tv    speak        text=n44.wav voice=clip delayMs=190
  67358 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  67358 tv    speak        text=b15.wav voice=clip delayMs=190
  67483 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  67483 tv    speak        text=b11.wav voice=clip delayMs=190
  67610 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  67610 tv    speak        text=g57.wav voice=clip delayMs=190
  67800 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  68227 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68515 tv    hush
  68515 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68515 tv    hush
  70387 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73874 tv    music:duck   ms=9000
  73874 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  78683 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  78998 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  79999 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81000 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81996 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  81996 tv    speak        text=g57.wav voice=clip delayMs=190
  82187 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84303 tv    ss:cancel    speaking=false pending=false
  84303 tv    music:plan   from=game:bingo to=null
  84306 tv    ss:cancel    speaking=false pending=false
  84306 tv    music:plan   from=null to=lobby
  84306 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  85107 tv    music:stop   track=wallpaper.mp3
  86828 tv    ss:cancel    speaking=false pending=false
  86837 tv    music:plan   from=lobby to=game:bingo
  86837 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86837 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86841 tv    hush
  86841 tv    hush
  87452 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  87458 tv    clip         src=i21.wav muted=false ready=true delayMs=190
  87458 tv    speak        text=i21.wav voice=clip delayMs=190
  87473 tv    clip         src=n32.wav muted=false ready=true delayMs=190
  87473 tv    speak        text=n32.wav voice=clip delayMs=190
  87568 tv    clip         src=i18.wav muted=false ready=true delayMs=190
  87568 tv    speak        text=i18.wav voice=clip delayMs=190
  87638 tv    music:stop   track=bossa-antigua.mp3
  87647 tv    clip         src=n40.wav muted=false ready=true delayMs=190
  87647 tv    speak        text=n40.wav voice=clip delayMs=190
  87745 tv    clip         src=i30.wav muted=false ready=true delayMs=190
  87745 tv    speak        text=i30.wav voice=clip delayMs=190
  87835 tv    clip         src=o69.wav muted=false ready=true delayMs=190
  87835 tv    speak        text=o69.wav voice=clip delayMs=190
  87929 tv    clip         src=o61.wav muted=false ready=true delayMs=190
  87929 tv    speak        text=o61.wav voice=clip delayMs=190
  88023 tv    clip         src=n34.wav muted=false ready=true delayMs=190
  88023 tv    speak        text=n34.wav voice=clip delayMs=190
  88117 tv    clip         src=n35.wav muted=false ready=true delayMs=190
  88117 tv    speak        text=n35.wav voice=clip delayMs=190
  88225 tv    clip         src=o67.wav muted=false ready=true delayMs=190
  88225 tv    speak        text=o67.wav voice=clip delayMs=190
  88319 tv    clip         src=g55.wav muted=false ready=true delayMs=190
  88319 tv    speak        text=g55.wav voice=clip delayMs=190
  88414 tv    clip         src=i26.wav muted=false ready=true delayMs=190
  88414 tv    speak        text=i26.wav voice=clip delayMs=190
  88508 tv    clip         src=i22.wav muted=false ready=true delayMs=190
  88508 tv    speak        text=i22.wav voice=clip delayMs=190
  88602 tv    clip         src=i29.wav muted=false ready=true delayMs=190
  88602 tv    speak        text=i29.wav voice=clip delayMs=190
  88696 tv    clip         src=o66.wav muted=false ready=true delayMs=190
  88696 tv    speak        text=o66.wav voice=clip delayMs=190
  88790 tv    clip         src=g51.wav muted=false ready=true delayMs=190
  88790 tv    speak        text=g51.wav voice=clip delayMs=190
  88884 tv    clip         src=g53.wav muted=false ready=true delayMs=190
  88884 tv    speak        text=g53.wav voice=clip delayMs=190
  88980 tv    clip         src=b9.wav muted=false ready=true delayMs=190
  88980 tv    speak        text=b9.wav voice=clip delayMs=190
  89074 tv    clip         src=n36.wav muted=false ready=true delayMs=190
  89074 tv    speak        text=n36.wav voice=clip delayMs=190
  89154 tv    clip         src=g52.wav muted=false ready=true delayMs=190
  89154 tv    speak        text=g52.wav voice=clip delayMs=190
  89262 tv    clip         src=b1.wav muted=false ready=true delayMs=190
  89262 tv    speak        text=b1.wav voice=clip delayMs=190
  89357 tv    clip         src=b13.wav muted=false ready=true delayMs=190
  89357 tv    speak        text=b13.wav voice=clip delayMs=190
  89451 tv    clip         src=n37.wav muted=false ready=true delayMs=190
  89451 tv    speak        text=n37.wav voice=clip delayMs=190
  89546 tv    clip         src=o71.wav muted=false ready=true delayMs=190
  89546 tv    speak        text=o71.wav voice=clip delayMs=190
  89624 tv    clip         src=b8.wav muted=false ready=true delayMs=190
  89624 tv    speak        text=b8.wav voice=clip delayMs=190
  89719 tv    clip         src=b5.wav muted=false ready=true delayMs=190
  89719 tv    speak        text=b5.wav voice=clip delayMs=190
  89814 tv    clip         src=b7.wav muted=false ready=true delayMs=190
  89814 tv    speak        text=b7.wav voice=clip delayMs=190
  89909 tv    clip         src=n42.wav muted=false ready=true delayMs=190
  89909 tv    speak        text=n42.wav voice=clip delayMs=190
  90003 tv    clip         src=i28.wav muted=false ready=true delayMs=190
  90003 tv    speak        text=i28.wav voice=clip delayMs=190
  90098 tv    clip         src=i27.wav muted=false ready=true delayMs=190
  90098 tv    speak        text=i27.wav voice=clip delayMs=190
  90194 tv    clip         src=o63.wav muted=false ready=true delayMs=190
  90194 tv    speak        text=o63.wav voice=clip delayMs=190
  90288 tv    clip         src=o64.wav muted=false ready=true delayMs=190
  90288 tv    speak        text=o64.wav voice=clip delayMs=190
  90383 tv    clip         src=o73.wav muted=false ready=true delayMs=190
  90383 tv    speak        text=o73.wav voice=clip delayMs=190
  90475 tv    clip         src=g50.wav muted=false ready=true delayMs=190
  90475 tv    speak        text=g50.wav voice=clip delayMs=190
  90555 tv    clip         src=g48.wav muted=false ready=true delayMs=190
  90555 tv    speak        text=g48.wav voice=clip delayMs=190
  90649 tv    clip         src=b12.wav muted=false ready=true delayMs=190
  90649 tv    speak        text=b12.wav voice=clip delayMs=190
  90743 tv    clip         src=n45.wav muted=false ready=true delayMs=190
  90743 tv    speak        text=n45.wav voice=clip delayMs=190
  90837 tv    clip         src=b4.wav muted=false ready=true delayMs=190
  90837 tv    speak        text=b4.wav voice=clip delayMs=190
  90933 tv    clip         src=g46.wav muted=false ready=true delayMs=190
  90933 tv    speak        text=g46.wav voice=clip delayMs=190
  91027 tv    clip         src=o74.wav muted=false ready=true delayMs=190
  91027 tv    speak        text=o74.wav voice=clip delayMs=190
  91124 tv    clip         src=g47.wav muted=false ready=true delayMs=190
  91124 tv    speak        text=g47.wav voice=clip delayMs=190
  91216 tv    clip         src=n31.wav muted=false ready=true delayMs=190
  91216 tv    speak        text=n31.wav voice=clip delayMs=190
  91309 tv    clip         src=o62.wav muted=false ready=true delayMs=190
  91309 tv    speak        text=o62.wav voice=clip delayMs=190
  91418 tv    clip         src=b10.wav muted=false ready=true delayMs=190
  91418 tv    speak        text=b10.wav voice=clip delayMs=190
  91513 tv    clip         src=g60.wav muted=false ready=true delayMs=190
  91513 tv    speak        text=g60.wav voice=clip delayMs=190
  91608 tv    clip         src=n38.wav muted=false ready=true delayMs=190
  91608 tv    speak        text=n38.wav voice=clip delayMs=190
  91702 tv    clip         src=n39.wav muted=false ready=true delayMs=190
  91702 tv    speak        text=n39.wav voice=clip delayMs=190
  91797 tv    clip         src=o70.wav muted=false ready=true delayMs=190
  91797 tv    speak        text=o70.wav voice=clip delayMs=190
  91904 tv    clip         src=b11.wav muted=false ready=true delayMs=190
  91904 tv    speak        text=b11.wav voice=clip delayMs=190
  92002 tv    clip         src=o75.wav muted=false ready=true delayMs=190
  92002 tv    speak        text=o75.wav voice=clip delayMs=190
  92097 tv    clip         src=g58.wav muted=false ready=true delayMs=190
  92097 tv    speak        text=g58.wav voice=clip delayMs=190
  92175 tv    clip         src=b15.wav muted=false ready=true delayMs=190
  92175 tv    speak        text=b15.wav voice=clip delayMs=190
  92255 tv    clip         src=i24.wav muted=false ready=true delayMs=190
  92255 tv    speak        text=i24.wav voice=clip delayMs=190
  92362 tv    clip         src=o72.wav muted=false ready=true delayMs=190
  92362 tv    speak        text=o72.wav voice=clip delayMs=190
  92456 tv    clip         src=g56.wav muted=false ready=true delayMs=190
  92456 tv    speak        text=g56.wav voice=clip delayMs=190
  92552 tv    clip         src=i20.wav muted=false ready=true delayMs=190
  92552 tv    speak        text=i20.wav voice=clip delayMs=190
  92646 tv    clip         src=n44.wav muted=false ready=true delayMs=190
  92646 tv    speak        text=n44.wav voice=clip delayMs=190
  92739 tv    clip         src=b3.wav muted=false ready=true delayMs=190
  92739 tv    speak        text=b3.wav voice=clip delayMs=190
  92834 tv    clip         src=o68.wav muted=false ready=true delayMs=190
  92834 tv    speak        text=o68.wav voice=clip delayMs=190
  92927 tv    clip         src=b2.wav muted=false ready=true delayMs=190
  92927 tv    speak        text=b2.wav voice=clip delayMs=190
  93022 tv    clip         src=n41.wav muted=false ready=true delayMs=190
  93022 tv    speak        text=n41.wav voice=clip delayMs=190
  93116 tv    clip         src=o65.wav muted=false ready=true delayMs=190
  93116 tv    speak        text=o65.wav voice=clip delayMs=190
  93211 tv    clip         src=i17.wav muted=false ready=true delayMs=190
  93211 tv    speak        text=i17.wav voice=clip delayMs=190
  93306 tv    clip         src=i25.wav muted=false ready=true delayMs=190
  93306 tv    speak        text=i25.wav voice=clip delayMs=190
  93400 tv    clip         src=i19.wav muted=false ready=true delayMs=190
  93400 tv    speak        text=i19.wav voice=clip delayMs=190
  93494 tv    clip         src=g57.wav muted=false ready=true delayMs=190
  93494 tv    speak        text=g57.wav voice=clip delayMs=190
  93587 tv    clip         src=g59.wav muted=false ready=true delayMs=190
  93587 tv    speak        text=g59.wav voice=clip delayMs=190
  93778 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  94808 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95071 tv    hush
  95071 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95071 tv    hush
 102675 tv    music:duck   ms=9000
 102675 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 107693 tv    hush
 107693 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 107693 tv    hush
 111687 tv    ss:cancel    speaking=false pending=false
 111687 tv    music:plan   from=game:bingo to=null
 111687 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113187 tv    music:stop   track=wallpaper.mp3
 113286 tv    ss:cancel    speaking=false pending=false
 113286 tv    music:plan   from=null to=lobby
 113286 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 115798 tv    ss:cancel    speaking=false pending=false
 115806 tv    music:plan   from=lobby to=game:bingo
 115806 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 115806 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 115811 tv    hush
 115811 tv    hush
 116422 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 116433 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 116433 tv    speak        text=i21.wav voice=clip delayMs=190
 116447 tv    clip         src=n32.wav muted=false ready=true delayMs=190
 116447 tv    speak        text=n32.wav voice=clip delayMs=190
 116542 tv    clip         src=i18.wav muted=false ready=true delayMs=190
 116542 tv    speak        text=i18.wav voice=clip delayMs=190
 116608 tv    music:stop   track=local-forecast-elevator.mp3
 116621 tv    clip         src=n40.wav muted=false ready=true delayMs=190
 116621 tv    speak        text=n40.wav voice=clip delayMs=190
 116701 tv    clip         src=i30.wav muted=false ready=true delayMs=190
 116701 tv    speak        text=i30.wav voice=clip delayMs=190
 116794 tv    clip         src=o69.wav muted=false ready=true delayMs=190
 116794 tv    speak        text=o69.wav voice=clip delayMs=190
 116888 tv    clip         src=o61.wav muted=false ready=true delayMs=190
 116888 tv    speak        text=o61.wav voice=clip delayMs=190
 116983 tv    clip         src=n34.wav muted=false ready=true delayMs=190
 116983 tv    speak        text=n34.wav voice=clip delayMs=190
 117091 tv    clip         src=n35.wav muted=false ready=true delayMs=190
 117091 tv    speak        text=n35.wav voice=clip delayMs=190
 117187 tv    clip         src=o67.wav muted=false ready=true delayMs=190
 117187 tv    speak        text=o67.wav voice=clip delayMs=190
 117281 tv    clip         src=g55.wav muted=false ready=true delayMs=190
 117281 tv    speak        text=g55.wav voice=clip delayMs=190
 117376 tv    clip         src=i26.wav muted=false ready=true delayMs=190
 117376 tv    speak        text=i26.wav voice=clip delayMs=190
 117469 tv    clip         src=i22.wav muted=false ready=true delayMs=190
 117469 tv    speak        text=i22.wav voice=clip delayMs=190
 117564 tv    clip         src=i29.wav muted=false ready=true delayMs=190
 117564 tv    speak        text=i29.wav voice=clip delayMs=190
 117659 tv    clip         src=o66.wav muted=false ready=true delayMs=190
 117659 tv    speak        text=o66.wav voice=clip delayMs=190
 117755 tv    clip         src=g51.wav muted=false ready=true delayMs=190
 117755 tv    speak        text=g51.wav voice=clip delayMs=190
 117864 tv    clip         src=g53.wav muted=false ready=true delayMs=190
 117864 tv    speak        text=g53.wav voice=clip delayMs=190
 117957 tv    clip         src=b9.wav muted=false ready=true delayMs=190
 117957 tv    speak        text=b9.wav voice=clip delayMs=190
 118051 tv    clip         src=n36.wav muted=false ready=true delayMs=190
 118051 tv    speak        text=n36.wav voice=clip delayMs=190
 118147 tv    clip         src=g52.wav muted=false ready=true delayMs=190
 118147 tv    speak        text=g52.wav voice=clip delayMs=190
 118241 tv    clip         src=b1.wav muted=false ready=true delayMs=190
 118241 tv    speak        text=b1.wav voice=clip delayMs=190
 118337 tv    clip         src=b13.wav muted=false ready=true delayMs=190
 118337 tv    speak        text=b13.wav voice=clip delayMs=190
 118434 tv    clip         src=n37.wav muted=false ready=true delayMs=190
 118434 tv    speak        text=n37.wav voice=clip delayMs=190
 118528 tv    clip         src=o71.wav muted=false ready=true delayMs=190
 118528 tv    speak        text=o71.wav voice=clip delayMs=190
 118622 tv    clip         src=b8.wav muted=false ready=true delayMs=190
 118622 tv    speak        text=b8.wav voice=clip delayMs=190
 118716 tv    clip         src=b5.wav muted=false ready=true delayMs=190
 118716 tv    speak        text=b5.wav voice=clip delayMs=190
 118810 tv    clip         src=b7.wav muted=false ready=true delayMs=190
 118810 tv    speak        text=b7.wav voice=clip delayMs=190
 118904 tv    clip         src=n42.wav muted=false ready=true delayMs=190
 118904 tv    speak        text=n42.wav voice=clip delayMs=190
 118999 tv    clip         src=i28.wav muted=false ready=true delayMs=190
 118999 tv    speak        text=i28.wav voice=clip delayMs=190
 119079 tv    clip         src=i27.wav muted=false ready=true delayMs=190
 119079 tv    speak        text=i27.wav voice=clip delayMs=190
 119174 tv    clip         src=o63.wav muted=false ready=true delayMs=190
 119174 tv    speak        text=o63.wav voice=clip delayMs=190
 119269 tv    clip         src=o64.wav muted=false ready=true delayMs=190
 119269 tv    speak        text=o64.wav voice=clip delayMs=190
 119362 tv    clip         src=o73.wav muted=false ready=true delayMs=190
 119362 tv    speak        text=o73.wav voice=clip delayMs=190
 119458 tv    clip         src=g50.wav muted=false ready=true delayMs=190
 119458 tv    speak        text=g50.wav voice=clip delayMs=190
 119552 tv    clip         src=g48.wav muted=false ready=true delayMs=190
 119552 tv    speak        text=g48.wav voice=clip delayMs=190
 119645 tv    clip         src=b12.wav muted=false ready=true delayMs=190
 119645 tv    speak        text=b12.wav voice=clip delayMs=190
 119739 tv    clip         src=n45.wav muted=false ready=true delayMs=190
 119739 tv    speak        text=n45.wav voice=clip delayMs=190
 119819 tv    clip         src=b4.wav muted=false ready=true delayMs=190
 119819 tv    speak        text=b4.wav voice=clip delayMs=190
 119914 tv    clip         src=g46.wav muted=false ready=true delayMs=190
 119914 tv    speak        text=g46.wav voice=clip delayMs=190
 120008 tv    clip         src=o74.wav muted=false ready=true delayMs=190
 120008 tv    speak        text=o74.wav voice=clip delayMs=190
 120103 tv    clip         src=g47.wav muted=false ready=true delayMs=190
 120103 tv    speak        text=g47.wav voice=clip delayMs=190
 120200 tv    clip         src=n31.wav muted=false ready=true delayMs=190
 120200 tv    speak        text=n31.wav voice=clip delayMs=190
 120295 tv    clip         src=o62.wav muted=false ready=true delayMs=190
 120295 tv    speak        text=o62.wav voice=clip delayMs=190
 120374 tv    clip         src=b10.wav muted=false ready=true delayMs=190
 120374 tv    speak        text=b10.wav voice=clip delayMs=190
 120469 tv    clip         src=g60.wav muted=false ready=true delayMs=190
 120469 tv    speak        text=g60.wav voice=clip delayMs=190
 120547 tv    clip         src=n38.wav muted=false ready=true delayMs=190
 120547 tv    speak        text=n38.wav voice=clip delayMs=190
 120626 tv    clip         src=n39.wav muted=false ready=true delayMs=190
 120626 tv    speak        text=n39.wav voice=clip delayMs=190
 120705 tv    clip         src=o70.wav muted=false ready=true delayMs=190
 120705 tv    speak        text=o70.wav voice=clip delayMs=190
 120783 tv    clip         src=b11.wav muted=false ready=true delayMs=190
 120783 tv    speak        text=b11.wav voice=clip delayMs=190
 120877 tv    clip         src=o75.wav muted=false ready=true delayMs=190
 120877 tv    speak        text=o75.wav voice=clip delayMs=190
 120971 tv    clip         src=g58.wav muted=false ready=true delayMs=190
 120971 tv    speak        text=g58.wav voice=clip delayMs=190
 121065 tv    clip         src=b15.wav muted=false ready=true delayMs=190
 121065 tv    speak        text=b15.wav voice=clip delayMs=190
 121160 tv    clip         src=i24.wav muted=false ready=true delayMs=190
 121160 tv    speak        text=i24.wav voice=clip delayMs=190
 121253 tv    clip         src=o72.wav muted=false ready=true delayMs=190
 121253 tv    speak        text=o72.wav voice=clip delayMs=190
 121349 tv    clip         src=g56.wav muted=false ready=true delayMs=190
 121349 tv    speak        text=g56.wav voice=clip delayMs=190
 121443 tv    clip         src=i20.wav muted=false ready=true delayMs=190
 121443 tv    speak        text=i20.wav voice=clip delayMs=190
 121537 tv    clip         src=n44.wav muted=false ready=true delayMs=190
 121537 tv    speak        text=n44.wav voice=clip delayMs=190
 121632 tv    clip         src=b3.wav muted=false ready=true delayMs=190
 121632 tv    speak        text=b3.wav voice=clip delayMs=190
 121727 tv    clip         src=o68.wav muted=false ready=true delayMs=190
 121727 tv    speak        text=o68.wav voice=clip delayMs=190
 121821 tv    clip         src=b2.wav muted=false ready=true delayMs=190
 121821 tv    speak        text=b2.wav voice=clip delayMs=190
 121917 tv    clip         src=n41.wav muted=false ready=true delayMs=190
 121917 tv    speak        text=n41.wav voice=clip delayMs=190
 122011 tv    clip         src=o65.wav muted=false ready=true delayMs=190
 122011 tv    speak        text=o65.wav voice=clip delayMs=190
 122106 tv    clip         src=i17.wav muted=false ready=true delayMs=190
 122106 tv    speak        text=i17.wav voice=clip delayMs=190
 122201 tv    clip         src=i25.wav muted=false ready=true delayMs=190
 122201 tv    speak        text=i25.wav voice=clip delayMs=190
 122297 tv    clip         src=i19.wav muted=false ready=true delayMs=190
 122297 tv    speak        text=i19.wav voice=clip delayMs=190
 122391 tv    clip         src=g57.wav muted=false ready=true delayMs=190
 122391 tv    speak        text=g57.wav voice=clip delayMs=190
 122486 tv    clip         src=g59.wav muted=false ready=true delayMs=190
 122486 tv    speak        text=g59.wav voice=clip delayMs=190
 122678 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 123723 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 123986 tv    hush
 123986 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 123986 tv    hush
 131592 tv    music:duck   ms=9000
 131592 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 136609 tv    hush
 136609 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 136609 tv    hush
 138169 tv    ss:cancel    speaking=false pending=false
 138169 tv    music:plan   from=game:bingo to=null
 138171 tv    ss:cancel    speaking=false pending=false
 138171 tv    music:plan   from=null to=lobby
 138171 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 138971 tv    music:stop   track=wallpaper.mp3
 140688 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 140696 tv    ss:cancel    speaking=false pending=false
 140698 tv    music:plan   from=lobby to=game:bingo
 140698 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 140699 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 140702 tv    hush
 140702 tv    hush
 141313 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 141499 tv    music:stop   track=george-street-shuffle.mp3
 142704 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 142854 tv    ss:cancel    speaking=false pending=false
 142855 tv    music:plan   from=game:bingo to=null
 142855 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 144355 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 145002 tv    ss:cancel    speaking=false pending=false
 145002 tv    music:plan   from=null to=lobby
 145002 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 148349 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 148359 tv    ss:cancel    speaking=false pending=false
 148360 tv    music:plan   from=lobby to=game:bingo
 148360 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 148360 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 148364 tv    hush
 148364 tv    hush
 148779 tv    clip         src=i21.wav muted=false ready=true delayMs=190
 148779 tv    speak        text=i21.wav voice=clip delayMs=190
 148780 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 148971 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 149161 tv    music:stop   track=george-street-shuffle.mp3
 149286 tv    ss:cancel    speaking=false pending=false
 149286 tv    music:plan   from=game:bingo to=null
 149290 tv    ss:cancel    speaking=false pending=false
 149290 tv    music:plan   from=null to=lobby
 149290 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 150090 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"airport-lounge.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 154872 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 155289 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 155722 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156136 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156571 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157639 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 158245 tv    ss:cancel    speaking=false pending=false
 158249 tv    music:plan   from=lobby to=null
 158249 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 159506 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 159749 tv    music:stop   track=airport-lounge.mp3
 161090 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 162505 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 163805 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 164835 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 165874 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 168448 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 168639 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 168813 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 169001 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"lobby-time.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 170101 tv    ss:cancel    speaking=false pending=false
 170104 tv    ss:cancel    speaking=false pending=false
 170104 tv    music:plan   from=null to=lobby
 170104 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 172123 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 172129 tv    ss:cancel    speaking=false pending=false
 172130 tv    music:plan   from=lobby to=null
 172130 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 173632 tv    music:stop   track=local-forecast-elevator.mp3
 173682 tv    music:plan   from=null to=game:broken-pencil
 173682 tv    music:start  plan=game:broken-pencil track=lobby-time mode=chain volume=0.2
 173682 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 175160 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 175635 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 175793 tv    music:plan   from=game:broken-pencil to=null
 175793 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 177294 tv    music:stop   track=lobby-time.mp3
```
