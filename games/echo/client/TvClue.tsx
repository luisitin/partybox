// TV during `clue` and `check`. Never the word: the guesser is watching this screen (§7.4).
// The guesser's face breathes in a gold ring; each clue-giver has a slot where three dots take
// turns until their clue lands face down with a ✓ (dealt). In `check` rings spread from the table
// ("Listening for echoes…") and each Looks good ticks its card.
import type { JSX } from 'react';
import { Avatar, Stage, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps, ViewPlayer } from '@partybox/game-sdk/ui';
import type { EchoTvView } from '../server/views';
import { Deck } from './TvParts';
import { EnglishTag } from './EnglishTag';
import { STRINGS } from './strings';
import stage from './stage.module.css';
import styles from './tv.module.css';

interface SlotProps {
  checking: boolean;
  player: ViewPlayer | undefined;
  card: boolean;
  tick: boolean;
  many: boolean;
}

function Slot({ checking, player, card, tick, many }: SlotProps): JSX.Element {
  return (
    <div className={stage.slot} data-many={many ? '1' : '0'}>
      <div className={stage.slotHole}>
        {card ? (
          <span className={stage.slotCard} aria-hidden>
            🔁
          </span>
        ) : null}
        {card && tick ? (
          <span className={stage.slotTick} aria-hidden>
            ✓
          </span>
        ) : null}
        {card ? null : checking ? (
          <span aria-hidden>—</span>
        ) : (
          <span className={stage.dots} aria-hidden>
            <span />
            <span />
            <span />
          </span>
        )}
      </div>
      {player ? (
        <span className={stage.slotName}>
          <Avatar avatarId={player.avatarId} size={32} dim={!player.connected} />
          {player.name}
        </span>
      ) : null}
    </div>
  );
}

export function TvClue({ view }: GameTvProps<EchoTvView>): JSX.Element {
  const L = useT(STRINGS);
  const guesser = view.players.find((p) => p.id === view.guesser);
  const byId = (id: string): ViewPlayer | undefined => view.players.find((p) => p.id === id);
  const checking = view.phaseId === 'check';
  const hint = checking
    ? L('Listening for echoes…')
    : view.twoClues
      ? L('Everyone else: two different clues each. No peeking!')
      : L('Everyone else: one clue each. No peeking!');
  const slots = (
    <div className={stage.slots}>
      {view.givers.map((id) => (
        <Slot
          key={id}
          checking={checking}
          player={byId(id)}
          card={view.wrote.includes(id)}
          tick={view.ready.includes(id)}
          many={view.givers.length > 6}
        />
      ))}
    </div>
  );
  return (
    <Stage className={stage.stage}>
      <div className={styles.top}>
        <span className={styles.kicker}>
          {L('Word {n} of {total}', { n: view.wordNo, total: view.deckSize })}
          <EnglishTag />
        </span>
        <Deck counts={view.counts} />
      </div>
      <div className={stage.body}>
        <div className={stage.hero} key={`${view.phaseId}:${view.wordNo}`}>
          {guesser ? (
            <span className={stage.heroFace}>
              <span className={stage.heroRing} aria-hidden />
              <Avatar avatarId={guesser.avatarId} size={148} />
            </span>
          ) : null}
          <span className={stage.heroText}>
            <span className={stage.heroLine}>
              {L('{name} is guessing', { name: guesser?.name ?? '?' })}
            </span>
            <span className={stage.heroHint}>{hint}</span>
          </span>
        </div>
        {view.swapped ? <span className={stage.banner}>{L('Word swapped!')}</span> : null}
        {checking ? (
          <div className={stage.listen}>
            <span className={stage.ring} aria-hidden />
            <span className={stage.ring} aria-hidden />
            <span className={stage.ring} aria-hidden />
            {slots}
          </div>
        ) : (
          slots
        )}
      </div>
    </Stage>
  );
}
