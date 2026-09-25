# Foundation p04 — main merged in; the guest phone and the TV's reading moment stay alive

Recorded 2026-09-24 with `capture-picker.ts --prod` on port 42300 after merging main (a005a7eb:
36 commits, incl. the lobby/join redesign, the offline card and I-648's settings glance) into
foundation. Same set-up as p03: TV 1920×1080, VIP iPhone 15, guest iPhone SE, 3 idle bots,
Wisecrack. Media gitignored.

## Dead air (gates: TV < 1.5 s outside a clocked input, phone < 3 s)

| Surface | p03       | p04                                             |
| ------- | --------- | ----------------------------------------------- |
| TV      | 1.6 s     | 1.6 s, only in the game's first (clocked) phase |
| VIP     | 2.4 s     | 2.3 s                                           |
| Guest   | **3.9 s** | **0** (never still)                             |

What changed:

- The guest's list is titled "Sam is choosing a game" with three dots rising in turn — a guest does
  not pick, and the line is the TV's own.
- The guest's chosen screen lights its how-to-play steps in turn (the TV's 1.8 s rhythm), with the
  VIP's settings under them, read-only and live (I-648: a change breathes).
- The TV's "Sam is reading about" line carries the same dots, so the spotlight never sits still while
  the VIP reads (it was 1.6 s between steps).

## Downloads

- Join: 190 KB transferred (157.8 KB gz JS + CSS; p03 152.7). The 5 KB is main's shell work since the
  split; the ratchet is re-baselined in `scripts/bundle-budget.json`.
- Lightning Round's phone download 13.5 → 11.4 KB gz: `NextStep.tsx` (I-589's Next button, on the
  phone and the TV) imported `Tv.module.css`, so every phone fetched the TV stylesheet; the button
  has its own now and check-bundle reports no TV code on any phone.
- Choosing Wisecrack: 14.2 KB (VIP) / 15.3 KB (guest), up from 12.3 / 13.4 with main's I-796 K.

## Frames

With video: TV 1 frame over 100 ms (117), VIP 0, guest 1 (133) — the recorder's cost on this
machine; the no-video run on the F3 build had none (p03).

## Looked at

`06-about-tv-open.png` (the reading line with its dots, the spotlight on Wisecrack, its grid card
ringed), `05-browse-p2.png` (the guest's title, the pill under it at 320 px), `11-chosen-p2.png`
(step 2 lit, the settings under the steps).
