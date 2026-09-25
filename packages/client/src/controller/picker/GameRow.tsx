// One game in the picker's list (Part 00 §1.3): a 72 px row — the icon tile, the name, the tagline
// and a meta line (players · minutes, then NEW / presence / votes / played) — and an ⓘ that opens
// the About sheet. A game that does not fit the room is dimmed and says why; tapping it opens About.
import { useRef } from 'react';
import type { JSX } from 'react';
import type { CatalogEntry } from '@partybox/shared';
import { taglineOf } from '../../catalog';
import { t } from '../../i18n';
import type { Fit } from './model';
import styles from './picker.module.css';

const PRESENCE_GLYPH = { anywhere: '🌐', 'voice-if-remote': '🎧', 'same-room': '📍' } as const;

/** A finger held this long is a peek, not a choice: it opens About (a resting thumb never
 *  commits the room to a game — the touch probe chose Bingo with a 900 ms hold). */
export const PEEK_MS = 450;

export interface GameRowProps {
  game: CatalogEntry;
  lang: string;
  fit: Fit;
  minutes: number;
  votes: number;
  played: boolean;
  /** The row's place in the list: the rows rise one after another. */
  index: number;
  /** The VIP has this game's About open (a guest's list rings it, §1.4). */
  reading?: boolean;
  onRow: () => void;
  onInfo: () => void;
}

function reasonOf(fit: Fit): string | null {
  if (fit.ok) return null;
  if (fit.why === 'needs') return t.picker.needs(fit.min, fit.n);
  if (fit.why === 'tooMany') return t.picker.tooMany(fit.max, fit.n);
  return t.picker.noBots;
}

export function GameRow({
  game,
  lang,
  fit,
  minutes,
  votes,
  played,
  index,
  reading = false,
  onRow,
  onInfo,
}: GameRowProps): JSX.Element {
  const reason = reasonOf(fit);
  const downAt = useRef(0);
  return (
    <li
      className={`${styles.item} ${fit.ok ? '' : styles.off} ${reading ? styles.readingRow : ''}`}
      style={{ ['--i' as string]: Math.min(index, 8) }}
    >
      <button
        type="button"
        className={styles.row}
        onPointerDown={(e) => {
          downAt.current = e.timeStamp;
        }}
        onClick={(e) =>
          downAt.current && e.timeStamp - downAt.current >= PEEK_MS ? onInfo() : onRow()
        }
        onContextMenu={(e) => e.preventDefault()}
        aria-label={fit.ok ? t.picker.choose(game.name) : t.picker.about(game.name)}
      >
        <span className={styles.tile} aria-hidden>
          {game.icon}
          {/* NEW rides on the tile's corner: on a 320 px row it took a line of its own. */}
          {game.isNew ? <span className={styles.tileNew}>{t.picker.isNew}</span> : null}
        </span>
        <span className={styles.text}>
          <span className={styles.name}>
            {game.name}
            {game.isNew ? <span className="pb-visually-hidden"> ({t.picker.isNew})</span> : null}
          </span>
          <span className={styles.tagline}>{taglineOf(game, lang)}</span>
          <span className={styles.meta}>
            {reason ? (
              <span className={styles.reason}>{reason}</span>
            ) : (
              <span>
                {t.picker.players(game.minPlayers, game.maxPlayers)} · {t.picker.minutes(minutes)}
              </span>
            )}
            {/* 🌐 is every game's default: only a game that needs more (🎧 📍) says so here — the
                About sheet and the "Plays anywhere" chip carry the rest (a 320 px row wrapped). */}
            {game.presence !== 'anywhere' ? (
              <span
                title={t.picker.presence[game.presence]}
                aria-label={t.picker.presence[game.presence]}
              >
                {PRESENCE_GLYPH[game.presence]}
              </span>
            ) : null}
            {votes > 0 ? <span aria-label={t.vote.want(votes)}>🙋 {votes}</span> : null}
            {played ? <span className={styles.badge}>{t.picker.played}</span> : null}
          </span>
        </span>
      </button>
      <button
        type="button"
        className={styles.info}
        onClick={onInfo}
        aria-label={t.picker.about(game.name)}
      >
        ⓘ
      </button>
    </li>
  );
}
