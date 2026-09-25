// Echo's words and clues are English only: on Spanish screens the kicker says so (group rule
// [196a9e]); never on English screens.
import type { JSX } from 'react';
import { useLang, useT } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export function EnglishTag(): JSX.Element | null {
  const L = useT(STRINGS);
  if (useLang() === 'en') return null;
  return <span> · 🇬🇧 {L('in English')}</span>;
}
