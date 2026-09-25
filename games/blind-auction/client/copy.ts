// Words for Blind Auction's screens, shared by the TV, the phone and PhoneStage. Every sentence goes
// through the device's language (`L`); every content travels with its icon and its word (never
// colour alone).
import type { Translator } from '@partybox/game-sdk/ui';
import type { Tier } from '../server/odds';
import type { ContentKind } from '../server/types';
import type { OwnLine } from '../server/views';

export const COIN = '🪙';

export const KIND_ICON: Record<ContentKind, string> = {
  treasure: '💰',
  jackpot: '💎',
  trap: '💀',
  raccoon: '🦝',
  mirror: '🪞',
  twins: '👯',
  receipt: '🧾',
  empty: '🕳️',
};

export function kindName(L: Translator, kind: ContentKind): string {
  switch (kind) {
    case 'treasure':
      return L('Treasure');
    case 'jackpot':
      return L('Jackpot');
    case 'trap':
      return L('A trap');
    case 'raccoon':
      return L('A raccoon');
    case 'mirror':
      return L('A magic mirror');
    case 'twins':
      return L('Twins');
    case 'receipt':
      return L('A receipt');
    case 'empty':
      return L('Nothing');
  }
}

/** Tone per content, for styling only (always paired with the icon and the word). */
export type Tone = 'good' | 'bad' | 'odd';
export function toneOf(kind: ContentKind): Tone {
  if (kind === 'treasure' || kind === 'jackpot' || kind === 'twins') return 'good';
  if (kind === 'trap' || kind === 'empty') return 'bad';
  return 'odd';
}

export function tierWord(L: Translator, tier: Tier): string {
  return tier === 'LIKELY' ? L('LIKELY') : tier === 'MAYBE' ? L('MAYBE') : L('RARE');
}

/** "×1.5" — a payout multiplier, with the decimal comma in Spanish. */
export function payText(L: Translator, pay: number): string {
  const n = Number.isInteger(pay) ? String(pay) : pay.toFixed(1);
  return `×${L.lang === 'es' ? n.replace('.', ',') : n}`;
}

/** A player's own line, once the TV has shown the box open. */
export function ownLineText(
  L: Translator,
  line: OwnLine,
  inside: string,
): { big: string; small: string } {
  switch (line.kind) {
    case 'won':
      return {
        big: L('You called it! +{n}', { n: line.back - line.amount }),
        small: L('It was {what}. Your {coin} {bet} paid {coin} {back}.', {
          what: inside,
          coin: COIN,
          bet: line.amount,
          back: line.back,
        }),
      };
    case 'lost':
      return {
        big: L('Not this time: −{n}', { n: line.amount }),
        small: L('It was {what}.', { what: inside }),
      };
    case 'sat':
      return { big: L('You sat this one out'), small: L('It was {what}.', { what: inside }) };
  }
}
