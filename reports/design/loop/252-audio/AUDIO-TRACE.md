# Audio interaction trace

Captured 2026-09-18T05:44:38.445Z on port 42172. Every cue, music event, speech call and buzz the TV and two phones produced, scenario by scenario, with the checks that were run.

**49 / 49 checks passed.**

## A · Lobby: gate, joins, bots, selecting

- ✅ **before the gate tap nothing is audible** — cues=none, playing=[]
- ✅ **gate tap → ready chime + lobby music starts** — cues=ready; music=music:start:airport-lounge
- ✅ **two joins → two join cues, rising** — semitones=0,2
- ✅ **add 2 bots (one push = one join note) + remove 1 → a join, a leave** — cues=join,leave
- ✅ **selecting keeps the lobby music (no plan change), a status-swap cue only** — cues=none; playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":4.5}]

```
   1757 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
   1784 tv    cue          cue=ready surface=tv muted=false ready=true semitones=0
   3110 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
   3251 tv    cue          cue=join surface=tv muted=false ready=true semitones=2
   3958 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
   4599 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
   5454 tv    ss:cancel    speaking=false pending=false
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
   6307 tv    music:plan   from=lobby to=null
   6307 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
   7813 tv    music:stop   track=airport-lounge.mp3
   8267 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
   9580 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  16520 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=0
  17519 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=2
  18519 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=4
  19519 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=5
  20518 tv    cue          cue=countdown surface=tv muted=false ready=true semitones=7
  21317 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22105 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22266 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22424 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22574 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  22731 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  22889 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23034 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23190 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23347 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23502 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23659 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  23817 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  23973 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24131 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24286 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24457 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24603 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  24760 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  24902 tv    cue          cue=wager surface=tv muted=false ready=true semitones=0
  25777 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  26110 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  27912 tv    cue          cue=bust surface=tv muted=false ready=true semitones=0
  29638 tv    ss:cancel    speaking=false pending=false
  29638 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
```

## C · Play again, end game, new game, back to lobby

- ✅ **play again → start cue, still no music, no second cheer** — cues=start
- ✅ **VIP ends the game → results → one cheer** — cues=cheer
- ✅ **new game → selecting → lobby music comes back (plan null→lobby)** — plan=null→lobby; playing=[{"track":"bossa-antigua.mp3","vol":0.35,"t":1.5}]

```
  31193 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  33360 tv    ss:cancel    speaking=false pending=false
  33360 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  34913 tv    ss:cancel    speaking=false pending=false
  34913 tv    music:plan   from=null to=lobby
  34913 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
```

## D · Bingo: music set, the caller, a wrong claim, a bingo, keep going, results

- ✅ **Bingo start → lobby music fades out, the Bingo set starts (wallpaper or cool-vibes at 0.2)** — music=music:plan:lobby→game:bingo music:start:cool-vibes music:stop:bossa-antigua.mp3
- ✅ **exactly one track audible after the switch** — [{"track":"cool-vibes.mp3","vol":0.2,"t":2.9}]
- ✅ **intro: nothing spoken**
- ✅ **two calls → two boings and two recorded calls** — cues=phase,call,call; spoken=b9.wav | b8.wav voice=clip
- ✅ **the phones stay silent during calls**
- ✅ **the first tap → the TV says "hm?" (dibs) once, before the verdict** — cues=dibs,reveal,wrong
- ✅ **wrong claim → caller hushed at once, buzzer at the verdict (after the reveal), no chime on entry, nothing spoken** — events=dibs,hush,reveal,hush,wrong
- ✅ **music keeps playing through the check** — [{"track":"cool-vibes.mp3","vol":0.2,"t":15.4}]
- ✅ **play resumes → the next number is spoken** — spoken=n34.wav
- ✅ **pause → pause cue, music holds, no new call** — cues=pause playing=[]
- ✅ **resume → phase chime, music resumes** — cues=phase playing=[{"track":"cool-vibes.mp3","vol":0.2,"t":18.9}]
- ✅ **BINGO → caller hushed, the reveal lift on the announce, sweep as the line turns, cheer once at the verdict (~6.4 s), no chime on entry, music continues** — cues=reveal,sweep,cheer cheer@+5369ms playing=[{"track":"cool-vibes.mp3","vol":0.06,"t":32.9}]
- ✅ **the winner's phone: a dauber per daub, the claim cue on the tap, 'correct' when the verdict lands** — phone cues=daub,daub,claim,correct
- ✅ **celebration waits: still in the bingo phase, nothing spoken**
- ✅ **keep going (blackout) → play resumes, the number that was up is called again, no start/phase chime** — cues=lock,silence,phase,call spoken=g46.wav
- ✅ **the last bingo → the drumroll: the final board with the tally chime, no cheer or fanfare yet** — phase=final cues=lock,tally
- ✅ **4 s on → the results cheer, once** — status=results cues=cheer
- ✅ **VIP ends Bingo → results cheer once; Bingo music stops; no speech after leaving play** — cues=cheer playing=[]

