// Grouping answers (SPEC §2.6 step 1, §2.8). Pure, and everything iterates in seat order, so the
// same answers always make the same groups, keys and labels.
import { answerLabel, LANG } from './content';
import { matchAnswer, normalize, sameAnswer } from './match';
import type { Group, Outcome, QuestionItem, State } from './types';

const tileKey = (id: string): string => `a:${id}`;

function answeringSeats(state: State): string[] {
  return state.seats.filter((id) => !state.left.includes(id) && Object.hasOwn(state.q.answers, id));
}

function tileGroups(state: State): Group[] {
  const byKey = new Map<string, Group>();
  const labels = new Map((state.q.tiles ?? []).map((t) => [t.id, t.label]));
  for (const id of answeringSeats(state)) {
    const tile = state.q.answers[id]?.tile;
    if (tile === undefined || !labels.has(tile)) continue;
    const key = tileKey(tile);
    const g = byKey.get(key) ?? {
      key,
      label: labels.get(tile) ?? tile,
      members: [],
      raw: {},
      merged: [],
    };
    g.members.push(id);
    byKey.set(key, g);
  }
  return [...byKey.values()];
}

/** The first answer on the list that the text matches exactly or by stem, else the first fuzzy. */
function listMatch(text: string, item: QuestionItem): string | null {
  let fuzzy: string | null = null;
  for (const a of item.answers) {
    const level = matchAnswer(text, a, LANG);
    if (level === 'exact' || level === 'stem') return a.id;
    if (level === 'fuzzy' && fuzzy === null) fuzzy = a.id;
  }
  return fuzzy;
}

/** The most common form in a group (case, accents and spacing aside), as the earliest seat wrote
 *  it, capitalised like the list's labels; ties go to the earliest seat. */
function commonForm(members: string[], raw: Record<string, string>): string {
  const form = (id: string): string => normalize(raw[id] ?? '', LANG).compact;
  const counts = new Map<string, number>();
  for (const id of members) counts.set(form(id), (counts.get(form(id)) ?? 0) + 1);
  let best = members[0] ?? '';
  for (const id of members)
    if ((counts.get(form(id)) ?? 0) > (counts.get(form(best)) ?? 0)) best = id;
  const text = (raw[best] ?? '').trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function typedGroups(state: State, item: QuestionItem): Group[] {
  const byKey = new Map<string, Group>();
  const loose: { id: string; text: string }[] = [];
  for (const id of answeringSeats(state)) {
    const text = state.q.answers[id]?.text;
    if (text === undefined) continue;
    const answerId = listMatch(text, item);
    const answer = item.answers.find((a) => a.id === answerId);
    if (!answer) {
      loose.push({ id, text });
      continue;
    }
    const key = tileKey(answer.id);
    const g = byKey.get(key) ?? {
      key,
      label: answerLabel(answer),
      members: [],
      raw: {},
      merged: [],
    };
    g.members.push(id);
    g.raw[id] = text;
    byKey.set(key, g);
  }
  // Union-find in seat order over the answers the list did not know.
  const parent = loose.map((_, i) => i);
  const find = (i: number): number => {
    let r = i;
    while (parent[r] !== r) r = parent[r] ?? r;
    return r;
  };
  for (let i = 0; i < loose.length; i++)
    for (let j = 0; j < i; j++)
      if (sameAnswer(loose[i]?.text ?? '', loose[j]?.text ?? '', LANG)) {
        const [ri, rj] = [find(i), find(j)];
        if (ri !== rj) parent[Math.max(ri, rj)] = Math.min(ri, rj);
      }
  const roots = new Map<number, Group>();
  loose.forEach((entry, i) => {
    const root = find(i);
    const first = loose[root]?.id ?? entry.id;
    const g = roots.get(root) ?? { key: `t:${first}`, label: '', members: [], raw: {}, merged: [] };
    g.members.push(entry.id);
    g.raw[entry.id] = entry.text;
    roots.set(root, g);
  });
  for (const g of roots.values()) g.label = commonForm(g.members, g.raw);
  return [...byKey.values(), ...roots.values()];
}

/** The groups before any VIP merge. */
export function baseGroups(state: State): Group[] {
  const item = state.questions[state.q.n];
  if (!item) return [];
  return state.cfg.mode === 'typed' ? typedGroups(state, item) : tileGroups(state);
}

/** Applies the VIP's merges in order: the bigger group keeps its label (a tie keeps the first). */
export function applyMerges(base: Group[], merges: [string, string][]): Group[] {
  const byKey = new Map(
    base.map((g) => [
      g.key,
      { ...g, members: [...g.members], raw: { ...g.raw }, merged: [...g.merged] },
    ]),
  );
  const owner = new Map(base.map((g) => [g.key, g.key]));
  const rootOf = (key: string): string => owner.get(key) ?? key;
  for (const [a, b] of merges) {
    const ra = rootOf(a);
    const rb = rootOf(b);
    const ga = byKey.get(ra);
    const gb = byKey.get(rb);
    if (!ga || !gb || ra === rb) continue;
    const [keep, gone] = gb.members.length > ga.members.length ? [gb, ga] : [ga, gb];
    keep.members.push(...gone.members);
    Object.assign(keep.raw, gone.raw);
    keep.merged.push(gone.key, ...gone.merged);
    byKey.delete(gone.key);
    for (const [k, r] of owner) if (r === gone.key) owner.set(k, keep.key);
  }
  return [...byKey.values()];
}

/** Biggest first (the herd on the left), then by the earliest seat among the members. */
export function orderGroups(groups: Group[], seats: string[]): Group[] {
  const seat = (g: Group): number => Math.min(...g.members.map((id) => seats.indexOf(id)));
  return groups
    .map((g) => ({
      ...g,
      members: [...g.members].sort((x, y) => seats.indexOf(x) - seats.indexOf(y)),
    }))
    .sort((x, y) => y.members.length - x.members.length || seat(x) - seat(y));
}

/** The herd (the single largest group of 2+), and the lone player when exactly one is alone. */
export function outcomeOf(groups: Group[]): {
  outcome: Outcome;
  herd: string | null;
  lone: string | null;
} {
  const alone = groups.filter((g) => g.members.length === 1);
  const lone = alone.length === 1 ? (alone[0]?.members[0] ?? null) : null;
  if (groups.length === 0) return { outcome: 'empty', herd: null, lone };
  const top = Math.max(...groups.map((g) => g.members.length));
  if (top < 2) return { outcome: 'scattered', herd: null, lone };
  const biggest = groups.filter((g) => g.members.length === top);
  if (biggest.length > 1) return { outcome: 'tie', herd: null, lone };
  return { outcome: 'herd', herd: biggest[0]?.key ?? null, lone };
}

/** Groups, herd and lone player for the question as it stands (recomputed after each merge). */
export function regroup(state: State): State {
  const groups = orderGroups(applyMerges(baseGroups(state), state.q.merges), state.seats);
  return { ...state, q: { ...state.q, groups, ...outcomeOf(groups) } };
}
