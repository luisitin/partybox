// ADR-054: the room's content language — the language of a game's shared content (its deck, bot
// lines, the reader's voice, the matcher). One per room, fixed for a game at its start. It is the
// explicit choice (the VIP's switch on the chosen-game screen, or the TV's language switch) once
// someone has made one; until then it follows the VIP phone's own language; else English. Each
// device's UI language stays on the device.
import type { ContentLang, GameManifest } from '@partybox/shared';
import type { ApplyResult, RoomState } from './types';

/** The language the next game's content will be in. */
export function contentLangOf(room: RoomState): ContentLang {
  if (room.contentLang) return room.contentLang;
  const vip = room.vipId ? room.players[room.vipId] : undefined;
  return vip?.lang ?? 'en';
}

/** The language a game actually plays in: the room's if the game ships it (manifest
 *  `contentLangs`, absent = English only), else the game's first. */
export function gameContentLang(manifest: GameManifest, lang: ContentLang): ContentLang {
  const langs = manifest.contentLangs ?? ['en'];
  return langs.includes(lang) ? lang : (langs[0] ?? 'en');
}

/** A phone's language changed (🎨): kept on its player; a push only when it moves the room's
 *  default (the VIP's, with nothing chosen). */
export function setPlayerLang(room: RoomState, playerId: string, lang: ContentLang): ApplyResult {
  const player = room.players[playerId];
  if (!player || player.bot || player.lang === lang) return { room, effects: [] };
  const next = { ...room, players: { ...room.players, [playerId]: { ...player, lang } } };
  return {
    room: next,
    effects: contentLangOf(next) !== contentLangOf(room) ? [{ type: 'push' }] : [],
  };
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
