# Audio interaction trace

Captured 2026-09-19T00:14:27.838Z on port 42166. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**60 / 60 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.4}]

```
   1761 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1787 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3097 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3233 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3929 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4566 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5417 tv    ss:cancel    speaking=false pending=false
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
   6261 tv    music:plan   from=lobby to=null
   6261 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7772 tv    music:stop   track=airport-lounge.mp3
   8219 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9503 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16474 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17471 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18473 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19473 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20472 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21273 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22086 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22242 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22402 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22556 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22711 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22870 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23027 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23170 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23310 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23472 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23628 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23784 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23939 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24093 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24253 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24395 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24550 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24708 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24863 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25735 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26063 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27869 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29603 tv    ss:cancel    speaking=false pending=false
  29603 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":1.5}]

```
  31144 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33318 tv    ss:cancel    speaking=false pending=false
  33318 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34879 tv    ss:cancel    speaking=false pending=false
  34879 tv    music:plan   from=null to=lobby
  34879 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:george-street-shuffle.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":3}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime** — cues=start,card,lock,lock,tick,tick,tick,call
- ✅ **each Ready ticks (lock, rising); the 3 · 2 · 1's first tick comes a breath (≥ 300 ms) after the last** — locks=2 last lock→first tick=435ms
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+997ms phone@+1012ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "another" is a 20 ms tap and one card pluck; Ready a 20 ms tap and the submit cue** — taps=3 cues=card,submit
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **each voice starts on the push (no delay); its boing lands on the squash, 170–230 ms later** — delays=0,0 boing lags=191,191ms
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,silence,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,silence,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":18.9}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":25.8}]
- ✅ **skipping through the deck: a hush before every call, one voice at a time** — clips=41 hushes=41
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5359ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":40.3}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the winner's celebration buzz (320 ms) runs whole — nothing shorter cuts it** — celebration@74351 cut by=[]
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5397ms cheer@+5369ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36441 tv    music:plan   from=lobby to=game:bingo
  36442 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36442 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36747 tv    hush
  36747 tv    hush
  37243 tv    music:stop   track=george-street-shuffle.mp3
  37399 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  39511 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  40013 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
  40448 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41449 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  42449 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  43422 tv    hush
  43422 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  43422 tv    speak        text=b9.wav voice=clip delayMs=0
  43423 tv    hush
  43615 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43987 tv    hush
  43987 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  43987 tv    speak        text=b8.wav voice=clip delayMs=0
  44178 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  45813 tv    hush
  45813 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  45813 tv    speak        text=n34.wav voice=clip delayMs=0
  46004 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  47680 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47939 tv    hush
  47940 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47940 tv    hush
  53296 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  53297 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  56300 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57302 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58302 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  59304 tv    hush
  59304 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  59304 tv    speak        text=n35.wav voice=clip delayMs=0
  59495 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61063 tv    music:paused paused=true
  61063 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  62313 tv    music:paused paused=false
  62313 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  63596 tv    hush
  63596 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  63596 tv    speak        text=i25.wav voice=clip delayMs=0
  63722 tv    hush
  63722 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  63722 tv    speak        text=n45.wav voice=clip delayMs=0
  63849 tv    hush
  63849 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  63849 tv    speak        text=n33.wav voice=clip delayMs=0
  63974 tv    hush
  63974 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  63974 tv    speak        text=g49.wav voice=clip delayMs=0
  64100 tv    hush
  64100 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  64100 tv    speak        text=b4.wav voice=clip delayMs=0
  64228 tv    hush
  64228 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  64228 tv    speak        text=i20.wav voice=clip delayMs=0
  64353 tv    hush
  64353 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  64353 tv    speak        text=o69.wav voice=clip delayMs=0
  64479 tv    hush
  64479 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  64479 tv    speak        text=o67.wav voice=clip delayMs=0
  64605 tv    hush
  64605 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  64605 tv    speak        text=o65.wav voice=clip delayMs=0
  64730 tv    hush
  64730 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  64730 tv    speak        text=o73.wav voice=clip delayMs=0
  64856 tv    hush
  64856 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  64856 tv    speak        text=i21.wav voice=clip delayMs=0
  64983 tv    hush
  64983 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  64983 tv    speak        text=i18.wav voice=clip delayMs=0
  65109 tv    hush
  65109 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  65109 tv    speak        text=g58.wav voice=clip delayMs=0
  65235 tv    hush
  65235 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  65235 tv    speak        text=n36.wav voice=clip delayMs=0
  65360 tv    hush
  65360 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  65360 tv    speak        text=o61.wav voice=clip delayMs=0
  65486 tv    hush
  65486 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  65486 tv    speak        text=n37.wav voice=clip delayMs=0
  65595 tv    hush
  65595 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  65595 tv    speak        text=i16.wav voice=clip delayMs=0
  65718 tv    hush
  65718 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  65718 tv    speak        text=g47.wav voice=clip delayMs=0
  65845 tv    hush
  65845 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  65845 tv    speak        text=n41.wav voice=clip delayMs=0
  65972 tv    hush
  65972 tv    clip         src=b6.wav muted=false ready=true delayMs=0
  65972 tv    speak        text=b6.wav voice=clip delayMs=0
  66083 tv    hush
  66083 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  66083 tv    speak        text=o72.wav voice=clip delayMs=0
  66207 tv    hush
  66207 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  66207 tv    speak        text=b3.wav voice=clip delayMs=0
  66333 tv    hush
  66333 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  66333 tv    speak        text=i30.wav voice=clip delayMs=0
  66443 tv    hush
  66443 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  66443 tv    speak        text=g56.wav voice=clip delayMs=0
  66566 tv    hush
  66566 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  66566 tv    speak        text=o75.wav voice=clip delayMs=0
  66692 tv    hush
  66692 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  66692 tv    speak        text=b1.wav voice=clip delayMs=0
  66818 tv    hush
  66818 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  66818 tv    speak        text=b2.wav voice=clip delayMs=0
  66945 tv    hush
  66945 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  66945 tv    speak        text=n32.wav voice=clip delayMs=0
  67071 tv    hush
  67071 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  67071 tv    speak        text=g48.wav voice=clip delayMs=0
  67193 tv    hush
  67193 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  67193 tv    speak        text=i23.wav voice=clip delayMs=0
  67319 tv    hush
  67319 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  67319 tv    speak        text=i26.wav voice=clip delayMs=0
  67445 tv    hush
  67445 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  67445 tv    speak        text=o66.wav voice=clip delayMs=0
  67570 tv    hush
  67570 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  67570 tv    speak        text=i19.wav voice=clip delayMs=0
  67680 tv    hush
  67680 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  67680 tv    speak        text=n42.wav voice=clip delayMs=0
  67787 tv    hush
  67787 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  67787 tv    speak        text=i24.wav voice=clip delayMs=0
  67912 tv    hush
  67912 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  67912 tv    speak        text=n39.wav voice=clip delayMs=0
  68037 tv    hush
  68037 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  68037 tv    speak        text=g46.wav voice=clip delayMs=0
  68162 tv    hush
  68162 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  68162 tv    speak        text=n44.wav voice=clip delayMs=0
  68290 tv    hush
  68290 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  68290 tv    speak        text=b15.wav voice=clip delayMs=0
  68416 tv    hush
  68416 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  68416 tv    speak        text=b11.wav voice=clip delayMs=0
  68541 tv    hush
  68541 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  68541 tv    speak        text=g57.wav voice=clip delayMs=0
  68732 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  69161 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  69448 tv    hush
  69448 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  69448 tv    hush
  71322 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  74807 tv    music:duck   ms=9000
  74807 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  79604 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79932 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80934 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81933 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82931 tv    hush
  82931 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  82931 tv    speak        text=g57.wav voice=clip delayMs=0
  83123 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  85239 tv    ss:cancel    speaking=false pending=false
  85239 tv    music:plan   from=game:bingo to=null
  85241 tv    ss:cancel    speaking=false pending=false
  85241 tv    music:plan   from=null to=lobby
  85241 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
  86050 tv    music:stop   track=cool-vibes.mp3
  87747 tv    ss:cancel    speaking=false pending=false
  87756 tv    music:plan   from=lobby to=game:bingo
  87756 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  87756 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  87760 tv    hush
  87760 tv    hush
  88365 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  88367 tv    hush
  88367 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  88367 tv    speak        text=i21.wav voice=clip delayMs=0
  88367 tv    hush
  88382 tv    hush
  88382 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  88382 tv    speak        text=n32.wav voice=clip delayMs=0
  88476 tv    hush
  88476 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  88476 tv    speak        text=i18.wav voice=clip delayMs=0
  88557 tv    music:stop   track=local-forecast-elevator.mp3
  88563 tv    hush
  88563 tv    clip         src=n40.wav muted=false ready=true delayMs=0
  88563 tv    speak        text=n40.wav voice=clip delayMs=0
  88664 tv    hush
  88664 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  88664 tv    speak        text=i30.wav voice=clip delayMs=0
  88759 tv    hush
  88759 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  88759 tv    speak        text=o69.wav voice=clip delayMs=0
  88858 tv    hush
  88858 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  88858 tv    speak        text=o61.wav voice=clip delayMs=0
  88949 tv    hush
  88949 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  88949 tv    speak        text=n34.wav voice=clip delayMs=0
  89060 tv    hush
  89060 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  89060 tv    speak        text=n35.wav voice=clip delayMs=0
  89154 tv    hush
  89154 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  89154 tv    speak        text=o67.wav voice=clip delayMs=0
  89233 tv    hush
  89233 tv    clip         src=g55.wav muted=false ready=true delayMs=0
  89233 tv    speak        text=g55.wav voice=clip delayMs=0
  89327 tv    hush
  89327 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  89327 tv    speak        text=i26.wav voice=clip delayMs=0
  89422 tv    hush
  89422 tv    clip         src=i22.wav muted=false ready=true delayMs=0
  89422 tv    speak        text=i22.wav voice=clip delayMs=0
  89515 tv    hush
  89515 tv    clip         src=i29.wav muted=false ready=true delayMs=0
  89515 tv    speak        text=i29.wav voice=clip delayMs=0
  89610 tv    hush
  89610 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  89610 tv    speak        text=o66.wav voice=clip delayMs=0
  89706 tv    hush
  89706 tv    clip         src=g51.wav muted=false ready=true delayMs=0
  89706 tv    speak        text=g51.wav voice=clip delayMs=0
  89800 tv    hush
  89800 tv    clip         src=g53.wav muted=false ready=true delayMs=0
  89800 tv    speak        text=g53.wav voice=clip delayMs=0
  89894 tv    hush
  89894 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  89894 tv    speak        text=b9.wav voice=clip delayMs=0
  89991 tv    hush
  89991 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  89991 tv    speak        text=n36.wav voice=clip delayMs=0
  90086 tv    hush
  90086 tv    clip         src=g52.wav muted=false ready=true delayMs=0
  90086 tv    speak        text=g52.wav voice=clip delayMs=0
  90182 tv    hush
  90182 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  90182 tv    speak        text=b1.wav voice=clip delayMs=0
  90260 tv    hush
  90260 tv    clip         src=b13.wav muted=false ready=true delayMs=0
  90260 tv    speak        text=b13.wav voice=clip delayMs=0
  90356 tv    hush
  90356 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  90356 tv    speak        text=n37.wav voice=clip delayMs=0
  90435 tv    hush
  90435 tv    clip         src=o71.wav muted=false ready=true delayMs=0
  90435 tv    speak        text=o71.wav voice=clip delayMs=0
  90527 tv    hush
  90527 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  90527 tv    speak        text=b8.wav voice=clip delayMs=0
  90608 tv    hush
  90608 tv    clip         src=b5.wav muted=false ready=true delayMs=0
  90608 tv    speak        text=b5.wav voice=clip delayMs=0
  90702 tv    hush
  90702 tv    clip         src=b7.wav muted=false ready=true delayMs=0
  90702 tv    speak        text=b7.wav voice=clip delayMs=0
  90767 tv    hush
  90767 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  90767 tv    speak        text=n42.wav voice=clip delayMs=0
  90875 tv    hush
  90875 tv    clip         src=i28.wav muted=false ready=true delayMs=0
  90875 tv    speak        text=i28.wav voice=clip delayMs=0
  90971 tv    hush
  90971 tv    clip         src=i27.wav muted=false ready=true delayMs=0
  90971 tv    speak        text=i27.wav voice=clip delayMs=0
  91064 tv    hush
  91064 tv    clip         src=o63.wav muted=false ready=true delayMs=0
  91064 tv    speak        text=o63.wav voice=clip delayMs=0
  91161 tv    hush
  91161 tv    clip         src=o64.wav muted=false ready=true delayMs=0
  91161 tv    speak        text=o64.wav voice=clip delayMs=0
  91241 tv    hush
  91241 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  91241 tv    speak        text=o73.wav voice=clip delayMs=0
  91333 tv    hush
  91333 tv    clip         src=g50.wav muted=false ready=true delayMs=0
  91333 tv    speak        text=g50.wav voice=clip delayMs=0
  91426 tv    hush
  91426 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  91426 tv    speak        text=g48.wav voice=clip delayMs=0
  91521 tv    hush
  91521 tv    clip         src=b12.wav muted=false ready=true delayMs=0
  91521 tv    speak        text=b12.wav voice=clip delayMs=0
  91602 tv    hush
  91602 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  91602 tv    speak        text=n45.wav voice=clip delayMs=0
  91695 tv    hush
  91695 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  91695 tv    speak        text=b4.wav voice=clip delayMs=0
  91792 tv    hush
  91792 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  91792 tv    speak        text=g46.wav voice=clip delayMs=0
  91886 tv    hush
  91886 tv    clip         src=o74.wav muted=false ready=true delayMs=0
  91886 tv    speak        text=o74.wav voice=clip delayMs=0
  91982 tv    hush
  91982 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  91982 tv    speak        text=g47.wav voice=clip delayMs=0
  92078 tv    hush
  92078 tv    clip         src=n31.wav muted=false ready=true delayMs=0
  92078 tv    speak        text=n31.wav voice=clip delayMs=0
  92169 tv    hush
  92169 tv    clip         src=o62.wav muted=false ready=true delayMs=0
  92169 tv    speak        text=o62.wav voice=clip delayMs=0
  92263 tv    hush
  92263 tv    clip         src=b10.wav muted=false ready=true delayMs=0
  92263 tv    speak        text=b10.wav voice=clip delayMs=0
  92359 tv    hush
  92359 tv    clip         src=g60.wav muted=false ready=true delayMs=0
  92359 tv    speak        text=g60.wav voice=clip delayMs=0
  92456 tv    hush
  92456 tv    clip         src=n38.wav muted=false ready=true delayMs=0
  92456 tv    speak        text=n38.wav voice=clip delayMs=0
  92546 tv    hush
  92546 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  92546 tv    speak        text=n39.wav voice=clip delayMs=0
  92642 tv    hush
  92642 tv    clip         src=o70.wav muted=false ready=true delayMs=0
  92642 tv    speak        text=o70.wav voice=clip delayMs=0
  92736 tv    hush
  92736 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  92736 tv    speak        text=b11.wav voice=clip delayMs=0
  92815 tv    hush
  92815 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  92815 tv    speak        text=o75.wav voice=clip delayMs=0
  92910 tv    hush
  92910 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  92910 tv    speak        text=g58.wav voice=clip delayMs=0
  92989 tv    hush
  92989 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  92989 tv    speak        text=b15.wav voice=clip delayMs=0
  93084 tv    hush
  93084 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  93084 tv    speak        text=i24.wav voice=clip delayMs=0
  93179 tv    hush
  93179 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  93179 tv    speak        text=o72.wav voice=clip delayMs=0
  93274 tv    hush
  93274 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  93274 tv    speak        text=g56.wav voice=clip delayMs=0
  93369 tv    hush
  93369 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  93369 tv    speak        text=i20.wav voice=clip delayMs=0
  93463 tv    hush
  93463 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  93463 tv    speak        text=n44.wav voice=clip delayMs=0
  93558 tv    hush
  93558 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  93558 tv    speak        text=b3.wav voice=clip delayMs=0
  93653 tv    hush
  93653 tv    clip         src=o68.wav muted=false ready=true delayMs=0
  93653 tv    speak        text=o68.wav voice=clip delayMs=0
  93748 tv    hush
  93748 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  93748 tv    speak        text=b2.wav voice=clip delayMs=0
  93843 tv    hush
  93843 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  93843 tv    speak        text=n41.wav voice=clip delayMs=0
  93936 tv    hush
  93936 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  93936 tv    speak        text=o65.wav voice=clip delayMs=0
  94033 tv    hush
  94033 tv    clip         src=i17.wav muted=false ready=true delayMs=0
  94033 tv    speak        text=i17.wav voice=clip delayMs=0
  94127 tv    hush
  94127 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  94127 tv    speak        text=i25.wav voice=clip delayMs=0
  94221 tv    hush
  94221 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  94221 tv    speak        text=i19.wav voice=clip delayMs=0
  94315 tv    hush
  94315 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  94315 tv    speak        text=g57.wav voice=clip delayMs=0
  94413 tv    hush
  94413 tv    clip         src=g59.wav muted=false ready=true delayMs=0
  94413 tv    speak        text=g59.wav voice=clip delayMs=0
  94604 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  95643 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95909 tv    hush
  95909 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95909 tv    hush
 103514 tv    music:duck   ms=9000
 103514 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108530 tv    hush
 108530 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108531 tv    hush
 112525 tv    ss:cancel    speaking=false pending=false
 112525 tv    music:plan   from=game:bingo to=null
 112525 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 114026 tv    music:stop   track=wallpaper.mp3
 114105 tv    ss:cancel    speaking=false pending=false
 114105 tv    music:plan   from=null to=lobby
 114105 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 116620 tv    ss:cancel    speaking=false pending=false
 116630 tv    music:plan   from=lobby to=game:bingo
 116630 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 116630 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116633 tv    hush
 116633 tv    hush
 117249 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 117251 tv    hush
 117251 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 117251 tv    speak        text=i21.wav voice=clip delayMs=0
 117251 tv    hush
 117258 tv    hush
 117258 tv    clip         src=n32.wav muted=false ready=true delayMs=0
 117258 tv    speak        text=n32.wav voice=clip delayMs=0
 117363 tv    hush
 117363 tv    clip         src=i18.wav muted=false ready=true delayMs=0
 117363 tv    speak        text=i18.wav voice=clip delayMs=0
 117434 tv    music:stop   track=local-forecast-elevator.mp3
 117455 tv    hush
 117455 tv    clip         src=n40.wav muted=false ready=true delayMs=0
 117455 tv    speak        text=n40.wav voice=clip delayMs=0
 117550 tv    hush
 117550 tv    clip         src=i30.wav muted=false ready=true delayMs=0
 117550 tv    speak        text=i30.wav voice=clip delayMs=0
 117648 tv    hush
 117648 tv    clip         src=o69.wav muted=false ready=true delayMs=0
 117648 tv    speak        text=o69.wav voice=clip delayMs=0
 117741 tv    hush
 117741 tv    clip         src=o61.wav muted=false ready=true delayMs=0
 117741 tv    speak        text=o61.wav voice=clip delayMs=0
 117837 tv    hush
 117837 tv    clip         src=n34.wav muted=false ready=true delayMs=0
 117837 tv    speak        text=n34.wav voice=clip delayMs=0
 117930 tv    hush
 117930 tv    clip         src=n35.wav muted=false ready=true delayMs=0
 117930 tv    speak        text=n35.wav voice=clip delayMs=0
 118029 tv    hush
 118029 tv    clip         src=o67.wav muted=false ready=true delayMs=0
 118029 tv    speak        text=o67.wav voice=clip delayMs=0
 118120 tv    hush
 118120 tv    clip         src=g55.wav muted=false ready=true delayMs=0
 118120 tv    speak        text=g55.wav voice=clip delayMs=0
 118214 tv    hush
 118214 tv    clip         src=i26.wav muted=false ready=true delayMs=0
 118214 tv    speak        text=i26.wav voice=clip delayMs=0
 118311 tv    hush
 118311 tv    clip         src=i22.wav muted=false ready=true delayMs=0
 118311 tv    speak        text=i22.wav voice=clip delayMs=0
 118404 tv    hush
 118404 tv    clip         src=i29.wav muted=false ready=true delayMs=0
 118404 tv    speak        text=i29.wav voice=clip delayMs=0
 118501 tv    hush
 118501 tv    clip         src=o66.wav muted=false ready=true delayMs=0
 118501 tv    speak        text=o66.wav voice=clip delayMs=0
 118594 tv    hush
 118594 tv    clip         src=g51.wav muted=false ready=true delayMs=0
 118594 tv    speak        text=g51.wav voice=clip delayMs=0
 118689 tv    hush
 118689 tv    clip         src=g53.wav muted=false ready=true delayMs=0
 118689 tv    speak        text=g53.wav voice=clip delayMs=0
 118785 tv    hush
 118785 tv    clip         src=b9.wav muted=false ready=true delayMs=0
 118785 tv    speak        text=b9.wav voice=clip delayMs=0
 118883 tv    hush
 118883 tv    clip         src=n36.wav muted=false ready=true delayMs=0
 118883 tv    speak        text=n36.wav voice=clip delayMs=0
 118980 tv    hush
 118980 tv    clip         src=g52.wav muted=false ready=true delayMs=0
 118980 tv    speak        text=g52.wav voice=clip delayMs=0
 119073 tv    hush
 119073 tv    clip         src=b1.wav muted=false ready=true delayMs=0
 119073 tv    speak        text=b1.wav voice=clip delayMs=0
 119165 tv    hush
 119165 tv    clip         src=b13.wav muted=false ready=true delayMs=0
 119165 tv    speak        text=b13.wav voice=clip delayMs=0
 119257 tv    hush
 119257 tv    clip         src=n37.wav muted=false ready=true delayMs=0
 119257 tv    speak        text=n37.wav voice=clip delayMs=0
 119352 tv    hush
 119352 tv    clip         src=o71.wav muted=false ready=true delayMs=0
 119352 tv    speak        text=o71.wav voice=clip delayMs=0
 119452 tv    hush
 119452 tv    clip         src=b8.wav muted=false ready=true delayMs=0
 119452 tv    speak        text=b8.wav voice=clip delayMs=0
 119526 tv    hush
 119526 tv    clip         src=b5.wav muted=false ready=true delayMs=0
 119526 tv    speak        text=b5.wav voice=clip delayMs=0
 119622 tv    hush
 119622 tv    clip         src=b7.wav muted=false ready=true delayMs=0
 119622 tv    speak        text=b7.wav voice=clip delayMs=0
 119714 tv    hush
 119714 tv    clip         src=n42.wav muted=false ready=true delayMs=0
 119714 tv    speak        text=n42.wav voice=clip delayMs=0
 119812 tv    hush
 119812 tv    clip         src=i28.wav muted=false ready=true delayMs=0
 119812 tv    speak        text=i28.wav voice=clip delayMs=0
 119887 tv    hush
 119887 tv    clip         src=i27.wav muted=false ready=true delayMs=0
 119887 tv    speak        text=i27.wav voice=clip delayMs=0
 119972 tv    hush
 119972 tv    clip         src=o63.wav muted=false ready=true delayMs=0
 119972 tv    speak        text=o63.wav voice=clip delayMs=0
 120046 tv    hush
 120046 tv    clip         src=o64.wav muted=false ready=true delayMs=0
 120046 tv    speak        text=o64.wav voice=clip delayMs=0
 120143 tv    hush
 120143 tv    clip         src=o73.wav muted=false ready=true delayMs=0
 120143 tv    speak        text=o73.wav voice=clip delayMs=0
 120236 tv    hush
 120236 tv    clip         src=g50.wav muted=false ready=true delayMs=0
 120236 tv    speak        text=g50.wav voice=clip delayMs=0
 120333 tv    hush
 120333 tv    clip         src=g48.wav muted=false ready=true delayMs=0
 120333 tv    speak        text=g48.wav voice=clip delayMs=0
 120420 tv    hush
 120420 tv    clip         src=b12.wav muted=false ready=true delayMs=0
 120420 tv    speak        text=b12.wav voice=clip delayMs=0
 120522 tv    hush
 120522 tv    clip         src=n45.wav muted=false ready=true delayMs=0
 120522 tv    speak        text=n45.wav voice=clip delayMs=0
 120613 tv    hush
 120613 tv    clip         src=b4.wav muted=false ready=true delayMs=0
 120613 tv    speak        text=b4.wav voice=clip delayMs=0
 120708 tv    hush
 120708 tv    clip         src=g46.wav muted=false ready=true delayMs=0
 120708 tv    speak        text=g46.wav voice=clip delayMs=0
 120789 tv    hush
 120789 tv    clip         src=o74.wav muted=false ready=true delayMs=0
 120789 tv    speak        text=o74.wav voice=clip delayMs=0
 120884 tv    hush
 120884 tv    clip         src=g47.wav muted=false ready=true delayMs=0
 120884 tv    speak        text=g47.wav voice=clip delayMs=0
 120976 tv    hush
 120976 tv    clip         src=n31.wav muted=false ready=true delayMs=0
 120976 tv    speak        text=n31.wav voice=clip delayMs=0
 121072 tv    hush
 121072 tv    clip         src=o62.wav muted=false ready=true delayMs=0
 121072 tv    speak        text=o62.wav voice=clip delayMs=0
 121167 tv    hush
 121167 tv    clip         src=b10.wav muted=false ready=true delayMs=0
 121167 tv    speak        text=b10.wav voice=clip delayMs=0
 121263 tv    hush
 121263 tv    clip         src=g60.wav muted=false ready=true delayMs=0
 121263 tv    speak        text=g60.wav voice=clip delayMs=0
 121372 tv    hush
 121372 tv    clip         src=n38.wav muted=false ready=true delayMs=0
 121372 tv    speak        text=n38.wav voice=clip delayMs=0
 121465 tv    hush
 121465 tv    clip         src=n39.wav muted=false ready=true delayMs=0
 121465 tv    speak        text=n39.wav voice=clip delayMs=0
 121547 tv    hush
 121547 tv    clip         src=o70.wav muted=false ready=true delayMs=0
 121547 tv    speak        text=o70.wav voice=clip delayMs=0
 121624 tv    hush
 121624 tv    clip         src=b11.wav muted=false ready=true delayMs=0
 121624 tv    speak        text=b11.wav voice=clip delayMs=0
 121718 tv    hush
 121718 tv    clip         src=o75.wav muted=false ready=true delayMs=0
 121718 tv    speak        text=o75.wav voice=clip delayMs=0
 121815 tv    hush
 121815 tv    clip         src=g58.wav muted=false ready=true delayMs=0
 121815 tv    speak        text=g58.wav voice=clip delayMs=0
 121907 tv    hush
 121907 tv    clip         src=b15.wav muted=false ready=true delayMs=0
 121907 tv    speak        text=b15.wav voice=clip delayMs=0
 122004 tv    hush
 122004 tv    clip         src=i24.wav muted=false ready=true delayMs=0
 122004 tv    speak        text=i24.wav voice=clip delayMs=0
 122102 tv    hush
 122102 tv    clip         src=o72.wav muted=false ready=true delayMs=0
 122102 tv    speak        text=o72.wav voice=clip delayMs=0
 122192 tv    hush
 122192 tv    clip         src=g56.wav muted=false ready=true delayMs=0
 122192 tv    speak        text=g56.wav voice=clip delayMs=0
 122290 tv    hush
 122290 tv    clip         src=i20.wav muted=false ready=true delayMs=0
 122290 tv    speak        text=i20.wav voice=clip delayMs=0
 122383 tv    hush
 122383 tv    clip         src=n44.wav muted=false ready=true delayMs=0
 122383 tv    speak        text=n44.wav voice=clip delayMs=0
 122475 tv    hush
 122475 tv    clip         src=b3.wav muted=false ready=true delayMs=0
 122475 tv    speak        text=b3.wav voice=clip delayMs=0
 122570 tv    hush
 122570 tv    clip         src=o68.wav muted=false ready=true delayMs=0
 122570 tv    speak        text=o68.wav voice=clip delayMs=0
 122664 tv    hush
 122664 tv    clip         src=b2.wav muted=false ready=true delayMs=0
 122664 tv    speak        text=b2.wav voice=clip delayMs=0
 122761 tv    hush
 122761 tv    clip         src=n41.wav muted=false ready=true delayMs=0
 122761 tv    speak        text=n41.wav voice=clip delayMs=0
 122854 tv    hush
 122854 tv    clip         src=o65.wav muted=false ready=true delayMs=0
 122854 tv    speak        text=o65.wav voice=clip delayMs=0
 122953 tv    hush
 122953 tv    clip         src=i17.wav muted=false ready=true delayMs=0
 122953 tv    speak        text=i17.wav voice=clip delayMs=0
 123044 tv    hush
 123044 tv    clip         src=i25.wav muted=false ready=true delayMs=0
 123044 tv    speak        text=i25.wav voice=clip delayMs=0
 123140 tv    hush
 123140 tv    clip         src=i19.wav muted=false ready=true delayMs=0
 123140 tv    speak        text=i19.wav voice=clip delayMs=0
 123233 tv    hush
 123233 tv    clip         src=g57.wav muted=false ready=true delayMs=0
 123233 tv    speak        text=g57.wav voice=clip delayMs=0
 123330 tv    hush
 123330 tv    clip         src=g59.wav muted=false ready=true delayMs=0
 123330 tv    speak        text=g59.wav voice=clip delayMs=0
 123520 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 124575 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 124843 tv    hush
 124843 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 124844 tv    hush
 132449 tv    music:duck   ms=9000
 132449 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 137473 tv    hush
 137474 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 137474 tv    hush
 139021 tv    ss:cancel    speaking=false pending=false
 139021 tv    music:plan   from=game:bingo to=null
 139023 tv    ss:cancel    speaking=false pending=false
 139023 tv    music:plan   from=null to=lobby
 139023 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 139823 tv    music:stop   track=cool-vibes.mp3
 141526 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 141536 tv    ss:cancel    speaking=false pending=false
 141543 tv    music:plan   from=lobby to=game:bingo
 141543 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 141543 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 141547 tv    hush
 141548 tv    hush
 142198 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 142343 tv    music:stop   track=bossa-antigua.mp3
 142781 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
 143657 tv    ss:cancel    speaking=false pending=false
 143657 tv    music:plan   from=game:bingo to=null
 143657 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 145158 tv    music:stop   track=cool-vibes.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 145803 tv    ss:cancel    speaking=false pending=false
 145803 tv    music:plan   from=null to=lobby
 145803 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 149154 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 149163 tv    ss:cancel    speaking=false pending=false
 149165 tv    music:plan   from=lobby to=game:bingo
 149165 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 149165 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149168 tv    hush
 149168 tv    hush
 149579 tv    cue          cue=lock surface=tv muted=false ready=true semitones=8
 149583 tv    hush
 149583 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 149583 tv    speak        text=i21.wav voice=clip delayMs=0
 149583 tv    hush
 149773 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 149967 tv    music:stop   track=george-street-shuffle.mp3
 150088 tv    ss:cancel    speaking=false pending=false
 150088 tv    music:plan   from=game:bingo to=null
 150091 tv    ss:cancel    speaking=false pending=false
 150091 tv    music:plan   from=null to=lobby
 150091 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 150893 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 155690 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156124 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156541 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156973 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157391 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158456 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 159055 tv    ss:cancel    speaking=false pending=false
 159059 tv    music:plan   from=lobby to=null
 159059 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 160321 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 160561 tv    music:stop   track=george-street-shuffle.mp3
 161925 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 163341 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 164642 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 165671 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 166715 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 169287 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 169480 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 169666 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 169859 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"lobby-time.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 170986 tv    ss:cancel    speaking=false pending=false
 170988 tv    ss:cancel    speaking=false pending=false
 170988 tv    music:plan   from=null to=lobby
 170988 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 173016 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 173024 tv    ss:cancel    speaking=false pending=false
 173026 tv    music:plan   from=lobby to=null
 173026 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 174526 tv    music:stop   track=bossa-antigua.mp3
 174577 tv    music:plan   from=null to=game:broken-pencil
 174577 tv    music:start  plan=game:broken-pencil track=lobby-time mode=chain volume=0.2
 174578 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 176046 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 176506 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 176665 tv    music:plan   from=game:broken-pencil to=null
 176665 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 178166 tv    music:stop   track=lobby-time.mp3
```
