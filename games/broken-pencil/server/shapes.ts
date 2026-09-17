// What a bot draws (owner request 2026-09-16): a small library of recognisable line drawings on
// the 256×256 canvas, picked by a keyword in the phrase it was handed ("a very tired cat" → the
// cat). Every stroke is a list of [x, y] points; the bot jitters them so no two drawings are
// identical and adds its own colour and width. Unknown phrases get a shrug: a smiley and a
// question mark, which is honest about what a bot can see.
import type { Rng } from '@partybox/game-sdk';
import * as pic from './shapes-catalog';
import { C, star } from './shapes-draw';
import type { Shape } from './shapes-draw';

export type { Points, Shape } from './shapes-draw';

/** Keyword → shape. Checked in order; the first keyword found in the phrase wins. */
const LIBRARY: [string[], () => Shape][] = [
  [['sun', 'sunny', 'sunshine'], pic.sun],
  [['moon', 'night'], pic.moonAndStars],
  [['star'], (): Shape => [star(C, C, 90, 40)]],
  [['heart', 'love'], pic.heart],
  [['house', 'home', 'cabin', 'hut'], pic.house],
  [['cat', 'kitten'], pic.cat],
  [['dog', 'puppy'], pic.dog],
  [['tree', 'forest', 'wood'], pic.tree],
  [['fish', 'shark'], pic.fish],
  [['boat', 'ship', 'sail'], pic.boat],
  [['car', 'taxi', 'truck', 'bus'], pic.car],
  [['robot'], pic.robot],
  [['ghost'], pic.ghost],
  [['hat', 'cap'], pic.hat],
  [['banana'], pic.banana],
  [['flower', 'rose', 'daisy', 'garden'], pic.flower],
  [['cup', 'mug', 'coffee', 'tea', 'soup'], pic.cup],
  [['pizza', 'cheese'], pic.pizza],
  [['rain', 'storm'], pic.rain],
  [['cloud', 'sky'], pic.cloud],
  [['umbrella'], pic.umbrella],
  [['phone', 'remote'], pic.phone],
  [['shoe', 'boot', 'sock'], pic.shoe],
  [['snake', 'worm'], pic.snake],
  [['apple', 'fruit'], pic.apple],
  [['ball', 'football', 'planet'], pic.ball],
  [['bird', 'duck', 'chicken'], pic.bird],
  [['spider', 'bug'], pic.spider],
  [['glasses'], pic.glasses],
  [['key'], pic.key],
  [['egg'], pic.egg],
  [['clock', 'time', 'watch'], pic.clock],
];

/** The shape for a phrase (the bot draws the first thing it recognises), or a shrug. */
export function shapeFor(phrase: string): Shape {
  const words = phrase
    .toLowerCase()
    .replace(/[^a-z ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  for (const [keys, make] of LIBRARY) {
    if (words.some((w) => keys.some((k) => w === k || w === `${k}s` || w === `${k}es`)))
      return make();
  }
  return pic.shrug();
}

/** A hand-drawn copy: every point nudged a little, so two drawings of the same thing differ. */
export function jitter(shape: Shape, rng: Rng, amount = 3): Shape {
  return shape.map((stroke) => stroke.map((v) => v + rng.int(-amount, amount)));
}
