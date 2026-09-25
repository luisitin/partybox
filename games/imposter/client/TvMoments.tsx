// TV scenes after the vote: the accusation (spotlight, then the role card turns), the last chance,
// the word reveal and the scores. Each server beat (flip, step) arrives as a new view, so the TV
// and every phone turn on the same push; the cues land on those frames.
import { useEffect } from 'react';
import type { JSX } from 'react';
import { rank } from '@partybox/game-sdk';
import { Avatar, BigText, Scoreboard, Stage, useSound, useT } from '@partybox/game-sdk/ui';
import type { PushedView } from '@partybox/game-sdk/ui';
import type { ImposterTvView } from '../server/index';
import type { Why } from '../server/types';
import { byId, pointsOf, useOpeningCue } from './shared';
import { STRINGS } from './strings';
import styles from './tv.module.css';

type V = { view: PushedView<ImposterTvView> };

export function TvAccuse({ view }: V): JSX.Element {
  useOpeningCue('reveal');
  const L = useT(STRINGS);
  const play = useSound();
  const a = view.stage.accuse;
  const who = byId(view.players);
  const id = a?.accused[a.spot];
  const p = id ? who.get(id) : undefined;
  const role = id ? a?.roles[id] : undefined;
  useEffect(() => {
    if (role) play(role === 'imposter' ? 'cheer' : 'bust');
  }, [role, id, play]);
  const done = (a?.accused ?? []).slice(0, a?.spot ?? 0);
  return (
    <Stage center className={styles.spot}>
      <p className={styles.kicker}>{L('The room accuses…')}</p>
      <div key={id} className={styles.accused}>
        {p ? <Avatar avatarId={p.avatarId} size={220} /> : null}
        <BigText level="h1">{p?.name ?? '?'}</BigText>
      </div>
      <div className={`${styles.roleCard} ${role ? styles.flipped : ''}`}>
        <div className={styles.roleTurn}>
          <div className={styles.roleBack}>?</div>
          <div
            className={`${styles.roleFace} ${role === 'imposter' ? styles.isImp : styles.isCrew}`}
          >
            {role === 'imposter' ? `✓ ${L('IMPOSTER')}` : `✗ ${L('INNOCENT')}`}
          </div>
        </div>
      </div>
      {done.length > 0 ? (
        <p className={styles.sub}>
          {done
            .map(
              (d) =>
                `${who.get(d)?.name ?? '?'}: ${a?.roles[d] === 'imposter' ? L('imposter') : L('innocent')}`,
            )
            .join(' · ')}
        </p>
      ) : null}
    </Stage>
  );
}

export function TvLastChance({ view }: V): JSX.Element {
  const L = useT(STRINGS);
  const last = view.stage.last;
  const who = byId(view.players);
  const ids = last?.guessers ?? [];
  const guessed = last?.guessed ?? [];
  const first = ids[0] ? who.get(ids[0]) : undefined;
  return (
    <Stage center>
      {ids.length === 1 ? (
        <div className={styles.guesser}>
          {first ? <Avatar avatarId={first.avatarId} size={120} /> : null}
          <BigText level="h1">{L("{name}'s last chance", { name: first?.name ?? '?' })}</BigText>
        </div>
      ) : (
        <BigText level="h1">{L('Last chance')}</BigText>
      )}
      {last?.options ? (
        <div className={styles.options}>
          {last.options.map((o, i) => (
            <span key={o} className={styles.option} style={{ animationDelay: `${i * 90}ms` }}>
              {o}
            </span>
          ))}
        </div>
      ) : null}
      <div className={styles.guessers}>
        {ids.map((id) => {
          const p = who.get(id);
          const done = guessed.includes(id);
          return (
            <p key={id} className={styles.typing}>
              {ids.length > 1 && p ? <Avatar avatarId={p.avatarId} size={64} /> : null}
              {done
                ? `✓ ${L('{name} has guessed', { name: p?.name ?? '?' })}`
                : last?.options
                  ? L('{name} is choosing', { name: p?.name ?? '?' })
                  : L('{name} is typing', { name: p?.name ?? '?' })}
              {done ? null : <span className={styles.dots} aria-hidden="true" />}
            </p>
          );
        })}
      </div>
    </Stage>
  );
}

