// Phone: the intro, the question read-along, the reveal list and the scores. The phone never
// spoils: a moment appears only once the TV's stamp for it has landed (same server clock).
import type { JSX } from 'react';
import {
  PrimaryButton,
  Scoreboard,
  Screen,
  useCountUp,
  usePhoneOnly,
  useT,
} from '@partybox/game-sdk/ui';
import type { GameControllerProps, Translator, ViewPlayer } from '@partybox/game-sdk/ui';
import type { FakeOutControllerView, Moment } from '../server/index';
import type { Input } from '../server/types';
import { useAfter } from './beats';
import { Countdown } from './Countdown';
import { EnglishNote } from './EnglishNote';
import { FactCard } from './FactCard';
import { STRINGS } from './strings';
import { kicker, whyChip } from './labels';
import styles from './phone.module.css';

type Props = GameControllerProps<FakeOutControllerView, Input>;

/** Mirrors --pb-motion-slow (CSS tokens are not readable from JS). */
const COUNT_MS = 600;

export function HowToPlay(): JSX.Element {
  const L = useT(STRINGS);
  return (
    <ol className={styles.how}>
      {[
        L('A strange true fact appears with a blank. Type a fake answer that sounds real.'),
        L('All answers are mixed with the truth. Pick the one you think is real.'),
        L('Score for finding the truth, and for every player your fake fools.'),
      ].map((step, i) => (
        <li key={i} className={styles.howStep} style={{ ['--i' as string]: i }}>
          <span className={styles.howNo}>{i + 1}</span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

export function PhoneIntro({ view, send, skip }: Props): JSX.Element {
  const L = useT(STRINGS);
  const footer =
    view.goAt !== null ? undefined : !view.meReady ? (
      <PrimaryButton onClick={() => send({ type: 'ready' })}>{L('I’m ready')}</PrimaryButton>
    ) : skip ? (
      <PrimaryButton tone="neutral" onClick={skip}>
        {L('Start now')}
      </PrimaryButton>
    ) : (
      <p className={styles.readyWait}>{L('Ready! Waiting for the others…')}</p>
    );
  if (view.goAt !== null)
    return (
      <Screen className={styles.screen}>
        <div className={styles.countdownScreen}>
          <Countdown goAt={view.goAt} paused={view.paused} big />
        </div>
      </Screen>
    );
  return (
    <Screen className={styles.screen} footer={footer}>
      <p className={styles.introMask} aria-hidden>
        🎭
      </p>
      <h2 className={styles.introTitle}>Fake-Out</h2>
      <HowToPlay />
      <EnglishNote />
    </Screen>
  );
}

export function PhoneQuestion({ view, skip }: Props): JSX.Element {
  const L = useT(STRINGS);
  const phoneOnly = usePhoneOnly();
  return (
    <Screen
      className={styles.screen}
      footer={
        skip ? (
          <PrimaryButton tone="neutral" onClick={skip}>
            {L('Start writing now')}
          </PrimaryButton>
        ) : undefined
      }
    >
      <p className={`${styles.kicker} ${view.final ? styles.kickerFinal : ''}`}>
        {kicker(L, view)}
      </p>
      <FactCard fact={view.fact} size="phone" read={view.readAlong} className={styles.factCard} />
      <p className={styles.getReady}>
        {phoneOnly
          ? L('Think of a fake answer that sounds real…')
          : L('Listen to the TV — then think of a fake answer…')}
      </p>
    </Screen>
  );
}

function names(ids: readonly string[], players: readonly ViewPlayer[], L: Translator): string {
  const list = ids.map((id) => players.find((p) => p.id === id)?.name ?? '?');
  if (list.length <= 1) return list[0] ?? '';
  return L('{a} and {b}', { a: list.slice(0, -1).join(', '), b: list[list.length - 1] ?? '' });
}

export function momentText(m: Moment, players: readonly ViewPlayer[], L: Translator): string {
  const lie = m.display.toUpperCase();
  switch (m.k) {
    case 'fell':
      return L("You fell for {who}'s {lie}", { who: names(m.who, players, L), lie });
    case 'house':
      return L('You fell for a PartyBox lie: {lie}', { lie });
    case 'found':
      return L('You found the truth! +{pts}', { pts: m.pts });
    case 'fooled':
      return L('Your {lie} fooled {who} +{pts}', {
        lie,
        who: names(m.who, players, L),
        pts: m.pts,
      });
    case 'nobody':
      return L('Nobody fell for your {lie}', { lie });
  }
}

/** The moments the TV has already stamped: earlier steps, and this step once its stamp landed. */
export function useShownMoments(view: FakeOutControllerView): Moment[] {
  const step = view.reveal?.step ?? -1;
  const landed = useAfter(view.reveal?.stepAt ?? 0, view.reveal?.stampMs ?? 0);
  return view.moments.filter((m) => m.step < step || (m.step === step && landed));
}

export function PhoneReveal({ view }: Props): JSX.Element {
  const L = useT(STRINGS);
  const shown = useShownMoments(view);
  return (
    <Screen className={styles.screen}>
      <div className={styles.watch} role="status">
        <span className={styles.eyes} aria-hidden>
          👀
        </span>
        <h2 className={styles.watchTitle}>{L('Watch the TV')}</h2>
      </div>
      <ul className={styles.moments} aria-live="polite">
        {shown.map((m) => (
          <li key={`${m.step}:${m.k}`} className={styles.moment} data-k={m.k}>
            {momentText(m, view.players, L)}
          </li>
        ))}
      </ul>
    </Screen>
  );
}

export function PhoneScores({ view, me, skip }: Props): JSX.Element {
  const L = useT(STRINGS);
  const last = view.n >= view.total;
  const delta = useCountUp(view.myDelta, 0, COUNT_MS);
  const score = useCountUp(view.myScore, view.myScore - view.myDelta, COUNT_MS);
  const tied =
    view.standings.length > 1 && view.standings.every((s) => s.score === view.standings[0]?.score);
  const place = tied
    ? L('all tied')
    : L('#{rank} of {count}', { rank: view.myRank, count: view.standings.length });
  const rows = view.standings.map((r) => {
    const p = view.players.find((x) => x.id === r.playerId);
    return {
      ...r,
      name: p?.name ?? '?',
      avatarId: p?.avatarId ?? 'ghost',
      connected: p?.connected ?? false,
    };
  });
  return (
    <Screen
      className={styles.screen}
      footer={
        skip ? (
          <PrimaryButton onClick={skip}>
            {last ? L('See results') : L('Next question')}
          </PrimaryButton>
        ) : undefined
      }
    >
      <div className={styles.scoreHero} role="status" aria-live="polite">
        {view.myDelta > 0 ? <p className={styles.delta}>+{delta}</p> : null}
        <h2 className={styles.rankLine}>{L('{place} · {score} points', { place, score })}</h2>
        {view.myWhy.length > 0 ? (
          <p className={styles.whyRow}>
            {view.myWhy.map((w, i) => (
              <span key={i} className={styles.whyChip} data-k={w.k}>
                {whyChip(L, w)}
              </span>
            ))}
          </p>
        ) : (
          <p className={styles.noPoints}>{L('No points this question')}</p>
        )}
      </div>
      <Scoreboard compact highlightId={me.id} rows={rows} noTrophy />
    </Screen>
  );
}
