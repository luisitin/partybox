# WEB_DEPLOY.md — the GitHub Pages version, and how to keep it in sync with your local app

**Read this before you merge anything from your PC into the public repo.**

PartyBox now ships as **two apps from one codebase**:

|              | **LAN app** (`pnpm dev` / `pnpm start`)     | **Web app** (GitHub Pages)                                       |
| ------------ | ------------------------------------------- | ---------------------------------------------------------------- |
| Who runs it  | a Node process on your PC                   | nobody — Pages serves files                                      |
| The room     | lives in the server, reached over Socket.IO | lives in the **first player's browser tab**, reached over WebRTC |
| The stage    | a TV on the wall (`/tv`)                    | a 16:9 strip at the top of **every** phone                       |
| Sound        | comes out of the TV                         | comes out of **each person's own device**                        |
| Who can play | everyone on the same Wi-Fi                  | anyone with the link and the room code                           |
| Address      | `http://<your-lan-ip>:42069`                | `https://<you>.github.io/<repo>/`                                |

Both run the **same engine, the same room host and the same game code**. That is the whole design:
you should almost never have to write anything twice.

---

## 1. How the two builds are put together

```
                 games/<id>/server  (pure reducers)      games/<id>/client  (React)
                          │                                        │
     ┌────────────────────┴───────────┐              ┌─────────────┴─────────────┐
     │  @partybox/engine  (pure)      │              │  @partybox/client         │
     │  @partybox/host    (the room)  │              │  TvApp + ControllerApp     │
     └────────────────────┬───────────┘              └─────────────┬─────────────┘
                          │                                        │
        ┌─────────────────┴─────────────────┐        ┌──────────────┴─────────────┐
        │ packages/server  Socket.IO + node │        │ packages/web   WebRTC       │
        │  → the LAN app                    │        │  → the Pages app            │
        └───────────────────────────────────┘        └─────────────────────────────┘
```

`@partybox/host` is the piece that made this possible: it is the room loop (players, VIP, timers,
pushes, effects) with **no** Node in it. The server hands it a Socket.IO transport; the web build
hands it a WebRTC transport plus a loopback for the host's own phone. Neither knows the difference.

**The only files that exist for the web build alone** are in `packages/web/`:

| File                        | What it does                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------- |
| `src/net/peer.ts`           | PeerJS: claim `partybox-v1-<CODE>`, accept guests, dial a host, reconnect             |
| `src/net/room-host.ts`      | the web's answer to `packages/server/src/sockets.ts` — validate, rate-limit, dispatch |
| `src/net/room.ts`           | start a room in this tab, or join someone else's                                      |
| `src/net/link-transport.ts` | one data channel → two stores (the phone half and the stage half)                     |
| `src/ui/WebApp.tsx`         | the page: stage strip over the controller                                             |
| `src/ui/RoomEntry.tsx`      | "start a room" / "join with a code" — the LAN app has no use for this                 |
| `src/ui/Stage.tsx`          | the TV, zoomed to fit the strip                                                       |
| `src/ui/ShareBar.tsx`       | invite link + the show/hide-stage toggle                                              |
| `src/games.generated.ts`    | GENERATED. Do not edit.                                                               |

---

## 2. Bringing changes over from your PC

Work on your PC exactly as you do now, on `main`. Then:

```bash
git pull                    # or: git push, if the public repo is your remote
pnpm install
pnpm verify                 # must be green — the Pages workflow runs it too
git push
```

Pushing to `main` builds and deploys the web app automatically
(`.github/workflows/pages.yml`). **There is no separate web branch and no separate web build to
remember.** If `pnpm verify` is green, the deploy will be too.

### What travels for free

| You changed…                         | Web build needs…                                              |
| ------------------------------------ | ------------------------------------------------------------- |
| a new game (`pnpm new-game <id>`)    | **nothing** — `pnpm gen-registry` writes the web registry too |
| game rules, content, fixtures, tests | **nothing**                                                   |
| a game's TV or controller component  | **nothing**                                                   |
| core screens (lobby, join, results)  | **nothing** — the web build renders the same components       |
| design tokens, themes, sounds, music | **nothing**                                                   |
| the engine, VIP rules, timers        | **nothing**                                                   |

### What needs a second look

| You changed…                                         | Also do this                                                                                                       |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `docs/PROTOCOL.md` — a **new wire event**            | add a handler to `packages/web/src/net/room-host.ts` next to the one you added in `packages/server/src/sockets.ts` |
| `packages/server/src/sockets.ts` validation / limits | mirror it in `room-host.ts`. These two files are deliberately parallel: read them side by side.                    |
| anything in `packages/server/src/host.ts`            | it is not there any more — it is `packages/host/src/host.ts`, and both builds use it                               |
| a new export the web build needs from the client     | add it to `packages/client/src/index.ts` (the barrel exists for exactly this)                                      |
| `/api/dev/*` or `/api/info`                          | the web build has no server. `setInfoProvider` in `WebApp.tsx` answers `/api/info`; the dev API is LAN-only.       |
| added a dependency to `packages/web`                 | add a line to `docs/DEPENDENCIES.md` — `pnpm verify` checks                                                        |

