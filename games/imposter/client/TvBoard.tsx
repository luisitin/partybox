// The TV's table of clue cards (SPEC §1.4 "Clue grid"): four columns, rows growing with the room.
// A card lies face down until its deal beat, then turns face up in 3D (transform only) with its
// author on top and the clue in the middle; earlier clue rounds stack above it as a caption. The
// same table carries the deal (card backs), the typing (✓ on the back), the talk, the vote (dimmed,
// ✓ when voted), the vote reveal (voters' faces land on their target) and the runoff (the tied
// players lit, the rest stepped back).
import { useEffect, useRef } from 'react';
import type { CSSProperties, JSX } from 'react';
import { Avatar, useSound } from '@partybox/game-sdk/ui';
import type { PushedView, ViewPlayer } from '@partybox/game-sdk/ui';
import type { ImposterTvView } from '../server/index';
import { byId, clueFontPx } from './shared';
import styles from './tv.module.css';

const COLS = 4;
/** Stage width inside the overscan, split four ways with 24 px gaps. */
const CARD_W = (1920 - 2 * 96 - 3 * 24) / COLS;

export type BoardMode = 'down' | 'up' | 'dim' | 'votes' | 'runoff';

export function TvBoard({
  view,
  mode,
}: {
  view: PushedView<ImposterTvView>;
  mode: BoardMode;
}): JSX.Element {
  const { stage } = view;
  const who = byId(view.players);
  const n = stage.board.length;
  const rows = Math.max(1, Math.ceil(n / COLS));
  const dense = rows >= 3;
  const tally = stage.tally;
  const runoff = stage.runoff?.candidates ?? [];
  // One `card` pluck per dealt card, on the frame it turns (the shell's phase cue opens the reveal).
  const sound = useSound();
  const dealt = stage.board.filter((c) => c.dealt > 0).length;
  const last = useRef(dealt);
  useEffect(() => {
    if (view.phaseId === 'clueReveal' && dealt > last.current) sound('card', { quiet: true });
    last.current = dealt;
  }, [dealt, view.phaseId, sound]);
  // Voters listed per target, in seat order, for the landing faces.
  const lastRow = n % COLS || COLS;
  const lastStart = n - lastRow;
  const maxVotes = tally ? Math.max(0, ...Object.values(tally.counts)) : 0;
  const reveal = view.phaseId === 'clueReveal';
  const votersOn = new Map<string, string[]>();
  if (tally)
    for (const [voter, ts] of Object.entries(tally.votes))
      for (const t of ts) votersOn.set(t, [...(votersOn.get(t) ?? []), voter]);

  return (
    <div
      className={`${styles.board} ${dense ? styles.dense : ''} ${reveal ? '' : styles.flat} ${reveal && dealt === n && n > 0 ? styles.settled : ''}`}
      style={{ '--rows': rows } as CSSProperties}
      data-mode={mode}
      data-phase={view.phaseId}
    >
      {stage.board.map((card, i) => {
        const p: ViewPlayer | undefined = who.get(card.by);
        const faceUp = mode !== 'down' && card.dealt > 0 && card.now !== null;
        const dim =
          mode === 'dim' ||
          (mode === 'runoff' && !runoff.includes(card.by)) ||
          (mode === 'votes' && runoff.length > 0 && !runoff.includes(card.by));
        const text = card.now ?? '';
        const voters = votersOn.get(card.by) ?? [];
        const count = tally?.counts[card.by] ?? 0;
        return (
          <div
            key={card.by}
            className={`${styles.slot} ${dim ? styles.dim : ''} ${mode === 'runoff' && runoff.includes(card.by) ? styles.lit : ''} ${reveal && card.dealt > 0 && card.dealt === dealt ? styles.speaking : ''} ${mode === 'votes' && maxVotes > 0 && (tally?.counts[card.by] ?? 0) === maxVotes ? styles.leader : ''}`}
            style={
              {
                '--i': i,
                // An 8-track grid, two tracks a card: the last, partial row sits centred.
                gridColumn:
                  i === lastStart && lastRow < COLS ? `${1 + (COLS - lastRow)} / span 2` : 'span 2',
              } as CSSProperties
            }
          >
            <div className={`${styles.card} ${faceUp ? styles.up : ''}`}>
              <div className={styles.cardTurn}>
                <div className={styles.cardBack}>
                  {p ? (
                    <Avatar avatarId={p.avatarId} size={dense ? 48 : 64} dim={!p.connected} />
                  ) : null}
                  <span className={styles.cardName}>{p?.name ?? '?'}</span>
                  {p?.status === 'submitted' ? (
                    <span className={styles.ready} aria-label="✓">
                      ✓
                    </span>
                  ) : view.phaseId === 'clue' && p?.connected ? (
                    <span className={styles.typingDots} aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                  ) : null}
                </div>
                <div className={styles.cardFace}>
                  <div className={styles.cardHead}>
                    {p ? <Avatar avatarId={p.avatarId} size={dense ? 40 : 64} /> : null}
                    <span className={styles.cardName}>{p?.name ?? '?'}</span>
                    {mode === 'dim' && p?.status === 'submitted' ? (
                      <span className={styles.ready}>✓</span>
                    ) : null}
                  </div>
                  {card.before.length > 0 ? (
                    <p className={styles.before}>{card.before.join(' · ')}</p>
                  ) : null}
                  {text ? (
                    <p
                      className={styles.clue}
                      style={{ fontSize: clueFontPx(text, n, dense ? CARD_W - 104 : CARD_W - 32) }}
                    >
                      {text}
                    </p>
                  ) : (
                    <p className={`${styles.clue} ${styles.noClue}`}>—</p>
                  )}
                </div>
              </div>
            </div>
            {mode === 'votes' && voters.length > 0 ? (
              <div className={styles.votes} aria-label={`${count} votes`}>
                {voters.slice(0, dense ? 5 : 8).map((v, k) => {
                  const vp = who.get(v);
                  return (
                    <span key={v} className={styles.voter} style={{ '--k': k } as CSSProperties}>
                      {vp ? <Avatar avatarId={vp.avatarId} size={dense ? 28 : 36} /> : null}
                    </span>
                  );
                })}
                <span
                  className={styles.count}
                  style={{ '--k': Math.min(voters.length, dense ? 5 : 8) } as CSSProperties}
                >
                  {count}
                </span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
