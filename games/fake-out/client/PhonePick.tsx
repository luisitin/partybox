// Phone "pick" (SPEC §3.4): a pinned header "Pick the truth" (a small 👍 hint above the list), then
// every option but the player's own, full width: tap a row to pick it (✓ + the submit haptic; tap
// another to change), and a 44 × 44 👍 on the right of each row — two per question. The list
// scrolls past eight options; the header stays pinned.
import { useRef } from 'react';
import type { JSX } from 'react';
import { Screen, buzz, useSound, useT } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { FakeOutControllerView } from '../server/index';
import type { Input } from '../server/types';
import { FactCard } from './FactCard';
import { STRINGS } from './strings';
import styles from './phone.module.css';

type Props = GameControllerProps<FakeOutControllerView, Input>;

const MAX_LIKES = 2;

export function PhonePick({ view, send }: Props): JSX.Element {
  const L = useT(STRINGS);
  const play = useSound();
  const likes = new Set(view.myLikes);
  const spent = likes.size >= MAX_LIKES;
  // A mashed row sends (and buzzes) once: the same option again inside a beat is dropped.
  const lastPick = useRef<{ id: string; at: number }>({ id: '', at: 0 });
  return (
    <Screen className={styles.screen}>
      <div className={styles.pinned}>
        <p className={styles.pickTitle}>{L('Pick the truth')}</p>
        <FactCard fact={view.fact} size="phone" className={styles.factSmall} />
        {view.mine ? (
          <p className={styles.mine}>{L('Your lie: {lie}', { lie: view.mine.toUpperCase() })}</p>
        ) : null}
      </div>
      {view.likesOn ? <p className={styles.likeHint}>{L('👍 = funniest (optional)')}</p> : null}
      <ul className={styles.options}>
        {view.options.map((o, i) => {
          const picked = view.myPick === o.id;
          const liked = likes.has(o.id);
          return (
            <li key={o.id} className={styles.row} style={{ ['--i' as string]: i }}>
              <button
                type="button"
                className={styles.pickButton}
                aria-pressed={picked}
                data-picked={picked ? '' : undefined}
                onClick={(e) => {
                  const now = e.timeStamp;
                  if (picked || (lastPick.current.id === o.id && now - lastPick.current.at < 800))
                    return;
                  lastPick.current = { id: o.id, at: now };
                  play('submit');
                  buzz(20);
                  send({ type: 'pick', option: o.id });
                }}
              >
                <span className={styles.pickMark} aria-hidden>
                  {picked ? '✓' : ''}
                </span>
                <span className={styles.pickText}>{o.display}</span>
              </button>
              {view.likesOn ? (
                <button
                  type="button"
                  className={styles.likeButton}
                  aria-pressed={liked}
                  aria-label={
                    liked
                      ? L('Unlike {lie}', { lie: o.display })
                      : L('Like {lie}', { lie: o.display })
                  }
                  data-on={liked ? '' : undefined}
                  disabled={!liked && spent}
                  onClick={() => {
                    play('submit', { gain: 0.35 });
                    send({ type: 'like', option: o.id, on: !liked });
                  }}
                >
                  👍
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
      {view.myPick ? (
        <p className={styles.pickedHint} role="status">
          {L('Picked! Tap another to change your mind.')}
        </p>
      ) : null}
    </Screen>
  );
}
