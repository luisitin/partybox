// In a phone-only room (S-005, P00 §3.6) the phones show the TV's moments — intro, reveal,
// scores: a horizontal dial with the zones, the markers and the needle, the verdict and a compact
// score list. Every spoken line is also written here, and the reader plays on the phone.
import type { JSX } from 'react';
import { Avatar, Screen, useT } from '@partybox/game-sdk/ui';
import type { ControllerView, PushedView } from '@partybox/game-sdk/ui';
import { DialStrip } from '@partybox/game-sdk/ui/dial';
import type { TuneControllerView } from '../server/index';
import { avatarOf, ratingText, roundLine, teamName, verdictText } from './copy';
import { PhoneIntro } from './Controller';
import styles from './phone.module.css';
import { STRINGS } from './strings';
import { useReading } from './useReading';

function Board({ view }: { view: TuneControllerView }): JSX.Element {
  const L = useT(STRINGS);
  if (view.turn.mode === 'teams')
    return (
      <p className={styles.total}>
        {`${teamName(L, 'sun')} ${view.team.sun} · ${teamName(L, 'moon')} ${view.team.moon}`}
        {' · '}
        {L('First to {n}', { n: view.winAt })}
      </p>
    );
  if (view.turn.mode === 'coop' && view.coop)
    return (
      <p className={styles.total}>
        {L('Group {total} / {max}', { total: view.coop.total, max: view.coop.max })}
        {'\u00a0· '}
        {ratingText(L, view.coop.rating)}
      </p>
    );
  const rows = [...view.players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return (
    <ol className={styles.board}>
      {rows.map((p) => (
        <li key={p.id} className={p.id === view.me.id ? styles.boardMe : undefined}>
          <Avatar avatarId={p.avatarId} size={24} />
          <span className={styles.boardName}>{p.name}</span>
          <span className={styles.boardScore}>{p.score ?? 0}</span>
        </li>
      ))}
    </ol>
  );
}

export function PhoneStage({ view: raw }: { view: PushedView<ControllerView> }): JSX.Element {
  const L = useT(STRINGS);
  const view = raw as unknown as TuneControllerView;
  useReading(view.reading);
  if (view.phaseId === 'intro') return <PhoneIntro view={view} />;
  const reveal = view.reveal;
  const points = reveal !== undefined && (reveal.step === 1 || view.phaseId !== 'reveal');
  const marks = (reveal?.revealDials ?? []).map((d) => ({
    id: d.id,
    pos: d.pos,
    avatarId: avatarOf(view.players, d.id),
    pts: view.turn.mode === 'solo' ? d.pts : null,
  }));
  return (
    <Screen className={styles.screen}>
      <p className={styles.kicker}>{roundLine(L, view.turn)}</p>
      {reveal?.void ? (
        <p className={styles.clue}>{L('📺 No signal!')}</p>
      ) : (
        <>
          <p className={styles.clue}>“{view.turn.clue}”</p>
          <DialStrip
            left={view.turn.left}
            right={view.turn.right}
            target={reveal?.bullseyeAt ?? null}
            bands={view.turn.bands}
            marks={marks}
            needle={reveal?.needle ?? null}
            showPoints={points}
          />
          {points ? (
            <p className={styles.verdict}>{verdictText(L, reveal?.verdict ?? null)}</p>
          ) : null}
        </>
      )}
      {view.phaseId === 'scores' ? <Board view={view} /> : null}
    </Screen>
  );
}
