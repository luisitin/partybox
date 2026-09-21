// TV view for Broken Pencil. While playing the stage shows only progress (never a page); during
// the show it turns one page at a time — the filmstrip of pages shown so far on the left, the
// current page big on the right, the verdict on a book's last page.
import { useEffect, useState } from 'react';
import type { CSSProperties, JSX } from 'react';
import { Avatar, BigText, Stage, useSound } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { PageView, PencilTvView } from '../server/views';
import { DrawingView } from './DrawingView';
import { Summary } from './Finale';
import styles from './Tv.module.css';

const STAGE_MARK = { guess: '💬', draw: '✏️', done: '✓' } as const;

/** One muted line under the counter, rotating every 8 s: a 60–90 s wait with something to read
 *  instead of an empty stage (review-loop #8). Keyed so each line rises in. */
const HINTS = {
  draw: [
    'Draw big — every picture goes on the TV at the end.',
    'No letters, no numbers: the pencil has to do the talking.',
    'Done early? Tap Done and watch the tiles fill in.',
  ],
  pass: [
    'Guess first, then draw your guess for the next player.',
    'Wrong guesses are the fun part — the chain shows every step.',
    'Stuck? A rough sketch beats a blank page.',
  ],
  guess: ['One word, best guess — then the reveal.', 'The whole chain shows on the TV next.'],
} as const;

function Hint({ phase }: { phase: keyof typeof HINTS }): JSX.Element {
  const [i, setI] = useState(0);
  useEffect(() => {
    const handle = setInterval(() => setI((n) => n + 1), 8000);
    return () => clearInterval(handle);
  }, [phase]);
  const lines = HINTS[phase];
  const line = lines[i % lines.length];
  return (
    <p key={line} className={`${styles.hint} pb-enter`} aria-live="off">
      {line}
    </p>
  );
}

/** I-024 B (the owner: "a lot slower"): each seat's glyph starts this long after the one before. */
const HANDOFF_STEP_MS = 450;
/** I-024 (the owner: "a quieter sound"): the per-seat pluck, at half gain and never standing in
 *  for the phase chime. */
const PLUCK = { quiet: true, gain: 0.5 } as const;

function Progress({ view }: { view: PencilTvView }): JSX.Element {
  const done = view.progress.filter((p) => p.stage === 'done').length;
  // I-024 B: the cards sit in SEAT order (`progress` is the seat ring) — the books pass along
  // the seats — and once per pass every glyph slides in from the seat on its left, a `card`
  // pluck per seat. Round 1 is not a hand-off (nobody has passed yet): the line still says which
  // way the books will go, but nothing slides and nothing plucks.
  const play = useSound();
  const seats = view.progress.length;
  const passing = view.phaseId === 'pass' || view.phaseId === 'guess';
  const phaseKey = `${view.phaseId}:${view.step}`;
  useEffect(() => {
    if (!passing) return;
    const ts = Array.from({ length: seats }, (_, i) =>
      setTimeout(() => play('card', PLUCK), i * HANDOFF_STEP_MS),
    );
    return () => ts.forEach((t) => clearTimeout(t));
    // `seats` is fixed for a phase, so the plucks play once per phase instance (phaseKey).
  }, [phaseKey, passing, play, seats]);
  // The glyph slides in only as the phase opens: a mid-phase stage change (💬 → ✏️) is not a
  // hand-off and must not hide the new glyph for its seat's delay.
  const opening = view.phaseId === 'draw' ? 'draw' : 'guess';
  return (
    <>
      <p className={styles.passWay} aria-hidden>
        books pass this way →
      </p>
      <ul className={styles.cards} aria-label="who is done" key={phaseKey}>
        {view.progress.map((p, seat) => {
          const player = view.players.find((x) => x.id === p.playerId);
          const finished = p.stage === 'done';
          // I-024 C: the seat on the left just finished — its book is arriving here.
          const left = view.progress[(seat + seats - 1) % seats];
          const receiving = left !== undefined && left.stage === 'done' && !finished;
          const handoff = passing && p.stage === opening;
          return (
            // I-024 A: keyed on the stage too, so a card that turns done remounts and lands once.
            <li
              key={`${p.playerId}:${finished ? 'done' : 'busy'}`}
              className={`${styles.card} ${finished ? styles.cardDone : ''} ${receiving ? styles.cardReceiving : ''}`}
              style={{ '--pb-i': seat } as CSSProperties}
            >
              <Avatar
                avatarId={player?.avatarId ?? ''}
                size={72}
                dim={player?.connected === false}
              />
              <span className={styles.cardName}>{player?.name ?? '?'}</span>
              {/* I-024 C: the book in their hands — it slides on to the right once they are done. */}
              <span
                key={`book:${finished ? 'gone' : 'here'}`}
                className={`${styles.book} ${finished ? styles.bookGone : ''}`}
                aria-hidden
              />
              <span
                // Keyed on the stage so a flip to ✓ remounts and pops (review-loop #19).
                key={p.stage}
                className={`${styles.cardMark} ${handoff ? styles.handoff : ''}`}
                aria-label={finished ? 'done' : p.stage === 'draw' ? 'drawing' : 'guessing'}
              >
                {STAGE_MARK[p.stage]}
              </span>
            </li>
          );
        })}
      </ul>
      <p className={styles.count} role="status">
        <span key={done} className={styles.countNum}>
          {done}
        </span>{' '}
        of {view.progress.length} done
      </p>
    </>
  );
}

