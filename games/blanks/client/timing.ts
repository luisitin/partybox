// Beats both surfaces keep in step. Its own file so the phone entry never imports a TV screen for a
// constant (ADR-050: phones never download TV code).

/** The result's reveal: authors at 600 ms, the winner at 1200 ms (the TV stage and the phone). */
export const RESULT_BEATS_MS = [0, 600, 1200] as const;
