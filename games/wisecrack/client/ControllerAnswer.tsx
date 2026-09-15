// Phone during "answer": one prompt at a time (1 of 2, then 2 of 2), each TextAnswer keyed by
// prompt id. "Sent" is remembered locally until the server's view confirms it, so the button shows
// its submitted state immediately and a double tap cannot send twice.
import { useState } from 'react';
import type { JSX } from 'react';
import { TextAnswer, WaitingScreen } from '@partybox/game-sdk/ui';
import type { GameControllerProps } from '@partybox/game-sdk/ui';
import type { WisecrackControllerView } from '../server/index';
import type { Input } from '../server/types';
import styles from './wisecrack.module.css';

const MAX_CHARS = 80;

export function ControllerAnswer({
  view,
  send,
}: GameControllerProps<WisecrackControllerView, Input>): JSX.Element {
  const [sentId, setSentId] = useState<string | null>(null);
  const total = view.myPrompts.length;
  const index = view.myPrompts.findIndex((p) => p.answer === null);
  const current = index === -1 ? null : view.myPrompts[index];
  if (!current) {
    return (
      <WaitingScreen
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
      kicker={`Round ${view.round} · Prompt ${index + 1} of ${total}`}
      prompt={current.text}
      placeholder="Your funniest answer…"
      maxLength={MAX_CHARS}
      submitted={sentId === current.id}
      promptKey={current.id}
      submitLabel={index + 1 < total ? 'Next prompt' : 'Submit'}
      onSubmit={(text) => {
        setSentId(current.id);
        send({ type: 'answer', promptId: current.id, text });
      }}
    />
  );
}
