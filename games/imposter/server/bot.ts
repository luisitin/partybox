// Bots (SPEC §1.9): every decision starts from the bot's own `controllerView` — the packs only
// stand in for a person's general knowledge (a crew bot "knows" the word's associations; an
// imposter bot knows what the category's words are like). They never read a secret they could not
// see, and never send the same clue twice in a game.
import type { Rng } from '@partybox/game-sdk';
import { normalize, sameAnswer } from '../match';
import { FAMILY, PACK_LANG, SPICY, categoryById, wordAnywhere } from './content';
import type { Category, WordItem } from '../content/schema';
import type { ImposterControllerView } from './views';
import type { Input } from './types';

const compact = (t: string): string => normalize(t, PACK_LANG).compact;
const ALL_CATS: readonly Category[] = [...FAMILY.categories, ...SPICY.categories];

function boardTexts(view: ImposterControllerView): string[] {
  return view.stage.board.flatMap((c) => [...c.before, ...(c.now ? [c.now] : [])]);
}

function fresh(options: readonly string[], view: ImposterControllerView): string[] {
  const used = [...boardTexts(view), ...view.mine.said];
  return options.filter((o) => !used.some((u) => sameAnswer(u, o, PACK_LANG)));
}

/** Each word's bank, normalized once at load (bots ask this on every decision). */
const BANK = new Map(ALL_CATS.flatMap((c) => c.words).map((w) => [w.id, w.clues.map(compact)]));

/** How many of a word's bank clues are on the board. */
function overlap(word: WordItem, texts: readonly string[]): number {
  const set = new Set(texts.map(compact));
  return (BANK.get(word.id) ?? word.clues.map(compact)).filter((c) => set.has(c)).length;
}

/** The imposter's best guess at the word: the category word whose bank the board fits best. */
function bestGuess(cats: readonly Category[], texts: readonly string[], rng: Rng): WordItem | null {
  const words = cats.flatMap((c) => c.words);
  if (words.length === 0) return null;
  const best = Math.max(...words.map((w) => overlap(w, texts)));
  return rng.pick(words.filter((w) => overlap(w, texts) === best));
}

function imposterCats(view: ImposterControllerView): Category[] {
  const cat = view.catId ? categoryById(view.catId) : undefined;
  if (cat) return [cat];
  // No hint: read the board — the categories whose words its clues fit best, like a person would.
  const texts = boardTexts(view);
  if (texts.length === 0) return [...ALL_CATS];
  const score = (c: Category): number => Math.max(0, ...c.words.map((w) => overlap(w, texts)));
  const best = Math.max(...ALL_CATS.map(score));
  return best > 0 ? ALL_CATS.filter((c) => score(c) === best) : [...ALL_CATS];
}

function clueFor(view: ImposterControllerView, rng: Rng): Input | null {
  if (view.mine.clue !== null && view.mine.reject === null) return null;
  let pool: string[];
  if (view.role === 'crew') {
    const word = view.word ? wordAnywhere(view.word.answer) : undefined;
    pool = fresh(word?.clues ?? [], view);
    // Each bot leans on its own slice of the bank, so a table of bots doesn't all say "cheese".
    const k =
      [...view.me.id].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7) %
      Math.max(1, pool.length);
    pool = [...pool.slice(k), ...pool.slice(0, k)].slice(0, 3);
  } else {
    const cats = imposterCats(view);
    const generic = fresh(
      cats.flatMap((c) => c.imposterClues),
      view,
    );
    const texts = boardTexts(view);
    const guess = texts.length > 0 && rng.chance(0.5) ? bestGuess(cats, texts, rng) : null;
    const guessed = guess ? fresh(guess.clues, view) : [];
    pool = guessed.length > 0 ? guessed : generic;
  }
  if (pool.length === 0) return null;
  return { type: 'clue', text: rng.pick(pool) };
}

function voteFor(view: ImposterControllerView, rng: Rng): Input | null {
  const b = view.ballot;
  if (!b || b.candidates.length < b.picks || view.mine.vote !== null) return null;
  const cluesOf = (id: string): string[] => {
    const card = view.stage.board.find((c) => c.by === id);
    return card ? [...card.before, ...(card.now ? [card.now] : [])] : [];
  };
  let ranked: string[];
  if (view.role === 'crew' && view.word) {
    const word = wordAnywhere(view.word.answer);
    const known = new Set(
      [...(word?.clues ?? []), ...view.word.accept, ...view.word.family].map(compact),
    );
    const suspect = (id: string): boolean => cluesOf(id).some((t) => !known.has(compact(t)));
    const suspects = rng.shuffle(b.candidates.filter(suspect));
    ranked = [...suspects, ...rng.shuffle(b.candidates.filter((id) => !suspect(id)))];
  } else if (view.stage.runoff) {
    ranked = rng.shuffle(b.candidates);
  } else {
    // An imposter points at whoever's clues best fit some word other than its own best guess.
    const cats = imposterCats(view);
    const guess = bestGuess(cats, boardTexts(view), rng);
    const others = cats.flatMap((c) => c.words).filter((w) => w.id !== guess?.id);
    const fit = (id: string): number => Math.max(0, ...others.map((w) => overlap(w, cluesOf(id))));
    ranked = rng.shuffle(b.candidates).sort((x, y) => fit(y) - fit(x));
  }
  return { type: 'vote', targets: ranked.slice(0, b.picks) };
}

function guessFor(view: ImposterControllerView, rng: Rng): Input | null {
  if (!view.guessing) return null;
  const cats = imposterCats(view);
  const texts = boardTexts(view);
  const options = view.stage.last?.options ?? null;
  if (options && options.length > 0) {
    const words = options
      .map((o) => cats.flatMap((c) => c.words).find((w) => w.answer === o))
      .filter((w): w is WordItem => w !== undefined);
    const best = words.length > 0 ? Math.max(...words.map((w) => overlap(w, texts))) : 0;
    const top = words.filter((w) => overlap(w, texts) === best).map((w) => w.answer);
    const option = rng.chance(0.7) && top.length > 0 ? rng.pick(top) : rng.pick(options);
    return { type: 'guess', option };
  }
  const guess = bestGuess(cats, texts, rng);
  if (!guess) return { type: 'guess', text: 'something' };
  const text = rng.chance(0.3) && guess.accept.length > 0 ? rng.pick(guess.accept) : guess.answer;
  return { type: 'guess', text };
}

/** The bot's move, from its own phone view only. */
export function decide(view: ImposterControllerView, rng: Rng): Input | null {
  if (!view.seated) return null;
  switch (view.phaseId) {
    case 'deal':
      return view.mine.ready ? null : { type: 'ready' };
    case 'clue':
      return clueFor(view, rng);
    case 'vote':
    case 'runoff':
      return voteFor(view, rng);
    case 'lastChance':
      return guessFor(view, rng);
    default:
      return null;
  }
}
