// TV during `reveal` (SPEC §4.4): every seated face in a row (two above eight); each tap flies as a
// small face from the guesser's own tile into the stack under the face they picked (`land`); a
// hold; "It was…"; then — the server's `shown` beat — the author's tile lifts, turns and grows,
// their name lands at h1, right guessers' minis glow ✓, wrong ones fade, "+2" pops over each
// right guesser and "+4 · fooled 4" under the author. Transform and opacity only.
import { memo, useEffect } from 'react';
import type { CSSProperties, JSX } from 'react';
import { Avatar, Stage, useSound, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps, ViewPlayer } from '@partybox/game-sdk/ui';
import type { RevealView, WsTvView } from '../server/views';
import { avatarCentre, faceLayout, slotCentre, tileAt } from './faces';
import type { FaceLayout } from './faces';
import { namesLine, verdictOf } from './lines';
import { STRINGS } from './strings';
import { AnswerCard } from './TvGuess';
import styles from './tv.module.css';

type Props = GameTvProps<WsTvView>;

/** A stagger index squeezed to at most eight steps, so 16 faces take as long as 8. */
export function step(i: number, n: number): number {
  return n <= 8 ? i : (i * 8) / n;
}

/** The answer card's rise: from where the guess screen left it (centred) to the top of the reveal. */
const VERDICT_H = 190;
const VERDICT_TIGHT_H = 120;
const CARD_H = 110;

/** A face's SVG art, memoised: the flip's push (and every ✓) re-renders the board, and the 32
 *  faces' SVG subtrees were most of that work on a weak TV (4x CPU trace, item 1). */
const Face = memo(function Face(props: { avatarId: string; size: number; dim?: boolean }) {
  return <Avatar avatarId={props.avatarId} size={props.size} dim={props.dim} />;
});

interface Mini {
  guesser: ViewPlayer;
  target: number;
  slot: number;
  count: number;
}

function stacks(r: RevealView, order: string[], byId: Map<string, ViewPlayer>): Mini[] {
  const out: Mini[] = [];
  const filled = new Map<string, number>();
  const totals = new Map<string, number>();
  for (const g of order) {
    const t = r.guesses[g];
    if (t !== undefined) totals.set(t, (totals.get(t) ?? 0) + 1);
  }
  for (const g of order) {
    const t = r.guesses[g];
    // Before the flip the guessers are anonymous (server: RevealView.guesses): a blank face.
    const guesser =
      byId.get(g) ??
      ({ id: g, name: '', avatarId: 'ghost', connected: true, status: 'active' } as ViewPlayer);
    if (t === undefined || !guesser || !order.includes(t)) continue;
    const slot = filled.get(t) ?? 0;
    filled.set(t, slot + 1);
    out.push({ guesser, target: order.indexOf(t), slot, count: totals.get(t) ?? 0 });
  }
  return out;
}

function Minis({
  minis,
  order,
  l,
  r,
}: {
  minis: Mini[];
  order: string[];
  l: FaceLayout;
  r: RevealView;
}): JSX.Element {
  const n = order.length;
  const cap = l.perStack * l.stackRows;
  return (
    <>
      {minis.map((m, i) => {
        const overflow = m.count > cap && m.slot >= cap - 1;
        if (overflow && m.slot > cap - 1) return null;
        const at = slotCentre(m.target, m.slot, Math.min(m.count, cap), n, l);
        if (!at) return null;
        const from = avatarCentre(order.indexOf(m.guesser.id), n, l);
        const shown = r.step === 'shown';
        const author = r.authors.includes(m.guesser.id);
        const right = r.right.includes(m.guesser.id);
        const tone = !shown ? '' : author ? styles.miniOut : right ? styles.miniRight : styles.miniWrong; // prettier-ignore
        const style = {
          left: at.x - l.mini / 2,
          top: at.y - l.mini / 2,
          width: l.mini,
          height: l.mini,
          '--fx': `${from.x - at.x}px`,
          '--fy': `${from.y - at.y}px`,
          '--k': step(i, minis.length),
        } as CSSProperties;
        return (
          <span key={m.guesser.id} className={`${styles.mini} ${tone}`} style={style}>
            {overflow ? (
              <span className={styles.more}>+{m.count - cap + 1}</span>
            ) : (
              <Face avatarId={m.guesser.avatarId} size={l.mini} />
            )}
            {shown && right && !overflow ? <span className={styles.tick}>✓</span> : null}
          </span>
        );
      })}
    </>
  );
}

