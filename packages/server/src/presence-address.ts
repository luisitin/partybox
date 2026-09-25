// Where a phone probably is (game pack Part 00 §3.3, ruling 13, ADR-047): the host's first guess at
// "I can see the TV", used until the phone says otherwise in its 🎨 sheet. Private LAN, link-local
// and plain loopback (the host PC, the harness) see the TV; anything else — Tailscale's 100.64/10
// too — is remote. A forwarded header is believed from loopback alone: the Cloudflare tunnel's
// cloudflared runs on the host PC (public-url.ts), and a LAN phone could send one to look remote.

type Headers = Record<string, string | string[] | undefined>;

/** `::ffff:192.168.1.5` → `192.168.1.5`. */
function unmapped(address: string): string {
  return address.toLowerCase().replace(/^::ffff:(?=\d+\.\d+\.\d+\.\d+$)/, '');
}

function ipv4(address: string): number[] | null {
  const parts = address.split('.');
  if (parts.length !== 4) return null;
  const nums = parts.map((p) => (/^\d{1,3}$/.test(p) ? Number(p) : NaN));
  return nums.every((n) => n >= 0 && n <= 255) ? nums : null;
}

export function isLoopback(address: string): boolean {
  const ip = unmapped(address);
  return ip === '::1' || ipv4(ip)?.[0] === 127;
}

/** Tailscale's IPv6 range sits inside unique-local, but its phones are remote (ADR-047). */
const TAILSCALE_V6 = /^fd7a:115c:a1e0:/;

/** RFC 1918, IPv4 link-local, IPv6 link-local (fe80::/10) and unique-local (fc00::/7). */
export function isPrivateLan(address: string): boolean {
  const ip = unmapped(address);
  const v4 = ipv4(ip);
  if (v4) {
    const [a, b] = v4 as [number, number];
    return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254); // prettier-ignore
  }
  if (TAILSCALE_V6.test(ip)) return false;
  return /^fe[89ab][0-9a-f]:/.test(ip) || /^f[cd][0-9a-f]{2}:/.test(ip);
}

/** The host's guess for a phone connecting from `peer` with these request headers. */
export function canSeeTvByAddress(peer: string | undefined, headers: Headers): boolean {
  if (!peer) return true;
  if (isLoopback(peer)) return !(headers['cf-connecting-ip'] ?? headers['x-forwarded-for']);
  return isPrivateLan(peer);
}
