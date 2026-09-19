# Audio interaction trace

Captured 2026-09-19T01:05:48.460Z on port 42166. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**61 / 61 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.4}]

```
   2126 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   2163 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3516 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3689 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   4372 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   5004 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5857 tv    ss:cancel    speaking=false pending=false
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
   6699 tv    music:plan   from=lobby to=null
   6699 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   8203 tv    music:stop   track=airport-lounge.mp3
   8658 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9957 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16921 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17920 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18920 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19909 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20909 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21694 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22493 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22651 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22807 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22965 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23122 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23278 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23437 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23593 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23753 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23910 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24065 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24223 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24378 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24518 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24671 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24828 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24984 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  25127 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  25285 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  26156 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26485 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  28288 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  30025 tv    ss:cancel    speaking=false pending=false
  30026 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":1.4}]

```
  31594 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33764 tv    ss:cancel    speaking=false pending=false
  33764 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  35314 tv    ss:cancel    speaking=false pending=false
  35314 tv    music:plan   from=null to=lobby
  35314 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:local-forecast-elevator.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime** — cues=start,card,lock,lock,tick,tick,tick,call
- ✅ **the hand feels each card land (one 12 ms tap per card) and then the first call** — taps(12)=2 (1 card + the first call)
- ✅ **each Ready ticks (lock, rising); the 3 · 2 · 1's first tick comes a breath (≥ 300 ms) after the last** — locks=2 last lock→first tick=424ms
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+1027ms phone@+1025ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "another" is a 20 ms tap and one card pluck; Ready a 20 ms tap and the submit cue** — taps=3 cues=card,submit
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **each voice starts on the push (no delay); its boing lands on the squash, 170–230 ms later** — delays=0,0 boing lags=194,193ms
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18.9}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":25.8}]
- ✅ **skipping through the deck: a hush before every call, one voice at a time** — clips=41 hushes=41
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer,silence cheer@+5359ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":40.3}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the winner's celebration buzz (320 ms) runs whole — nothing shorter cuts it** — celebration@74832 cut by=[]
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5415ms cheer@+5374ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36890 tv    music:plan   from=lobby to=game:bingo
  36890 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36890 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  37198 tv    hush
  37199 tv    hush
  37700 tv    music:stop   track=local-forecast-elevator.mp3
  37853 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  39965 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  40480 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
  40904 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41904 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  42903 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  43893 tv    hush
  43893 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  43893 tv    speak        text=b9.wav voice=clip delayMs=0
  43895 tv    hush
  44085 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44471 tv    hush
  44471 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  44471 tv    speak        text=b8.wav voice=clip delayMs=0
  44665 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46300 tv    hush
  46300 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  46300 tv    speak        text=n34.wav voice=clip delayMs=0
  46493 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  48183 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  48452 tv    hush
  48452 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  48453 tv    hush
  53807 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  56806 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57812 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58817 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  59815 tv    hush
  59815 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  59815 tv    speak        text=n35.wav voice=clip delayMs=0
  60010 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61599 tv    music:paused paused=true
  61599 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  62854 tv    music:paused paused=false
  62854 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  64171 tv    hush
  64171 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  64171 tv    speak        text=i25.wav voice=clip delayMs=0
  64295 tv    hush
  64295 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  64295 tv    speak        text=n45.wav voice=clip delayMs=0
  64425 tv    hush
  64425 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  64425 tv    speak        text=n33.wav voice=clip delayMs=0
  64541 tv    hush
  64541 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  64541 tv    speak        text=g49.wav voice=clip delayMs=0
  64669 tv    hush
  64669 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  64669 tv    speak        text=b4.wav voice=clip delayMs=0
  64795 tv    hush
  64795 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  64795 tv    speak        text=i20.wav voice=clip delayMs=0
  64916 tv    hush
  64916 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  64916 tv    speak        text=o69.wav voice=clip delayMs=0
  65038 tv    hush
  65038 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  65038 tv    speak        text=o67.wav voice=clip delayMs=0
  65162 tv    hush
  65162 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  65162 tv    speak        text=o65.wav voice=clip delayMs=0
  65288 tv    hush
  65288 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  65288 tv    speak        text=o73.wav voice=clip delayMs=0
  65414 tv    hush
  65414 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  65414 tv    speak        text=i21.wav voice=clip delayMs=0
  65526 tv    hush
  65526 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  65526 tv    speak        text=i18.wav voice=clip delayMs=0
  65647 tv    hush
  65647 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  65647 tv    speak        text=g58.wav voice=clip delayMs=0
  65775 tv    hush
  65775 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  65775 tv    speak        text=n36.wav voice=clip delayMs=0
  65903 tv    hush
  65903 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  65903 tv    speak        text=o61.wav voice=clip delayMs=0
  66023 tv    hush
  66023 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  66023 tv    speak        text=n37.wav voice=clip delayMs=0
  66147 tv    hush
  66147 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  66147 tv    speak        text=i16.wav voice=clip delayMs=0
  66274 tv    hush
  66274 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  66274 tv    speak        text=g47.wav voice=clip delayMs=0
  66386 tv    hush
  66386 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  66386 tv    speak        text=n41.wav voice=clip delayMs=0
  66506 tv    hush
  66506 tv    clip         src=b6.wav muted=false ready=true delayMs=0
  66506 tv    speak        text=b6.wav voice=clip delayMs=0
  66626 tv    hush
  66626 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  66626 tv    speak        text=o72.wav voice=clip delayMs=0
  66765 tv    hush
  66765 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  66765 tv    speak        text=b3.wav voice=clip delayMs=0
  66886 tv    hush
  66886 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  66886 tv    speak        text=i30.wav voice=clip delayMs=0
  67011 tv    hush
  67011 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  67011 tv    speak        text=g56.wav voice=clip delayMs=0
  67135 tv    hush
  67135 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  67135 tv    speak        text=o75.wav voice=clip delayMs=0
  67260 tv    hush
  67260 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  67260 tv    speak        text=b1.wav voice=clip delayMs=0
  67386 tv    hush
  67386 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  67386 tv    speak        text=b2.wav voice=clip delayMs=0
  67487 tv    hush
  67487 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  67487 tv    speak        text=n32.wav voice=clip delayMs=0
  67606 tv    hush
  67606 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  67606 tv    speak        text=g48.wav voice=clip delayMs=0
  67726 tv    hush
  67726 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  67726 tv    speak        text=i23.wav voice=clip delayMs=0
  67856 tv    hush
  67856 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  67856 tv    speak        text=i26.wav voice=clip delayMs=0
  67976 tv    hush
  67976 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  67976 tv    speak        text=o66.wav voice=clip delayMs=0
  68097 tv    hush
  68097 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  68097 tv    speak        text=i19.wav voice=clip delayMs=0
  68232 tv    hush
  68232 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  68232 tv    speak        text=n42.wav voice=clip delayMs=0
  68359 tv    hush
  68359 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  68359 tv    speak        text=i24.wav voice=clip delayMs=0
  68481 tv    hush
  68481 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  68481 tv    speak        text=n39.wav voice=clip delayMs=0
  68605 tv    hush
  68605 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  68605 tv    speak        text=g46.wav voice=clip delayMs=0
  68727 tv    hush
  68727 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  68727 tv    speak        text=n44.wav voice=clip delayMs=0
  68851 tv    hush
  68851 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  68851 tv    speak        text=b15.wav voice=clip delayMs=0
  68963 tv    hush
  68963 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  68963 tv    speak        text=b11.wav voice=clip delayMs=0
  69092 tv    hush
  69092 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  69092 tv    speak        text=g57.wav voice=clip delayMs=0
  69284 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  69733 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  70015 tv    hush
  70015 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  70015 tv    hush
  71895 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  75374 tv    music:duck   ms=9000
  75374 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  75428 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  80227 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  80549 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81551 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82552 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  83547 tv    hush
  83547 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  83547 tv    speak        text=g57.wav voice=clip delayMs=0
  83747 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  85856 tv    ss:cancel    speaking=false pending=false
  85856 tv    music:plan   from=game:bingo to=null
  85862 tv    ss:cancel    speaking=false pending=false
  85862 tv    music:plan   from=null to=lobby
  85862 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
  86668 tv    music:stop   track=wallpaper.mp3
  88386 tv    ss:cancel    speaking=false pending=false
  88402 tv    music:plan   from=lobby to=game:bingo
  88402 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  88402 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  88408 tv    hush
  88408 tv    hush
  89022 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  89028 tv    hush
  89028 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  89028 tv    speak        text=i21.wav voice=clip delayMs=0
  89029 tv    hush
  89042 tv    hush
  89042 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  89042 tv    speak        text=n32.wav voice=clip delayMs=0
  89149 tv    hush
  89149 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  89149 tv    speak        text=i18.wav voice=clip delayMs=0
  89209 tv    music:stop   track=george-street-shuffle.mp3
  89223 tv    hush
  89223 tv    clip         src=n40.wav muted=false ready=true delayMs=0
  89223 tv    speak        text=n40.wav voice=clip delayMs=0
  89326 tv    hush
  89326 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  89326 tv    speak        text=i30.wav voice=clip delayMs=0
  89422 tv    hush
  89422 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  89422 tv    speak        text=o69.wav voice=clip delayMs=0
  89513 tv    hush
  89513 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  89513 tv    speak        text=o61.wav voice=clip delayMs=0
  89592 tv    hush
  89592 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  89592 tv    speak        text=n34.wav voice=clip delayMs=0
  89699 tv    hush
  89699 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  89699 tv    speak        text=n35.wav voice=clip delayMs=0
  89779 tv    hush
  89779 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  89779 tv    speak        text=o67.wav voice=clip delayMs=0
  89886 tv    hush
  89886 tv    clip         src=g55.wav muted=false ready=true delayMs=0
  89886 tv    speak        text=g55.wav voice=clip delayMs=0
  89978 tv    hush
  89978 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  89978 tv    speak        text=i26.wav voice=clip delayMs=0
  90070 tv    hush
  90070 tv    clip         src=i22.wav muted=false ready=true delayMs=0
  90070 tv    speak        text=i22.wav voice=clip delayMs=0
  90166 tv    hush
  90166 tv    clip         src=i29.wav muted=false ready=true delayMs=0
  90166 tv    speak        text=i29.wav voice=clip delayMs=0
  90259 tv    hush
  90259 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  90259 tv    speak        text=o66.wav voice=clip delayMs=0
  90364 tv    hush
  90364 tv    clip         src=g51.wav muted=false ready=true delayMs=0
  90364 tv    speak        text=g51.wav voice=clip delayMs=0
  90445 tv    hush
  90445 tv    clip         src=g53.wav muted=false ready=true delayMs=0
  90445 tv    speak        text=g53.wav voice=clip delayMs=0
  90552 tv    hush
  90552 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  90552 tv    speak        text=b9.wav voice=clip delayMs=0
  90649 tv    hush
  90649 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  90649 tv    speak        text=n36.wav voice=clip delayMs=0
  90729 tv    hush
  90729 tv    clip         src=g52.wav muted=false ready=true delayMs=0
  90729 tv    speak        text=g52.wav voice=clip delayMs=0
  90835 tv    hush
  90835 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  90835 tv    speak        text=b1.wav voice=clip delayMs=0
  90930 tv    hush
  90930 tv    clip         src=b13.wav muted=false ready=true delayMs=0
  90930 tv    speak        text=b13.wav voice=clip delayMs=0
  91026 tv    hush
  91026 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  91026 tv    speak        text=n37.wav voice=clip delayMs=0
  91116 tv    hush
  91116 tv    clip         src=o71.wav muted=false ready=true delayMs=0
  91116 tv    speak        text=o71.wav voice=clip delayMs=0
  91210 tv    hush
  91210 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  91210 tv    speak        text=b8.wav voice=clip delayMs=0
  91285 tv    hush
  91285 tv    clip         src=b5.wav muted=false ready=true delayMs=0
  91285 tv    speak        text=b5.wav voice=clip delayMs=0
  91384 tv    hush
  91384 tv    clip         src=b7.wav muted=false ready=true delayMs=0
  91384 tv    speak        text=b7.wav voice=clip delayMs=0
  91476 tv    hush
  91476 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  91476 tv    speak        text=n42.wav voice=clip delayMs=0
  91589 tv    hush
  91589 tv    clip         src=i28.wav muted=false ready=true delayMs=0
  91589 tv    speak        text=i28.wav voice=clip delayMs=0
  91676 tv    hush
  91676 tv    clip         src=i27.wav muted=false ready=true delayMs=0
  91676 tv    speak        text=i27.wav voice=clip delayMs=0
  91773 tv    hush
  91773 tv    clip         src=o63.wav muted=false ready=true delayMs=0
  91773 tv    speak        text=o63.wav voice=clip delayMs=0
  91866 tv    hush
  91866 tv    clip         src=o64.wav muted=false ready=true delayMs=0
  91866 tv    speak        text=o64.wav voice=clip delayMs=0
  91975 tv    hush
  91975 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  91975 tv    speak        text=o73.wav voice=clip delayMs=0
  92077 tv    hush
  92077 tv    clip         src=g50.wav muted=false ready=true delayMs=0
  92077 tv    speak        text=g50.wav voice=clip delayMs=0
  92164 tv    hush
  92164 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  92164 tv    speak        text=g48.wav voice=clip delayMs=0
  92257 tv    hush
  92257 tv    clip         src=b12.wav muted=false ready=true delayMs=0
  92257 tv    speak        text=b12.wav voice=clip delayMs=0
  92365 tv    hush
  92366 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  92366 tv    speak        text=n45.wav voice=clip delayMs=0
  92460 tv    hush
  92460 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  92460 tv    speak        text=b4.wav voice=clip delayMs=0
  92573 tv    hush
  92573 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  92573 tv    speak        text=g46.wav voice=clip delayMs=0
  92664 tv    hush
  92664 tv    clip         src=o74.wav muted=false ready=true delayMs=0
  92664 tv    speak        text=o74.wav voice=clip delayMs=0
  92743 tv    hush
  92743 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  92743 tv    speak        text=g47.wav voice=clip delayMs=0
  92830 tv    hush
  92830 tv    clip         src=n31.wav muted=false ready=true delayMs=0
  92830 tv    speak        text=n31.wav voice=clip delayMs=0
  92932 tv    hush
  92932 tv    clip         src=o62.wav muted=false ready=true delayMs=0
  92932 tv    speak        text=o62.wav voice=clip delayMs=0
  93028 tv    hush
  93028 tv    clip         src=b10.wav muted=false ready=true delayMs=0
  93028 tv    speak        text=b10.wav voice=clip delayMs=0
  93092 tv    hush
  93092 tv    clip         src=g60.wav muted=false ready=true delayMs=0
  93092 tv    speak        text=g60.wav voice=clip delayMs=0
  93195 tv    hush
  93195 tv    clip         src=n38.wav muted=false ready=true delayMs=0
  93195 tv    speak        text=n38.wav voice=clip delayMs=0
  93292 tv    hush
  93292 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  93292 tv    speak        text=n39.wav voice=clip delayMs=0
  93382 tv    hush
  93382 tv    clip         src=o70.wav muted=false ready=true delayMs=0
  93382 tv    speak        text=o70.wav voice=clip delayMs=0
  93476 tv    hush
  93476 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  93476 tv    speak        text=b11.wav voice=clip delayMs=0
  93539 tv    hush
  93539 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  93539 tv    speak        text=o75.wav voice=clip delayMs=0
  93647 tv    hush
  93647 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  93647 tv    speak        text=g58.wav voice=clip delayMs=0
  93730 tv    hush
  93730 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  93730 tv    speak        text=b15.wav voice=clip delayMs=0
  93850 tv    hush
  93850 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  93850 tv    speak        text=i24.wav voice=clip delayMs=0
  93925 tv    hush
  93925 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  93925 tv    speak        text=o72.wav voice=clip delayMs=0
  94023 tv    hush
  94023 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  94023 tv    speak        text=g56.wav voice=clip delayMs=0
  94119 tv    hush
  94119 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  94119 tv    speak        text=i20.wav voice=clip delayMs=0
  94210 tv    hush
  94210 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  94210 tv    speak        text=n44.wav voice=clip delayMs=0
  94322 tv    hush
  94322 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  94322 tv    speak        text=b3.wav voice=clip delayMs=0
  94408 tv    hush
  94408 tv    clip         src=o68.wav muted=false ready=true delayMs=0
  94408 tv    speak        text=o68.wav voice=clip delayMs=0
  94506 tv    hush
  94506 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  94506 tv    speak        text=b2.wav voice=clip delayMs=0
  94614 tv    hush
  94615 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  94615 tv    speak        text=n41.wav voice=clip delayMs=0
  94709 tv    hush
  94709 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  94709 tv    speak        text=o65.wav voice=clip delayMs=0
  94803 tv    hush
  94803 tv    clip         src=i17.wav muted=false ready=true delayMs=0
  94803 tv    speak        text=i17.wav voice=clip delayMs=0
  94896 tv    hush
  94896 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  94896 tv    speak        text=i25.wav voice=clip delayMs=0
  94960 tv    hush
  94960 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  94960 tv    speak        text=i19.wav voice=clip delayMs=0
  95052 tv    hush
  95052 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  95052 tv    speak        text=g57.wav voice=clip delayMs=0
  95134 tv    hush
  95134 tv    clip         src=g59.wav muted=false ready=true delayMs=0
  95134 tv    speak        text=g59.wav voice=clip delayMs=0
  95240 tv    hush
  95240 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  95240 tv    speak        text=g49.wav voice=clip delayMs=0
  95335 tv    hush
  95335 tv    clip         src=n43.wav muted=false ready=true delayMs=0
  95335 tv    speak        text=n43.wav voice=clip delayMs=0
  95417 tv    hush
  95417 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  95417 tv    speak        text=i16.wav voice=clip delayMs=0
  95507 tv    hush
  95507 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  95507 tv    speak        text=n33.wav voice=clip delayMs=0
  95623 tv    hush
  95623 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  95623 tv    speak        text=i23.wav voice=clip delayMs=0
  95713 tv    hush
  95713 tv    clip         src=g54.wav muted=false ready=true delayMs=0
  95713 tv    speak        text=g54.wav voice=clip delayMs=0
  95807 tv    hush
  95807 tv    clip         src=b14.wav muted=false ready=true delayMs=0
  95807 tv    speak        text=b14.wav voice=clip delayMs=0
  95998 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  97062 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  97322 tv    hush
  97323 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  97323 tv    hush
 104930 tv    music:duck   ms=9000
 104930 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 109951 tv    hush
 109951 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 109952 tv    hush
 113946 tv    ss:cancel    speaking=false pending=false
 113948 tv    music:plan   from=game:bingo to=null
 113948 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 115449 tv    music:stop   track=wallpaper.mp3
 115555 tv    ss:cancel    speaking=false pending=false
 115555 tv    music:plan   from=null to=lobby
 115555 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 118077 tv    ss:cancel    speaking=false pending=false
 118097 tv    music:plan   from=lobby to=game:bingo
 118097 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 118097 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 118102 tv    hush
 118103 tv    hush
 118707 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 118711 tv    hush
 118711 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 118711 tv    speak        text=i21.wav voice=clip delayMs=0
 118712 tv    hush
 118740 tv    hush
 118740 tv    clip         src=n32.wav muted=false ready=true delayMs=0
 118740 tv    speak        text=n32.wav voice=clip delayMs=0
 118834 tv    hush
 118834 tv    clip         src=i18.wav muted=false ready=true delayMs=0
 118834 tv    speak        text=i18.wav voice=clip delayMs=0
 118900 tv    music:stop   track=bossa-antigua.mp3
 118925 tv    hush
 118925 tv    clip         src=n40.wav muted=false ready=true delayMs=0
 118925 tv    speak        text=n40.wav voice=clip delayMs=0
 119023 tv    hush
 119023 tv    clip         src=i30.wav muted=false ready=true delayMs=0
 119023 tv    speak        text=i30.wav voice=clip delayMs=0
 119114 tv    hush
 119114 tv    clip         src=o69.wav muted=false ready=true delayMs=0
 119114 tv    speak        text=o69.wav voice=clip delayMs=0
 119208 tv    hush
 119208 tv    clip         src=o61.wav muted=false ready=true delayMs=0
 119208 tv    speak        text=o61.wav voice=clip delayMs=0
 119301 tv    hush
 119301 tv    clip         src=n34.wav muted=false ready=true delayMs=0
 119301 tv    speak        text=n34.wav voice=clip delayMs=0
 119395 tv    hush
 119395 tv    clip         src=n35.wav muted=false ready=true delayMs=0
 119395 tv    speak        text=n35.wav voice=clip delayMs=0
 119474 tv    hush
 119474 tv    clip         src=o67.wav muted=false ready=true delayMs=0
 119474 tv    speak        text=o67.wav voice=clip delayMs=0
 119582 tv    hush
 119582 tv    clip         src=g55.wav muted=false ready=true delayMs=0
 119582 tv    speak        text=g55.wav voice=clip delayMs=0
 119691 tv    hush
 119691 tv    clip         src=i26.wav muted=false ready=true delayMs=0
 119691 tv    speak        text=i26.wav voice=clip delayMs=0
 119813 tv    hush
 119813 tv    clip         src=i22.wav muted=false ready=true delayMs=0
 119813 tv    speak        text=i22.wav voice=clip delayMs=0
 119894 tv    hush
 119894 tv    clip         src=i29.wav muted=false ready=true delayMs=0
 119894 tv    speak        text=i29.wav voice=clip delayMs=0
 120004 tv    hush
 120004 tv    clip         src=o66.wav muted=false ready=true delayMs=0
 120004 tv    speak        text=o66.wav voice=clip delayMs=0
 120098 tv    hush
 120098 tv    clip         src=g51.wav muted=false ready=true delayMs=0
 120098 tv    speak        text=g51.wav voice=clip delayMs=0
 120192 tv    hush
 120193 tv    clip         src=g53.wav muted=false ready=true delayMs=0
 120193 tv    speak        text=g53.wav voice=clip delayMs=0
 120286 tv    hush
 120286 tv    clip         src=b9.wav muted=false ready=true delayMs=0
 120286 tv    speak        text=b9.wav voice=clip delayMs=0
 120392 tv    hush
 120392 tv    clip         src=n36.wav muted=false ready=true delayMs=0
 120392 tv    speak        text=n36.wav voice=clip delayMs=0
 120490 tv    hush
 120490 tv    clip         src=g52.wav muted=false ready=true delayMs=0
 120490 tv    speak        text=g52.wav voice=clip delayMs=0
 120602 tv    hush
 120602 tv    clip         src=b1.wav muted=false ready=true delayMs=0
 120602 tv    speak        text=b1.wav voice=clip delayMs=0
 120665 tv    hush
 120665 tv    clip         src=b13.wav muted=false ready=true delayMs=0
 120665 tv    speak        text=b13.wav voice=clip delayMs=0
 120774 tv    hush
 120774 tv    clip         src=n37.wav muted=false ready=true delayMs=0
 120774 tv    speak        text=n37.wav voice=clip delayMs=0
 120868 tv    hush
 120868 tv    clip         src=o71.wav muted=false ready=true delayMs=0
 120868 tv    speak        text=o71.wav voice=clip delayMs=0
 120963 tv    hush
 120963 tv    clip         src=b8.wav muted=false ready=true delayMs=0
 120963 tv    speak        text=b8.wav voice=clip delayMs=0
 121055 tv    hush
 121055 tv    clip         src=b5.wav muted=false ready=true delayMs=0
 121055 tv    speak        text=b5.wav voice=clip delayMs=0
 121149 tv    hush
 121149 tv    clip         src=b7.wav muted=false ready=true delayMs=0
 121149 tv    speak        text=b7.wav voice=clip delayMs=0
 121243 tv    hush
 121243 tv    clip         src=n42.wav muted=false ready=true delayMs=0
 121243 tv    speak        text=n42.wav voice=clip delayMs=0
 121340 tv    hush
 121340 tv    clip         src=i28.wav muted=false ready=true delayMs=0
 121340 tv    speak        text=i28.wav voice=clip delayMs=0
 121433 tv    hush
 121433 tv    clip         src=i27.wav muted=false ready=true delayMs=0
 121433 tv    speak        text=i27.wav voice=clip delayMs=0
 121547 tv    hush
 121547 tv    clip         src=o63.wav muted=false ready=true delayMs=0
 121547 tv    speak        text=o63.wav voice=clip delayMs=0
 121638 tv    hush
 121638 tv    clip         src=o64.wav muted=false ready=true delayMs=0
 121638 tv    speak        text=o64.wav voice=clip delayMs=0
 121729 tv    hush
 121729 tv    clip         src=o73.wav muted=false ready=true delayMs=0
 121729 tv    speak        text=o73.wav voice=clip delayMs=0
 121825 tv    hush
 121825 tv    clip         src=g50.wav muted=false ready=true delayMs=0
 121825 tv    speak        text=g50.wav voice=clip delayMs=0
 121919 tv    hush
 121919 tv    clip         src=g48.wav muted=false ready=true delayMs=0
 121919 tv    speak        text=g48.wav voice=clip delayMs=0
 122027 tv    hush
 122027 tv    clip         src=b12.wav muted=false ready=true delayMs=0
 122027 tv    speak        text=b12.wav voice=clip delayMs=0
 122124 tv    hush
 122124 tv    clip         src=n45.wav muted=false ready=true delayMs=0
 122124 tv    speak        text=n45.wav voice=clip delayMs=0
 122216 tv    hush
 122216 tv    clip         src=b4.wav muted=false ready=true delayMs=0
 122216 tv    speak        text=b4.wav voice=clip delayMs=0
 122324 tv    hush
 122324 tv    clip         src=g46.wav muted=false ready=true delayMs=0
 122324 tv    speak        text=g46.wav voice=clip delayMs=0
 122418 tv    hush
 122418 tv    clip         src=o74.wav muted=false ready=true delayMs=0
 122418 tv    speak        text=o74.wav voice=clip delayMs=0
 122527 tv    hush
 122527 tv    clip         src=g47.wav muted=false ready=true delayMs=0
 122527 tv    speak        text=g47.wav voice=clip delayMs=0
 122620 tv    hush
 122620 tv    clip         src=n31.wav muted=false ready=true delayMs=0
 122620 tv    speak        text=n31.wav voice=clip delayMs=0
 122713 tv    hush
 122713 tv    clip         src=o62.wav muted=false ready=true delayMs=0
 122713 tv    speak        text=o62.wav voice=clip delayMs=0
 122808 tv    hush
 122808 tv    clip         src=b10.wav muted=false ready=true delayMs=0
 122808 tv    speak        text=b10.wav voice=clip delayMs=0
 122902 tv    hush
 122902 tv    clip         src=g60.wav muted=false ready=true delayMs=0
 122902 tv    speak        text=g60.wav voice=clip delayMs=0
 123008 tv    hush
 123008 tv    clip         src=n38.wav muted=false ready=true delayMs=0
 123008 tv    speak        text=n38.wav voice=clip delayMs=0
 123102 tv    hush
 123102 tv    clip         src=n39.wav muted=false ready=true delayMs=0
 123102 tv    speak        text=n39.wav voice=clip delayMs=0
 123183 tv    hush
 123183 tv    clip         src=o70.wav muted=false ready=true delayMs=0
 123183 tv    speak        text=o70.wav voice=clip delayMs=0
 123274 tv    hush
 123274 tv    clip         src=b11.wav muted=false ready=true delayMs=0
 123274 tv    speak        text=b11.wav voice=clip delayMs=0
 123385 tv    hush
 123385 tv    clip         src=o75.wav muted=false ready=true delayMs=0
 123385 tv    speak        text=o75.wav voice=clip delayMs=0
 123478 tv    hush
 123478 tv    clip         src=g58.wav muted=false ready=true delayMs=0
 123478 tv    speak        text=g58.wav voice=clip delayMs=0
 123587 tv    hush
 123587 tv    clip         src=b15.wav muted=false ready=true delayMs=0
 123587 tv    speak        text=b15.wav voice=clip delayMs=0
 123680 tv    hush
 123680 tv    clip         src=i24.wav muted=false ready=true delayMs=0
 123680 tv    speak        text=i24.wav voice=clip delayMs=0
 123775 tv    hush
 123775 tv    clip         src=o72.wav muted=false ready=true delayMs=0
 123775 tv    speak        text=o72.wav voice=clip delayMs=0
 123871 tv    hush
 123871 tv    clip         src=g56.wav muted=false ready=true delayMs=0
 123871 tv    speak        text=g56.wav voice=clip delayMs=0
 123961 tv    hush
 123961 tv    clip         src=i20.wav muted=false ready=true delayMs=0
 123961 tv    speak        text=i20.wav voice=clip delayMs=0
 124042 tv    hush
 124042 tv    clip         src=n44.wav muted=false ready=true delayMs=0
 124042 tv    speak        text=n44.wav voice=clip delayMs=0
 124149 tv    hush
 124149 tv    clip         src=b3.wav muted=false ready=true delayMs=0
 124149 tv    speak        text=b3.wav voice=clip delayMs=0
 124232 tv    hush
 124232 tv    clip         src=o68.wav muted=false ready=true delayMs=0
 124232 tv    speak        text=o68.wav voice=clip delayMs=0
 124336 tv    hush
 124336 tv    clip         src=b2.wav muted=false ready=true delayMs=0
 124336 tv    speak        text=b2.wav voice=clip delayMs=0
 124432 tv    hush
 124432 tv    clip         src=n41.wav muted=false ready=true delayMs=0
 124432 tv    speak        text=n41.wav voice=clip delayMs=0
 124539 tv    hush
 124539 tv    clip         src=o65.wav muted=false ready=true delayMs=0
 124539 tv    speak        text=o65.wav voice=clip delayMs=0
 124632 tv    hush
 124632 tv    clip         src=i17.wav muted=false ready=true delayMs=0
 124632 tv    speak        text=i17.wav voice=clip delayMs=0
 124728 tv    hush
 124728 tv    clip         src=i25.wav muted=false ready=true delayMs=0
 124728 tv    speak        text=i25.wav voice=clip delayMs=0
 124824 tv    hush
 124824 tv    clip         src=i19.wav muted=false ready=true delayMs=0
 124824 tv    speak        text=i19.wav voice=clip delayMs=0
 124921 tv    hush
 124921 tv    clip         src=g57.wav muted=false ready=true delayMs=0
 124921 tv    speak        text=g57.wav voice=clip delayMs=0
 125012 tv    hush
 125012 tv    clip         src=g59.wav muted=false ready=true delayMs=0
 125012 tv    speak        text=g59.wav voice=clip delayMs=0
 125106 tv    hush
 125106 tv    clip         src=g49.wav muted=false ready=true delayMs=0
 125106 tv    speak        text=g49.wav voice=clip delayMs=0
 125200 tv    hush
 125200 tv    clip         src=n43.wav muted=false ready=true delayMs=0
 125200 tv    speak        text=n43.wav voice=clip delayMs=0
 125308 tv    hush
 125308 tv    clip         src=i16.wav muted=false ready=true delayMs=0
 125308 tv    speak        text=i16.wav voice=clip delayMs=0
 125416 tv    hush
 125416 tv    clip         src=n33.wav muted=false ready=true delayMs=0
 125416 tv    speak        text=n33.wav voice=clip delayMs=0
 125510 tv    hush
 125510 tv    clip         src=i23.wav muted=false ready=true delayMs=0
 125510 tv    speak        text=i23.wav voice=clip delayMs=0
 125605 tv    hush
 125606 tv    clip         src=g54.wav muted=false ready=true delayMs=0
 125606 tv    speak        text=g54.wav voice=clip delayMs=0
 125685 tv    hush
 125685 tv    clip         src=b14.wav muted=false ready=true delayMs=0
 125685 tv    speak        text=b14.wav voice=clip delayMs=0
 125877 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 126929 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 127194 tv    hush
 127195 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 127195 tv    hush
 134814 tv    music:duck   ms=9000
 134814 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 139813 tv    hush
 139813 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 139814 tv    hush
 141386 tv    ss:cancel    speaking=false pending=false
 141386 tv    music:plan   from=game:bingo to=null
 141390 tv    ss:cancel    speaking=false pending=false
 141390 tv    music:plan   from=null to=lobby
 141390 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 142199 tv    music:stop   track=wallpaper.mp3
 143902 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 143918 tv    ss:cancel    speaking=false pending=false
 143921 tv    music:plan   from=lobby to=game:bingo
 143921 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 143921 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 143930 tv    hush
 143931 tv    hush
 144581 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 144731 tv    music:stop   track=bossa-antigua.mp3
 145149 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
 146075 tv    ss:cancel    speaking=false pending=false
 146075 tv    music:plan   from=game:bingo to=null
 146075 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 147580 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 148253 tv    ss:cancel    speaking=false pending=false
 148253 tv    music:plan   from=null to=lobby
 148253 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 151651 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 151667 tv    ss:cancel    speaking=false pending=false
 151670 tv    music:plan   from=lobby to=game:bingo
 151671 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 151671 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 151677 tv    hush
 151677 tv    hush
 152089 tv    cue          cue=lock surface=tv muted=false ready=true semitones=8
 152095 tv    hush
 152095 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 152095 tv    speak        text=i21.wav voice=clip delayMs=0
 152095 tv    hush
 152286 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 152473 tv    music:stop   track=george-street-shuffle.mp3
 152588 tv    ss:cancel    speaking=false pending=false
 152588 tv    music:plan   from=game:bingo to=null
 152595 tv    ss:cancel    speaking=false pending=false
 152595 tv    music:plan   from=null to=lobby
 152595 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 153409 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.07,"t":10.3}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 158244 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158676 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 159091 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 159524 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 159957 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 161107 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 161716 tv    ss:cancel    speaking=false pending=false
 161725 tv    music:plan   from=lobby to=null
 161725 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 162992 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 163231 tv    music:stop   track=local-forecast-elevator.mp3
 164596 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 165912 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 167228 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 168315 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 169352 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 171949 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 172137 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 172325 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 172501 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"backbay-lounge.mp3","vol":0.2,"t":1.3}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 173655 tv    ss:cancel    speaking=false pending=false
 173660 tv    ss:cancel    speaking=false pending=false
 173660 tv    music:plan   from=null to=lobby
 173660 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 175676 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 175692 tv    ss:cancel    speaking=false pending=false
 175695 tv    music:plan   from=lobby to=null
 175695 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 177198 tv    music:stop   track=airport-lounge.mp3
 177265 tv    music:plan   from=null to=game:broken-pencil
 177265 tv    music:start  plan=game:broken-pencil track=backbay-lounge mode=chain volume=0.2
 177265 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 178732 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 179200 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 179355 tv    music:plan   from=game:broken-pencil to=null
 179355 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 180857 tv    music:stop   track=backbay-lounge.mp3
```
