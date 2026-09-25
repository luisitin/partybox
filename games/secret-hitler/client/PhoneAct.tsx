// The phone's "do something now" panels (SPEC §9.4): Got it, the nominee picker, the JA! / NEIN!
// placards, the discard and enact card rows, the veto answer, the power target picker (execution
// confirms twice) and the peek. There is no undo after a confirm (§11).
import { useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, buzz, useT } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { ActView } from '../server/views';
import { PowerIcon, VetoIcon } from './icons';
import { CardRow } from './CardRow';
import { nameIn, partyName, powerName, reasonName } from './labels';
import { PhoneFrame } from './PhoneFrame';
import type { Frame } from './PhoneFrame';
import { FacePicker } from '@partybox/game-sdk/ui/face-picker';
import { STRINGS } from './strings';
import styles from './phone.module.css';

interface Props {
  frame: Frame;
  act: ActView;
  send: (input: Input) => void;
}

function Picker({
  frame,
  act,
  onPick,
  picked,
}: Props & { onPick: (id: string) => void; picked: string | null }): JSX.Element {
  const L = useT(STRINGS);
  const [narrow] = useState(() => {
    try {
      return window.matchMedia('(max-width: 380px)').matches;
    } catch {
      return false;
    }
  });
  const { view } = frame;
  const face = (seat: number, reason?: string) => {
    const p = view.players.find((x) => x.id === view.seats[seat]?.id);
    return {
      id: p?.id ?? '',
      name: p?.name ?? '?',
      avatarId: p?.avatarId ?? '',
      ...(reason ? { disabledReason: reason } : {}),
    };
  };
  const options = [
    ...act.options.map((s) => ({ seat: s, o: face(s) })),
    ...act.blocked.map((b) => ({ seat: b.seat, o: face(b.seat, reasonName(L, b.reason)) })),
  ]
    .sort((a, b) => a.seat - b.seat)
    .map((x) => x.o);
  // A small phone with long names ("Tess's bot 2"): one column, so no tile cuts a name and nobody
  // picks blind (review 1724cb #1).
  const longest = Math.max(0, ...options.map((o) => o.name.length));
  return (
    <FacePicker
      options={options}
      selected={picked ? [picked] : []}
      onChange={(ids) => onPick(ids[0] ?? '')}
      columns={narrow && longest > 9 ? 1 : options.length > 6 ? 3 : 2}
      label={act.kind === 'nominate' ? L('Choose your Chancellor') : L('Choose a player')}
    />
  );
}

