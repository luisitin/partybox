// Phone during `reveal` on a phone that can see the TV: "👀 Watch the TV" while the taps land, then
// — only once the TV has flipped the card (the server's `shown` beat) — the player's own line:
// "✓ You knew it was Ben! +2", "✗ You picked Cy · It was Ben", "That was yours! You fooled 4 · +4".
// Scores (`scores`): this question's points, the rank, the board, and the VIP's Next.
import { useEffect } from 'react';
import type { JSX } from 'react';
import {
  PrimaryButton,
  Scoreboard,
  Screen,
  WaitingScreen,
  buzz,
  useCountUp,
  useSound,
  useT,
} from '@partybox/game-sdk/ui';
import type { GameControllerProps, Translator } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { WsPhoneView } from '../server/views';
import { STRINGS } from './strings';
import { boardRows } from './board';
import styles from './phone.module.css';

type Props = GameControllerProps<WsPhoneView, Input>;

function names(L: Translator, list: string[]): string {
  return list.length > 1
    ? L('{names} and {last}', { names: list.slice(0, -1).join(', '), last: list.at(-1) as string })
    : (list[0] ?? '?');
}

export function PhoneResult({ view }: Props): JSX.Element {
  const L = useT(STRINGS);
  const play = useSound();
  const result = view.result;
  const kind = result?.kind ?? null;
  useEffect(() => {
    if (kind === 'right') {
      play('correct');
      buzz([30, 40, 30]);
    } else if (kind === 'wrong') {
      play('wrong');
      buzz(120);
    }
  }, [kind, play]);
  if (!result) return <WaitingScreen title={`👀 ${L('Watch the TV')}`} mood="watch" />;
  const byId = new Map(view.players.map((p) => [p.id, p.name]));
  const who = names(
    L,
    result.authors.map((id) => byId.get(id) ?? '?'),
  );
  const lines: Record<string, { mark: string; text: string; sub: string; tone: string }> = {
    right: { mark: '✓', text: L('You knew it was {name}!', { name: who }), sub: `+${result.points}`, tone: styles.right ?? '' }, // prettier-ignore
    wrong: { mark: '✗', text: L('You picked {name}', { name: byId.get(result.picked ?? '') ?? '?' }), sub: L('It was {name}', { name: who }), tone: styles.wrong ?? '' }, // prettier-ignore
    mine: { mark: '🕶️', text: L('That was yours!'), sub: L('You fooled {n} · +{pts}', { n: result.fooled, pts: result.points }), tone: styles.mine ?? '' }, // prettier-ignore
    idle: {
      mark: '·',
      text: L('It was {name}', { name: who }),
      sub: L('No tap this time'),
      tone: '',
    },
  };
  const line = lines[result.kind] ?? lines['idle'];
  return (
    <Screen className="pb-enter">
      <div className={`${styles.result} ${line?.tone ?? ''}`} role="status">
        <span className={`${styles.resultMark} pb-pop`} aria-hidden>
          {line?.mark}
        </span>
        <p className={styles.resultText}>{line?.text}</p>
        <p className={styles.resultSub}>{line?.sub}</p>
      </div>
    </Screen>
  );
}

const COUNT_MS = 600;

export function PhoneScores({ view, me, skip }: Props): JSX.Element {
  const L = useT(STRINGS);
  const { score, rank, delta } = view.standing;
  const shownDelta = useCountUp(delta, 0, COUNT_MS);
  const rows = boardRows(view);
  const tied = rows.length > 1 && rows.every((r) => r.score === rows[0]?.score);
  const place = tied ? L('all tied') : L('#{rank} of {count}', { rank, count: rows.length });
  return (
    <Screen
      footer={
        skip ? (
          <PrimaryButton onClick={skip}>
            {view.last ? L('See results') : L('Next question')}
          </PrimaryButton>
        ) : undefined
      }
    >
      <div className={styles.scoresHero} role="status">
        {view.empty ? <p className={styles.nobody}>{L('Nobody answered!')}</p> : null}
        <p className={styles.delta}>+{shownDelta}</p>
        <p className={styles.deltaLabel}>{L('this question')}</p>
        <p className={styles.rankLine}>{L('{place} · {score} points', { place, score })}</p>
      </div>
      <Scoreboard compact highlightId={me.id} rows={rows} noTrophy />
    </Screen>
  );
}
