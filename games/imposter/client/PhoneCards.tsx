// The phone's secret: the deal card (full SecretCard) and the clue screen's 56 px strip. Crew and
// imposter phones share one back, one prompt, one layout and one set of haptics (SPEC §1.5) — a
// glance at a neighbour's phone must not give the role away.
import type { JSX } from 'react';
import { PrimaryButton, Screen, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import { SecretCard, useSecretCardMode } from '@partybox/game-sdk/ui/secret-card';
import type { ImposterControllerView } from '../server/index';
import type { Input } from '../server/types';
import { EnMark } from './en';
import { STRINGS } from './strings';
import styles from './phone.module.css';

export type Props = GameControllerProps<ImposterControllerView, Input>;

function Face({ view, mini }: { view: Props['view']; mini: boolean }): JSX.Element {
  const L = useT(STRINGS);
  const cat = view.catLabel
    ? L('Category: {c}', { c: L.sent(view.catLabel) })
    : L('No hint this round');
  if (view.role === 'imposter') {
    if (mini)
      return (
        <span className={styles.miniFace}>
          <b>{L('IMPOSTER')} 🕵️</b>
          <span>{view.catLabel ? L.sent(view.catLabel) : L('No hint')}</span>
        </span>
      );
    return (
      <>
        <span className={styles.faceCaption}>{L("You're the")}</span>
        <span className={styles.faceWord}>{L('IMPOSTER')} 🕵️</span>
        <span className={styles.faceCat}>{cat}</span>
        <span className={styles.faceHint}>{L("Blend in. Don't get caught.")}</span>
        {view.stage.imposterCount > 1 ? (
          <span className={styles.faceHint}>
            {L("There are 2 imposters. You don't know the other one.")}
          </span>
        ) : null}
      </>
    );
  }
  const word = view.word?.answer ?? '';
  if (mini)
    return (
      <span className={styles.miniFace}>
        <b>{word}</b>
      </span>
    );
  return (
    <>
      <span className={styles.faceCaption}>{L('Your word')}</span>
      <span className={styles.faceWord}>{word}</span>
      <EnMark />
    </>
  );
}

export function PhoneSecret({
  view,
  mini = false,
}: {
  view: Props['view'];
  mini?: boolean;
}): JSX.Element {
  const L = useT(STRINGS);
  const mode = useSecretCardMode();
  return (
    <SecretCard
      size={mini ? 'mini' : 'full'}
      label={L('Your secret card')}
      backLabel={mini ? L('Hold to peek') : L('Hold to see your word')}
      backHint={
        mode === 'tap'
          ? L('Tap to see it; it hides again by itself')
          : L('Keep it close — neighbors peek')
      }
    >
      <Face view={view} mini={mini} />
    </SecretCard>
  );
}

export function PhoneDeal({ view, send }: Props): JSX.Element {
  const L = useT(STRINGS);
  const s = view.stage;
  const ready = view.mine.ready;
  return (
    <Screen
      footer={
        <PrimaryButton done={ready} onClick={() => !ready && send({ type: 'ready' })}>
          {L('Got it')}
        </PrimaryButton>
      }
    >
      <p className={styles.kicker}>{L('Round {n} of {of}', { n: s.round, of: s.rounds })}</p>
      <h2 className={styles.title}>{L('Your secret card')}</h2>
      <PhoneSecret view={view} />
      <p className={styles.hint} aria-live="polite">
        {ready ? L('Waiting for the others…') : ' '}
      </p>
    </Screen>
  );
}
