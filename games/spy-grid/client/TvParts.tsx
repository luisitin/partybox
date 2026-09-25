// Pieces of the TV board: the clue bar (who is thinking, the clue, guesses left, End turn), the
// history strip, the turn's summary card and the round's winner banner.
import { useEffect } from 'react';
import type { JSX } from 'react';
import { Avatar, useSecondsLeft, useSound, useT } from '@partybox/game-sdk/ui';
import type { Translator } from '@partybox/game-sdk/ui';
import type { SpyTvView } from '../server/views';
import { SHAPE, faceOf, nameOf, other, pointersBy } from './model';
import type { Team } from './model';
import styles from './Tv.module.css';
import { STRINGS } from './strings';

export function teamName(t: Team, L: Translator): string {
  return t === 'sun' ? L('Sun') : L('Moon');
}

function Thinking({ view }: { view: SpyTvView }): JSX.Element {
  const L = useT(STRINGS);
  const team = view.turnTeam;
  const spy = view.spymaster[team];
  const face = spy ? faceOf(view, spy) : null;
  return (
    <div className={styles.thinking}>
      {face ? (
        <span className={styles.spyFace}>
          <Avatar avatarId={face.avatarId} size="100%" />
          <span className={styles.dots} aria-hidden>
            <i />
            <i />
            <i />
          </span>
        </span>
      ) : null}
      <div>
        {view.turnN === 1 ? (
          <div className={styles.kicker}>
            {view.mode === 'coop'
              ? L('Find all 9 agents in {n} clues', { n: view.cluesLeft ?? 0 })
              : L('{shape} {team} goes first: 9 agents', {
                  shape: SHAPE[view.starter],
                  team: teamName(view.starter, L),
                })}
          </div>
        ) : view.newSpymaster ? (
          <div className={styles.kicker}>
            {L('{name} is the new spymaster', { name: nameOf(view, view.newSpymaster) })}
          </div>
        ) : null}
        <div className={styles.thinkingLine}>
          {view.mode === 'coop'
            ? L('The spymaster is thinking…')
            : L("{shape} {team}'s spymaster is thinking…", {
                shape: SHAPE[team],
                team: teamName(team, L),
              })}
        </div>
      </div>
    </div>
  );
}

/** A clue is up to 20 letters: the bar's h1 steps down so the longest still fits beside End turn. */
function clueSize(word: string): string {
  const n = word.length;
  return n > 16
    ? (styles.clueXL ?? '')
    : n > 12
      ? (styles.clueLong ?? '')
      : n > 8
        ? (styles.clueMid ?? '')
        : '';
}

/** The guess step's seconds (the shell's timer is quiet on the board): red, ticking, last 5 s. */
function Clock({ view }: { view: SpyTvView }): JSX.Element | null {
  const left = useSecondsLeft(view.deadline, view.paused);
  const play = useSound();
  const urgent = left !== null && left <= 5 && left > 0;
  useEffect(() => {
    if (urgent && !view.paused) play('countdown', { quiet: true });
  }, [left, urgent, view.paused, play]);
  if (left === null) return null;
  return (
    <span
      key={urgent ? left : 'calm'}
      className={`${styles.clock} ${urgent ? styles.clockUrgent : ''}`}
    >
      {left}
    </span>
  );
}

export function ClueBar({ view }: { view: SpyTvView }): JSX.Element {
  const L = useT(STRINGS);
  if (view.phaseId === 'clue' || !view.clue)
    return (
      <div className={styles.clueBar}>
        <Thinking view={view} />
      </div>
    );
  const team = view.turnTeam;
  const endFaces = pointersBy(view).get('end') ?? [];
  const lands = view.phaseId === 'guess' && !view.canEnd;
  return (
    <div className={`${styles.clueBar} ${styles[`on-${team}`]}`}>
      {view.phaseId === 'guess' ? <Clock view={view} /> : null}
      <div
        className={`${styles.clueMain} ${clueSize(view.clue.word)} ${lands ? styles.clueLands : ''}`}
      >
        <span className={styles.clueShape}>{SHAPE[team]}</span>
        <span className={styles.clueWord}>{view.clue.word}</span>
        <span className={styles.clueDot}>·</span>
        <span className={styles.clueNum}>{view.clue.number}</span>
      </div>
      <div className={styles.clueMeta}>
        <span>{L('Guesses left: {n}', { n: view.guessesLeft })}</span>
        {view.cluesLeft !== null ? (
          <span>{L('Clues left: {n}', { n: view.cluesLeft })}</span>
        ) : null}
      </div>
      {view.canEnd && (view.phaseId === 'guess' || view.phaseId === 'flip') ? (
        <div className={`${styles.endTile} ${endFaces.length > 0 ? styles.endOn : ''}`}>
          <span className={styles.endIcon}>✋</span>
          <span className={styles.endLabel}>{L('End turn')}</span>
          <span className={styles.endCount}>{endFaces.length}</span>
        </div>
      ) : null}
    </div>
  );
}

