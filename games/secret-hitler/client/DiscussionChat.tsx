import { useEffect, useRef, useState } from 'react';
import type { FormEvent, JSX } from 'react';
import { useT } from '@partybox/game-sdk/ui';
import type { Input } from '../server/types';
import type { ShControllerView } from '../server/views';
import { STRINGS } from './strings';
import styles from './chat.module.css';

export function DiscussionChat({
  view,
  send,
}: {
  view: ShControllerView;
  send: (input: Input) => void;
}): JSX.Element {
  const L = useT(STRINGS);
  const [draft, setDraft] = useState('');
  const [lastSent, setLastSent] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const [hiddenAbove, setHiddenAbove] = useState(false);
  const chat = view.chat ?? [];
  const transcriptKey = JSON.stringify(chat);
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const measure = (): void => setHiddenAbove(el.scrollTop > 1);
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    el.addEventListener('scroll', measure, { passive: true });
    measure();
    return () => {
      observer.disconnect();
      el.removeEventListener('scroll', measure);
    };
  }, []);
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight });
  }, [transcriptKey]);
  useEffect(() => {
    if (lastSent === null || now - lastSent >= 3_000) return;
    const timer = setTimeout(() => setNow(Date.now()), 3_000 - (now - lastSent));
    return () => clearTimeout(timer);
  }, [lastSent, now]);
  const cooling = lastSent !== null && now - lastSent < 3_000;
  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || cooling || view.paused) return;
    send({ type: 'chat', text });
    setDraft('');
    setLastSent(Date.now());
    setNow(Date.now());
  };
  return (
    <section className={styles.chat} aria-label={L('Room chat')}>
      <strong className={styles.heading}>
        {L('Discuss…')} · {L('Room chat')}
      </strong>
      <div
        ref={list}
        className={styles.messages}
        data-hidden-above={hiddenAbove || undefined}
        role="log"
        aria-live="polite"
      >
        {chat.length === 0 ? <p className={styles.empty}>{L('Talk to the room')}</p> : null}
        {chat.map((message, index) => {
          const id = view.seats[message.seat]?.id;
          const name = view.players.find((player) => player.id === id)?.name ?? '?';
          return (
            <p key={index} className={styles.message}>
              <strong>{id === view.me.id ? L('You') : name}: </strong>
              {message.text}
            </p>
          );
        })}
      </div>
      <form className={styles.composer} onSubmit={submit}>
        <input
          aria-label={L('Message to the room')}
          placeholder={L('Message')}
          value={draft}
          maxLength={120}
          onChange={(event) => setDraft(event.target.value)}
          disabled={view.paused}
        />
        <button type="submit" disabled={!draft.trim() || cooling || view.paused}>
          {L('Send')}
        </button>
      </form>
    </section>
  );
}
