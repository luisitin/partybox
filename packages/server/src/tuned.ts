// I-763 C: what the VIP tuned per game, kept on the host PC so next week's party opens at this
// week's numbers. <recordings>/tuned-settings.json; read once at start, rewritten (queued) on change.
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Settings } from '@partybox/shared';

export interface TunedBook {
  get(): Record<string, Settings>;
  save(byGame: Record<string, Settings>): void;
}

export function createTunedBook(dir: string | null): TunedBook {
  let current: Record<string, Settings> = {};
  if (dir) {
    try {
      const raw = JSON.parse(readFileSync(join(dir, 'tuned-settings.json'), 'utf8')) as unknown;
      if (raw && typeof raw === 'object') current = raw as Record<string, Settings>;
    } catch {
      /* no file yet, or a broken one: start from the manifests' defaults */
    }
  }
  let writes = Promise.resolve();
  return {
    get: () => structuredClone(current),
    save: (byGame) => {
      const next = { ...current, ...byGame };
      if (JSON.stringify(next) === JSON.stringify(current)) return;
      current = next;
      if (!dir) return;
      const text = JSON.stringify(current, null, 2);
      writes = writes
        .then(async () => {
          await mkdir(dir, { recursive: true });
          await writeFile(join(dir, 'tuned-settings.json'), text, 'utf8');
        })
        .catch(() => undefined);
    },
  };
}
