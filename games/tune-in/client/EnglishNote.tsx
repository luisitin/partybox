// The dial ends are Spanish on a Spanish screen (content/*.json `es`), but the bots' clues and the
// voice are English: a Spanish room is told so on the rules (decision [196a9e] rule 1; reviewer
// [ba045e] #5; fake-out's pattern).
// Each surface passes its own style, so the phone never downloads the TV's CSS. No 🇬🇧: Windows
// browsers (a PC driving the TV) draw a flag emoji as the letters "GB".
import type { JSX } from 'react';
import { useLang, useT } from '@partybox/game-sdk/ui';
import { STRINGS } from './strings';

export function EnglishNote({ className }: { className?: string }): JSX.Element | null {
  const L = useT(STRINGS);
  if (useLang() === 'en') return null;
  return <p className={className}>{L('The bots’ clues and the voice are in English.')}</p>;
}
