// I-648 A: while the VIP tunes the game, the guests read its settings — read-only, live (the room
// snapshot every phone already has).
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
  if (game.settings.length === 0) return null;
  const L = (en: string): string => gameText(game.id, lang, en);
  return (
    <dl className={styles.glance}>
      {game.settings.map((s) => (
        <div key={s.key} className={styles.row}>
          <dt>{L(s.label)}</dt>
          <dd>{settingValue(game, s, values?.[s.key], lang)}</dd>
        </div>
      ))}
    </dl>
  );
}
