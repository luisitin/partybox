# For the stress session — noticed during the design pass 2026-09-15

Non-visual behaviour I hit while driving the capture; not fixed here.

1. **Kicked phone never reconnects.** `host.ts` answers a kick with `transport.disconnectPlayer` →
   `socket.disconnect(true)`. socket.io-client treats "io server disconnect" as final and does not
   auto-reconnect, so the Join button on the kicked phone stays disabled (`connection !== 'connected'`)
   until the page is reloaded. Fix candidates: `socket.io.on('disconnect', reason => reason === 'io server
disconnect' && socket.connect())` in `net/controller.ts`, or don't close the socket on kick.
2. **Join form sticks on "Joining…"** after the error strip is dismissed (`Join.tsx`: `submitting =
submittedAt !== null && error === null`). UI bug, listed as R-014; mentioning it here because it also
   blocks any e2e that retries a join.
3. **View `players[]` order is not join order** (TV strip: `Priya, Bot 3, Sam, Bot 2, Bot 1` after
   joining Sam, Priya, then 3 bots). Chips jump between lobby and play. Probably the engine's
   `Record` → array conversion or bot insertion; players expect a stable order.
4. **Spectators are absent from `view.players`** during play (a mid-game joiner shows as a toast only,
   never as a ◎ chip on the TV). If intended, the TV should still list them somewhere.
5. **Dev-mode server restart reloads every browser** (Vite HMR reconnect → `location.reload()`), which
   re-shows the TV audio gate. Verify the production build (`pnpm start`) behaves differently before
   treating R-009 as the only fix.
6. Playwright's `context.setOffline(true)` does not drop an open websocket, so "phone offline" has to be
   simulated by killing the server or by a dev endpoint that closes one player's socket
   (`POST /api/dev/socket-close { playerId }` would be a useful addition).

## Added 2026-09-15 (evening) — TV Home button

7. **The TV has no way to end a game or start over without a phone.** The owner asked for a 🏠 on the
   stage that forces the initial lobby. The TV socket is a pure observer, so the client goes through
   `POST /api/dev/reset` and the launcher now passes `--dev-api` (unauthenticated LAN control API — a
   trade-off). A proper fix belongs in the protocol: a `tv:home` (or `tv:reset`) event on the TV socket
   that ends the game and returns everyone to the lobby _keeping the players_ (`end` + `toLobby`
   semantics), or a signed one-shot token the TV page receives on `tv:join`. When that exists,
   `packages/client/src/net/tv.ts#home` is the one place to switch.
8. **A phone whose stored token the server no longer knows** (server restart, Home reset) got an error
   banner over its stale playing screen after auto-reconnect. Fixed client-side (`room_not_found` /
   `bad_token` on an auto-rejoin → join form with the "started over" hint), noting it because the server
   could also send an explicit `kicked { reason: 'reset' }` before dropping sockets, which would be
   cleaner than inferring from the join error.
