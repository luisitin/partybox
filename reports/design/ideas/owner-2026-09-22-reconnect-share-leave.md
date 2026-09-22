# Owner, 2026-09-22 (evening) — the reconnect strobe, Share, Leave

## 1. "It just flashes reconnecting, reconnecting, reconnecting"

Two causes, both fixed.

**The link watchdog could loop.** A deadline that passed while the phone was away stays passed
until the server's next push, so a second after every reconnect the watchdog decided the link was
dead again and killed the fresh socket — forever. `net/link-watch.ts` now refuses to fire inside
5 s of a connect or 10 s of the last kick (the browser's own `offline` event still acts at once).
Unit-tested in `net/link-watch.test.ts`, including the loop itself.

**The banner followed the socket exactly.** `controller/flapFree.ts` turns a flapping link into one
steady message: 1.2 s of trouble before anything paints; when the link returns it waits 2.5 s to be
sure — a drop inside that window never even changes the text; then "✓ Back online" for 2 s and gone.

Probe (scratchpad `c-capture/probe_owner922b.ts`), six 400 ms drops back to back and then a real
2.5 s outage, logging every change of the banner's text:

```
before:  Reconnecting… / ✓ Back online / Reconnecting… / ✓ Back online … (11 changes)
after:   2852ms  Reconnecting…      ← one banner, through all six drops and the outage
         15309ms ✓ Back online      ← only once the link really holds
         17351ms (nothing)
```

## 2. Share is a pill in the corner, and it lets you pick

`navigator.share` — the iOS/Android sheet — **only exists in a secure context**, so a phone on the
LAN address (plain `http://192.168.4.87:42069`) never had one; that is why it only copied. Over the
https tunnel it did work.

`controller/ShareSheet.tsx`: a pink "🔗 Share" pill in the lobby's top-right corner. Where the phone
has a system sheet it opens it (and copies the link at the same time). Where it does not, PartyBox
opens its own chooser whose rows are links the phone handles itself — **💬 Messages**
(`sms:&body=…`, `?body=` on Android), **🟢 WhatsApp**, **✉️ Mail**, **📋 Copy the link** — plus the
room code and the link in full.

```
share pill box      {"x":252,"y":76,"width":125,"height":40}   viewport 393   ← top-right
navigator.share     undefined                                                 ← plain http
chooser rows        💬 Messages | 🟢 WhatsApp | ✉️ Mail | 📋 Copy the link | Close
Messages link       sms:&body=Join%20my%20PartyBox%20room%20PRSS%20http%3A%2F%2F…%2F%3Froom%3DPRSS
```

## 3. Leave, and open a room from the menu

A "🚪 Leave" pill beside Share: one tap arms it ("Leave?"), the second drops the session. It also
strips `?room=` from the URL (`net/leave-url.ts`) — without that, a phone that arrived by QR came
back to a join screen that skipped the code field and the room list.

```
after one tap   Leave?
screen now      Join the party   EN ES DE FR PT
new-room button ＋ Open a new room        ← opens another room on this same server (ADR-043)
rooms listed    PRSS 1 here
```

`pnpm verify` GREEN (119.3 s).

## 4. Both reachable mid-game, not only from the lobby (follow-up)

The pills live on the lobby screen, so during a game there was no way out and no way to share. The
🎨 sheet — reachable from every screen — now carries a **Room CODE** section with the same Share
button and a "🚪 Leave the room" row (tap to arm, tap to go).

Probe (scratchpad `c-capture/probe_sheet.ts`), Priya mid-Lightning-Round:

```
screen            Get ready!
lobby pills here  0                       ← the lobby's own pills are gone, as expected
sheet has         ROOM RJWD | 🔗 Share | 🚪 Leave the room
after one tap     🚪 Leave the room?  tap again
screen now        Join the party  EN ES DE FR PT
room list         RJWD playing · 1
players left in   1                       ← the server really dropped her
```
