// TV view for Broken Pencil. While playing the stage shows only progress (never a page); during
// the show it turns one page at a time — the filmstrip of pages shown so far on the left, the
// current page big on the right, the verdict on a book's last page.
import type { JSX } from 'react';
import { Avatar, BigText, Stage } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { PageView, PencilTvView } from '../server/views';
import { DrawingView } from './DrawingView';
import styles from './Tv.module.css';

function Progress({ view }: { view: PencilTvView }): JSX.Element {
  const done = view.progress.filter((p) => p.done).length;
  return (
    <>
      <ul className={styles.cards} aria-label="who is done">
        {view.progress.map((p) => {
          const player = view.players.find((x) => x.id === p.playerId);
          return (
            <li key={p.playerId} className={`${styles.card} ${p.done ? styles.cardDone : ''}`}>
              <Avatar
                avatarId={player?.avatarId ?? ''}
                size={72}
                dim={player?.connected === false}
              />
              <span className={styles.cardName}>{player?.name ?? '?'}</span>
              <span className={styles.cardMark} aria-label={p.done ? 'done' : 'working'}>
                {p.done ? '✓' : '✏️'}
              </span>
            </li>
          );
        })}
      </ul>
      <p className={styles.count} role="status">
        {done} of {view.progress.length} done
      </p>
    </>
  );
}

function Thumb({ page }: { page: PageView }): JSX.Element {
  if (page.kind === 'draw')
    return (
      <li className={styles.thumb}>
        <DrawingView drawing={page.drawing} size={120} label={`${page.authorName}'s drawing`} />
      </li>
    );
  return (
    <li className={`${styles.thumb} ${styles.thumbText}`}>
      <span className={styles.thumbWho}>{page.kind === 'word' ? 'word' : page.authorName}</span>
      <span>{page.text ?? '???'}</span>
    </li>
  );
}

function CurrentPage({ page }: { page: PageView }): JSX.Element {
  if (page.kind === 'word')
    return (
      <div className={`${styles.page} pb-enter`}>
        <p className={styles.pageWho}>{page.authorName}'s secret word</p>
        <BigText level="display">“{page.text}”</BigText>
      </div>
    );
  if (page.kind === 'draw')
    return (
      <div className={`${styles.page} pb-enter`}>
        <p className={styles.pageWho}>{page.authorName} drew</p>
        <DrawingView
          drawing={page.drawing}
          size="min(62vh, 560px)"
          label={`${page.authorName}'s drawing`}
        />
      </div>
    );
  return (
    <div className={`${styles.page} pb-enter`}>
      <p className={styles.pageWho}>{page.authorName} guessed</p>
      <BigText level="display" tone={page.text === null ? 'muted' : 'default'}>
        {page.text ?? '???'}
      </BigText>
    </div>
  );
}

export function Tv({ view }: GameTvProps<PencilTvView>): JSX.Element {
  if (view.phaseId === 'pick') {
    const picked = view.progress.filter((p) => p.done).length;
    return (
      <Stage center>
        <BigText level="display" tone="accent">
          Broken Pencil
        </BigText>
        <BigText level="h2">Pick a secret word on your phone.</BigText>
        <ol className={styles.howto}>
          <li>Draw your word.</li>
          <li>Pass the book on — the next player guesses what it is.</li>
          <li>The next one draws that guess… all the way round.</li>
          <li>Then we read every book, page by page.</li>
        </ol>
        <p className={styles.count} role="status">
          {picked} of {view.progress.length} picked
        </p>
      </Stage>
    );
  }

  if (view.phaseId === 'draw' || view.phaseId === 'guess') {
    return (
      <Stage>
        <div className={styles.head}>
          <BigText level="h1">
            {view.phaseId === 'draw' ? 'Everyone is drawing…' : 'Everyone is guessing…'}
          </BigText>
          <p className={styles.kicker}>
            page {view.step + 1} of {view.pageCount}
          </p>
        </div>
        <Progress view={view} />
      </Stage>
    );
  }

  if (view.phaseId === 'show' && view.showing) {
    const s = view.showing;
    const current = s.pages[s.page];
    const last = s.verdict !== null;
    return (
      <Stage>
        <div className={styles.head}>
          <BigText level="h1" tone="accent">
            {s.ownerName}'s book
          </BigText>
          <p className={styles.kicker}>
            book {s.book + 1} of {view.bookCount} · page {s.page + 1} of {view.pageCount}
          </p>
        </div>
        <div className={styles.showBody}>
          <ul className={styles.strip} aria-label="pages so far">
            {s.pages.slice(0, -1).map((p, i) => (
              <Thumb key={i} page={p} />
            ))}
          </ul>
          <div className={styles.current}>
            {current ? <CurrentPage page={current} /> : null}
            {last ? (
              <div
                className={`${styles.verdict} ${s.verdict === 'intact' ? styles.intact : styles.broken} pb-enter`}
              >
                <span className={styles.verdictLine}>{s.verdictLine}</span>
                <span className={styles.verdictPair}>
                  “{s.pages[0]?.kind === 'word' ? s.pages[0].text : '—'}” → “
                  {current?.kind === 'guess' ? (current.text ?? '???') : '—'}”
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </Stage>
    );
  }

  const summary = view.summary ?? [];
  return (
    <Stage>
      <BigText level="h1" tone="accent">
        {view.intactBooks} of {view.bookCount} books survived
      </BigText>
      <p className={styles.kicker}>every book, first word → last guess</p>
      <ul className={styles.summary}>
        {summary.map((b) => (
          <li key={b.ownerId} className={styles.summaryRow}>
            <span className={styles.summaryOwner}>{b.ownerName}</span>
            <span className={styles.summaryPair}>
              {b.word} → {b.last}
            </span>
            <span className={b.intact ? styles.intactMark : styles.brokenMark}>
              {b.intact ? '✓ unbroken' : '✕ broken'}
            </span>
          </li>
        ))}
      </ul>
    </Stage>
  );
}
