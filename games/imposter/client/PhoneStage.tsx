// PhoneStage (SPEC §1.4): the TV's moments, vertical, for phone-only rooms and (with F4) phones that
// can't see the TV — the clue cards as a list at the TV's pace, the votes grouped by target, the
// accused and the flip, the word with the imposters' clues, a compact scoreboard. Every spoken
// line is shown as text too, and a phone that stages also plays the reader's line.
import type { JSX } from 'react';
import { rank } from '@partybox/game-sdk';
import { Avatar, Scoreboard, Screen, useT } from '@partybox/game-sdk/ui';
import type { ControllerView, PushedView } from '@partybox/game-sdk/ui';
import type { ImposterControllerView } from '../server/index';
import { byId, cluesOf, pointsOf, useSay } from './shared';
import { STRINGS } from './strings';
import styles from './phone.module.css';

type View = PushedView<ImposterControllerView>;

export function PhoneStageBody({ view }: { view: View }): JSX.Element | null {
  const L = useT(STRINGS);
  const s = view.stage;
  const who = byId(view.players);
  const name = (id: string): string => who.get(id)?.name ?? '?';
  switch (view.phaseId) {
    case 'intro':
      return (
        <ol className={styles.steps}>
          <li>
            {L('Everyone gets the secret word except the imposter, who only knows the category.')}
          </li>
          <li>{L('Everyone types one word about it. The imposter has to fake it.')}</li>
          <li>
            {L('Vote out the imposter. A caught imposter can still steal it by guessing the word.')}
          </li>
        </ol>
      );
    case 'clueReveal': {
      const dealt = s.board.filter((c) => c.dealt > 0).sort((a, b) => a.dealt - b.dealt);
      return (
        <ul className={styles.clueList}>
          {dealt.map((c) => (
            <li key={c.by} className={styles.dealt}>
              <Avatar avatarId={who.get(c.by)?.avatarId ?? ''} size="2.25rem" />
              <span className={styles.rowName}>{name(c.by)}</span>
              <span className={styles.rowClue}>{c.now || '—'}</span>
            </li>
          ))}
        </ul>
      );
    }
    case 'voteReveal': {
      const counts = s.tally?.counts ?? {};
      const targets = Object.keys(counts).sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0));
      return (
        <ul className={styles.clueList}>
          {targets.map((t) => {
            const voters = Object.entries(s.tally?.votes ?? {})
              .filter(([, ts]) => ts.includes(t))
              .map(([v]) => name(v));
            return (
              <li key={t} className={styles.dealt}>
                <Avatar avatarId={who.get(t)?.avatarId ?? ''} size="2.25rem" />
                <span className={styles.rowName}>{name(t)}</span>
                <span className={styles.rowClues}>← {voters.join(', ')}</span>
              </li>
            );
          })}
        </ul>
      );
    }
    case 'accuse': {
      const id = s.accuse?.accused[s.accuse.spot];
      const role = id ? s.accuse?.roles[id] : undefined;
      return (
        <div className={styles.accused}>
          <p className={styles.kicker}>{L('The room accuses…')}</p>
          {id ? <Avatar avatarId={who.get(id)?.avatarId ?? ''} size="6rem" /> : null}
          <p className={styles.title}>{id ? name(id) : ''}</p>
          <p
            className={`${styles.role} ${role === 'imposter' ? styles.isImp : role ? styles.isCrew : ''}`}
          >
            {role === 'imposter' ? `✓ ${L('IMPOSTER')}` : role ? `✗ ${L('INNOCENT')}` : '…'}
          </p>
        </div>
      );
    }
    case 'wordReveal': {
      const r = s.reveal;
      if (!r) return null;
      return (
        <div className={styles.accused}>
          <p className={styles.kicker}>{L('The word was')}</p>
          <p className={styles.bigWord}>{r.word}</p>
          {r.imposters.map((id) => (
            <p key={id} className={styles.impLine}>
              🕵️ {name(id)}: {cluesOf(s, id).join(' · ') || '—'}
            </p>
          ))}
        </div>
      );
    }
    case 'scores': {
      const scores: Record<string, number> = {};
      for (const p of view.players) scores[p.id] = p.score ?? 0;
      const rows = rank(scores).map((r) => ({
        playerId: r.playerId,
        name: name(r.playerId),
        avatarId: who.get(r.playerId)?.avatarId ?? '',
        score: r.score,
        rank: r.rank,
        delta: pointsOf(s.delta?.[r.playerId]),
      }));
      return <Scoreboard compact size="sm" rows={rows} highlightId={view.me.id} noTrophy />;
    }
    default:
      return null;
  }
}

/** The shell renders this in place of the Controller for `phoneStagePhases` in a phone-only room. */
export function PhoneStage({ view }: { view: PushedView<ControllerView> }): JSX.Element {
  const v = view as View;
  useSay(v.stage.say);
  return (
    <Screen>
      {v.stage.say?.text ? <p className={styles.sayLine}>“{v.stage.say.text}”</p> : null}
      <PhoneStageBody view={v} />
    </Screen>
  );
}
