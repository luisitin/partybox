// English for "Where is everyone?" (game pack Part 00 §3, ADR-047): the VIP's room switch, the
// prompt when someone can't see the TV, and the notices on choosing a game that needs the room.
// Split from i18n-en.ts (its line cap) and spread into `en` there. Imports nothing.
export const enPresence = {
  presence: {
    title: 'Where is everyone?',
    modes: {
      together: 'All in one room',
      'remote-voice': 'Some remote, on a call',
      'remote-text': 'Some remote, no call',
    },
    hints: {
      together: 'everyone sees the TV and can talk',
      'remote-voice': 'remote players hear the room on a call',
      'remote-text': 'PartyBox is the only shared channel',
    },
    /** Part 00 §3.3: someone can't see the TV while the room says everyone is together. */
    prompt: (name: string, more: number): string =>
      more > 0
        ? `${name} and ${more} more can't see the TV. Are they on a call with you?`
        : `${name} can't see the TV. Is ${name} on a call with you?`,
    onCall: 'On a call',
    onCallHint: 'Talking games play as usual',
    noCall: 'No call',
    noCallHint: 'Talking games warn you first; some switch to typing',
    dismiss: 'Not now',
    /** Part 00 §3.5: choosing a game the room's presence doesn't suit. */
    needsVoice: 'This game needs talking. Remote players should join a voice call.',
    onCallPlay: 'We’re on a call, play',
    needsRoom: 'Everyone needs to be in the same room for this one.',
    playAnyway: 'Play anyway',
    pickAnother: 'Pick another',
  },
};
