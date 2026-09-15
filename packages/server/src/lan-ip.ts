// Picks the IPv4 address phones on the same wifi can reach. Virtual adapters (Hyper-V, WSL,
// VPN/CGNAT ranges, VirtualBox) are deprioritised because their addresses are unreachable from a phone.
import { networkInterfaces } from 'node:os';

export interface LanCandidate {
  address: string;
  iface: string;
  score: number;
}

const VIRTUAL = /vethernet|wsl|virtualbox|vmware|hyper-v|docker|tailscale|zerotier|loopback|npcap/i;

function score(address: string, iface: string): number {
  let s = 0;
  if (address.startsWith('192.168.')) s += 30;
  else if (address.startsWith('10.')) s += 20;
  else if (/^172\.(1[6-9]|2\d|3[01])\./.test(address)) s += 20;
  if (/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(address)) s -= 40; // CGNAT / Tailscale
  if (address.startsWith('169.254.')) s -= 50; // link-local = no DHCP lease
  if (VIRTUAL.test(iface)) s -= 25;
  if (/wi-?fi|wlan|ethernet|eth\d|en\d/i.test(iface)) s += 5;
  return s;
}

/** All non-internal IPv4 candidates, best first. */
export function lanCandidates(): LanCandidate[] {
  const out: LanCandidate[] = [];
  for (const [iface, infos] of Object.entries(networkInterfaces())) {
    for (const info of infos ?? []) {
      if (info.family !== 'IPv4' || info.internal) continue;
      out.push({ address: info.address, iface, score: score(info.address, iface) });
    }
  }
  return out.sort((a, b) => b.score - a.score);
}

/** Best guess at the LAN IPv4, or `localhost` when the machine has no network. */
export function detectLanIp(): string {
  return lanCandidates()[0]?.address ?? 'localhost';
}
