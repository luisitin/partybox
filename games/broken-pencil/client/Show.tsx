// The show phase on a phone: the presenter turns the pages of their own book; everyone else
// watches the TV — or, in a "phone only" room, reads the page on the phone. Split from
// Controller.tsx at the 300-line cap.
import { useState } from 'react';
import type { JSX } from 'react';
import { PrimaryButton, Screen, WaitingScreen, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps, Translator } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { PageView, PencilControllerView } from '../server/views';
import { DrawingView } from './DrawingView';
import styles from './Controller.module.css';
import { STRINGS } from './strings';

/** The presenter's button: the next page, the next book, or the end of the show. */
function turnLabel(L: Translator, lastPage: boolean, lastBook: boolean): string {
  if (!lastPage) return L('Next page ▸');
  return lastBook ? L('Finish ▸') : L('Next book ▸');
}

/** The show: the presenter turns the pages of their own book; everyone else watches the TV. */
export function Show({
  view,
  send,
}: GameControllerProps<PencilControllerView, Input>): JSX.Element {
  const L = useT(STRINGS);
  const s = view.showing;
  const tvOff = view.phoneOnly === true;
  if (!s)
    return (
      <WaitingScreen title={tvOff ? L('The show is next…') : L('Watch the TV')} mood="watch" />
    );
  const at = { page: s.page + 1, pages: view.pageCount };
  const where = L('page {page} of {pages}', at);
  // A "phone only" room reads the book on the phone: the page on stage, for everyone. A TV room's
  // phone holds a thumbnail of it (I-796 K): the TV stays the stage, the phone is not a blank wall.
  const page = !s.current ? null : tvOff ? (
    <PhonePage key={`${s.book}:${s.page}`} page={s.current} />
  ) : (
    <div className={styles.thumb} data-page-thumb>
      <span className={styles.thumbOn}>{L('On the TV now')}</span>
      <PhonePage key={`${s.book}:${s.page}`} page={s.current} />
    </div>
  );
  // The VIP's "close enough" on a broken last page (the owner, 2026-09-21): the server takes the
  // veto from the VIP alone (ADR-042); the verdict on stage flips to intact.
  const vetoButton =
    s.verdict === 'broken' && view.vip === view.me.id ? (
      <button
        type="button"
        className={styles.veto}
        onClick={() => send({ type: 'veto', book: s.book })}
      >
        {L('close enough ✓ — count it')}
      </button>
    ) : null;
  if (!s.presenting)
    return page || vetoButton ? (
      <Screen title={L('{name} is presenting', { name: s.ownerName })}>
        <p className={styles.kicker}>
          {L("{name}'s book · page {page} of {pages}", { name: s.ownerName, ...at })}
        </p>
        {page}
        {vetoButton}
        {tvOff ? null : <p className={styles.hint}>{L('Your turn comes when your book is up.')}</p>}
      </Screen>
    ) : (
      <WaitingScreen
        title={L('{name} is presenting', { name: s.ownerName })}
        hint={L("{name}'s book · page {page} of {pages}. Your turn comes when your book is up.", {
          name: s.ownerName,
          ...at,
        })}
        mood="watch"
      />
    );
  return (
    <Screen
      title={tvOff ? L('Your book is up') : L('Your book is on the TV')}
      footer={
        <PrimaryButton onClick={() => send({ type: 'turn' })} disabled={view.paused}>
          {turnLabel(L, s.lastPage, s.lastBook)}
        </PrimaryButton>
      }
    >
      <p className={styles.kicker}>
        {where} ·{' '}
        {s.pageKind === 'word'
          ? L('your word')
          : s.pageKind === 'draw'
            ? L('a drawing')
            : L('a guess')}
      </p>
      {/* I-228 A: the presenter holds the page they're reading out — a TV room too */}
      {s.current ? <PhonePage key={`${s.book}:${s.page}`} page={s.current} /> : null}
      {/* I-228 B: the next page, face down — the presenter can set up the beat */}
      {s.next ? <NextPeek key={`${s.book}:${s.page}:next`} page={s.next} /> : null}
      {vetoButton}
      <p className={styles.hint}>
        {L('Read it out, let everyone look, then turn the page.')}{' '}
        {tvOff
          ? L('It turns by itself if you take too long.')
          : L('The TV turns it for you if you take too long.')}
      </p>
    </Screen>
  );
}

/** The page on stage, on a phone (a "phone only" room): the word, the drawing or the guess. */
function PhonePage({ page }: { page: PageView }): JSX.Element {
  const L = useT(STRINGS);
  const name = page.authorName;
  if (page.kind === 'word')
    return (
      <p className={styles.phonePage}>
        <span className={styles.phonePageWho}>{L("{name}'s secret word", { name })}</span>
        <span className={styles.phoneWord}>“{page.text}”</span>
      </p>
    );
  if (page.kind === 'draw')
    return (
      <p className={styles.phonePage}>
        <span className={styles.phonePageWho}>{L('{name} drew', { name })}</span>
        <span className={styles.phoneSheet}>
          <DrawingView drawing={page.drawing} size="100%" label={L("{name}'s drawing", { name })} />
        </span>
      </p>
    );
  return (
    <p className={styles.phonePage}>
      <span className={styles.phonePageWho}>{L('{name} guessed', { name })}</span>
      <span className={`${styles.phoneWord} ${page.text === null ? styles.phoneWordNone : ''}`}>
        {page.text ?? '???'}
      </span>
    </p>
  );
}

/** I-228 B: the presenter's next page, face down until tapped. */
function NextPeek({ page }: { page: PageView }): JSX.Element {
  const L = useT(STRINGS);
  const [open, setOpen] = useState(false);
  const who =
    page.kind === 'draw'
      ? L("Next: {name}'s drawing", { name: page.authorName })
      : L("Next: {name}'s guess", { name: page.authorName });
  return (
    <div className={styles.peek}>
      <button type="button" className={styles.peekWho} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {who} · <span className={styles.peekHint}>{open ? L('hide') : L('tap to peek')}</span>
      </button>
      {open ? <PhonePage page={page} /> : null}
    </div>
  );
}
