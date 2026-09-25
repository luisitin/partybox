// The three rules on the ready-up screen (owner, #decisions cc45f4), in the flavour's words. The
// village set matches manifest.json's howToPlay.
import type { Translator } from '@partybox/game-sdk/ui';

export function rulesFor(flavour: string, L: Translator): { icon: string; text: string }[] {
  if (flavour === 'mafia')
    return [
      { icon: '🃏', text: L('Check your card for your secret role. The mafia know each other.') },
      {
        icon: '🌙',
        text: L(
          'At night everyone taps a face in secret: the mafia strike, the detective looks, the doctor saves.',
        ),
      },
      {
        icon: '☀️',
        text: L(
          'By day, talk it out and vote someone out. Find the mafia before they outnumber you.',
        ),
      },
    ];
  return [
    { icon: '🃏', text: L('Check your card for your secret role. Wolves know each other.') },
    {
      icon: '🌙',
      text: L(
        'At night everyone taps a face in secret: wolves hunt, the seer looks, the doctor saves.',
      ),
    },
    {
      icon: '☀️',
      text: L(
        'By day, talk it out and vote someone out. Find the wolves before they outnumber you.',
      ),
    },
  ];
}