export function TvWordReveal({ view }: V): JSX.Element {
  useOpeningCue('reveal');
  const L = useT(STRINGS);
  const play = useSound();
  const r = view.stage.reveal;
  const who = byId(view.players);
  const stolen = Object.values(r?.guesses ?? {}).some((g) => g.ok);
  const step = r?.step ?? 0;
  useEffect(() => {
    if (step > 0 && stolen) play('jackpot');
  }, [step, stolen, play]);
  if (!r) return <Stage center>{null}</Stage>;
  const cards = r.imposters.map((id) => ({ id, clues: view.stage.board.find((c) => c.by === id) }));
  const escaped = r.imposters.filter((id) => !(view.stage.accuse?.accused ?? []).includes(id));
  return (
    <Stage center>
      {r.void ? <BigText level="h1">{L('The imposter left the building.')}</BigText> : null}
      <p className={styles.kicker}>{L.sent(r.category)}</p>
      <p className={styles.theWord}>
        <span className={styles.caption}>{L('The word was')}</span>
        <span className={styles.word}>{r.word}</span>
      </p>
      <div className={styles.impCards}>
        {cards.map(({ id, clues }) => {
          const p = who.get(id);
          const texts = clues ? [...clues.before, ...(clues.now ? [clues.now] : [])] : [];
          return (
            <div key={id} className={styles.impCard}>
              <span className={styles.impTag}>🕵️ {L('imposter')}</span>
              {p ? <Avatar avatarId={p.avatarId} size={56} /> : null}
              <span className={styles.cardName}>{p?.name ?? '?'}</span>
              <span className={styles.impClues}>{texts.length ? texts.join(' · ') : '—'}</span>
            </div>
          );
        })}
      </div>
      {/* The guess line's room is kept from the first frame, so nothing above it moves when it lands. */}
      <div className={styles.guessLines}>
        {step > 0 ? (
          <>
            {Object.entries(r.guesses).map(([id, g]) => (
              <p key={id} className={g.ok ? styles.win : styles.miss}>
                {g.ok
                  ? L('{name} guessed {word} · stolen! +3', {
                      name: who.get(id)?.name ?? '?',
                      word: g.said,
                    })
                  : L('{name} guessed {word} · no luck', {
                      name: who.get(id)?.name ?? '?',
                      word: g.said,
                    })}
                {g.byVip ? ` · ${L('Counted by the VIP')}` : ''}
              </p>
            ))}
            {!r.void && escaped.length > 0 ? (
              <p className={styles.win}>{L('The imposter escapes!')}</p>
            ) : null}
          </>
        ) : null}
      </div>
    </Stage>
  );
}

export function TvScores({ view }: V): JSX.Element {
  const L = useT(STRINGS);
  const delta = view.stage.delta ?? {};
  const scores: Record<string, number> = {};
  for (const p of view.players) scores[p.id] = p.score ?? 0;
  const before: Record<string, number> = {};
  for (const p of view.players) before[p.id] = (p.score ?? 0) - pointsOf(delta[p.id]);
  const rows = rank(scores).map((r) => {
    const p = view.players.find((x) => x.id === r.playerId);
    return {
      playerId: r.playerId,
      name: p?.name ?? '?',
      avatarId: p?.avatarId ?? '',
      score: r.score,
      rank: r.rank,
      delta: pointsOf(delta[r.playerId]),
      connected: p?.connected,
    };
  });
  const from = rank(before).map((r) => r.playerId);
  return (
    <Stage center>
      <BigText level="h1">
        {L('After round {n} of {of}', { n: view.stage.round, of: view.stage.rounds })}
      </BigText>
      <Scoreboard rows={rows} stagger="climb" climbFrom={from} noTrophy />
      <ReasonChips
        delta={delta}
        names={(id) => view.players.find((p) => p.id === id)?.name ?? '?'}
      />
    </Stage>
  );
}

/** SPEC §1.6 reason chips, summed for the room: "+2 caught · 7 players", "+4 escaped · Sam". */
function ReasonChips({
  delta,
  names,
}: {
  delta: Record<string, readonly Why[]>;
  names: (id: string) => string;
}): JSX.Element | null {
  const L = useT(STRINGS);
  const who: Record<Why, string[]> = { caught: [], read: [], escaped: [], stole: [] };
  for (const [id, why] of Object.entries(delta)) for (const w of new Set(why)) who[w].push(id);
  const chips: string[] = [];
  if (who.escaped.length)
    chips.push(L('+4 escaped · {names}', { names: who.escaped.map(names).join(', ') }));
  if (who.stole.length)
    chips.push(L('+3 stole · {names}', { names: who.stole.map(names).join(', ') }));
  if (who.caught.length) chips.push(L('+2 caught · {n} players', { n: who.caught.length }));
  if (who.read.length) chips.push(L('+1 read · {n} players', { n: who.read.length }));
  if (chips.length === 0) return null;
  return (
    <p className={styles.why}>
      {chips.map((c) => (
        <span key={c}>{c}</span>
      ))}
    </p>
  );
}
