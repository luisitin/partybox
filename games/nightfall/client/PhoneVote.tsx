// The phone's choices with consequences: the vote (and runoff) — tap a face or No one, then the
// sticky Vote button; the vote can change until the phase ends — the dying hunter's shot (picked,
// then confirmed), and the eliminated player's last words in a remote-text room.
import { useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, Screen, useT } from '@partybox/game-sdk/ui';
import type { NightfallControllerView } from '../server/index';
import type { Input } from '../server/types';
import { FaceGrid } from './FaceGrid';
import { nameOf } from './lookup';
import { WatchTheTv } from './PhoneBits';
import { STRINGS } from './strings';
import styles from './Phone.module.css';

type View = NightfallControllerView;

function facesFor(view: View, ids: readonly string[]) {
  return ids.flatMap((id) => {
    const p = view.players.find((x) => x.id === id);
    return p ? [{ id, name: p.name, avatarId: p.avatarId, connected: p.connected }] : [];
  });
}

export function VotePhone({ view, send }: { view: View; send: (i: Input) => void }): JSX.Element {
  const L = useT(STRINGS);
  const vote = view.vote;
  const key = `${view.phaseId}:${view.day}`;
  const [pick, setPick] = useState<{ key: string; id: string } | null>(null);
  // What this phone sent, until the server's echo arrives: a second tap never sends twice.
  const [sent, setSent] = useState<{ key: string; id: string } | null>(null);
  if (!vote) return <WatchTheTv />;
  const mine = vote.mine ?? (sent && sent.key === key ? sent.id : null);
  const selected = pick && pick.key === key ? pick.id : mine;
  const label = (id: string): string => (id === 'none' ? L('No one') : nameOf(view.players, id));
  const changed = selected !== null && selected !== mine;
  return (
    <Screen
      className={styles.screen}
      footer={
        <PrimaryButton
          done={selected !== null && !changed}
          disabled={selected === null}
          onClick={() => {
            if (!selected || !changed) return;
            setSent({ key, id: selected });
            send({ type: 'vote', target: selected });
          }}
        >
          {selected === null
            ? L('Pick someone to vote out')
            : changed
              ? mine
                ? L('Change my vote to {name}', { name: label(selected) })
                : L('Vote: {name}', { name: label(selected) })
              : L('Voted: {name}', { name: label(selected) })}
        </PrimaryButton>
      }
    >
      <div className={styles.stack}>
        <p className={styles.head}>
          🗳️ {vote.runoff ? L('Runoff: vote again') : L('Who goes? Vote.')}
        </p>
        <p className={styles.status}>{L('Your vote stays secret until the verdict.')}</p>
        <FaceGrid
          faces={facesFor(view, vote.candidates)}
          selected={selected}
          label={L('Vote')}
          extra={{ id: 'none', label: L('No one'), glyph: '🙅' }}
          onPick={(id) => setPick({ key, id })}
        />
      </div>
    </Screen>
  );
}

export function HunterPhone({ view, send }: { view: View; send: (i: Input) => void }): JSX.Element {
  const L = useT(STRINGS);
  const [pick, setPick] = useState<string | null>(null);
  const [fired, setFired] = useState(false);
  const shoot = view.shoot;
  if (!shoot) return <WatchTheTv title={L('The hunter takes aim…')} />;
  const target = pick && shoot.targets.includes(pick) ? pick : null;
  return (
    <Screen
      className={styles.screen}
      footer={
        <PrimaryButton
          tone="danger"
          disabled={target === null}
          done={fired}
          onClick={() => {
            if (!target || fired) return;
            setFired(true);
            send({ type: 'shoot', target });
          }}
        >
          {target
            ? L('🏹 Take {name} down', { name: nameOf(view.players, target) })
            : L('Choose someone')}
        </PrimaryButton>
      }
    >
      <div className={styles.stack}>
        <p className={styles.head}>{L("You're taking someone with you. Choose.")}</p>
        <FaceGrid
          faces={facesFor(view, shoot.targets)}
          selected={target}
          label={L('Choose someone')}
          disabled={fired}
          onPick={setPick}
        />
      </div>
    </Screen>
  );
}

export function LastWordsPhone({
  view,
  send,
}: {
  view: View;
  send: (i: Input) => void;
}): JSX.Element {
  const L = useT(STRINGS);
  const [text, setText] = useState('');
  const [said, setSaid] = useState(false);
  if (!view.speak) {
    const out = view.stage?.lastWords?.by;
    return (
      <WatchTheTv
        title={out ? L('{name}’s last words…', { name: nameOf(view.players, out) }) : undefined}
      />
    );
  }
  const ok = /[\p{L}\p{N}]/u.test(text);
  return (
    <Screen
      className={styles.screen}
      footer={
        <PrimaryButton
          disabled={!ok}
          done={said}
          onClick={() => {
            if (!ok || said) return;
            setSaid(true);
            send({ type: 'lastWords', text: text.trim().slice(0, 80) });
          }}
        >
          {L('Say it')}
        </PrimaryButton>
      }
    >
      <div className={styles.stack}>
        <p className={styles.head}>{L('Your last words')}</p>
        <p className={styles.sub}>{L('One line for the TV. Make it count.')}</p>
        <input
          className={styles.input}
          value={text}
          maxLength={80}
          autoComplete="off"
          enterKeyHint="send"
          aria-label={L('Your last words')}
          placeholder={L('Say something…')}
          onChange={(e) => setText(e.target.value)}
        />
        <span className={styles.counter}>{text.length} / 80</span>
      </div>
    </Screen>
  );
}
