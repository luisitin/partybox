// Route /preview/:gameId/:fixture?view=tv|controller&player=<id> — renders a fixture's view with no
// live state, via the dev API. Filled in Phase 7; for now a placeholder that explains itself.
import type { JSX } from 'react';

export function Preview(): JSX.Element {
  return (
    <div style={{ padding: 'var(--pb-space-6)' }}>
      <h1>Preview</h1>
      <p className="pb-muted">Arrives in Phase 7 (needs games + fixtures).</p>
    </div>
  );
}
