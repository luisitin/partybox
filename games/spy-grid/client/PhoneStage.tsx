// PhoneStage (S-005, SPEC §9.5): in a phone-only room the phones play the TV's moments — the card
// turning big with what it is, the turn's summary, and the whole key at the end — with the reader.
import type { JSX } from 'react';
import { Screen, useT } from '@partybox/game-sdk/ui';
import type { ControllerView, PushedView } from '@partybox/game-sdk/ui';
import type { SpyControllerView } from '../server/views';
import { SHAPE, other } from './model';
import { useVoice } from './moments';
import { ClueLine, PhoneBoard, Scores } from './PhoneParts';
import { KIND_ICON } from './WordGrid';
import styles from './Controller.module.css';
import stage from './PhoneStage.module.css';
import { STRINGS } from './strings';

export function PhoneStage({ view: pushed }: { view: PushedView<ControllerView> }): JSX.Element {
  const view = pushed as unknown as PushedView<SpyControllerView>;
  const L = useT(STRINGS);
  useVoice(view);
  const card = view.flipping?.card ?? null;
  const kind = card === null ? null : view.kinds[card];
  const name = (t: 'sun' | 'moon'): string => (t === 'sun' ? L('Sun') : L('Moon'));
  const whatIs =
    kind === 'assassin'
      ? L('Assassin!')
      : kind === 'bystander'
        ? L('Bystander.')
        : kind
          ? kind === view.turnTeam
            ? L('Agent!')
            : L('Enemy agent!')
          : '';
  return (
    <Screen className={styles.screen}>
      <div className={styles.stack}>
        <Scores view={view} />
        {view.phaseId === 'flip' && card !== null ? (
          <div className={`${stage.big} ${kind ? stage[kind] : ''}`} key={card}>
            <div className={stage.inner}>
              <div className={stage.front}>{view.words[card]}</div>
              <div className={stage.back}>
                <span className={stage.icon}>{kind ? KIND_ICON[kind] : ''}</span>
                <span className={stage.word}>{view.words[card]}</span>
                <span className={stage.what}>{whatIs}</span>
              </div>
            </div>
          </div>
        ) : null}
        {view.phaseId === 'turn-end' ? (
          <div className={styles.watch}>
            {view.mode === 'coop'
              ? L('Next clue…')
              : L("{shape} {team}'s turn", {
                  shape: SHAPE[other(view.turnTeam)],
                  team: name(other(view.turnTeam)),
                })}
          </div>
        ) : null}
        {view.phaseId === 'win' ? (
          <div className={styles.result}>
            <div className={styles.resultHead}>
              {view.mode === 'coop'
                ? view.winner === 'sun'
                  ? L('Mission complete! 🕶️')
                  : L('Mission failed')
                : view.winner === 'sun' || view.winner === 'moon'
                  ? L('{shape} {team} wins!', {
                      shape: SHAPE[view.winner],
                      team: name(view.winner),
                    })
                  : L("It's a draw")}
            </div>
          </div>
        ) : null}
        <ClueLine view={view} />
        <PhoneBoard view={view} />
      </div>
    </Screen>
  );
}
