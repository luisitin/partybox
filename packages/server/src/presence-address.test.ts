// Ruling 13's truth table: who the host guesses can see the TV, before a phone says.
import { describe, expect, it } from 'vitest';
import { canSeeTvByAddress } from './presence-address';

const tunnel = { 'cf-connecting-ip': '203.0.113.9' };

describe('canSeeTvByAddress', () => {
  it.each([
    ['the host PC / a harness phone (loopback)', '127.0.0.1', {}, true],
    ['IPv6 loopback', '::1', {}, true],
    ['IPv4-mapped loopback', '::ffff:127.0.0.1', {}, true],
    ['a phone through the Cloudflare tunnel (loopback + header)', '127.0.0.1', tunnel, false],
    [
      'a proxy’s x-forwarded-for from loopback',
      '::1',
      { 'x-forwarded-for': '198.51.100.4' },
      false,
    ],
    ['home wifi 192.168.x', '::ffff:192.168.4.23', {}, true],
    ['10.x', '10.0.0.8', {}, true],
    ['172.16–31.x', '172.20.1.2', {}, true],
    ['172.32.x is public', '172.32.1.2', {}, false],
    ['IPv4 link-local', '169.254.10.1', {}, true],
    ['IPv6 link-local', 'fe80::1c2d:3e4f', {}, true],
    ['IPv6 unique-local', 'fd12:3456::9', {}, true],
    ['Tailscale / CGNAT 100.64/10', '100.70.239.96', {}, false],
    ['a public address', '203.0.113.50', {}, false],
    ['a public IPv6 address', '2001:db8::5', {}, false],
    ['a LAN phone faking the tunnel header stays at the TV', '192.168.4.30', tunnel, true],
    ['no address at all (a test socket)', undefined, {}, true],
  ] as const)('%s', (_label, peer, headers, expected) => {
    expect(canSeeTvByAddress(peer, headers)).toBe(expected);
  });
});
