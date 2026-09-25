// The results stage keeps Tune In's own last board for teams and co-op (spec §5.7): the final
// banner with both teams (the winners' card lit), or co-op's rating and meter — the verdict the
// headline cannot give. The shell drops its scoreboard and awards for a kept board, so the awards
// ride here too.
import type { JSX } from 'react';
import { BigText, useT } from '@partybox/game-sdk/ui';
import type { GameFinaleProps } from '@partybox/game-sdk/ui';
import { TeamBanner } from '@partybox/game-sdk/ui/team-banner';
import type { TuneTvView } from '../server/index';
import { ratingText } from './copy';
import { Rosters } from './Rosters';
import { STRINGS } from './strings';
import styles from './tv.module.css';
import { CoopMeter } from './TvHeader';
import { useReading } from './useReading';

type Room = GameFinaleProps<TuneTvView>['room'];

/** The game's awards: title, who, why — one card per award, a shared one naming everyone. */
function Awards({ room }: { room: Room }): JSX.Element | null {
  const L = useT(STRINGS);
  const awards = room.results?.results.awards ?? [];
  if (awards.length === 0) return null;
  const who = (id: string): string => room.results?.players.find((p) => p.id === id)?.name ?? '?';
  const cards: { id: string; title: string; description: string; names: string[] }[] = [];
  for (const a of awards) {
    const card = cards.find((c) => c.id === a.id);
    if (card) card.names.push(who(a.playerId));
    else
      cards.push({
        id: a.id,
        title: a.title,
        description: a.description,
        names: [who(a.playerId)],
      });
  }
  return (
    <ul className={styles.awards}>
      {cards.map((c, i) => (
        <li key={c.id} className={styles.award} style={{ animationDelay: `${600 + i * 120}ms` }}>
          <span className={styles.awardTitle}>{L.sent(c.title)}</span>
          <span className={styles.awardWho}>{joinNames(L, c.names)}</span>
          <span className={styles.awardWhy}>{L.sent(c.description)}</span>
        </li>
      ))}
    </ul>
  );
}

/** "Lu", "Lu & Sam", "Lu, Sam & Bo". */
function joinNames(L: ReturnType<typeof useT>, names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return L('{names} & {last}', { names: names.slice(0, -1).join(', '), last: names.at(-1) ?? '' });
}

export function Finale({ lastView, room }: GameFinaleProps<TuneTvView>): JSX.Element | null {
  const L = useT(STRINGS);
  useReading(lastView.reading);
  if (lastView.turn.mode === 'teams') {
    const { sun, moon } = lastView.team;
    return (
      <div className={styles.finale}>
        <TeamBanner
          size="stage"
          className={styles.bigBanner}
          sun={sun}
          moon={moon}
          winAt={lastView.winAt}
          words={{ sun: L('Sun'), moon: L('Moon'), middle: L('Final score') }}
        />
        {lastView.teams ? (
          <div className={styles.finaleRosters}>
            <Rosters
              teams={lastView.teams}
              players={lastView.players}
              winner={sun === moon ? null : sun > moon ? 'sun' : 'moon'}
            />
          </div>
        ) : null}
        <Awards room={room} />
      </div>
    );
  }
  if (!lastView.coop) return null;
  return (
    <div className={styles.finale}>
      <BigText level="display" className={styles.rating}>
        {ratingText(L, lastView.coop.rating)}
      </BigText>
      <div className={styles.bigMeter}>
        <CoopMeter total={lastView.coop.total} max={lastView.coop.max} />
      </div>
      <Awards room={room} />
    </div>
  );
}
