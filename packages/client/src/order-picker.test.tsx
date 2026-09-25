// OrderPicker (foundation §6): tapping gives the next number, tapping a placed row takes it out
// and later numbers move up, Reset clears; never colour alone (a digit in every placed badge, the
// next number in every empty one); locked rows are real disabled buttons.
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { OrderPicker, toggleOrder } from '@partybox/game-sdk/ui/order-picker';

const ITEMS = ['chips', 'jerky', 'grapes', 'gummies', 'egg'].map((id) => ({ id, label: id }));
const noop = (): void => undefined;

describe('toggleOrder', () => {
  it('appends an unplaced id and removes a placed one (later numbers move up)', () => {
    expect(toggleOrder([], 'a')).toEqual(['a']);
    expect(toggleOrder(['a', 'b', 'c'], 'd')).toEqual(['a', 'b', 'c', 'd']);
    expect(toggleOrder(['a', 'b', 'c'], 'a')).toEqual(['b', 'c']);
    expect(toggleOrder(['a', 'b', 'c'], 'b')).toEqual(['a', 'c']);
  });
});

describe('OrderPicker', () => {
  it('shows each placed row’s number and the next number in the empty ones', () => {
    const html = renderToStaticMarkup(
      <OrderPicker items={ITEMS} value={['grapes', 'chips']} onChange={noop} />,
    );
    expect(html).toContain('grapes: number 1. Tap to take it out.');
    expect(html).toContain('chips: number 2. Tap to take it out.');
    expect(html).toContain('jerky: not placed. Tap to make it number 3.');
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(2);
    // The rows never move: pack order in the markup, whatever the picks.
    const order = [...html.matchAll(/aria-label="(\w+):/g)].map((m) => m[1]);
    expect(order).toEqual(['chips', 'jerky', 'grapes', 'gummies', 'egg']);
  });

  it('locked: every row and Reset are disabled', () => {
    const html = renderToStaticMarkup(
      <OrderPicker items={ITEMS} value={ITEMS.map((i) => i.id)} onChange={noop} disabled />,
    );
    expect(html.match(/<button[^>]*disabled/g)).toHaveLength(6);
  });

  it('Reset is disabled while nothing is placed', () => {
    const html = renderToStaticMarkup(<OrderPicker items={ITEMS} value={[]} onChange={noop} />);
    expect(html.match(/<button[^>]*disabled/g)).toHaveLength(1);
  });
});
