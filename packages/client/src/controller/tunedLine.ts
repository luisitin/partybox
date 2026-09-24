// I-763 B: "Your settings: Cards per player 4 · Seconds per number 3" — the settings that differ
// from the game's defaults, up to three, in the phone's language; null when nothing is tuned.
import { multiselectPicks } from '@partybox/shared';
import type { SelectedGame, Settings } from '@partybox/shared';
import type { Lang } from '@partybox/game-sdk/ui';
import { t } from '../i18n';
import { gameText } from '../i18n-games';

type Spec = SelectedGame['settings'][number];

/** A multiselect's default is an array: compare by value, not by reference. */
const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

export function tunedSettings(game: SelectedGame, values: Settings | undefined): Spec[] {
  if (!values) return [];
  return game.settings.filter(
    (s) => values[s.key] !== undefined && !same(values[s.key], s.default),
  );
}

export function tunedLine(
  game: SelectedGame,
  values: Settings | undefined,
  lang: Lang,
): string | null {
  const changed = tunedSettings(game, values);
  if (changed.length === 0 || !values) return null;
  const L = (en: string): string => gameText(game.id, lang, en);
  const say = (s: Spec): string => {
    const v = values[s.key];
    if (typeof v === 'boolean')
      return `${L(s.label)} ${v ? t.selecting.tunedOn : t.selecting.tunedOff}`;
    if (s.type === 'select') {
      const option = s.options.find((o) => o.value === v);
      return `${L(s.label)} ${option ? L(option.label) : String(v)}`;
    }
    if (s.type === 'multiselect')
      return `${L(s.label)} ${t.selecting.ticked(multiselectPicks(v, s).length)}`;
    return `${L(s.label)} ${String(v)}`;
  };
  const shown = changed.slice(0, 3).map(say).join(' · ');
  const more = changed.length > 3 ? ` · ${t.selecting.tunedMore(changed.length - 3)}` : '';
  return t.selecting.tuned(`${shown}${more}`);
}
