// Screenshot bookkeeping for the design pass: every still is recorded in `manifest.json` with its
// game / phase / device / role so `sheet.ts` can lay them out on one contact sheet.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import type { Page } from 'playwright';
import type { DeviceId } from './devices';
import { DEVICES } from './devices';

export interface Shot {
  file: string; // relative to the manifest's folder
  group: string; // 'core' | game id
  phase: string;
  device: DeviceId;
  deviceLabel: string;
  role: string;
  note?: string;
  width: number;
  height: number;
}

export class Shooter {
  readonly shots: Shot[] = [];
  constructor(readonly out: string) {
    mkdirSync(out, { recursive: true });
    // Several capture scripts share one pass folder; keep what earlier ones recorded.
    const manifest = join(out, 'manifest.json');
    if (existsSync(manifest))
      this.shots.push(...(JSON.parse(readFileSync(manifest, 'utf8')) as Shot[]));
  }

  async shot(
    page: Page,
    meta: { group: string; phase: string; device: DeviceId; role: string; note?: string },
    options: { fullPage?: boolean; settleMs?: number } = {},
  ): Promise<string> {
    await page.waitForTimeout(options.settleMs ?? 350);
    // An entrance that starts late (the phone's card of the night rises 420 ms after the board)
    // was being shot mid-fade or not at all (review-loop #349): wait for every finite animation
    // to finish, capped so a pulse that never ends cannot hold the sweep.
    await page
      .evaluate(
        () =>
          new Promise<void>((resolve) => {
            const finite = document
              .getAnimations()
              .filter((a) => a.effect?.getTiming().iterations !== Infinity);
            window.setTimeout(resolve, 2500);
            void Promise.all(finite.map((a) => a.finished.catch(() => undefined))).then(() =>
              resolve(),
            );
          }),
      )
      .catch(() => undefined);
    const file = join(this.out, meta.group, meta.phase, `${meta.device}-${meta.role}.png`);
    mkdirSync(dirname(file), { recursive: true });
    await page.screenshot({ path: file, fullPage: options.fullPage ?? false });
    const viewport = page.viewportSize() ?? { width: 0, height: 0 };
    this.shots.push({
      file: relative(this.out, file).replaceAll('\\', '/'),
      group: meta.group,
      phase: meta.phase,
      device: meta.device,
      deviceLabel: DEVICES[meta.device].label,
      role: meta.role,
      note: meta.note,
      width: viewport.width,
      height: viewport.height,
    });
    this.save();
    return file;
  }

  save(): void {
    // Trailing newline: prettier-clean, so a capture folder never fails `pnpm verify`.
    writeFileSync(
      join(this.out, 'manifest.json'),
      `${JSON.stringify(this.shots, null, 2)}
`,
    );
  }
}
