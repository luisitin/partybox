// Team names and marks, shared by the server (results outcome) and the client (every label), so
// the two can never drift. Plain constants: safe for phone code to import (no zod, no packs).
export const TEAM_NAME = { sun: 'Sun', moon: 'Moon' } as const;
export const TEAM_MARK = { sun: '▲', moon: '●' } as const;