export function PhoneAct({ frame, act, send }: Props): JSX.Element {
  const L = useT(STRINGS);
  const { view } = frame;
  const [picked, setPicked] = useState<string | null>(null);
  const [mark, setMark] = useState<number | null>(null);
  const [sure, setSure] = useState(false);
  const pickedName = nameIn(view.players, picked);
  const chan = nameIn(view.players, view.round.nominee);
  const pres = nameIn(view.players, view.round.president);
  switch (act.kind) {
    case 'ready': {
      const here = view.seats.filter((s) => !s.tags.includes('exiled'));
      const ready = here.filter((s) => s.tags.includes('ready')).length;
      return (
        <PhoneFrame
          frame={frame}
          kicker={L('A new parliament')}
          title={act.done ? L('Waiting for the others') : L('Read your dossier')}
          actions={
            <PrimaryButton done={act.done} onClick={() => send({ type: 'ready' })}>
              {act.done ? L('Ready') : L('Got it')}
            </PrimaryButton>
          }
        >
          <p className={styles.hint}>{L('Keep it secret. Tap the folder to open or close it.')}</p>
          <p className={styles.readyCount}>
            {L('{ready} of {total} ready', { ready, total: here.length })}
          </p>
        </PhoneFrame>
      );
    }
    case 'nominate':
      return (
        <PhoneFrame
          frame={frame}
          kicker={L('You are the President')}
          title={L('Choose your Chancellor')}
          actions={
            <PrimaryButton
              disabled={!picked}
              onClick={() => picked && send({ type: 'nominate', target: picked })}
            >
              {picked ? L('Nominate {name}', { name: pickedName }) : L('Tap a player')}
            </PrimaryButton>
          }
        >
          <Picker frame={frame} act={act} send={send} onPick={setPicked} picked={picked} />
        </PhoneFrame>
      );
    case 'vote':
      return (
        <PhoneFrame
          frame={frame}
          kicker={L('Vote now')}
          title={L('President {p} · Chancellor {c}', { p: pres, c: chan })}
        >
          <div className={styles.placards}>
            {[true, false].map((ja) => (
              <button
                key={String(ja)}
                type="button"
                className={styles.placard}
                data-ja={ja || undefined}
                data-on={act.myVote === ja || undefined}
                aria-label={ja ? L('Vote Ja') : L('Vote Nein')}
                onClick={() => {
                  buzz(20);
                  send({ type: 'vote', ja });
                }}
              >
                <span className={styles.placardMark}>{ja ? '✓' : '✗'}</span>
                <span className={styles.placardWord}>{ja ? 'JA!' : 'NEIN!'}</span>
              </button>
            ))}
          </div>
          <p className={styles.hint}>{L('You can change your vote until the timer ends.')}</p>
        </PhoneFrame>
      );
    case 'discard':
    case 'enact': {
      const discard = act.kind === 'discard';
      const card = mark === null ? null : act.cards[mark];
      const label = !card
        ? L('Tap a policy')
        : discard
          ? L('Discard this {party} policy', { party: partyName(L, card) })
          : L('Enact this {party} policy', { party: partyName(L, card) });
      return (
        <PhoneFrame
          frame={frame}
          kicker={L('Session · say nothing')}
          title={discard ? L('Discard one policy') : L('Enact one policy.')}
          actions={
            <>
              <PrimaryButton
                tone={card === 'F' ? 'danger' : 'accent'}
                disabled={mark === null}
                onClick={() =>
                  mark !== null &&
                  send(
                    discard
                      ? { type: 'discard', index: mark as 0 | 1 | 2 }
                      : { type: 'enact', index: mark as 0 | 1 },
                  )
                }
              >
                {label}
              </PrimaryButton>
              {act.canVeto ? (
                <PrimaryButton tone="neutral" onClick={() => send({ type: 'vetoRequest' })}>
                  <VetoIcon size="1.2em" /> {L('Request veto')}
                </PrimaryButton>
              ) : null}
            </>
          }
        >
          <CardRow cards={act.cards} marked={mark} onMark={setMark} />
          {discard ? (
            <p className={styles.hint}>
              {L('The other two go to Chancellor {name}.', { name: chan })}
            </p>
          ) : null}
        </PhoneFrame>
      );
    }
    case 'vetoAnswer':
      return (
        <PhoneFrame
          frame={frame}
          kicker={L('Veto requested')}
          title={L('Chancellor {name} requests a veto.', { name: chan })}
          actions={
            <>
              <PrimaryButton onClick={() => send({ type: 'vetoAnswer', agree: true })}>
                {L('Agree')}
              </PrimaryButton>
              <PrimaryButton
                tone="neutral"
                onClick={() => send({ type: 'vetoAnswer', agree: false })}
              >
                {L('Refuse')}
              </PrimaryButton>
            </>
          }
        >
          <p className={styles.hint}>
            {L('Both policies will be thrown away, and the tracker moves up one.')}
          </p>
          <CardRow cards={act.cards} marked={null} />
        </PhoneFrame>
      );
    case 'peek':
      return (
        <PhoneFrame
          frame={frame}
          kicker={powerName(L, 'peek')}
          title={L('The next three policies')}
          actions={
            <PrimaryButton onClick={() => send({ type: 'peekDone' })}>{L('Done')}</PrimaryButton>
          }
        >
          <CardRow cards={act.cards} marked={null} />
          <p className={styles.hint}>{L('They go back in the same order.')}</p>
        </PhoneFrame>
      );
    case 'target': {
      const power = act.power ?? 'investigate';
      const execute = power === 'execute';
      const confirm =
        execute && sure
          ? L('This can’t be undone. Execute {name}?', { name: pickedName })
          : L('{power}: {name}', { power: powerName(L, power), name: pickedName });
      return (
        <PhoneFrame
          frame={frame}
          kicker={
            <span className={styles.powerKicker}>
              <PowerIcon kind={power} size="1.4em" /> {L('Your power')}
            </span>
          }
          title={powerName(L, power)}
          actions={
            <PrimaryButton
              tone={execute ? 'danger' : 'accent'}
              disabled={!picked || act.done}
              onClick={() => {
                if (!picked) return;
                if (execute && !sure) return setSure(true);
                send({ type: 'target', target: picked });
              }}
            >
              {picked ? confirm : L('Tap a player')}
            </PrimaryButton>
          }
        >
          <Picker
            frame={frame}
            act={act}
            send={send}
            onPick={(id) => {
              setPicked(id);
              setSure(false);
            }}
            picked={picked}
          />
        </PhoneFrame>
      );
    }
  }
}
