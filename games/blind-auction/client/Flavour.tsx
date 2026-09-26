// A box's flavour line. Box names get Spanish in the pack, but the flavour lines are open-ended
// content and stay English, so a Spanish screen marks them (decision [196a9e] rule 1). A live
// event's line is the game's own and is translated.
import type { JSX } from 'react';
import { useLang, useT } from '@partybox/game-sdk/ui';
import { boxWords } from './copy';
import { STRINGS } from './strings';

export function Flavour({
  box,
  className,
}: {
  box: { name: string; flavour: string; event?: string };
  className?: string;
}): JSX.Element {
  const L = useT(STRINGS);
  const lang = useLang();
  const english = !box.event && lang !== 'en';
  return (
    <p className={className}>
      {boxWords(L, box).flavour}
      {english ? <span lang="es">{` · ${L('in English')}`}</span> : null}
    </p>
  );
}
