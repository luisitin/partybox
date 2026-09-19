# PartyBox

A self-hosted, LAN-only party game platform. One Node process on your PC serves a **TV page** for the big
screen and a **controller page** for everyone's phone — no app install, no accounts, no internet needed.
Games are plugins; two ship with v0.1: **Wisecrack** (write answers, vote for the funniest) and
**Lightning Round** (speed trivia with streaks and a final wager).

## Quickstart (Windows 11, macOS or Linux)

Windows: double-click **`start-partybox.bat`** — it enables pnpm if needed, adds the firewall rule (one
UAC prompt, first time only), installs, builds, starts the server (`pnpm start --dev-api`, which powers
the TV's Home button) and opens the TV page. Close the window to stop. Everything else below is the
manual equivalent.

```bash
corepack enable            # gives you pnpm (Node >= 24 required)
pnpm install
pnpm build                 # builds the client once
pnpm start                 # http://<your-lan-ip>:42069  (printed at startup, with a QR on /tv)
```

Development: `pnpm dev` (hot reload, dev API on). Other port: `pnpm dev --port 42071` or `PORT=42071`.

### Windows Firewall (once)

Phones can only reach the PC if Windows allows inbound TCP on the port:

```
netsh advfirewall firewall add rule name="PartyBox" dir=in action=allow protocol=TCP localport=42069
```

(Run in an elevated PowerShell/cmd. The server prints this hint at startup.)

## Getting it on the TV

Any of these works — the TV only needs a browser that can open one URL:

1. **Smart TV browser** — open `http://<lan-ip>:42069/tv` on the TV's built-in browser (Samsung, LG, Fire TV Silk, Android TV Chrome).
2. **Cast a Chrome tab** — open `/tv` in Chrome on a laptop, then ⋮ → _Cast…_ → pick the TV (Chromecast / Google TV).
3. **Laptop + HDMI** — plug the PC or a laptop into the TV, open `/tv`, press F11 for full screen.
4. **Fire TV Silk** — open Silk, type the URL; use _Fullscreen_ from the Silk menu.

Then everyone opens `http://<lan-ip>:42069` on their phone (or scans the QR on the TV). The first person
in is the VIP and picks the game. Several TVs can open `/tv` at once; each has its own mute toggle.
Short on players? Anyone can tap **Add a bot** in the lobby (games marked 🤖 _Bots welcome_).

The stage fits any screen (a PC at 150 % scaling, a 4K TV) — no browser zoom needed. The 🏠 top-left
of the TV starts the party over (click it twice: fresh lobby, new code, everyone taps Join again);
it needs the server started with `--dev-api`, which the Windows launcher does.

## Music and the Bingo caller

The TV plays background music (lobby, Bingo, Broken Pencil, Wisecrack) from `packages/client/public/music/`,
fetched once by `pnpm fetch-music` (the Windows launcher does it after the build; no internet →
silence, nothing else changes). Tracks: Kevin MacLeod (incompetech.com), licensed under Creative
Commons: By Attribution 4.0 — https://creativecommons.org/licenses/by/4.0/. Bingo's caller speaks
each number through the browser's speech voices (Windows "Zira" preferred); phones stay silent.
The winner moment (`cheer`) is a party horn and a crowd cheer from Mixkit (mixkit.co/license),
bundled under `packages/client/public/sfx/`.

## Game recaps on disk

Every game the room plays is written to `recordings/<game>/<date_time>-<room>/` on the host PC
(gitignored): `session.json` (players, settings, phase timeline, results, and `lastPhase` — a mid-round phase means the VIP ended it early), `state.json` (the final game
state) and, for games that offer one, `recap.md` — Broken Pencil's books page by page with every
drawing as an SVG, Wisecrack's prompts with both answers and the votes, Lightning Round's questions
with each pick, time and points. Hand the folder over when giving feedback on a night. The **Save a
recap on the host PC** toggle in the game picker (phone and TV) turns it off for the next games —
Claude's test runs leave it off, and `PARTYBOX_RECORDINGS=off` (or a folder path) sets it for the
whole server.

## Commands

| Command                                       | What                                              |
| --------------------------------------------- | ------------------------------------------------- |
| `pnpm dev` / `pnpm start`                     | run (dev / production)                            |
| `pnpm verify`                                 | the full quality gate (< 3 min)                   |
| `pnpm new-game <id>`                          | scaffold a new game — see `docs/ADDING_A_GAME.md` |
| `pnpm sim --game <id> --players 6 --runs 200` | headless simulation                               |
| `pnpm e2e`, `pnpm e2e:snap --game <id>`       | browser tests and screenshots                     |

## Where to read next

`CLAUDE.md` is the map of the repo; `docs/START_HERE.md` gives a reading order per task.