export function History({ view }: { view: SpyTvView }): JSX.Element {
  const L = useT(STRINGS);
  const fresh = view.phaseId === 'guess' && !view.canEnd;
  const last = view.history.length - 1;
  return (
    <div className={styles.history}>
      {view.history.length > 0 ? (
        <div className={styles.historyTitle}>{L('Clues so far')}</div>
      ) : null}
      {view.history.map((h, i) => (
        <span
          key={`${i}${h.word}`}
          className={`${styles.chip} ${styles[`chip-${h.team}`]} ${fresh && i === last ? styles.chipNew : ''}`}
        >
          <b>{SHAPE[h.team]}</b> {h.word} {h.number} <span className={styles.arrow}>→</span>{' '}
          {L('{n} found', { n: h.found })}
        </span>
      ))}
    </div>
  );
}

export function TurnEndCard({ view }: { view: SpyTvView }): JSX.Element {
  const L = useT(STRINGS);
  const team = view.turnTeam;
  const found = view.history.at(-1)?.found ?? 0;
  const why =
    view.ended === 'noClue'
      ? L('No clue!')
      : view.ended === 'outOfGuesses'
        ? L('Out of guesses.')
        : view.ended === 'timeout'
          ? L("Time's up.")
          : null;
  const next = view.mode === 'coop' ? team : other(team);
  return (
    <div className={styles.turnCard}>
      {why ? <div className={styles.turnWhy}>{why}</div> : null}
      {view.ended !== 'noClue' ? (
        <div className={styles.turnFound}>
          {L('{shape} {team} found {n}.', {
            shape: SHAPE[team],
            team: teamName(team, L),
            n: found,
          })}
        </div>
      ) : null}
      <div className={`${styles.turnNext} ${styles[`text-${next}`]}`}>
        {view.mode === 'coop'
          ? L('Clues left: {n}', { n: view.cluesLeft ?? 0 })
          : L("{shape} {team}'s turn", { shape: SHAPE[next], team: teamName(next, L) })}
      </div>
    </div>
  );
}

export function reasonLine(view: SpyTvView, L: Translator): string {
  const w = view.winner;
  switch (view.reason) {
    case 'assassin':
      return L('{team} found the assassin!', { team: teamName(w === 'sun' ? 'moon' : 'sun', L) });
    case 'agents':
      return view.mode === 'coop'
        ? L('Every agent found!')
        : L('Every {team} agent found!', { team: teamName(w === 'moon' ? 'moon' : 'sun', L) });
    case 'cap':
      return w === 'draw'
        ? L('Out of turns: level on agents')
        : L('Out of turns: {team} had fewer agents left', {
            team: teamName(w === 'moon' ? 'moon' : 'sun', L),
          });
    case 'idle':
      return L("Nobody's talking!");
    case 'forfeit':
      return L('The other team left the game');
    case 'clues':
      return L('Out of clues');
    default:
      return '';
  }
}

export function WinBanner({ view }: { view: SpyTvView }): JSX.Element {
  const L = useT(STRINGS);
  const w = view.winner;
  const coop = view.mode === 'coop';
  const headline = coop
    ? w === 'sun'
      ? L('MISSION COMPLETE!')
      : L('MISSION FAILED')
    : w === 'draw' || w === null
      ? L("IT'S A DRAW")
      : L('{shape} {team} WINS!', { shape: SHAPE[w], team: teamName(w, L).toUpperCase() });
  const tone = coop ? (w === 'sun' ? 'sun' : 'lost') : w === 'sun' || w === 'moon' ? w : 'draw';
  return (
    <div className={`${styles.winBanner} ${styles[`win-${tone}`]}`}>
      <div className={styles.winHead}>{headline}</div>
      <div className={styles.winWhy}>{reasonLine(view, L)}</div>
      {!coop && view.rounds > 1 ? (
        <div className={styles.winRounds}>
          {L('Round {n} of {of}', { n: view.round, of: view.rounds })} · ▲ {view.roundWins.sun} –{' '}
          {view.roundWins.moon} ●
        </div>
      ) : null}
    </div>
  );
}
