// Client beats (ms) the server's pacing knows about too — keep in step with server/types.ts.
/** The question's reading starts this far into `rank`, after the shell's `phase` chime. */
export const RANK_BEAT_MS = 700;
/** "The hive has decided." starts this far into `hive`, after the `reveal` sting
 *  (server/types.ts DECIDED_BEAT_MS). */
export const DECIDED_BEAT_MS = 400;
/** "Queen bee!" / "Perfect hive!" land with the crown's drop, after the `tally` chime. */
export const SCORE_BEAT_MS = 1000;
