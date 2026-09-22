// I-082 A: the first room this browser hosts gets a strip of tips — once, then never again
// (the flag is per-browser, like every other phone preference; a private window just never sees
// the tips rather than showing them every time).
const TIPS_KEY = 'partybox:vip-tips-seen';

export const VIP_TIPS = [
  { id: 'bots', text: 'Add bots to fill empty seats — they play for real.' },
  { id: 'crown', text: 'Tap your ★ VIP badge for pause, lock and kick.' },
  { id: 'recap', text: 'Recaps save to the host PC — switch it off on the game picker.' },
] as const;

export function tipsSeen(): boolean {
  try {
    return localStorage.getItem(TIPS_KEY) === '1';
  } catch {
    return true;
  }
}

/** I-082 C: the ★ menu's 💡 brings the tips back for the next host who borrows the phone. */
export function setTipsSeen(seen: boolean): void {
  try {
    if (seen) localStorage.setItem(TIPS_KEY, '1');
    else localStorage.removeItem(TIPS_KEY);
  } catch {
    /* private mode */
  }
}
