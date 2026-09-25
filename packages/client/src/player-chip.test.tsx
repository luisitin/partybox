// The lobby's removable bot chip (foundation, imposter-defaults review): at an SE's two columns the
// 🤖 badge + the ✕ cut "Bot 1" to "B", so a compact chip with a ✕ leaves the badge out. The chip's
// accessible name still says it is a bot, and every other chip keeps the badge.
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PlayerChip, splitBotName } from '@partybox/game-sdk/ui';

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

describe('a bot chip keeps the part that tells bots apart (reviewer 90838c)', () => {
  it('splits an owner-named bot into a shrinking owner and a fixed "bot N" tail', () => {
    expect(splitBotName("Maximiliano's bot 2")).toEqual({ head: "Maximiliano's", tail: 'bot 2' });
    expect(splitBotName("Ana's bot")).toEqual({ head: "Ana's", tail: 'bot' });
    expect(splitBotName('Bot 1')).toBeNull();
    expect(splitBotName('Roberto')).toBeNull();
  });
  it('the VIP lobby chip says "Bot 2"; other chips keep the owner, tail in its own span', () => {
    const lobby = renderToStaticMarkup(
      <PlayerChip
        name="Maximiliano's bot 2"
        avatarId="fox"
        isBot
        compact
        onRemove={() => undefined}
      />,
    );
    expect(lobby).toMatch(/>Bot 2<\/span>/);
    expect(lobby).toContain('aria-label="Maximiliano&#x27;s bot 2');
    const strip = renderToStaticMarkup(
      <PlayerChip name="Maximiliano's bot 2" avatarId="fox" isBot />,
    );
    expect(strip).toMatch(/>Maximiliano&#x27;s<\/span><span[^>]*>bot 2<\/span>/);
  });
});
