# Changelog

All notable changes. Format: [Keep a Changelog](https://keepachangelog.com/); conventional commits feed it.

## [Unreleased]

### Fixed

- **Share hands out the link that works from anywhere, and Copy works** (the owner, 2026-09-22):
  the server now knows the Cloudflare tunnel's address (`PARTYBOX_PUBLIC_URL`, or the newest one in
  `cloudflared.log` while a `cloudflared` process is running — local signals only, ADR-012) and
  Share, Messages, WhatsApp, Mail and Copy all use it; the QR and the TV keep the faster LAN
  address. "Copy the link" failed on the LAN page because the Clipboard API only exists on https;
  it now falls back to a selection copy inside the same tap.

- **A correctness pass over the whole product** (2026-09-22, `reports/design/ideas/review-2026-09-22-correctness.md`):
  phone-only rooms no longer send anyone to a TV (the SDK controls' default lines, the results
  screen, Bingo and Wisecrack — `usePhoneOnly()` in the SDK); the Postage stamp no longer outlines
  only the top-left block and its demo plays all four corners; the join funnel counts one "opened"
  per join-page load (it counted the VIP's game picker and every refresh); taken-face badges follow
  the room being joined; the room reaper spares a room a TV is watching; opening rooms is limited to three per address, then one per 20 s; and Vitest's projects now
  really get the 20 s test timeout (`extends: true` — every test had been on the 5 s default).
  Also: a tap that races the end of a game no longer puts "⚠ No game is running." over the
  results; a reconnect no longer pops a "Back online" toast on top of the banner; the ROOM CODE
  field and the room picker speak the join screen's language; and the share chooser says when its
  link only works on this Wi-Fi.
  A phone-only room now plays the game's music on the phones (Broken Pencil was silent there), and
  a phone's Sound switch mutes its music and beds too, not just its cues.
  Names that render as nothing (Hangul fillers, the braille blank) are refused like empty ones, and
  a reloaded phone no longer logs a blocked-vibrate error on every push before it is touched.

- **The phone's audio comes back after a lock** (the owner, 2026-09-22 — "in phone only mode I
  don't hear the caller"): iOS parks the AudioContext when the phone locks or backgrounds, and
  nothing resumed it after the join gesture, so a phone went quiet mid-game. The page becoming
  visible, a tap, or a clip asked for while it is parked now revive it — and a call whose clip
  will not decode falls back to an `<audio>` element instead of being skipped.

- **"Reconnecting…" no longer strobes** (the owner, 2026-09-22): the link watchdog could kill each
  fresh socket a second after it connected, and the banner followed the socket exactly. The
  watchdog now holds off after a connect and between kicks, and the banner waits out a blip, holds
  through a flapping link as one message, and ends with "✓ Back online".

### Changed

- **Share is a pill in the lobby's top-right corner** and opens a real chooser (the owner,
  2026-09-22): the phone's own share sheet where the page is https, otherwise Messages · WhatsApp ·
  Mail · Copy. A "🚪 Leave" pill beside it drops the session and goes back to the room menu.

- The join screen's language pills moved to the top-right corner, beside the title, and the "more
  below" chevron grew from 32x22 to 56x40 so a thumb can actually hit it (the owner, 2026-09-22).

### Added

- **Bingo: a late joiner watches the call while they wait** (I-134 A): a phone that joins mid-game
  still waits for the next game, but its waiting screen now shows the live call and its nickname
  ("N 34 — Thirty-four — ask for more"), changing with every call. Any game can fill the new
  optional `spectator` line on its view.

