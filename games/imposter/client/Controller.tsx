// Phone for Imposter: one screen per phase. Stage moments show "👀 Watch the TV" on at-TV phones;
// in a phone-only room the shell swaps in PhoneStage for the paced reveals, and the moments with
// VIP buttons (intro, word reveal, scores) stage inline here so the VIP keeps them.
import type { JSX } from 'react';
import { PrimaryButton, Screen, WaitingScreen, useT } from '@partybox/game-sdk/ui';
import { PhoneDeal } from './PhoneCards';
import type { Props } from './PhoneCards';
import { PhoneClue } from './PhoneClue';
import { PhoneAfter, PhoneLast } from './PhoneMoments';
import { PhoneStageBody } from './PhoneStage';
import { PhoneTalk, PhoneVote } from './PhoneVote';
import { useSay } from './helpers';
import { STRINGS } from './strings';
import styles from './phone.module.css';

function Intro({ view, skip }: Props): JSX.Element {
  const L = useT(STRINGS);
  return (
    <Screen
      footer={skip ? <PrimaryButton onClick={skip}>{L("Let's go")}</PrimaryButton> : undefined}
    >
      <p className={styles.glyph} aria-hidden="true">
        🕵️
      </p>
      <h2 className={styles.title}>{L('How to play')}</h2>
      <PhoneStageBody view={{ ...view, phaseId: 'intro' }} />
    </Screen>
  );
}

export function Controller(props: Props): JSX.Element {
  const { view } = props;
  const L = useT(STRINGS);
  // A phone that stages the show also speaks it (phone-only rooms; remote phones with F4's P2).
  useSay(view.stage.say, view.phoneOnly === true);
  if (!view.seated && view.phaseId !== 'intro')
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
    case 'intro':
      return <Intro {...props} />;
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
      return (
        <WaitingScreen
          title={view.phoneOnly ? L('Here it comes…') : `👀 ${L('Watch the TV')}`}
          mood="watch"
        >
          {view.phoneOnly ? <PhoneStageBody view={view} /> : null}
        </WaitingScreen>
      );
  }
}
