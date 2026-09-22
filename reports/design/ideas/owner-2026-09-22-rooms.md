# Owner, 2026-09-22 — language pills on top, a bigger scroll arrow, and rooms you can open yourself

Three asks in one message, all on the join screen and the ★ menu.

## 1. The language pills sit in the top-right corner

They were a centred row under the form; they are now the right half of the screen's title row
(`Join.module.css` `.head` / `.headTitle` / `.langs`, `Screen`'s `title` takes a node).

Probe on a 320 px iPhone SE (the narrowest phone in the harness):

```
title    x=16   width=288     (the whole title row)
langrow  x=174  width=129.6   (right-aligned inside it)
vw       320
```

Five pills wrap to two right-aligned rows at 320 px and sit on one row on a normal phone.

## 2. The "more below" chevron is a real thumb target

`Screen.module.css` `.more`: 32x22 → **56x40**, font 14 → 22 px, with a border and full-strength
text so it reads on a busy screen. Probe: `{"width":56,"height":40}`.

## 3. Open your own room, and browse the open ones (ADR-043)

- `POST /api/rooms` — a code you typed when it is free, else one the host picks. 400 `invalid`,
  409 `taken`, 429 over 12 rooms. Empty non-house rooms older than 10 minutes are reaped first.
- `RoomState.listed` (default true) in the snapshot; VIP action `setListed`; the ★ menu shows
  **🔓 Public — listed for anyone** / **🔒 Private — code only**.
- The join screen's room browser (`controller/RoomPicker.tsx`): the public rooms as chips
  (code · who is in · locked/playing), tap to fill the code, and "＋ Open room PQRS" / "＋ Open a
  new room".

Probe (scratchpad `c-capture/probe_rooms.ts`) — Sam in the house room, Priya on the bare URL:

```
list as Priya sees it     UTHV 1 here
new-room button           ＋ Open room PQRS
code field after create   PQRS
server rooms              [["UTHV",true],["PQRS",true]]
Priya is in               Lobby
vip toggle                🔓 Public — listed for anyone  →  🔒 Private — code only
server rooms after        [["UTHV",true],["PQRS",false]]
list as a 3rd phone sees  UTHV 1 here            ← the private room is gone from the list
Mo joined the private one Lobby                  ← …but still joins by code
final rooms               [["UTHV",1,true],["PQRS",2,false]]
bad code                  400 {"error":"invalid","message":"A code is 4 letters from ABCDEFGHJKMNPQRSTUVWXYZ."}
taken code                409 {"error":"taken","message":"That code is already in use."}
```

It is one host process and one engine — a second room is not a second node. A new room has no TV
until someone opens `/tv?room=CODE` (already supported), or the VIP turns on "phone only".

`pnpm verify` GREEN (119.9 s).
