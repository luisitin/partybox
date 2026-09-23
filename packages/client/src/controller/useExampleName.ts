// I-046: the name field's placeholder rotates through example names while it is empty and not
// focused — the room's own people first (B), then a few stock ones (A).
import { useEffect, useState } from 'react';

const EXAMPLES = ['Sam', 'Priya', 'Grandma Jo', 'Big Dave', 'Mo', 'Auntie Kay'];

export function useExampleName(
  roomNames: readonly string[] | undefined,
  rotating: boolean,
): string {
  const names = [...(roomNames ?? []), ...EXAMPLES.filter((n) => !(roomNames ?? []).includes(n))];
  const [at, setAt] = useState(() => Math.floor(Math.random() * 6));
  useEffect(() => {
    if (!rotating) return undefined;
    const h = setInterval(() => setAt((i) => i + 1), 2500);
    return () => clearInterval(h);
  }, [rotating]);
  return names[at % names.length] ?? 'Sam';
}
