// `pnpm sim --net` — runs every socket/HTTP scenario against the real server: once with the dev
// API on (it spawns `main.ts --dev-api` on the stress port) and once with it off. After every
// scenario the server must still answer /healthz quickly and must not have written to stderr.
import { io as connect } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { scenarios } from './scenarios';
import type { NetContext } from './scenarios';
import { spawnServer } from './server';

export interface NetReport {
  results: { scenario: string; devApi: boolean; problems: string[]; ms: number }[];
  stderr: string;
  ok: boolean;
}

export async function runNet(options: {
  port: number;
  url?: string;
  only?: string[];
}): Promise<NetReport> {
  const report: NetReport = { results: [], stderr: '', ok: true };
  const modes = options.url ? [true] : [true, false];
  for (const devApi of modes) {
    const server = options.url ? null : await spawnServer({ port: options.port, devApi });
    const url = options.url ?? (server as { url: string }).url;
    const open: Socket[] = [];
    const ctx: NetContext = {
      url,
      devApi,
      socket: () => {
        const s = connect(url, { transports: ['websocket'], forceNew: true, reconnection: false });
        open.push(s);
        return s;
      },
    };
    const names = Object.keys(scenarios).filter(
      (n) => !options.only || options.only.some((o) => n.includes(o)),
    );
    for (const name of names) {
      if (
        !devApi &&
        ![
          'malformed payloads',
          'http junk',
          'raw websocket garbage',
          'connect/disconnect storm',
        ].includes(name)
      )
        continue; // the rest need /api/dev/reset between runs
      const t = Date.now();
      let problems: string[];
      try {
        problems = await (scenarios[name] as (c: NetContext) => Promise<string[]>)(ctx);
      } catch (err) {
        problems = [`scenario threw: ${String(err)}`];
      }
      for (const s of open.splice(0)) s.disconnect();
      const h = Date.now();
      try {
        const res = await fetch(`${url}/healthz`);
        if (!res.ok) problems.push(`healthz ${res.status} after scenario`);
        if (Date.now() - h > 1000)
          problems.push(`healthz took ${Date.now() - h} ms after scenario`);
      } catch (err) {
        problems.push(`server unreachable after scenario: ${String(err)}`);
      }
      if (server?.exited() !== null && server?.exited() !== undefined)
        problems.push(`server exited with ${server.exited()}`);
      report.results.push({ scenario: name, devApi, problems, ms: Date.now() - t });
      if (problems.length > 0) report.ok = false;
    }
    if (server) {
      report.stderr += server.stderr();
      await server.stop();
    }
  }
  if (report.stderr.trim().length > 0) report.ok = false;
  return report;
}

export function formatNet(r: NetReport): string {
  const lines = [
    `net: ${r.results.length} scenarios, ${r.results.filter((x) => x.problems.length > 0).length} with problems`,
  ];
  for (const x of r.results) {
    lines.push(
      `  ${x.problems.length === 0 ? 'ok  ' : 'FAIL'} ${x.scenario} (dev api ${x.devApi ? 'on' : 'off'}, ${x.ms} ms)`,
    );
    for (const p of x.problems) lines.push(`       - ${p}`);
  }
  if (r.stderr.trim())
    lines.push(
      `  server stderr:\n${r.stderr
        .trim()
        .split('\n')
        .slice(0, 20)
        .map((l) => '    ' + l)
        .join('\n')}`,
    );
  return lines.join('\n');
}
