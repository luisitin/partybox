// Phone during "answer": one prompt at a time (1 of 2, then 2 of 2), each TextAnswer keyed by
// prompt id. "Sent" is remembered locally until the server's view confirms it, so the button shows
// its submitted state immediately and a double tap cannot send twice. Sending prompt 1 is
// acknowledged before prompt 2 arrives: the '✓ Submitted · You said …' card holds for one slow beat
// (600 ms; 0 under reduced motion), then prompt 2 rises in as a new card with '✓ 1 sent' in its
// kicker, and the button says what it does — 'Submit 1 of 2', 'Submit 2 of 2'.
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { TextAnswer, WaitingScreen, usePrefersReducedMotion } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { WisecrackControllerView } from '../server/index';
import type { Input } from '../server/types';
import styles from './wisecrack.module.css';

const MAX_CHARS = 80;
/** One --pb-motion-slow: the documented maximum for a hold. */
const HOLD_MS = 600;

export function ControllerAnswer({
  view,
  send,
}: GameControllerProps<WisecrackControllerView, Input>): JSX.Element {
  const [sentId, setSentId] = useState<string | null>(null);
  const [held, setHeld] = useState<{ id: string } | null>(null);
  const reduced = usePrefersReducedMotion();
  const holdMs = reduced ? 0 : HOLD_MS;
  useEffect(() => {
    if (!held) return;
    const handle = setTimeout(() => setHeld(null), holdMs);
    return () => clearTimeout(handle);
  }, [held, holdMs]);
  const total = view.myPrompts.length;
  const index = view.myPrompts.findIndex((p) => p.answer === null);
  const current = index === -1 ? null : view.myPrompts[index];
  // Counted, not positional: a phone can answer prompt 2 first (review-loop #69).
  const sent = view.myPrompts.filter((p) => p.answer !== null).length;
  const kickerFor = (i: number, done: number): string =>
    `Round ${view.round} · Prompt ${i + 1} of ${total}${done > 0 ? ` · ✓ ${done} sent` : ''}`;
  // The card that was just sent stays up (same key → same instance → 'You said …') until the beat.
  const heldIndex =
    held && held.id !== current?.id ? view.myPrompts.findIndex((p) => p.id === held.id) : -1;
  const heldPrompt = heldIndex === -1 ? null : view.myPrompts[heldIndex];
  if (heldPrompt) {
    return (
      <TextAnswer
        key={heldPrompt.id}
        kicker={kickerFor(heldIndex, sent - 1)}
        prompt={heldPrompt.text}
        submitted
        promptKey={heldPrompt.id}
        submittedHint={sent < total ? 'One more…' : undefined}
        onSubmit={() => undefined}
      />
    );
  }
  if (!current) {
    return (
      <WaitingScreen
        className="pb-enter"
        title={total > 0 ? 'Both answers in!' : 'Nothing to write this round'}
        hint="Waiting for the others… the voting starts on the TV."
        mood={total > 0 ? 'done' : 'watch'}
      >
        {view.myPrompts.map((p) => (
          <p key={p.id} className={styles.quote}>
            {p.answer}
          </p>
        ))}
      </WaitingScreen>
    );
  }
  return (
    <TextAnswer
      key={current.id}
      className="pb-enter"
      kicker={kickerFor(index, sent)}
      prompt={current.text}
      placeholder="Your funniest answer…"
      maxLength={MAX_CHARS}
      submitted={sentId === current.id}
      promptKey={current.id}
      submitLabel={total > 1 ? `Submit ${sent + 1} of ${total}` : 'Submit'}
      submittedHint={sent + 1 < total ? 'One more…' : undefined}
      onSubmit={(text) => {
        setSentId(current.id);
        if (holdMs > 0) setHeld({ id: current.id });
        send({ type: 'answer', promptId: current.id, text });
      }}
    />
  );
}
