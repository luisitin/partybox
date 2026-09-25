// `bet` on the phone: pick what you think is inside (the box's contents are big tappable cards
// with their odds and payouts), then how much — the shared BidPad, 0 up to all your coins. A resend
// changes the bet. "Sit this one out" bets nothing. A broke player is told they got 10 to play with.
import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import { BidPad } from '@partybox/game-sdk/ui/bid-pad';
import { maxStake } from '../server/odds';
import { PITY_COINS } from '../server/timing';
import type { Input } from '../server/types';
import type { BlindAuctionControllerView } from '../server/views';
import { COIN, nameOf } from './copy';
import { OptionBoard } from './Options';
import { KenoPad } from './Keno';
import { DoubleSwitch, InsureSwitch, PeekButton, TwistNote } from './Twist';
import { LotTitle } from './PhoneLot';
import styles from './phone.module.css';
import { STRINGS } from './strings';

type Props = GameControllerProps<BlindAuctionControllerView, Input>;

/** The fold (the pick on top, the rest to pills) eases instead of snapping (review [cf1052] #3). */
function eased(change: () => void): void {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  const still =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.dataset['motion'] === 'off';
  if (doc.startViewTransition && !still) doc.startViewTransition(change);
  else change();
}

/** A short phone (an SE): the Bet button drops the pick's name, which the ticked card shows. */
function useShortPhone(): boolean {
  const query = '(max-height: 640px)';
  const [short, setShort] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = (): void => setShort(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return short;
}

export function PhoneBet({ view, send }: Props): JSX.Element | null {
  const L = useT(STRINGS);
  const short = useShortPhone();
  // Tug of war: you back your own team, picked for you.
  const [option, setOption] = useState<number | null>(
    view.myBet?.option ??
      (view.box?.event === 'tug'
        ? view.myTeam
        : view.box?.event === 'shells' ||
            view.box?.event === 'keno' ||
            view.box?.event === 'blackjack'
          ? 0
          : null),
  );
  const [amount, setAmount] = useState(view.myBet?.amount ?? 0);
  const [insured, setInsured] = useState(view.myBet?.insured === true);
  const [also, setAlso] = useState<number | null>(view.myBet?.also ?? null);
  const [doubled, setDoubled] = useState(view.myBet?.doubled === true);
  const headRef = useRef<HTMLDivElement>(null);
  // A pick folds the cards and pins the stake: the body is short again, so it starts at its top
  // (the title never left under the timer bar; review [e303ad] #1).
  useEffect(() => {
    let el: HTMLElement | null = headRef.current?.parentElement ?? null;
    while (el && el.scrollHeight <= el.clientHeight + 1) el = el.parentElement;
    if (el) el.scrollTop = 0;
  }, [option]);
  const box = view.box;
  if (!box) return null;
  const what = option !== null ? box.options[option] : undefined;
  const second = box.twist === 'split' && also !== null ? box.options[also] : undefined;
  // Names only: the icon is on the ticked card above, and the button stays one line on an SE.
  const struck = view.myPeek !== null ? box.options[view.myPeek] : undefined;
  const label = (what ? nameOf(L, what) : '') + (second ? ` + ${nameOf(L, second)}` : '');
  // "Placed" only while the shown bet is the one sent: picking another content re-arms the button.
  // Sitting out is sitting out whatever card is picked.
  const placed = !view.myBet
    ? null
    : view.myBet.amount === 0
      ? 0
      : view.myBet.option === option &&
          (view.myBet.insured === true) === insured &&
          (view.myBet.also ?? null) === (box.twist === 'split' ? also : null) &&
          (view.myBet.doubled === true) === (box.twist === 'double' && doubled)
        ? view.myBet.amount
        : null;
  // Hot potato: you cannot back yourself (you could just keep it).
  const self = box.event === 'potato' && option !== null && option === view.mySeat;
  const notice =
    view.notice?.code === 'spots' ? (
      L('Pick your three numbers first')
    ) : self || view.notice?.code === 'self' ? (
      L('You can’t bet on yourself: pick someone else')
    ) : view.notice?.code === 'over' ? (
      <span key={view.notice.at}>
        {L('You only have {coin} {n}', { coin: COIN, n: view.notice.have })}
      </span>
    ) : option === null && amount > 0 ? (
      box.event === 'potato' ? (
        L('Pick who will be holding it first')
      ) : (
        L('Pick what is inside first')
      )
    ) : view.topped ? (
      L('You ran out of coins: here are {coin} {n} to play with', { coin: COIN, n: PITY_COINS })
    ) : null;
  // The twist's own control sits in the header, under its line (before a pick) or in place of it
  // (after): never below the chips, where an SE's fade covered it (review [cf1052] #1).
  const control =
    box.twist === 'insure' ? (
      <InsureSwitch on={insured} amount={amount} onToggle={() => setInsured((v) => !v)} />
    ) : box.twist === 'double' ? (
      <DoubleSwitch on={doubled} onToggle={() => setDoubled((v) => !v)} />
    ) : box.twist === 'peek' ? (
      <PeekButton
        price={view.peekPrice}
        done={view.myPeek !== null}
        struck={struck ? nameOf(L, struck) : ''}
        onPeek={() => send({ type: 'peek' })}
      />
    ) : undefined;
  return (
    <BidPad
      value={amount}
      max={maxStake(
        view.coins - (view.myPeek !== null ? view.peekPrice : 0),
        box.twist === 'insure' && insured,
      )}
      placed={placed}
      onChange={setAmount}
      onConfirm={(n) => {
        if (option !== null)
          send({
            type: 'bet',
            option,
            amount: n,
            ...(box.twist === 'insure' ? { insured } : {}),
            ...(box.twist === 'split' && also !== null ? { also } : {}),
            ...(box.twist === 'double' ? { doubled } : {}),
          });
      }}
      onPass={() => {
        setAmount(0);
        // Sitting out is sitting out: no card stays ticked (play-test: it read as both).
        if (box.event !== 'tug' && box.event !== 'shells' && box.event !== 'keno') setOption(null);
        send({ type: 'bet', option: option ?? 0, amount: 0 });
      }}
      blocked={
        option === null ||
        self ||
        option === view.myPeek ||
        (box.event === 'keno' && view.mySpots.length !== 3)
      }
      texts={{
        place: (n) =>
          box.event === 'shells'
            ? L('Put {coin} {n} in the pot', { coin: COIN, n })
            : short
              ? L('Bet {coin} {n}', { coin: COIN, n })
              : L('Bet {coin} {n} on {what}', { coin: COIN, n, what: label }),
        change: (n) =>
          short
            ? L('Change to {coin} {n}', { coin: COIN, n })
            : L('Change to {coin} {n} on {what}', { coin: COIN, n, what: label }),
        placed: (n) =>
          short
            ? L('{coin} {n} placed', { coin: COIN, n })
            : L('{coin} {n} on {what}', { coin: COIN, n, what: label }),
        zero:
          option === null
            ? box.event === 'potato'
              ? L('Pick a player')
              : L('Pick a card')
            : L('Choose your stake'),
        pass: L('Sit this one out'),
        passed: L('✓ Sitting this one out'),
      }}
      // The coins sit pinned in the header, never under the scroll fade (review [39e0f5eb] #1).
      showHave={false}
      // Once a card is picked the stake rides in the footer: always on screen, at any text size
      // (review [e303ad]); before a pick the cards have the whole body.
      pinPad={option !== null}
      header={
        <div className={styles.betHead} ref={headRef}>
          <LotTitle box={box} coins={view.coins} />
          {option === null || !control ? (
            <TwistNote twist={box.twist} size="phone" short={option !== null} />
          ) : null}
          {control}
          {/* A twist's own line is the instruction on that box (review [2a24d2] #2: one line, not two). */}
          {option === null && !box.twist && box.event !== 'shells' && box.event !== 'keno' ? (
            // Above the cards, never in the fade (review). A first-timer didn't know to tap a card or where the stake goes.
            <p className={styles.betHint}>{L('Tap a card, then set your coins')}</p>
          ) : null}
          {box.event === 'keno' ? (
            <KenoPad spots={view.mySpots} onSpots={(spots) => send({ type: 'spots', spots })} />
          ) : box.event === 'shells' ? (
            <p className={styles.betHint}>
              {L(
                'Put coins in the pot. You pick a cup after the shuffle; the bigger the pot, the faster it goes!',
              )}
            </p>
          ) : (
            <OptionBoard
              options={box.options}
              size="phone"
              selected={option}
              also={box.twist === 'split' ? also : null}
              onSelect={(i) =>
                eased(() => {
                  if (box.twist !== 'split') return setOption(i);
                  // Split: the first tap picks, a second card adds a half; tapping a lit card lets it go.
                  if (option === null) return setOption(i);
                  if (i === option) {
                    setOption(also);
                    return setAlso(null);
                  }
                  setAlso(i === also ? null : i);
                })
              }
              locked={
                box.event === 'potato'
                  ? view.mySeat
                  : box.event === 'tug' && view.myTeam !== null
                    ? 1 - view.myTeam
                    : view.myPeek
              }
              hideLocked={box.event === 'tug'}
            />
          )}
        </div>
      }
      notice={notice}
    />
  );
}
