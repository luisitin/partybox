// The TV's moments on a phone (phone-only rooms; remote phones once F4 lands): the intro, the
// prompt, the reveal as a list — each picked face with the guessers under it, then the author card
// turning over — and the board. Every spoken line is on screen too (foundation §3.7).
import type { CSSProperties, JSX } from 'react';
import { Avatar, Scoreboard, Screen, useT } from '@partybox/game-sdk/ui';
import type { ControllerView, PushedView, ViewPlayer } from '@partybox/game-sdk/ui';
import type { WsPhoneView } from '../server/views';
import { boardRows } from './board';
import { PhoneIntro, PhonePrompt } from './Controller';
import { namesLine, verdictOf } from './lines';
import { STRINGS } from './strings';
import { useSay } from './useSay';
import styles from './phone.module.css';

function PhoneReveal({ view }: { view: WsPhoneView }): JSX.Element {
  const L = useT(STRINGS);
  const r = view.reveal;
  if (!r || !view.card) return <Screen>{null}</Screen>;
  const byId = new Map(view.players.map((p) => [p.id, p]));
  const shown = r.step === 'shown';
  const picked = view.seated.filter((id) => Object.values(r.guesses).includes(id));
  const verdict = shown ? verdictOf(r) : null;
  const authors = r.authors.map((id) => byId.get(id)?.name ?? '?');
  return (
    <Screen>
      <div className={styles.quote}>
        <p className={styles.quoteText}>{view.card.text}</p>
      </div>
      <div className={styles.flipArea} aria-live="polite">
        {shown ? (
          <div className={styles.flipCard}>
            <span className={styles.flipFaces}>
              {r.authors.map((id) => (
                <Avatar key={id} avatarId={byId.get(id)?.avatarId ?? 'ghost'} size={56} />
              ))}
            </span>
            <p className={styles.flipName}>{namesLine(L, authors)}</p>
            {verdict ? (
              <p className={styles.hint}>
                {verdict === 'everyone' ? L('Everyone knew!') : L('Nobody saw that coming!')}
              </p>
            ) : null}
          </div>
        ) : (
          <p className={styles.itWas}>{L('It was…')}</p>
        )}
      </div>
      <ul className={styles.picks}>
        {picked.map((id) => {
          const p = byId.get(id) as ViewPlayer;
          const author = shown && r.authors.includes(id);
          const guessers = Object.keys(r.guesses).filter((g) => r.guesses[g] === id);
          return (
            <li key={id} className={`${styles.pick} ${author ? styles.pickAuthor : ''}`}>
              <Avatar avatarId={p.avatarId} size={32} />
              <span className={styles.pickName}>{p.name}</span>
              <span className={styles.pickers}>
                {guessers.map((g, i) => (
                  <span key={g} className={styles.picker} style={{ '--i': i } as CSSProperties}>
                    <Avatar avatarId={byId.get(g)?.avatarId ?? 'ghost'} size={24} />
                  </span>
                ))}
              </span>
            </li>
          );
        })}
      </ul>
    </Screen>
  );
}

function StageBoard({ view }: { view: WsPhoneView }): JSX.Element {
  const L = useT(STRINGS);
  return (
    <Screen>
      {view.empty ? <p className={styles.nobody}>{L('Nobody answered!')}</p> : null}
      <p className={styles.kicker}>
        {view.last
          ? L('Final scores')
          : L('Scores after question {n} of {total}', { n: view.n, total: view.total })}
      </p>
      <Scoreboard compact highlightId={view.me.id} rows={boardRows(view)} noTrophy />
    </Screen>
  );
}

export function PhoneStage({ view: pushed }: { view: PushedView<ControllerView> }): JSX.Element {
  // The shell types the slot with the bare envelope; this game's controller view is what arrives.
  const view = pushed as PushedView<WsPhoneView>;
  useSay(view.say, view.startedAt, view.phaseId, view.deadline);
  switch (view.phaseId) {
    case 'intro':
      return <PhoneIntro />;
    case 'prompt':
      return <PhonePrompt view={view} />;
    case 'reveal':
      return <PhoneReveal view={view} />;
    default:
      return <StageBoard view={view} />;
  }
}