export function TvReveal({ view }: Props): JSX.Element {
  const L = useT(STRINGS);
  const play = useSound();
  const r = view.reveal;
  const shown = r?.step === 'shown';
  const verdict = r && shown ? verdictOf(r) : null;
  const firstLine = view.say[0]?.ms ?? 0;
  // The taps start landing: one `tally` per reveal instance (the shell maps it to silence).
  useEffect(() => play('tally'), [view.startedAt, play]);
  useEffect(() => {
    if (!shown) return;
    play('reveal');
    if (!verdict) return;
    const handle = setTimeout(() => play(verdict === 'everyone' ? 'cheer' : 'bust'), firstLine + 150); // prettier-ignore
    return () => clearTimeout(handle);
  }, [shown, verdict, firstLine, play]);
  if (!r || !view.card) return <Stage center>{null}</Stage>;
  const byId = new Map(view.players.map((p) => [p.id, p]));
  const order = view.seated.filter((id) => byId.has(id));
  const l = faceLayout(order.length);
  const minis = stacks(r, order, byId);
  const authors = r.authors.map((id) => byId.get(id)?.name ?? '?');
  // The card starts where the guess screen left it (the stage's centre) and rises to the top.
  const verdictH = l.rows === 2 ? VERDICT_TIGHT_H : VERDICT_H;
  const rise = Math.round((CARD_H + l.height + verdictH) / 2 - CARD_H / 2);
  const fooled = Object.keys(r.guesses).filter((g) => !r.authors.includes(g) && !r.authors.includes(r.guesses[g] as string)).length; // prettier-ignore
  return (
    <Stage center>
      <div className={styles.cardRise} style={{ '--up': `${rise}px` } as CSSProperties}>
        <AnswerCard text={view.card.text} small />
      </div>
      <div className={styles.board} style={{ width: l.width, height: l.height } as CSSProperties}>
        {order.map((id, i) => {
          const p = byId.get(id) as ViewPlayer;
          const t = tileAt(i, order.length, l);
          const author = shown && r.authors.includes(id);
          const pts = shown ? (r.points[id] ?? 0) : 0;
          return (
            <div
              key={id}
              className={`${styles.tile} ${author ? styles.tileAuthor : ''} ${shown && !author ? styles.tileRest : ''}`}
              style={{ left: t.x, top: t.y, width: l.tileW } as CSSProperties}
            >
              <span
                className={styles.tileIn}
                style={{ '--k': step(i, order.length) } as CSSProperties}
              >
                <span className={styles.face} style={{ width: l.avatar, height: l.avatar }}>
                  <Face avatarId={p.avatarId} size={l.avatar} dim={!p.connected} />
                </span>
                <span className={styles.tileName} style={{ height: l.nameH }}>
                  {p.name}
                </span>
              </span>
              {pts > 0 && !author ? <span className={styles.plus}>+{pts}</span> : null}
              {author ? (
                <span className={styles.fooledBadge}>
                  {fooled > 0
                    ? L('+{pts} · fooled {n}', { pts: fooled, n: fooled })
                    : L('Fooled nobody')}
                </span>
              ) : null}
            </div>
          );
        })}
        <Minis minis={minis} order={order} l={l} r={r} />
      </div>
      <div
        className={`${styles.verdictArea} ${l.rows === 2 ? styles.verdictTight : ''}`}
        aria-live="polite"
      >
        {shown ? (
          <>
            <p className={`${styles.itWasName} pb-pop`}>{namesLine(L, authors)}</p>
            {verdict ? (
              <p className={styles.verdict}>
                {verdict === 'everyone' ? L('Everyone knew!') : L('Nobody saw that coming!')}
              </p>
            ) : null}
          </>
        ) : (
          <p className={styles.itWas}>{L('It was…')}</p>
        )}
      </div>
    </Stage>
  );
}
