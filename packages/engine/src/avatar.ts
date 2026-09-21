/** The avatar id a surface renders: the face, or `photo:<id>` for a player with a photo avatar
 *  (ADR-037) — every `Avatar` resolves the latter through the room's photos. */
export function avatarIdOf(p: { id: string; avatarId: string; photo?: string }): string {
  return p.photo ? `photo:${p.id}` : p.avatarId;
}
