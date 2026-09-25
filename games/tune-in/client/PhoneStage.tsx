// In a phone-only room (S-005, P00 §3.6) the phones show the TV's reveal: a horizontal dial with
// the zones, markers, needle and verdict. The score beat returns to Controller so the VIP can
// advance the game without waiting for the timer.
import type { JSX } from 'react';
import { Screen, useT } from '@partybox/game-sdk/ui';
import type { ControllerView, PushedView } from '@partybox/game-sdk/ui';
import { DialStrip } from '@partybox/game-sdk/ui/dial';
import type { TuneControllerView } from '../server/index';
import { avatarOf, englishClueNote, roundLine, verdictText } from './copy';
import { useEnds } from './ends';
import styles from './phone.module.css';
import { STRINGS } from './strings';
import { useReading } from './useReading';

export function PhoneStage({ view: raw }: { view: PushedView<ControllerView> }): JSX.Element {
  const L = useT(STRINGS);
  const view = useEnds(raw as unknown as TuneControllerView);
  useReading(view.reading);
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
          {englishClueNote(L, view.turn) ? (
            <p className={styles.clueNote}>{englishClueNote(L, view.turn)}</p>
          ) : null}
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
    </Screen>
  );
}
