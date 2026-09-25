// The end (SPEC §10.9): every role card flips in a ripple, the winning side's banner and why, and a
// short timeline ("Night 1: Dee · Day 1: Ben 🐺 · Night 2: saved"). The Finale keeps it on the
// results screen.
import type { JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { GameFinaleProps, Translator } from '@partybox/game-sdk/ui';
import type { NightfallTvView } from '../server/index';
import type { TimelineEntry } from '../server/views-common';
import { nameOf, playerOf, roleText } from './lookup';
import { RoleCard } from './RoleCard';
import { STRINGS } from './strings';
import styles from './Tv.module.css';

export function whyLine(view: NightfallTvView, L: Translator): string {
  const mafia = view.flavour === 'mafia';
  switch (view.stage.end?.reason) {
    case 'jester':
      return L('The jester got themselves voted out.');
    case 'wolvesGone':
      return mafia ? L('Every member of the mafia was found.') : L('Every wolf was found.');
    case 'wolvesEqual':
      return mafia ? L('The mafia equals the rest of the town.') : L('The wolves equal the rest.');
    case 'maxDays':
      return mafia ? L('The mafia survived the last day.') : L('The wolves survived the last day.');
    default:
      return '';
  }
}

function sideOf(role: string): string {
  return role === 'wolf' ? 'wolves' : role === 'jester' ? 'jester' : 'village';
}

function stepText(e: TimelineEntry, view: NightfallTvView, L: Translator): string {
  const role = roleText(view.cast, e.role);
  const who = e.id ? `${nameOf(view.players, e.id)}${role ? ` ${role.icon}` : ''}` : '';
  if (e.kind === 'night') {
    const what = e.id ? who : e.saved ? L('saved') : L('quiet');
    return `🌙 ${L('Night {n}', { n: e.n })}: ${what}`;
  }
  return `☀️ ${L('Day {n}', { n: e.n })}: ${e.id ? who : L('no one')}`;
}

export function EndBoard({
  view,
  finale,
}: {
  view: NightfallTvView;
  /** On the shell's results screen, which already says who won (ADR-052 headline). */
  finale?: boolean;
}): JSX.Element | null {
  const L = useT(STRINGS);
  const end = view.stage.end;
  if (!end) return null;
  const dead = new Set(view.graveyard.map((g) => g.id));
  return (
    <div className={styles.column}>
      {finale ? null : (
        <h1 className={`${styles.display} ${styles.banner}`}>{L.sent(end.headline)}</h1>
      )}
      <p className={styles.lead}>{whyLine(view, L)}</p>
      <div className={`${styles.cards} ${styles.endCards}`}>
        {end.roles.map((r, i) => {
          const who = playerOf(view.players, r.id);
          return (
            <RoleCard
              key={r.id}
              name={who?.name ?? ''}
              avatarId={who?.avatarId ?? ''}
              cast={view.cast}
              role={r.role}
              flipped
              size="small"
              delayMs={400 + i * 110}
              flipAfterMs={200}
              won={end.winner !== null && sideOf(r.role) === end.winner}
              dead={dead.has(r.id)}
            />
          );
        })}
      </div>
      {end.timeline.length > 0 ? (
        <ol className={styles.timeline}>
          {end.timeline.map((e) => (
            <li key={`${e.kind}${e.n}`} className={styles.step}>
              {stepText(e, view, L)}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

export function EndScene({ view }: { view: NightfallTvView }): JSX.Element {
  return <EndBoard view={view} />;
}

/** The results screen keeps the end board (clientModule.Finale). */
export function Finale({ lastView }: GameFinaleProps<NightfallTvView>): JSX.Element | null {
  return <EndBoard view={lastView} finale />;
}
