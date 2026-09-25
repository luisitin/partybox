// Phone for Spy Grid: routes by phase and role (SPEC §9.5 "Phone by role"). Input phases carry
// everything a player needs to act (Part 00 §3.7); reveals say "👀 Watch the TV" and update the
// board only once the TV has turned the card; the guessing team's phones play their own verdict.
import { useEffect, useRef } from 'react';
import type { JSX } from 'react';
import {
  PrimaryButton,
  Screen,
  buzz,
  useHold,
  usePhoneOnly,
  useSound,
  useT,
} from '@partybox/game-sdk/ui';
import type { GameControllerProps, Translator } from '@partybox/game-sdk/ui';
import type { SpyControllerView } from '../server/views';
import type { Input } from '../server/types';
import { BoardScreen } from './BoardScreen';
import { Coach } from './Coach';
import { ClueInputs, SendClue, useClueDraft } from './ClueForm';
import { SHAPE, other, reasonLine } from './model';
import { useVoice } from './moments';
import { ClueLine, PhoneBoard, Scores } from './PhoneParts';
import { PhoneGuess } from './PhoneGuess';
import { PhoneTeams } from './PhoneTeams';
import { SpyKey } from './SpyKey';
import styles from './Controller.module.css';
import { STRINGS } from './strings';

type V = SpyControllerView;
const team = (t: 'sun' | 'moon', L: Translator): string => (t === 'sun' ? L('Sun') : L('Moon'));

/** The guessing team's phones feel their own card: `correct` / `wrong` once it shows (stage 2). */
function useVerdict(view: V): void {
  const play = useSound();
  const said = useRef<number | null>(null);
  const card = view.flipping?.shown ? view.flipping.card : null;
  const kind = card === null ? null : view.kinds[card];
  const mineTurn = view.team !== null && view.team === view.turnTeam && view.role !== 'spectator';
  useEffect(() => {
    if (card === null || !kind || !mineTurn || said.current === card) return;
    said.current = card;
    const good = kind === view.turnTeam;
    play(good ? 'correct' : 'wrong');
    buzz(good ? [30, 40, 30] : 120);
  }, [card, kind, mineTurn, view.turnTeam, play]);
}

function Watching({
  view,
  spy,
  send,
}: {
  view: V;
  spy: boolean;
  send: (i: Input) => void;
}): JSX.Element {
  const draft = useClueDraft();
  const active = spy && view.phaseId === 'clue' && view.team === view.turnTeam;
  return (
    // The clue box sits above the key: near the top, the phone's keyboard never covers it, and a
    // phone held sideways keeps it (and Send) in the left column beside the key.
    <BoardScreen
      footer={active ? <SendClue view={view} draft={draft} send={send} /> : undefined}
      side={
        <>
          <Scores view={view} />
          {view.phaseId === 'guess' ? <ClueLine view={view} /> : null}
          <Coach view={view} />
          {active ? <ClueInputs view={view} draft={draft} /> : null}
        </>
      }
      board={spy ? <SpyKey view={view} /> : <PhoneBoard view={view} />}
    />
  );
}

function Reveal({ view }: { view: V }): JSX.Element {
  const L = useT(STRINGS);
  const phoneOnly = usePhoneOnly();
  const flipping = view.phaseId === 'flip' ? (view.flipping?.card ?? null) : null;
  const line =
    view.phaseId === 'flip'
      ? phoneOnly
        ? L('The card turns…')
        : L('👀 Watch the TV')
      : view.ended === 'noClue'
        ? L('No clue!')
        : view.mode === 'coop'
          ? L('Next clue…')
          : L("{shape} {team}'s turn", {
              shape: SHAPE[other(view.turnTeam)],
              team: team(other(view.turnTeam), L),
            });
  return (
    <BoardScreen
      side={
        <>
          <Scores view={view} />
          <div className={styles.watch} key={`${view.phaseId}${flipping ?? ''}`}>
            {line}
          </div>
        </>
      }
      board={<PhoneBoard view={view} focus={flipping} />}
    />
  );
}

function Result({ view, skip }: { view: V; skip?: () => void }): JSX.Element {
  const L = useT(STRINGS);
  // The TV shows the result first (its banner lands, then the ripple); the phone follows.
  const shown = useHold(view.deadline, 1200);
  const w = view.winner;
  const won = view.mode === 'coop' ? w === 'sun' : w !== null && w === view.team;
  const head =
    view.mode === 'coop'
      ? w === 'sun'
        ? L('Mission complete! 🕶️')
        : L('Mission failed')
      : w === 'draw' || w === null
        ? L("It's a draw")
        : won
          ? L('Your team wins! 🎉')
          : L('{team} wins', { team: team(w, L) });
  return (
    <Screen
      className={styles.screen}
      footer={
        skip ? (
          <PrimaryButton onClick={skip}>
            {view.round < view.rounds ? L('Next round') : L('See results')}
          </PrimaryButton>
        ) : undefined
      }
    >
      <div className={styles.stack}>
        {shown ? (
          <div className={`${styles.result} ${won ? styles.won : ''}`}>
            <div className={styles.resultHead}>{head}</div>
            {reasonLine(view, L) ? (
              <div className={styles.resultWhy}>{reasonLine(view, L)}</div>
            ) : null}
          </div>
        ) : (
          <div className={styles.watch}>{L('👀 Watch the TV')}</div>
        )}
        <PhoneBoard view={view} />
      </div>
    </Screen>
  );
}

export function Controller({ view, send, skip }: GameControllerProps<V, Input>): JSX.Element {
  const L = useT(STRINGS);
  const phoneOnly = usePhoneOnly();
  useVoice(view, phoneOnly);
  useVerdict(view);
  if (view.phaseId === 'teams') return <PhoneTeams view={view} send={send} skip={skip} />;
  if (view.phaseId === 'done')
    return (
      <Screen className={styles.screen}>
        <div className={styles.status}>{L('Thanks for playing!')}</div>
      </Screen>
    );
  if (view.phaseId === 'win') return <Result view={view} skip={skip} />;
  if (view.phaseId === 'flip' || view.phaseId === 'turn-end') return <Reveal view={view} />;
  if (view.role === 'guesser' && view.phaseId === 'guess')
    return <PhoneGuess view={view} send={send} />;
  return <Watching view={view} spy={view.role === 'spymaster'} send={send} />;
}
