// Every phone during `result`. At the TV: "👀 Watch the TV" until the TV has shown the mark, then
// one line ("✓ Got it! 7 won so far"). Without a TV (phone-only room) the phone is the stage: the
// word, the guess and its mark, every clue with its author. The VIP's phone carries ✓ That counts
// (only on a guess judged wrong) and Next word / See results.
import type { JSX } from 'react';
import { PrimaryButton, Screen, usePhoneOnly, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { EchoControllerView } from '../server/views';
import { PhoneDeck } from './PhoneWait';
import { PHONE_LINE_AFTER, RESULT } from './timing';
import { usePhaseBeat } from './usePhaseBeat';
import { useLine } from './useLine';
import { STRINGS } from './strings';
import styles from './phone.module.css';
import check from './check.module.css';

export function PhoneResult(props: GameControllerProps<EchoControllerView, Input>): JSX.Element {
  const { view, send, skip, me } = props;
  const L = useT(STRINGS);
  const phoneOnly = usePhoneOnly();
  const r = view.tv.result;
  const beat = usePhaseBeat(view.tv.phaseAt, [0, phoneOnly ? RESULT.mark : PHONE_LINE_AFTER]);
  // No TV: the phone reads the lines itself.
  useLine(view.tv.say[0], RESULT.word, view.tv.phaseAt, phoneOnly);
  useLine(view.tv.say[1], RESULT.mark, view.tv.phaseAt, phoneOnly);
  const vip = view.vip === me.id;
  const footer = vip ? (
    <div className={styles.footerRow} data-two={view.canCount ? '1' : '0'}>
      {view.canCount ? (
        <button type="button" className={styles.ghost} onClick={() => send({ type: 'countGuess' })}>
          {L('✓ That counts')}
        </button>
      ) : null}
      {skip ? (
        <PrimaryButton onClick={skip}>{L(view.vipSkipLabel ?? 'Next word')}</PrimaryButton>
      ) : null}
    </div>
  ) : undefined;
  if (!r) return <Screen className={styles.screen}>{null}</Screen>;
  const won = view.tv.counts.won;
  const line =
    r.outcome === 'right'
      ? won === 1
        ? L('✓ Got it! 1 won so far')
        : L('✓ Got it! {n} won so far', { n: won })
      : r.outcome === 'wrong'
        ? r.burned
          ? L('✗ Not quite. The next word burned too')
          : r.unwon
            ? L('✗ Not quite. It cost a word we had won')
            : L('✗ Not quite')
        : L('Pass. On to the next');
  const icon = r.outcome === 'right' ? '🎉' : r.outcome === 'wrong' ? '💥' : '↷';
  if (beat < 1 && !phoneOnly) {
    return (
      <Screen className={styles.screen} footer={footer}>
        <div className={`${styles.stack} ${styles.center}`}>
          <p className={styles.bigIcon}>👀</p>
          <p className={styles.line}>{L('Watch the TV')}</p>
        </div>
      </Screen>
    );
  }
  return (
    <Screen className={styles.screen} footer={footer}>
      <div className={`${styles.stack} ${styles.center}`}>
        {phoneOnly ? (
          <>
            <p className={styles.hint}>{L('The word was')}</p>
            <p className={styles.word}>{r.word}</p>
          </>
        ) : (
          <p className={styles.bigIcon}>{icon}</p>
        )}
        {beat >= 1 ? (
          <p className={styles.line} data-outcome={r.outcome}>
            {line}
          </p>
        ) : null}
        {r.byVip ? <p className={styles.kicker}>{L('Counted by the VIP')}</p> : null}
        {phoneOnly && beat >= 1 ? (
          <ul className={check.list}>
            {r.clues.map((c, i) => (
              <li key={`${c.by}:${i}`} className={check.row} data-echo={c.echo ? '1' : '0'}>
                <span className={c.echo ? check.struck : check.text}>{c.text}</span>
                <span className={check.tag}>
                  {view.players.find((p) => p.id === c.by)?.name ?? ''}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        <PhoneDeck view={view} />
      </div>
    </Screen>
  );
}
