// The phone in the stage phases. At the TV: how to play, "👀 Watch the TV" while the herd lands,
// then your own line once the TV has shown it. Without a TV to look at (a phone-only room, and the
// per-phone remote stage once F4 stamps it into the same flag), the phone shows the stage itself:
// the groups with their counts, the verdict, the sheep's move and a compact race — and plays the
// readings. The VIP's buttons (Let's go, Next, Next question) ride in the sticky footer.
import type { JSX } from 'react';
import {
  Avatar,
  DeadlineBar,
  PrimaryButton,
  Screen,
  useCountUp,
  useT,
} from '@partybox/game-sdk/ui';
import type { PushedView, Translator } from '@partybox/game-sdk/ui';
import type { HerdControllerView } from '../server/views';
import { bannerAtMs, SPOKEN_AT_MS } from '../server/timing';
import { useLines, useStageBeats } from './beats';
import { kicker, resultLine, verdictLine } from './labels';
import { SettingsPill } from './Settings';
import { SheepCoin } from './SheepCoin';
import { STRINGS } from './strings';
import styles from './Controller.module.css';

type V = PushedView<HerdControllerView>;

function vipButton(label: string, skip: (() => void) | undefined): JSX.Element | undefined {
  return skip ? <PrimaryButton onClick={skip}>{label}</PrimaryButton> : undefined;
}

function GroupList({
  view,
  verdict,
  L,
}: {
  view: V;
  verdict: boolean;
  L: Translator;
}): JSX.Element {
  const name = (id: string): string => view.players.find((p) => p.id === id)?.name ?? '?';
  return (
    <ul className={styles.groups}>
      {(view.groups ?? []).map((g) => {
        const herd = verdict && g.key === view.herd;
        const lone = verdict && g.members.length === 1 && g.members[0] === view.lone;
        return (
          <li key={g.key} className={`${styles.group} ${herd ? styles.groupHerd : ''}`}>
            <span className={styles.groupLabel}>
              {herd ? '🐑 ' : ''}
              {g.label}
            </span>
            <span className={styles.groupCount}>{g.members.length}</span>
            <span className={styles.groupNames}>
              {g.members.map(name).join(', ')}
              {lone ? ` · ${L('the Black Sheep')}` : ''}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function PhoneHerd({
  view,
  skip,
  phoneOnly,
}: {
  view: V;
  skip?: () => void;
  phoneOnly: boolean;
}): JSX.Element {
  const L = useT(STRINGS);
  const cards = (view.groups ?? []).reduce((n, g) => n + g.members.length, 0);
  const spoken = view.lines.find((l) => l.cue === 'spoken')?.ms ?? null;
  const beat = useStageBeats([0, SPOKEN_AT_MS, bannerAtMs(cards, spoken)], view.paused);
  useLines(view.lines, { spoken: 1, herd: 2, tie: 2, baa: 2 }, beat, phoneOnly);
  const herd = view.groups?.find((g) => g.key === view.herd);
  const mine = view.mine?.tile
    ? view.tiles?.find((t) => t.id === view.mine?.tile)?.label
    : (view.mine?.text ?? null);
  if (!phoneOnly) {
    return (
      <Screen footer={vipButton(L('Next'), skip)}>
        <div className={styles.topRight}>
          <SettingsPill />
        </div>
        <div className={styles.watch}>
          <span className={styles.eyes} aria-hidden>
            👀
          </span>
          <h2 className={styles.watchTitle}>{L('Watch the TV')}</h2>
          <p className={styles.note}>
            {mine ? L('You said {answer}', { answer: mine }) : L('No answer this time.')}
          </p>
        </div>
      </Screen>
    );
  }
  return (
    <Screen footer={vipButton(L('Next'), skip)}>
      <div className={styles.kickerRow}>
        <p className={styles.kicker}>{kicker(view.n, view.total, view.target, L)}</p>
        <SettingsPill />
      </div>
      <h2 className={styles.promptSmall}>{view.prompt}</h2>
      <p className={styles.verdict} aria-live="polite">
        {beat >= 2 ? verdictLine(view.outcome, herd?.label ?? '', L) : L('The answers are in…')}
      </p>
      <GroupList view={view} verdict={beat >= 2} L={L} />
    </Screen>
  );
}

export function PhoneScore({
  view,
  skip,
  phoneOnly,
}: {
  view: V;
  skip?: () => void;
  phoneOnly: boolean;
}): JSX.Element {
  const L = useT(STRINGS);
  const beat = useStageBeats([0, 900, 2300], view.paused);
  useLines(view.lines, { sheep: 1, winner: 2 }, beat, phoneOnly);
  const r = view.result;
  const holding = view.sheep === view.me.id;
  const last = view.winners.length > 0 || view.n >= view.total;
  // The points climb from where this question started: the +1 lands as a number moving.
  const points = useCountUp(view.points, view.points - (r?.delta ?? 0), 700, 300);
  const ranked = [...view.players]
    .filter((p) => p.status !== 'spectator')
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || a.name.localeCompare(b.name));
  return (
    <Screen footer={vipButton(last ? L('See the results') : L('Next question'), skip)}>
      <div className={styles.topRight}>
        <SettingsPill />
      </div>
      <div className={styles.scoreBody}>
        {r ? (
          <div className={`${styles.result} ${styles[`r_${r.kind}`] ?? ''}`}>
            <p className={styles.resultLine}>{resultLine(r, L)}</p>
          </div>
        ) : null}
        <p className={styles.points}>
          <span className={styles.pointsNum}>{points}</span> / {view.target}
        </p>
        {holding ? (
          <p className={styles.holding}>
            <SheepCoin size="sm" />
            {L("You hold the Black Sheep. You can't win until someone else is the only one alone.")}
          </p>
        ) : null}
        {/* The wait has a shape: the bar drains to the next question (never a frozen screen). */}
        {view.phaseId === 'score' ? (
          <div className={styles.nextLine}>
            <span>{last ? L('The results are coming up') : L('Next question coming up')}</span>
            <DeadlineBar
              deadline={view.deadline}
              phaseKey={`score:${view.n}`}
              paused={view.paused}
              urgentAt={0}
            />
          </div>
        ) : null}
      </div>
      {phoneOnly ? (
        <ol className={styles.race}>
          {ranked.map((p) => (
            <li key={p.id} className={view.winners.includes(p.id) ? styles.raceWon : undefined}>
              <Avatar avatarId={p.avatarId} size={32} dim={!p.connected} />
              <span className={styles.raceName}>{p.name}</span>
              {p.id === view.sheep ? <SheepCoin size="sm" /> : null}
              <span className={styles.raceScore}>{p.score ?? 0}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </Screen>
  );
}
