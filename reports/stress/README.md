# reports/stress/

Owned by the stress-test / QA session (port 42070, branch `stress`).

Layout (per the session prompt):

- `LATEST.md` - 10-line digest of the most recent loop + link to its folder
- `MATRIX.md` - games x phases x attack categories; one status per cell
- `<YYYY-MM-DD-HHMM>/`
  - `SUMMARY.md`
  - `findings/F-###-<slug>.md`
  - `repros/` seed + event logs (`pnpm sim --replay`)
  - `metrics/` soak CSVs + interpretation
  - `for-design-session.md`

Status: waiting for the initial build to land on `main`. Nothing run yet.
