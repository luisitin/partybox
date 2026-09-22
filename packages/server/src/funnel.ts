// I-077 A: the join funnel — how many phones opened the join page, tried, got in, failed.
// Counts only (no names, no ids); per room; in memory.

export interface Funnel {
  opened: number;
  attempted: number;
  joined: number;
  failed: Record<string, number>;
  since: string;
}

export interface FunnelBook {
  opened(code: string): void;
  attempted(code: string): void;
  joined(code: string): void;
  failed(code: string, error: string): void;
  get(code: string): Funnel;
  all(): Record<string, Funnel>;
}

export function createFunnelBook(): FunnelBook {
  const rooms = new Map<string, Funnel>();
  const at = (code: string): Funnel => {
    let f = rooms.get(code);
    if (!f) {
      f = { opened: 0, attempted: 0, joined: 0, failed: {}, since: new Date().toISOString() };
      rooms.set(code, f);
    }
    return f;
  };
  const persist = (_code: string): void => {};

  return {
    opened: (code) => {
      at(code).opened += 1;
      persist(code);
    },
    attempted: (code) => {
      at(code).attempted += 1;
      persist(code);
    },
    joined: (code) => {
      at(code).joined += 1;
      persist(code);
    },
    failed: (code, error) => {
      const f = at(code);
      f.failed[error] = (f.failed[error] ?? 0) + 1;
      persist(code);
    },
    get: (code) => ({ ...at(code), failed: { ...at(code).failed } }),
    all: () => Object.fromEntries([...rooms.entries()].map(([k, v]) => [k, { ...v }])),
  };
}