/** Thumbnails the 1080 px stage fits beside the current page. */
const STRIP_MAX = 6;

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

/** The show's sheet: 560 px when the stage has it, else what is left under the "X drew" caption
 * (an eight-player roster leaves ~480 px; `.current` is the size container). */
const SHEET_SIZE = 'min(560px, calc(100cqh - 72px))';

function CurrentPage({ page }: { page: PageView }): JSX.Element {
  if (page.kind === 'word')
    return (
      // Three beats (review-loop #17): the kicker follows the title, then the word pops.
      <div className={styles.page}>
        <p className={`${styles.pageWho} ${styles.beat2}`}>{page.authorName}'s secret word</p>
        <div className={styles.beat3}>
          <BigText level="display">“{page.text}”</BigText>
        </div>
      </div>
    );
  if (page.kind === 'draw')
    return (
      <div className={`${styles.page} ${styles.flip}`}>
        <p className={styles.pageWho}>{page.authorName} drew</p>
        <DrawingView
          drawing={page.drawing}
          size={SHEET_SIZE}
          label={`${page.authorName}'s drawing`}
        />
      </div>
    );
  return (
    <div className={`${styles.page} ${styles.flip}`}>
      <p className={styles.pageWho}>{page.authorName} guessed</p>
      <BigText level="display" tone={page.text === null ? 'muted' : 'default'}>
        {page.text ?? '???'}
      </BigText>
    </div>
  );
}

export function Tv({ view }: GameTvProps<PencilTvView>): JSX.Element {
  if (view.phaseId === 'pick') {
    const picked = view.progress.filter((p) => p.stage === 'done').length;
    return (
      <Stage center>
        <BigText level="display" tone="accent">
          Broken Pencil
        </BigText>
        <BigText level="h2">Pick a secret word on your phone.</BigText>
        <ol className={styles.howto}>
          <li>Everyone draws their word.</li>
          <li>Your drawing goes to the next player: they guess it, then draw their guess.</li>
          <li>That goes on round the circle; the last player only guesses.</li>
          <li>Then everyone presents their own book on the TV, page by page.</li>
        </ol>
        <p className={styles.count} role="status">
          {picked} of {view.progress.length} picked
        </p>
      </Stage>
    );
  }

  if (view.phaseId === 'draw' || view.phaseId === 'pass' || view.phaseId === 'guess') {
    const title =
      view.phaseId === 'draw'
        ? 'Everyone is drawing their word…'
        : view.phaseId === 'pass'
          ? 'Guess the drawing, then draw your guess…'
          : 'Last guesses…';
    return (
      <Stage className={styles.waiting}>
        <div className={styles.head}>
          <BigText level="h1">{title}</BigText>
          <p className={styles.kicker}>
            round {view.step} of {view.stepCount}
          </p>
        </div>
        <div className={styles.waitBlock}>
          <Progress view={view} />
          <Hint phase={view.phaseId} />
        </div>
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
            {s.ownerName} turns the pages · book {s.book + 1} of {view.bookCount} · page{' '}
            {s.page + 1} of {view.pageCount}
          </p>
        </div>
        <div className={styles.showBody}>
          <ul className={styles.strip} aria-label="pages so far">
            {/* The stage fits about six thumbnails; a long chain keeps its newest pages (the context
                for the current one) and folds the rest into a count (review-loop #67). */}
            {s.pages.length - 1 > STRIP_MAX ? (
              <li className={styles.thumbMore}>{s.pages.length - 1 - STRIP_MAX} earlier pages…</li>
            ) : null}
            {s.pages
              .slice(0, -1)
              .slice(-STRIP_MAX)
              .map((p, i) => (
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

  return (
    <Stage>
      <Summary view={view} />
    </Stage>
  );
}
