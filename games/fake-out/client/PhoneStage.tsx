// PhoneStage (SPEC §3.4): in a phone-only room the reveal becomes a vertical feed on every phone —
// option, pickers, stamp, authors — with the completed fact at the end, voiced like the TV (phones
// in these rooms play clips). Each card's stamp lands on the same server beat as on a TV.
import { useEffect, useRef } from 'react';
import type { JSX } from 'react';
import { Avatar, Screen, useT } from '@partybox/game-sdk/ui';
import type { ControllerView, PushedView, ViewPlayer } from '@partybox/game-sdk/ui';
import type { FakeOutControllerView, RevealedOption } from '../server/index';
import { useAfter, useClipAt, useCueOnce } from './beats';
import { FactCard } from './FactCard';
import { momentText, useShownMoments } from './PhoneScreens';
import { STRINGS } from './strings';
import styles from './phone.module.css';

function Faces({
  ids,
  players,
}: {
  ids: readonly string[];
  players: readonly ViewPlayer[];
}): JSX.Element {
  return (
    <span className={styles.feedFaces}>
      {ids.map((id) => {
        const p = players.find((x) => x.id === id);
        return (
          <span key={id} className={styles.feedFace}>
            <Avatar avatarId={p?.avatarId ?? 'ghost'} size="var(--pb-space-6)" />
            {p?.name ?? '?'}
          </span>
        );
      })}
    </span>
  );
}

function FeedCard({
  view,
  option,
  live,
}: {
  view: PushedView<FakeOutControllerView>;
  option: RevealedOption;
  live: boolean;
}): JSX.Element {
  const L = useT(STRINGS);
  const stepAt = view.reveal?.stepAt ?? 0;
  const stampMs = view.reveal?.stampMs ?? 0;
  const landed = useAfter(stepAt, stampMs);
  const stamped = !live || landed;
  const nobody = option.stamp === 'truth' && option.pickers.length === 0;
  useCueOnce(
    live ? (option.stamp === 'truth' && !nobody ? 'jackpot' : 'bust') : null,
    live && landed ? `${view.n}:${option.id}` : null,
    0.7,
  );
  const line =
    option.stamp === 'truth'
      ? nobody
        ? view.lines.nobody
        : view.lines.truth
      : option.stamp === 'house'
        ? view.lines.house
        : view.lines.itsALie;
  useClipAt(live ? (line ?? null) : null, stepAt + stampMs + 180, { staleMs: 800 });
  return (
    <li className={styles.feedCard} data-stamp={stamped ? option.stamp : undefined}>
      <span className={styles.feedText}>{option.display.toUpperCase()}</span>
      <span className={styles.feedMeta}>
        {option.pickers.length > 0 ? (
          <>
            {L('picked by')} <Faces ids={option.pickers} players={view.players} />
          </>
        ) : (
          L('Nobody picked it')
        )}
      </span>
      {stamped ? (
        <span className={styles.feedStamp} data-kind={option.stamp}>
          {option.stamp === 'truth'
            ? L('TRUTH ✓')
            : option.stamp === 'house'
              ? L('PARTYBOX LIE 🤖')
              : L('LIE ✗')}
        </span>
      ) : null}
      {stamped && option.stamp === 'lie' ? (
        <span className={styles.feedMeta}>
          {L('written by')} <Faces ids={option.authors} players={view.players} /> · +{option.each}
        </span>
      ) : null}
      {stamped && option.stamp === 'truth' && option.pickers.length > 0 ? (
        <span className={styles.feedMeta}>{L('+{pts} each', { pts: option.each })}</span>
      ) : null}
    </li>
  );
}

export function PhoneStage(props: { view: PushedView<ControllerView> }): JSX.Element {
  const view = props.view as PushedView<FakeOutControllerView>;
  const L = useT(STRINGS);
  const reveal = view.reveal;
  const moments = useShownMoments(view);
  useClipAt(view.reading?.url ?? null, view.reading?.at ?? 0);
  const end = useRef<HTMLDivElement>(null);
  const count = reveal?.shown.length ?? 0;
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [count, reveal?.kind]);
  const filled = reveal?.kind === 'fact' || reveal?.kind === 'unpicked';
  return (
    <Screen className={styles.screen}>
      <FactCard
        fact={view.fact}
        size="phone"
        filled={filled}
        read={reveal?.kind === 'fact' ? view.readAlong : undefined}
        className={styles.factSmall}
      />
      <ul className={styles.feed}>
        {(reveal?.shown ?? []).map((o, i) => (
          <FeedCard
            key={o.id}
            view={view}
            option={o}
            live={reveal?.kind === 'option' && i === (reveal?.shown.length ?? 0) - 1}
          />
        ))}
      </ul>
      {reveal?.kind === 'unpicked' ? (
        <div className={styles.feedUnpicked}>
          <p className={styles.feedUnpickedTitle}>{L('Nobody fell for…')}</p>
          {reveal.unpicked.map((u) => (
            <p key={u.display} className={styles.feedMeta}>
              {u.display.toUpperCase()} · <Faces ids={u.authors} players={view.players} />
            </p>
          ))}
        </div>
      ) : null}
      {moments.length > 0 ? (
        <ul className={styles.moments}>
          {moments.map((m) => (
            <li key={`${m.step}:${m.k}`} className={styles.moment} data-k={m.k}>
              {momentText(m, view.players, L)}
            </li>
          ))}
        </ul>
      ) : null}
      <div ref={end} />
    </Screen>
  );
}