```
  36486 tv    music:plan   from=lobby to=game:bingo
  36486 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  36486 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  36798 tv    hush
  36798 tv    hush
  37286 tv    music:stop   track=bossa-antigua.mp3
  39539 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  39734 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  39734 tv    clip         src=b9.wav muted=false ready=true
  39734 tv    speak        text=b9.wav voice=clip
  41566 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  41567 tv    clip         src=b8.wav muted=false ready=true
  41567 tv    speak        text=b8.wav voice=clip
  43247 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  43513 tv    hush
  43513 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  43514 tv    hush
  48866 tv    cue          cue=wrong surface=tv muted=false ready=true semitones=0
  52051 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  52242 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  52242 tv    clip         src=n34.wav muted=false ready=true
  52242 tv    speak        text=n34.wav voice=clip
  54266 tv    music:paused paused=true
  54266 tv    cue          cue=pause surface=tv muted=false ready=true semitones=0
  55516 tv    music:paused paused=false
  55516 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  61607 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  61607 tv    clip         src=g46.wav muted=false ready=true
  61607 tv    speak        text=g46.wav voice=clip
  62012 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  62291 tv    hush
  62291 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  62292 tv    hush
  64179 tv    cue          cue=sweep surface=tv muted=false ready=true semitones=0
  67660 tv    music:duck   ms=9000
  67660 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
  72401 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
  72413 tv    cue          cue=silence surface=tv muted=false ready=true semitones=0
  72739 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  72935 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  72935 tv    clip         src=g46.wav muted=false ready=true
  72935 tv    speak        text=g46.wav voice=clip
  76325 tv    ss:cancel    speaking=false pending=false
  76325 tv    music:plan   from=game:bingo to=null
  76331 tv    ss:cancel    speaking=false pending=false
  76331 tv    music:plan   from=null to=lobby
  76331 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
  77134 tv    music:stop   track=cool-vibes.mp3
  78885 tv    ss:cancel    speaking=false pending=false
  78902 tv    music:plan   from=lobby to=game:bingo
  78902 tv    music:start  plan=game:bingo track=cool-vibes mode=chain volume=0.2
  78902 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
  78908 tv    hush
  78908 tv    hush
  79518 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
  79713 tv    music:stop   track=bossa-antigua.mp3
  86666 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
  86666 tv    clip         src=b14.wav muted=false ready=true
  86666 tv    speak        text=b14.wav voice=clip
  87777 tv    cue          cue=dibs surface=tv muted=false ready=true semitones=0
  88046 tv    hush
  88046 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
  88046 tv    hush
  95658 tv    music:duck   ms=9000
  95658 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 100647 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 100654 tv    hush
 100655 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
 100656 tv    hush
 104647 tv    ss:cancel    speaking=false pending=false
 104647 tv    music:plan   from=game:bingo to=null
 104647 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 106148 tv    music:stop   track=cool-vibes.mp3
 106251 tv    ss:cancel    speaking=false pending=false
 106251 tv    music:plan   from=null to=lobby
 106251 tv    music:start  plan=lobby track=local-forecast-elevator mode=rotate volume=0.35
 108770 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 108786 tv    ss:cancel    speaking=false pending=false
 108791 tv    music:plan   from=lobby to=game:bingo
 108791 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 108792 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 108797 tv    hush
 108798 tv    hush
 109597 tv    music:stop   track=local-forecast-elevator.mp3
 110924 tv    ss:cancel    speaking=false pending=false
 110924 tv    music:plan   from=game:bingo to=null
 110924 tv    cue          cue=cheer surface=tv muted=false ready=true semitones=0
 112437 tv    music:stop   track=wallpaper.mp3
```

## E · Home (reset) from results and mid-game

- ✅ **Home → fresh lobby → lobby music again, no cheer, speech cancelled** — plan=null→lobby playing=[{"track":"airport-lounge.mp3","vol":0.35,"t":2.5}]
- ✅ **Home mid-call → speech cancelled, Bingo music out, lobby music in, one track audible** — events=ss:cancel,music:plan,ss:cancel,music:plan,music:start,music:stop playing=[{"track":"george-street-shuffle.mp3","vol":0.35,"t":2.4}]
- ✅ **nothing spoken in the lobby afterwards**

