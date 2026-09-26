// Phase "claims": the table talks for 60 s at normal pace (or until the VIP's Next).
import { isTimerFor } from '@partybox/game-sdk';
import type { GameEvent } from '@partybox/game-sdk';
import { go, timed } from '../phase';
import type { Input, State, Transition } from '../types';

export function enterClaims(state: State, now: number): State {
  return go({ ...state, chat: [], lastChatAt: {} }, 'claims', now, timed(state, 'claims'));
}

export function reduceClaims(state: State, event: GameEvent<Input>, next: Transition): State {
  if (isTimerFor(state, event)) return next(state, event.now);
  if (event.type !== 'input' || event.input.type !== 'chat') return state;
  const text = event.input.text.replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
  if (!text || text.length > 120) return state;
  if (event.now - (state.lastChatAt?.[event.playerId] ?? -Infinity) < 3_000) return state;
  return {
    ...state,
    chat: [...(state.chat ?? []), { from: event.playerId, text, at: event.now }].slice(-6),
    lastChatAt: { ...state.lastChatAt, [event.playerId]: event.now },
  };
}
