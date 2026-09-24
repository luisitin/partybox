// The phone by day (SPEC §10.9 "Day"): the role reminder under hold-to-see, the question, the living
// with hunch bars, and **Ready to vote ✋** (a toggle). With the town board on, the feed scrolls in
// the Screen while the Post box and Ready stay pinned in the footer; 3 posts a day, 80 characters.
import { useRef, useState } from 'react';
import type { JSX } from 'react';
import { Avatar, PrimaryButton, Screen, buzz, useT } from '@partybox/game-sdk/ui';
import type { NightfallControllerView } from '../server/index';
import type { Input } from '../server/types';
import { playerOf } from './lookup';
import { MiniVillage, RoleStrip } from './PhoneBits';
import { STRINGS } from './strings';
import styles from './Phone.module.css';

type View = NightfallControllerView;
const MAX = 80;

function readable(text: string): boolean {
  return /[\p{L}\p{N}]/u.test(text);
}

function PostBox({ view, send }: { view: View; send: (i: Input) => void }): JSX.Element {
  const L = useT(STRINGS);
  const [text, setText] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const left = view.postsLeft ?? 0;
  const ok = left > 0 && readable(text);
  const submit = (): void => {
    if (left <= 0) {
      setNote(L("That's your 3 posts for today"));
      buzz([40, 60, 40]);
      return;
    }
    if (!readable(text)) {
      setNote(L('Write something first.'));
      buzz([40, 60, 40]);
      return;
    }
    send({ type: 'post', text: text.trim().slice(0, MAX) });
    setText('');
    setNote(null);
  };
  return (
    <form
      className={styles.postRow}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <input
        className={styles.input}
        value={text}
        maxLength={MAX}
        enterKeyHint="send"
        autoComplete="off"
        aria-label={L('Post to the town board')}
        placeholder={
          note ?? (left > 0 ? L('Post… ({left} left)', { left }) : L('No posts left today'))
        }
        onChange={(e) => {
          setText(e.target.value);
          if (note) setNote(null);
        }}
      />
      <button type="submit" className={styles.small} aria-disabled={!ok}>
        {L('Post')}
      </button>
    </form>
  );
}

export function DayPhone({ view, send }: { view: View; send: (i: Input) => void }): JSX.Element {
  const L = useT(STRINGS);
  const board = view.postsLeft !== null;
  // A toggle under a mashing thumb: taps closer than 450 ms are one tap (no on-off flicker).
  const lastTap = useRef(0);
  const readyLine = L('{ready} of {living} ready to vote', {
    ready: view.readyCount,
    living: view.livingCount,
  });
  return (
    <Screen
      className={styles.screen}
      footer={
        <div className={styles.footer}>
          {board ? <PostBox view={view} send={send} /> : null}
          <PrimaryButton
            tone={view.ready ? 'success' : 'accent'}
            aria-pressed={view.ready}
            onClick={(e) => {
              if (e.timeStamp - lastTap.current < 450) return;
              lastTap.current = e.timeStamp;
              send({ type: 'ready' });
            }}
          >
            {view.ready ? L('Ready · tap to undo') : L('Ready to vote ✋')}
          </PrimaryButton>
        </div>
      }
    >
      <div className={styles.stack}>
        <RoleStrip view={view} />
        <p className={styles.head}>
          {L('Discuss! {question}', { question: L.sent(view.question) })}
        </p>
        <p className={styles.status} aria-live="polite">
          ✋ {readyLine}
        </p>
        <MiniVillage view={view} />
        {board ? (
          view.board.length === 0 ? (
            <p className={styles.sub}>{L('Nobody has posted yet.')}</p>
          ) : (
            <ol className={styles.feed} aria-label={L('Town board')}>
              {view.board.map((p, i) => {
                const who = playerOf(view.players, p.by);
                return (
                  <li key={`${p.by}-${i}`} className={styles.post}>
                    {who ? (
                      <span className={styles.postFace}>
                        <Avatar avatarId={who.avatarId} size="100%" />
                      </span>
                    ) : null}
                    <span className={styles.postBody}>
                      <span className={styles.postName}>{who?.name ?? ''}</span>
                      {p.text}
                    </span>
                  </li>
                );
              })}
            </ol>
          )
        ) : null}
      </div>
    </Screen>
  );
}
