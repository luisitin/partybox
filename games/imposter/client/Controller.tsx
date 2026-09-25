// Phone for Imposter: one screen per phase. Stage moments show "👀 Watch the TV" on at-TV phones;
// in a phone-only room the shell swaps in PhoneStage for the paced reveals, and the moments with
// VIP buttons (intro, word reveal, scores) stage inline here so the VIP keeps them.
import type { JSX } from 'react';
import { Screen, WaitingScreen, useT } from '@partybox/game-sdk/ui';
import { PhoneDeal } from './PhoneCards';
import type { Props } from './PhoneCards';
import { PhoneClue } from './PhoneClue';
import { PhoneAfter, PhoneLast } from './PhoneMoments';
import { PhoneStageBody } from './PhoneStage';
import { PhoneTalk, PhoneVote } from './PhoneVote';
import { useSay } from './helpers';
import { STRINGS } from './strings';
import styles from './phone.module.css';

export function Controller(props: Props): JSX.Element {
  const { view } = props;
  const L = useT(STRINGS);
  // A phone that stages the show also speaks it (phone-only rooms; remote phones with F4's P2).
  useSay(view.stage.say, view.phoneOnly === true);
  if (!view.seated)
    return (
      <WaitingScreen
        title={L('You joined mid-game')}
        hint={view.phoneOnly ? undefined : L('Watch the TV — you are in the next game.')}
        mood="watch"
      >
        {view.phoneOnly ? <PhoneStageBody view={view} /> : null}
      </WaitingScreen>
    );
  switch (view.phaseId) {
    case 'deal':
      return <PhoneDeal {...props} />;
    case 'clue':
      return <PhoneClue {...props} />;
    case 'talk':
      return <PhoneTalk {...props} />;
    case 'vote':
    case 'runoff':
      return view.ballot ? (
        <PhoneVote {...props} />
      ) : (
        <WaitingScreen title={L('Voting…')} mood="wait" />
      );
    case 'lastChance':
      return <PhoneLast {...props} />;
    case 'wordReveal':
    case 'scores':
      return <PhoneAfter {...props} />;
    default:
      // The reveal moments live on every phone too (design review [a0c548] 2: no dead hands),
      // on the same server beat as the TV, so nothing is spoiled.
      return (
        <Screen>
          <div className={styles.stageCenter}>
            {view.phoneOnly ? null : <p className={styles.sayLine}>👀 {L('Watch the TV')}</p>}
            <PhoneStageBody view={view} />
          </div>
        </Screen>
      );
  }
}
