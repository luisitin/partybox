# engine — local rules

- Pure functions only: `(state, event, now) → { state, effects }`. Tests are tables of events.
- Never import `@partybox/game-sdk`, server, client or any game. Only `@partybox/shared`.
- Timers are data (ADR-004/022): games set `state.phase.deadline`; `nextWakeAt(room)` tells the host when to `tick`; never `setTimeout`.
- `rev` increases on every push effect; VIP actions from non-VIPs return `{ state, effects: [] }`.
- Keep ≥ 90 % line coverage — `pnpm test:coverage` fails the threshold otherwise.
- Test: `pnpm vitest --project engine`.
