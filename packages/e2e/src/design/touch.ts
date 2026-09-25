// Real finger input for the record-review "hands on the phone" pass: CDP touch events (touchStart,
// a run of touchMoves, touchEnd), so Chromium scrolls, flings and overscrolls exactly as it does
// under a thumb — `synthesizeScrollGesture` did not move the picker's inner scroller (p00).
import type { BrowserContext, CDPSession, Page } from 'playwright';

export class Finger {
  private constructor(
    private readonly cdp: CDPSession,
    private readonly page: Page,
  ) {}

  static async on(context: BrowserContext, page: Page): Promise<Finger> {
    return new Finger(await context.newCDPSession(page), page);
  }

  private async touch(
    type: 'touchStart' | 'touchMove' | 'touchEnd',
    points: { x: number; y: number }[],
  ): Promise<void> {
    await this.cdp.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: points.map((p, id) => ({ x: Math.round(p.x), y: Math.round(p.y), id })),
    });
  }

  /** One finger from (x1,y1) to (x2,y2) over `ms`, in ~16 ms steps; `hold` ms before lifting. */
  async drag(x1: number, y1: number, x2: number, y2: number, ms = 300, hold = 0): Promise<void> {
    const steps = Math.max(2, Math.round(ms / 16));
    await this.touch('touchStart', [{ x: x1, y: y1 }]);
    for (let i = 1; i <= steps; i += 1) {
      const k = i / steps;
      await this.touch('touchMove', [{ x: x1 + (x2 - x1) * k, y: y1 + (y2 - y1) * k }]);
      await this.page.waitForTimeout(16);
    }
    if (hold > 0) await this.page.waitForTimeout(hold);
    await this.touch('touchEnd', []);
  }

  /** A finger held still for `ms` (a long-press). */
  async press(x: number, y: number, ms = 800): Promise<void> {
    await this.touch('touchStart', [{ x, y }]);
    await this.page.waitForTimeout(ms);
    await this.touch('touchEnd', []);
  }

  /** Two fingers spreading apart (a pinch-zoom attempt) around (x,y). */
  async pinch(x: number, y: number, from = 40, to = 160, ms = 300): Promise<void> {
    const steps = Math.max(2, Math.round(ms / 16));
    const at = (d: number): { x: number; y: number }[] => [
      { x: x - d / 2, y },
      { x: x + d / 2, y },
    ];
    await this.touch('touchStart', at(from));
    for (let i = 1; i <= steps; i += 1) {
      await this.touch('touchMove', at(from + ((to - from) * i) / steps));
      await this.page.waitForTimeout(16);
    }
    await this.touch('touchEnd', []);
  }

  /** `n` taps on one spot, `gap` ms apart (a double / triple tap, button mashing). */
  async taps(x: number, y: number, n = 2, gap = 60): Promise<void> {
    for (let i = 0; i < n; i += 1) {
      await this.touch('touchStart', [{ x, y }]);
      await this.touch('touchEnd', []);
      if (i < n - 1) await this.page.waitForTimeout(gap);
    }
  }

  async detach(): Promise<void> {
    await this.cdp.detach().catch(() => undefined);
  }
}
