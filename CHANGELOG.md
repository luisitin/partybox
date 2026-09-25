# Changelog

All notable changes. Format: [Keep a Changelog](https://keepachangelog.com/); conventional commits feed it.

## [Unreleased]

### Added

- **Secret Hitler** 🏛️ (5–10 players, ~40 min; M1 of its spec: the Classic rules with plain screens): hidden roles. Each round a President nominates a Chancellor, everyone votes Ja or Nein, and an elected pair secretly passes one policy from a stacked deck. Liberals win with 5 Liberal policies or by executing Hitler; Fascists with 6 Fascist policies or by electing Hitler Chancellor after 3. Powers (investigate, special election, peek, execution), veto, and chaos after three failed governments. The VIP's Skip is "Last call" while someone is choosing (10 s, then the timeout result). Adapted from Secret Hitler by Max Temkin, Mike Boxleiter & Tommy Maranges, CC BY-NC-SA 4.0, for free, non-commercial play.
- **Spy Grid** 🗂️ (game pack, game 9): Codenames-style teams. 25 words on the TV; only the two spymasters see which are their agents. A spymaster sends one word and a number ("Ocean, 3", read aloud); the team points on their phones and a card flips when most of them agree — own agent, bystander, enemy agent or the assassin. First team to find all its agents wins. 4–16 players in teams, a co-op mission at 2–3, about 18 minutes, bots welcome, 604 family + 122 spicy words, phone-only rooms, English + Spanish. The board is a new SDK piece, `@partybox/game-sdk/ui/word-grid`.
- **Hive Rank** 🐝 (game pack, game 6): five things and a question ("Best to worst road-trip snack"); everyone taps them into order on their phone, the orders are combined into the hive's order, and the TV counts it down from fifth to first with the reader, a scout bee flying to each next spot. Score 2 per thing in the hive's exact spot, 1 if one spot off, +2 for all five; the round's top scorer is crowned Queen Bee. 2–16 players, about 5 minutes, bots welcome, 150 family + 50 spicy questions, phone-only rooms, English + Spanish. The phone's ranking control is a new SDK piece, `@partybox/game-sdk/ui/order-picker`.

### Fixed

- **Everyone sees the settings while the VIP tunes** (I-648, option B): while the VIP picks a game, every other phone lists that game's settings under its name, read-only, updating as the VIP changes them — so nobody finds out spicy is ON after the first card. The setting that just changed breathes yellow once over 2 s (held still under reduced motion).

- **Broken Pencil: the drawing on the show fills its stage.** The book's title and page count move to the left column above the WORD tile, and "X drew" becomes a tag on the sheet's corner. A drawing is now about 650 px tall on the 1080-px TV instead of 480. The crammed text under the title is shortened to two lines, "BOOK 1 OF 6" / "PAGE 2 OF 5". (I-211, option B)

- **Broken Pencil: the verdict lands a beat after the last guess.** On a book's last page the guess shows alone, and the CHAIN BROKEN / UNBROKEN box rises 2.5 s later (3.5 s for a book that survived). The presenter's Next is held for that beat too, so a quick thumb can't skip the verdict. (I-512, option B)

- **The night's leader no longer sweeps every tied award.** A tied stat now goes to a player who has no award yet, and only then to the higher score, so one player can no longer take all three on ties. This applies to Blanks, and to Wisecrack, which uses the same award code. (I-474, option A)

- **The leader is "1st", everywhere** (I-268, option C): the roster's ▲ that nobody read as "leading" is now a small "1st" tag ("1.º" in Spanish); the same tag replaces the 👑 on Lightning's reveal rows and the 🏆 on a late joiner's bench, with no mark while nobody has scored or everyone is tied. A roster score that goes up shows "+N" over it for 2 seconds.

- **"More below" is part of the footer now, not a pill on top of the page.** The ▾ arrow used to land on "Play again", "Start Bingo", the avatar grid and answer C. It is now a slim row at the top of the footer, with a grab bar and the words "more below", and the whole row is the button. It is laid out only while the page can scroll and fades out at the end, so nothing moves under your thumb. A screen with no footer shows the same row in the bottom safe area. (I-788, option A)

- **When your phone loses the Wi‑Fi, you can see it, and coming back is one clean step.** The game dims and can't be tapped under one calm card: "Reconnecting…", "Your seat is held for 1:57", and whether your answer was sent. When the link holds again, a one-beat "You're back" card says where the game is ("You missed questions 1 and 2. This is question 3 of 10: 8 seconds left.", "You · 3rd · 1,000"). Then the live screen appears, with no old question fading over it. (I-791, option D)

- **"Look at the TV" screens now give your phone something to hold.** During a Wisecrack reveal, your phone shows the moment in miniature: the prompt and where it sits in the round, both answers as small cards ("yours" or "your pick" tagged), the authors and the votes as they land on the TV, the winner outlined, and "You weren't in this one: 1 more to go." In Broken Pencil's show, every phone holds a small framed copy of the page on the TV. (I-796, option K)

- **The bet names the final's topic, and the bet page fits** — the owner: "fix how the bet page looks … a bit cramped and visually unappealing". While wagers are placed, the TV and every phone say "Final question: Food & Drink · Drinks · hard". On the phone the stakes are laid out two by two, amount over share with the chips beside it; the 100 % tile says "All in", and the custom row is one line. On an iPhone SE every stake is on screen at once. (I-550, option A)

- **All four answers fit on every phone and stay put after you tap** — the answer tiles share the height under the question: 66 px each, down to their content on a small phone, so four fit an iPhone SE with no scroll. Four short answers go two by two. Sideways, the question sits on the left and the answers on the right. Locking in moves nothing: your tile gets the ring and the others only dim. (I-789, design review B)

- **The reveal happens on the answers, and the result is one line on top** — the right answer's tile gets a green ring and "✓ the answer"; your wrong pick gets a red ring and "you". One band under the question keeps the two numbers apart: "Wrong · +0 this round · 987 total". Nobody reads a wrong answer as paying 1000 any more, and on a small phone the answer, your pick and your score are in one look. (I-790, design review C)

- **The lobby shows people first; the tips go into one line** — a title row "Lobby 6 of 16" with Share and a ⋯ menu (Hurry up the VIP, set up your phone, Leave), the players straight after as a two-column grid with the add-a-bot slot, and every tip in one rotating line under them; on an iPhone SE the six players, the bot slot and the tip fit with no scrolling, and at 200 % text Share is no longer cut off (I-792, option E)

- **Joining fits on one screen: name, face, colour, Join** — the face sits beside the name field (tap it to use a photo), the faces are one sideways-swiping strip in your colour, the colours are one row of dots, and the five languages sit behind one "🌐 EN ▾" in the header; nothing scrolls on any phone, iPhone SE included (I-793, option F)

- **The drawing sheet gets the height; the header is one line** — whose book and the round now ride in the phone's timer bar ("Maximiliano's book · 1/6"), the prompt is one bold line ("Draw: “yoga class”"), and the colours plus one band of ink / pen size / Undo / Clear sit under a sheet that takes whatever height is left, so no tool hides under Send on an SE and Clear is never cut off at 200% text (I-794, option H)

- **On a guess, the box to type in is always on screen** — the field and Send are laid out first and the drawing takes the height that is left (tap it to see it large), and when the keyboard opens the drawing shrinks instead of the box sliding away (I-795, option I)

- **Bingo's style preview no longer covers your cards, and it can't hold the room forever** — the "like it?" block is now one slim row (the style's mark, "Stack?", Change, Confirm), so both cards show whole in the new style, and a line drains along the bar and confirms the pick by itself after 20 s, so a slow chooser holds the caller for 20 seconds at most (I-407, option B).

- **The how-to says how this room will play** — Broken Pencil's rule 3 was always "round the circle", which is wrong when players per book is set below the number of players. It now follows the setting ("It passes to 2 players in turn; the last of them only guesses."), and a row under the how-to shows the book's pages as they will be: 📖 ✏️ ❓ ✏️ ❓ · 5 pages (I-507, option B).

- **Lightning Round: the reveal shows the race, then the standings, with a Next button.** Right answers are dealt fastest first, each with its time (⚡ on the fastest). After 2 s the rows re-deal into score order. The standings now get "a bit more time": a regular reveal lasts 8 s instead of 5, and the final reveal stays at 5 s. When the standings arrive, a "next question" button shows up that "the vip or tv can click to go next": it sits on the TV in the header and on the VIP's phone. The usual Skip / Next is hidden on those screens. (I-589, option B)

- **Lightning Round: the phone's clock no longer counts down when there is nothing to press, and it shows what an answer is worth right now.** During the intro and the reveal the phone keeps the bar but drops the seconds, like the TV. Wisecrack's phones now do the same outside answering and voting. While a question is open, "+974 now" sits under it and drops as time runs. (I-288, option B)

- **Bots no longer gang up on a person's joke in Blanks.** A bot's vote leans a little toward cards from people, and each bot now has its own taste, so a person wins about their fair share of a bot room (I-445, option B).

- **Blanks' hand at big text sizes** (I-159, option B): when the phone's text is so big the fan
  would show one unreadable card per screen, the hand becomes a list you scroll, every card whole.
  A small Fan / List switch at the end of the round line lets any phone choose, and remembers it.

- **Blanks' reader in a second game** (game-pack audit #19): a later game in the same room that
  needed a reading an earlier game had asked for (most often the same black card read alone) never
  got it and held the card for the full 12 s fallback. The server now forgets a reading a moment
  after answering it, so the next game asks again and plays it from the cache.

- **Blanks' votes land on the table** (I-144, option A): while the room votes, each vote drops a chip with the voter's face under the cards on the TV. You can see who has voted but never what they picked, and the "waiting for…" pill still names who is left.

- **Blanks' final board reads straight down** (I-146, option C): up to six players stay in one column, so 5th place no longer sits beside 1st. When a board does split, each column is labelled with the ranks it holds ("1–4"), and tied players are joined by a bracket down the left edge.

- **Your hand while the judge picks** (I-148, option C): in judge mode, while the judge picks the question, the other phones show their own hand, dimmed, under the three questions. Tapping a question drops your front card into its blank, and your hand lights up the moment the judge chooses.

- **Blanks' filled cards read as one sentence** (I-150, option C): a card dropped into the middle of a sentence loses its stray capital ("came back with the Roomba ate the thong"), while names like Stalin or FBI keep theirs. A quoted card inside a quoted blank no longer ends in a doubled quote, and a test checks the whole wild deck for doubled quotes.

- **Blanks says who taps Next** (I-152, option C): the settings sheet now says the VIP taps Next (it used to say anyone could). In untimed games the TV names that person: "Next on Sam's phone" on the result and "No clock — Sam taps Next when the room is ready" while cards come in. Sam's own phone says "when you tap Next".

- **The results headline names the people, not the bots** (I-153, option C): a tie reads "Priya, Sam & the bots tie!" instead of "Bot 1, Bot 3 & 2 others tie!". A tie between bots only says "The bots tie — nobody home?", and a single bot winner still gets its name.

- **Blanks' end-of-game awards go to people** (I-154, option B): bots can no longer win Crowd favourite or Quick draw; if no person qualifies, the award is left off. Quick draw is only given in timed games and says what it measured ("3 cards in under 30 s"). Card of the night can still go to a bot, because its votes were real.

- **Blanks' results on your own phone read as yours** (I-155, option C): an award you won says "Your card of the night" in the accent colour and comes first, and under the awards your phone lists the votes your cards got each round ("your votes: 2 · 0 · 3"). The TV is unchanged.

- **Blanks' vote fits on one TV screen** (I-156, option C): four cards now sit in a 2 × 2, any round that would have split the vote across pages uses smaller cards first, and past eight cards the TV shows only the answers so every card stays on screen.

- **Blanks' Skip / Next during the reading goes to the next card** (I-774, option B): tapping it no longer throws away the unread cards. It shows the next one, only the last card's tap opens the vote, and the button says what it will do ("Next card (3 of 5)", "Open the vote") on the TV and in the VIP menu, in Spanish too.

- **Blanks shows which deck is on before you start** (I-187, option C): the Start button reads "Start Blanks · WILD", the Blanks card gets a "🔞 WILD deck — change" chip that jumps to the deck setting, and the TV's game line says "🔞 WILD deck". The "more below" arrow on phones no longer sits on top of the Start button.

- **Blanks on a sideways phone** (I-160, option B): turned on its side, the phone shows your hand as a readable list of wide cards on the right while the question, with your pick dropped in, stays on the left. Upright phones keep the fan.

- **Blanks: when the judge goes, the room votes** (I-773, option B): if the judge's phone drops and they don't come back within 20 s, everyone votes on the cards instead of "nobody wins this round". If the judge is removed or leaves, the vote starts at once ("Priya was removed — everyone votes this one"). The next round has a judge again.

- **Bingo at large text sizes** (I-100, option C): the phone's round body scrolls under the footer instead of clipping the card's bottom rows, the pattern hint stops at two lines, and the phone's text sizes now follow the phone's own larger-text setting.

- **Lighter Bingo traffic** (I-750, option C): each phone and TV now gets only the room updates that changed, a slow phone skips straight to the newest update instead of falling behind, and large messages are compressed. A 16-player Bingo drops from about 130 KB/s per phone to about 1.5 KB/s.

- **When every phone falls asleep** (I-746, option C): during a game a quiet phone keeps its seat and comes back to its own card and score. When the last phone drops, the game pauses and the TV says "Everyone's phone is asleep — wake one to carry on"; the first phone back resumes it, and if nobody returns within 5 minutes the game ends to the lobby.

- **Bingo checks the line you bet on** (I-392, option B): a wrong claim is judged on the line with the most daubs, not the middle row through FREE, and the verdict names it: "Top row: 15, 29 and 3 more were never called".

- **A wrong Bingo claim's verdict stays up longer** (I-394, option B + the owner's note): the verdict and its red squares stay on the card for 6 s, and the card is wiped only at the end, the last beat before the 3·2·1.

- **Bingo awards** (I-401, option B + the owner's note): the results can show Quick draw (the fewest calls to a bingo), Clean card (a win with no stray daubs) and Trigger finger (the most wrong BINGO!s). Each appears only when one player earned it; a tie or nothing that triggers it shows no award.

- **The Bingo winner screen moves on by itself** (I-400, option B): if nobody picks within 20 s of the verdict being read, the room goes to the next round (or finishes), with "Next round in 13…" counting down on the TV until the first vote.

- **A wrong BINGO! no longer wipes the whole Bingo card** (I-435, option A): only the never-called daubs and the claimed line are wiped, and every other right daub stays. The TV says "Wrong daubs and that line wiped", and the game's description says what a wrong claim costs.

- **A Bingo bot's BINGO! is its claim** (I-433, option B): bots skip the two-tap dibs step, so a bot's claim goes straight to the check, and the TV says "Bot 2 calls it — checking". From the claim on, a bot's claim is checked, read and wiped exactly like a person's, and after a bot's win the room still chooses what happens next.

- **Settings stay with each game** (I-763, option C): browsing another game, New game or the lobby no longer resets what the VIP tuned. The picker card says "Your settings: Cards per player 4 · Seconds per number 3", the settings sheet has a "Reset to defaults" link, and the host PC remembers the numbers, so next week's party starts where this one left off.

- **A borrowed phone gets your seat back** (I-741, option C): typing your name on another phone after yours died puts you back in your own seat, same score. The phone says "Welcome back, Priya — picking up where you left off" and the TV "Priya is back (new phone)". If the dead phone froze and the room still thinks it is there, the name-taken message comes with a "That's me — take my seat" button.

- **One seat, one tab** (I-755, option C): opening the join link in a second tab no longer makes the two tabs fight over the seat dozens of times a second. The new tab steps aside and says "PartyBox is open in another tab" with "Play here instead". The tab that loses the seat stops reconnecting, and the server refuses a login that joins more than 3 times in 5 seconds.

- **Developer controls locked to the host PC** (I-753, option C): other phones can no longer read everyone's login tokens or use the developer controls. Only the TV's 🏠 start-over works from another device, and pages from other websites can no longer open a connection to PartyBox.

- **Surviving a server restart** (I-744, option B): after PartyBox restarts, phones forget the dead room code. If one room is open they fill it in ("The party started over — the room is VMDJ now. Tap Join to get back in."), so one tap gets you back in. The TV shows "PartyBox restarted — this is a new room, VMDJ. Phones: tap Join to get back in." until someone is back.

- **Private rooms stay private** (I-785, option C): a "Private — code only" room no longer shows up in the server's public room list or join statistics, and nobody learns who is in a room unless their phone is joining it by code. Grandma still gets in through the private link.

- **Each TV shows its own room's QR** (I-787, option A): scanning the QR on a second room's TV now puts you in that room, not the first one. The main TV is unchanged.

- **Phones stop downloading the questions and the decks** (I-752, option C): Lightning's wager arithmetic and Blanks' card filling moved out of the files that load the content, so a phone no longer downloads every question with its answer or every card. A test in each game fails if phone code ever reaches the content again. Nothing changes on screen.

- **Results at 12 players** (I-456, option C): the ▾ 'more below' arrow now sits just above whatever buttons a phone screen has, instead of on top of 'Play again'. The results board scrolls your row to the middle. 'You finished 6th · 550 pts' stays pinned under the winner line, and the awards are chips right under it.

- **The lobby remembers the night** (I-652, option C): a win by bots alone now reads '🤖 Bots took it', with the best person under it ('Priya led the humans · 3rd'). A 'Tonight' card beside 'Last up' lists each game of the night and its winner, and names the night's leader ('👑 Sam leads tonight · Sam 2 · Priya 1'). Bots never count, and a gap over 3 hours starts a new night.

- **The VIP comes back** (I-347, option C): in the lobby, the game picker and the results, the VIP role no longer passes on when the host's phone drops. During a game it still passes on after 30 s. When the host's phone comes back it says 'Priya took over as VIP while you were away' with a 'Take it back' button, and one tap tells the room 'Sam is the VIP again'.

- **The wrong page on the wrong screen** (I-677, option C): the join page opened on a big screen with a mouse asks '📺 Is this the TV?'. The TV page opened on a phone offers '📱 Join as a player / Keep the TV page on this phone'. The device remembers the answer: a screen that was the TV goes to the TV view by itself after a 3-second countdown with 'Stay here', and 'keep' is never asked again.

- **After the TV's 🏠 'start over'** (I-658, option B): for 10 minutes the old room code leads to the new room. Phones that came in by the QR get back in by themselves and an old QR still works. Each phone's address now carries the new code, and the TV shows the new room's QR right away instead of up to a minute later.

- **The empty lobby's QR card fits the TV** (I-682, option C): with nobody in the room, the QR card lies on its side, with a big code on the left and 'Scan to join', the address and the room code on the right. Nothing runs under the sound pill or the host bar any more, and the first join stands the card back up. The host bar no longer offers 'Pick a game' until a person, not a bot, is in; 'Add a bot' stays.

- **Vote for the next game** (I-650, option C): guests tap a chip per game to say what they want next. It's one vote each, you can change it, and tapping it again takes it back; bots never vote. The VIP's lobby shows the tally, and "Pick a game · 🙋 Bingo leads · 2 votes" opens the picker on the favourite with the most-wanted games first. Guests can vote again on the results screen. The TV shows who wants what (faces on each tally chip) and the counts on its game list. Votes clear when a game starts. The VIP still decides.

- **"Can't start" offers its fix** (I-667, option C): under the phone's red line, one button fixes the room. It says "✕ Remove 4 bots to play" (the newest bots; people are never removed), "🤖 Add 1 bot to play", or "✕ Remove the 2 bots" for a game without bots. The TV host bar offers the same exact fix instead of removing every bot, and each game card that doesn't fit the room says what it would take ("12 here · remove 4 bots").

- **Room switches leave the game picker** (I-642, option C): recap, music on every phone and phone only (plus the last-recap link) move to the ★ VIP menu's Room section. Recap and phone only are greyed there during a game. The picker opens straight on the games, under one slim "Room" row of chips (✓ when on) that opens the menu. When a switch changes, everyone gets a toast that says what it means ("📱 Phone-only room — the phones show what the TV would").

- **The TV shows a code for friends elsewhere** (I-646, option C): while a tunnel is live, the TV's join card shows a second, smaller QR beside "🌍 Not on this Wi-Fi? Scan this one". It opens the tunnel's link with the room code, and /api/info carries that link and its QR. Without a tunnel nothing changes.

- **One job per phone-header element** (I-666, option C): tap the room code in the header to share the room, on any screen. Once you've joined, the duplicate 🎨 goes (your face opens the same settings; the join page keeps its 🎨). A small phone keeps your name, shortened when it's long. The connection dot only appears when the phone isn't connected.

- **The TV picker always shows all five games** (I-668, option C): at 12 players the roster used to push the picked game off the TV. The room is now one row of overlapping faces on the "Sam is choosing a game…" line. The left column holds the five games, and the two room switches become one line of toggle chips ("📼 Recap ✓ · 🎵 Phone music").

- **The picker's minutes follow the game and the room** (I-189, option B): "~15 min" is no longer a fixed number for every game. Blanks, Lightning Round and Broken Pencil work their minutes out from their measured pace, the rounds setting and the number of players, live on the phone and the TV (Blanks ~6 → ~10 → ~13 min as rounds and players grow; Lightning ~3 min for 10 questions; Broken Pencil ~5 min at 4 players, ~12 at 8). Bingo and Wisecrack keep their fixed number.

- **Music volume on an iPhone** (the owner, 2026-09-23: "at 5 % it's still quite loud"): iOS
  ignores a web page's audio volume, so the music always played at full level there — the slider,
  every game's level, the fades and the ducks did nothing. The music now plays through Web Audio,
  whose level iOS does follow.

- **Music on a phone** (the owner, 2026-09-23): the phone's Music switch now really turns the music
  off in a phone-only room (or when the VIP put music on every phone) — the phone's own choice wins
  once touched. The soft / normal / loud buttons are a **Music volume** slider (0–100 %), shown
  whenever music plays, and it sets the game's beds too. The lobby's track no longer keeps playing
  underneath a game's music when the game starts quickly (on the TV too — that was most of Blanks'
  loudness). Blanks' music is quieter still (0.07) and stays level under the reader instead of
  dipping and swelling around every card.

- **Bingo's check on a phone-only room** (the owner's video, 2026-09-23): the claimed card no
  longer turns every square pink while it is checked — the pattern turns green, a wrong daub red,
  and the card's other daubs fade to grey instead of keeping the watcher's ink. The player who
  called BINGO now sees the check on their own phone too, then their win screen. A Blanks room
  whose reader voice is not installed asks a person to read again, as before voices.

