// English for the start stage (ADR-053): the rules, everyone's READY, the 3·2·1. Split from
// i18n-en.ts (its line cap) and spread into `en` there. Imports nothing.
const list = (names: string[], more: number): string => {
  const shown = more > 0 ? [...names, `${more} more`] : names;
  return shown.length <= 1
    ? (shown[0] ?? '')
    : `${shown.slice(0, -1).join(', ')} and ${shown.at(-1) ?? ''}`;
};

export const enStage = {
  stage: {
    ready: 'I’m ready',
    youAreReady: 'Ready',
    /** READY while the last step is still below the fold: a tap scrolls to it (reviewer D1). */
    readAll: '↓ Read all 3 steps',
    waitingFor: (names: string[], more: number): string => `Waiting for ${list(names, more)}`,
    everyoneReady: 'Everyone’s ready!',
    everyoneElseReady: 'Everyone else is ready',
    wait: 'Wait',
    held: 'On hold: the VIP starts it when everyone is here',
    heldVip: 'On hold: tap Start now when everyone is here',
    startNow: 'Start now',
    back: '‹ Back',
    /** the VIP's line under Start now: what it does to people still reading */
    startNowHint: 'Starts the count even if someone is still reading',
  },
};
