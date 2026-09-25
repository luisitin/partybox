// TV for Imposter: one scene per moment. The table of clue cards (TvBoard) carries deal → vote;
// the accusation, the last chance and the word reveal are their own scenes (TvMoments). Dumb by
// design: it renders `view`, plays the reader's line and the moment's cue, nothing else.
import type { JSX } from 'react';
import { BigText, Stage, useT } from '@partybox/game-sdk/ui';
import type { GameTvProps } from '@partybox/game-sdk/ui';
import type { ImposterTvView } from '../server/index';
import { TvBoard } from './TvBoard';
import type { BoardMode } from './TvBoard';
import { TvAccuse, TvLastChance, TvScores, TvWordReveal } from './TvMoments';
import { byId, useSay } from './helpers';
import { STRINGS } from './strings';
import styles from './tv.module.css';

type Props = GameTvProps<ImposterTvView>;

function TvIntro(): JSX.Element {
  const L = useT(STRINGS);
  const steps = [
    L('Everyone gets the secret word except the imposter, who only knows the category.'),
    L('Everyone types one word about it. The imposter has to fake it.'),
    L('Vote out the imposter. A caught imposter can still steal it by guessing the word.'),
  ];
  return (
    <Stage center>
      <p className={styles.glyphBig} aria-hidden="true">
        🕵️
      </p>
      <BigText level="display">Imposter</BigText>
      <ol className={styles.steps}>
        {steps.map((s, i) => (
          <li key={s} style={{ animationDelay: `${300 + i * 350}ms` }}>
            <span className={styles.stepNo}>{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
    </Stage>
  );
}

function Headline({ view }: Props): JSX.Element {
  const L = useT(STRINGS);
  const s = view.stage;
  const who = byId(view.players);
  const round = L('Round {n} of {of}', { n: s.round, of: s.rounds });
  const clueRound =
    s.clueRounds > 1
      ? ` · ${L('clue round {n} of {of}', { n: s.clueRound, of: s.clueRounds })}`
      : '';
  const imps = s.imposterCount > 1 ? ` · ${L('2 imposters')}` : '';
  let line: string;
  switch (view.phaseId) {
    case 'deal':
      line = L('Check your secret card');
      break;
    case 'clue':
      line = s.clueRound > 1 ? L('Type one more word') : L('Type one word');
      break;
    case 'clueReveal':
      line = L('Clues are in');
      break;
    case 'talk':
      line = L("Talk it over. Who's faking?");
      break;
    case 'vote':
      line = s.imposterCount > 1 ? L('Vote on your phone: pick 2') : L('Vote on your phone');
      break;
    case 'voteReveal':
      line = s.tally?.runoff ? L('The runoff') : L('The votes');
      break;
    case 'runoff': {
      const names = (s.runoff?.candidates ?? []).map((id) => who.get(id)?.name ?? '?');
      line = L('Tie! Vote again: {names}', { names: names.join(' · ') });
      break;
    }
    default:
      line = '';
  }
  return (
    <header className={styles.head}>
      <p className={styles.kicker}>
        {round}
        {clueRound}
        {imps}
      </p>
      <h1 key={`${view.phaseId}-${s.clueRound}`} className={styles.line}>
        {line}
      </h1>
      {view.phaseId === 'talk' ? (
        <p className={styles.sub}>{L("Next on the VIP's phone")}</p>
      ) : null}
    </header>
  );
}

const MODE: Record<string, BoardMode> = {
  deal: 'down',
  clue: 'down',
  clueReveal: 'up',
  talk: 'up',
  vote: 'dim',
  voteReveal: 'votes',
  runoff: 'runoff',
};

export function Tv(props: Props): JSX.Element {
  const { view } = props;
  useSay(view.stage.say);
  const mode = MODE[view.phaseId];
  if (mode)
    return (
      <Stage className={`${styles.table} ${view.stage.board.length > 8 ? styles.tableDense : ''}`}>
        <Headline {...props} />
        <TvBoard view={view} mode={mode} />
      </Stage>
    );
  switch (view.phaseId) {
    case 'intro':
      return <TvIntro />;
    case 'accuse':
      return <TvAccuse view={view} />;
    case 'lastChance':
      return <TvLastChance view={view} />;
    case 'wordReveal':
      return <TvWordReveal view={view} />;
    default:
      return <TvScores view={view} />;
  }
}
