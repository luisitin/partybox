// The phone for Tune In: one screen per role and phase (spec §5.5). `send` is the only way out;
// the server re-checks everything. Each input screen is keyed by the turn, so a new turn starts
// clean (no draft, no thumb) and rises in as a new card.
import type { JSX } from 'react';
import { PrimaryButton, Screen, WaitingScreen, buzz, useSound, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import { DialStrip } from '@partybox/game-sdk/ui/dial';
import type { TuneControllerView } from '../server/index';
import type { Input } from '../server/types';
import { modeLine, nameOf, steps, teamName } from './copy';
import { Countdown } from './Countdown';
import { LockRow } from './LockRow';
import { PhoneCall } from './PhoneCall';
import { PhoneDial } from './PhoneDial';
import { PsychicClue, PsychicDial } from './PhonePsychic';
import { PhoneResult, WatchTv } from './PhoneResult';
import styles from './phone.module.css';
import { STRINGS } from './strings';

type Props = GameControllerProps<TuneControllerView, Input>;

export function PhoneIntro({
  view,
  send,
}: {
  view: TuneControllerView;
  send: (input: Input) => void;
}): JSX.Element {
  const L = useT(STRINGS);
  const play = useSound();
  const counting = view.startAt !== null;
  const ready = (): void => {
    if (view.ready || counting) return;
    play('submit');
    buzz(12);
    send({ type: 'ready' });
  };
  return (
    <Screen
      className={styles.screen}
      footer={
        counting ? undefined : (
          <PrimaryButton
            className={view.ready ? undefined : styles.breathe}
            done={view.ready}
            onClick={ready}
          >
            {view.ready ? L('Ready!') : L('I’m ready')}
          </PrimaryButton>
        )
      }
    >
      <h2 className={styles.title}>{L('📻 Tune In')}</h2>
      <p className={styles.kicker}>{modeLine(L, view.turn.mode)}</p>
      {view.myTeam ? (
        <p className={`${styles.teamBadge} ${view.myTeam === 'sun' ? styles.sun : styles.moon}`}>
          {L("You're on {team}", { team: teamName(L, view.myTeam) })}
        </p>
      ) : null}
      <ol className={styles.steps}>
        {steps(L, view.turn.mode).map((s, i) => (
          <li key={s} className={styles.step} style={{ animationDelay: `${i * 120}ms` }}>
            {s}
          </li>
        ))}
      </ol>
      <p className={styles.readyNote} role="status">
        {view.ready
          ? L('Waiting for the others · {n} of {total} ready', {
              n: view.readyCount,
              total: view.readyHere,
            })
          : L('Read the rules, then tap I’m ready')}
      </p>
      {counting && view.startAt !== null ? (
        <div className={styles.countOverlay}>
          <Countdown startAt={view.startAt} paused={view.paused} size="phone" />
        </div>
      ) : null}
    </Screen>
  );
}

function WaitClue({ view }: { view: TuneControllerView }): JSX.Element {
  const L = useT(STRINGS);
  const name = nameOf(view.players, view.turn.psychic);
  // The psychic's phone dropped: the clue waits a moment for it, and the phones say so (as the TV).
  const away = view.players.find((p) => p.id === view.turn.psychic)?.connected === false;
  return (
    <WaitingScreen
      title={
        away
          ? L('Waiting for {name} to reconnect…', { name })
          : L('{name} is thinking of a clue…', { name })
      }
      hint={<span className={styles.roomy}>{L('Where would it land? Get ready to slide.')}</span>}
    >
      <DialStrip
        className={styles.waitStrip}
        left={view.turn.left}
        right={view.turn.right}
        target={null}
        bands={view.turn.bands}
      />
    </WaitingScreen>
  );
}

function WaitOthers({ view }: { view: TuneControllerView }): JSX.Element {
  const L = useT(STRINGS);
  const team = teamName(L, view.turn.team);
  const title =
    view.phaseId === 'call'
      ? L('The other team is calling LEFT or RIGHT…')
      : L('{team} is tuning in…', { team });
  const hint =
    view.phaseId === 'dial' && view.myTeam && view.myTeam !== view.turn.team
      ? L('Next, your team calls LEFT or RIGHT of their needle.')
      : L('Clue: “{clue}”', { clue: view.turn.clue ?? '' });
  return (
    <WaitingScreen title={title} hint={hint}>
      <LockRow players={view.players} phase={view.phaseId} />
    </WaitingScreen>
  );
}

export function Controller({ view, send, skip }: Props): JSX.Element {
  const L = useT(STRINGS);
  const key = `${view.turn.n}`;
  if (view.me.role === 'spectator')
    return <WaitingScreen mood="watch" title={L("You're in as soon as this one ends")} />;
  switch (view.phaseId) {
    case 'intro':
      return <PhoneIntro view={view} send={send} />;
    case 'clue':
      return view.role === 'psychic' ? (
        <PsychicClue key={key} view={view} send={send} />
      ) : (
        <WaitClue key={key} view={view} />
      );
    case 'dial':
      if (view.role === 'psychic') return <PsychicDial key={key} view={view} />;
      if (view.role === 'guesser') return <PhoneDial key={key} view={view} send={send} />;
      return <WaitOthers key={key} view={view} />;
    case 'call':
      return view.role === 'caller' ? (
        <PhoneCall key={key} view={view} send={send} />
      ) : (
        <WaitOthers key={key} view={view} />
      );
    case 'reveal':
      return view.reveal?.step === 1 || view.reveal?.void ? (
        <PhoneResult key={`${key}r`} view={view} />
      ) : (
        <WatchTv key={`${key}w`} />
      );
    case 'scores':
      return <PhoneResult key={`${key}s`} view={view} skip={skip} />;
    default:
      return <WaitingScreen mood="done" title={L('Thanks for playing!')} />;
  }
}
