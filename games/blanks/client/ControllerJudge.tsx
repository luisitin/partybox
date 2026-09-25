// Phone during "reveal" (the same card the TV is reading, so a phone-only room can read along)
// and "judge" (voters get the list; the judge in czar mode is the only voter; everyone else reads
// the cards and waits). A voter's own card is listed but not votable.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { Avatar, PrimaryButton, Screen, VoteList, WaitingScreen, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps, Translator } from '@partybox/game-sdk/ui';
import type { BlanksControllerView } from '../server/index';
import type { Input } from '../server/types';
import { FilledCard, FlipCard, InlineFilled, LETTERS } from './Cards';
import { NextButton } from './NextButton';
import { STRINGS } from './strings';
import styles from './blanks.module.css';

type Props = GameControllerProps<BlanksControllerView, Input>;

/** No card to show yet: the TV has it, or (a phone-only room) it is a moment away. */
function Elsewhere({ view, L }: { view: BlanksControllerView; L: Translator }): JSX.Element {
  return (
    <WaitingScreen title={view.phoneOnly ? L('One moment…') : L('Look at the TV')} mood="watch" />
  );
}

/** The caption under the read-out card: the reader is told it is them (review-loop #248). */
function readAlongLine(
  view: BlanksControllerView,
  meId: string,
  mine: boolean,
  L: Translator,
): string {
  if (view.reader?.id === meId)
    return mine
      ? L("You're reading them out — and this one is yours. Good luck.")
      : L("You're reading them out. Take your time.");
  if (mine) return L("This one's yours — keep a straight face.");
  if (view.role === 'judge') return L('Read along. You pick the winner after the last card.');
  if (view.judgeMode === 'czar' && view.czar)
    return L('Read along. {name} decides after the last card.', { name: view.czar.name });
  return view.reader
    ? L('Read along. {name} is reading.', { name: view.reader.name })
    : L('Read along. The vote is next.');
}

export function ControllerReveal({ view, me, send }: Props): JSX.Element {
  const L = useT(STRINGS);
  const black = view.black;
  const current = view.cards[view.revealIndex];
  if (!black || !current) return <Elsewhere view={view} L={L} />;
  // Slots are anonymous even to the phone: my card is the one whose text is my play.
  const mine = view.myPlay !== null && view.myPlay.join('|') === current.whites.join('|');
  return (
    <Screen
      className="pb-enter"
      title={
        <span className={styles.kicker}>
          {L('Round {round} · Card {n} of {count}', {
            round: view.round,
            n: view.revealIndex + 1,
            count: view.cardCount,
          })}
        </span>
      }
    >
      {/* The card is the whole screen in a phone-only room: centred in the free space, the
          caption under it (it sat in the top third over a blank two-thirds, review-loop #139). */}
      <div className={styles.readAlong}>
        <FlipCard
          flipKey={String(current.slot)}
          key={current.slot}
          text={black.text}
          whites={current.whites}
          size="phone"
          letter={LETTERS[current.slot]}
          className={styles.readCard}
        />
        {/* The reader is told it is them; everyone else reads along (review-loop #248). */}
        <p className="pb-caption pb-muted">{readAlongLine(view, me.id, mine, L)}</p>
        {/* I-143 C: nobody can read it — anyone may take it. */}
        {view.readingOpen ? (
          <button
            type="button"
            className={styles.takeRead}
            onClick={() => send({ type: 'takeReading' })}
          >
            {L("I'll read")}
          </button>
        ) : null}
      </div>
    </Screen>
  );
}

