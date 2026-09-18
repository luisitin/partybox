# Audio interaction trace

Captured 2026-09-18T22:57:10.072Z on port 42166. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**59 / 59 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:george-street-shuffle
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":4.4}]

```
   1726 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
   1753 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3066 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3201 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3900 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4534 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5384 tv    ss:cancel    speaking=false pending=false
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
   6242 tv    music:plan   from=lobby to=null
   6242 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7748 tv    music:stop   track=george-street-shuffle.mp3
   8194 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9484 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16454 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17456 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18453 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19445 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20445 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21245 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22041 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22187 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22342 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22501 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22657 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22815 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22971 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23129 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23289 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23445 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23601 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23760 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23914 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24057 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24211 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24372 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24526 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24687 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24844 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25723 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26055 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27870 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29603 tv    ss:cancel    speaking=false pending=false
  29603 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31126 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33268 tv    ss:cancel    speaking=false pending=false
  33269 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34828 tv    ss:cancel    speaking=false pending=false
  34828 tv    music:plan   from=null to=lobby
  34828 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime** — cues=start,card,lock,lock,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+969ms phone@+979ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "another" is a 20 ms tap and one card pluck; Ready a 20 ms tap and the submit cue** — taps=3 cues=card,submit
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **each voice starts on the push (no delay); its boing lands on the squash, 170–230 ms later** — delays=0,0 boing lags=196,191ms
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,silence,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,silence,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18.1}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":25}]
- ✅ **skipping through the deck: a hush before every call, one voice at a time** — clips=41 hushes=41
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5355ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.5}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the winner's celebration buzz (320 ms) runs whole — nothing shorter cuts it** — celebration@73642 cut by=[]
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5405ms cheer@+5372ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36415 tv    music:plan   from=lobby to=game:bingo
  36415 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36415 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36718 tv    hush
  36718 tv    hush
  37215 tv    music:stop   track=airport-lounge.mp3
  37329 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  39479 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  39730 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
  39769 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40770 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41772 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  42754 tv    hush
  42754 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  42754 tv    speak        text=b9.wav voice=clip delayMs=0
  42755 tv    hush
  42946 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43118 tv    hush
  43118 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  43118 tv    speak        text=b8.wav voice=clip delayMs=0
  43314 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44945 tv    hush
  44945 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  44945 tv    speak        text=n34.wav voice=clip delayMs=0
  45136 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46812 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47092 tv    hush
  47093 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47093 tv    hush
  52457 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  52463 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55448 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56449 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57451 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58450 tv    hush
  58450 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  58450 tv    speak        text=n35.wav voice=clip delayMs=0
  58643 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60246 tv    music:paused paused=true
  60246 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61513 tv    music:paused paused=false
  61513 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62821 tv    hush
  62821 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  62821 tv    speak        text=i25.wav voice=clip delayMs=0
  62947 tv    hush
  62947 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  62947 tv    speak        text=n45.wav voice=clip delayMs=0
  63075 tv    hush
  63075 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  63075 tv    speak        text=n33.wav voice=clip delayMs=0
  63199 tv    hush
  63199 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  63199 tv    speak        text=g49.wav voice=clip delayMs=0
  63321 tv    hush
  63321 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  63321 tv    speak        text=b4.wav voice=clip delayMs=0
  63447 tv    hush
  63447 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  63447 tv    speak        text=i20.wav voice=clip delayMs=0
  63570 tv    hush
  63570 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  63570 tv    speak        text=o69.wav voice=clip delayMs=0
  63691 tv    hush
  63691 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  63691 tv    speak        text=o67.wav voice=clip delayMs=0
  63808 tv    hush
  63808 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  63808 tv    speak        text=o65.wav voice=clip delayMs=0
  63930 tv    hush
  63930 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  63930 tv    speak        text=o73.wav voice=clip delayMs=0
  64064 tv    hush
  64064 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  64064 tv    speak        text=i21.wav voice=clip delayMs=0
  64186 tv    hush
  64186 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  64186 tv    speak        text=i18.wav voice=clip delayMs=0
  64307 tv    hush
  64307 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  64307 tv    speak        text=g58.wav voice=clip delayMs=0
  64434 tv    hush
  64434 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  64434 tv    speak        text=n36.wav voice=clip delayMs=0
  64558 tv    hush
  64558 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  64558 tv    speak        text=o61.wav voice=clip delayMs=0
  64690 tv    hush
  64690 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  64690 tv    speak        text=n37.wav voice=clip delayMs=0
  64811 tv    hush
  64811 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  64811 tv    speak        text=i16.wav voice=clip delayMs=0
  64937 tv    hush
  64937 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  64937 tv    speak        text=g47.wav voice=clip delayMs=0
  65067 tv    hush
  65067 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  65067 tv    speak        text=n41.wav voice=clip delayMs=0
  65188 tv    hush
  65188 tv    clip         src=b6.wav muted=false ready=true delayMs=0
  65188 tv    speak        text=b6.wav voice=clip delayMs=0
  65303 tv    hush
  65303 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  65303 tv    speak        text=o72.wav voice=clip delayMs=0
  65426 tv    hush
  65426 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  65426 tv    speak        text=b3.wav voice=clip delayMs=0
  65547 tv    hush
  65547 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  65547 tv    speak        text=i30.wav voice=clip delayMs=0
  65675 tv    hush
  65675 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  65675 tv    speak        text=g56.wav voice=clip delayMs=0
  65800 tv    hush
  65800 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  65800 tv    speak        text=o75.wav voice=clip delayMs=0
  65928 tv    hush
  65928 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  65928 tv    speak        text=b1.wav voice=clip delayMs=0
  66048 tv    hush
  66048 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  66048 tv    speak        text=b2.wav voice=clip delayMs=0
  66175 tv    hush
  66175 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  66175 tv    speak        text=n32.wav voice=clip delayMs=0
  66307 tv    hush
  66307 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  66307 tv    speak        text=g48.wav voice=clip delayMs=0
  66432 tv    hush
  66432 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  66432 tv    speak        text=i23.wav voice=clip delayMs=0
  66557 tv    hush
  66557 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  66557 tv    speak        text=i26.wav voice=clip delayMs=0
  66678 tv    hush
  66678 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  66678 tv    speak        text=o66.wav voice=clip delayMs=0
  66799 tv    hush
  66799 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  66799 tv    speak        text=i19.wav voice=clip delayMs=0
  66927 tv    hush
  66927 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  66927 tv    speak        text=n42.wav voice=clip delayMs=0
  67056 tv    hush
  67056 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  67056 tv    speak        text=i24.wav voice=clip delayMs=0
  67181 tv    hush
  67181 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  67181 tv    speak        text=n39.wav voice=clip delayMs=0
  67307 tv    hush
  67307 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  67307 tv    speak        text=g46.wav voice=clip delayMs=0
  67414 tv    hush
  67414 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  67414 tv    speak        text=n44.wav voice=clip delayMs=0
  67537 tv    hush
  67537 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  67537 tv    speak        text=b15.wav voice=clip delayMs=0
  67671 tv    hush
  67671 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  67671 tv    speak        text=b11.wav voice=clip delayMs=0
  67794 tv    hush
  67794 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  67794 tv    speak        text=g57.wav voice=clip delayMs=0
  67985 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  68414 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68704 tv    hush
  68704 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68704 tv    hush
  70577 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  74059 tv    music:duck   ms=9000
  74059 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  78868 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  79198 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80201 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81199 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  82194 tv    hush
  82194 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  82194 tv    speak        text=g57.wav voice=clip delayMs=0
  82384 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84506 tv    ss:cancel    speaking=false pending=false
  84506 tv    music:plan   from=game:bingo to=null
  84509 tv    ss:cancel    speaking=false pending=false
  84509 tv    music:plan   from=null to=lobby
  84509 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  85309 tv    music:stop   track=wallpaper.mp3
  87028 tv    ss:cancel    speaking=false pending=false
  87037 tv    music:plan   from=lobby to=game:bingo
  87037 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  87037 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  87040 tv    hush
  87041 tv    hush
  87653 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  87656 tv    hush
  87656 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  87656 tv    speak        text=i21.wav voice=clip delayMs=0
  87656 tv    hush
  87662 tv    hush
  87662 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  87662 tv    speak        text=n32.wav voice=clip delayMs=0
  87769 tv    hush
  87769 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  87769 tv    speak        text=i18.wav voice=clip delayMs=0
  87838 tv    music:stop   track=bossa-antigua.mp3
  87844 tv    hush
  87844 tv    clip         src=n40.wav muted=false ready=true delayMs=0
  87844 tv    speak        text=n40.wav voice=clip delayMs=0
  87937 tv    hush
  87937 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  87937 tv    speak        text=i30.wav voice=clip delayMs=0
  88041 tv    hush
  88041 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  88041 tv    speak        text=o69.wav voice=clip delayMs=0
  88132 tv    hush
  88132 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  88132 tv    speak        text=o61.wav voice=clip delayMs=0
  88226 tv    hush
  88226 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  88226 tv    speak        text=n34.wav voice=clip delayMs=0
  88306 tv    hush
  88306 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  88306 tv    speak        text=n35.wav voice=clip delayMs=0
  88398 tv    hush
  88398 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  88398 tv    speak        text=o67.wav voice=clip delayMs=0
  88508 tv    hush
  88508 tv    clip         src=g55.wav muted=false ready=true delayMs=0
  88508 tv    speak        text=g55.wav voice=clip delayMs=0
  88601 tv    hush
  88601 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  88601 tv    speak        text=i26.wav voice=clip delayMs=0
  88696 tv    hush
  88696 tv    clip         src=i22.wav muted=false ready=true delayMs=0
  88696 tv    speak        text=i22.wav voice=clip delayMs=0
  88786 tv    hush
  88786 tv    clip         src=i29.wav muted=false ready=true delayMs=0
  88786 tv    speak        text=i29.wav voice=clip delayMs=0
  88881 tv    hush
  88881 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  88881 tv    speak        text=o66.wav voice=clip delayMs=0
  88976 tv    hush
  88976 tv    clip         src=g51.wav muted=false ready=true delayMs=0
  88976 tv    speak        text=g51.wav voice=clip delayMs=0
  89068 tv    hush
  89068 tv    clip         src=g53.wav muted=false ready=true delayMs=0
  89068 tv    speak        text=g53.wav voice=clip delayMs=0
  89161 tv    hush
  89161 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  89161 tv    speak        text=b9.wav voice=clip delayMs=0
  89259 tv    hush
  89259 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  89259 tv    speak        text=n36.wav voice=clip delayMs=0
  89366 tv    hush
  89366 tv    clip         src=g52.wav muted=false ready=true delayMs=0
  89366 tv    speak        text=g52.wav voice=clip delayMs=0
  89458 tv    hush
  89458 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  89458 tv    speak        text=b1.wav voice=clip delayMs=0
  89555 tv    hush
  89555 tv    clip         src=b13.wav muted=false ready=true delayMs=0
  89555 tv    speak        text=b13.wav voice=clip delayMs=0
  89647 tv    hush
  89647 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  89647 tv    speak        text=n37.wav voice=clip delayMs=0
  89742 tv    hush
  89742 tv    clip         src=o71.wav muted=false ready=true delayMs=0
  89742 tv    speak        text=o71.wav voice=clip delayMs=0
  89839 tv    hush
  89839 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  89839 tv    speak        text=b8.wav voice=clip delayMs=0
  89934 tv    hush
  89934 tv    clip         src=b5.wav muted=false ready=true delayMs=0
  89934 tv    speak        text=b5.wav voice=clip delayMs=0
  90026 tv    hush
  90026 tv    clip         src=b7.wav muted=false ready=true delayMs=0
  90026 tv    speak        text=b7.wav voice=clip delayMs=0
  90105 tv    hush
  90105 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  90105 tv    speak        text=n42.wav voice=clip delayMs=0
  90199 tv    hush
  90199 tv    clip         src=i28.wav muted=false ready=true delayMs=0
  90199 tv    speak        text=i28.wav voice=clip delayMs=0
  90291 tv    hush
  90291 tv    clip         src=i27.wav muted=false ready=true delayMs=0
  90291 tv    speak        text=i27.wav voice=clip delayMs=0
  90388 tv    hush
  90388 tv    clip         src=o63.wav muted=false ready=true delayMs=0
  90389 tv    speak        text=o63.wav voice=clip delayMs=0
  90478 tv    hush
  90478 tv    clip         src=o64.wav muted=false ready=true delayMs=0
  90478 tv    speak        text=o64.wav voice=clip delayMs=0
  90574 tv    hush
  90574 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  90574 tv    speak        text=o73.wav voice=clip delayMs=0
  90687 tv    hush
  90687 tv    clip         src=g50.wav muted=false ready=true delayMs=0
  90687 tv    speak        text=g50.wav voice=clip delayMs=0
  90747 tv    hush
  90747 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  90747 tv    speak        text=g48.wav voice=clip delayMs=0
  90838 tv    hush
  90838 tv    clip         src=b12.wav muted=false ready=true delayMs=0
  90838 tv    speak        text=b12.wav voice=clip delayMs=0
  90935 tv    hush
  90935 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  90935 tv    speak        text=n45.wav voice=clip delayMs=0
  91029 tv    hush
  91029 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  91029 tv    speak        text=b4.wav voice=clip delayMs=0
  91116 tv    hush
  91116 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  91116 tv    speak        text=g46.wav voice=clip delayMs=0
  91221 tv    hush
  91221 tv    clip         src=o74.wav muted=false ready=true delayMs=0
  91221 tv    speak        text=o74.wav voice=clip delayMs=0
  91299 tv    hush
  91299 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  91299 tv    speak        text=g47.wav voice=clip delayMs=0
  91396 tv    hush
  91396 tv    clip         src=n31.wav muted=false ready=true delayMs=0
  91396 tv    speak        text=n31.wav voice=clip delayMs=0
  91490 tv    hush
  91490 tv    clip         src=o62.wav muted=false ready=true delayMs=0
  91490 tv    speak        text=o62.wav voice=clip delayMs=0
  91577 tv    hush
  91578 tv    clip         src=b10.wav muted=false ready=true delayMs=0
  91578 tv    speak        text=b10.wav voice=clip delayMs=0
  91666 tv    hush
  91666 tv    clip         src=g60.wav muted=false ready=true delayMs=0
  91666 tv    speak        text=g60.wav voice=clip delayMs=0
  91773 tv    hush
  91773 tv    clip         src=n38.wav muted=false ready=true delayMs=0
  91773 tv    speak        text=n38.wav voice=clip delayMs=0
  91866 tv    hush
  91866 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  91866 tv    speak        text=n39.wav voice=clip delayMs=0
  91973 tv    hush
  91973 tv    clip         src=o70.wav muted=false ready=true delayMs=0
  91973 tv    speak        text=o70.wav voice=clip delayMs=0
  92065 tv    hush
  92065 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  92065 tv    speak        text=b11.wav voice=clip delayMs=0
  92150 tv    hush
  92150 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  92150 tv    speak        text=o75.wav voice=clip delayMs=0
  92257 tv    hush
  92257 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  92257 tv    speak        text=g58.wav voice=clip delayMs=0
  92345 tv    hush
  92345 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  92345 tv    speak        text=b15.wav voice=clip delayMs=0
  92447 tv    hush
  92447 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  92447 tv    speak        text=i24.wav voice=clip delayMs=0
  92533 tv    hush
  92533 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  92533 tv    speak        text=o72.wav voice=clip delayMs=0
  92612 tv    hush
  92612 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  92612 tv    speak        text=g56.wav voice=clip delayMs=0
  92707 tv    hush
  92707 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  92707 tv    speak        text=i20.wav voice=clip delayMs=0
  92800 tv    hush
  92800 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  92800 tv    speak        text=n44.wav voice=clip delayMs=0
  92894 tv    hush
  92894 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  92894 tv    speak        text=b3.wav voice=clip delayMs=0
  92974 tv    hush
  92974 tv    clip         src=o68.wav muted=false ready=true delayMs=0
  92974 tv    speak        text=o68.wav voice=clip delayMs=0
  93068 tv    hush
  93068 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  93068 tv    speak        text=b2.wav voice=clip delayMs=0
  93163 tv    hush
  93163 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  93163 tv    speak        text=n41.wav voice=clip delayMs=0
  93261 tv    hush
  93261 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  93261 tv    speak        text=o65.wav voice=clip delayMs=0
  93356 tv    hush
  93356 tv    clip         src=i17.wav muted=false ready=true delayMs=0
  93356 tv    speak        text=i17.wav voice=clip delayMs=0
  93447 tv    hush
  93447 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  93447 tv    speak        text=i25.wav voice=clip delayMs=0
  93542 tv    hush
  93542 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  93542 tv    speak        text=i19.wav voice=clip delayMs=0
  93639 tv    hush
  93639 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  93639 tv    speak        text=g57.wav voice=clip delayMs=0
  93731 tv    hush
  93731 tv    clip         src=g59.wav muted=false ready=true delayMs=0
  93731 tv    speak        text=g59.wav voice=clip delayMs=0
  93824 tv    hush
  93824 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  93824 tv    speak        text=g49.wav voice=clip delayMs=0
  93933 tv    hush
  93933 tv    clip         src=n43.wav muted=false ready=true delayMs=0
  93933 tv    speak        text=n43.wav voice=clip delayMs=0
  94032 tv    hush
  94032 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  94032 tv    speak        text=i16.wav voice=clip delayMs=0
  94131 tv    hush
  94131 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  94131 tv    speak        text=n33.wav voice=clip delayMs=0
  94220 tv    hush
  94220 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  94220 tv    speak        text=i23.wav voice=clip delayMs=0
  94297 tv    hush
  94297 tv    clip         src=g54.wav muted=false ready=true delayMs=0
  94297 tv    speak        text=g54.wav voice=clip delayMs=0
  94395 tv    hush
  94395 tv    clip         src=b14.wav muted=false ready=true delayMs=0
  94395 tv    speak        text=b14.wav voice=clip delayMs=0
  94586 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  95609 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95871 tv    hush
  95871 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95871 tv    hush
 103475 tv    music:duck   ms=9000
 103475 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108488 tv    hush
 108488 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108488 tv    hush
 112490 tv    ss:cancel    speaking=false pending=false
 112490 tv    music:plan   from=game:bingo to=null
 112490 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113992 tv    music:stop   track=cool-vibes.mp3
 114105 tv    ss:cancel    speaking=false pending=false
 114105 tv    music:plan   from=null to=lobby
 114105 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 116615 tv    ss:cancel    speaking=false pending=false
 116625 tv    music:plan   from=lobby to=game:bingo
 116625 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116625 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116629 tv    hush
 116629 tv    hush
 117240 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 117248 tv    hush
 117248 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 117248 tv    speak        text=i21.wav voice=clip delayMs=0
 117249 tv    hush
 117263 tv    hush
 117263 tv    clip         src=n32.wav muted=false ready=true delayMs=0
 117263 tv    speak        text=n32.wav voice=clip delayMs=0
 117359 tv    hush
 117359 tv    clip         src=i18.wav muted=false ready=true delayMs=0
 117359 tv    speak        text=i18.wav voice=clip delayMs=0
 117425 tv    music:stop   track=bossa-antigua.mp3
 117437 tv    hush
 117437 tv    clip         src=n40.wav muted=false ready=true delayMs=0
 117437 tv    speak        text=n40.wav voice=clip delayMs=0
 117530 tv    hush
 117530 tv    clip         src=i30.wav muted=false ready=true delayMs=0
 117530 tv    speak        text=i30.wav voice=clip delayMs=0
 117613 tv    hush
 117613 tv    clip         src=o69.wav muted=false ready=true delayMs=0
 117613 tv    speak        text=o69.wav voice=clip delayMs=0
 117704 tv    hush
 117704 tv    clip         src=o61.wav muted=false ready=true delayMs=0
 117704 tv    speak        text=o61.wav voice=clip delayMs=0
 117799 tv    hush
 117799 tv    clip         src=n34.wav muted=false ready=true delayMs=0
 117799 tv    speak        text=n34.wav voice=clip delayMs=0
 117893 tv    hush
 117893 tv    clip         src=n35.wav muted=false ready=true delayMs=0
 117893 tv    speak        text=n35.wav voice=clip delayMs=0
 117988 tv    hush
 117988 tv    clip         src=o67.wav muted=false ready=true delayMs=0
 117988 tv    speak        text=o67.wav voice=clip delayMs=0
 118081 tv    hush
 118081 tv    clip         src=g55.wav muted=false ready=true delayMs=0
 118081 tv    speak        text=g55.wav voice=clip delayMs=0
 118177 tv    hush
 118177 tv    clip         src=i26.wav muted=false ready=true delayMs=0
 118177 tv    speak        text=i26.wav voice=clip delayMs=0
 118273 tv    hush
 118273 tv    clip         src=i22.wav muted=false ready=true delayMs=0
 118273 tv    speak        text=i22.wav voice=clip delayMs=0
 118368 tv    hush
 118368 tv    clip         src=i29.wav muted=false ready=true delayMs=0
 118368 tv    speak        text=i29.wav voice=clip delayMs=0
 118461 tv    hush
 118461 tv    clip         src=o66.wav muted=false ready=true delayMs=0
 118461 tv    speak        text=o66.wav voice=clip delayMs=0
 118557 tv    hush
 118557 tv    clip         src=g51.wav muted=false ready=true delayMs=0
 118557 tv    speak        text=g51.wav voice=clip delayMs=0
 118650 tv    hush
 118650 tv    clip         src=g53.wav muted=false ready=true delayMs=0
 118650 tv    speak        text=g53.wav voice=clip delayMs=0
 118730 tv    hush
 118730 tv    clip         src=b9.wav muted=false ready=true delayMs=0
 118730 tv    speak        text=b9.wav voice=clip delayMs=0
 118823 tv    hush
 118823 tv    clip         src=n36.wav muted=false ready=true delayMs=0
 118823 tv    speak        text=n36.wav voice=clip delayMs=0
 118918 tv    hush
 118918 tv    clip         src=g52.wav muted=false ready=true delayMs=0
 118918 tv    speak        text=g52.wav voice=clip delayMs=0
 119012 tv    hush
 119012 tv    clip         src=b1.wav muted=false ready=true delayMs=0
 119012 tv    speak        text=b1.wav voice=clip delayMs=0
 119108 tv    hush
 119108 tv    clip         src=b13.wav muted=false ready=true delayMs=0
 119108 tv    speak        text=b13.wav voice=clip delayMs=0
 119203 tv    hush
 119203 tv    clip         src=n37.wav muted=false ready=true delayMs=0
 119203 tv    speak        text=n37.wav voice=clip delayMs=0
 119282 tv    hush
 119282 tv    clip         src=o71.wav muted=false ready=true delayMs=0
 119282 tv    speak        text=o71.wav voice=clip delayMs=0
 119376 tv    hush
 119376 tv    clip         src=b8.wav muted=false ready=true delayMs=0
 119376 tv    speak        text=b8.wav voice=clip delayMs=0
 119471 tv    hush
 119471 tv    clip         src=b5.wav muted=false ready=true delayMs=0
 119471 tv    speak        text=b5.wav voice=clip delayMs=0
 119565 tv    hush
 119565 tv    clip         src=b7.wav muted=false ready=true delayMs=0
 119565 tv    speak        text=b7.wav voice=clip delayMs=0
 119659 tv    hush
 119659 tv    clip         src=n42.wav muted=false ready=true delayMs=0
 119659 tv    speak        text=n42.wav voice=clip delayMs=0
 119756 tv    hush
 119756 tv    clip         src=i28.wav muted=false ready=true delayMs=0
 119756 tv    speak        text=i28.wav voice=clip delayMs=0
 119864 tv    hush
 119864 tv    clip         src=i27.wav muted=false ready=true delayMs=0
 119864 tv    speak        text=i27.wav voice=clip delayMs=0
 119959 tv    hush
 119959 tv    clip         src=o63.wav muted=false ready=true delayMs=0
 119959 tv    speak        text=o63.wav voice=clip delayMs=0
 120053 tv    hush
 120053 tv    clip         src=o64.wav muted=false ready=true delayMs=0
 120053 tv    speak        text=o64.wav voice=clip delayMs=0
 120162 tv    hush
 120162 tv    clip         src=o73.wav muted=false ready=true delayMs=0
 120162 tv    speak        text=o73.wav voice=clip delayMs=0
 120257 tv    hush
 120257 tv    clip         src=g50.wav muted=false ready=true delayMs=0
 120257 tv    speak        text=g50.wav voice=clip delayMs=0
 120354 tv    hush
 120354 tv    clip         src=g48.wav muted=false ready=true delayMs=0
 120354 tv    speak        text=g48.wav voice=clip delayMs=0
 120446 tv    hush
 120446 tv    clip         src=b12.wav muted=false ready=true delayMs=0
 120446 tv    speak        text=b12.wav voice=clip delayMs=0
 120525 tv    hush
 120525 tv    clip         src=n45.wav muted=false ready=true delayMs=0
 120525 tv    speak        text=n45.wav voice=clip delayMs=0
 120618 tv    hush
 120618 tv    clip         src=b4.wav muted=false ready=true delayMs=0
 120618 tv    speak        text=b4.wav voice=clip delayMs=0
 120697 tv    hush
 120697 tv    clip         src=g46.wav muted=false ready=true delayMs=0
 120697 tv    speak        text=g46.wav voice=clip delayMs=0
 120790 tv    hush
 120790 tv    clip         src=o74.wav muted=false ready=true delayMs=0
 120790 tv    speak        text=o74.wav voice=clip delayMs=0
 120885 tv    hush
 120885 tv    clip         src=g47.wav muted=false ready=true delayMs=0
 120885 tv    speak        text=g47.wav voice=clip delayMs=0
 120980 tv    hush
 120980 tv    clip         src=n31.wav muted=false ready=true delayMs=0
 120980 tv    speak        text=n31.wav voice=clip delayMs=0
 121060 tv    hush
 121060 tv    clip         src=o62.wav muted=false ready=true delayMs=0
 121060 tv    speak        text=o62.wav voice=clip delayMs=0
 121154 tv    hush
 121154 tv    clip         src=b10.wav muted=false ready=true delayMs=0
 121154 tv    speak        text=b10.wav voice=clip delayMs=0
 121248 tv    hush
 121248 tv    clip         src=g60.wav muted=false ready=true delayMs=0
 121248 tv    speak        text=g60.wav voice=clip delayMs=0
 121342 tv    hush
 121342 tv    clip         src=n38.wav muted=false ready=true delayMs=0
 121342 tv    speak        text=n38.wav voice=clip delayMs=0
 121436 tv    hush
 121436 tv    clip         src=n39.wav muted=false ready=true delayMs=0
 121436 tv    speak        text=n39.wav voice=clip delayMs=0
 121530 tv    hush
 121530 tv    clip         src=o70.wav muted=false ready=true delayMs=0
 121530 tv    speak        text=o70.wav voice=clip delayMs=0
 121625 tv    hush
 121625 tv    clip         src=b11.wav muted=false ready=true delayMs=0
 121625 tv    speak        text=b11.wav voice=clip delayMs=0
 121720 tv    hush
 121720 tv    clip         src=o75.wav muted=false ready=true delayMs=0
 121720 tv    speak        text=o75.wav voice=clip delayMs=0
 121815 tv    hush
 121815 tv    clip         src=g58.wav muted=false ready=true delayMs=0
 121815 tv    speak        text=g58.wav voice=clip delayMs=0
 121911 tv    hush
 121911 tv    clip         src=b15.wav muted=false ready=true delayMs=0
 121911 tv    speak        text=b15.wav voice=clip delayMs=0
 122005 tv    hush
 122005 tv    clip         src=i24.wav muted=false ready=true delayMs=0
 122005 tv    speak        text=i24.wav voice=clip delayMs=0
 122112 tv    hush
 122112 tv    clip         src=o72.wav muted=false ready=true delayMs=0
 122112 tv    speak        text=o72.wav voice=clip delayMs=0
 122208 tv    hush
 122208 tv    clip         src=g56.wav muted=false ready=true delayMs=0
 122208 tv    speak        text=g56.wav voice=clip delayMs=0
 122304 tv    hush
 122304 tv    clip         src=i20.wav muted=false ready=true delayMs=0
 122304 tv    speak        text=i20.wav voice=clip delayMs=0
 122398 tv    hush
 122398 tv    clip         src=n44.wav muted=false ready=true delayMs=0
 122398 tv    speak        text=n44.wav voice=clip delayMs=0
 122492 tv    hush
 122492 tv    clip         src=b3.wav muted=false ready=true delayMs=0
 122492 tv    speak        text=b3.wav voice=clip delayMs=0
 122586 tv    hush
 122586 tv    clip         src=o68.wav muted=false ready=true delayMs=0
 122586 tv    speak        text=o68.wav voice=clip delayMs=0
 122680 tv    hush
 122680 tv    clip         src=b2.wav muted=false ready=true delayMs=0
 122680 tv    speak        text=b2.wav voice=clip delayMs=0
 122775 tv    hush
 122775 tv    clip         src=n41.wav muted=false ready=true delayMs=0
 122775 tv    speak        text=n41.wav voice=clip delayMs=0
 122871 tv    hush
 122871 tv    clip         src=o65.wav muted=false ready=true delayMs=0
 122871 tv    speak        text=o65.wav voice=clip delayMs=0
 122965 tv    hush
 122965 tv    clip         src=i17.wav muted=false ready=true delayMs=0
 122965 tv    speak        text=i17.wav voice=clip delayMs=0
 123060 tv    hush
 123060 tv    clip         src=i25.wav muted=false ready=true delayMs=0
 123060 tv    speak        text=i25.wav voice=clip delayMs=0
 123154 tv    hush
 123154 tv    clip         src=i19.wav muted=false ready=true delayMs=0
 123154 tv    speak        text=i19.wav voice=clip delayMs=0
 123249 tv    hush
 123249 tv    clip         src=g57.wav muted=false ready=true delayMs=0
 123249 tv    speak        text=g57.wav voice=clip delayMs=0
 123344 tv    hush
 123344 tv    clip         src=g59.wav muted=false ready=true delayMs=0
 123344 tv    speak        text=g59.wav voice=clip delayMs=0
 123439 tv    hush
 123439 tv    clip         src=g49.wav muted=false ready=true delayMs=0
 123439 tv    speak        text=g49.wav voice=clip delayMs=0
 123549 tv    hush
 123549 tv    clip         src=n43.wav muted=false ready=true delayMs=0
 123549 tv    speak        text=n43.wav voice=clip delayMs=0
 123644 tv    hush
 123644 tv    clip         src=i16.wav muted=false ready=true delayMs=0
 123644 tv    speak        text=i16.wav voice=clip delayMs=0
 123739 tv    hush
 123739 tv    clip         src=n33.wav muted=false ready=true delayMs=0
 123739 tv    speak        text=n33.wav voice=clip delayMs=0
 123834 tv    hush
 123834 tv    clip         src=i23.wav muted=false ready=true delayMs=0
 123834 tv    speak        text=i23.wav voice=clip delayMs=0
 123928 tv    hush
 123928 tv    clip         src=g54.wav muted=false ready=true delayMs=0
 123928 tv    speak        text=g54.wav voice=clip delayMs=0
 124022 tv    hush
 124022 tv    clip         src=b14.wav muted=false ready=true delayMs=0
 124022 tv    speak        text=b14.wav voice=clip delayMs=0
 124213 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 125243 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 125507 tv    hush
 125507 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 125508 tv    hush
 133116 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 133125 tv    music:duck   ms=9000
 133125 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 138118 tv    hush
 138118 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 138118 tv    hush
 139689 tv    ss:cancel    speaking=false pending=false
 139689 tv    music:plan   from=game:bingo to=null
 139691 tv    ss:cancel    speaking=false pending=false
 139691 tv    music:plan   from=null to=lobby
 139691 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 140493 tv    music:stop   track=wallpaper.mp3
 142196 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 142206 tv    ss:cancel    speaking=false pending=false
 142208 tv    music:plan   from=lobby to=game:bingo
 142208 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 142208 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 142211 tv    hush
 142212 tv    hush
 142824 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 143009 tv    music:stop   track=airport-lounge.mp3
 143442 tv    cue          cue=lock surface=tv muted=false ready=true semitones=4
 144357 tv    ss:cancel    speaking=false pending=false
 144357 tv    music:plan   from=game:bingo to=null
 144357 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 145859 tv    music:stop   track=cool-vibes.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"local-forecast-elevator.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 146488 tv    ss:cancel    speaking=false pending=false
 146488 tv    music:plan   from=null to=lobby
 146488 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 149845 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 149854 tv    ss:cancel    speaking=false pending=false
 149861 tv    music:plan   from=lobby to=game:bingo
 149861 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 149861 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149865 tv    hush
 149865 tv    hush
 150273 tv    cue          cue=lock surface=tv muted=false ready=true semitones=8
 150276 tv    hush
 150276 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 150276 tv    speak        text=i21.wav voice=clip delayMs=0
 150276 tv    hush
 150466 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 150661 tv    music:stop   track=local-forecast-elevator.mp3
 150771 tv    ss:cancel    speaking=false pending=false
 150771 tv    music:plan   from=game:bingo to=null
 150774 tv    ss:cancel    speaking=false pending=false
 150774 tv    music:plan   from=null to=lobby
 150774 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 151580 tv    music:stop   track=cool-vibes.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":10.2}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 156393 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156825 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157241 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157674 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158090 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 159206 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 159807 tv    ss:cancel    speaking=false pending=false
 159811 tv    music:plan   from=lobby to=null
 159811 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 161073 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 161312 tv    music:stop   track=bossa-antigua.mp3
 162657 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 163960 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 165243 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 166263 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 167315 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 169881 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 170072 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 170262 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 170437 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 171553 tv    ss:cancel    speaking=false pending=false
 171555 tv    ss:cancel    speaking=false pending=false
 171555 tv    music:plan   from=null to=lobby
 171555 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 173569 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 173574 tv    ss:cancel    speaking=false pending=false
 173576 tv    music:plan   from=lobby to=null
 173576 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 175077 tv    music:stop   track=local-forecast-elevator.mp3
 175147 tv    music:plan   from=null to=game:broken-pencil
 175147 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 175147 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 176630 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 177087 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 177244 tv    music:plan   from=game:broken-pencil to=null
 177244 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 178745 tv    music:stop   track=hep-cats.mp3
```
