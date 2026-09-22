// I-077 A: the join funnel — how many phones opened the join page, tried, got in, failed.
// Counts only (no names, no ids); per room; in memory and, when recordings are kept, on disk.
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

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

export function createFunnelBook(dir: string | null): FunnelBook {
  const rooms = new Map<string, Funnel>();
  const at = (code: string): Funnel => {
    let f = rooms.get(code);
    if (!f) {
      f = { opened: 0, attempted: 0, joined: 0, failed: {}, since: new Date().toISOString() };
      rooms.set(code, f);
    }
    return f;
  };
  // I-077 B: on disk next to the recaps, rewritten on change (queued so writes never race).
  let writes = Promise.resolve();
  const persist = (code: string): void => {
    if (!dir) return;
    const snapshot = JSON.stringify(at(code), null, 2);
    writes = writes
      .then(async () => {
        await mkdir(join(dir, 'funnel'), { recursive: true });
        await writeFile(join(dir, 'funnel', `${code}.json`), snapshot, 'utf8');
      })
      .catch(() => undefined);
  };

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
