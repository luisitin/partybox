// The TV's input-phase scenes: roles (the public role list), night (faces with ✓, nothing else),
// day (the question, the village, the hunch bars, the ready count, the town board) and the vote.
import type { JSX } from 'react';
import { Avatar, useT } from '@partybox/game-sdk/ui';
import type { NightfallTvView } from '../server/index';
import { Count } from './Count';
import { castLine, nameOf, playerOf } from './lookup';
import { rulesFor } from './rules';
import { useStepCue } from './useNarrator';
import { STRINGS } from './strings';
import { Village } from './Village';
import styles from './Tv.module.css';

export function CastPills({ view }: { view: NightfallTvView }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <ul className={styles.cast} aria-label={L('The roles in this game')}>
      {castLine(view.cast, L.sent).map((c, i) => (
        <li key={c.key} className={styles.pill} style={{ animationDelay: `${200 + i * 120}ms` }}>
          <span aria-hidden="true">{c.icon}</span> {c.text}
        </li>
      ))}
    </ul>
  );
}

export function RolesScene({ view }: { view: NightfallTvView }): JSX.Element {
  const L = useT(STRINGS);
  useStepCue(`roles:${view.step}`, view.step === 0 ? 'card' : null);
  // Step 0: the rules and the ready-up; step 1: everyone's in, the 3 · 2 · 1 (owner, cc45f4).
  if (view.countEnd !== null)
    return (
      <div className={`${styles.column} ${styles.centered}`}>
        <p className={styles.kicker}>{L('Everyone’s ready!')}</p>
        <Count until={view.countEnd} line={L('Night 1 is falling…')} size="tv" />
      </div>
    );
  const ready = view.players.filter((p) => p.status === 'submitted').length;
  return (
    <div className={styles.column}>
      <p className={styles.kicker}>🌙 Nightfall · {L('How to play')}</p>
      <ol className={styles.rules}>
        {rulesFor(view.flavour, L).map((r, i) => (
          <li key={r.icon} className={styles.rule} style={{ animationDelay: `${150 + i * 220}ms` }}>
            <span className={styles.ruleIcon} aria-hidden="true">
              {r.icon}
            </span>
            <span>{r.text}</span>
          </li>
        ))}
      </ol>
      <CastPills view={view} />
      <Village
        players={view.players}
        living={view.living}
        graveyard={view.graveyard}
        cast={view.cast}
        checks
        narrow
      />
      <p className={styles.caption} aria-live="polite">
        ✋ {L('{ready} of {total} ready', { ready, total: view.living.length })} ·{' '}
        {L('Tap I’m ready on your phone when you’ve read this.')}
      </p>
    </div>
  );
}

export function NightScene({ view }: { view: NightfallTvView }): JSX.Element {
  const L = useT(STRINGS);
  const picked = view.players.filter((p) => view.living.includes(p.id) && p.status === 'submitted');
  return (
    <div className={styles.column}>
      <h1 className={`${styles.display} ${styles.nightTitle}`}>
        {L('Night {n}', { n: view.day })}
      </h1>
      <p className={styles.lead}>{L('Everyone, look at your phone and keep it close.')}</p>
      <Village
        players={view.players}
        living={view.living}
        graveyard={view.graveyard}
        cast={view.cast}
        checks
      />
      <p className={styles.caption} aria-live="polite">
        {L('{done} of {total} have chosen', { done: picked.length, total: view.living.length })}
      </p>
    </div>
  );
}

export function DayScene({ view }: { view: NightfallTvView }): JSX.Element {
  const L = useT(STRINGS);
  const board = view.townBoard;
  return (
    <div className={`${styles.day} ${board ? styles.withBoard : ''}`}>
      <div className={styles.column}>
        <div className={styles.dayHead}>
          <h2 className={styles.h2}>
            ☀️ {L('Day {n}', { n: view.day })} · {L.sent(view.question)}
          </h2>
          <span className={styles.ready} aria-live="polite">
            ✋{' '}
            {L('{ready} of {living} ready to vote', {
              ready: view.readyCount,
              living: view.livingCount,
            })}
          </span>
        </div>
        <Village
          players={view.players}
          living={view.living}
          graveyard={view.graveyard}
          cast={view.cast}
          tally={view.stage.tally}
          checks
          narrow={board}
        />
      </div>
      {board ? <TownBoard view={view} /> : null}
    </div>
  );
}

function TownBoard({ view }: { view: NightfallTvView }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <aside className={styles.board} aria-label={L('Town board')}>
      <h3 className={styles.boardTitle}>📜 {L('Town board')}</h3>
      {view.board.length === 0 ? (
        <p className={styles.boardEmpty}>{L('Posts from the phones appear here.')}</p>
      ) : (
        <ol className={styles.posts}>
          {view.board.map((post, i) => {
            const who = playerOf(view.players, post.by);
            return (
              <li key={`${post.by}-${i}-${post.text}`} className={styles.post}>
                {who ? (
                  <span className={styles.postFace}>
                    <Avatar avatarId={who.avatarId} size="100%" />
                  </span>
                ) : null}
                <span className={styles.postBody}>
                  <span className={styles.postName}>{nameOf(view.players, post.by)}</span>
                  <span className={styles.postText}>{post.text}</span>
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </aside>
  );
}

export function VoteScene({ view }: { view: NightfallTvView }): JSX.Element {
  const L = useT(STRINGS);
  const runoff = view.runoff;
  const title = runoff
    ? L('Tie! {names}?', { names: runoff.map((id) => nameOf(view.players, id)).join(L(' or ')) })
    : L('Vote now');
  const voted = view.players.filter((p) => view.living.includes(p.id) && p.status === 'submitted');
  return (
    <div className={styles.column}>
      <h1 className={styles.h1}>🗳️ {title}</h1>
      <p className={styles.lead}>
        {runoff ? L('Vote again: only the tied players, or No one.') : L('Vote on your phone.')}
      </p>
      <Village
        players={view.players}
        living={view.living}
        graveyard={view.graveyard}
        cast={view.cast}
        checks
        spotlight={null}
      />
      <p className={styles.caption} aria-live="polite">
        {L('{done} of {total} have voted', { done: voted.length, total: view.living.length })}
      </p>
    </div>
  );
}
