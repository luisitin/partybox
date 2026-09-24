// TV during `guess`: the table deals face down, the echoes turn blank (🔇 "echo", with "Echo!"),
// then the survivors turn over one by one while the reader says them. One row, two above six.
// "Total echo!" / "No clues!" when nothing is left to read.
import { useEffect, useRef } from 'react';
import type { JSX } from 'react';
import { Avatar, Stage, useSound, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import { survivorStepMs } from '../server/types';
import type { EchoTvView } from '../server/views';
import { Card, ClueText, Deck, EchoFace } from './TvParts';
import { GUESS } from './timing';
import { usePhaseBeat, useMountElapsed } from './usePhaseBeat';
import { useLine } from './useLine';
import { STRINGS } from './strings';
import stage from './stage.module.css';
import styles from './tv.module.css';

/** When survivor `i` turns over (the steps follow the reading when it is known). */
export function survivorAt(i: number, step: number = GUESS.survivorStep): number {
  return GUESS.firstSurvivor + i * step;
}

export function TvGuess({ view }: GameTvProps<EchoTvView>): JSX.Element {
  const L = useT(STRINGS);
  const since = view.phaseAt;
  const skip = useMountElapsed(since);
  const survivors = view.survivors;
  const echoes = view.echoCount;
  const total = survivors.length + echoes;
  const clueLine = view.say.find((s) => s.text !== 'Echo!' && s.text !== 'Total echo!');
  const step = survivorStepMs(survivors.length, clueLine?.ms);
  const beats = [0, GUESS.echoFlip, ...survivors.map((_, i) => survivorAt(i, step))];
  const beat = usePhaseBeat(since, beats);
  const guesser = view.players.find((p) => p.id === view.guesser);
  // The reader: "Echo!" as the echoes go blank, the survivors as the first one turns over.
  const echoLine = view.say.find((s) => s.text === 'Echo!' || s.text === 'Total echo!');
  useLine(echoLine, GUESS.echoFlip, since);
  useLine(clueLine, survivors.length > 0 ? survivorAt(0) : GUESS.echoFlip, since);
  // Sound: the "pick up your phone" chime as the table deals (only when we saw it begin), then a
  // soft pluck as each clue turns over.
  const play = useSound();
  const fresh = useRef(skip < 600);
  const plucked = useRef(1);
  useEffect(() => {
    if (!fresh.current) return undefined;
    const t = setTimeout(() => play('phase'), 60);
    return () => clearTimeout(t);
  }, [play]);
  useEffect(() => {
    if (beat < 2 || beat <= plucked.current || !fresh.current) return;
    plucked.current = beat;
    play('card', { quiet: true, gain: 0.45 });
  }, [beat, play]);
  const rows = total > 6 ? 2 : 1;
  const empty = total === 0;
  return (
    <Stage className={stage.stage}>
      <div className={styles.top}>
        <span className={styles.kicker}>
          {L('Word {n} of {total}', { n: view.wordNo, total: view.deckSize })}
        </span>
        <Deck counts={view.counts} />
      </div>
      <div className={stage.body}>
        <div className={stage.hero}>
          {guesser ? <Avatar avatarId={guesser.avatarId} size={96} /> : null}
          <span className={stage.heroLine}>
            {L("{name}, what's the word?", { name: guesser?.name ?? '?' })}
          </span>
        </div>
        {view.guessIn ? (
          <span className={stage.banner}>
            {L('🔒 {name} has an answer…', { name: guesser?.name ?? '?' })}
          </span>
        ) : null}
        {empty ? (
          <span className={stage.line}>{L('No clues!')}</span>
        ) : (
          <div className={styles.table} data-rows={rows}>
            {survivors.map((text, i) => (
              <Card
                key={`s${i}`}
                up={beat >= 2 + i}
                dealMs={GUESS.deal + i * GUESS.dealStep}
                skipMs={skip}
                label={beat >= 2 + i ? text : undefined}
              >
                <ClueText text={text} />
              </Card>
            ))}
            {Array.from({ length: echoes }, (_, i) => (
              <Card
                key={`e${i}`}
                up={beat >= 1}
                dealMs={GUESS.deal + (survivors.length + i) * GUESS.dealStep}
                skipMs={skip}
                faceClass={styles.echoFace}
                label={L('echo')}
              >
                <EchoFace />
              </Card>
            ))}
          </div>
        )}
        {survivors.length === 0 && echoes > 0 && beat >= 1 ? (
          <span className={stage.line}>
            {L("Total echo! {name}'s on their own.", { name: guesser?.name ?? '?' })}
          </span>
        ) : null}
      </div>
    </Stage>
  );
}
