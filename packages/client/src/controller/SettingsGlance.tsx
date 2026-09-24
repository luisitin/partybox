// I-648 A: while the VIP tunes the game, the guests read its settings — read-only, live (the room
// snapshot every phone already has). I-648 B: a row the VIP just changed glows for 2 s.
import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import type { GameSummary, Settings } from '@partybox/shared';
import type { Lang } from '@partybox/game-sdk/ui';
import { gameText } from '../i18n-games';
import { settingValue } from './tunedLine';
import styles from './SettingsGlance.module.css';

export function SettingsGlance({
  game,
  values,
  lang,
}: {
  game: GameSummary;
  values: Settings | undefined;
  lang: Lang;
}): JSX.Element | null {
  const words = game.settings.map((s) => settingValue(game, s, values?.[s.key], lang));
  // the rows whose words changed since the last render glow (same game only)
  const last = useRef<{ id: string; words: string[] }>({ id: game.id, words });
  const [lit, setLit] = useState<{ keys: string[]; at: number }>({ keys: [], at: 0 });
  useEffect(() => {
    const before = last.current;
    last.current = { id: game.id, words };
    if (before.id !== game.id) return;
    const changed = game.settings.filter((_, i) => before.words[i] !== words[i]).map((s) => s.key);
    if (changed.length === 0) return;
    const at = Date.now();
    const on = setTimeout(() => setLit({ keys: changed, at }), 0);
    const off = setTimeout(() => setLit((l) => (l.at === at ? { keys: [], at: 0 } : l)), 2000);
    return () => {
      clearTimeout(on);
      clearTimeout(off);
    };
  }, [game, words.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps
  if (game.settings.length === 0) return null;
  const L = (en: string): string => gameText(game.id, lang, en);
  return (
    <dl className={styles.glance}>
      {game.settings.map((s) => (
        <div key={s.key} className={`${styles.row} ${lit.keys.includes(s.key) ? styles.lit : ''}`}>
          <dt>{L(s.label)}</dt>
          <dd>{settingValue(game, s, values?.[s.key], lang)}</dd>
        </div>
      ))}
    </dl>
  );
}
