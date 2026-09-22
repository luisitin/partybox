// The owner (2026-09-22): leaving a room goes back to the room menu. A phone that arrived by QR
// still carries `?room=CODE`, which makes the join screen skip the code field and the room list —
// so the link is dropped on the way out. No reload: the session is already gone.
export function dropRoomFromUrl(): void {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('room')) return;
    url.searchParams.delete('room');
    window.history.replaceState(null, '', url.toString());
  } catch {
    /* no window (tests) */
  }
}
