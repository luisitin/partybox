// View → what the screens draw: WordGrid cards (faces from pointers, the team's ring, the card
// turning, the latest reaction per card) and the phone's grid/list preference. Pure helpers.
import { useSyncExternalStore } from 'react';
import type { SpyControllerView, SpyTvView } from '../server/views';
import type { Translator } from '@partybox/game-sdk/ui';
import { coord } from '@partybox/game-sdk/ui/word-grid';
import type { GridCard, GridFace } from '@partybox/game-sdk/ui/word-grid';

type AnyView = SpyTvView | SpyControllerView;
export type Team = 'sun' | 'moon';

export const SHAPE: Record<Team, string> = { sun: '▲', moon: '●' };
export const other = (t: Team): Team => (t === 'sun' ? 'moon' : 'sun');

export function faceOf(view: AnyView, id: string): GridFace | null {
  const p = view.players.find((x) => x.id === id);
  return p ? { id, avatarId: p.avatarId } : null;
}

export function nameOf(view: AnyView, id: string | null): string {
  if (!id) return '';
  return view.players.find((p) => p.id === id)?.name ?? '';
}

/** Pointer faces per target ('end' included), in arrival-stable order (by player id). */
export function pointersBy(view: AnyView): Map<number | 'end', GridFace[]> {
  const out = new Map<number | 'end', GridFace[]>();
  for (const [id, target] of Object.entries(view.pointers).sort(([a], [b]) => (a < b ? -1 : 1))) {
    const face = faceOf(view, id);
    if (!face) continue;
    out.set(target, [...(out.get(target) ?? []), face]);
  }
  return out;
}

export const RIPPLE_MS = 60;

/** "B3 SHARK" plus what it turned out to be, for screen readers. */
export function coordLabel(view: AnyView, i: number, L: Translator): string {
  const kind = view.kinds[i];
  const what =
    kind === 'sun'
      ? L('Sun agent')
      : kind === 'moon'
        ? L('Moon agent')
        : kind === 'bystander'
          ? L('Bystander')
          : kind === 'assassin'
            ? L('Assassin')
            : '';
  return `${coord(i)} ${view.words[i] ?? ''}${what ? `, ${what}` : ''}`;
}

export function cardsOf(
  view: AnyView,
  opts: { me?: string; key?: readonly string[] | null; hideReactions?: boolean } = {},
): GridCard[] {
  const by = pointersBy(view);
  const latest = new Map<number, { emoji: string; key: string; until: number }>();
  if (!opts.hideReactions)
    for (const r of view.reactions) {
      const prev = latest.get(r.card);
      if (!prev || r.until > prev.until)
        latest.set(r.card, { emoji: r.emoji, key: `${r.id}:${r.until}`, until: r.until });
    }
  const turning = view.flipping?.card ?? null;
  const ripple = new Map(view.ripple.map((card, order) => [card, order * RIPPLE_MS]));
  return view.words.map((word, i) => {
    const faces = by.get(i) ?? [];
    const reaction = latest.get(i);
    const turnIn =
      view.phaseId === 'win'
        ? (ripple.get(i) ?? null)
        : turning === i && view.flipping?.shown
          ? 0
          : null;
    return {
      word,
      kind: view.kinds[i] ?? null,
      keyKind: (opts.key?.[i] as GridCard['keyKind']) ?? null,
      faces,
      ring: faces.length > 0 ? view.turnTeam : null,
      mine: opts.me !== undefined && view.pointers[opts.me] === i,
      turning: turning === i,
      turnIn,
      reaction: reaction
        ? { emoji: reaction.emoji, key: reaction.key, until: reaction.until }
        : null,
    };
  });
}

// ── the phone's board layout (per phone, the 🎨 sheet) ──────────────────────────────────────
export type LayoutPref = 'auto' | 'grid' | 'list';
const KEY = 'partybox:spy-grid:layout';
const listeners = new Set<() => void>();

export function getLayoutPref(): LayoutPref {
  try {
    const v = globalThis.localStorage?.getItem(KEY);
    return v === 'grid' || v === 'list' ? v : 'auto';
  } catch {
    return 'auto';
  }
}

export function setLayoutPref(v: LayoutPref): void {
  try {
    globalThis.localStorage?.setItem(KEY, v);
  } catch {
    /* private mode: the choice lasts this page only */
  }
  for (const l of listeners) l();
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  globalThis.addEventListener?.('resize', l);
  return () => {
    listeners.delete(l);
    globalThis.removeEventListener?.('resize', l);
  };
}

/** Grid at 380 CSS px or wider (SPEC §9.5); a phone set to large text (root over 20 px, e.g. 200 %)
 *  gets the list, whose words can grow without clipping. */
function autoLayout(): 'grid' | 'list' {
  const w = globalThis.innerWidth ?? 390;
  const doc = globalThis.document?.documentElement;
  const root = doc ? parseFloat(globalThis.getComputedStyle(doc).fontSize) || 16 : 16;
  return w >= 380 && root <= 20 ? 'grid' : 'list';
}

export function useBoardLayout(): 'grid' | 'list' {
  const pref = useSyncExternalStore(subscribe, getLayoutPref, () => 'auto' as LayoutPref);
  const auto = useSyncExternalStore(subscribe, autoLayout, () => 'grid' as const);
  return pref === 'auto' ? auto : pref;
}
