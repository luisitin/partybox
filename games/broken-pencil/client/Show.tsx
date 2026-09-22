// The show phase on a phone: the presenter turns the pages of their own book; everyone else
// watches the TV — or, in a "phone only" room, reads the page on the phone. Split from
// Controller.tsx at the 300-line cap.
import type { JSX } from 'react';
import { PrimaryButton, Screen, WaitingScreen } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { PageView, PencilControllerView } from '../server/views';
import { DrawingView } from './DrawingView';
import styles from './Controller.module.css';

/** The show: the presenter turns the pages of their own book; everyone else watches the TV. */
export function Show({
  view,
  send,
}: GameControllerProps<PencilControllerView, Input>): JSX.Element {
  const s = view.showing;
  const tvOff = view.phoneOnly === true;
  if (!s)
    return <WaitingScreen title={tvOff ? 'The show is next…' : 'Watch the TV'} mood="watch" />;
  const where = `page ${s.page + 1} of ${view.pageCount}`;
  // A "phone only" room reads the book on the phone: the page on stage, for everyone.
  const page =
    tvOff && s.current ? <PhonePage key={`${s.book}:${s.page}`} page={s.current} /> : null;
  // The VIP's "close enough" on a broken last page (the owner, 2026-09-21): the server takes the
  // veto from the VIP alone (ADR-042); the verdict on stage flips to intact.
  const vetoButton =
    s.verdict === 'broken' && view.vip === view.me.id ? (
      <button
        type="button"
        className={styles.veto}
        onClick={() => send({ type: 'veto', book: s.book })}
      >
        close enough ✓ — count it
      </button>
    ) : null;
  if (!s.presenting)
    return page || vetoButton ? (
      <Screen title={`${s.ownerName} is presenting`}>
        <p className={styles.kicker}>
          {s.ownerName}'s book · {where}
        </p>
        {page}
        {vetoButton}
      </Screen>
    ) : (
      <WaitingScreen
        title={`${s.ownerName} is presenting`}
        hint={`${s.ownerName}'s book · ${where}. Your turn comes when your book is up.`}
        mood="watch"
      />
    );
  const label = !s.lastPage ? 'Next page ▸' : s.lastBook ? 'Finish ▸' : 'Next book ▸';
  return (
    <Screen
      title={tvOff ? 'Your book is up' : 'Your book is on the TV'}
      footer={
        <PrimaryButton onClick={() => send({ type: 'turn' })} disabled={view.paused}>
          {label}
        </PrimaryButton>
      }
    >
      <p className={styles.kicker}>
        {where} ·{' '}
        {s.pageKind === 'word' ? 'your word' : s.pageKind === 'draw' ? 'a drawing' : 'a guess'}
      </p>
      {page}
      {vetoButton}
      <p className={styles.hint}>
        Read it out, let everyone look, then turn the page.
        {tvOff
          ? ' It turns by itself if you take too long.'
          : ' The TV turns it for you if you take too long.'}
      </p>
    </Screen>
  );
}

/** The page on stage, on a phone (a "phone only" room): the word, the drawing or the guess. */
function PhonePage({ page }: { page: PageView }): JSX.Element {
  if (page.kind === 'word')
    return (
      <p className={styles.phonePage}>
        <span className={styles.phonePageWho}>{page.authorName}'s secret word</span>
        <span className={styles.phoneWord}>“{page.text}”</span>
      </p>
    );
  if (page.kind === 'draw')
    return (
      <p className={styles.phonePage}>
        <span className={styles.phonePageWho}>{page.authorName} drew</span>
        <DrawingView drawing={page.drawing} size="100%" label={`${page.authorName}'s drawing`} />
      </p>
    );
  return (
    <p className={styles.phonePage}>
      <span className={styles.phonePageWho}>{page.authorName} guessed</span>
      <span className={`${styles.phoneWord} ${page.text === null ? styles.phoneWordNone : ''}`}>
        {page.text ?? '???'}
      </span>
    </p>
  );
}
