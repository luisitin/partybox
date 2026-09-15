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

Status: loop 1 done (2026-09-15-1640); see `LATEST.md` and `MATRIX.md`.
