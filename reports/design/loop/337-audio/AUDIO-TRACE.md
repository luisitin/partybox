# Audio interaction trace

Captured 2026-09-18T22:14:05.262Z on port 42166. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**59 / 59 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:local-forecast-elevator
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":4.4}]

```
   1735 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
   1759 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3072 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3208 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3914 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4540 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5375 tv    ss:cancel    speaking=false pending=false
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
   6213 tv    music:plan   from=lobby to=null
   6213 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7713 tv    music:stop   track=local-forecast-elevator.mp3
   8149 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9442 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16403 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17412 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18403 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19413 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20413 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21211 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22019 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22177 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22334 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22491 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22649 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22806 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22964 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23123 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23280 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23437 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23592 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23751 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23907 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24066 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24224 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24379 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24536 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24694 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24852 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25739 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26072 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27881 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29604 tv    ss:cancel    speaking=false pending=false
  29604 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31151 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33286 tv    ss:cancel    speaking=false pending=false
  33286 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34820 tv    ss:cancel    speaking=false pending=false
  34820 tv    music:plan   from=null to=lobby
  34820 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":3}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+955ms phone@+958ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **each voice starts on the push (no delay); its boing lands on the squash, 170–230 ms later** — delays=0,0 boing lags=191,192ms
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":18.1}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":24.9}]
- ✅ **skipping through the deck: a hush before every call, one voice at a time** — clips=41 hushes=41
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5362ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":39.5}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the winner's celebration buzz (320 ms) runs whole — nothing shorter cuts it** — celebration@73559 cut by=[]
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5408ms cheer@+5373ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36379 tv    music:plan   from=lobby to=game:bingo
  36379 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36379 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36683 tv    hush
  36683 tv    hush
  37180 tv    music:stop   track=bossa-antigua.mp3
  37294 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38388 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39385 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40385 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41381 tv    hush
  41381 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  41381 tv    speak        text=b9.wav voice=clip delayMs=0
  41382 tv    hush
  41572 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43037 tv    hush
  43037 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  43037 tv    speak        text=b8.wav voice=clip delayMs=0
  43228 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44856 tv    hush
  44856 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  44856 tv    speak        text=n34.wav voice=clip delayMs=0
  45048 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46724 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  46995 tv    hush
  46995 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  46996 tv    hush
  52348 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55358 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56360 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57359 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58364 tv    hush
  58365 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  58365 tv    speak        text=n35.wav voice=clip delayMs=0
  58556 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60155 tv    music:paused paused=true
  60155 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61405 tv    music:paused paused=false
  61405 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62710 tv    hush
  62710 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  62710 tv    speak        text=i25.wav voice=clip delayMs=0
  62837 tv    hush
  62837 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  62837 tv    speak        text=n45.wav voice=clip delayMs=0
  62963 tv    hush
  62963 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  62963 tv    speak        text=n33.wav voice=clip delayMs=0
  63091 tv    hush
  63091 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  63091 tv    speak        text=g49.wav voice=clip delayMs=0
  63216 tv    hush
  63216 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  63216 tv    speak        text=b4.wav voice=clip delayMs=0
  63342 tv    hush
  63342 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  63342 tv    speak        text=i20.wav voice=clip delayMs=0
  63467 tv    hush
  63467 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  63467 tv    speak        text=o69.wav voice=clip delayMs=0
  63595 tv    hush
  63595 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  63595 tv    speak        text=o67.wav voice=clip delayMs=0
  63720 tv    hush
  63720 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  63720 tv    speak        text=o65.wav voice=clip delayMs=0
  63849 tv    hush
  63849 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  63849 tv    speak        text=o73.wav voice=clip delayMs=0
  63980 tv    hush
  63980 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  63980 tv    speak        text=i21.wav voice=clip delayMs=0
  64102 tv    hush
  64102 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  64102 tv    speak        text=i18.wav voice=clip delayMs=0
  64214 tv    hush
  64214 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  64214 tv    speak        text=g58.wav voice=clip delayMs=0
  64338 tv    hush
  64338 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  64338 tv    speak        text=n36.wav voice=clip delayMs=0
  64465 tv    hush
  64465 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  64465 tv    speak        text=o61.wav voice=clip delayMs=0
  64592 tv    hush
  64593 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  64593 tv    speak        text=n37.wav voice=clip delayMs=0
  64716 tv    hush
  64716 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  64716 tv    speak        text=i16.wav voice=clip delayMs=0
  64843 tv    hush
  64843 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  64843 tv    speak        text=g47.wav voice=clip delayMs=0
  64975 tv    hush
  64975 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  64975 tv    speak        text=n41.wav voice=clip delayMs=0
  65096 tv    hush
  65096 tv    clip         src=b6.wav muted=false ready=true delayMs=0
  65096 tv    speak        text=b6.wav voice=clip delayMs=0
  65225 tv    hush
  65225 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  65225 tv    speak        text=o72.wav voice=clip delayMs=0
  65349 tv    hush
  65349 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  65349 tv    speak        text=b3.wav voice=clip delayMs=0
  65480 tv    hush
  65480 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  65480 tv    speak        text=i30.wav voice=clip delayMs=0
  65605 tv    hush
  65605 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  65605 tv    speak        text=g56.wav voice=clip delayMs=0
  65728 tv    hush
  65728 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  65728 tv    speak        text=o75.wav voice=clip delayMs=0
  65855 tv    hush
  65855 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  65855 tv    speak        text=b1.wav voice=clip delayMs=0
  65982 tv    hush
  65982 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  65982 tv    speak        text=b2.wav voice=clip delayMs=0
  66107 tv    hush
  66107 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  66107 tv    speak        text=n32.wav voice=clip delayMs=0
  66234 tv    hush
  66234 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  66234 tv    speak        text=g48.wav voice=clip delayMs=0
  66363 tv    hush
  66363 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  66363 tv    speak        text=i23.wav voice=clip delayMs=0
  66484 tv    hush
  66484 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  66484 tv    speak        text=i26.wav voice=clip delayMs=0
  66613 tv    hush
  66613 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  66613 tv    speak        text=o66.wav voice=clip delayMs=0
  66739 tv    hush
  66739 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  66739 tv    speak        text=i19.wav voice=clip delayMs=0
  66865 tv    hush
  66865 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  66865 tv    speak        text=n42.wav voice=clip delayMs=0
  66978 tv    hush
  66978 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  66978 tv    speak        text=i24.wav voice=clip delayMs=0
  67102 tv    hush
  67102 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  67102 tv    speak        text=n39.wav voice=clip delayMs=0
  67230 tv    hush
  67230 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  67230 tv    speak        text=g46.wav voice=clip delayMs=0
  67355 tv    hush
  67355 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  67355 tv    speak        text=n44.wav voice=clip delayMs=0
  67482 tv    hush
  67482 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  67482 tv    speak        text=b15.wav voice=clip delayMs=0
  67610 tv    hush
  67610 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  67610 tv    speak        text=b11.wav voice=clip delayMs=0
  67732 tv    hush
  67732 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  67732 tv    speak        text=g57.wav voice=clip delayMs=0
  67923 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  68353 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68623 tv    hush
  68623 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68623 tv    hush
  70497 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73985 tv    music:duck   ms=9000
  73985 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  78791 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79119 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80123 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81128 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82129 tv    hush
  82129 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  82129 tv    speak        text=g57.wav voice=clip delayMs=0
  82320 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84430 tv    ss:cancel    speaking=false pending=false
  84430 tv    music:plan   from=game:bingo to=null
  84433 tv    ss:cancel    speaking=false pending=false
  84433 tv    music:plan   from=null to=lobby
  84433 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  85234 tv    music:stop   track=cool-vibes.mp3
  86945 tv    ss:cancel    speaking=false pending=false
  86950 tv    music:plan   from=lobby to=game:bingo
  86950 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86950 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86953 tv    hush
  86953 tv    hush
  87564 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  87572 tv    hush
  87572 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  87572 tv    speak        text=i21.wav voice=clip delayMs=0
  87572 tv    hush
  87602 tv    hush
  87602 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  87602 tv    speak        text=n32.wav voice=clip delayMs=0
  87697 tv    hush
  87697 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  87697 tv    speak        text=i18.wav voice=clip delayMs=0
  87750 tv    music:stop   track=george-street-shuffle.mp3
  87775 tv    hush
  87775 tv    clip         src=n40.wav muted=false ready=true delayMs=0
  87775 tv    speak        text=n40.wav voice=clip delayMs=0
  87869 tv    hush
  87869 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  87869 tv    speak        text=i30.wav voice=clip delayMs=0
  87963 tv    hush
  87963 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  87963 tv    speak        text=o69.wav voice=clip delayMs=0
  88046 tv    hush
  88046 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  88046 tv    speak        text=o61.wav voice=clip delayMs=0
  88142 tv    hush
  88142 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  88142 tv    speak        text=n34.wav voice=clip delayMs=0
  88236 tv    hush
  88236 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  88236 tv    speak        text=n35.wav voice=clip delayMs=0
  88338 tv    hush
  88338 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  88338 tv    speak        text=o67.wav voice=clip delayMs=0
  88430 tv    hush
  88430 tv    clip         src=g55.wav muted=false ready=true delayMs=0
  88430 tv    speak        text=g55.wav voice=clip delayMs=0
  88543 tv    hush
  88543 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  88543 tv    speak        text=i26.wav voice=clip delayMs=0
  88630 tv    hush
  88630 tv    clip         src=i22.wav muted=false ready=true delayMs=0
  88630 tv    speak        text=i22.wav voice=clip delayMs=0
  88725 tv    hush
  88725 tv    clip         src=i29.wav muted=false ready=true delayMs=0
  88725 tv    speak        text=i29.wav voice=clip delayMs=0
  88821 tv    hush
  88821 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  88821 tv    speak        text=o66.wav voice=clip delayMs=0
  88916 tv    hush
  88916 tv    clip         src=g51.wav muted=false ready=true delayMs=0
  88916 tv    speak        text=g51.wav voice=clip delayMs=0
  89010 tv    hush
  89010 tv    clip         src=g53.wav muted=false ready=true delayMs=0
  89010 tv    speak        text=g53.wav voice=clip delayMs=0
  89104 tv    hush
  89104 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  89104 tv    speak        text=b9.wav voice=clip delayMs=0
  89199 tv    hush
  89199 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  89199 tv    speak        text=n36.wav voice=clip delayMs=0
  89292 tv    hush
  89292 tv    clip         src=g52.wav muted=false ready=true delayMs=0
  89292 tv    speak        text=g52.wav voice=clip delayMs=0
  89393 tv    hush
  89393 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  89393 tv    speak        text=b1.wav voice=clip delayMs=0
  89480 tv    hush
  89480 tv    clip         src=b13.wav muted=false ready=true delayMs=0
  89480 tv    speak        text=b13.wav voice=clip delayMs=0
  89580 tv    hush
  89580 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  89580 tv    speak        text=n37.wav voice=clip delayMs=0
  89675 tv    hush
  89675 tv    clip         src=o71.wav muted=false ready=true delayMs=0
  89675 tv    speak        text=o71.wav voice=clip delayMs=0
  89765 tv    hush
  89765 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  89765 tv    speak        text=b8.wav voice=clip delayMs=0
  89859 tv    hush
  89859 tv    clip         src=b5.wav muted=false ready=true delayMs=0
  89859 tv    speak        text=b5.wav voice=clip delayMs=0
  89951 tv    hush
  89951 tv    clip         src=b7.wav muted=false ready=true delayMs=0
  89951 tv    speak        text=b7.wav voice=clip delayMs=0
  90049 tv    hush
  90049 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  90049 tv    speak        text=n42.wav voice=clip delayMs=0
  90140 tv    hush
  90140 tv    clip         src=i28.wav muted=false ready=true delayMs=0
  90140 tv    speak        text=i28.wav voice=clip delayMs=0
  90240 tv    hush
  90240 tv    clip         src=i27.wav muted=false ready=true delayMs=0
  90240 tv    speak        text=i27.wav voice=clip delayMs=0
  90332 tv    hush
  90332 tv    clip         src=o63.wav muted=false ready=true delayMs=0
  90332 tv    speak        text=o63.wav voice=clip delayMs=0
  90418 tv    hush
  90418 tv    clip         src=o64.wav muted=false ready=true delayMs=0
  90418 tv    speak        text=o64.wav voice=clip delayMs=0
  90508 tv    hush
  90508 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  90508 tv    speak        text=o73.wav voice=clip delayMs=0
  90600 tv    hush
  90600 tv    clip         src=g50.wav muted=false ready=true delayMs=0
  90600 tv    speak        text=g50.wav voice=clip delayMs=0
  90694 tv    hush
  90694 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  90694 tv    speak        text=g48.wav voice=clip delayMs=0
  90789 tv    hush
  90789 tv    clip         src=b12.wav muted=false ready=true delayMs=0
  90789 tv    speak        text=b12.wav voice=clip delayMs=0
  90879 tv    hush
  90879 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  90879 tv    speak        text=n45.wav voice=clip delayMs=0
  90974 tv    hush
  90974 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  90974 tv    speak        text=b4.wav voice=clip delayMs=0
  91067 tv    hush
  91067 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  91067 tv    speak        text=g46.wav voice=clip delayMs=0
  91155 tv    hush
  91155 tv    clip         src=o74.wav muted=false ready=true delayMs=0
  91155 tv    speak        text=o74.wav voice=clip delayMs=0
  91244 tv    hush
  91244 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  91244 tv    speak        text=g47.wav voice=clip delayMs=0
  91338 tv    hush
  91338 tv    clip         src=n31.wav muted=false ready=true delayMs=0
  91338 tv    speak        text=n31.wav voice=clip delayMs=0
  91430 tv    hush
  91430 tv    clip         src=o62.wav muted=false ready=true delayMs=0
  91430 tv    speak        text=o62.wav voice=clip delayMs=0
  91526 tv    hush
  91526 tv    clip         src=b10.wav muted=false ready=true delayMs=0
  91526 tv    speak        text=b10.wav voice=clip delayMs=0
  91620 tv    hush
  91620 tv    clip         src=g60.wav muted=false ready=true delayMs=0
  91620 tv    speak        text=g60.wav voice=clip delayMs=0
  91717 tv    hush
  91717 tv    clip         src=n38.wav muted=false ready=true delayMs=0
  91717 tv    speak        text=n38.wav voice=clip delayMs=0
  91809 tv    hush
  91809 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  91809 tv    speak        text=n39.wav voice=clip delayMs=0
  91901 tv    hush
  91901 tv    clip         src=o70.wav muted=false ready=true delayMs=0
  91901 tv    speak        text=o70.wav voice=clip delayMs=0
  92000 tv    hush
  92000 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  92000 tv    speak        text=b11.wav voice=clip delayMs=0
  92088 tv    hush
  92088 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  92088 tv    speak        text=o75.wav voice=clip delayMs=0
  92188 tv    hush
  92188 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  92188 tv    speak        text=g58.wav voice=clip delayMs=0
  92284 tv    hush
  92284 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  92284 tv    speak        text=b15.wav voice=clip delayMs=0
  92376 tv    hush
  92376 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  92376 tv    speak        text=i24.wav voice=clip delayMs=0
  92466 tv    hush
  92466 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  92466 tv    speak        text=o72.wav voice=clip delayMs=0
  92562 tv    hush
  92562 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  92562 tv    speak        text=g56.wav voice=clip delayMs=0
  92658 tv    hush
  92658 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  92658 tv    speak        text=i20.wav voice=clip delayMs=0
  92751 tv    hush
  92751 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  92751 tv    speak        text=n44.wav voice=clip delayMs=0
  92847 tv    hush
  92847 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  92847 tv    speak        text=b3.wav voice=clip delayMs=0
  92937 tv    hush
  92937 tv    clip         src=o68.wav muted=false ready=true delayMs=0
  92937 tv    speak        text=o68.wav voice=clip delayMs=0
  93037 tv    hush
  93037 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  93037 tv    speak        text=b2.wav voice=clip delayMs=0
  93142 tv    hush
  93142 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  93142 tv    speak        text=n41.wav voice=clip delayMs=0
  93236 tv    hush
  93236 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  93236 tv    speak        text=o65.wav voice=clip delayMs=0
  93331 tv    hush
  93331 tv    clip         src=i17.wav muted=false ready=true delayMs=0
  93331 tv    speak        text=i17.wav voice=clip delayMs=0
  93424 tv    hush
  93424 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  93424 tv    speak        text=i25.wav voice=clip delayMs=0
  93518 tv    hush
  93518 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  93518 tv    speak        text=i19.wav voice=clip delayMs=0
  93615 tv    hush
  93615 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  93615 tv    speak        text=g57.wav voice=clip delayMs=0
  93706 tv    hush
  93706 tv    clip         src=g59.wav muted=false ready=true delayMs=0
  93706 tv    speak        text=g59.wav voice=clip delayMs=0
  93802 tv    hush
  93802 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  93802 tv    speak        text=g49.wav voice=clip delayMs=0
  93898 tv    hush
  93898 tv    clip         src=n43.wav muted=false ready=true delayMs=0
  93898 tv    speak        text=n43.wav voice=clip delayMs=0
  93988 tv    hush
  93988 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  93988 tv    speak        text=i16.wav voice=clip delayMs=0
  94083 tv    hush
  94083 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  94083 tv    speak        text=n33.wav voice=clip delayMs=0
  94178 tv    hush
  94178 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  94178 tv    speak        text=i23.wav voice=clip delayMs=0
  94273 tv    hush
  94273 tv    clip         src=g54.wav muted=false ready=true delayMs=0
  94273 tv    speak        text=g54.wav voice=clip delayMs=0
  94370 tv    hush
  94370 tv    clip         src=b14.wav muted=false ready=true delayMs=0
  94370 tv    speak        text=b14.wav voice=clip delayMs=0
  94561 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  95589 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95855 tv    hush
  95855 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95855 tv    hush
 103465 tv    music:duck   ms=9000
 103465 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108476 tv    hush
 108477 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108477 tv    hush
 112478 tv    ss:cancel    speaking=false pending=false
 112478 tv    music:plan   from=game:bingo to=null
 112479 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113979 tv    music:stop   track=wallpaper.mp3
 114096 tv    ss:cancel    speaking=false pending=false
 114096 tv    music:plan   from=null to=lobby
 114096 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 116614 tv    ss:cancel    speaking=false pending=false
 116621 tv    music:plan   from=lobby to=game:bingo
 116621 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116621 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116624 tv    hush
 116625 tv    hush
 117239 tv    hush
 117239 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 117239 tv    speak        text=i21.wav voice=clip delayMs=0
 117239 tv    hush
 117247 tv    hush
 117247 tv    clip         src=n32.wav muted=false ready=true delayMs=0
 117247 tv    speak        text=n32.wav voice=clip delayMs=0
 117349 tv    hush
 117349 tv    clip         src=i18.wav muted=false ready=true delayMs=0
 117349 tv    speak        text=i18.wav voice=clip delayMs=0
 117424 tv    music:stop   track=george-street-shuffle.mp3
 117442 tv    hush
 117442 tv    clip         src=n40.wav muted=false ready=true delayMs=0
 117442 tv    speak        text=n40.wav voice=clip delayMs=0
 117537 tv    hush
 117537 tv    clip         src=i30.wav muted=false ready=true delayMs=0
 117537 tv    speak        text=i30.wav voice=clip delayMs=0
 117629 tv    hush
 117629 tv    clip         src=o69.wav muted=false ready=true delayMs=0
 117629 tv    speak        text=o69.wav voice=clip delayMs=0
 117724 tv    hush
 117724 tv    clip         src=o61.wav muted=false ready=true delayMs=0
 117724 tv    speak        text=o61.wav voice=clip delayMs=0
 117805 tv    hush
 117805 tv    clip         src=n34.wav muted=false ready=true delayMs=0
 117805 tv    speak        text=n34.wav voice=clip delayMs=0
 117894 tv    hush
 117894 tv    clip         src=n35.wav muted=false ready=true delayMs=0
 117894 tv    speak        text=n35.wav voice=clip delayMs=0
 117975 tv    hush
 117975 tv    clip         src=o67.wav muted=false ready=true delayMs=0
 117975 tv    speak        text=o67.wav voice=clip delayMs=0
 118068 tv    hush
 118068 tv    clip         src=g55.wav muted=false ready=true delayMs=0
 118068 tv    speak        text=g55.wav voice=clip delayMs=0
 118147 tv    hush
 118147 tv    clip         src=i26.wav muted=false ready=true delayMs=0
 118147 tv    speak        text=i26.wav voice=clip delayMs=0
 118242 tv    hush
 118242 tv    clip         src=i22.wav muted=false ready=true delayMs=0
 118242 tv    speak        text=i22.wav voice=clip delayMs=0
 118335 tv    hush
 118335 tv    clip         src=i29.wav muted=false ready=true delayMs=0
 118335 tv    speak        text=i29.wav voice=clip delayMs=0
 118432 tv    hush
 118432 tv    clip         src=o66.wav muted=false ready=true delayMs=0
 118432 tv    speak        text=o66.wav voice=clip delayMs=0
 118535 tv    hush
 118535 tv    clip         src=g51.wav muted=false ready=true delayMs=0
 118535 tv    speak        text=g51.wav voice=clip delayMs=0
 118626 tv    hush
 118626 tv    clip         src=g53.wav muted=false ready=true delayMs=0
 118626 tv    speak        text=g53.wav voice=clip delayMs=0
 118714 tv    hush
 118714 tv    clip         src=b9.wav muted=false ready=true delayMs=0
 118714 tv    speak        text=b9.wav voice=clip delayMs=0
 118808 tv    hush
 118808 tv    clip         src=n36.wav muted=false ready=true delayMs=0
 118808 tv    speak        text=n36.wav voice=clip delayMs=0
 118894 tv    hush
 118894 tv    clip         src=g52.wav muted=false ready=true delayMs=0
 118894 tv    speak        text=g52.wav voice=clip delayMs=0
 118984 tv    hush
 118984 tv    clip         src=b1.wav muted=false ready=true delayMs=0
 118984 tv    speak        text=b1.wav voice=clip delayMs=0
 119078 tv    hush
 119078 tv    clip         src=b13.wav muted=false ready=true delayMs=0
 119078 tv    speak        text=b13.wav voice=clip delayMs=0
 119173 tv    hush
 119173 tv    clip         src=n37.wav muted=false ready=true delayMs=0
 119173 tv    speak        text=n37.wav voice=clip delayMs=0
 119254 tv    hush
 119254 tv    clip         src=o71.wav muted=false ready=true delayMs=0
 119254 tv    speak        text=o71.wav voice=clip delayMs=0
 119362 tv    hush
 119362 tv    clip         src=b8.wav muted=false ready=true delayMs=0
 119362 tv    speak        text=b8.wav voice=clip delayMs=0
 119454 tv    hush
 119454 tv    clip         src=b5.wav muted=false ready=true delayMs=0
 119454 tv    speak        text=b5.wav voice=clip delayMs=0
 119549 tv    hush
 119549 tv    clip         src=b7.wav muted=false ready=true delayMs=0
 119549 tv    speak        text=b7.wav voice=clip delayMs=0
 119645 tv    hush
 119645 tv    clip         src=n42.wav muted=false ready=true delayMs=0
 119645 tv    speak        text=n42.wav voice=clip delayMs=0
 119756 tv    hush
 119756 tv    clip         src=i28.wav muted=false ready=true delayMs=0
 119756 tv    speak        text=i28.wav voice=clip delayMs=0
 119847 tv    hush
 119847 tv    clip         src=i27.wav muted=false ready=true delayMs=0
 119847 tv    speak        text=i27.wav voice=clip delayMs=0
 119941 tv    hush
 119941 tv    clip         src=o63.wav muted=false ready=true delayMs=0
 119941 tv    speak        text=o63.wav voice=clip delayMs=0
 120034 tv    hush
 120034 tv    clip         src=o64.wav muted=false ready=true delayMs=0
 120034 tv    speak        text=o64.wav voice=clip delayMs=0
 120130 tv    hush
 120130 tv    clip         src=o73.wav muted=false ready=true delayMs=0
 120130 tv    speak        text=o73.wav voice=clip delayMs=0
 120229 tv    hush
 120229 tv    clip         src=g50.wav muted=false ready=true delayMs=0
 120229 tv    speak        text=g50.wav voice=clip delayMs=0
 120319 tv    hush
 120319 tv    clip         src=g48.wav muted=false ready=true delayMs=0
 120319 tv    speak        text=g48.wav voice=clip delayMs=0
 120399 tv    hush
 120399 tv    clip         src=b12.wav muted=false ready=true delayMs=0
 120399 tv    speak        text=b12.wav voice=clip delayMs=0
 120493 tv    hush
 120493 tv    clip         src=n45.wav muted=false ready=true delayMs=0
 120493 tv    speak        text=n45.wav voice=clip delayMs=0
 120591 tv    hush
 120591 tv    clip         src=b4.wav muted=false ready=true delayMs=0
 120591 tv    speak        text=b4.wav voice=clip delayMs=0
 120680 tv    hush
 120680 tv    clip         src=g46.wav muted=false ready=true delayMs=0
 120680 tv    speak        text=g46.wav voice=clip delayMs=0
 120760 tv    hush
 120760 tv    clip         src=o74.wav muted=false ready=true delayMs=0
 120760 tv    speak        text=o74.wav voice=clip delayMs=0
 120855 tv    hush
 120855 tv    clip         src=g47.wav muted=false ready=true delayMs=0
 120855 tv    speak        text=g47.wav voice=clip delayMs=0
 120950 tv    hush
 120950 tv    clip         src=n31.wav muted=false ready=true delayMs=0
 120950 tv    speak        text=n31.wav voice=clip delayMs=0
 121058 tv    hush
 121058 tv    clip         src=o62.wav muted=false ready=true delayMs=0
 121058 tv    speak        text=o62.wav voice=clip delayMs=0
 121139 tv    hush
 121139 tv    clip         src=b10.wav muted=false ready=true delayMs=0
 121139 tv    speak        text=b10.wav voice=clip delayMs=0
 121229 tv    hush
 121229 tv    clip         src=g60.wav muted=false ready=true delayMs=0
 121229 tv    speak        text=g60.wav voice=clip delayMs=0
 121322 tv    hush
 121322 tv    clip         src=n38.wav muted=false ready=true delayMs=0
 121322 tv    speak        text=n38.wav voice=clip delayMs=0
 121400 tv    hush
 121400 tv    clip         src=n39.wav muted=false ready=true delayMs=0
 121400 tv    speak        text=n39.wav voice=clip delayMs=0
 121496 tv    hush
 121496 tv    clip         src=o70.wav muted=false ready=true delayMs=0
 121496 tv    speak        text=o70.wav voice=clip delayMs=0
 121593 tv    hush
 121593 tv    clip         src=b11.wav muted=false ready=true delayMs=0
 121593 tv    speak        text=b11.wav voice=clip delayMs=0
 121684 tv    hush
 121684 tv    clip         src=o75.wav muted=false ready=true delayMs=0
 121684 tv    speak        text=o75.wav voice=clip delayMs=0
 121777 tv    hush
 121778 tv    clip         src=g58.wav muted=false ready=true delayMs=0
 121778 tv    speak        text=g58.wav voice=clip delayMs=0
 121874 tv    hush
 121874 tv    clip         src=b15.wav muted=false ready=true delayMs=0
 121874 tv    speak        text=b15.wav voice=clip delayMs=0
 121966 tv    hush
 121966 tv    clip         src=i24.wav muted=false ready=true delayMs=0
 121966 tv    speak        text=i24.wav voice=clip delayMs=0
 122060 tv    hush
 122060 tv    clip         src=o72.wav muted=false ready=true delayMs=0
 122060 tv    speak        text=o72.wav voice=clip delayMs=0
 122170 tv    hush
 122170 tv    clip         src=g56.wav muted=false ready=true delayMs=0
 122170 tv    speak        text=g56.wav voice=clip delayMs=0
 122267 tv    hush
 122267 tv    clip         src=i20.wav muted=false ready=true delayMs=0
 122267 tv    speak        text=i20.wav voice=clip delayMs=0
 122363 tv    hush
 122363 tv    clip         src=n44.wav muted=false ready=true delayMs=0
 122363 tv    speak        text=n44.wav voice=clip delayMs=0
 122461 tv    hush
 122461 tv    clip         src=b3.wav muted=false ready=true delayMs=0
 122461 tv    speak        text=b3.wav voice=clip delayMs=0
 122550 tv    hush
 122550 tv    clip         src=o68.wav muted=false ready=true delayMs=0
 122550 tv    speak        text=o68.wav voice=clip delayMs=0
 122644 tv    hush
 122644 tv    clip         src=b2.wav muted=false ready=true delayMs=0
 122644 tv    speak        text=b2.wav voice=clip delayMs=0
 122738 tv    hush
 122738 tv    clip         src=n41.wav muted=false ready=true delayMs=0
 122738 tv    speak        text=n41.wav voice=clip delayMs=0
 122841 tv    hush
 122841 tv    clip         src=o65.wav muted=false ready=true delayMs=0
 122841 tv    speak        text=o65.wav voice=clip delayMs=0
 122929 tv    hush
 122929 tv    clip         src=i17.wav muted=false ready=true delayMs=0
 122929 tv    speak        text=i17.wav voice=clip delayMs=0
 123021 tv    hush
 123021 tv    clip         src=i25.wav muted=false ready=true delayMs=0
 123021 tv    speak        text=i25.wav voice=clip delayMs=0
 123116 tv    hush
 123116 tv    clip         src=i19.wav muted=false ready=true delayMs=0
 123116 tv    speak        text=i19.wav voice=clip delayMs=0
 123215 tv    hush
 123215 tv    clip         src=g57.wav muted=false ready=true delayMs=0
 123215 tv    speak        text=g57.wav voice=clip delayMs=0
 123289 tv    hush
 123289 tv    clip         src=g59.wav muted=false ready=true delayMs=0
 123289 tv    speak        text=g59.wav voice=clip delayMs=0
 123387 tv    hush
 123387 tv    clip         src=g49.wav muted=false ready=true delayMs=0
 123387 tv    speak        text=g49.wav voice=clip delayMs=0
 123476 tv    hush
 123476 tv    clip         src=n43.wav muted=false ready=true delayMs=0
 123476 tv    speak        text=n43.wav voice=clip delayMs=0
 123569 tv    hush
 123569 tv    clip         src=i16.wav muted=false ready=true delayMs=0
 123569 tv    speak        text=i16.wav voice=clip delayMs=0
 123664 tv    hush
 123664 tv    clip         src=n33.wav muted=false ready=true delayMs=0
 123664 tv    speak        text=n33.wav voice=clip delayMs=0
 123761 tv    hush
 123761 tv    clip         src=i23.wav muted=false ready=true delayMs=0
 123761 tv    speak        text=i23.wav voice=clip delayMs=0
 123860 tv    hush
 123860 tv    clip         src=g54.wav muted=false ready=true delayMs=0
 123860 tv    speak        text=g54.wav voice=clip delayMs=0
 123948 tv    hush
 123948 tv    clip         src=b14.wav muted=false ready=true delayMs=0
 123948 tv    speak        text=b14.wav voice=clip delayMs=0
 124139 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 125183 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 125445 tv    hush
 125445 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 125445 tv    hush
 133049 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 133053 tv    music:duck   ms=9000
 133053 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 138067 tv    hush
 138067 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 138068 tv    hush
 139612 tv    ss:cancel    speaking=false pending=false
 139612 tv    music:plan   from=game:bingo to=null
 139614 tv    ss:cancel    speaking=false pending=false
 139614 tv    music:plan   from=null to=lobby
 139614 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 140414 tv    music:stop   track=wallpaper.mp3
 142120 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 142129 tv    ss:cancel    speaking=false pending=false
 142131 tv    music:plan   from=lobby to=game:bingo
 142131 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 142131 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 142135 tv    hush
 142135 tv    hush
 142746 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 142933 tv    music:stop   track=local-forecast-elevator.mp3
 144136 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 144264 tv    ss:cancel    speaking=false pending=false
 144264 tv    music:plan   from=game:bingo to=null
 144264 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 145765 tv    music:stop   track=cool-vibes.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 146396 tv    ss:cancel    speaking=false pending=false
 146396 tv    music:plan   from=null to=lobby
 146396 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 149751 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 149767 tv    ss:cancel    speaking=false pending=false
 149770 tv    music:plan   from=lobby to=game:bingo
 149770 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 149770 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149773 tv    hush
 149773 tv    hush
 150193 tv    hush
 150193 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 150193 tv    speak        text=i21.wav voice=clip delayMs=0
 150194 tv    hush
 150384 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 150575 tv    music:stop   track=airport-lounge.mp3
 150695 tv    ss:cancel    speaking=false pending=false
 150695 tv    music:plan   from=game:bingo to=null
 150699 tv    ss:cancel    speaking=false pending=false
 150699 tv    music:plan   from=null to=lobby
 150699 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 151499 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"airport-lounge.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 156281 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156699 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157134 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157552 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157981 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 159048 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 159638 tv    ss:cancel    speaking=false pending=false
 159642 tv    music:plan   from=lobby to=null
 159642 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 160898 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 161143 tv    music:stop   track=airport-lounge.mp3
 162505 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 163782 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 165085 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 166112 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 167173 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 169731 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 169920 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 170091 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 170281 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"lobby-time.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 171411 tv    ss:cancel    speaking=false pending=false
 171414 tv    ss:cancel    speaking=false pending=false
 171414 tv    music:plan   from=null to=lobby
 171414 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 173419 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 173425 tv    ss:cancel    speaking=false pending=false
 173433 tv    music:plan   from=lobby to=null
 173433 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 174935 tv    music:stop   track=bossa-antigua.mp3
 175005 tv    music:plan   from=null to=game:broken-pencil
 175005 tv    music:start  plan=game:broken-pencil track=lobby-time mode=chain volume=0.2
 175005 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 176485 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 176956 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 177115 tv    music:plan   from=game:broken-pencil to=null
 177115 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 178615 tv    music:stop   track=lobby-time.mp3
```
