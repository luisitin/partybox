// TV herd: every answer card lands, one by one in seat order, into its group's pen (the biggest
// on the left, lone answers in the Alone pen on the right); each pen counts up as its cards land.
// Once the last one settles the verdict hits: the herd's pen rises under a HERD ribbon with a
// cheer and the reader says the answer, or tied pens shake with a bust. A lone player gets the
// sheep outline. Typed mode: the VIP's merges re-pen cards live.
import { useEffect, useRef } from 'react';
import type { CSSProperties, JSX } from 'react';
import { Avatar, BigText, DeadlineBar, useSound, useT } from '@partybox/game-sdk/ui';
import type { PushedView, ViewPlayer } from '@partybox/game-sdk/ui';
import type { GroupView, HerdTvView } from '../server/views';
import { bannerAtMs, cardAtMs, CARD_LAND_MS, SPOKEN_AT_MS } from '../server/timing';
import { useLines, useStageBeats } from './beats';
import { kicker, verdictLine } from './labels';
import { SheepCoin } from './SheepCoin';
import { STRINGS } from './strings';
import styles from './Herd.module.css';

function Card({
  player,
  order,
  cards,
  settled,
  raw,
  answer,
  lone = false,
}: {
  player: ViewPlayer | undefined;
  order: number;
  cards: number;
  settled: boolean;
  raw: string | null;
  answer?: string;
  /** The only player alone: the Black Sheep lands on their card. */
  lone?: boolean;
}): JSX.Element {
  // Before the verdict a card waits for its turn; after it (a VIP merge) it lands at once.
  const style = {
    '--delay': `${settled ? 0 : cardAtMs(order, cards)}ms`,
    '--wave': order,
  } as CSSProperties;
  return (
    <li className={`${styles.card} ${lone ? styles.lone : ''}`} style={style}>
      {lone ? <SheepCoin size="sm" className={styles.loneCoin} /> : null}
      <Avatar avatarId={player?.avatarId ?? ''} size="var(--face)" className={styles.face} />
      <span className={styles.name}>{player?.name ?? '?'}</span>
      {answer ? <span className={styles.answer}>{answer}</span> : null}
      {raw ? <span className={styles.raw}>“{raw}”</span> : null}
    </li>
  );
}

