// I-755 B: this browser's tabs talk over a BroadcastChannel — "who has the seat?" / "I do" — so a
// newly opened tab can step aside instead of taking the seat from the tab that is playing.

/** `mine()`: this tab's login while it is playing (null otherwise). Returns `askOtherTabs(token)`:
 *  true when another tab playing with that login answers within 300 ms. */
export function createSeatChannel(mine: () => string | null): (token: string) => Promise<boolean> {
  const channel =
    typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('partybox:seat');
  channel?.addEventListener('message', (e: MessageEvent<{ type: string; token?: string }>) => {
    const token = mine();
    if (e.data.type === 'who' && token && e.data.token === token)
      channel.postMessage({ type: 'here' });
  });
  return (token) =>
    new Promise((resolve) => {
      if (!channel || !token) return resolve(false);
      const onMessage = (e: MessageEvent<{ type: string }>): void => {
        if (e.data.type !== 'here') return;
        channel.removeEventListener('message', onMessage);
        resolve(true);
      };
      channel.addEventListener('message', onMessage);
      channel.postMessage({ type: 'who', token });
      setTimeout(() => {
        channel.removeEventListener('message', onMessage);
        resolve(false);
      }, 300);
    });
}
