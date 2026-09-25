// Hot potato (LIVE-EVENTS.md): on the TV the players sit round a ring and the potato hops to its
// holder, shaking harder the longer it has been going (never a clue to the pop: that is secret and
// the server's alone); at `open` it bursts over whoever held it. On the holder's phone, one big
// potato to tap; everyone else sees who has it.
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import {
  Avatar,
  PrimaryButton,
  Screen,
  WaitingScreen,
  buzz,
  useSound,
  useT,
} from '@partybox/game-sdk/ui';
import type { GameControllerProps, PushedView } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { BlindAuctionControllerView, BlindAuctionTvView } from '../server/views';
import { usePhoneOnly } from '@partybox/game-sdk/ui';
import styles from './live.module.css';
import { STRINGS } from './strings';

/** What the ring reads: the TV's view or a phone's (a phone-only room shows it too). */
type RingView = Pick<PushedView<BlindAuctionTvView>, 'potato' | 'players' | 'box'>;

/** The ring of players and the potato. `popped` = it burst over the holder. */
export function PotatoRing({ view, popped }: { view: RingView; popped: boolean }): JSX.Element {
  const play = useSound();
  const holder = view.potato?.holder ?? null;
  const passes = view.potato?.passes ?? 0;
  const last = useRef(passes);
  useEffect(() => {
    if (passes !== last.current) play('tick');
    last.current = passes;
  }, [passes, play]);
  useEffect(() => {
    if (popped) play('bust');
  }, [popped, play]);
  // Seat order is the pass order: the ring follows the options (one per player, seat order).
  const ring = view.potato?.ring ?? [];
  const names = view.box?.options.map((o) => o.label?.name ?? '') ?? [];
  const seats = ring.map((id) => view.players.find((p) => p.id === id));
  const n = Math.max(1, seats.length);
  const at = seats.findIndex((p) => p?.id === holder);
  const angle = (i: number): number => (i / n) * 2 * Math.PI - Math.PI / 2;
  const pos = (i: number): CSSProperties => ({
    left: `${50 + 42 * Math.cos(angle(i))}%`,
    top: `${50 + 40 * Math.sin(angle(i))}%`,
  });
  const heat = Math.min(3, Math.floor(passes / 4));
  return (
    <div className={styles.ring}>
      {seats.map((p, i) => (
        <span
          key={i}
          className={`${styles.seat} ${i === at ? styles.seatHot : ''} ${popped && i === at ? styles.seatBurnt : ''}`}
          style={pos(i)}
        >
          <span className={styles.seatFace}>
            {p ? <Avatar avatarId={p.avatarId} size="100%" /> : null}
          </span>
          <span className={styles.seatName}>{names[i]}</span>
        </span>
      ))}
      {at >= 0 ? (
        <span
          key={popped ? 'pop' : 'potato'}
          className={`${styles.potato} ${popped ? styles.boom : styles[`heat${heat}`]}`}
          style={pos(at)}
          aria-hidden
        >
          {popped ? '💥' : '🥔'}
        </span>
      ) : null}
    </div>
  );
}

type PhoneProps = GameControllerProps<BlindAuctionControllerView, Input>;

/** The phone: the holder gets the potato to tap; the rest see who has it. */
export function PhonePotato({ view, send }: PhoneProps): JSX.Element {
  const L = useT(STRINGS);
  const holder = view.potato?.holder ?? null;
  const mine = holder === view.me.id;
  const phoneOnly = usePhoneOnly();
  const [sentAt, setSentAt] = useState(-1);
  const passes = view.potato?.passes ?? 0;
  // A buzz as it lands in your hands.
  useEffect(() => {
    if (mine) buzz([60, 40, 60]);
  }, [mine, passes]);
  const name = view.players.find((p) => p.id === holder)?.name ?? '?';
  // A phone-only room has no TV: everyone not holding it watches the ring here.
  if (!mine && phoneOnly)
    return (
      <Screen className={styles.screen}>
        <p className={styles.potatoTitle}>{L('{name} has the potato', { name })}</p>
        <div className={styles.phoneStage}>
          <PotatoRing view={view} popped={false} />
        </div>
        <p className={styles.potatoHint}>{L('{n} passes', { n: passes })}</p>
      </Screen>
    );
  if (!mine)
    return (
      <WaitingScreen
        title={L('{name} has the potato', { name })}
        hint={L('{n} passes', { n: passes })}
        mood="watch"
      />
    );
  return (
    <Screen
      className={styles.potatoScreen}
      footer={
        <PrimaryButton
          onClick={() => {
            buzz(20);
            setSentAt(passes);
            send({ type: 'pass' });
          }}
        >
          {L('Tap to pass!')}
        </PrimaryButton>
      }
    >
      <p className={styles.potatoTitle}>{L('You have the potato!')}</p>
      <button
        type="button"
        className={`${styles.potatoButton} ${sentAt === passes ? styles.potatoSent : ''}`}
        aria-label={L('Tap to pass!')}
        onClick={() => {
          buzz(20);
          setSentAt(passes);
          send({ type: 'pass' });
        }}
      >
        🥔
      </button>
      <p className={styles.potatoHint}>{L('Pass it on before it pops!')}</p>
    </Screen>
  );
}
