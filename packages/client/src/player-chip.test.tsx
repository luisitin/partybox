// The lobby's removable bot chip (foundation, imposter-defaults review): at an SE's two columns the
// 🤖 badge + the ✕ cut "Bot 1" to "B", so a compact chip with a ✕ leaves the badge out. The chip's
// accessible name still says it is a bot, and every other chip keeps the badge.
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PlayerChip } from '@partybox/game-sdk/ui';

const chip = (props: { compact?: boolean; removable?: boolean }): string =>
  renderToStaticMarkup(
    <PlayerChip
      name="Bot 1"
      avatarId="fox"
      isBot
      {...(props.compact ? { compact: true } : {})}
      {...(props.removable ? { onRemove: () => undefined, removeLabel: 'Remove Bot 1' } : {})}
    />,
  );

describe('PlayerChip bot badge', () => {
  it('a compact chip with a ✕ drops the 🤖 badge but still reads as a bot', () => {
    const html = chip({ compact: true, removable: true });
    expect(html).not.toContain('🤖');
    expect(html).toContain('(bot)');
    expect(html).toContain('Remove Bot 1');
  });
  it('keeps the badge everywhere else', () => {
    expect(chip({ compact: true })).toContain('🤖');
    expect(chip({ removable: true })).toContain('🤖');
  });
});