- **Blanks' hand on an iPhone** (the owner's video, 2026-09-23): the fan's cards were cut off at the
  bottom and the fan itself scrolled up and down; it now scrolls sideways only and leaves room for
  the turned side cards. **Blanks' music** plays one continuous, quieter set from the round card
  through the result instead of switching tracks and beds between picking, reading and judging.

- **Blanks deals its Pick 2 / Pick 3 cards** (I-158, option B): every game now deals exactly one, in
  the middle (round 4 of six, round 8 of fifteen). Before, the deck's spacing put the first one ~17
  rounds deep, so no six-round game on mild, adults or wild ever saw one.

- **Blanks never asks a bot to read out loud** (I-143, option C): the reading skips bots to the next
  person; with no person left the TV says "the TV reads this one"; and when the reader's phone
  drops, every other phone offers "I'll read" — the first tap takes the rest of the round.

- **Bingo on an iPad** (I-126, option B): the 🃏 style pill no longer disappears on a tablet — it
  keeps the all-cards layout by default but can pick Focus, Stack or Grid, remembered apart from a
  phone's — and the tablet's header is a real caller strip: the ball and number big, the nickname
  line under them.

- On an iPhone SE the lobby's title no longer slides under the 🚪 Leave pill: the pills wrap to
  their own line.

