// TV reveal (SPEC §3.4 "Each reveal step"): the picked option flies from its slot to the centre
// and grows (a measured FLIP, transform only); the pickers pop above it; the reader reads it; the
// stamp lands on its beat (LIE ✗ · PARTYBOX LIE 🤖 · TRUTH ✓) with its cue and line; then the
// authors rise with their points. After the truth the fact completes, then "Nobody fell for…".
import { useLayoutEffect, useMemo, useRef } from 'react';
import type { JSX } from 'react';
import { Avatar, Stage, usePrefersReducedMotion, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps, ViewPlayer } from '@partybox/game-sdk/ui';
import type { FakeOutTvView, RevealedOption } from '../server/index';
import { useAfter, useClipAt, useCueOnce } from './beats';
import { FactCard } from './FactCard';
import { Deck } from './Deck';
import { ReadAlong } from './ReadAlong';
import { STRINGS } from './strings';
import { kicker } from './labels';
import styles from './tv.module.css';

type Props = GameTvProps<FakeOutTvView>;

/** When the authors (or finders) rise after the stamp. */
const AFTER_STAMP_MS = 250;

function Faces({
  ids,
  players,
}: {
  ids: readonly string[];
  players: readonly ViewPlayer[];
}): JSX.Element {
  return (
    <span className={styles.faces}>
      {ids.map((id, i) => {
        const p = players.find((x) => x.id === id);
        return (
          <span key={id} className={styles.face} style={{ ['--i' as string]: i }}>
            <Avatar avatarId={p?.avatarId ?? 'ghost'} size="calc(var(--pb-space-8) * 1.35)" />
            <span className={styles.faceName}>{p?.name ?? '?'}</span>
          </span>
        );
      })}
    </span>
  );
}