export function ControllerJudge({ view, send, skip }: Props): JSX.Element {
  const L = useT(STRINGS);
  // I-168: the judge's pick this round (a tap picks; "Crown" sends it)
  const [picked, setPicked] = useState<{ round: number; slot: number; at: number } | null>(null);
  const pickSlot = picked?.round === view.round ? picked.slot : null;
  // I-168 B: an unsent pick crowns itself after 3 s (a new pick restarts the clock)
  useEffect(() => {
    if (!picked || picked.round !== view.round || (view.vote?.votedSlot ?? null) !== null) return undefined;
    const h = setTimeout(() => send({ type: 'vote', slot: picked.slot }), 3000);
    return () => clearTimeout(h);
  }, [picked, view.round, view.vote?.votedSlot, send]);
  const black = view.black;
  const vote = view.vote;
  if (!black || view.cards.length === 0) return <Elsewhere view={view} L={L} />;
  const kicker =
    view.judgeMode === 'czar'
      ? L('Round {round} · the judge decides', { round: view.round })
      : L('Round {round} · vote', { round: view.round });
  const count = { voted: view.votedCount, expected: view.votersExpected };
  // I-149 A: in czar mode the other phones have a bet to place while the judge thinks.
  if (view.guess?.canGuess) {
    return (
      <VoteList
        kicker={kicker}
        header={<FilledCard text={black.text} pick={black.pick} size="phone" />}
        prompt={L('Which one will the judge take?')}
        promptKey={`guess:${view.round}`}
        size={view.cards.length <= 3 ? 'large' : 'compact'}
        options={view.cards.map((c) => ({
          id: String(c.slot),
          text: <span className={styles.voteAnswer}>{c.whites.join(' ')}</span>,
          mine: c.slot === view.guess?.mySlot,
        }))}
        votedId={view.guess.guessedSlot === null ? null : String(view.guess.guessedSlot)}
        onVote={(id) => send({ type: 'guess', slot: Number(id) })}
        footer={
          <p className="pb-caption pb-muted">
            {L('Half a point if you call it. The judge cannot see this.')}
          </p>
        }
      />
    );
  }
  if (vote?.canVote) {
    // Two or three cards get VoteList's tall lettered cards (it draws the disc); more get compact
    // rows, where the letter is ours.
    const large = view.cards.length <= 3;
    // A Pick 1 round repeats the question in every row: six rows of the same setup is a long
    // scroll on a phone. The question goes above the list once and the rows carry the answers
    // (review-loop #173). A Pick 2 or 3 keeps the whole sentence — the order is the joke.
    const answersOnly = black.pick === 1;
    return (
      <VoteList
        kicker={kicker}
        header={
          answersOnly ? <FilledCard text={black.text} pick={black.pick} size="phone" /> : null
        }
        prompt={view.judgeMode === 'czar' ? L('Pick the winner') : L('Vote for the best')}
        promptKey={`${view.round}`}
        // Two or three cards: tall lettered cards fill the thumb zone (as Wisecrack's A / B).
        size={large ? 'large' : 'compact'}
        options={view.cards.map((c) => ({
          id: String(c.slot),
          text: (
            <span className={styles.voteRow}>
              {large ? null : (
                <span className={styles.voteLetter} aria-hidden>
                  {LETTERS[c.slot]}
                </span>
              )}
              {answersOnly ? (
                <span className={styles.voteAnswer}>{c.whites.join(' ')}</span>
              ) : (
                <InlineFilled text={black.text} whites={c.whites} />
              )}
            </span>
          ),
          mine: c.slot === vote.mySlot,
        }))}
        votedId={vote.votedSlot === null ? null : String(vote.votedSlot)}
        onVote={(id) => send({ type: 'vote', slot: Number(id) })}
        // I-168: the judge's tap picks; the Crown button (below) decides the round
        pick={
          view.judgeMode === 'czar'
            ? {
                selectedId: pickSlot === null ? null : String(pickSlot),
                onSelect: (id) => setPicked({ round: view.round, slot: Number(id), at: Date.now() }),
              }
            : undefined
        }
        // The confirmation rides in the footer, above the Next button: a long list pushed the
        // list's own line under the sticky bar. The result lands on this phone too (Blanks plays
        // without a TV), so it counts the room, not the screen across it (review-loop #138).
        lockedLabel={null}
        // Untimed rounds: once the VIP has voted they may close the vote for the room.
        footer={
          vote.votedSlot !== null ? (
            <>
              <p className={styles.voteIn} role="status">
                {view.votedCount >= view.votersExpected
                  ? L('✓ That’s everyone — here comes the result…')
                  : L('✓ Vote in · {voted} / {expected} voted', count)}
              </p>
              <NextButton skip={skip} timed={view.timed} label={L('Close the vote now')} />
            </>
          ) : view.judgeMode === 'czar' && pickSlot !== null ? (
            // I-168: the verdict is its own button — a slip on the list is not final
            <>
              <PrimaryButton
                key={picked?.at}
                className={styles.crownTimed}
                onClick={() => send({ type: 'vote', slot: pickSlot })}
              >
                {L('👑 Crown {letter}', { letter: LETTERS[pickSlot] ?? '?' })}
              </PrimaryButton>
              <p className="pb-caption pb-muted">{L('Tap another card to change your mind')}</p>
            </>
          ) : undefined
        }
      />
    );
  }
  const judge = view.czar;
  // A connected judge's pick is the phase: nobody skips it. A dropped judge (or vote mode, where
  // this phone cannot vote) leaves Next to the VIP.
  const judgeHolds = view.judgeMode === 'czar' && judge?.connected === true;
  return (
    <Screen
      title={<span className={styles.kicker}>{kicker}</span>}
      footer={
        judgeHolds ? undefined : <NextButton skip={skip} timed={view.timed} label={L('Next')} />
      }
    >
      <div className={styles.waitLine} role="status">
        {judge && view.judgeMode === 'czar' ? (
          <>
            <Avatar avatarId={judge.avatarId} size="var(--pb-chip-size)" />
            <span>
              {judge.connected
                ? L('{name} is choosing…', { name: judge.name })
                : L('{name} dropped — waiting a moment for them…', { name: judge.name })}
            </span>
          </>
        ) : (
          <span>{L('{voted} / {expected} voted', count)}</span>
        )}
      </div>
      {/* The question once, then the answers — the same shape as the vote list (review-loop #181). */}
      {black.pick === 1 ? (
        <div className={styles.handBlack}>
          <FilledCard text={black.text} pick={black.pick} size="phone" />
        </div>
      ) : null}
      <ul className={styles.cardList} aria-label={L('the cards')}>
        {view.cards.map((c) => (
          <li key={c.slot}>
            <FilledCard
              text={black.pick === 1 ? '____' : black.text}
              whites={c.whites}
              size="mini"
              letter={LETTERS[c.slot]}
              className={c.slot === vote?.mySlot ? styles.mineCard : ''}
            />
          </li>
        ))}
      </ul>
    </Screen>
  );
}
