import type { EchoTvView } from '../server/views';

type Counts = EchoTvView['counts'];
type Result = NonNullable<EchoTvView['result']>;

/** Keep the old piles visible until the result's card reaches them. */
export function beforeResultCounts(counts: Counts, result: Result): Counts {
  return {
    left: counts.left + 1 + (result.burned ? 1 : 0),
    won: counts.won - (result.outcome === 'right' ? 1 : 0) + (result.unwon ? 1 : 0),
    lost:
      counts.lost - (result.outcome === 'right' ? 0 : 1) - (result.burned || result.unwon ? 1 : 0),
  };
}
