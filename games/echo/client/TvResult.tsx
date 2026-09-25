// TV during `result` (§7.4): "The word was" and the word at display size with the reading; then the
// guess with ✓ / ✗ / PASS written out (never colour alone) and its cue; then every clue turns over
// with its author, echoes included; then the deck counter settles (and a burn is called out).
import type { JSX } from 'react';
import { Stage, useSound, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps, ViewPlayer } from '@partybox/game-sdk/ui';
import { useEffect, useRef } from 'react';
import type { EchoTvView } from '../server/views';
import { AuthorTag, Card, ClueText, Deck, EchoFace } from './TvParts';
import { RESULT } from './timing';
import { usePhaseBeat, useMountElapsed } from './usePhaseBeat';
import { useLine } from './useLine';
import { EnglishTag } from './EnglishTag';
import { STRINGS } from './strings';
import res from './result.module.css';
import stage from './stage.module.css';
import styles from './tv.module.css';

const BEATS = [RESULT.word, RESULT.mark, RESULT.authors, RESULT.pile, RESULT.burn];
const CUE = { right: 'jackpot', wrong: 'bust', pass: 'sweep' } as const;

export function TvResult({ view }: GameTvProps<EchoTvView>): JSX.Element | null {
  const L = useT(STRINGS);
  const play = useSound();
  const since = view.phaseAt;
  const skip = useMountElapsed(since);
  const beat = usePhaseBeat(since, BEATS);
  const r = view.result;
  const [wordLine, outcomeLine] = view.say;
  useLine(wordLine, RESULT.word, since);
  useLine(outcomeLine, RESULT.mark, since);
  // The outcome cue lands with the mark, once per word (a remount mid-beat stays quiet).
  const cued = useRef(false);
  useEffect(() => {
    if (!r || beat < 1 || cued.current) return;
    cued.current = true;
    if (skip < RESULT.mark + 400) play(CUE[r.outcome]);
  }, [beat, r, play, skip]);
  if (!r) return null;
  const byId = (id: string): ViewPlayer | undefined => view.players.find((p) => p.id === id);
  const guesser = byId(view.guesser ?? '');
  const mark =
    r.outcome === 'right' ? L('✓ Got it!') : r.outcome === 'wrong' ? L('✗ Not quite') : L('PASS');
  const rows = r.clues.length > 6 ? 2 : 1;
  // Until the deck beat, the counter shows the piles as they were before this word.
  const counts =
    beat >= 3
      ? view.counts
      : {
          left: view.counts.left + 1 + (r.burned ? 1 : 0),
          won: view.counts.won - (r.outcome === 'right' ? 1 : 0) + (r.unwon ? 1 : 0),
          lost: view.counts.lost - (r.outcome === 'right' ? 0 : 1) - (r.burned || r.unwon ? 1 : 0),
        };
  return (
    <Stage className={res.stage}>
      <div className={styles.top}>
        <span className={styles.kicker}>
          {L('Word {n} of {total}', { n: view.wordNo, total: view.deckSize })}
          <EnglishTag />
        </span>
        <Deck counts={counts} />
      </div>
      <div className={stage.body}>
        <div className={res.head}>
          <span className={res.was}>{L('The word was')}</span>
          <span className={res.word}>{r.word}</span>
        </div>
        <div className={res.guessRow} data-on={beat >= 1 ? '1' : '0'}>
          <span className={res.guess}>
            {r.outcome === 'pass'
              ? L('{name} passed', { name: guesser?.name ?? '?' })
              : L('{name} guessed “{guess}”', { name: guesser?.name ?? '?', guess: r.guess })}
          </span>
          <span className={res.mark} data-outcome={r.outcome}>
            {mark}
          </span>
          {r.byVip ? <span className={res.vip}>{L('Counted by the VIP')}</span> : null}
        </div>
        <div className={styles.table} data-rows={rows}>
          {r.clues.map((c, i) => (
            <Card
              key={`${c.by}:${i}`}
              still
              up={!c.echo || beat >= 2}
              back={c.echo ? <EchoFace /> : undefined}
              backClass={c.echo ? styles.echoFace : undefined}
              below={beat >= 2 ? <AuthorTag player={byId(c.by)} /> : null}
              label={c.echo && beat < 2 ? L('echo') : c.text}
            >
              {c.echo ? (
                <span className={styles.struck}>
                  <ClueText text={c.text} />
                </span>
              ) : (
                <ClueText text={c.text} />
              )}
            </Card>
          ))}
          {r.clues.length === 0 ? <span className={res.burn}>{L('No clues!')}</span> : null}
        </div>
        {beat === 3 ? (
          <span className={res.flyer} data-to={r.outcome === 'right' ? 'won' : 'lost'} aria-hidden>
            {r.outcome === 'right' ? '✓' : '✗'}
          </span>
        ) : null}
        {beat >= 4 && (r.burned || r.unwon) ? (
          <span className={res.flyer} data-to="lost" aria-hidden>
            ✗
          </span>
        ) : null}
        {r.burned && beat >= 4 ? (
          <span className={res.burn}>{L('…and it burned the next word.')}</span>
        ) : null}
        {r.unwon && beat >= 4 ? (
          <span className={res.burn}>{L('…and it cost a word we had won.')}</span>
        ) : null}
      </div>
    </Stage>
  );
}
