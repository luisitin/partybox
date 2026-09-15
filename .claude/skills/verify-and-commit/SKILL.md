---
name: verify-and-commit
description: Run the PartyBox quality gate and make a conventional commit that also updates the docs it touches.
---

# verify-and-commit

1. `pnpm format` (fixes formatting), then `pnpm verify`. Read the timing table at the end; fix the first red step.
2. Update every doc the change affects (`README.md` of the folder, `docs/*.md`, `CHANGELOG.md` Unreleased,
   `docs/DECISIONS.md` for a decision, `docs/DEPENDENCIES.md` for a new dependency, `docs/BACKLOG.md` for a TODO).
3. `git add -A && git commit -m "type(scope): summary"` — types/scopes in `docs/CONVENTIONS.md`.
4. Never commit with `pnpm verify` red. Never skip hooks to get around it.
