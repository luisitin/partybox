// D7 / D8: leaving the game. A seat is exiled when its player leaves on purpose (or is removed),
// or when it has been dropped for EXILE_MS: main keeps a dropped seat for the whole game (I-746 A),
// so the game counts the hold itself (the owner's call, 2026-09-24), checked on every event.
import { setConnected } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { advance, chooserOf, endTooFew, nextRound, resolveNow } from './flow';
import { withRound, without } from './phase';
import { enterGameOver } from './phases/gameOver';
import { enterNominate } from './phases/nominate';
import { allReady } from './phases/seating';
import { everyoneVoted } from './phases/vote';
import { EXILE_MS } from './types';
import type { Input, State } from './types';

const OVER = new Set(['gameOver', 'done']);

function exile(state: State, id: string, now: number): State {
  const { [id]: _dropped, ...droppedAt } = state.droppedAt;
  void _dropped;
  if (!state.seats.includes(id) || state.exiled.includes(id) || OVER.has(state.phase.id))
    return { ...state, droppedAt };
  const wasAlive = state.alive.includes(id);
  const s: State = {
    ...state,
    droppedAt,
    exiled: [...state.exiled, id],
    alive: without(state.alive, id),
    ready: without(state.ready, id),
  };
  if (s.role[id] === 'hitler')
    return enterGameOver({ ...s, winner: 'liberals', winReason: 'hitlerFled' }, now);
  if (!wasAlive) return s; // a ghost leaving changes nothing at the table
  if (s.alive.length < 3) return enterGameOver(endTooFew(s), now);
  const r = s.round;
  switch (s.phase.id) {
    case 'seating':
      return allReady(s) ? advance(s, now) : s;
    case 'nominate':
      return r.president === id ? nextRound(s, now) : s;
    case 'vote': {
      if (r.president === id) return nextRound(s, now);
      if (r.nominee === id) return enterNominate(withRound(s, { nominee: null, votes: {} }), now);
      const { [id]: _vote, ...votes } = r.votes;
      void _vote;
      const after = withRound(s, { votes });
      return everyoneVoted(after) ? advance(after, now) : after;
    }
    default:
      return chooserOf(s) === id ? resolveNow(s, now) : s;
  }
}

/** Exiles every seat whose drop has lasted EXILE_MS. Paused games hold the clock (D10). */
export function expireDrops(state: State, now: number): State {
  if (state.phase.paused) return state;
  let s = state;
  for (const [id, at] of Object.entries(state.droppedAt))
    if (now - at >= EXILE_MS) s = exile(s, id, now);
  return s;
}

export function onPlayer(state: State, event: GameEvent<Input>): State {
  if (event.type !== 'player' || !state.seats.includes(event.playerId)) return state;
  const s = setConnected(state, event);
  const id = event.playerId;
  if (event.gone) return exile(s, id, event.now);
  if (event.connected) {
    if (!Object.hasOwn(s.droppedAt, id)) return s;
    const { [id]: _back, ...droppedAt } = s.droppedAt;
    void _back;
    return { ...s, droppedAt };
  }
  if (s.exiled.includes(id) || Object.hasOwn(s.droppedAt, id)) return s;
  return { ...s, droppedAt: { ...s.droppedAt, [id]: event.now } };
}
