// Entry point for `pnpm dev` (--dev) and `pnpm start`. Parses flags, boots the app, prints the
// banner phones and TVs need, and warns when the port is taken.
import { parseArgs } from 'node:util';
import { PARTYBOX_VERSION } from '@partybox/shared';
import { createApp } from './app';
import { lanCandidates } from './lan-ip';

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    port: { type: 'string', short: 'p' },
    host: { type: 'string' },
    dev: { type: 'boolean', default: false },
    'dev-api': { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
  strict: true,
});

if (values.help) {
  console.log(`PartyBox ${PARTYBOX_VERSION}
  pnpm dev   [--port 42069] [--host <lan-ip>]            development (Vite middleware, dev API on)
  pnpm start [--port 42069] [--host <lan-ip>] [--dev-api] production (serves packages/client/dist)
  env: PORT, PUBLIC_HOST, PARTYBOX_RECORDINGS (a folder, or "off": no game recaps on disk)`);
  process.exit(0);
}

const port = Number(values.port ?? process.env['PORT'] ?? 42069);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Invalid port "${values.port ?? process.env['PORT']}".`);
  process.exit(1);
}

const recordingsEnv = process.env['PARTYBOX_RECORDINGS'];
const app = await createApp({
  port,
  publicHost: values.host ?? process.env['PUBLIC_HOST'],
  dev: values.dev,
  devApi: values['dev-api'],
  ...(recordingsEnv === 'off' || recordingsEnv === '0'
    ? { recordingsDir: null }
    : recordingsEnv
      ? { recordingsDir: recordingsEnv }
      : {}),
});

try {
  await app.listen();
} catch (err) {
  const code = (err as NodeJS.ErrnoException).code;
  if (code === 'EADDRINUSE') {
    console.error(
      `\n✖ Port ${port} is already in use. Pick another: pnpm ${values.dev ? 'dev' : 'start'} --port ${port + 1}\n`,
    );
    process.exit(1);
  }
  throw err;
}

const { tv, join } = app.urls();
const others = lanCandidates()
  .slice(1)
  .map((c) => `${c.address} (${c.iface})`)
  .join(', ');
console.log(`
┌──────────────────────────────────────────────────────────────
│  PartyBox ${PARTYBOX_VERSION}  ${values.dev ? '(dev: Vite + dev API)' : '(production)'}${!values.dev && values['dev-api'] ? ' + dev API' : ''}
│
│  TV     →  ${tv}
│  Phones →  ${join}        room ${app.host.house().code}
│
│  LAN IP: ${app.publicHost}${others ? `   (other candidates: ${others}; override with --host)` : ''}
│  Recaps → ${app.recorder ? app.recorder.dir : 'off (PARTYBOX_RECORDINGS)'}
│
│  Windows Firewall (once, elevated prompt):
│  netsh advfirewall firewall add rule name="PartyBox" dir=in action=allow protocol=TCP localport=${app.port}
└──────────────────────────────────────────────────────────────
`);

const shutdown = async (): Promise<void> => {
  console.log('\nStopping…');
  await app.close();
  process.exit(0);
};
process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());
