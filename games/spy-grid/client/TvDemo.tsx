// How Spy Grid works, shown while teams form (the owner's play-test, 2026-09-24: "show the grid at
// the beginning, guide first-timers"): a 3×3 mini-board plays one turn on a loop — everyone sees
// words, only the spymaster sees whose they are, a clue, the team points, two agents turn, and
// the assassin warning. One caption per beat; transform/opacity motion only.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { usePrefersReducedMotion, useT } from '@partybox/game-sdk/ui';
import { KindIcon } from '@partybox/game-sdk/ui/word-grid';
import type { CardKind } from '@partybox/game-sdk/ui/word-grid';
import styles from './TvDemo.module.css';
import { STRINGS } from './strings';

const CARDS: { word: string; kind: CardKind }[] = [
  { word: 'SHARK', kind: 'sun' },
  { word: 'PIANO', kind: 'assassin' },
  { word: 'MOON', kind: 'moon' },
  { word: 'CAKE', kind: 'bystander' },
  { word: 'SHIP', kind: 'sun' },
  { word: 'BOOT', kind: 'moon' },
  { word: 'TRAIN', kind: 'bystander' },
  { word: 'ROCKET', kind: 'moon' },
  { word: 'STAR', kind: 'sun' },
];
const PICKS = [0, 4];
const BEAT_MS = 2800;
const BEATS = 5;

export function TvDemo(): JSX.Element {
  const L = useT(STRINGS);
  const reduced = usePrefersReducedMotion();
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setBeat((b) => (b + 1) % BEATS), reduced ? BEAT_MS * 1.5 : BEAT_MS);
    return () => clearInterval(t);
  }, [reduced]);
  const captions = [
    L('Everyone sees 25 words.'),
    L('Only the spymaster 🕶️ sees whose they are.'),
    L('The spymaster gives one word and a number.'),
    L('Your team points on their phones — the most-pointed word turns over.'),
    L('Find all your agents first. Never touch the assassin 💀.'),
  ];
  return (
    <div className={styles.demo} aria-label={L('How to play')}>
      <div className={styles.stage}>
        <div className={styles.grid}>
          {CARDS.map((c, i) => {
            const keyed = beat === 1 || beat === 2;
            const pointed = beat === 3 && PICKS.includes(i);
            const turned = beat >= 3 && PICKS.includes(i);
            const warn = beat === 4 && c.kind === 'assassin';
            return (
              <div
                key={c.word}
                className={`${styles.card} ${keyed ? styles[`key-${c.kind}`] : ''} ${pointed ? styles.pointed : ''} ${turned ? styles.turned : ''} ${warn ? styles.warn : ''}`}
                style={{ animationDelay: `${PICKS.indexOf(i) * 250 + 900}ms` }}
              >
                <span className={styles.inner}>
                  <span className={styles.front}>
                    {keyed ? (
                      <span className={styles.keyMark}>
                        <KindIcon kind={c.kind} />
                      </span>
                    ) : null}
                    {c.word}
                  </span>
                  <span className={`${styles.back} ${styles[c.kind]}`}>
                    <span className={styles.icon}>
                      <KindIcon kind={c.kind} />
                    </span>
                  </span>
                </span>
                {pointed ? <span className={styles.finger}>☝️</span> : null}
                {warn ? <span className={styles.skull}>💀</span> : null}
              </div>
            );
          })}
        </div>
        {beat === 2 || beat === 3 ? (
          <div className={styles.clue} key={`clue${beat === 2 ? 'in' : 'on'}`}>
            <span className={styles.clueSpy}>🕶️</span> OCEAN · 2
          </div>
        ) : null}
      </div>
      <div className={styles.dots} aria-hidden>
        {captions.map((_, i) => (
          <i key={i} className={i === beat ? styles.dotOn : ''} />
        ))}
      </div>
      <p className={styles.caption} key={beat}>
        {captions[beat]}
      </p>
    </div>
  );
}
