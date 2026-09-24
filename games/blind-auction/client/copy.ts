// Words for Blind Auction's screens, shared by the TV, the phone and PhoneStage. Every sentence goes
// through the device's language (`L`); icons always travel with a word (never colour alone).
import type { Translator } from '@partybox/game-sdk/ui';
import type { Hint, Tier } from '../server/hints';
import type { Effect, EffectKind } from '../server/types';
import type { OwnLine } from '../server/views';

export const COIN = '🪙';

export const ICON: Record<Hint['type'], string> = {
  gain: '💰',
  lose: '💀',
  steal: '🦝',
  swap: '🔄',
  double: '✖️2',
  refund: '↩️',
  dud: '🕳️',
};

/** Tone per outcome for styling (always paired with the icon and a word). */
export type Tone = 'good' | 'bad' | 'chaos' | 'flat';
export function toneOf(type: Hint['type'] | EffectKind): Tone {
  if (type === 'gain' || type === 'double') return 'good';
  if (type === 'lose') return 'bad';
  if (type === 'steal' || type === 'swap') return 'chaos';
  return 'flat';
}

export function tierWord(L: Translator, tier: Tier): string {
  return tier === 'LIKELY' ? L('LIKELY') : tier === 'MAYBE' ? L('MAYBE') : L('RARE');
}

/** The outcome part of a hint chip: "+120", "−60", "Heist 30 %", "Swap"… */
export function hintText(L: Translator, h: Pick<Hint, 'type' | 'n'>): string {
  switch (h.type) {
    case 'gain':
      return `+${h.n}`;
    case 'lose':
      return `−${h.n}`;
    case 'steal':
      return L('Heist {n}%', { n: h.n });
    case 'swap':
      return L('Swap');
    case 'double':
      return L('Double');
    case 'refund':
      return L('Refund');
    case 'dud':
      return L('Dud');
  }
}

/** A one-line reading of a whole chip, for screen readers: "Likely: plus 120 coins". */
export function hintLabel(L: Translator, h: Hint): string {
  return `${tierWord(L, h.tier)}: ${ICON[h.type]} ${hintText(L, h)}`;
}

/** The flip's headline on the TV (and PhoneStage). */
export function effectHeadline(L: Translator, e: Effect, winner: string, other: string): string {
  switch (e.kind) {
    case 'gain':
      return L('+{n}!', { n: e.amount });
    case 'double':
      return L('DOUBLE! +{n}', { n: e.amount });
    case 'lose':
      return e.amount > 0 ? L('TRAP! −{n}', { n: e.amount }) : L('TRAP! Nothing left to lose');
    case 'steal':
      return e.amount > 0
        ? L('HEIST! {a} steals {n} from {b}', { a: winner, b: other, n: e.amount })
        : L('HEIST! Nothing to steal!');
    case 'swap':
      return L('SWAP! {a} ⇄ {b}', { a: winner, b: other });
    case 'refund':
      return L('Money back: +{n}', { n: e.amount });
    case 'dud':
      return L('A dud.');
    case 'none':
      return L('Nobody bought it.');
  }
}

/** The one word for what the flip was: "JACKPOT", "TRAP"… */
export function kickerWord(L: Translator, kind: EffectKind): string {
  switch (kind) {
    case 'gain':
      return L('JACKPOT');
    case 'double':
      return L('DOUBLE');
    case 'lose':
      return L('TRAP');
    case 'steal':
      return L('HEIST');
    case 'swap':
      return L('SWAP');
    case 'refund':
      return L('REFUND');
    case 'dud':
      return L('DUD');
    case 'none':
      return L('UNSOLD');
  }
}

const KICKER_ICON: Record<EffectKind, string> = { ...ICON, none: '📦' };

/** The kicker over the headline: "💰 JACKPOT" etc. */
export function effectKicker(L: Translator, kind: EffectKind): string {
  return `${KICKER_ICON[kind]} ${kickerWord(L, kind)}`;
}

/** A player's own line, once the TV has shown it. */
export function ownLineText(L: Translator, line: OwnLine): { big: string; small?: string } {
  switch (line.kind) {
    case 'won':
      return { big: L('You won it for {coin} {n}!', { coin: COIN, n: line.amount }) };
    case 'outbid':
      return { big: L('Outbid by {name}', { name: line.name }), small: `${COIN} ${line.amount}` };
    case 'watched':
      return {
        big: L('{name} won it for {coin} {n}', { name: line.name, coin: COIN, n: line.amount }),
      };
    case 'unsold':
      return { big: L('No takers!') };
    case 'stolen':
      return { big: L('{name} stole {n} from you', { name: line.name, n: line.amount }) };
    case 'swapped':
      return { big: L('{name} swapped coins with you', { name: line.name }) };
    case 'theirs':
      return { big: `${line.name}: ${theirText(L, line.effect, line.amount)}` };
    case 'mine':
      return { big: mineText(L, line.effect, line.amount, line.name) };
  }
}

function mineText(L: Translator, kind: EffectKind, n: number, other: string): string {
  switch (kind) {
    case 'gain':
    case 'double':
      return L('+{n} coins!', { n });
    case 'lose':
      return n > 0 ? L('A trap! −{n} coins', { n }) : L('A trap! Nothing left to lose');
    case 'steal':
      return n > 0 ? L('You stole {n} from {name}!', { n, name: other }) : L('Nothing to steal!');
    case 'swap':
      return L('You swapped with {name}', { name: other });
    case 'refund':
      return L('Money back: +{n}', { n });
    default:
      return L('A dud. Nothing inside.');
  }
}

function theirText(L: Translator, kind: EffectKind, n: number): string {
  switch (kind) {
    case 'gain':
    case 'double':
      return `+${n}`;
    case 'lose':
      return L('a trap (−{n})', { n });
    case 'steal':
      return L('a heist (+{n})', { n });
    case 'swap':
      return L('a swap');
    case 'refund':
      return L('money back');
    default:
      return L('a dud');
  }
}
