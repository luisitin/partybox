// A clue-giver's phone during `check` (§7.4, §7.6): every clue as a row without authors. An echo
// is struck through and bracketed, with Not the same ✋; a survivor has Same word ✋ (tap it, then
// the clue it matches). A split pair can be put back. Any tap applies at once for everyone; the
// sticky Looks good ends it for this phone.
import { useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, Screen, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { CheckRow, EchoControllerView } from '../server/views';
import { STRINGS } from './strings';
import styles from './phone.module.css';
import check from './check.module.css';

export function PhoneCheck({
  view,
  send,
}: GameControllerProps<EchoControllerView, Input>): JSX.Element {
  const L = useT(STRINGS);
  const [pick, setPick] = useState<string | null>(null);
  const rows = view.check?.rows ?? [];
  const ok = view.check?.ok === true;
  // A picked row that vanished (someone else joined it) is dropped.
  const picked =
    pick && rows.some((r) => r.id === pick && !r.echo && r.texts.length === 1) ? pick : null;
  const tapSame = (row: CheckRow): void => {
    if (picked === null) setPick(row.id);
    else if (picked === row.id) setPick(null);
    else {
      send({ type: 'join', a: picked, b: row.id });
      setPick(null);
    }
  };
  const echoes = rows.filter((r) => r.echo).length;
  return (
    <Screen
      className={styles.screen}
      footer={
        <PrimaryButton done={ok} disabled={ok} onClick={() => send({ type: 'ok' })}>
          {L('Looks good')}
        </PrimaryButton>
      }
    >
      <div className={styles.stack}>
        <p className={styles.kicker}>{L('Check the echoes')}</p>
        <p className={styles.hint}>
          {echoes > 0
            ? L('Struck-through clues vanish. Tap if the game got one wrong.')
            : L('No echoes. Tap Same word if two clues really match.')}
        </p>
        {picked ? <p className={check.picking}>{L('Now tap the clue it matches')}</p> : null}
        <ul className={check.list}>
          {rows.map((row) => {
            const multi = row.texts.length > 1;
            return (
              <li
                key={row.id}
                className={check.row}
                data-echo={row.echo ? '1' : '0'}
                data-multi={multi ? '1' : '0'}
                data-picked={picked === row.id ? '1' : '0'}
              >
                <span className={check.texts}>
                  {row.texts.map((t, i) => (
                    <span key={`${t}:${i}`} className={row.echo ? check.struck : check.text}>
                      {t}
                    </span>
                  ))}
                  {row.echo ? <span className={check.tag}>{L('🔇 echo')}</span> : null}
                  {!row.echo && multi ? <span className={check.tag}>{L('Kept apart')}</span> : null}
                </span>
                {row.echo ? (
                  <button
                    type="button"
                    className={check.act}
                    onClick={() => send({ type: 'split', group: row.id })}
                  >
                    {L('Not the same ✋')}
                  </button>
                ) : multi ? (
                  <button
                    type="button"
                    className={check.act}
                    onClick={() => send({ type: 'split', group: row.id })}
                  >
                    {L('Undo')}
                  </button>
                ) : (
                  <button
                    type="button"
                    className={check.act}
                    data-on={picked === row.id ? '1' : '0'}
                    disabled={rows.length < 2}
                    onClick={() => tapSame(row)}
                  >
                    {picked === row.id ? L('Cancel') : L('Same word ✋')}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </Screen>
  );
}