### The rule that keeps you out of trouble

> **Never put a `node:` import, a Socket.IO type or a `/api/...` fetch into `packages/host`,
> `packages/engine`, `packages/client` or `games/`.**

`pnpm lint` and `pnpm lint:deps` fail if you do, in exactly those four places. That is the fence
that stops the two builds drifting apart.

---

## 3. Writing a game that works well on both

A game does not know which build it is in, and it should not have to. But the two stages are read
very differently, so when you design a new game:

- **The TV strip is ~200 px tall on a phone.** It renders the real 1920×1080 stage zoomed down, so
  the _proportions_ are identical to a TV — but a stage that is already busy on a 55" screen is
  unreadable on a strip. Keep one focal point. `pnpm e2e:snap --game <id>` shows you the TV; look at
  it at 20 % and ask whether you could still play.
- **Everyone's device makes the sound.** On a LAN the TV is the only speaker; on the web every
  phone plays the cues, the music beds and Bingo's caller. Anything that assumed a single shared
  speaker (a caller reading a number "to the room", a countdown tick) will now play N times, very
  slightly out of sync. Prefer cues that are fine to hear on your own phone.
- **Nothing is on a shared screen.** A game whose fun depends on everyone looking at one TV
  (hidden-information reveals timed to a room's gasp) still works, but lands differently. Games where
  the phone carries the action — Bingo, trivia, Blanks, Broken Pencil — travel best.
- **Players are remote.** No "look at the person next to you". Rounds should be self-contained.

None of this is enforced; it is a checklist for `games/<id>/README.md`.

---

## 4. Setting up Pages (once)

1. Push this branch to GitHub.
2. **Settings → Pages → Build and deployment → Source: _GitHub Actions_.** That is all — no secrets,
   no tokens, no `gh-pages` branch.
3. Push to `main`. The workflow runs `pnpm verify`, builds, and deploys.
4. Your URL is `https://<you>.github.io/<repo>/`.

**If you use a custom domain or a `<you>.github.io` repo**, the site is served from `/`, not
`/<repo>/`. Change `PARTYBOX_BASE` in `.github/workflows/pages.yml` to `/`.

Run the web app locally with `pnpm web` (port 42072). The LAN app is untouched: `pnpm dev` still
serves the TV and the phones on 42069.

---

## 5. What to tell your players

1. One person opens the link and taps **Start a new room**. They get a 4-letter code, they are the
   VIP, and **their tab runs the room** — if they close it, the party ends. They can hand the VIP
   badge to anyone from ★ VIP → _Make VIP_; that moves the controls, not the hosting.
2. Everyone else opens the same link, types the code, picks a name and an avatar.
3. The stage sits at the top of everyone's screen; **Stage** in the bar folds it away when a game
   wants the whole screen (a Bingo card does).

---

## 6. Limits you should know about, and how to fix them

| Thing                                     | Why                                                                           | What you can do                                                                          |
| ----------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| The host closing their tab ends the room  | the room only exists in that tab; there is no server to hold it               | tell the host to keep the tab open; a phone should keep the screen on                    |
| A backgrounded host tab runs slow         | browsers throttle timers in background tabs                                   | same — the host's device should stay awake                                               |
| "Nobody can join — retry"                 | the signalling broker was unreachable; you can still play, nobody can dial in | tap it to retry; check the host's connection                                             |
| Two players behind strict/symmetric NATs  | WebRTC cannot punch through; needs a relay                                    | set `VITE_TURN_URL` / `VITE_TURN_USERNAME` / `VITE_TURN_CREDENTIAL` and rebuild          |
| Room code already taken                   | codes are global on the public broker                                         | handled automatically (a new code is minted); set `VITE_PEER_NAMESPACE` to make it rarer |
| **Players see each other's IP addresses** | that is what peer-to-peer means                                               | route through your own TURN server if that matters to your group                         |
| **Your repo is public**                   | every commit carries the email you committed with                             | see below                                                                                |

### Privacy notes for a public repo

- Nothing in this repository holds credentials, keys, `.env` files or personal data. Screenshots and
  videos under `reports/` are git-ignored and never pushed.
- The **git history carries the email address you commit with**, and it is public. To stop that for
  future commits, use GitHub's no-reply address:
  `git config user.email "<id>+<you>@users.noreply.github.com"` (the exact address is on
  GitHub → Settings → Emails). Past commits can only be changed by rewriting history, which breaks
  every existing clone — only worth it if the address really matters to you.
- The signalling broker sees room codes and connection metadata. Game content never goes through it.