- **Broken Pencil's recap never cuts a word in half** (S-006, option B): each book's card puts the
  name and the verdict on its first line and gives the chain the card's full width underneath, so a
  long player name no longer squeezes "christmas" into "christ / mas".

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

- **Bingo: missed calls wait in a tray** (I-122, option A): a phone that comes back from a dropout
  shows "Back — you missed [N 35]" as balls under the header, until its ✕ or the round's end — no
  longer a sentence that vanished after five seconds — and the calls stay the ones actually missed.

- **Bingo: after a bingo every phone votes** (I-105, option C): keep going (same pattern or
  blackout) or next round is a vote, not the fastest thumb — your choice stays lit and can change,
  each button shows its count, the TV lists who voted what, and the phone counts the vote down. It
  closes 6 s after the first vote or once everyone has voted; most votes win, the VIP breaks a tie.
  The TV's win screen now fits at 1080p even with the "never called" kicker and the vote list.

- **Bingo: "Calls shown" is one choice** (I-112, option C): Memory test (nothing) · Last call only ·
  Full board replaces the "Called board" and "Previous number" switches, which could be set to a
  contradiction (the board on, the previous call off). Any setting can now declare `impliedBy` to
  grey itself out while a sibling implies it.

- **Share is a pill in the lobby's top-right corner** and opens a real chooser (the owner,
  2026-09-22): the phone's own share sheet where the page is https, otherwise Messages · WhatsApp ·
  Mail · Copy. A "🚪 Leave" pill beside it drops the session and goes back to the room menu.

