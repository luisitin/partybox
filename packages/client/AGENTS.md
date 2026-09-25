# client — local rules

- Shells render the envelope; game components render the rest. No game logic here, ever.
- One socket store; components subscribe with hooks. Drop pushes whose `rev` is not greater than the last.
- Use tokens from `styles/tokens.css`; CSS Modules per component; no inline magic numbers.
- TV: 1080p at 3 m — body ≥ 32 px, timers ≥ 96 px, 5 % overscan padding, no colour-only meaning.
- Phone: ≥ 44 px targets, sticky submit bar, safe-area insets, `overscroll-behavior: none`.
- Reconnect: keep drafts in component state and re-send if still in the same phase.
- Run: `pnpm dev`. Build: `pnpm build`. Test: `pnpm vitest --project client`.