/** Flies the spotlight card in from its slot in the grid (measured, so it works at any zoom). */
function useFlyFromSlot(ref: React.RefObject<HTMLElement | null>, optionId: string): void {
  const reduced = usePrefersReducedMotion();
  useLayoutEffect(() => {
    const el = ref.current;
    const slot = el?.ownerDocument.querySelector<HTMLElement>(`[data-option="${optionId}"]`);
    if (!el || !slot || reduced || typeof el.animate !== 'function') return;
    const to = el.getBoundingClientRect();
    const from = slot.getBoundingClientRect();
    const zoom = el.offsetWidth > 0 ? to.width / el.offsetWidth : 1;
    const dx = (from.left + from.width / 2 - (to.left + to.width / 2)) / zoom;
    const dy = (from.top + from.height / 2 - (to.top + to.height / 2)) / zoom;
    const s = from.width / to.width;
    el.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${s}) rotateX(0deg)` },
        { transform: 'translate(0, -12px) scale(1.04) rotateX(10deg)', offset: 0.6 },
        { transform: 'none' },
      ],
      { duration: 600, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'backwards' },
    );
  }, [ref, optionId, reduced]);
}

function Spotlight({ view, option }: { view: FakeOutTvView; option: RevealedOption }): JSX.Element {
  const L = useT(STRINGS);
  const reveal = view.reveal;
  const stepAt = reveal?.stepAt ?? 0;
  const stampMs = reveal?.stampMs ?? 0;
  const stamped = useAfter(stepAt, stampMs);
  const scored = useAfter(stepAt, stampMs + AFTER_STAMP_MS);
  const card = useRef<HTMLDivElement>(null);
  useFlyFromSlot(card, option.id);
  const key = `${view.n}:${option.id}`;
  const nobody = option.stamp === 'truth' && option.pickers.length === 0;
  useCueOnce(
    option.stamp === 'truth' ? (nobody ? 'bust' : 'jackpot') : 'bust',
    stamped ? key : null,
    option.stamp === 'house' ? 0.6 : 1,
  );
  const line =
    option.stamp === 'truth'
      ? nobody
        ? view.lines.nobody
        : view.lines.truth
      : option.stamp === 'house'
        ? view.lines.house
        : view.lines.itsALie;
  useClipAt(line ?? null, stepAt + stampMs + 180, { staleMs: 800 });
  return (
    <div className={styles.spotlight} data-stamp={stamped ? option.stamp : undefined}>
      <div className={styles.pickedBy}>
        {option.pickers.length > 0 ? (
          <>
            <span className={styles.caption}>{L('picked by')}</span>
            <Faces ids={option.pickers} players={view.players} />
          </>
        ) : (
          <span className={styles.caption}>{L('Nobody picked it')}</span>
        )}
      </div>
      <div className={styles.spotScene}>
        <div ref={card} className={styles.spotCard}>
          <span className={styles.spotText}>
            <ReadAlong read={view.readAlong} pieces={[{ text: option.display.toUpperCase() }]} />
          </span>
          {option.likes > 0 ? (
            <span className={styles.likes} aria-label={L('{n} likes', { n: option.likes })}>
              👍 {option.likes}
            </span>
          ) : null}
          {stamped ? (
            <span className={styles.stamp} data-kind={option.stamp} role="status">
              {option.stamp === 'truth'
                ? L('TRUTH ✓')
                : option.stamp === 'house'
                  ? L('PARTYBOX LIE 🤖')
                  : L('LIE ✗')}
            </span>
          ) : null}
        </div>
      </div>
      <div className={styles.payoff} data-on={scored ? '' : undefined}>
        {scored ? <Payoff view={view} option={option} /> : null}
      </div>
    </div>
  );
}

function Payoff({ view, option }: { view: FakeOutTvView; option: RevealedOption }): JSX.Element {
  const L = useT(STRINGS);
  if (option.stamp === 'house')
    return <span className={styles.payLine}>{L('Nobody scores for this one')}</span>;
  if (option.stamp === 'truth') {
    if (option.pickers.length === 0)
      return <span className={styles.payLine}>{L('Nobody found the truth!')}</span>;
    return (
      <>
        <Faces ids={option.pickers} players={view.players} />
        <span className={styles.points}>{L('+{pts} each', { pts: option.each })}</span>
      </>
    );
  }
  const per = option.pickers.length > 0 ? option.each / option.pickers.length : 0;
  const sum =
    option.pickers.length > 1
      ? `+${per} × ${option.pickers.length} = +${option.each}`
      : `+${option.each}`;
  return (
    <>
      <span className={styles.caption}>{L('written by')}</span>
      <Faces ids={option.authors} players={view.players} />
      <span className={styles.points}>{sum}</span>
    </>
  );
}

function Unpicked({ view }: Props): JSX.Element {
  const L = useT(STRINGS);
  return (
    <div className={styles.unpicked}>
      <p className={styles.callout}>{L('Nobody fell for…')}</p>
      <ul className={styles.unpickedList}>
        {(view.reveal?.unpicked ?? []).map((u, i) => (
          <li key={u.display} className={styles.unpickedItem} style={{ ['--i' as string]: i }}>
            <span className={styles.unpickedText}>{u.display.toUpperCase()}</span>
            <Faces ids={u.authors} players={view.players} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TvReveal({ view }: Props): JSX.Element {
  const L = useT(STRINGS);
  const reveal = view.reveal;
  useCueOnce('reveal', `reveal${view.n}`);
  useClipAt(view.reading?.url ?? null, view.reading?.at ?? 0);
  const shown = useMemo(
    () => new Map((reveal?.shown ?? []).map((o) => [o.id, o])),
    [reveal?.shown],
  );
  const current = reveal?.kind === 'option' ? reveal.shown[reveal.shown.length - 1] : undefined;
  const filled = reveal?.kind === 'fact' || reveal?.kind === 'unpicked';
  return (
    <Stage
      className={`${styles.round} ${styles.revealRound} ${reveal?.kind === 'fact' ? styles.revealFact : ''}`}
    >
      <p className={`${styles.kicker} ${view.final ? styles.kickerFinal : ''}`}>
        {kicker(L, view)}
      </p>
      <div className={styles.factPanel} data-hidden={reveal?.kind === 'fact' ? '' : undefined}>
        <FactCard fact={view.fact} size="h2" filled={filled} />
      </div>
      <div className={styles.revealArea}>
        {current ? (
          <Spotlight key={`${reveal?.step}:${reveal?.stepAt}`} view={view} option={current} />
        ) : null}
        {reveal?.kind === 'fact' ? (
          <div className={styles.completed} key="fact">
            <FactCard fact={view.fact} size="h1" filled read={view.readAlong} />
          </div>
        ) : null}
        {reveal?.kind === 'unpicked' ? <Unpicked view={view} /> : null}
      </div>
      <Deck options={view.options} shown={shown} spotlight={current?.id ?? null} />
    </Stage>
  );
}
