// The phone's "do something now" panels (§9.4, plain for M1): Got it, the nominee picker, the
// Ja / Nein placards, the discard and enact card rows (hold to see), the veto answer, the power
// target picker (execution confirms twice) and the peek. There is no undo after a confirm.
import { useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, Screen, useT } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { ActView, ShControllerView } from '../server/views';
import { CardBack, PolicyCard } from './Card';
import { nameIn, partyName, powerName, reasonName } from './labels';
import { PhoneDossier } from './PhoneDossier';
import { FacePicker } from './standin/FacePicker';
import { STRINGS } from './strings';
import styles from './phone.module.css';

interface Props {
  view: ShControllerView;
  act: ActView;
  send: (input: Input) => void;
}

function Picker({
  view,
  act,
  onPick,
  picked,
}: Props & { onPick: (id: string) => void; picked: string | null }): JSX.Element {
  const L = useT(STRINGS);
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
  return (
    <FacePicker
      options={options}
      selected={picked ? [picked] : []}
      onChange={(ids) => onPick(ids[0] ?? '')}
      columns={options.length > 6 ? 3 : 2}
      label={act.kind === 'nominate' ? L('Choose your Chancellor') : L('Choose a player')}
    />
  );
}

/**
 * Hold the row to see the cards; slide onto one and let go to mark it (one finger). Face-down
 * otherwise, with numbered keys for keyboards and screen readers that name the card only as
 * "Card 2", so a glance never shows the hand.
 */
function CardRow({
  cards,
  marked,
  onMark,
}: {
  cards: ActView['cards'];
  marked: number | null;
  onMark?: (i: number) => void;
}): JSX.Element {
  const L = useT(STRINGS);
  const [open, setOpen] = useState(false);
  const release = (x: number, y: number): void => {
    setOpen(false);
    const hit = document.elementFromPoint(x, y)?.closest('[data-card]');
    const i = Number(hit?.getAttribute('data-card'));
    if (onMark && Number.isInteger(i) && hit) onMark(i);
  };
  return (
    <div className={styles.cardRowWrap}>
      <div
        className={styles.cardRow}
        data-open={open || undefined}
        aria-label={L('The policies in your hand')}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setOpen(true);
        }}
        onPointerUp={(e) => release(e.clientX, e.clientY)}
        onPointerCancel={() => setOpen(false)}
        onContextMenu={(e) => e.preventDefault()}
      >
        {cards.map((c, i) => (
          <span key={i} data-card={i}>
            {open ? (
              <PolicyCard party={c} marked={marked === i} />
            ) : (
              <CardBack label={marked === i ? '✓' : String(i + 1)} />
            )}
          </span>
        ))}
        {open ? null : <span className={styles.cardHint}>{L('Hold to see the policies')}</span>}
      </div>
      {onMark ? (
        <div className={styles.cardKeys}>
          {cards.map((_, i) => (
            <button
              key={i}
              type="button"
              className={styles.cardKey}
              data-on={marked === i || undefined}
              onClick={() => onMark(i)}
            >
              {L('Card {n}', { n: i + 1 })}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PhoneAct({ view, act, send }: Props): JSX.Element {
  const L = useT(STRINGS);
  const [picked, setPicked] = useState<string | null>(null);
  const [mark, setMark] = useState<number | null>(null);
  const [sure, setSure] = useState(false);
  const pickedName = nameIn(view.players, picked);
  const chan = nameIn(view.players, view.round.nominee);
  const pres = nameIn(view.players, view.round.president);
  switch (act.kind) {
    case 'ready':
      return (
        <Screen
          title={L('Your dossier')}
          footer={
            <PrimaryButton done={act.done} onClick={() => send({ type: 'ready' })}>
              {act.done ? L('Ready') : L('Got it')}
            </PrimaryButton>
          }
        >
          <PhoneDossier view={view} />
          <p className={styles.hint}>{L('Keep it secret. Hold to look, let go to hide.')}</p>
        </Screen>
      );
    case 'nominate':
      return (
        <Screen
          title={L('Choose your Chancellor')}
          footer={
            <PrimaryButton
              disabled={!picked}
              onClick={() => picked && send({ type: 'nominate', target: picked })}
            >
              {picked ? L('Nominate {name}', { name: pickedName }) : L('Tap a player')}
            </PrimaryButton>
          }
        >
          <Picker view={view} act={act} send={send} onPick={setPicked} picked={picked} />
        </Screen>
      );
    case 'vote':
      return (
        <Screen title={L('President {p} · Chancellor {c}', { p: pres, c: chan })}>
          <div className={styles.placards}>
            <button
              type="button"
              className={styles.placard}
              data-on={act.myVote === true || undefined}
              aria-label={L('Vote Ja')}
              onClick={() => send({ type: 'vote', ja: true })}
            >
              {L('✓ JA!')}
            </button>
            <button
              type="button"
              className={styles.placard}
              data-no
              data-on={act.myVote === false || undefined}
              aria-label={L('Vote Nein')}
              onClick={() => send({ type: 'vote', ja: false })}
            >
              {L('✗ NEIN!')}
            </button>
          </div>
          <p className={styles.hint}>{L('You can change your vote until the timer ends.')}</p>
        </Screen>
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
        <Screen
          title={
            discard
              ? L('Discard one policy. The other two go to Chancellor {name}.', { name: chan })
              : L('Enact one policy.')
          }
          footer={
            <div className={styles.footer}>
              <PrimaryButton
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
                  {L('Request veto')}
                </PrimaryButton>
              ) : null}
            </div>
          }
        >
          <CardRow cards={act.cards} marked={mark} onMark={setMark} />
          <p className={styles.hint}>
            {L('Hold the row to see them, slide onto one and let go to choose it.')}
          </p>
        </Screen>
      );
    }
    case 'vetoAnswer':
      return (
        <Screen
          title={L('Chancellor {name} requests a veto.', { name: chan })}
          footer={
            <div className={styles.footer}>
              <PrimaryButton onClick={() => send({ type: 'vetoAnswer', agree: true })}>
                {L('Agree')}
              </PrimaryButton>
              <PrimaryButton
                tone="neutral"
                onClick={() => send({ type: 'vetoAnswer', agree: false })}
              >
                {L('Refuse')}
              </PrimaryButton>
            </div>
          }
        >
          <p className={styles.hint}>
            {L('Both policies will be thrown away, and the tracker moves up one.')}
          </p>
          <CardRow cards={act.cards} marked={null} />
        </Screen>
      );
    case 'peek':
      return (
        <Screen
          title={L('The next three policies')}
          footer={
            <PrimaryButton onClick={() => send({ type: 'peekDone' })}>{L('Done')}</PrimaryButton>
          }
        >
          <CardRow cards={act.cards} marked={null} />
          <p className={styles.hint}>{L('They go back in the same order.')}</p>
        </Screen>
      );
    case 'target': {
      const power = act.power ?? 'investigate';
      const execute = power === 'execute';
      const confirm =
        execute && sure
          ? L('This can’t be undone. Execute {name}?', { name: pickedName })
          : L('{power}: {name}', { power: powerName(L, power), name: pickedName });
      return (
        <Screen
          title={powerName(L, power)}
          footer={
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
            view={view}
            act={act}
            send={send}
            onPick={(id) => {
              setPicked(id);
              setSure(false);
            }}
            picked={picked}
          />
        </Screen>
      );
    }
  }
}
