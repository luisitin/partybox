# Foundation p06 — F4 presence (ADR-047): the review package

Recorded 2026-09-24 on branch `foundation-f4`, production build, port 42300. A room with a TV, the
VIP's phone and a remote phone (`?canSeeTv=0`), with two bots.

## What to look at (design review)

- **Remote phone gets the stage** (`../presence/`, `probe-presence.ts`, 5/5): during Bingo only the
  remote phone fetches the caller's clips (2 vs 0) and never says "look at the TV". On a claim, only
  the remote phone takes the check (`02-check-remote.png`). The at-TV phone shows "Look at the TV"
  (`02-check-vip.png`).
- **The question** (`M-vip-prompt.png`, `en/es-tv-tv-ask.png`): "Maya can't see the TV. Is Maya on a
  call with you?" sits in the lobby's flow above the roster, so both answers are on an SE's first
  screen. Each answer says what it changes (🎧 On a call · Talking games play as usual; 💬 No call ·
  Talking games warn you first; some switch to typing); Not now is centred under them. It never
  follows the VIP into the picker (the picker is its own screen). The TV asks on its picker in the
  room-switch row: one row, and the grid keeps all its games.
- **The remote phone's own answer** (`M-remote-see-tv.png`): the 🎨 sheet is now titled "This phone"
  and opens on its group: 👀 I can see the TV, 📺 TV sounds on this phone, 📳 Vibration, each with its
  line inside its card; the themes follow under their own heading. An outline means On and the state
  says "✓ On".
- **Where is everyone?** (`M-vip-menu.png`, `M-vip-menu-answered.png`): three answers in the ★ menu
  beside Phone only, filled and ticked (never colour alone).
- **The TV's chip in every mode** (`en/es-tv-tv-chip-remote-voice/remote-text/together.png`):
  🎧 Some remote, on a call · 💬 Some remote, no call · 📍 All in one room.
- **Toasts (S2)**: one at a time, dropped over the header bar (never over what a player reads or
  types), taps pass through, and a longer line stays longer (2.5–6 s). A room switch's toast goes to
  the TV and the VIP only: `M-guest-after-switch.png` is a guest's phone right after the switch.
- Sweep: iPhone SE, iPhone 15, 200 % text, sideways, English and Spanish; 48 stills fit-audited, 0
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

## Fixed for the reviewer's CHANGES [5baf8a]

- C1: the presence contract case is six small cases (mode × phone only) at the fewest players.
- C2: Tailscale's IPv6 range (fd7a:115c:a1e0::/48) is remote, though it sits inside ULA.
- C3: a phone's "I can see the TV" is kept for that room and that night only (12 h).
- D1–D4 and S1 (the picker drawn over the first game frame: the ghost now has its own layer, see
  `../p07-curtain/`) and S2 as above. Also the Share sheet's labels centred, theme names fill their
  row at 200 %, and the join screen's "4 letters from the TV" is a line under the label (an input
  can't wrap; at 200 % it was cut off).

## Try it live

`pnpm start --port 42300` from `C:/dev/partybox-foundation` (branch `foundation-f4`). A room starts
together with a TV. Open a phone with `?canSeeTv=0` on its URL (or switch 👀 off in its 🎨 sheet) to
be the remote player.
