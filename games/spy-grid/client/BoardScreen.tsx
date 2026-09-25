// A phone screen with the board: portrait stacks the side panel over the board with the actions in
// the sticky footer; a phone held sideways (short and wide) puts the side panel and the actions in
// a left column and the whole board on the right, so all 25 cards fit without scrolling.
import { useSyncExternalStore } from 'react';
import type { JSX, ReactNode } from 'react';
import { Screen } from '@partybox/game-sdk/ui';
import styles from './Controller.module.css';

const QUERY = '(orientation: landscape) and (max-height: 520px)';

function subscribe(fn: () => void): () => void {
  const mq = globalThis.matchMedia?.(QUERY);
  mq?.addEventListener('change', fn);
  return () => mq?.removeEventListener('change', fn);
}

export function useSideways(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => globalThis.matchMedia?.(QUERY).matches ?? false,
    () => false,
  );
}

export function BoardScreen({
  side,
  board,
  footer,
}: {
  side: ReactNode;
  board: ReactNode;
  footer?: ReactNode;
}): JSX.Element {
  const sideways = useSideways();
  if (sideways)
    return (
      <Screen className={styles.screen}>
        <div className={styles.sideways}>
          <div className={styles.stack}>
            {side}
            {footer}
          </div>
          <div>{board}</div>
        </div>
      </Screen>
    );
  return (
    <Screen className={styles.screen} footer={footer}>
      <div className={styles.stack}>
        {side}
        {board}
      </div>
    </Screen>
  );
}
