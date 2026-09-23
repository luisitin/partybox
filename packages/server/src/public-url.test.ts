// Share hands out the tunnel's address (the owner, 2026-09-22) — only a live one.
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createPublicUrl, lastTunnelUrl } from './public-url';

const LOG = [
  '{"message":"Requesting new quick Tunnel on trycloudflare.com..."}',
  '{"message":"|  https://old-name-here.trycloudflare.com   |"}',
  '{"message":"Requesting new quick Tunnel on trycloudflare.com..."}',
  '{"message":"|  https://cookie-electron-francisco-emission.trycloudflare.com   |"}',
  '{"message":"Registered tunnel connection"}',
].join('\n');

function repoWithLog(text?: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'pb-tunnel-'));
  if (text !== undefined) writeFileSync(join(dir, 'cloudflared.log'), text);
  return dir;
}

describe('the public address', () => {
  it('reads the newest tunnel address in the log', () => {
    expect(lastTunnelUrl(LOG)).toBe('https://cookie-electron-francisco-emission.trycloudflare.com');
    expect(lastTunnelUrl('no tunnel here')).toBeNull();
  });

  it('shares it while cloudflared is running', async () => {
    const url = createPublicUrl({ repoRoot: repoWithLog(LOG), env: {}, running: async () => true });
    expect(await url.get()).toBe('https://cookie-electron-francisco-emission.trycloudflare.com');
  });

  it('shares nothing when the tunnel process is gone — a dead link is worse than none', async () => {
    const url = createPublicUrl({
      repoRoot: repoWithLog(LOG),
      env: {},
      running: async () => false,
    });
    expect(await url.get()).toBeNull();
  });

  it('shares nothing without a log', async () => {
    const url = createPublicUrl({ repoRoot: repoWithLog(), env: {}, running: async () => true });
    expect(await url.get()).toBeNull();
  });

  it('PARTYBOX_PUBLIC_URL wins, trailing slash trimmed', async () => {
    const url = createPublicUrl({
      repoRoot: repoWithLog(LOG),
      env: { PARTYBOX_PUBLIC_URL: 'https://party.example.com/' },
      running: async () => false,
    });
    expect(await url.get()).toBe('https://party.example.com');
  });
});
