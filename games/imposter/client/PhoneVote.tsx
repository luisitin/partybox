// Phone during "talk" (everyone's clues as a list; the VIP gets Start the vote) and "vote" /
// "runoff" (FacePicker, never self; "Pick 2" with two imposters; Vote unlocks at exactly the right
// count; after voting, "Voted" with Change). The same screen for crew and imposter.
import { useState } from 'react';
import type { JSX } from 'react';
import { Avatar, PrimaryButton, Screen, useT } from '@partybox/game-sdk/ui';
import { FacePicker } from '@partybox/game-sdk/ui/face-picker';
import type { Props } from './PhoneCards';
import { byId, cluesOf } from './shared';
import { STRINGS } from './strings';
import styles from './phone.module.css';

export function PhoneTalk({ view, skip }: Props): JSX.Element {
  const L = useT(STRINGS);
  const who = byId(view.players);
  return (
    <Screen
      footer={
        skip ? <PrimaryButton onClick={skip}>{L('Start the vote')}</PrimaryButton> : undefined
      }
    >
      <h2 className={styles.title}>{L("Talk it over. Who's faking?")}</h2>
      <div className={styles.listFrame}>
        <ul className={`${styles.clueList} ${styles.tiles}`}>
          {view.stage.board.map((c) => {
            const p = who.get(c.by);
            const clues = cluesOf(view.stage, c.by);
            return (
              <li key={c.by} className={c.by === view.me.id ? styles.meRow : ''}>
                {p ? <Avatar avatarId={p.avatarId} size="2.25rem" /> : null}
                <span className={styles.rowName}>{p?.name ?? '?'}</span>
                <span className={styles.rowClue}>{clues.length ? clues.join(' · ') : '—'}</span>
              </li>
            );
          })}
        </ul>
      </div>
      {!skip ? <p className={styles.hint}>{L('The VIP starts the vote.')}</p> : null}
    </Screen>
  );
}

export function PhoneVote({ view, send }: Props): JSX.Element {
  const L = useT(STRINGS);
  const b = view.ballot;
  const who = byId(view.players);
  const voted = view.mine.vote;
  const [picked, setPicked] = useState<string[] | null>(null);
  const [editing, setEditing] = useState(false);
  if (!b) return <Screen>{null}</Screen>;
  const selected = picked ?? voted ?? [];
  const locked = voted !== null && !editing;
  const runoff = view.phaseId === 'runoff';
  const ready = selected.length === b.picks;
  const options = b.candidates.map((id) => {
    const p = who.get(id);
    const clues = cluesOf(view.stage, id);
    return {
      id,
      name: p?.name ?? '?',
      avatarId: p?.avatarId ?? '',
      detail: clues.length ? clues.join(' · ') : '—',
    };
  });
  return (
    <Screen
      footer={
        locked ? (
          <PrimaryButton tone="neutral" onClick={() => setEditing(true)}>
            {L('Change')}
          </PrimaryButton>
        ) : (
          <PrimaryButton
            disabled={!ready}
            onClick={() => {
              if (!ready) return;
              send({ type: 'vote', targets: selected });
              setEditing(false);
            }}
          >
            {b.picks > 1 ? L('Vote for these 2') : L('Vote')}
          </PrimaryButton>
        )
      }
    >
      <h2 className={styles.voteHead}>
        <span className={styles.kicker}>
          {runoff ? L('Tie! Vote again') : L('Who is the imposter?')}
        </span>
        <span>{locked ? L('Voted ✓') : b.picks > 1 ? L('Pick 2') : L('Pick 1')}</span>
      </h2>
      <FacePicker
        label={L('Suspects')}
        options={options}
        selected={selected}
        picks={b.picks}
        locked={locked}
        onChange={(ids) => setPicked(ids)}
      />
      <p className={`${styles.hint} ${styles.tallOnly}`}>
        {L('Press and hold a face to read all their clues.')}
      </p>
    </Screen>
  );
}
