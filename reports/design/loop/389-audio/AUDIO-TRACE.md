# Audio interaction trace

Captured 2026-09-19T01:38:29.292Z on port 42166. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**61 / 61 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:bossa-antigua
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":4.3}]

```
   1779 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   1824 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3132 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3268 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3963 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4601 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
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
   9536 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16506 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17508 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18508 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19508 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20508 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21317 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22113 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22270 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22428 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22583 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22740 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22882 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23022 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23181 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23337 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23495 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23651 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23791 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23949 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24105 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24247 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24402 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24558 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24699 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24854 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25729 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26059 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27863 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29599 tv    ss:cancel    speaking=false pending=false
  29599 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":1.5}]

```
  31146 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33296 tv    ss:cancel    speaking=false pending=false
  33296 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34847 tv    ss:cancel    speaking=false pending=false
  34847 tv    music:plan   from=null to=lobby
  34847 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:local-forecast-elevator.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime** — cues=start,card,lock,lock,tick,tick,tick,call
- ✅ **the hand feels each card land (one 12 ms tap per card) and then the first call** — taps(12)=2 (1 card + the first call)
- ✅ **each Ready ticks (lock, rising); the 3 · 2 · 1's first tick comes a breath (≥ 300 ms) after the last** — locks=2 last lock→first tick=415ms
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+998ms phone@+1007ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "another" is a 20 ms tap and one card pluck; Ready a 20 ms tap and the submit cue** — taps=3 cues=card,submit
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **each voice starts on the push (no delay); its boing lands on the squash, 170–230 ms later** — delays=0,0 boing lags=193,191ms
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":18.9}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":25.8}]
- ✅ **skipping through the deck: a hush before every call, one voice at a time** — clips=41 hushes=41
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer,silence cheer@+5355ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":40.3}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the winner's celebration buzz (320 ms) runs whole — nothing shorter cuts it** — celebration@74359 cut by=[]
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5408ms cheer@+5364ms cues=
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
  36406 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36406 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36711 tv    hush
  36711 tv    hush
  37207 tv    music:stop   track=local-forecast-elevator.mp3
  37363 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  39482 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  39998 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
  40413 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41413 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  42412 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  43398 tv    hush
  43398 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  43398 tv    speak        text=b9.wav voice=clip delayMs=0
  43399 tv    hush
  43590 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43946 tv    hush
  43946 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  43946 tv    speak        text=b8.wav voice=clip delayMs=0
  44139 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45765 tv    hush
  45765 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  45765 tv    speak        text=n34.wav voice=clip delayMs=0
  45956 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  47631 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47898 tv    hush
  47898 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47898 tv    hush
  53250 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  56260 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57261 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58261 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  59268 tv    hush
  59268 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  59268 tv    speak        text=n35.wav voice=clip delayMs=0
  59467 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61032 tv    music:paused paused=true
  61032 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  62281 tv    music:paused paused=false
  62282 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  63577 tv    hush
  63577 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  63577 tv    speak        text=i25.wav voice=clip delayMs=0
  63702 tv    hush
  63702 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  63702 tv    speak        text=n45.wav voice=clip delayMs=0
  63827 tv    hush
  63827 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  63827 tv    speak        text=n33.wav voice=clip delayMs=0
  63951 tv    hush
  63951 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  63951 tv    speak        text=g49.wav voice=clip delayMs=0
  64075 tv    hush
  64075 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  64075 tv    speak        text=b4.wav voice=clip delayMs=0
  64199 tv    hush
  64199 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  64199 tv    speak        text=i20.wav voice=clip delayMs=0
  64323 tv    hush
  64323 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  64323 tv    speak        text=o69.wav voice=clip delayMs=0
  64449 tv    hush
  64449 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  64449 tv    speak        text=o67.wav voice=clip delayMs=0
  64574 tv    hush
  64574 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  64574 tv    speak        text=o65.wav voice=clip delayMs=0
  64699 tv    hush
  64699 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  64699 tv    speak        text=o73.wav voice=clip delayMs=0
  64824 tv    hush
  64824 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  64824 tv    speak        text=i21.wav voice=clip delayMs=0
  64950 tv    hush
  64950 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  64950 tv    speak        text=i18.wav voice=clip delayMs=0
  65075 tv    hush
  65075 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  65075 tv    speak        text=g58.wav voice=clip delayMs=0
  65200 tv    hush
  65200 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  65200 tv    speak        text=n36.wav voice=clip delayMs=0
  65322 tv    hush
  65322 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  65322 tv    speak        text=o61.wav voice=clip delayMs=0
  65448 tv    hush
  65448 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  65448 tv    speak        text=n37.wav voice=clip delayMs=0
  65576 tv    hush
  65576 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  65576 tv    speak        text=i16.wav voice=clip delayMs=0
  65700 tv    hush
  65700 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  65700 tv    speak        text=g47.wav voice=clip delayMs=0
  65827 tv    hush
  65827 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  65827 tv    speak        text=n41.wav voice=clip delayMs=0
  65951 tv    hush
  65951 tv    clip         src=b6.wav muted=false ready=true delayMs=0
  65951 tv    speak        text=b6.wav voice=clip delayMs=0
  66077 tv    hush
  66077 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  66077 tv    speak        text=o72.wav voice=clip delayMs=0
  66200 tv    hush
  66200 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  66200 tv    speak        text=b3.wav voice=clip delayMs=0
  66325 tv    hush
  66325 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  66325 tv    speak        text=i30.wav voice=clip delayMs=0
  66449 tv    hush
  66449 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  66449 tv    speak        text=g56.wav voice=clip delayMs=0
  66576 tv    hush
  66576 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  66576 tv    speak        text=o75.wav voice=clip delayMs=0
  66700 tv    hush
  66700 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  66700 tv    speak        text=b1.wav voice=clip delayMs=0
  66823 tv    hush
  66823 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  66823 tv    speak        text=b2.wav voice=clip delayMs=0
  66950 tv    hush
  66950 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  66950 tv    speak        text=n32.wav voice=clip delayMs=0
  67076 tv    hush
  67076 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  67076 tv    speak        text=g48.wav voice=clip delayMs=0
  67186 tv    hush
  67186 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  67186 tv    speak        text=i23.wav voice=clip delayMs=0
  67312 tv    hush
  67312 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  67312 tv    speak        text=i26.wav voice=clip delayMs=0
  67437 tv    hush
  67437 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  67437 tv    speak        text=o66.wav voice=clip delayMs=0
  67560 tv    hush
  67560 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  67560 tv    speak        text=i19.wav voice=clip delayMs=0
  67686 tv    hush
  67686 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  67686 tv    speak        text=n42.wav voice=clip delayMs=0
  67811 tv    hush
  67811 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  67811 tv    speak        text=i24.wav voice=clip delayMs=0
  67920 tv    hush
  67920 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  67920 tv    speak        text=n39.wav voice=clip delayMs=0
  68044 tv    hush
  68044 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  68044 tv    speak        text=g46.wav voice=clip delayMs=0
  68167 tv    hush
  68167 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  68168 tv    speak        text=n44.wav voice=clip delayMs=0
  68294 tv    hush
  68294 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  68294 tv    speak        text=b15.wav voice=clip delayMs=0
  68419 tv    hush
  68419 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  68419 tv    speak        text=b11.wav voice=clip delayMs=0
  68545 tv    hush
  68545 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  68545 tv    speak        text=g57.wav voice=clip delayMs=0
  68736 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  69165 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  69441 tv    hush
  69441 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  69441 tv    hush
  71315 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  74796 tv    music:duck   ms=9000
  74796 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  74848 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79586 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79914 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80915 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81916 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82914 tv    hush
  82914 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  82914 tv    speak        text=g57.wav voice=clip delayMs=0
  83105 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  85241 tv    ss:cancel    speaking=false pending=false
  85241 tv    music:plan   from=game:bingo to=null
  85244 tv    ss:cancel    speaking=false pending=false
  85244 tv    music:plan   from=null to=lobby
  85244 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  86046 tv    music:stop   track=cool-vibes.mp3
  87755 tv    ss:cancel    speaking=false pending=false
  87765 tv    music:plan   from=lobby to=game:bingo
  87765 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  87765 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  87768 tv    hush
  87768 tv    hush
  88379 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  88382 tv    hush
  88382 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  88382 tv    speak        text=i21.wav voice=clip delayMs=0
  88382 tv    hush
  88389 tv    hush
  88389 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  88389 tv    speak        text=n32.wav voice=clip delayMs=0
  88489 tv    hush
  88489 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  88489 tv    speak        text=i18.wav voice=clip delayMs=0
  88565 tv    music:stop   track=bossa-antigua.mp3
  88571 tv    hush
  88571 tv    clip         src=n40.wav muted=false ready=true delayMs=0
  88571 tv    speak        text=n40.wav voice=clip delayMs=0
  88676 tv    hush
  88676 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  88676 tv    speak        text=i30.wav voice=clip delayMs=0
  88768 tv    hush
  88768 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  88768 tv    speak        text=o69.wav voice=clip delayMs=0
  88862 tv    hush
  88862 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  88862 tv    speak        text=o61.wav voice=clip delayMs=0
  88955 tv    hush
  88955 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  88955 tv    speak        text=n34.wav voice=clip delayMs=0
  89049 tv    hush
  89049 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  89049 tv    speak        text=n35.wav voice=clip delayMs=0
  89143 tv    hush
  89143 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  89143 tv    speak        text=o67.wav voice=clip delayMs=0
  89237 tv    hush
  89237 tv    clip         src=g55.wav muted=false ready=true delayMs=0
  89237 tv    speak        text=g55.wav voice=clip delayMs=0
  89331 tv    hush
  89331 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  89331 tv    speak        text=i26.wav voice=clip delayMs=0
  89426 tv    hush
  89426 tv    clip         src=i22.wav muted=false ready=true delayMs=0
  89426 tv    speak        text=i22.wav voice=clip delayMs=0
  89520 tv    hush
  89520 tv    clip         src=i29.wav muted=false ready=true delayMs=0
  89520 tv    speak        text=i29.wav voice=clip delayMs=0
  89613 tv    hush
  89613 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  89613 tv    speak        text=o66.wav voice=clip delayMs=0
  89708 tv    hush
  89708 tv    clip         src=g51.wav muted=false ready=true delayMs=0
  89708 tv    speak        text=g51.wav voice=clip delayMs=0
  89800 tv    hush
  89800 tv    clip         src=g53.wav muted=false ready=true delayMs=0
  89800 tv    speak        text=g53.wav voice=clip delayMs=0
  89895 tv    hush
  89895 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  89895 tv    speak        text=b9.wav voice=clip delayMs=0
  89987 tv    hush
  89987 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  89987 tv    speak        text=n36.wav voice=clip delayMs=0
  90081 tv    hush
  90081 tv    clip         src=g52.wav muted=false ready=true delayMs=0
  90081 tv    speak        text=g52.wav voice=clip delayMs=0
  90175 tv    hush
  90175 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  90175 tv    speak        text=b1.wav voice=clip delayMs=0
  90252 tv    hush
  90252 tv    clip         src=b13.wav muted=false ready=true delayMs=0
  90252 tv    speak        text=b13.wav voice=clip delayMs=0
  90345 tv    hush
  90345 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  90345 tv    speak        text=n37.wav voice=clip delayMs=0
  90440 tv    hush
  90440 tv    clip         src=o71.wav muted=false ready=true delayMs=0
  90440 tv    speak        text=o71.wav voice=clip delayMs=0
  90545 tv    hush
  90545 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  90545 tv    speak        text=b8.wav voice=clip delayMs=0
  90643 tv    hush
  90643 tv    clip         src=b5.wav muted=false ready=true delayMs=0
  90643 tv    speak        text=b5.wav voice=clip delayMs=0
  90735 tv    hush
  90735 tv    clip         src=b7.wav muted=false ready=true delayMs=0
  90735 tv    speak        text=b7.wav voice=clip delayMs=0
  90829 tv    hush
  90829 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  90829 tv    speak        text=n42.wav voice=clip delayMs=0
  90923 tv    hush
  90923 tv    clip         src=i28.wav muted=false ready=true delayMs=0
  90923 tv    speak        text=i28.wav voice=clip delayMs=0
  91016 tv    hush
  91016 tv    clip         src=i27.wav muted=false ready=true delayMs=0
  91016 tv    speak        text=i27.wav voice=clip delayMs=0
  91111 tv    hush
  91111 tv    clip         src=o63.wav muted=false ready=true delayMs=0
  91111 tv    speak        text=o63.wav voice=clip delayMs=0
  91204 tv    hush
  91204 tv    clip         src=o64.wav muted=false ready=true delayMs=0
  91204 tv    speak        text=o64.wav voice=clip delayMs=0
  91297 tv    hush
  91297 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  91297 tv    speak        text=o73.wav voice=clip delayMs=0
  91391 tv    hush
  91392 tv    clip         src=g50.wav muted=false ready=true delayMs=0
  91392 tv    speak        text=g50.wav voice=clip delayMs=0
  91484 tv    hush
  91484 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  91484 tv    speak        text=g48.wav voice=clip delayMs=0
  91578 tv    hush
  91578 tv    clip         src=b12.wav muted=false ready=true delayMs=0
  91578 tv    speak        text=b12.wav voice=clip delayMs=0
  91670 tv    hush
  91670 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  91670 tv    speak        text=n45.wav voice=clip delayMs=0
  91765 tv    hush
  91765 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  91765 tv    speak        text=b4.wav voice=clip delayMs=0
  91860 tv    hush
  91860 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  91860 tv    speak        text=g46.wav voice=clip delayMs=0
  91954 tv    hush
  91954 tv    clip         src=o74.wav muted=false ready=true delayMs=0
  91954 tv    speak        text=o74.wav voice=clip delayMs=0
  92048 tv    hush
  92048 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  92048 tv    speak        text=g47.wav voice=clip delayMs=0
  92143 tv    hush
  92143 tv    clip         src=n31.wav muted=false ready=true delayMs=0
  92143 tv    speak        text=n31.wav voice=clip delayMs=0
  92235 tv    hush
  92235 tv    clip         src=o62.wav muted=false ready=true delayMs=0
  92235 tv    speak        text=o62.wav voice=clip delayMs=0
  92330 tv    hush
  92330 tv    clip         src=b10.wav muted=false ready=true delayMs=0
  92330 tv    speak        text=b10.wav voice=clip delayMs=0
  92424 tv    hush
  92424 tv    clip         src=g60.wav muted=false ready=true delayMs=0
  92424 tv    speak        text=g60.wav voice=clip delayMs=0
  92516 tv    hush
  92516 tv    clip         src=n38.wav muted=false ready=true delayMs=0
  92516 tv    speak        text=n38.wav voice=clip delayMs=0
  92610 tv    hush
  92610 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  92610 tv    speak        text=n39.wav voice=clip delayMs=0
  92703 tv    hush
  92703 tv    clip         src=o70.wav muted=false ready=true delayMs=0
  92703 tv    speak        text=o70.wav voice=clip delayMs=0
  92797 tv    hush
  92797 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  92797 tv    speak        text=b11.wav voice=clip delayMs=0
  92892 tv    hush
  92892 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  92892 tv    speak        text=o75.wav voice=clip delayMs=0
  92986 tv    hush
  92986 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  92986 tv    speak        text=g58.wav voice=clip delayMs=0
  93079 tv    hush
  93079 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  93079 tv    speak        text=b15.wav voice=clip delayMs=0
  93159 tv    hush
  93159 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  93159 tv    speak        text=i24.wav voice=clip delayMs=0
  93252 tv    hush
  93252 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  93252 tv    speak        text=o72.wav voice=clip delayMs=0
  93345 tv    hush
  93345 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  93345 tv    speak        text=g56.wav voice=clip delayMs=0
  93438 tv    hush
  93438 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  93438 tv    speak        text=i20.wav voice=clip delayMs=0
  93532 tv    hush
  93532 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  93532 tv    speak        text=n44.wav voice=clip delayMs=0
  93628 tv    hush
  93628 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  93628 tv    speak        text=b3.wav voice=clip delayMs=0
  93736 tv    hush
  93736 tv    clip         src=o68.wav muted=false ready=true delayMs=0
  93736 tv    speak        text=o68.wav voice=clip delayMs=0
  93829 tv    hush
  93829 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  93829 tv    speak        text=b2.wav voice=clip delayMs=0
  93922 tv    hush
  93922 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  93922 tv    speak        text=n41.wav voice=clip delayMs=0
  94014 tv    hush
  94014 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  94014 tv    speak        text=o65.wav voice=clip delayMs=0
  94109 tv    hush
  94109 tv    clip         src=i17.wav muted=false ready=true delayMs=0
  94109 tv    speak        text=i17.wav voice=clip delayMs=0
  94201 tv    hush
  94201 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  94201 tv    speak        text=i25.wav voice=clip delayMs=0
  94295 tv    hush
  94295 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  94295 tv    speak        text=i19.wav voice=clip delayMs=0
  94388 tv    hush
  94388 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  94388 tv    speak        text=g57.wav voice=clip delayMs=0
  94483 tv    hush
  94483 tv    clip         src=g59.wav muted=false ready=true delayMs=0
  94483 tv    speak        text=g59.wav voice=clip delayMs=0
  94575 tv    hush
  94576 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  94576 tv    speak        text=g49.wav voice=clip delayMs=0
  94670 tv    hush
  94670 tv    clip         src=n43.wav muted=false ready=true delayMs=0
  94670 tv    speak        text=n43.wav voice=clip delayMs=0
  94763 tv    hush
  94763 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  94763 tv    speak        text=i16.wav voice=clip delayMs=0
  94871 tv    hush
  94871 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  94871 tv    speak        text=n33.wav voice=clip delayMs=0
  94965 tv    hush
  94965 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  94965 tv    speak        text=i23.wav voice=clip delayMs=0
  95060 tv    hush
  95060 tv    clip         src=g54.wav muted=false ready=true delayMs=0
  95060 tv    speak        text=g54.wav voice=clip delayMs=0
  95154 tv    hush
  95154 tv    clip         src=b14.wav muted=false ready=true delayMs=0
  95154 tv    speak        text=b14.wav voice=clip delayMs=0
  95345 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  96397 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  96658 tv    hush
  96658 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  96658 tv    hush
 104261 tv    music:duck   ms=9000
 104261 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 109281 tv    hush
 109281 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 109282 tv    hush
 113280 tv    ss:cancel    speaking=false pending=false
 113280 tv    music:plan   from=game:bingo to=null
 113280 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 114783 tv    music:stop   track=wallpaper.mp3
 114906 tv    ss:cancel    speaking=false pending=false
 114906 tv    music:plan   from=null to=lobby
 114907 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 117427 tv    ss:cancel    speaking=false pending=false
 117434 tv    music:plan   from=lobby to=game:bingo
 117434 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 117434 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 117437 tv    hush
 117438 tv    hush
 118049 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 118052 tv    hush
 118052 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 118052 tv    speak        text=i21.wav voice=clip delayMs=0
 118052 tv    hush
 118067 tv    hush
 118067 tv    clip         src=n32.wav muted=false ready=true delayMs=0
 118067 tv    speak        text=n32.wav voice=clip delayMs=0
 118164 tv    hush
 118164 tv    clip         src=i18.wav muted=false ready=true delayMs=0
 118164 tv    speak        text=i18.wav voice=clip delayMs=0
 118235 tv    music:stop   track=bossa-antigua.mp3
 118256 tv    hush
 118256 tv    clip         src=n40.wav muted=false ready=true delayMs=0
 118256 tv    speak        text=n40.wav voice=clip delayMs=0
 118348 tv    hush
 118348 tv    clip         src=i30.wav muted=false ready=true delayMs=0
 118348 tv    speak        text=i30.wav voice=clip delayMs=0
 118443 tv    hush
 118443 tv    clip         src=o69.wav muted=false ready=true delayMs=0
 118443 tv    speak        text=o69.wav voice=clip delayMs=0
 118536 tv    hush
 118536 tv    clip         src=o61.wav muted=false ready=true delayMs=0
 118536 tv    speak        text=o61.wav voice=clip delayMs=0
 118629 tv    hush
 118629 tv    clip         src=n34.wav muted=false ready=true delayMs=0
 118629 tv    speak        text=n34.wav voice=clip delayMs=0
 118723 tv    hush
 118723 tv    clip         src=n35.wav muted=false ready=true delayMs=0
 118723 tv    speak        text=n35.wav voice=clip delayMs=0
 118816 tv    hush
 118816 tv    clip         src=o67.wav muted=false ready=true delayMs=0
 118816 tv    speak        text=o67.wav voice=clip delayMs=0
 118914 tv    hush
 118914 tv    clip         src=g55.wav muted=false ready=true delayMs=0
 118914 tv    speak        text=g55.wav voice=clip delayMs=0
 119005 tv    hush
 119005 tv    clip         src=i26.wav muted=false ready=true delayMs=0
 119005 tv    speak        text=i26.wav voice=clip delayMs=0
 119085 tv    hush
 119085 tv    clip         src=i22.wav muted=false ready=true delayMs=0
 119085 tv    speak        text=i22.wav voice=clip delayMs=0
 119176 tv    hush
 119176 tv    clip         src=i29.wav muted=false ready=true delayMs=0
 119176 tv    speak        text=i29.wav voice=clip delayMs=0
 119270 tv    hush
 119270 tv    clip         src=o66.wav muted=false ready=true delayMs=0
 119270 tv    speak        text=o66.wav voice=clip delayMs=0
 119363 tv    hush
 119363 tv    clip         src=g51.wav muted=false ready=true delayMs=0
 119363 tv    speak        text=g51.wav voice=clip delayMs=0
 119458 tv    hush
 119458 tv    clip         src=g53.wav muted=false ready=true delayMs=0
 119458 tv    speak        text=g53.wav voice=clip delayMs=0
 119535 tv    hush
 119535 tv    clip         src=b9.wav muted=false ready=true delayMs=0
 119535 tv    speak        text=b9.wav voice=clip delayMs=0
 119628 tv    hush
 119628 tv    clip         src=n36.wav muted=false ready=true delayMs=0
 119628 tv    speak        text=n36.wav voice=clip delayMs=0
 119707 tv    hush
 119707 tv    clip         src=g52.wav muted=false ready=true delayMs=0
 119707 tv    speak        text=g52.wav voice=clip delayMs=0
 119800 tv    hush
 119800 tv    clip         src=b1.wav muted=false ready=true delayMs=0
 119800 tv    speak        text=b1.wav voice=clip delayMs=0
 119896 tv    hush
 119896 tv    clip         src=b13.wav muted=false ready=true delayMs=0
 119896 tv    speak        text=b13.wav voice=clip delayMs=0
 119990 tv    hush
 119990 tv    clip         src=n37.wav muted=false ready=true delayMs=0
 119990 tv    speak        text=n37.wav voice=clip delayMs=0
 120085 tv    hush
 120085 tv    clip         src=o71.wav muted=false ready=true delayMs=0
 120085 tv    speak        text=o71.wav voice=clip delayMs=0
 120181 tv    hush
 120181 tv    clip         src=b8.wav muted=false ready=true delayMs=0
 120181 tv    speak        text=b8.wav voice=clip delayMs=0
 120273 tv    hush
 120273 tv    clip         src=b5.wav muted=false ready=true delayMs=0
 120273 tv    speak        text=b5.wav voice=clip delayMs=0
 120354 tv    hush
 120354 tv    clip         src=b7.wav muted=false ready=true delayMs=0
 120354 tv    speak        text=b7.wav voice=clip delayMs=0
 120446 tv    hush
 120446 tv    clip         src=n42.wav muted=false ready=true delayMs=0
 120446 tv    speak        text=n42.wav voice=clip delayMs=0
 120539 tv    hush
 120539 tv    clip         src=i28.wav muted=false ready=true delayMs=0
 120539 tv    speak        text=i28.wav voice=clip delayMs=0
 120634 tv    hush
 120634 tv    clip         src=i27.wav muted=false ready=true delayMs=0
 120634 tv    speak        text=i27.wav voice=clip delayMs=0
 120726 tv    hush
 120726 tv    clip         src=o63.wav muted=false ready=true delayMs=0
 120726 tv    speak        text=o63.wav voice=clip delayMs=0
 120819 tv    hush
 120819 tv    clip         src=o64.wav muted=false ready=true delayMs=0
 120819 tv    speak        text=o64.wav voice=clip delayMs=0
 120913 tv    hush
 120913 tv    clip         src=o73.wav muted=false ready=true delayMs=0
 120913 tv    speak        text=o73.wav voice=clip delayMs=0
 120992 tv    hush
 120992 tv    clip         src=g50.wav muted=false ready=true delayMs=0
 120992 tv    speak        text=g50.wav voice=clip delayMs=0
 121085 tv    hush
 121085 tv    clip         src=g48.wav muted=false ready=true delayMs=0
 121085 tv    speak        text=g48.wav voice=clip delayMs=0
 121177 tv    hush
 121177 tv    clip         src=b12.wav muted=false ready=true delayMs=0
 121177 tv    speak        text=b12.wav voice=clip delayMs=0
 121272 tv    hush
 121272 tv    clip         src=n45.wav muted=false ready=true delayMs=0
 121272 tv    speak        text=n45.wav voice=clip delayMs=0
 121364 tv    hush
 121364 tv    clip         src=b4.wav muted=false ready=true delayMs=0
 121364 tv    speak        text=b4.wav voice=clip delayMs=0
 121458 tv    hush
 121458 tv    clip         src=g46.wav muted=false ready=true delayMs=0
 121458 tv    speak        text=g46.wav voice=clip delayMs=0
 121552 tv    hush
 121552 tv    clip         src=o74.wav muted=false ready=true delayMs=0
 121552 tv    speak        text=o74.wav voice=clip delayMs=0
 121644 tv    hush
 121644 tv    clip         src=g47.wav muted=false ready=true delayMs=0
 121644 tv    speak        text=g47.wav voice=clip delayMs=0
 121737 tv    hush
 121737 tv    clip         src=n31.wav muted=false ready=true delayMs=0
 121737 tv    speak        text=n31.wav voice=clip delayMs=0
 121831 tv    hush
 121831 tv    clip         src=o62.wav muted=false ready=true delayMs=0
 121831 tv    speak        text=o62.wav voice=clip delayMs=0
 121925 tv    hush
 121925 tv    clip         src=b10.wav muted=false ready=true delayMs=0
 121925 tv    speak        text=b10.wav voice=clip delayMs=0
 122020 tv    hush
 122020 tv    clip         src=g60.wav muted=false ready=true delayMs=0
 122020 tv    speak        text=g60.wav voice=clip delayMs=0
 122115 tv    hush
 122115 tv    clip         src=n38.wav muted=false ready=true delayMs=0
 122115 tv    speak        text=n38.wav voice=clip delayMs=0
 122209 tv    hush
 122209 tv    clip         src=n39.wav muted=false ready=true delayMs=0
 122209 tv    speak        text=n39.wav voice=clip delayMs=0
 122304 tv    hush
 122304 tv    clip         src=o70.wav muted=false ready=true delayMs=0
 122304 tv    speak        text=o70.wav voice=clip delayMs=0
 122382 tv    hush
 122382 tv    clip         src=b11.wav muted=false ready=true delayMs=0
 122382 tv    speak        text=b11.wav voice=clip delayMs=0
 122475 tv    hush
 122475 tv    clip         src=o75.wav muted=false ready=true delayMs=0
 122475 tv    speak        text=o75.wav voice=clip delayMs=0
 122569 tv    hush
 122569 tv    clip         src=g58.wav muted=false ready=true delayMs=0
 122569 tv    speak        text=g58.wav voice=clip delayMs=0
 122663 tv    hush
 122663 tv    clip         src=b15.wav muted=false ready=true delayMs=0
 122663 tv    speak        text=b15.wav voice=clip delayMs=0
 122757 tv    hush
 122757 tv    clip         src=i24.wav muted=false ready=true delayMs=0
 122757 tv    speak        text=i24.wav voice=clip delayMs=0
 122853 tv    hush
 122853 tv    clip         src=o72.wav muted=false ready=true delayMs=0
 122853 tv    speak        text=o72.wav voice=clip delayMs=0
 122945 tv    hush
 122945 tv    clip         src=g56.wav muted=false ready=true delayMs=0
 122945 tv    speak        text=g56.wav voice=clip delayMs=0
 123039 tv    hush
 123039 tv    clip         src=i20.wav muted=false ready=true delayMs=0
 123039 tv    speak        text=i20.wav voice=clip delayMs=0
 123131 tv    hush
 123131 tv    clip         src=n44.wav muted=false ready=true delayMs=0
 123131 tv    speak        text=n44.wav voice=clip delayMs=0
 123223 tv    hush
 123223 tv    clip         src=b3.wav muted=false ready=true delayMs=0
 123223 tv    speak        text=b3.wav voice=clip delayMs=0
 123316 tv    hush
 123316 tv    clip         src=o68.wav muted=false ready=true delayMs=0
 123316 tv    speak        text=o68.wav voice=clip delayMs=0
 123412 tv    hush
 123412 tv    clip         src=b2.wav muted=false ready=true delayMs=0
 123412 tv    speak        text=b2.wav voice=clip delayMs=0
 123507 tv    hush
 123507 tv    clip         src=n41.wav muted=false ready=true delayMs=0
 123507 tv    speak        text=n41.wav voice=clip delayMs=0
 123600 tv    hush
 123600 tv    clip         src=o65.wav muted=false ready=true delayMs=0
 123600 tv    speak        text=o65.wav voice=clip delayMs=0
 123693 tv    hush
 123693 tv    clip         src=i17.wav muted=false ready=true delayMs=0
 123693 tv    speak        text=i17.wav voice=clip delayMs=0
 123786 tv    hush
 123786 tv    clip         src=i25.wav muted=false ready=true delayMs=0
 123786 tv    speak        text=i25.wav voice=clip delayMs=0
 123880 tv    hush
 123880 tv    clip         src=i19.wav muted=false ready=true delayMs=0
 123880 tv    speak        text=i19.wav voice=clip delayMs=0
 123975 tv    hush
 123975 tv    clip         src=g57.wav muted=false ready=true delayMs=0
 123975 tv    speak        text=g57.wav voice=clip delayMs=0
 124068 tv    hush
 124068 tv    clip         src=g59.wav muted=false ready=true delayMs=0
 124068 tv    speak        text=g59.wav voice=clip delayMs=0
 124162 tv    hush
 124162 tv    clip         src=g49.wav muted=false ready=true delayMs=0
 124162 tv    speak        text=g49.wav voice=clip delayMs=0
 124257 tv    hush
 124257 tv    clip         src=n43.wav muted=false ready=true delayMs=0
 124257 tv    speak        text=n43.wav voice=clip delayMs=0
 124350 tv    hush
 124350 tv    clip         src=i16.wav muted=false ready=true delayMs=0
 124350 tv    speak        text=i16.wav voice=clip delayMs=0
 124430 tv    hush
 124430 tv    clip         src=n33.wav muted=false ready=true delayMs=0
 124430 tv    speak        text=n33.wav voice=clip delayMs=0
 124523 tv    hush
 124523 tv    clip         src=i23.wav muted=false ready=true delayMs=0
 124523 tv    speak        text=i23.wav voice=clip delayMs=0
 124615 tv    hush
 124615 tv    clip         src=g54.wav muted=false ready=true delayMs=0
 124615 tv    speak        text=g54.wav voice=clip delayMs=0
 124709 tv    hush
 124709 tv    clip         src=b14.wav muted=false ready=true delayMs=0
 124709 tv    speak        text=b14.wav voice=clip delayMs=0
 124901 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 125943 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 126210 tv    hush
 126211 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 126211 tv    hush
 133816 tv    music:duck   ms=9000
 133816 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 138828 tv    hush
 138828 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 138829 tv    hush
 140356 tv    ss:cancel    speaking=false pending=false
 140356 tv    music:plan   from=game:bingo to=null
 140359 tv    ss:cancel    speaking=false pending=false
 140359 tv    music:plan   from=null to=lobby
 140359 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 141160 tv    music:stop   track=cool-vibes.mp3
 142876 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 142883 tv    ss:cancel    speaking=false pending=false
 142886 tv    music:plan   from=lobby to=game:bingo
 142886 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 142886 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 142889 tv    hush
 142889 tv    hush
 143541 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 143686 tv    music:stop   track=airport-lounge.mp3
 144125 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
 145009 tv    ss:cancel    speaking=false pending=false
 145009 tv    music:plan   from=game:bingo to=null
 145009 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 146510 tv    music:stop   track=cool-vibes.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 147156 tv    ss:cancel    speaking=false pending=false
 147156 tv    music:plan   from=null to=lobby
 147156 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 150511 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 150520 tv    ss:cancel    speaking=false pending=false
 150526 tv    music:plan   from=lobby to=game:bingo
 150526 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 150526 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 150529 tv    hush
 150530 tv    hush
 150951 tv    cue          cue=lock surface=tv muted=false ready=true semitones=8
 150954 tv    hush
 150954 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 150954 tv    speak        text=i21.wav voice=clip delayMs=0
 150954 tv    hush
 151145 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 151327 tv    music:stop   track=bossa-antigua.mp3
 151455 tv    ss:cancel    speaking=false pending=false
 151455 tv    music:plan   from=game:bingo to=null
 151459 tv    ss:cancel    speaking=false pending=false
 151459 tv    music:plan   from=null to=lobby
 151459 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 152259 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"local-forecast-elevator.mp3","vol":0.06,"t":10.3}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 157042 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157459 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157876 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158308 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158747 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 159994 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 160580 tv    ss:cancel    speaking=false pending=false
 160589 tv    music:plan   from=lobby to=null
 160589 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 161889 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 162103 tv    music:stop   track=local-forecast-elevator.mp3
 163500 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 164820 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 166138 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 167242 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 168298 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 170907 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 171091 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 171277 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 171468 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 172625 tv    ss:cancel    speaking=false pending=false
 172630 tv    ss:cancel    speaking=false pending=false
 172630 tv    music:plan   from=null to=lobby
 172630 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 174647 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 174665 tv    ss:cancel    speaking=false pending=false
 174668 tv    music:plan   from=lobby to=null
 174668 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 176172 tv    music:stop   track=george-street-shuffle.mp3
 176248 tv    music:plan   from=null to=game:broken-pencil
 176248 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 176248 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 177744 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 178215 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 178365 tv    music:plan   from=game:broken-pencil to=null
 178365 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 179866 tv    music:stop   track=hep-cats.mp3
```