- **Every screen in Spanish** (the owner, 2026-09-22 — "all text should be at least translatable
  to Spanish when the language is changed"; ADR-044): the join screen's language pills now set the
  phone's language for the whole party — lobby, game picker, settings, VIP menu, results, pause and
  reconnect lines, the share sheet, and every screen of Bingo, Blanks, Broken Pencil, Lightning Round
  and Wisecrack, phone-only stages included, aria-labels too. The 🎨 sheet changes it later without
  closing or losing a typed answer; the TV follows `?lang=es`, its browser, or the host bar's new
  🌐 Español / English button. Server toasts, errors, Start-button reasons and award lines show in
  the phone's language. Cards, prompts, questions, words and the caller's voice stay English (game
  content). Broken Pencil now counts "árbol" and "arbol" (and "el árbol") as the same guess.
  `scripts/i18n-coverage.test.ts` keeps it that way: a sentence written as `L('…')` or a manifest
  line without its Spanish fails verify. English reads as before, bar three grammar fixes ("1 point",
  "1 number called", "1 earlier page").

- **Blanks: the combos worth laughing at now reach the hands** (the owner, 2026-09-22 — "we want
  kickers like 'What was Hitler's favorite drink?' + 'Juice.'"): an 84-agent audit of every wild
  prompt kept 461 pairings two independent skeptics both scored 4-5 (152 new tags, 293 new answers)
  and 23 new pun prompts; `server/killers.ts` deals the round's verified joke to one answerer. In 320
  simulated rounds a verified joke is in a hand 78.8 % of the time (was 10 %) and wins 47.8 % (was
  7.5 %). No card was removed or softened. `reports/blanks-combo-audit-2026-09-22.md` lists every change.

- **A claim gets the stage, even in a full room** (I-131, option C): while a claim is checked the TV
  strip shows faces only with the claimant's chip named and a size up; on the verdict the strip goes
  and the card takes the room. The long decide line steps down a size so it stays on screen at 15-16
  players (Session B's note).

- **The lobby leaves behind a curtain** (I-120, option B): when a game starts, the TV's lobby darkens
  to the background and slides away before the intro lands — no ghost of the game list under "Any line".
- **"Previous number" off applies to the phones too** (I-113, option A).

- **The verdict's icon lights the winning line** (I-107, option B): the pattern icon beside a
  bingo now shows the claim's own completion — the diagonal for a diagonal — and draws its cells
  in 70 ms apart.
- **Bingo's Points board climbs** (I-103, option B): rows start where they stood before the round
  and rise past each other as the points count in, after one beat of `·` ranks and `—` totals — so
  the rank is the visible consequence of the points, not a fact the board asserts first.
- **Three more Bingo patterns** (I-093, option C): Picture frame (the outer ring), Postage stamp
  (any 2×2 corner block — its icon shows one example block) and The T (top row + middle column),
  in every round select.
- **The disconnect grace counts down** (I-089, option C): the TV shows "1:58" after a dropped
  player's name with a ring draining around their dimmed face, and the dropped phone's own banner
  says "Reconnecting… 1:47 left".
- **The room's own size** (I-088, option C): a "Room size − X / N +" stepper in the ★ VIP menu
  (4–16, never below the head count; the TV's count follows) and "Lock at this size", which sets
  the capacity to the head count and locks the room in one tap.
- **Every avatar blinks** (I-087, option C): the eye pair closes for ~150 ms every 6 s, offset per
  face so a roster never blinks in unison, a double blink on odd-hashed faces, and a dropped
  player's face sleeps with its eyes shut until they are back.
- **No white flash on a slow phone** (I-084, option C): an inline style paints the app's
  background before any JS, an inline script applies the remembered theme before the first paint,
  and a centred "PB" mark holds the screen until the app mounts.
- **A face already in the room says so** (I-083, option B): the join grid tags a taken face "IN"
  (still pickable, and the screen reader says who-has-it), and a fresh phone's random default is
  drawn from the free faces.
- **Open your own room, and browse the open ones** (the owner, 2026-09-22 — ADR-043): the join
  screen lists the public rooms (code, who is in, locked/playing) and opens a new one — with a code
  you typed or one the host picks — through `POST /api/rooms`. The ★ VIP menu flips a room between
  **🔓 Public** (listed) and **🔒 Private** (join by code only). Empty phone-made rooms are reaped
  after 10 minutes; a host keeps at most 12.
- **A first-time VIP gets three tips** (I-082, option C): a rotating strip under "You're the VIP"
  on the first room a browser hosts (bots · the ★ menu · recaps), retiring each tip as it is
  learned, ✕ to end it for good, and 💡 in the ★ menu to bring it back for the next host.
- **A face for the season** (I-079, option C): `pumpkin`, `snowflake` and `heart` are valid avatar
  ids every day and take the unicorn's slot in October, December and February — sixteen cells stay
  sixteen — with a "THIS MONTH" tag on the cell. `?date=YYYY-MM-DD` on the join link previews a
  month.
- **The lobby counts the phones that never made it in** (I-077, option C): a per-room join funnel
  (opened / attempted / joined / failed-by-code) at `GET /api/funnel`, written to
  `<recordings>/funnel/<room>.json` when the host keeps recordings, and live on the TV's host bar
  as "8 opened · 1 in". Counts only — no names, no ids. "Opened" counts the join page's info
  fetches, so it is an upper bound, not a head count.
- **The join screen speaks the phone's language** (I-076, option C): es / de / fr / pt for the
  join flow (from `navigator.language` or `?lang=` on the link), an EN · ES · DE · FR · PT pill
  row remembered in the browser, and the phone lobby's waiting line and "Add a bot" follow.
- **The QR carries the mark** (I-075, option C): a PB disc in the accent colour at the code's
  centre (the server's QR moved to error level H, so a scan is unaffected), bumping on every join.
- **The host bar names the VIP** (I-071, option B): the "HOST" label is the roster's ★ pill with
  the VIP's name — "★ SAM".
- **A waiting player can nudge the VIP** (I-070, option C): a "👋 Hurry up, Sam!" pill on a
  non-VIP's lobby (20 s cooldown, the server charges it 10 tokens) raises "👋 Priya says: hurry
  up, Sam!" to the room — the VIP's phone buzzes and plays `phase`, and the TV rocks the
  sender's chip (`PlayerChips` `wavingIds`).
- **Muting the TV says so** (I-069, option A): a corner toast — "Sound off" / "Sound on" — on
  every manual toggle.
- **The join form sideways is two columns** (I-067, option B): in a short landscape box the
  portrait and name sit left of the avatar grid and the join button drops to 44 px, so the header
  and the faces are above the fold.
- **A phone screen says there is more below** (I-066, option C): the fold fades one cut row deep
  (72 px) and a ▾ pill sits at the body's foot while it can scroll — tapping it scrolls a screen
  down.
- **Sound off stills the room** (I-065, option C): the lobby's glows pause, grey and dim while the
  TV's sound is off (`data-sound` on `<html>`), then swell once as sound comes on and the "Scan to
  join" heading pops.
- **The phone's sound row shows its sound** (I-062, option C): three bars bounce while On and
  freeze flat Off, switching off plays a short `lock` note, and every cue the phone plays kicks
  the bars.
- **The empty name preview breathes** (I-060, option B): the portrait's three dots pulse in turn
  like a typing indicator until you type (still under reduced motion).
- **The join form uses a tablet's width** (I-059, option B): from 760 px the spare space is a
  preview stage — your roster chip as the room will see it, live as you type, re-popping on every
  change.
- **The host bar advertises the shelf** (I-053, option B): the game button turns its label over
  every 2.2 s — Pick a game → Bingo → Blanks … — with a glyph per game.
- **A beat between phone screens** (I-039, option C): the outgoing ghost fades alone for 200 ms
  before the next screen rises (`CrossfadeSwap` `delayMs` → `--pb-screen-delay`), and Lightning's
  final question carries "· you bet 240" in its kicker.
- **A real tie gets its own ceremony** (I-037, option C): the tied faces share the crown and the
  lift with one lighter sprinkle, popping in together a beat after the line, and a new `tie` cue
  (the win arpeggio on a held Csus4, no horn) plays in place of `cheer`.
- **The last recap is reachable from the room** (I-034, option C): the results stage says
  "📼 Recap saved on the host PC", the game picker links "📼 Open the last recap", and
  `/api/recaps/latest[/page|/files/:file]` serve it (the markdown as a simple page, drawings
  inline).
- **The beds tighten as a deadline closes** (I-032, option B): `BedEngine.setTension(0..1)`, fed
  by the TV from the view's deadline over the last ten seconds — the tempo nudges up to +12 % and
  a low-pass opens 1.8 → 8 kHz.
- **A hopeless claim skips the suspense** (I-117, option B): more never-called daubs than called
  ones on the line — the card drops, every cell turns at once, the verdict lands 2.7 s after the
  announce and reads "Not yet, Priya — 2 of those were never called" (spicy: "Priya. 2 of those
  were never called. We're watching you.").
- **The phone says who is claiming** (I-111, option C): during someone else's check a line with
  their face — "Priya says BINGO!" — then "…and it's real" / "…not a bingo — carry on" as the
  TV's verdict lands; the claim view carries the claimant's avatar.
- **A valid bingo with stray daubs gets a kicker** (I-108, option B): "…and 1 daub that was
  never called — lucky the line was real." (spicy: "one fib and a bingo, Sam — we're watching
  you.") and the strays stay red on the winner's card through the win stage; the TV view gains
  `spicy`.
- **A locked room says so on the QR panel** (I-055, option A): "Room locked" replaces "Scan to
  join" and the code, URL and "or open" dim — the full-room treatment.
- **"Remove all 13 bots"** (I-048, option A): from four bots the host bar's button takes the
  danger tone and says the count; the removes go out 300 ms apart, so none is lost to the rate
  limit (thirteen at once left bots behind).
- **The photo swap is a flip** (I-047, option B): the join portrait turns 180° between face and
  photo, the photo landing in a gold ring with a "your photo" caption.
- **The name field's example rotates** (I-046, option C): every 2.5 s while empty and unfocused,
  the room's own people first (`/api/info` rooms gain a few first names), a random start per phone.
- **A skin per bot** (I-043, option A): the n-th bot is `robot:<n>` — the robot art in one of six
  colours with a small variation (square / round / visor eyes, a second antenna, a rounder head).
- **Broken Pencil: the VIP's "close enough"** (the owner, 2026-09-21): a broken book counts as
  intact on the VIP's word — a button on the VIP's phone on the book's last page and in the
  summary; `{ type: 'veto', book }`, accepted from the VIP alone (the engine stamps `vip` on the
  VIP's inputs, ADR-042).
- **Play-test fixes** (the owner, 2026-09-21): a RIGHT bingo claim turns over on every phone in a
  "phone only" room too; a Wisecrack author sees the answer they are up against; the games'
  synthesized beds (Wisecrack's vote / reveal) play on phones that carry the room's audio; the
  lobby's Share copies the link AND opens the phone's share sheet in one tap.
- **Blanks has music** (the owner, 2026-09-21): a quiet lounge set through the intro, the pick, the
  answer and the judge phases; and the TV's phase cues play on phones whenever the room asked the
  phones to carry the audio ("Phone only" or "Music on every phone"), not only phone-only.
- **Share the room link from the lobby** (the owner, 2026-09-21): a "🔗 Share the room link" pill
  opens the phone's share sheet with the join link straight to this room (`?room=CODE`), or
  copies it where there is no sheet.
- **Every game reads the TV's moments on the phone in a "phone only" room** (the owner,
  2026-09-21): Wisecrack's reveal (the prompt, both answers, authors, votes, points) on every
  phone; Broken Pencil's show page (the word, the drawing, the guess) on every phone; no "look at
  the TV" copy while the TV is off (Blanks, Lightning, Wisecrack, Pencil).
- **Lightning Round in a "phone only" room** (the owner, 2026-09-21): the reveal's rows (who got
  it, ±points, totals) on every phone under the answers (`rows` on the controller view,
  `ChoiceGrid` `after` slot) and no "look at the TV" copy while the TV is off.
- **The caller is louder than the music on a phone** (the owner, 2026-09-21): a voice clip on a
  phone bypasses the 0.35 cue master and the phone's music ducks to 30 % for the clip's length;
  the dev API's `vip` route accepts every VIP action.
- **"Phone only" rooms** (S-005, option C): a VIP switch on the picker; Bingo's check — the claim,
  the card turning over, the verdict — plays on every phone (`PhoneStage` + `phoneStagePhases`,
  a client-module hook), each call is spoken by the caller on the phones, and the TV's phase cues
  play on phones that keep "TV sounds on this phone" on. ADR-041.
- **Music on the phones** (S-004, option C + the owner's note): a per-phone "Music on this phone"
  switch with soft / normal / loud and a "♪ Lobby set" line, and the VIP's "Music on every phone"
  room switch (`setMusicOnPhones`, in the snapshot) that plays the room's plan on every phone
  automatically; the engine re-levels a playing track on a level change. ADR-040.
- **Set up your phone in the lobby** (S-003, option B): a game's per-phone settings come to the
  🎨 sheet under its name — a new client-module hook `PhoneSettings`; Bingo brings its card style
  and Motion — and a "🎨 Set up your phone while you wait" pill under the lobby's waiting line.
- **Bingo's daub is a choice** (S-002, option C): the style sheet gains a Daub row (Blot / Stamp /
  Ring) and an Ink row (Mine / Pink / Gold / Green), per phone, applied as you tap, each row a
  tiny daubed cell in that look; the ring is concentric with the number (the owner's note).
- **Bingo's one-to-go square breathes** (S-001, option B): the wanted square swells 1 → 1.07
  over 2 s with its halo and the number goes gold at the peak.
- **Bingo's un-daub is felt** (I-136, option A): a quiet `card` pluck with an 8 ms buzz, and the
  lift is a peel — a touch bigger and turned, fading over 300 ms.
- **An all-zero board is not a tie** (I-128, option C): the results read "No bingos this time" /
  "Nobody scored" with "The game ended before anyone could.", the rank column is blank
  (`Scoreboard` `noRanks`), and a quiet `leave` lands instead of the cheer.
- **A lapsed BINGO? resolves** (I-115, option C): the TV's "Priya says BINGO?…" holds a beat as
  "— never mind" with a quiet `bust` and fades; her phone says "Dibs lapsed — tap twice within
  3 s to claim" for two seconds.
- **Bingo's card-pick step sideways is two halves** (I-099, option C): the pattern demo big on the
  left, the card with Picked / Ready under it on the right — no dead middle on a landscape phone.
- **Bingo's BINGO! button pauses with the room** (I-097, option C): dimmed and disabled while
  paused, reading "⏸ Paused", popping back the moment play resumes.
- **Bingo's confirm step in plain words** (I-096, option A): the armed button reads "Tap again ·
  3 s" — the seconds of dibs left, one line on an SE.
- **Bingo's swap screen says it once** (I-094, option B): the count line ("swap a card, or tap
  Ready") is the only instruction on the multi-card intro; the hint is the pattern's alone.
- **Removing your bot is a poof** (I-074, option C): the row shrinks with four small bits flying
  out over 450 ms before the remove is sent, the phone plays a quiet `leave`, and the list rises
  into place instead of jumping.
- **The lobby remembers the last game** (I-073, option A): "Back to lobby" keeps the results
  until the next game starts and a "Last up · Lightning Round" card names the winner — "Sam
  won", "Sam and Priya tied" (faces, four at most then +n), or "no winner" (the owner's note).
  Contract: `RoomSnapshot.results` may be non-null in the lobby.
- **The QR carries the room code** (I-041, the owner's request): the TV's QR encodes `/?room=KGVU`,
  so a scan goes straight in ("Joining room KGVU" above the name, no field); a phone that types
  the bare URL from the TV always gets the room-code field ("4 letters from the TV"), a wrong
  code shaking that field. `/api/info` gains `qrUrl`; the server's code-less fallback is unchanged.
- **A mid-game joiner sits on the bench** (I-057, option C): the waiting screen shows a read-only
  mini-scoreboard from the view the phone already has — "Lightning Round · question" above it, the
  leader in gold with a 🏆, a total that changes bumping with a quiet `tally`.
- **The QR code is sized for the couch** (I-072, option C): 560 px and alone in the middle of the
  stage while nobody has joined; the first join shrinks it to 360 px over 600 ms and the roster
  column appears.
- **Three join failures, three treatments** (I-056, option C): a taken name keeps the shake and
  the red field; a full or locked room leaves the name alone — the form dims, a badged banner
  (👥 / 🔒) rises above the button, which reads "Room is full" / "Room is locked" and holds for
  5 s before a retry.
- **The TV marks the last seat** (I-054, option C): at capacity the hushed `close` chord follows
  the join note and a toast says "Room full — 16 / 16"; a seat freeing plays `ready` after the
  leave note with "A seat opened — 15 / 16".
- **The phone's connection dot has a heartbeat** (I-050, option A): while connected it breathes
  (opacity 0.55 ↔ 1 over 2.4 s); still under reduced motion.
- **The room code is one badge** (I-049, option C): the header and the QR card share a rounded
  mono chip with a small ROOM label; the card's letters land one after another when the lobby
  opens, and the header's badge bumps as each player joins.
- **The room sees who is picking** (I-045, option C): the lobby rings the VIP's chip while it
  waits on them; once they tap "Pick a game" the selecting stage shows three gold dots pulsing
  over their dimmed portrait (`PlayerChip` `thinking`, `PlayerChips` `thinkingIds`) and "Sam is
  choosing a game…" with Sam's face inline — the owner's note: dots only while picking, over the
  portrait.
- **A taken name is the room's business** (I-040, option C): the TVs get a toast ("Someone's
  trying to join as Sam — that name's taken") through a new `to: 'tvs'` effect target and the lobby
  rings Sam's chip while it shows; the phone's error carries Sam's face and name and a double buzz.
  ADR-038.
- **Wisecrack's cozy round** (I-028, option A): at exactly three connected players the answer
  stage's kicker reads "· cozy round, just the three of you" — the minimum room as a mode.
- **Blanks: a new hand, three times a game** — a "New hand · n left" button under the black card
  during the answer phase (before playing) deals the whole hand again under every rule of a fresh
  hand; `{ type: 'redraw' }`, `redrawsLeft` on the phone view (the owner, 2026-09-21).
- **Blanks' submissions land in named slots** (I-020, option C): one slot per player in roster
  order, their face in the landed card's corner, a puff and the `card` pluck as it lands, and every
  card turning face-up together on "Everyone's in!". The owner's note: one note per lock-in — the
  shell's `lock` tick stays quiet in a phase the game lists in `ownLocks` (new, additive).
- **Blanks' final board has an envelope to open** (I-019, option C): every total holds as "—"
  and every rank as "·" for 1.6 s (SDK `Scoreboard` `holdMs`, additive), an SVG envelope beside
  "And the winner is…" turns its flap open as the hold ends under eight accelerating `tick`s (the
  owner's note: a real envelope, the letter rising out), then the totals count up and the top row
  lifts with the `fanfare`.
- **A Rando win in Blanks is its own beat** (I-018, option C): Rando's card is authored by a
  card-stack mascot (the owner's note: still named Rando), the headline reads "Rando wins this
  one! Shame on all of you.", the sad `bust` lands where a human win's `sweep` would, and the +1
  is a muted "+0 · nobody" with "Nobody's score moves." under the headline.
- **Bingo tells the room who is one away** (R2-01, option C) behind a new `showClose` setting,
  off by default (the owner's note): the strip rings the players one daub from the pattern, "Sam is
  one away" rises under the nickname and the room hears the phone's hushed `close` once per player
  per round. The one-to-go rule moved server-side (`server/close.ts`); the phone re-imports it.
- **Bingo's hall board is lamps** (I-014, option C): round bulbs with a halo per called number,
  the current one catching with a smooth 320 ms fade (one dip, no steps — the owner's note) and a
  soft `tick` 60 ms after the ball lands; numbers that arrive together light 40 ms apart.
- **Bingo's card styles are shown, not described** (I-013, option C): every row of the style sheet
  carries a little diagram of the layout, the live one breathes, and the preview bar shows the pick
  at 1.5 ×; rows stay one line at every phone width (the owner's note).
- **Theme try-on** (I-035, option C): the theme sheet stays open while you try themes (Done closes
  it), every swatch is a tiny screen in that theme's colours, and the sheet fades to the new colours
  instead of snapping.
- **Character select** (I-031, option B + the owner's note): the join form shows the picked face large
  beside the name, popping on each pick while the other cells step back; "Use a photo" takes a
  picture from the phone (camera or gallery), crops it to a 128 × 128 JPEG on the phone and sends it
  with the join (`photo`, capped at 24 KB, ADR-037) — every chip, scoreboard, roster and card
  everywhere shows the photo through `Avatar`, with no game changes.
- **The lobby is alive** (I-029, option C): a joiner's chip walks in from the QR's side with a gold
  welcome ring that fades over a second, and two soft glows in the brand accents drift slowly behind
  the stage (still under reduced motion).
- **Pausing freezes the room** (I-030, option C, every game's TV): the curtain drops from the top edge
  and lifts on resume, the Paused card lands once it is down, the stage steps back to 0.96 with the
  strip at 60 % while held, and the stage lands back to full on the resume chime. The owner's note:
  a Bingo resume mid-call rings the 3 · 2 · 1 and calls the number that was up again before a full
  interval, instead of dropping the next one.
- **Lightning Round's wagers are chips on a table** (I-026, option C): every wager row carries a
  stack of gold chips sized to the share; a placed pick bumps its chips, the prompt becomes "n in
  the pot" and the other rows step back; the "Your bet" footer breathes on the final question until
  the answer is locked. The owner's note: a fifth Custom row takes a percentage or a points amount
  (`{ type: 'wager', amount }`, clamped server-side). `ChoiceGrid` gains `className`.
- **The winner is crowned** (I-025, option C, every game's results): one clear winner gets their
  face beside the headline and the `pb-crown` lift, confetti falls behind it (48 pieces for a person,
  16 for a bot), and the board under it comes back from 55 % over 1.2 s so the name reads first.
- **Broken Pencil's books pass hands** (I-024, option C): a finished card lands and the count bumps;
  the cards sit in seat order under "books pass this way →" and each pass opens with every glyph
  sliding in from the seat on its left, 450 ms apart, a quiet `card` pluck per seat; a done card's
  book tile slides on to the next seat, which rings green. The game-sdk `play(cue)` now takes
  `{ quiet?, gain? }` and the shell engine honours `gain` (0..1) — `quiet` alone never lowered a
  cue's level.
- **Broken Pencil's tiers are a spice dial** (I-023, option C): one, two or three heat discs beside
  each offer, the tiers rising in order and the picked one bumping while the others step back; with
  Spicy on the hard tier's discs breathe like an ember (the phone view gains `spicy`).
- **Broken Pencil's recap is read in order** (I-022, option A): the rows rise one after another,
  80 ms apart, and each verdict stamps down after its row.
- **Broken Pencil's pad feels like paper and pencil** (I-021, option C): ruled paper with a red margin
  under the strokes and soft double-pass pencil strokes, the sheet dealt in with the swatches popping
  in — and, per the owner's note, the paper (ruled / plain) and the pencil (pencil / pen) are this
  phone's own choice in the settings sheet; the stored drawing and the TV are the same either way.
- **Broken Pencil's pages turn** (I-008, option A): every page after the first pivots in on its left
  edge under a perspective (600 ms) instead of settling from a lift.
- **Lightning Round's crowd closes in** (I-007, option B): every locked-in player's face pops onto the
  count line, and the phones still thinking are ringed in the TV strip until they lock in — who
  picked what stays hidden until the reveal.
- **Blanks' vote is watched** (I-004, option C): the count pill pops on every vote, the phones still
  deciding are ringed in the TV strip until they vote, and when the last vote lands every card bumps
  once, 40 ms apart, with a `tally` note before the result.
- **Wisecrack's round board is a climb** (I-027, option B): rows appear in last round's order, the
  deltas land and the totals count, then every row slides to its new place — overtakes are watched;
  a row that rose glows green as it settles, one that fell dim red. New `Scoreboard`
  `stagger="climb"` + `climbFrom` in the game-sdk.
- **Blanks' reader is pointed at** (I-017, option B): the seat asked to read a card out is ringed in
  the TV's roster strip while it reads, and the "read it out" pill carries their face and pops on
  every new card. New optional client-module hook `stripActive(view)` for any game to point the
  room at a player.
- **Blanks' hand is a hand** (I-016, option C): the white cards sit side by side in a fanned
  scroll-snap row (no overlap — every card's whole text reads without a tap, a long card's type one
  size down), the pick lifts while the rest step back, and Play flies the card into the black card.
- **Blanks' round card is dealt** (I-015, option A): the two white cards are tossed onto the felt
  instead of rising in place, and each of the three cards lands with the game's `card` pluck.
- **Bingo's next pattern is the size of the board** (I-012, option C): between rounds the pattern demo
  sits at 216 px in its own column left of the Points board, and its first pass thumps a `daub` per
  square as it lights; the loops after it stay silent.
- **A dropped link is seen and heard** (I-009, option C, every game): the player's TV chip flickers
  out and sits as a ghost, snapping back with a green ring when the link returns; the room hears
  `leave` / `join`; the phone's "Reconnecting…" breathes and the return lands with a buzz and a note.
- **Bingo's wrong claim is a moment** (I-006, option B): the checked card shakes with the NOT A BINGO
  buzzer, and 1.2 s later its daubs lift off one by one in reading order, each squeezing as its
  colour drains — the wipe is watched, not read.
- **Blanks result lands one thing at a time** (I-005, option C): the winning card's voter chips pop in
  120 ms apart with a `lock` note each, the other cards' pills rise 60 ms apart fewest votes first,
  and as the winner is named the pills step back to 55 % and the confetti is twice as thick.
- **Wisecrack reveal: the winner is crowned, the loser steps back** (I-002, option B): on the points
  beat the winning card takes the `pb-crown` lift instead of a flat 1.02 scale, and against a clear
  winner the other card shrinks to 0.96 and dims to 60 % (a tie moves nothing).
- **The answer field reacts while you type** (I-001, option C, `TextAnswer` in the game-sdk — Wisecrack and
  Broken Pencil's text fields): the field joins the last-5-s urgency (danger border + beat), the
  character counter bumps on every keystroke, and a field left empty for 3 s breathes until you type.
- **Bingo daubs are ink blots in your colour** (I-010, option C): on the phone a daub stays as an
  irregular blot in the player's roster colour instead of a flat fill (the TV and verdict cards are
  unchanged); the tap that completes a row, column or diagonal bumps its five squares in order.
- **Game recaps on disk** (ADR-035): each game a room plays is written to `recordings/<game>/<time>-<room>/`
  — `session.json`, `state.json` and a `recap.md` (Broken Pencil's books with every drawing as SVG,
  Wisecrack's prompts, answers and votes, Lightning Round's questions with every pick). A **Save a
  recap on the host PC** toggle in the game picker (phone and TV) turns it off; the dev API and the
  design harness leave it off; `PARTYBOX_RECORDINGS=off` disables it server-wide.
- **Spicy** in Wisecrack (140 prompts) and Broken Pencil (90 drawable words) now matches the Blanks
  WILD deck: explicit adult humour, 18+; nothing hateful, no real people.
- **Lightning Round**: 3 867 questions (from 256) in ten categories: Science is now **STEM** with
  math, engineering and computing; new **Entertainment** and **Everyday Life**; each split into
  topics (59 in all). A **Topics** checklist under the category setting draws from the ticked topics
  only (falls back to the category, then all). The TV and phones name the topic on every question.
- `multiselect` setting type (ADR-034): several picks stored as one comma-joined string, optionally
  grouped by a sibling `select`; rendered as a chip checklist on the phone and the TV host panel.
- Background music for **Wisecrack** (comic tracks while writing: Sneaky Snitch / Fluffing a Duck /
  Carefree, Kevin MacLeod CC BY 4.0, plus the warm / marimba / lo-fi / lounge beds around it) and
  **Lightning Round** (a new synthesized `pulse` bed under questions and reveals, the late-night
  chords under the wager, the marimba on the intro).
- **Blanks** (`games/blanks`): fill-in-the-blank card comedy — a black card, a hand of ten white
  cards, one-at-a-time read-outs on the TV (and on every phone, so it plays without a TV), everyone
  votes or a rotating judge picks, one point per round; three decks (Mild / Crude / WILD) chosen by
  the VIP, optional Rando phantom player; bots welcome.
- **Bingo** (`games/bingo`): 75-ball bingo with free daubing, a public check that pauses the caller
  (green ✓ / red ✕ / missed squares), a wiped card as the penalty for a wrong BINGO!, a pattern per
  round (line / four corners / X / blackout), cheeky caller phrases; bots welcome.
- **Broken Pencil** (`games/broken-pencil`): Telestrations-style word → drawing → guess books with a
  phone DrawPad (8 colours, 3 pens, undo, limited ink), the full circle by default (`passes` shortens
  it), then a TV show that turns every page with the VIP on Next; Unbroken awards, no scores; bots
  fill seats.
- `ViewEnvelope.timerMode` (ADR-030): games can ask the shells for a quiet (bar only) or hidden timer.
- Host controls on the TV (ADR-031): `tv:vip` / `tv:bot` socket events with the engine's `host`
  flag, a Host toolbar (pick / start / bots / pause / skip / end / play again), a ⌂ Home button, and an
  interactive game-picking screen with editable settings (`SettingField` shared with the phone).
- Bots as room players (ADR-028): "Add a bot" in the lobby (max 4 per person, owner/VIP can remove,
  never VIP, leave with their owner), `supportsBots` manifest flag gates Start, contract check that a
  flagged bot acts with varied inputs, `bot` socket event, 🤖 chip tag, dev-API bots now go through the
  engine.
- Resume by name (ADR-029): a token-less join under a disconnected player's name resumes that player.
- Multi-persona live-play harness (`packages/e2e/live/`) and the 2026-09-15 session report.

### Fixed
- Broken Pencil recap: seven or more books take four columns at caption size, so an eight-book
  recap with long words no longer runs to the frame's edge under a two-row strip.
- TV pause curtain (I-030): the stage's step-back never showed outside Bingo (the phase's rise
  animation pinned its transform) and the resume replayed that rise — a blink after every resume.
  Both now sit on a wrapper with no entrance of its own.
- Player chips: a name ellipsizes past 9 em, so a sixteen-wide-glyph name no longer makes a 640 px
  chip that wraps a four-player strip under the timer.
- Lightning Round TV: at four players or fewer the reveal rows and the final board take one column
  of taller rows, so a three-player game no longer leaves the results stage two-thirds bare.
- Bingo phone: a player back from a drop with the hall board OFF now hears which calls they
  missed ("Back — you missed B 2, O 65.", up to three, then "and n more") — the view carried
  `recent` for this and the phone showed nothing. Board on still points at the TV.
- The Scoreboard climb (I-027) glowed the wrong way (a row that rose red, one that fell green) and
  still waited 1.2 s under reduced motion; every literal stagger has its reduced-motion twin now.
- Broken Pencil's draw pad on a 320 px phone: one swatch row and a real 180 px floor for the sheet.
- Lightning Round's hollow "nothing at stake" chip reads in every theme.
- Lightning Round TV wager page: from nine players the standings take three columns, from
  thirteen four (the roster chips carry scores and wrap to three or four rows, so two columns of
  six small rows ran the last row under the host bar at 12 players and three columns clipped at
  16). `Scoreboard` gained an additive `columns` option.
- Lightning Round TV final reveal: under a four-row roster (16 players with scored chips) the
  bet cards ran under the host bar; the reveal now sits in the same size container as the
  question page and compacts below 560 px (slimmer answer bar, caption-size two-line rows).
- Broken Pencil TV show: the drawing sheet now takes the height the stage has left (a two-row
  roster at seven or eight players pushed a fixed 560 px sheet over the page kicker and into the
  host bar).
- Lightning Round TV at sixteen players: the four-row roster pushed "0 / 16 locked in" under the
  host bar; the question page now measures its room and drops to a compact prompt and cards when
  the stage is short (twelve players and fewer keep the full size).
- The crossfade ghost of a screen with a `<select>` (the TV host panel into a game intro) showed
  every option's label run together for a beat; it now keeps the picked label only.
- Wisecrack **Spicy**: the 25 mildest prompts (dark setups with no adult referent) rewritten in the
  explicit register of the Blanks WILD deck; the longest prompt (83 chars) proven to fit every surface.
- Resuming a paused game no longer flashes the held seconds plus the pause length (18 for 11)
  on the TV timer and the phone bar for a beat: the clock hook re-reads the time when its cadence
  changes.
- Phone screens that scroll (six-player results, a long wager list) fade their last line at the fold
  instead of cutting it mid-glyph; the fade lifts once scrolled to the end and never shows on a
  body that fits.
- **Broken Pencil** show: a bot's book turns itself at a presenter's pace (5 / 8 / 5 s) instead of
  the room's 12–20 s fallbacks; page turns are a cut (no dissolve) and every page is visible from its
  first frame.
- **Broken Pencil**: a drawing the timer cuts off keeps what was drawn — the phone sends the sheet as a
  `draft` while drawing, and the deadline uses it instead of a blank page (the phone also gets its draft
  back after a reload mid-drawing).
- Stale VIP badge while offline, toasts rendered as buttons, "Connecting…" shown while connected,
  spectators missing from the TV strip during play (all from the live-play report).

## [0.1.0] - 2026-09-15

### Added
- Phase 0: monorepo scaffold (pnpm workspaces, TypeScript 6, ESLint boundaries, dependency-cruiser,
  Prettier, Vitest projects), `pnpm verify` gate, generated game registry, doc set and ADRs 001–021.
- Phase 1: `@partybox/shared` (contract types + zod schemas, socket protocol, counter-based PRNG,
  room codes / names / avatars) and `@partybox/engine` (pure room machine: join/resume/spectators,
  VIP rules + 30 s handover, 120 s disconnect expiry, GameRunner with once-per-phase timers,
  `nextWakeAt` ticks, settings coercion, views with VIP decoration); 57 tests, engine 98 % lines.
- Phase 2: `@partybox/server` (Fastify + Socket.IO host, one timer per room, injectable/frozen clock,
  rate limiting, resume-by-token socket remapping, LAN IP + QR + firewall banner, `/healthz`, `/api/info`,
  full dev API incl. server-played bots) and `@partybox/client` (route switch, controller store with
  token resume + rev gating + clock offset, TV observer, join/lobby/selecting/playing/results screens,
  VIP menu, TV frame with QR, synthesized sound cues, tap-to-start + mute + fullscreen) plus the first
  `@partybox/game-sdk` UI primitives (Avatar, PlayerChip, Stage, BigText, Timer, PlayerChips,
  Scoreboard, Screen, PrimaryButton, WaitingScreen, server clock hooks).
- Phase 4 + 5 (the two launch games, built by context-free sessions from the docs):
  `games/wisecrack` and `games/lightning-round` — see the entries below.
- Phase 3: `@partybox/game-sdk` helpers (`enterPhase`, `applyVip`, `buildResults`, `envelope`…),
  interaction primitives (`TextAnswer`, `ChoiceGrid`, `VoteList`, `Reveal`), the split into
  `@partybox/game-sdk` (pure) and `@partybox/game-sdk/ui` (React), the contract suite that runs
  against every `games/*` folder (totality fuzz, purity scan, packs, fixtures, termination with four
  bot strategies, determinism, stale timers, hidden-info leaks), `games/_template` ("Quick Poll"),
  and `pnpm new-game <id>`.
- Phase 6: `@partybox/sim` — headless simulator with five strategies + `mixed`, chaos actions,
  invariants after every event, determinism replay, repro files + `--replay`, `--smoke` (now part of
  `pnpm verify`), `--dump-fixtures`; `@partybox/game-sdk/testing` entry point.
- Phase 7: `@partybox/e2e` — `pnpm e2e` (TV + phones through the real UI, moves via the new
  `POST /api/dev/act`, zero-console-error gate) and `pnpm e2e:snap` (frozen-clock screenshots per
  phase, per device preset incl. iPhone SE / Galaxy / landscape / 200 % font, spectator phone);
  `/preview` route renders any fixture inside the real shells; `GET /api/games`; Vite HMR now on the
  app's own port (ADR-026).
- `games/lightning-round` ("Lightning Round"): speed trivia — 216 original questions in 8 categories,
  speed + streak scoring, a final wager question, three awards, fixtures, tests and contract config.
- `games/wisecrack` ("Wisecrack", prompt → answer → vote): 3–8 players, rounds/answerSeconds/spicy settings, double-points last round, sweep bonus, three awards, 160 family + 56 spicy prompts.
- Phase 8: bundled Nunito Variable (OFL) display font, 4× CPU-throttle budget check in `pnpm e2e`,
  surface base font-size fix, `/api/dev/act`, e2e screenshots for every phase of both games.
- Phase 9: fresh-eyes pass — "adding a phase" checklist and ADR-027 fixes from the two game builds.
