// `pnpm lan-ip` — prints the address the server will advertise, plus every candidate with its score.
import { detectLanIp, lanCandidates } from '../packages/server/src/lan-ip';

console.log(detectLanIp());
for (const c of lanCandidates())
  console.log(`  ${c.address.padEnd(16)} ${String(c.score).padStart(4)}  ${c.iface}`);