- The join screen's language pills moved to the top-right corner, beside the title, and the "more
  below" chevron grew from 32x22 to 56x40 so a thumb can actually hit it (the owner, 2026-09-22).

### Added

- **Co-op and team games end properly** (ADR-052): a game can say it was a co-op mission (complete or
  failed) or a team game (▲ Sun wins, or a draw), with its own headline. The results screens stop
  calling those a tie: a win gets the cheer and the confetti, a loss or a draw the quiet chord.

- **A new game picker** (game pack F3, ADR-051): "Pick a game" opens a list with nothing chosen —
  a count of who is here, filter chips that only appear when they narrow the list, and one compact
  row per game (icon, NEW, tagline, players · minutes, why it doesn't fit tonight). Games that fit
  come first, then the room's votes, then NEW, then A–Z. ⓘ (or a long press) opens About — how to
  play in three steps — and the TV shows that game big while the VIP reads, with a "Sam is reading
  about…" line on the guests' phones. A guest's 👍 Suggest is their vote and tells the room once in
  a while. The TV grid pages through the games and turns a spotlight through them when nobody is
  reading. Two columns on a phone turned sideways; one-line names on a 320 px phone.

- **Phones download only what they play** (game pack F1–F2, ADR-049/050): joining a room now
  downloads 177 KB instead of 1.1 MB. The list of games is a small catalog the host sends once (with
  its Spanish), About and a game's settings words come from the host when opened, and a game's
  phone code downloads only when it is chosen (Wisecrack: 13 KB); phones never download TV code or
  the content packs. Hashed files are cached for good and sent compressed. `pnpm verify` fails if
  the join download grows or a game's phone download passes its budget.

- **One answer matcher for typed answers** (game pack F5, ADR-048): `@partybox/game-sdk/match` —
  the same rules on the host and the phone for "is this the answer?", in English and Spanish:
  spacing, case, accents, apostrophes, "a/the/una", plurals and number words never matter; close
  typos count only when the pack allows; a listed wrong answer always loses. Clue checks ("one
  word", "not the secret") return a reason the game words in both languages. Answer packs carry
  their language and are checked by `checkAnswerPack`.

- **Teams, votes and turns for the new games** (game pack F7): `teamsFromSeed` makes ▲ Sun and
  ● Moon teams of even size with the bots spread, `majorityPick` picks a vote's winner with a
  seeded tie-break (none when nobody voted), and `rotation` says whose turn it is, skipping players
  who left.

- **Readings for the game pack** (F6, ADR-045 addendum): `@partybox/game-sdk/speech`, server-only —
  `toSpeakable` turns a line into what the reader should hear (Part 00 §5.3: numbers, money, times
  and years as words; abbreviations; acronyms spelled, as phonemes so a mid-line "A" is not "uh";
  shouting and stretched words in player text; no emoji), with a global pronunciation list the
  game's own list beats (case-sensitive unless `anyCase`); `speakableName`; `speechKey` (a content
  hash, so `/api/speech/<key>.wav` is now cached for good) and `pendingCap`. Phoneme parts always
  carry their words, so Zira says them instead of going silent; hyphenated game ids get readings.

- **Blanks reads every card aloud** (READER-VOICES, ADR-045): a Reader setting (default Old British
  Man; Young British Man, American Woman, Soft-Spoken Woman, Original, or No reader for the players
  to read). Each finished card is synthesised on the host the moment it is played — with a beat
  before each answer and the pronunciation lexicon (Harambe, NASA, "nineteen forty-five", 60 card
  fixes) — and the reveal waits for the reading plus a beat. The question is read too, "blank" for
  its gap.

- **Bingo: pick the caller's voice** (READER-VOICES, the owner, 2026-09-22): a Reader setting — No
  reader · Old British Man · Young British Man · American Woman · Soft-Spoken Woman (the default) ·
  Original — with all 75 calls recorded in each of the four new voices. Every clip ends, plus a
  beat, before even the 3-second caller's next number.

- **Blanks: a side bet while the judge thinks** (I-149, option C): in judge mode every other phone
  can call which card the judge will take (never their own) for half a point — closed the moment the
  judge picks; the result shows "called it" with the callers' faces, and the night's best caller
  gets a "Read the room" award.

- **Blanks: a tie is played off** (I-147, option A): when the last round leaves the top score shared,
  one more black card is dealt — the TV says TIE-BREAK, only the tied players get a hand, everyone
  else votes — up to three times, so a tie that will not break still ends.

- **Blanks: the hand is a real fan** (I-141, the owner's design B): the middle card stands upright
  and lifted, the side cards turn away and drop as you swipe, page dots with "3 of 10" sit over the
  fan, and "New hand" is the fan's last card ("Swap all 10 cards for fresh ones · 3 left"). A new
  setting, **Cards dealt**, picks 7, 10, 12 or 15 cards a hand.

- **Bingo bots answer for themselves** (I-138, option C): a bot's failed claim gets its own line on
  the verdict ("Bot 3: my sensors were dirty" for never-called daubs, "I got excited" for an early
  tap), a bot's win gets one too ("beep. gloat."), and each bot keeps the same voice all evening.
  On the TV and the phone-only stage, in English or Spanish.

- **Pick your avatar's colour** (I-086, option C): eight colour swatches above the face grid paint
  the portrait live, and the join carries face and colour together (`fox#3` — every surface renders
  it). A colour someone in the room already wears is crossed through, and a new phone starts on a
  free one.

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
