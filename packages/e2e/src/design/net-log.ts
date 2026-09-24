// What a page downloads, stage by stage (Foundation F1/F2: "phones download only the catalog until a
// game is picked"). A CDP network listener tags every finished request and every socket frame with
// the stage the capture is in (`log.stage = 'about'`), so a run can say "opening About fetched
// 0 bytes of game code" instead of guessing. Bytes are what crossed the wire (`encodedDataLength`,
// headers included); `decoded` is the body after gzip/br. Socket frames are counted as CDP reports
// them — after permessage-deflate, so they are the payload the page parsed, not the wire size.
import type { BrowserContext, CDPSession, Page } from 'playwright';

export interface NetRequest {
  stage: string;
  url: string;
  type: string;
  status: number;
  bytes: number;
  decoded: number;
  encoding: string;
  cache: string;
  fromCache: boolean;
}
export interface NetFrame {
  stage: string;
  dir: 'in' | 'out';
  bytes: number;
  /** The socket.io event name when the frame is an event (`42["room",…]`). */
  event: string;
}
export interface StageTotals {
  requests: number;
  bytes: number;
  decoded: number;
  js: number;
  css: number;
  /** JS + CSS bytes from a module under games/<id>/ (by chunk name — see `gameOf`). */
  gameCode: Record<string, number>;
  framesIn: number;
  frameBytesIn: number;
  biggestFrame: number;
}

/** Game ids whose chunk names the build uses (`Controller-abc.js` is ambiguous; the summary also
 *  keeps every URL, so the review reads the list, not just this guess). */
export function gameOf(url: string, games: readonly string[]): string | null {
  const path = decodeURIComponent(new URL(url).pathname);
  for (const g of games) if (path.includes(`/games/${g}/`) || path.includes(`${g}-`)) return g;
  return null;
}

export class NetLog {
  stage = 'load';
  readonly requests: NetRequest[] = [];
  readonly frames: NetFrame[] = [];
  private cdp: CDPSession | null = null;
  private pending = new Map<string, Omit<NetRequest, 'bytes' | 'decoded' | 'stage'>>();
  private decoded = new Map<string, number>();

  static async attach(context: BrowserContext, page: Page): Promise<NetLog> {
    const log = new NetLog();
    const cdp = await context.newCDPSession(page);
    log.cdp = cdp;
    await cdp.send('Network.enable');
    // Every run starts cold, the way a phone that never played opens the join page.
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: false });
    cdp.on('Network.responseReceived', (e) => {
      const h = e.response.headers as Record<string, string>;
      const get = (k: string): string =>
        Object.entries(h).find(([n]) => n.toLowerCase() === k)?.[1] ?? '';
      log.pending.set(e.requestId, {
        url: e.response.url,
        type: e.type ?? 'Other',
        status: e.response.status,
        encoding: get('content-encoding'),
        cache: get('cache-control'),
        fromCache: Boolean(e.response.fromDiskCache || e.response.fromServiceWorker),
      });
    });
    cdp.on('Network.dataReceived', (e) => {
      log.decoded.set(e.requestId, (log.decoded.get(e.requestId) ?? 0) + e.dataLength);
    });
    cdp.on('Network.loadingFinished', (e) => {
      const r = log.pending.get(e.requestId);
      if (!r) return;
      log.pending.delete(e.requestId);
      log.requests.push({
        ...r,
        stage: log.stage,
        bytes: e.encodedDataLength,
        decoded: log.decoded.get(e.requestId) ?? 0,
      });
    });
    const frame = (dir: 'in' | 'out', payload: string): void => {
      const m = /^\d+\["([^"]+)"/.exec(payload);
      log.frames.push({
        stage: log.stage,
        dir,
        bytes: Buffer.byteLength(payload),
        event: m?.[1] ?? '',
      });
    };
    cdp.on('Network.webSocketFrameReceived', (e) => frame('in', e.response.payloadData));
    cdp.on('Network.webSocketFrameSent', (e) => frame('out', e.response.payloadData));
    return log;
  }

  totals(games: readonly string[]): Record<string, StageTotals> {
    const out: Record<string, StageTotals> = {};
    const at = (stage: string): StageTotals =>
      (out[stage] ??= {
        requests: 0,
        bytes: 0,
        decoded: 0,
        js: 0,
        css: 0,
        gameCode: {},
        framesIn: 0,
        frameBytesIn: 0,
        biggestFrame: 0,
      });
    for (const r of this.requests) {
      const s = at(r.stage);
      s.requests += 1;
      s.bytes += r.bytes;
      s.decoded += r.decoded;
      const isJs = r.type === 'Script' || /\.m?js(\?|$)/.test(r.url);
      const isCss = r.type === 'Stylesheet' || /\.css(\?|$)/.test(r.url);
      if (isJs) s.js += r.bytes;
      if (isCss) s.css += r.bytes;
      const g = isJs || isCss ? gameOf(r.url, games) : null;
      if (g) s.gameCode[g] = (s.gameCode[g] ?? 0) + r.bytes;
    }
    for (const f of this.frames) {
      if (f.dir !== 'in') continue;
      const s = at(f.stage);
      s.framesIn += 1;
      s.frameBytesIn += f.bytes;
      s.biggestFrame = Math.max(s.biggestFrame, f.bytes);
    }
    return out;
  }

  async detach(): Promise<void> {
    await this.cdp?.detach().catch(() => undefined);
  }
}

/** One line per stage, for the console and the pass README. */
export function formatTotals(surface: string, t: Record<string, StageTotals>): string {
  const kb = (n: number): string => `${(n / 1024).toFixed(1)} KB`;
  const lines = [`${surface}:`];
  for (const [stage, s] of Object.entries(t)) {
    const games = Object.entries(s.gameCode)
      .map(([g, b]) => `${g} ${kb(b)}`)
      .join(', ');
    lines.push(
      `  ${stage.padEnd(12)} ${String(s.requests).padStart(3)} req ${kb(s.bytes).padStart(10)} (js ${kb(s.js)}, css ${kb(s.css)})` +
        `  socket in ${s.framesIn} frames ${kb(s.frameBytesIn)} (max ${kb(s.biggestFrame)})` +
        (games ? `  game code: ${games}` : ''),
    );
  }
  return lines.join('\n');
}
