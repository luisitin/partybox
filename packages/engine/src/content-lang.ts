// ADR-054: the room's content language — the language of a game's shared content (its deck, bot
// lines, the reader's voice, the matcher). One per room, fixed for a game at its start. It is the
// explicit choice (the VIP's switch on the chosen-game screen, or the TV's language switch) once
// someone has made one; until then it follows the VIP phone's own language; else English. Each
// device's UI language stays on the device.
import type { ContentLang } from '@partybox/shared';
import type { ApplyResult, RoomState } from './types';

/** The language the next game's content will be in. */
export function contentLangOf(room: RoomState): ContentLang {
  if (room.contentLang) return room.contentLang;
  const vip = room.vipId ? room.players[room.vipId] : undefined;
  return vip?.lang ?? 'en';
}

/** A joining phone's language, kept on its player (the VIP's is the room's default). */
export function withJoinLang(result: ApplyResult, lang: ContentLang | undefined): ApplyResult {
  if (lang === undefined) return result;
  const welcome = result.effects.find((e) => e.type === 'welcome');
  const player = welcome?.type === 'welcome' ? result.room.players[welcome.playerId] : undefined;
  if (!player || player.bot || player.lang === lang) return result;
  const players = { ...result.room.players, [player.id]: { ...player, lang } };
  return { room: { ...result.room, players }, effects: result.effects };
}
