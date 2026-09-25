# Foundation p06 — F4 presence (ADR-047): the review package

Recorded 2026-09-24 on branch `foundation-f4`, production build, port 42300. A room with a TV, the
VIP's phone and a remote phone (`?canSeeTv=0`), with two bots.

## What to look at (design review)

- **Remote phone gets the stage** (`../presence/`, `probe-presence.ts`, 5/5): during Bingo only the
  remote phone fetches the caller's clips (2 vs 0) and never says "look at the TV". On a claim, only
  the remote phone takes the check (`02-check-remote.png`). The at-TV phone shows "Look at the TV"
  (`02-check-vip.png`).
- **The question** (`M-vip-prompt.png`, `en/es-tv-tv-ask.png`): "Maya can't see the TV. Are you on a
  call?" sits in the lobby under the roster (On a call · No call · Not now). The TV asks on its picker
  in the room-switch row: one row, and the grid keeps all its games.
- **The remote phone's own answer** (`M-remote-see-tv.png`): 👀 "I can see the TV · Off" in the 🎨
  sheet, with the line saying what Off means.
- **Where is everyone?** (`M-vip-menu.png`, `M-vip-menu-answered.png`): three answers in the ★ menu
  beside Phone only, filled and ticked (never colour alone). The TV's chip follows (`tv-chip`).
- Sweep: iPhone SE, iPhone 15, 200 % text, sideways, English and Spanish; 36 stills fit-audited, 0
  problems.

## Found by this sweep and fixed

- The TV's question and the room switches took two rows and covered the grid's last games. The
  question now replaces the switches while it's up.
- Hive Rank's long Spanish steps squeezed the TV spotlight's tagline to a clipped line. The heading and
  tagline no longer shrink; the steps are 24 px.
- The VIP's question floated over the lobby like a toast, covering "Add a bot" and the tip line. It now
  sits in the lobby's flow.
- At 200 % text in Spanish the whole ★ menu was wider than the phone and slid sideways. The menu's
  grid used `1fr 1fr`, and the room-size "+" hung 5 px off the edge. Both fixed.
- At 200 % text the menu's players lost their names to the buttons. The Make VIP / Kick pair now
  drops under the name together.

## Try it live

`pnpm start --port 42300` from `C:/dev/partybox-foundation` (branch `foundation-f4`). A room starts
together with a TV. Open a phone with `?canSeeTv=0` on its URL (or switch 👀 off in its 🎨 sheet) to
be the remote player.
