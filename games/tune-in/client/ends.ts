// A Spanish screen shows the dial's Spanish ends (decision [196a9e]: short labels that frame the
// game get Spanish in the pack). Applied once at each root (Tv, Controller, PhoneStage), so every
// screen below reads `turn.left` / `turn.right` in its own language; the English stays under
// `turn.en` for the clue check, which bans the words of both.
import { useMemo } from 'react';
import { useLang } from '@partybox/game-sdk/ui';
import type { TurnHeader } from '../server/view-common';

export function withEnds<V extends { turn: TurnHeader }>(view: V, lang: string): V {
  if (lang !== 'es') return view;
  const { left, right, es } = view.turn;
  return { ...view, turn: { ...view.turn, left: es.left, right: es.right, en: { left, right } } };
}

export function useEnds<V extends { turn: TurnHeader }>(view: V): V {
  const lang = useLang();
  return useMemo(() => withEnds(view, lang), [view, lang]);
}
