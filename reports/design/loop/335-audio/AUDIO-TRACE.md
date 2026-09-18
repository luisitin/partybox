# Audio interaction trace

Captured 2026-09-18T21:54:00.331Z on port 42166. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**59 / 59 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:bossa-antigua
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":4.4}]

```
   1734 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
   1761 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3086 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3222 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3914 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4542 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5391 tv    ss:cancel    speaking=false pending=false
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
   6237 tv    music:plan   from=lobby to=null
   6237 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7744 tv    music:stop   track=bossa-antigua.mp3
   8190 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9473 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16445 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17445 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18445 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19442 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20445 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21242 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22047 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22205 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22358 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22515 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22673 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22831 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22991 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23160 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23314 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23472 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23615 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23775 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23929 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24084 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24240 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24395 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24550 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24709 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24866 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25748 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26072 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27874 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29613 tv    ss:cancel    speaking=false pending=false
  29613 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":1.5}]

```
  31149 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33302 tv    ss:cancel    speaking=false pending=false
  33302 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34834 tv    ss:cancel    speaking=false pending=false
  34834 tv    music:plan   from=null to=lobby
  34834 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:wallpaper music:stop:airport-lounge.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"wallpaper.mp3","vol":0.2,"t":3}]
- ✅ **intro: nothing spoken**
- ✅ **the intro: one card pluck on the deal (one card each), three ticks (3 · 2 · 1), then the first call — no phase chime** — cues=start,card,tick,tick,tick,call
- ✅ **the deal's pluck: TV and phone within 150 ms of each other** — tv@+956ms phone@+957ms
- ✅ **the phone taps 3 · 2 · 1 with the TV; "deal me another" is a 20 ms tap and one card pluck** — taps=3 cues=card
- ✅ **two calls → two boings and two recorded calls** — cues=call,call; spoken=b8.wav | n34.wav voice=clip
- ✅ **each voice starts on the push (no delay); its boing lands on the squash, 170–230 ms later** — delays=0,0 boing lags=190,192ms
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,silence,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,silence,wrong
- ✅ **music keeps playing through the check** — [{"track":"wallpaper.mp3","vol":0.2,"t":18.1}]
- ✅ **after the verdict: 3 · 2 · 1 ticks, then the next number is spoken (no call before the ticks)** — cues=tick,tick,tick,call spoken=n35.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"wallpaper.mp3","vol":0.2,"t":24.9}]
- ✅ **skipping through the deck: a hush before every call, one voice at a time** — clips=41 hushes=41
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, no lock tick under the cheer, music continues** — cues=reveal,sweep,cheer cheer@+5359ms playing=[{"track":"wallpaper.mp3","vol":0.06,"t":39.4}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,daub,claim,correct
- ✅ **the winner's celebration buzz (320 ms) runs whole — nothing shorter cuts it** — celebration@73441 cut by=[]
- ✅ **the other phone: one soft tap as the win lands, within 400 ms of the TV's cheer, no sound** — taps=30 tap@+5407ms cheer@+5369ms cues=
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → 3 · 2 · 1 ticks, then the number that was up is called again, no start/phase chime** — cues=silence,tick,tick,tick,call spoken=g57.wav
- ✅ **the pick lands in the picker's hand: a 'submit' cue and a 20 ms buzz, before the ticks** — cues=submit,tick,tick,tick
- ✅ **the phone ticks 3 · 2 · 1 with the TV, then feels the repeated call (a 12 ms buzz after the last tick)** — ticks=3 buzzIdx=6 lastTickIdx=5
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **between rounds → the scoreboard plays tally, not the phase chime** — phase=scoreboard cues=tally
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=tick,cheer playing=[]

```
  36398 tv    music:plan   from=lobby to=game:bingo
  36398 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  36398 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36702 tv    hush
  36702 tv    hush
  37198 tv    music:stop   track=airport-lounge.mp3
  37313 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  38404 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  39403 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  40404 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  41394 tv    hush
  41394 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  41394 tv    speak        text=b9.wav voice=clip delayMs=0
  41395 tv    hush
  41586 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  43047 tv    hush
  43047 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  43047 tv    speak        text=b8.wav voice=clip delayMs=0
  43237 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  44874 tv    hush
  44874 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  44874 tv    speak        text=n34.wav voice=clip delayMs=0
  45066 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  46751 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  47009 tv    hush
  47009 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  47009 tv    hush
  52362 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  52364 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  55368 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  56369 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  57370 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  58370 tv    hush
  58370 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  58370 tv    speak        text=n35.wav voice=clip delayMs=0
  58561 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  60152 tv    music:paused paused=true
  60152 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  61402 tv    music:paused paused=false
  61402 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  62670 tv    hush
  62670 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  62670 tv    speak        text=i25.wav voice=clip delayMs=0
  62780 tv    hush
  62780 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  62780 tv    speak        text=n45.wav voice=clip delayMs=0
  62906 tv    hush
  62906 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  62906 tv    speak        text=n33.wav voice=clip delayMs=0
  63032 tv    hush
  63032 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  63032 tv    speak        text=g49.wav voice=clip delayMs=0
  63158 tv    hush
  63158 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  63158 tv    speak        text=b4.wav voice=clip delayMs=0
  63269 tv    hush
  63269 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  63269 tv    speak        text=i20.wav voice=clip delayMs=0
  63394 tv    hush
  63394 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  63394 tv    speak        text=o69.wav voice=clip delayMs=0
  63520 tv    hush
  63520 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  63520 tv    speak        text=o67.wav voice=clip delayMs=0
  63646 tv    hush
  63646 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  63646 tv    speak        text=o65.wav voice=clip delayMs=0
  63773 tv    hush
  63773 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  63773 tv    speak        text=o73.wav voice=clip delayMs=0
  63899 tv    hush
  63899 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  63899 tv    speak        text=i21.wav voice=clip delayMs=0
  64024 tv    hush
  64024 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  64024 tv    speak        text=i18.wav voice=clip delayMs=0
  64148 tv    hush
  64148 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  64148 tv    speak        text=g58.wav voice=clip delayMs=0
  64274 tv    hush
  64274 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  64274 tv    speak        text=n36.wav voice=clip delayMs=0
  64401 tv    hush
  64401 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  64401 tv    speak        text=o61.wav voice=clip delayMs=0
  64526 tv    hush
  64526 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  64526 tv    speak        text=n37.wav voice=clip delayMs=0
  64654 tv    hush
  64654 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  64654 tv    speak        text=i16.wav voice=clip delayMs=0
  64779 tv    hush
  64779 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  64779 tv    speak        text=g47.wav voice=clip delayMs=0
  64904 tv    hush
  64904 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  64904 tv    speak        text=n41.wav voice=clip delayMs=0
  65030 tv    hush
  65030 tv    clip         src=b6.wav muted=false ready=true delayMs=0
  65030 tv    speak        text=b6.wav voice=clip delayMs=0
  65157 tv    hush
  65157 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  65157 tv    speak        text=o72.wav voice=clip delayMs=0
  65282 tv    hush
  65282 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  65282 tv    speak        text=b3.wav voice=clip delayMs=0
  65391 tv    hush
  65391 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  65391 tv    speak        text=i30.wav voice=clip delayMs=0
  65518 tv    hush
  65518 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  65518 tv    speak        text=g56.wav voice=clip delayMs=0
  65643 tv    hush
  65643 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  65643 tv    speak        text=o75.wav voice=clip delayMs=0
  65770 tv    hush
  65770 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  65770 tv    speak        text=b1.wav voice=clip delayMs=0
  65897 tv    hush
  65897 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  65897 tv    speak        text=b2.wav voice=clip delayMs=0
  66022 tv    hush
  66022 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  66022 tv    speak        text=n32.wav voice=clip delayMs=0
  66133 tv    hush
  66133 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  66133 tv    speak        text=g48.wav voice=clip delayMs=0
  66258 tv    hush
  66258 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  66258 tv    speak        text=i23.wav voice=clip delayMs=0
  66368 tv    hush
  66368 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  66368 tv    speak        text=i26.wav voice=clip delayMs=0
  66480 tv    hush
  66480 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  66480 tv    speak        text=o66.wav voice=clip delayMs=0
  66591 tv    hush
  66591 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  66591 tv    speak        text=i19.wav voice=clip delayMs=0
  66717 tv    hush
  66717 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  66717 tv    speak        text=n42.wav voice=clip delayMs=0
  66843 tv    hush
  66843 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  66843 tv    speak        text=i24.wav voice=clip delayMs=0
  66971 tv    hush
  66971 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  66971 tv    speak        text=n39.wav voice=clip delayMs=0
  67095 tv    hush
  67095 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  67095 tv    speak        text=g46.wav voice=clip delayMs=0
  67221 tv    hush
  67221 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  67221 tv    speak        text=n44.wav voice=clip delayMs=0
  67348 tv    hush
  67348 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  67348 tv    speak        text=b15.wav voice=clip delayMs=0
  67473 tv    hush
  67473 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  67473 tv    speak        text=b11.wav voice=clip delayMs=0
  67599 tv    hush
  67599 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  67599 tv    speak        text=g57.wav voice=clip delayMs=0
  67790 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  68217 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  68504 tv    hush
  68504 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  68504 tv    hush
  70378 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  73863 tv    music:duck   ms=9000
  73863 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  78675 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  78993 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  79995 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  80994 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
  81989 tv    hush
  81989 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  81989 tv    speak        text=g57.wav voice=clip delayMs=0
  82180 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  84314 tv    ss:cancel    speaking=false pending=false
  84314 tv    music:plan   from=game:bingo to=null
  84317 tv    ss:cancel    speaking=false pending=false
  84317 tv    music:plan   from=null to=lobby
  84317 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  85118 tv    music:stop   track=wallpaper.mp3
  86836 tv    ss:cancel    speaking=false pending=false
  86846 tv    music:plan   from=lobby to=game:bingo
  86846 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
  86846 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  86849 tv    hush
  86849 tv    hush
  87461 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
  87469 tv    hush
  87469 tv    clip         src=i21.wav muted=false ready=true delayMs=0
  87469 tv    speak        text=i21.wav voice=clip delayMs=0
  87469 tv    hush
  87484 tv    hush
  87484 tv    clip         src=n32.wav muted=false ready=true delayMs=0
  87484 tv    speak        text=n32.wav voice=clip delayMs=0
  87577 tv    hush
  87577 tv    clip         src=i18.wav muted=false ready=true delayMs=0
  87577 tv    speak        text=i18.wav voice=clip delayMs=0
  87647 tv    music:stop   track=bossa-antigua.mp3
  87655 tv    hush
  87655 tv    clip         src=n40.wav muted=false ready=true delayMs=0
  87655 tv    speak        text=n40.wav voice=clip delayMs=0
  87734 tv    hush
  87734 tv    clip         src=i30.wav muted=false ready=true delayMs=0
  87734 tv    speak        text=i30.wav voice=clip delayMs=0
  87829 tv    hush
  87829 tv    clip         src=o69.wav muted=false ready=true delayMs=0
  87829 tv    speak        text=o69.wav voice=clip delayMs=0
  87923 tv    hush
  87923 tv    clip         src=o61.wav muted=false ready=true delayMs=0
  87923 tv    speak        text=o61.wav voice=clip delayMs=0
  88016 tv    hush
  88016 tv    clip         src=n34.wav muted=false ready=true delayMs=0
  88016 tv    speak        text=n34.wav voice=clip delayMs=0
  88111 tv    hush
  88111 tv    clip         src=n35.wav muted=false ready=true delayMs=0
  88111 tv    speak        text=n35.wav voice=clip delayMs=0
  88206 tv    hush
  88206 tv    clip         src=o67.wav muted=false ready=true delayMs=0
  88206 tv    speak        text=o67.wav voice=clip delayMs=0
  88300 tv    hush
  88300 tv    clip         src=g55.wav muted=false ready=true delayMs=0
  88300 tv    speak        text=g55.wav voice=clip delayMs=0
  88409 tv    hush
  88409 tv    clip         src=i26.wav muted=false ready=true delayMs=0
  88409 tv    speak        text=i26.wav voice=clip delayMs=0
  88505 tv    hush
  88505 tv    clip         src=i22.wav muted=false ready=true delayMs=0
  88505 tv    speak        text=i22.wav voice=clip delayMs=0
  88585 tv    hush
  88585 tv    clip         src=i29.wav muted=false ready=true delayMs=0
  88585 tv    speak        text=i29.wav voice=clip delayMs=0
  88679 tv    hush
  88679 tv    clip         src=o66.wav muted=false ready=true delayMs=0
  88679 tv    speak        text=o66.wav voice=clip delayMs=0
  88773 tv    hush
  88773 tv    clip         src=g51.wav muted=false ready=true delayMs=0
  88773 tv    speak        text=g51.wav voice=clip delayMs=0
  88868 tv    hush
  88868 tv    clip         src=g53.wav muted=false ready=true delayMs=0
  88868 tv    speak        text=g53.wav voice=clip delayMs=0
  88963 tv    hush
  88963 tv    clip         src=b9.wav muted=false ready=true delayMs=0
  88963 tv    speak        text=b9.wav voice=clip delayMs=0
  89057 tv    hush
  89057 tv    clip         src=n36.wav muted=false ready=true delayMs=0
  89057 tv    speak        text=n36.wav voice=clip delayMs=0
  89152 tv    hush
  89152 tv    clip         src=g52.wav muted=false ready=true delayMs=0
  89152 tv    speak        text=g52.wav voice=clip delayMs=0
  89246 tv    hush
  89246 tv    clip         src=b1.wav muted=false ready=true delayMs=0
  89246 tv    speak        text=b1.wav voice=clip delayMs=0
  89340 tv    hush
  89340 tv    clip         src=b13.wav muted=false ready=true delayMs=0
  89340 tv    speak        text=b13.wav voice=clip delayMs=0
  89435 tv    hush
  89435 tv    clip         src=n37.wav muted=false ready=true delayMs=0
  89435 tv    speak        text=n37.wav voice=clip delayMs=0
  89530 tv    hush
  89530 tv    clip         src=o71.wav muted=false ready=true delayMs=0
  89530 tv    speak        text=o71.wav voice=clip delayMs=0
  89624 tv    hush
  89624 tv    clip         src=b8.wav muted=false ready=true delayMs=0
  89624 tv    speak        text=b8.wav voice=clip delayMs=0
  89719 tv    hush
  89719 tv    clip         src=b5.wav muted=false ready=true delayMs=0
  89719 tv    speak        text=b5.wav voice=clip delayMs=0
  89814 tv    hush
  89814 tv    clip         src=b7.wav muted=false ready=true delayMs=0
  89814 tv    speak        text=b7.wav voice=clip delayMs=0
  89910 tv    hush
  89910 tv    clip         src=n42.wav muted=false ready=true delayMs=0
  89910 tv    speak        text=n42.wav voice=clip delayMs=0
  90007 tv    hush
  90007 tv    clip         src=i28.wav muted=false ready=true delayMs=0
  90007 tv    speak        text=i28.wav voice=clip delayMs=0
  90100 tv    hush
  90100 tv    clip         src=i27.wav muted=false ready=true delayMs=0
  90100 tv    speak        text=i27.wav voice=clip delayMs=0
  90194 tv    hush
  90194 tv    clip         src=o63.wav muted=false ready=true delayMs=0
  90194 tv    speak        text=o63.wav voice=clip delayMs=0
  90288 tv    hush
  90288 tv    clip         src=o64.wav muted=false ready=true delayMs=0
  90288 tv    speak        text=o64.wav voice=clip delayMs=0
  90370 tv    hush
  90370 tv    clip         src=o73.wav muted=false ready=true delayMs=0
  90370 tv    speak        text=o73.wav voice=clip delayMs=0
  90461 tv    hush
  90461 tv    clip         src=g50.wav muted=false ready=true delayMs=0
  90461 tv    speak        text=g50.wav voice=clip delayMs=0
  90541 tv    hush
  90541 tv    clip         src=g48.wav muted=false ready=true delayMs=0
  90541 tv    speak        text=g48.wav voice=clip delayMs=0
  90641 tv    hush
  90641 tv    clip         src=b12.wav muted=false ready=true delayMs=0
  90641 tv    speak        text=b12.wav voice=clip delayMs=0
  90732 tv    hush
  90732 tv    clip         src=n45.wav muted=false ready=true delayMs=0
  90732 tv    speak        text=n45.wav voice=clip delayMs=0
  90811 tv    hush
  90811 tv    clip         src=b4.wav muted=false ready=true delayMs=0
  90811 tv    speak        text=b4.wav voice=clip delayMs=0
  90907 tv    hush
  90907 tv    clip         src=g46.wav muted=false ready=true delayMs=0
  90907 tv    speak        text=g46.wav voice=clip delayMs=0
  91000 tv    hush
  91000 tv    clip         src=o74.wav muted=false ready=true delayMs=0
  91000 tv    speak        text=o74.wav voice=clip delayMs=0
  91096 tv    hush
  91096 tv    clip         src=g47.wav muted=false ready=true delayMs=0
  91096 tv    speak        text=g47.wav voice=clip delayMs=0
  91190 tv    hush
  91191 tv    clip         src=n31.wav muted=false ready=true delayMs=0
  91191 tv    speak        text=n31.wav voice=clip delayMs=0
  91284 tv    hush
  91284 tv    clip         src=o62.wav muted=false ready=true delayMs=0
  91284 tv    speak        text=o62.wav voice=clip delayMs=0
  91382 tv    hush
  91382 tv    clip         src=b10.wav muted=false ready=true delayMs=0
  91382 tv    speak        text=b10.wav voice=clip delayMs=0
  91476 tv    hush
  91476 tv    clip         src=g60.wav muted=false ready=true delayMs=0
  91476 tv    speak        text=g60.wav voice=clip delayMs=0
  91570 tv    hush
  91570 tv    clip         src=n38.wav muted=false ready=true delayMs=0
  91570 tv    speak        text=n38.wav voice=clip delayMs=0
  91666 tv    hush
  91666 tv    clip         src=n39.wav muted=false ready=true delayMs=0
  91666 tv    speak        text=n39.wav voice=clip delayMs=0
  91758 tv    hush
  91758 tv    clip         src=o70.wav muted=false ready=true delayMs=0
  91758 tv    speak        text=o70.wav voice=clip delayMs=0
  91853 tv    hush
  91853 tv    clip         src=b11.wav muted=false ready=true delayMs=0
  91853 tv    speak        text=b11.wav voice=clip delayMs=0
  91948 tv    hush
  91948 tv    clip         src=o75.wav muted=false ready=true delayMs=0
  91948 tv    speak        text=o75.wav voice=clip delayMs=0
  92043 tv    hush
  92044 tv    clip         src=g58.wav muted=false ready=true delayMs=0
  92044 tv    speak        text=g58.wav voice=clip delayMs=0
  92138 tv    hush
  92138 tv    clip         src=b15.wav muted=false ready=true delayMs=0
  92138 tv    speak        text=b15.wav voice=clip delayMs=0
  92233 tv    hush
  92233 tv    clip         src=i24.wav muted=false ready=true delayMs=0
  92233 tv    speak        text=i24.wav voice=clip delayMs=0
  92325 tv    hush
  92325 tv    clip         src=o72.wav muted=false ready=true delayMs=0
  92325 tv    speak        text=o72.wav voice=clip delayMs=0
  92420 tv    hush
  92420 tv    clip         src=g56.wav muted=false ready=true delayMs=0
  92420 tv    speak        text=g56.wav voice=clip delayMs=0
  92517 tv    hush
  92517 tv    clip         src=i20.wav muted=false ready=true delayMs=0
  92517 tv    speak        text=i20.wav voice=clip delayMs=0
  92612 tv    hush
  92612 tv    clip         src=n44.wav muted=false ready=true delayMs=0
  92612 tv    speak        text=n44.wav voice=clip delayMs=0
  92705 tv    hush
  92705 tv    clip         src=b3.wav muted=false ready=true delayMs=0
  92705 tv    speak        text=b3.wav voice=clip delayMs=0
  92800 tv    hush
  92800 tv    clip         src=o68.wav muted=false ready=true delayMs=0
  92800 tv    speak        text=o68.wav voice=clip delayMs=0
  92896 tv    hush
  92896 tv    clip         src=b2.wav muted=false ready=true delayMs=0
  92896 tv    speak        text=b2.wav voice=clip delayMs=0
  92990 tv    hush
  92990 tv    clip         src=n41.wav muted=false ready=true delayMs=0
  92990 tv    speak        text=n41.wav voice=clip delayMs=0
  93085 tv    hush
  93085 tv    clip         src=o65.wav muted=false ready=true delayMs=0
  93085 tv    speak        text=o65.wav voice=clip delayMs=0
  93179 tv    hush
  93179 tv    clip         src=i17.wav muted=false ready=true delayMs=0
  93179 tv    speak        text=i17.wav voice=clip delayMs=0
  93259 tv    hush
  93259 tv    clip         src=i25.wav muted=false ready=true delayMs=0
  93259 tv    speak        text=i25.wav voice=clip delayMs=0
  93352 tv    hush
  93352 tv    clip         src=i19.wav muted=false ready=true delayMs=0
  93352 tv    speak        text=i19.wav voice=clip delayMs=0
  93448 tv    hush
  93448 tv    clip         src=g57.wav muted=false ready=true delayMs=0
  93448 tv    speak        text=g57.wav voice=clip delayMs=0
  93543 tv    hush
  93543 tv    clip         src=g59.wav muted=false ready=true delayMs=0
  93543 tv    speak        text=g59.wav voice=clip delayMs=0
  93636 tv    hush
  93636 tv    clip         src=g49.wav muted=false ready=true delayMs=0
  93636 tv    speak        text=g49.wav voice=clip delayMs=0
  93732 tv    hush
  93733 tv    clip         src=n43.wav muted=false ready=true delayMs=0
  93733 tv    speak        text=n43.wav voice=clip delayMs=0
  93827 tv    hush
  93827 tv    clip         src=i16.wav muted=false ready=true delayMs=0
  93827 tv    speak        text=i16.wav voice=clip delayMs=0
  93905 tv    hush
  93905 tv    clip         src=n33.wav muted=false ready=true delayMs=0
  93905 tv    speak        text=n33.wav voice=clip delayMs=0
  94001 tv    hush
  94001 tv    clip         src=i23.wav muted=false ready=true delayMs=0
  94001 tv    speak        text=i23.wav voice=clip delayMs=0
  94096 tv    hush
  94096 tv    clip         src=g54.wav muted=false ready=true delayMs=0
  94096 tv    speak        text=g54.wav voice=clip delayMs=0
  94191 tv    hush
  94191 tv    clip         src=b14.wav muted=false ready=true delayMs=0
  94191 tv    speak        text=b14.wav voice=clip delayMs=0
  94382 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  95416 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  95673 tv    hush
  95673 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  95673 tv    hush
 103280 tv    music:duck   ms=9000
 103280 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 108297 tv    hush
 108298 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 108298 tv    hush
 112298 tv    ss:cancel    speaking=false pending=false
 112298 tv    music:plan   from=game:bingo to=null
 112298 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 113803 tv    music:stop   track=wallpaper.mp3
 113927 tv    ss:cancel    speaking=false pending=false
 113927 tv    music:plan   from=null to=lobby
 113927 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 116436 tv    ss:cancel    speaking=false pending=false
 116447 tv    music:plan   from=lobby to=game:bingo
 116447 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116447 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116451 tv    hush
 116451 tv    hush
 117055 tv    hush
 117055 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 117055 tv    speak        text=i21.wav voice=clip delayMs=0
 117055 tv    hush
 117064 tv    hush
 117064 tv    clip         src=n32.wav muted=false ready=true delayMs=0
 117064 tv    speak        text=n32.wav voice=clip delayMs=0
 117166 tv    hush
 117166 tv    clip         src=i18.wav muted=false ready=true delayMs=0
 117166 tv    speak        text=i18.wav voice=clip delayMs=0
 117233 tv    hush
 117233 tv    clip         src=n40.wav muted=false ready=true delayMs=0
 117233 tv    speak        text=n40.wav voice=clip delayMs=0
 117248 tv    music:stop   track=george-street-shuffle.mp3
 117326 tv    hush
 117326 tv    clip         src=i30.wav muted=false ready=true delayMs=0
 117326 tv    speak        text=i30.wav voice=clip delayMs=0
 117434 tv    hush
 117434 tv    clip         src=o69.wav muted=false ready=true delayMs=0
 117434 tv    speak        text=o69.wav voice=clip delayMs=0
 117530 tv    hush
 117530 tv    clip         src=o61.wav muted=false ready=true delayMs=0
 117530 tv    speak        text=o61.wav voice=clip delayMs=0
 117624 tv    hush
 117624 tv    clip         src=n34.wav muted=false ready=true delayMs=0
 117624 tv    speak        text=n34.wav voice=clip delayMs=0
 117718 tv    hush
 117718 tv    clip         src=n35.wav muted=false ready=true delayMs=0
 117718 tv    speak        text=n35.wav voice=clip delayMs=0
 117815 tv    hush
 117815 tv    clip         src=o67.wav muted=false ready=true delayMs=0
 117815 tv    speak        text=o67.wav voice=clip delayMs=0
 117911 tv    hush
 117911 tv    clip         src=g55.wav muted=false ready=true delayMs=0
 117911 tv    speak        text=g55.wav voice=clip delayMs=0
 118004 tv    hush
 118004 tv    clip         src=i26.wav muted=false ready=true delayMs=0
 118004 tv    speak        text=i26.wav voice=clip delayMs=0
 118100 tv    hush
 118100 tv    clip         src=i22.wav muted=false ready=true delayMs=0
 118100 tv    speak        text=i22.wav voice=clip delayMs=0
 118196 tv    hush
 118196 tv    clip         src=i29.wav muted=false ready=true delayMs=0
 118196 tv    speak        text=i29.wav voice=clip delayMs=0
 118289 tv    hush
 118289 tv    clip         src=o66.wav muted=false ready=true delayMs=0
 118289 tv    speak        text=o66.wav voice=clip delayMs=0
 118383 tv    hush
 118383 tv    clip         src=g51.wav muted=false ready=true delayMs=0
 118383 tv    speak        text=g51.wav voice=clip delayMs=0
 118479 tv    hush
 118479 tv    clip         src=g53.wav muted=false ready=true delayMs=0
 118479 tv    speak        text=g53.wav voice=clip delayMs=0
 118574 tv    hush
 118574 tv    clip         src=b9.wav muted=false ready=true delayMs=0
 118574 tv    speak        text=b9.wav voice=clip delayMs=0
 118669 tv    hush
 118669 tv    clip         src=n36.wav muted=false ready=true delayMs=0
 118669 tv    speak        text=n36.wav voice=clip delayMs=0
 118765 tv    hush
 118765 tv    clip         src=g52.wav muted=false ready=true delayMs=0
 118765 tv    speak        text=g52.wav voice=clip delayMs=0
 118860 tv    hush
 118860 tv    clip         src=b1.wav muted=false ready=true delayMs=0
 118860 tv    speak        text=b1.wav voice=clip delayMs=0
 118955 tv    hush
 118955 tv    clip         src=b13.wav muted=false ready=true delayMs=0
 118955 tv    speak        text=b13.wav voice=clip delayMs=0
 119050 tv    hush
 119050 tv    clip         src=n37.wav muted=false ready=true delayMs=0
 119050 tv    speak        text=n37.wav voice=clip delayMs=0
 119146 tv    hush
 119146 tv    clip         src=o71.wav muted=false ready=true delayMs=0
 119146 tv    speak        text=o71.wav voice=clip delayMs=0
 119240 tv    hush
 119240 tv    clip         src=b8.wav muted=false ready=true delayMs=0
 119240 tv    speak        text=b8.wav voice=clip delayMs=0
 119333 tv    hush
 119333 tv    clip         src=b5.wav muted=false ready=true delayMs=0
 119333 tv    speak        text=b5.wav voice=clip delayMs=0
 119429 tv    hush
 119429 tv    clip         src=b7.wav muted=false ready=true delayMs=0
 119429 tv    speak        text=b7.wav voice=clip delayMs=0
 119522 tv    hush
 119522 tv    clip         src=n42.wav muted=false ready=true delayMs=0
 119522 tv    speak        text=n42.wav voice=clip delayMs=0
 119617 tv    hush
 119617 tv    clip         src=i28.wav muted=false ready=true delayMs=0
 119617 tv    speak        text=i28.wav voice=clip delayMs=0
 119711 tv    hush
 119711 tv    clip         src=i27.wav muted=false ready=true delayMs=0
 119711 tv    speak        text=i27.wav voice=clip delayMs=0
 119806 tv    hush
 119806 tv    clip         src=o63.wav muted=false ready=true delayMs=0
 119806 tv    speak        text=o63.wav voice=clip delayMs=0
 119904 tv    hush
 119904 tv    clip         src=o64.wav muted=false ready=true delayMs=0
 119904 tv    speak        text=o64.wav voice=clip delayMs=0
 119982 tv    hush
 119982 tv    clip         src=o73.wav muted=false ready=true delayMs=0
 119982 tv    speak        text=o73.wav voice=clip delayMs=0
 120077 tv    hush
 120077 tv    clip         src=g50.wav muted=false ready=true delayMs=0
 120077 tv    speak        text=g50.wav voice=clip delayMs=0
 120171 tv    hush
 120171 tv    clip         src=g48.wav muted=false ready=true delayMs=0
 120171 tv    speak        text=g48.wav voice=clip delayMs=0
 120252 tv    hush
 120252 tv    clip         src=b12.wav muted=false ready=true delayMs=0
 120252 tv    speak        text=b12.wav voice=clip delayMs=0
 120346 tv    hush
 120346 tv    clip         src=n45.wav muted=false ready=true delayMs=0
 120346 tv    speak        text=n45.wav voice=clip delayMs=0
 120416 tv    hush
 120416 tv    clip         src=b4.wav muted=false ready=true delayMs=0
 120416 tv    speak        text=b4.wav voice=clip delayMs=0
 120512 tv    hush
 120512 tv    clip         src=g46.wav muted=false ready=true delayMs=0
 120512 tv    speak        text=g46.wav voice=clip delayMs=0
 120611 tv    hush
 120611 tv    clip         src=o74.wav muted=false ready=true delayMs=0
 120611 tv    speak        text=o74.wav voice=clip delayMs=0
 120706 tv    hush
 120706 tv    clip         src=g47.wav muted=false ready=true delayMs=0
 120706 tv    speak        text=g47.wav voice=clip delayMs=0
 120786 tv    hush
 120786 tv    clip         src=n31.wav muted=false ready=true delayMs=0
 120786 tv    speak        text=n31.wav voice=clip delayMs=0
 120880 tv    hush
 120880 tv    clip         src=o62.wav muted=false ready=true delayMs=0
 120880 tv    speak        text=o62.wav voice=clip delayMs=0
 120977 tv    hush
 120977 tv    clip         src=b10.wav muted=false ready=true delayMs=0
 120977 tv    speak        text=b10.wav voice=clip delayMs=0
 121069 tv    hush
 121069 tv    clip         src=g60.wav muted=false ready=true delayMs=0
 121069 tv    speak        text=g60.wav voice=clip delayMs=0
 121165 tv    hush
 121165 tv    clip         src=n38.wav muted=false ready=true delayMs=0
 121165 tv    speak        text=n38.wav voice=clip delayMs=0
 121261 tv    hush
 121261 tv    clip         src=n39.wav muted=false ready=true delayMs=0
 121261 tv    speak        text=n39.wav voice=clip delayMs=0
 121337 tv    hush
 121337 tv    clip         src=o70.wav muted=false ready=true delayMs=0
 121337 tv    speak        text=o70.wav voice=clip delayMs=0
 121431 tv    hush
 121431 tv    clip         src=b11.wav muted=false ready=true delayMs=0
 121431 tv    speak        text=b11.wav voice=clip delayMs=0
 121525 tv    hush
 121525 tv    clip         src=o75.wav muted=false ready=true delayMs=0
 121525 tv    speak        text=o75.wav voice=clip delayMs=0
 121618 tv    hush
 121618 tv    clip         src=g58.wav muted=false ready=true delayMs=0
 121618 tv    speak        text=g58.wav voice=clip delayMs=0
 121713 tv    hush
 121713 tv    clip         src=b15.wav muted=false ready=true delayMs=0
 121713 tv    speak        text=b15.wav voice=clip delayMs=0
 121808 tv    hush
 121808 tv    clip         src=i24.wav muted=false ready=true delayMs=0
 121808 tv    speak        text=i24.wav voice=clip delayMs=0
 121903 tv    hush
 121903 tv    clip         src=o72.wav muted=false ready=true delayMs=0
 121903 tv    speak        text=o72.wav voice=clip delayMs=0
 121996 tv    hush
 121996 tv    clip         src=g56.wav muted=false ready=true delayMs=0
 121996 tv    speak        text=g56.wav voice=clip delayMs=0
 122092 tv    hush
 122092 tv    clip         src=i20.wav muted=false ready=true delayMs=0
 122092 tv    speak        text=i20.wav voice=clip delayMs=0
 122184 tv    hush
 122184 tv    clip         src=n44.wav muted=false ready=true delayMs=0
 122184 tv    speak        text=n44.wav voice=clip delayMs=0
 122292 tv    hush
 122292 tv    clip         src=b3.wav muted=false ready=true delayMs=0
 122292 tv    speak        text=b3.wav voice=clip delayMs=0
 122389 tv    hush
 122389 tv    clip         src=o68.wav muted=false ready=true delayMs=0
 122389 tv    speak        text=o68.wav voice=clip delayMs=0
 122481 tv    hush
 122481 tv    clip         src=b2.wav muted=false ready=true delayMs=0
 122481 tv    speak        text=b2.wav voice=clip delayMs=0
 122575 tv    hush
 122575 tv    clip         src=n41.wav muted=false ready=true delayMs=0
 122575 tv    speak        text=n41.wav voice=clip delayMs=0
 122668 tv    hush
 122668 tv    clip         src=o65.wav muted=false ready=true delayMs=0
 122668 tv    speak        text=o65.wav voice=clip delayMs=0
 122764 tv    hush
 122764 tv    clip         src=i17.wav muted=false ready=true delayMs=0
 122764 tv    speak        text=i17.wav voice=clip delayMs=0
 122858 tv    hush
 122858 tv    clip         src=i25.wav muted=false ready=true delayMs=0
 122858 tv    speak        text=i25.wav voice=clip delayMs=0
 122957 tv    hush
 122957 tv    clip         src=i19.wav muted=false ready=true delayMs=0
 122957 tv    speak        text=i19.wav voice=clip delayMs=0
 123050 tv    hush
 123050 tv    clip         src=g57.wav muted=false ready=true delayMs=0
 123050 tv    speak        text=g57.wav voice=clip delayMs=0
 123141 tv    hush
 123141 tv    clip         src=g59.wav muted=false ready=true delayMs=0
 123141 tv    speak        text=g59.wav voice=clip delayMs=0
 123233 tv    hush
 123233 tv    clip         src=g49.wav muted=false ready=true delayMs=0
 123233 tv    speak        text=g49.wav voice=clip delayMs=0
 123328 tv    hush
 123328 tv    clip         src=n43.wav muted=false ready=true delayMs=0
 123328 tv    speak        text=n43.wav voice=clip delayMs=0
 123423 tv    hush
 123423 tv    clip         src=i16.wav muted=false ready=true delayMs=0
 123423 tv    speak        text=i16.wav voice=clip delayMs=0
 123518 tv    hush
 123518 tv    clip         src=n33.wav muted=false ready=true delayMs=0
 123518 tv    speak        text=n33.wav voice=clip delayMs=0
 123616 tv    hush
 123616 tv    clip         src=i23.wav muted=false ready=true delayMs=0
 123616 tv    speak        text=i23.wav voice=clip delayMs=0
 123708 tv    hush
 123708 tv    clip         src=g54.wav muted=false ready=true delayMs=0
 123708 tv    speak        text=g54.wav voice=clip delayMs=0
 123803 tv    hush
 123803 tv    clip         src=b14.wav muted=false ready=true delayMs=0
 123803 tv    speak        text=b14.wav voice=clip delayMs=0
 123994 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 125031 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
 125299 tv    hush
 125299 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 125299 tv    hush
 132903 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
 132907 tv    music:duck   ms=9000
 132907 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 137904 tv    hush
 137904 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 137904 tv    hush
 139477 tv    ss:cancel    speaking=false pending=false
 139477 tv    music:plan   from=game:bingo to=null
 139479 tv    ss:cancel    speaking=false pending=false
 139479 tv    music:plan   from=null to=lobby
 139479 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 140280 tv    music:stop   track=wallpaper.mp3
 141987 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 141998 tv    ss:cancel    speaking=false pending=false
 142000 tv    music:plan   from=lobby to=game:bingo
 142000 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
 142000 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 142003 tv    hush
 142003 tv    hush
 142614 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 142800 tv    music:stop   track=george-street-shuffle.mp3
 144006 tv    cue          cue=tick surface=tv muted=false ready=true semitones=0
 144113 tv    ss:cancel    speaking=false pending=false
 144113 tv    music:plan   from=game:bingo to=null
 144113 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 145613 tv    music:stop   track=cool-vibes.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":2.5}]
- ✅ **nothing spoken in the lobby afterwards**

```
 146244 tv    ss:cancel    speaking=false pending=false
 146244 tv    music:plan   from=null to=lobby
 146244 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 149605 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 149615 tv    ss:cancel    speaking=false pending=false
 149617 tv    music:plan   from=lobby to=game:bingo
 149617 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 149617 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 149621 tv    hush
 149621 tv    hush
 150035 tv    hush
 150035 tv    clip         src=i21.wav muted=false ready=true delayMs=0
 150035 tv    speak        text=i21.wav voice=clip delayMs=0
 150035 tv    hush
 150227 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 150420 tv    music:stop   track=bossa-antigua.mp3
 150543 tv    ss:cancel    speaking=false pending=false
 150543 tv    music:plan   from=game:bingo to=null
 150546 tv    ss:cancel    speaking=false pending=false
 150546 tv    music:plan   from=null to=lobby
 150546 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 151347 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"bossa-antigua.mp3","vol":0.07,"t":10.1}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 156148 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156562 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 156980 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157413 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 157828 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 158912 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 159504 tv    ss:cancel    speaking=false pending=false
 159511 tv    music:plan   from=lobby to=null
 159511 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 160766 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 161012 tv    music:stop   track=bossa-antigua.mp3
 162347 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 163764 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 165048 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 166072 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 167113 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 169685 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 169876 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 170065 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 170254 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 171392 tv    ss:cancel    speaking=false pending=false
 171395 tv    ss:cancel    speaking=false pending=false
 171395 tv    music:plan   from=null to=lobby
 171395 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 173417 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 173424 tv    ss:cancel    speaking=false pending=false
 173432 tv    music:plan   from=lobby to=null
 173432 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 174933 tv    music:stop   track=airport-lounge.mp3
 174982 tv    music:plan   from=null to=game:broken-pencil
 174982 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 174982 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 176459 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 176933 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 177092 tv    music:plan   from=game:broken-pencil to=null
 177092 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 178592 tv    music:stop   track=hep-cats.mp3
```
