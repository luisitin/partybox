# Foundation — the shell's start stage (ADR-053): the review package

Recorded 2026-09-25 on branch `ready-up` (stacked on `foundation-f4`), production build, port 42301.
Wisecrack, a TV, the VIP's phone (Sam) and a guest's (Maya), with bots.

## What to look at (design review)

- **The rules on every phone** (`M-rules-vip.png`, `M-rules-guest.png`): the game, its three
  how-to-play steps all at full strength (nothing lights in turn or hides on a timer), and one
  line + one button pinned below: "Waiting for Sam" over I'm ready. The VIP's ‹ Back is a quiet
  link above the game, never beside READY.
- **The TV** (`en-tv-tv-rules.png`, `en-tv-tv-half-ready.png`): the same rules large, a row of
  everyone's faces that light (ring + ✓ on the name, never colour alone) as each taps READY, bots
  lit already, and "Waiting for Maya" under them. Host bar: ‹ Back · ▶ Start now.
- **After your READY** (`M-vip-ready.png`): a guest's button turns to ✓ You're ready; the VIP's
  turns into ▶ Start now with "✓ You're ready · Waiting for Maya" above it.
- **The 3·2·1** (`M-count.png`, `en-tv-tv-count.png`): after the last READY, a 0.4 s breath, then
  one big number over the dimmed rules on the TV and every phone, each derived from the same server
  timestamp. The TV dims its stage only (the host bar stays readable, with ⏸ Wait). A cue per
  number on the TV; on a phone only when it carries the room's sound (phone only, or it can't see
  the TV). Reduced motion: the number changes without the zoom.
- **Wait** (`M-held-vip.png`, `M-held-guest.png`, `en-tv-tv-held.png`): the VIP's Wait on the count
  stops it; the rules stay up ("On hold: …") until Start now counts from 3 again.
- Sweep: iPhone SE, iPhone 15, 200 % text, sideways, English and Spanish, + the TV; 56 stills
  fit-audited, 0 problems (the count's numeral is exempt: it is meant to be huge).

## The edge cases, one recording each (`../stage-edges/<case>/`)

Videos per surface (`video/*.webm`), and a strip per marked moment per surface (`strips/`, 10 fps,
2.5 s). All seven ran green (`capture-stage-edges.ts`).

| case      | what happens                                                                                                                            |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `drop`    | Sam is ready; Maya's phone closes before her READY → the count starts without her.                                                      |
| `join`    | Sam is ready, Maya still reading; Leo joins → his phone gets the rules and a READY, and the count waits for him too; his tap starts it. |
| `vipdrop` | Maya is ready; the VIP's phone closes unready → nobody waits for it; the TV's host bar still has Back / Start now.                      |
| `allgone` | Sam ready, then both phones close → nothing counts; the TV says "Waiting for someone to come back"; Leo joins, reads, taps → 3·2·1.     |
| `solo`    | the VIP alone with two bots: their READY is the room's → the breath and the 3·2·1 still play.                                           |
| `back`    | the VIP's ‹ Back → every screen cross-fades to the picker, the game still chosen.                                                       |
| `wait`    | the count runs, the VIP taps Wait → the rules come back "On hold"; Start now → 3·2·1 → the game.                                        |

No timer anywhere in the stage: only READY, Start now, Wait or Back move it. Joining during the
count: the newcomer plays (the count doesn't restart for them).

## Also in this branch

- The TV's handoff into results uses the curtain too, like the one into a game (tune-in #8: a
  dissolve drew the game's last frame and the results' winner line at once).
- Every done button read "✓Submitted" (the space after ✓ collapsed inside an inline-block): now a
  margin.

## Try it live

`pnpm start --port 42301` from `C:/dev/partybox-foundation-ready` (branch `ready-up`). Pick a game and
Start: the stage opens on the TV and every phone.
