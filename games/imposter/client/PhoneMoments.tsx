// Phone after the vote: the last chance (the caught imposter picks or types; everyone else sees
// the options too, so remote players follow), the own-result line once the TV has shown it, the
// VIP's "That counts" / Scores / Next round buttons, and the waiting line for at-TV phones.
import { useState } from 'react';
import type { JSX } from 'react';
import { rank } from '@partybox/game-sdk';
import { PrimaryButton, Screen, WaitingScreen, useT } from '@partybox/game-sdk/ui';
import type { Translator } from '@partybox/game-sdk/ui';
import type { Why } from '../server/types';
import type { Props } from './PhoneCards';
import { PhoneStageBody } from './PhoneStage';
import { byId, pointsOf } from './helpers';
import { STRINGS } from './strings';
import styles from './phone.module.css';

export function PhoneLast({ view, send }: Props): JSX.Element {
  const L = useT(STRINGS);
  const last = view.stage.last;
  const who = byId(view.players);
  const [text, setText] = useState('');
  const name = (last?.guessers ?? []).map((g) => who.get(g)?.name ?? '?').join(' & ') || '?';
  if (view.guessing && last) {
    if (last.options)
      return (
        <Screen>
          <p className={styles.kicker}>{L('Caught!')}</p>
          <h2 className={styles.title}>{L("Last chance: what's the word?")}</h2>
          <div className={styles.optionGrid}>
            {last.options.map((o) => (
              <button
                key={o}
                type="button"
                className={styles.optionBtn}
                onClick={() => send({ type: 'guess', option: o })}
              >
                {o}
              </button>
            ))}
          </div>
        </Screen>
      );
    const ok = text.trim().length > 0;
    return (
      <Screen
        footer={
          <PrimaryButton
            disabled={!ok}
            onClick={() => ok && send({ type: 'guess', text: text.trim() })}
          >
            {L('Guess')}
          </PrimaryButton>
        }
      >
        <p className={styles.kicker}>{L('Caught!')}</p>
        <h2 className={styles.title}>{L("Last chance: what's the word?")}</h2>
        <input
          className={styles.clueBox}
          value={text}
          maxLength={40}
          onChange={(e) => setText(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="done"
          aria-label={L('Your guess')}
        />
      </Screen>
    );
  }
  return (
    <WaitingScreen
      title={view.mine.guess ? L('Guess is in…') : L('{name} is guessing…', { name })}
      mood="watch"
      className={styles.breathing}
    >
      {last?.options ? (
        <p className={styles.optionsLine}>
          {last.options.map((o) => (
            <span key={o}>{o}</span>
          ))}
        </p>
      ) : null}
    </WaitingScreen>
  );
}

/** The own-result line under the points hero (the hero carries the number). */
function resultLine(
  L: Translator,
  why: readonly Why[],
  role: string | null,
  stealer: string | null,
): string {
  if (why.includes('escaped')) return L('You escaped!');
  if (why.includes('stole')) return L('Caught, but you stole it');
  if (role === 'imposter') return L('They got you');
  // A steal is news for the crew too (design review [a0c548] 1): say both halves.
  if (why.includes('caught') && stealer)
    return L('You caught {name}, but they stole the word', { name: stealer });
  if (why.includes('caught') && why.includes('read'))
    return L('You caught the imposter and read it right');
  if (why.includes('caught')) return L('The room caught the imposter');
  if (why.includes('read')) return L('You read it right');
  return L('The imposter got away');
}

export function PhoneAfter({ view, skip, send }: Props): JSX.Element {
  const L = useT(STRINGS);
  const r = view.stage.reveal;
  const who = byId(view.players);
  const stealer = Object.entries(r?.guesses ?? {}).find(([, g]) => g.ok)?.[0] ?? null;
  const scores = view.phaseId === 'scores';
  const vipButtons = skip ? (
    <div className={styles.vipRow}>
      {view.phaseId === 'wordReveal' && r?.countable ? (
        <PrimaryButton tone="success" onClick={() => send({ type: 'countGuess' })}>
          {L('✓ That counts')}
        </PrimaryButton>
      ) : null}
      <PrimaryButton onClick={skip}>
        {scores
          ? view.stage.round < view.stage.rounds
            ? L('Next round')
            : L('See results')
          : L('Scores')}
      </PrimaryButton>
    </div>
  ) : undefined;
  const me = view.players.find((p) => p.id === view.me.id);
  const place = rank(Object.fromEntries(view.players.map((p) => [p.id, p.score ?? 0]))).find(
    (row) => row.playerId === view.me.id,
  );
  return (
    <Screen footer={vipButtons}>
      {view.result ? (
        <div className={styles.result} role="status">
          <p className={styles.resultPts}>+{pointsOf(view.result.why)}</p>
          <p className={styles.resultLine}>
            {resultLine(
              L,
              view.result.why,
              view.role,
              stealer ? (who.get(stealer)?.name ?? null) : null,
            )}
          </p>
          {scores && place ? (
            <p className={styles.hint}>
              {L('#{rank} of {count} · {score} points', {
                rank: place.rank,
                count: view.players.length,
                score: me?.score ?? 0,
              })}
            </p>
          ) : null}
        </div>
      ) : null}
      {view.result ? (
        <PhoneStageBody view={view} />
      ) : (
        <div className={styles.stageCenter}>
          <PhoneStageBody view={view} />
        </div>
      )}
    </Screen>
  );
}