export function TvHerd({ view }: { view: PushedView<HerdTvView> }): JSX.Element {
  const L = useT(STRINGS);
  const play = useSound();
  const groups = view.groups ?? [];
  // Landing order: seat (join) order across all pens, so no pen shows its size early.
  const order = view.players
    .filter((p) => groups.some((g) => g.members.includes(p.id)))
    .map((p) => p.id);
  const cards = order.length;
  // The verdict waits for the cards and for "The herd has spoken." (same rule as the server).
  const banner = bannerAtMs(cards, view.lines.find((l) => l.cue === 'spoken')?.ms ?? null);
  const beat = useStageBeats([0, SPOKEN_AT_MS, banner, banner + 700], view.paused);
  // How many cards have taken off, and how many have landed (the pen counts land with them).
  const flying = useStageBeats([0, ...order.map((_, i) => cardAtMs(i, cards))], view.paused);
  const landed = useStageBeats(
    [0, ...order.map((_, i) => cardAtMs(i, cards) + CARD_LAND_MS * 0.6)],
    view.paused,
  );
  const verdict = beat >= 2;
  const herdGroup = groups.find((g) => g.key === view.herd);
  useLines(view.lines, { spoken: 1, herd: 2, tie: 2, baa: 2 }, beat);
  // The verdict's sound: a cheer for a herd, a bust for a tie or a scatter (once per outcome).
  const cued = useRef('');
  const outcomeKey = `${view.outcome}:${view.herd ?? ''}`;
  useEffect(() => {
    if (!verdict || cued.current === outcomeKey || view.outcome === 'empty') return;
    cued.current = outcomeKey;
    play(view.outcome === 'herd' ? 'cheer' : 'bust');
  }, [verdict, outcomeKey, view.outcome, play]);

  const pens = groups.filter((g) => g.members.length >= 2);
  const alone = groups.filter((g) => g.members.length === 1);
  const top = Math.max(0, ...groups.map((g) => g.members.length));
  const player = (id: string): ViewPlayer | undefined => view.players.find((p) => p.id === id);
  const shown = (g: GroupView): number =>
    g.members.filter((id) => order.indexOf(id) < landed).length;
  const opened = (g: GroupView): boolean => g.members.some((id) => order.indexOf(id) < flying);
  const penClass = (g: GroupView): string => {
    // A pen shows up with its first card, so the layout never tells the room the sizes early.
    if (!verdict) return `${styles.pen} ${opened(g) ? '' : styles.unopened}`;
    if (g.key === view.herd) return `${styles.pen} ${styles.herdPen}`;
    if (view.outcome === 'tie' && g.members.length === top)
      return `${styles.pen} ${styles.tiedPen}`;
    return `${styles.pen} ${styles.dimPen}`;
  };
  // Faces as big as the room allows: a small party reads from the couch, sixteen still fit.
  const face = cards <= 6 ? 104 : cards <= 10 ? 80 : 60;
  return (
    <div
      className={`${styles.page} ${view.paused ? styles.paused : ''}`}
      style={{ '--face': `${face}px` } as CSSProperties}
    >
      <div className={styles.top}>
        <span className={styles.kicker}>{kicker(view.n, view.total, view.target, L)}</span>
        <BigText level="h2" className={styles.prompt}>
          {view.prompt}
        </BigText>
        <div className={styles.verdictSlot} aria-live="polite">
          {verdict && view.outcome !== 'empty' ? (
            <span key={outcomeKey} className={styles.verdict}>
              {verdictLine(view.outcome, herdGroup?.label ?? '', L)}
            </span>
          ) : null}
        </div>
      </div>
      <div className={styles.field}>
        {pens.map((g) => (
          <section
            key={g.key}
            className={penClass(g)}
            style={{ '--n': g.members.length } as CSSProperties}
          >
            {verdict && g.key === view.herd ? (
              <span className={styles.ribbon}>🐑🐑 {L('HERD')}</span>
            ) : null}
            <header className={styles.penHead}>
              <span className={styles.label}>{g.label}</span>
              <span key={shown(g)} className={styles.tally}>
                {shown(g)}
              </span>
              {g.merged.length > 0 ? <span className={styles.merged}>{L('merged')}</span> : null}
            </header>
            <ul className={styles.flock}>
              {g.members.map((id) => (
                <Card
                  key={id}
                  player={player(id)}
                  order={order.indexOf(id)}
                  cards={cards}
                  settled={verdict}
                  raw={g.raw?.[id] ?? null}
                />
              ))}
            </ul>
          </section>
        ))}
        {alone.length > 0 ? (
          <section
            className={`${styles.pen} ${styles.alonePen} ${verdict && !view.lone ? styles.dimPen : ''} ${!verdict && !alone.some(opened) ? styles.unopened : ''}`}
            style={{ '--n': alone.length } as CSSProperties}
          >
            <header className={styles.penHead}>
              <span className={styles.label}>{L('Alone')}</span>
              <span className={styles.tally}>{alone.reduce((n, g) => n + shown(g), 0)}</span>
            </header>
            <ul className={styles.flock}>
              {alone.map((g) => {
                const id = g.members[0] ?? '';
                return (
                  <Card
                    key={g.key}
                    player={player(id)}
                    order={order.indexOf(id)}
                    cards={cards}
                    settled={verdict}
                    raw={g.raw?.[id] ?? null}
                    answer={g.label}
                    lone={beat >= 3 && id === view.lone}
                  />
                );
              })}
            </ul>
          </section>
        ) : null}
        {groups.length === 0 ? (
          <p className={styles.empty}>{L('Nobody answered this one.')}</p>
        ) : null}
      </div>
      {/* Typed answers: the room waits on the VIP's merges — say so, and show how long. */}
      {view.mode === 'typed' && groups.length >= 2 && verdict ? (
        <div className={styles.vipWait}>
          <span>{L('Same answer in other words? The VIP can merge them, then Score it.')}</span>
          <DeadlineBar
            deadline={view.deadline}
            phaseKey={`herd:${view.n}`}
            paused={view.paused}
            urgentAt={0}
            className={styles.vipBar}
          />
        </div>
      ) : null}
    </div>
  );
}
