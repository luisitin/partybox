// I-648 A: while the VIP tunes the game, the guests read its settings — read-only, live (the room
// snapshot every phone already has). I-648 B: a row the VIP just changed breathes once, 2 s
// (the owner's note: smoother, like a breathe — the CSS holds the curve).
import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import type { SelectedGame, Settings } from '@partybox/shared';
import type { Lang } from '@partybox/game-sdk/ui';
import { gameText } from '../i18n-games';
import { settingValue } from './tunedLine';
import styles from './SettingsGlance.module.css';

export function SettingsGlance({
  game,
  values,
  lang,
}: {
  game: SelectedGame;
  values: Settings | undefined;
  lang: Lang;
}): JSX.Element | null {
  const words = game.settings.map((s) => settingValue(game, s, values?.[s.key], lang));
  // the rows whose words changed since the last render glow (same game only)
  // (same game and language only: a language switch rewords every row but changes nothing)
  const last = useRef<{ id: string; lang: Lang; words: string[] }>({ id: game.id, lang, words });
  const seq = useRef(0);
  const [lit, setLit] = useState<{ keys: string[]; at: number }>({ keys: [], at: 0 });
  const said = words.join('|');
  useEffect(() => {
    const before = last.current;
    last.current = { id: game.id, lang, words };
    if (before.id !== game.id || before.lang !== lang) return;
    const changed = game.settings.filter((_, i) => before.words[i] !== words[i]).map((s) => s.key);
    if (changed.length === 0) return;
    seq.current += 1;
    const at = seq.current;
    const on = setTimeout(() => setLit({ keys: changed, at }), 0);
    return () => clearTimeout(on);
  }, [game.id, lang, said]); // eslint-disable-line react-hooks/exhaustive-deps
  // the breath ends 2 s after it starts; a newer change (a new `at`) owns its own 2 s
  useEffect(() => {
    if (lit.at === 0) return;
    const off = setTimeout(() => setLit((l) => (l.at === lit.at ? { keys: [], at: 0 } : l)), 2000);
    return () => clearTimeout(off);
  }, [lit.at]);
  if (game.settings.length === 0) return null;
  const L = (en: string): string => gameText(game.id, lang, en);
  return (
    <dl className={styles.glance}>
      {game.settings.map((s) => (
        // a second change inside the 2 s restarts the breath: the lit row remounts under a new key
        <div
          key={lit.keys.includes(s.key) ? `${s.key}@${lit.at}` : s.key}
          className={`${styles.row} ${lit.keys.includes(s.key) ? styles.lit : ''}`}
        >
          <dt>{L(s.label)}</dt>
          <dd>{settingValue(game, s, values?.[s.key], lang)}</dd>
        </div>
      ))}
    </dl>
  );
}
