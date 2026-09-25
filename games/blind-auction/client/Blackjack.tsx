// Blackjack (LIVE-EVENTS.md): the table on the TV — the dealer's cards on top (one down until the
// dealer plays, then drawn one by one), everyone's hand below with its total; on the phone your own
// cards, big, and HIT / STAND. Cards are 0–51: rank n % 13 (A 2 … 10 J Q K), suit n / 13.
import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import {
  Avatar,
  PrimaryButton,
  Screen,
  buzz,
  useReducedMotion,
  useSound,
  useT,
} from '@partybox/game-sdk/ui';
import type { GameControllerProps, PushedView } from '@partybox/game-sdk/ui';
import { DEAL_MS, betsMs } from '../server/timing';
import type { Input } from '../server/types';
import type { BlindAuctionControllerView, BlindAuctionTvView } from '../server/views';
import styles from './live.module.css';
import { STRINGS } from './strings';

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['♠', '♥', '♦', '♣'];

/** A hand's best total (aces 11 unless that busts) — the server's rule, for the numbers shown. */
export function handTotal(cards: readonly number[]): number {
  let sum = 0;
  let aces = 0;
  for (const c of cards) {
    const r = c % 13;
    if (r === 0) {
      aces++;
      sum += 11;
    } else sum += Math.min(10, r + 1);
  }
  while (sum > 21 && aces > 0) {
    sum -= 10;
    aces--;
  }
  return sum;
}

export function Card({
  n,
  down = false,
  size = 'tv',
}: {
  n?: number;
  down?: boolean;
  size?: 'tv' | 'phone';
}): JSX.Element {
  if (down || n === undefined)
    return (
      <span
        className={`${styles.pcard} ${styles.pcardBack} ${size === 'phone' ? styles.pcardPhone : ''}`}
        aria-label="?"
      />
    );
  const suit = Math.floor(n / 13);
  const red = suit === 1 || suit === 2;
  return (
    <span
      className={`${styles.pcard} ${red ? styles.pcardRed : ''} ${size === 'phone' ? styles.pcardPhone : ''}`}
    >
      {RANKS[n % 13]}
      <small>{SUITS[suit]}</small>
    </span>
  );
}

type BjView = Pick<PushedView<BlindAuctionTvView>, 'blackjack' | 'players' | 'phaseId' | 'bets'>;

/** The TV table. At `open` the dealer's cards turn one by one after the bets land. */
export function BlackjackTable({ view }: { view: BjView }): JSX.Element | null {
  const L = useT(STRINGS);
  const reduced = useReducedMotion();
  const play = useSound();
  const bj = view.blackjack;
  const open = view.phaseId === 'open';
  const dealer = useMemo(() => bj?.dealer ?? [], [bj]);
  const [shown, setShown] = useState(open && !reduced ? 1 : dealer.length);
  useEffect(() => {
    if (!open || reduced) return;
    const start = betsMs(view.bets?.length ?? 0);
    const hs = dealer.slice(1).map((_, i) =>
      setTimeout(
        () => {
          setShown(i + 2);
          play('card');
        },
        start + (i + 1) * DEAL_MS,
      ),
    );
    return () => hs.forEach(clearTimeout);
  }, [open, reduced, dealer, view.bets, play]);
  if (!bj) return null;
  const up = open ? dealer.slice(0, shown) : dealer;
  const dealerTotal = handTotal(up);
  return (
    <div className={styles.felt21}>
      <div className={styles.dealerRow}>
        <span className={styles.seatLabel}>{L('Dealer')}</span>
        <span className={styles.cardsRow}>
          {up.map((n, i) => (
            <Card key={i} n={n} />
          ))}
          {!open ? <Card down /> : null}
        </span>
        <span className={styles.handTotal}>
          {open && shown >= dealer.length ? dealerTotal : ''}
        </span>
      </div>
      <div className={styles.handsGrid}>
        {Object.entries(bj.hands).map(([id, cards]) => {
          const p = view.players.find((x) => x.id === id);
          const t = handTotal(cards);
          return (
            <div key={id} className={`${styles.hand21} ${t > 21 ? styles.bust : ''}`}>
              <span className={styles.handWho}>
                {p ? (
                  <span className={styles.handFace}>
                    <Avatar avatarId={p.avatarId} size="100%" />
                  </span>
                ) : null}
                {p?.name ?? '?'}
              </span>
              <span className={styles.cardsRow}>
                {cards.map((n, i) => (
                  <Card key={i} n={n} />
                ))}
              </span>
              <span className={styles.handTotal}>
                {t > 21 ? L('Bust') : bj.stood.includes(id) ? `${t} ✓` : t}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type PhoneProps = GameControllerProps<BlindAuctionControllerView, Input>;

/** `hands` on a phone: your cards and HIT / STAND. */
export function PhoneHand({ view, send }: PhoneProps): JSX.Element {
  const L = useT(STRINGS);
  const bj = view.blackjack;
  const mine = bj?.hands[view.me.id];
  if (!bj || !mine)
    return (
      <Screen className={styles.screen}>
        <p className={styles.potatoTitle}>{L('Blackjack')}</p>
        <p className={styles.potatoHint}>{L('No stake on this hand: watch the table.')}</p>
      </Screen>
    );
  const t = handTotal(mine);
  const done = bj.stood.includes(view.me.id);
  return (
    <Screen
      className={styles.screen}
      footer={
        done ? null : (
          <div className={styles.hitStand}>
            <PrimaryButton
              onClick={() => {
                buzz(15);
                send({ type: 'hit' });
              }}
            >
              {L('HIT')}
            </PrimaryButton>
            <PrimaryButton
              tone="neutral"
              onClick={() => {
                buzz(15);
                send({ type: 'stand' });
              }}
            >
              {L('STAND')}
            </PrimaryButton>
          </div>
        )
      }
    >
      <p className={styles.seatLabel}>
        {L('Dealer shows')} <Card n={bj.dealer[0]} size="phone" />
      </p>
      <span className={`${styles.cardsRow} ${styles.cardsBig}`}>
        {mine.map((n, i) => (
          <Card key={i} n={n} size="phone" />
        ))}
      </span>
      <p className={styles.potatoTitle}>
        {t > 21 ? L('Bust! {n}', { n: t }) : t === 21 ? L('21!') : L('You have {n}', { n: t })}
      </p>
      <p className={styles.potatoHint}>
        {done
          ? L('Standing. The dealer plays when everyone is done.')
          : L('Hit for another card, or stand.')}
      </p>
    </Screen>
  );
}