```
 113037 tv    ss:cancel    speaking=false pending=false
 113037 tv    music:plan   from=null to=lobby
 113037 tv    music:start  plan=lobby track=airport-lounge mode=rotate volume=0.35
 116398 tv    cue          cue=join surface=tv muted=false ready=true semitones=0
 116414 tv    ss:cancel    speaking=false pending=false
 116418 tv    music:plan   from=lobby to=game:bingo
 116418 tv    music:start  plan=game:bingo track=wallpaper mode=chain volume=0.2
 116418 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 116424 tv    hush
 116425 tv    hush
 116834 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 117032 tv    cue          cue=call surface=tv muted=false ready=true semitones=0
 117032 tv    clip         src=i21.wav muted=false ready=true
 117032 tv    speak        text=i21.wav voice=clip
 117224 tv    music:stop   track=airport-lounge.mp3
 117321 tv    ss:cancel    speaking=false pending=false
 117321 tv    music:plan   from=game:bingo to=null
 117329 tv    ss:cancel    speaking=false pending=false
 117329 tv    music:plan   from=null to=lobby
 117329 tv    music:start  plan=lobby track=george-street-shuffle mode=rotate volume=0.35
 118140 tv    music:stop   track=wallpaper.mp3
```

## F · Wisecrack: reveal sting vs phase chime, sweep, tally

- ✅ **Wisecrack start → start cue, no music (none configured; the lobby track only fading out)** — cues=leave,leave,leave,leave,leave,join,start playing=[{"track":"george-street-shuffle.mp3","vol":0.07,"t":10.2}]
- ✅ **answers → lock ticks on the TV as phones submit** — cues=phase,lock,lock,phase
- ✅ **submitting on the phone → submit cue + buzz** — phone cues=submit
- ✅ **reveal → the reveal sting from the game, no phase chime within it** — cues=reveal,phase
- ✅ **scores phase → tally ping (mapped)** — cues=reveal,phase,reveal,tally

```
 122909 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 123341 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 123758 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 124191 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 124607 tv    cue          cue=leave surface=tv muted=false ready=true semitones=0
 125757 tv    cue          cue=join surface=tv muted=false ready=true semitones=4
 126363 tv    ss:cancel    speaking=false pending=false
 126371 tv    music:plan   from=lobby to=null
 126371 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 127631 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 127880 tv    music:stop   track=george-street-shuffle.mp3
 129251 tv    cue          cue=lock surface=tv muted=false ready=true semitones=0
 130580 tv    cue          cue=lock surface=tv muted=false ready=true semitones=2
 131904 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 132978 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 134027 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 136588 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 136778 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 136969 tv    cue          cue=reveal surface=tv muted=false ready=true semitones=0
 137158 tv    cue          cue=tally surface=tv muted=false ready=true semitones=0
```

## G · Broken Pencil: music only while drawing/guessing, reveal on show

- ✅ **first phase (pick) → no game music yet unless it is draw/guess/pass** — phase=pick playing=[] plan=null→lobby lobby→null
- ✅ **draw/guess/pass (draw) → the Broken Pencil set at 0.2, one track** — [{"track":"hep-cats.mp3","vol":0.2,"t":1.4}]
- ✅ **show → the soft 'card' page-turn pluck (mapped since loop 93), music stops (show)** — cues=phase,phase,card playing=[]

```
 138253 tv    ss:cancel    speaking=false pending=false
 138258 tv    ss:cancel    speaking=false pending=false
 138258 tv    music:plan   from=null to=lobby
 138258 tv    music:start  plan=lobby track=bossa-antigua mode=rotate volume=0.35
 140271 tv    cue          cue=join surface=tv muted=false ready=true semitones=5
 140283 tv    ss:cancel    speaking=false pending=false
 140295 tv    music:plan   from=lobby to=null
 140295 tv    cue          cue=start surface=tv muted=false ready=true semitones=0
 141797 tv    music:stop   track=bossa-antigua.mp3
 141846 tv    music:plan   from=null to=game:broken-pencil
 141846 tv    music:start  plan=game:broken-pencil track=hep-cats mode=chain volume=0.2
 141846 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143318 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143790 tv    cue          cue=phase surface=tv muted=false ready=true semitones=0
 143930 tv    music:plan   from=game:broken-pencil to=null
 143930 tv    cue          cue=card surface=tv muted=false ready=true semitones=0
 145435 tv    music:stop   track=hep-cats.mp3
```
