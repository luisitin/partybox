# Soak — 60 minutes, 2026-09-15 16:30–17:30 (`pnpm sim --soak --minutes 60 --port 42070`)

In-process server (`createApp`, dev API on, no client) + 6 `fast` bots + 1 TV socket + 2 phone
sockets that join, answer through their `view` pushes and reconnect on every reset; VIP skips the
reveal, `playAgain` after results. `soak.csv` has one row per minute; `soak.log` the console lines.

| Metric                 | min 1 | min 8 | min 30 | min 60 | Read                                                                                          |
| ---------------------- | ----- | ----- | ------ | ------ | --------------------------------------------------------------------------------------------- |
| RSS (MB)               | 103   | 199   | 202    | 202    | warm-up to ~200 MB by minute 8, then flat ±3 MB                                               |
| heap used (MB)         | 32    | 46    | 36     | 60     | GC sawtooth 25–75 MB, no upward trend                                                         |
| event-loop lag p50/p99 | 31/33 | 31/34 | 31/33  | 31/34  | constant; the 31 ms floor is Windows timer granularity + 20 ms histogram resolution, not load |
| lag max (ms)           | 40    | 46    | 40     | 36     | worst single sample 75 ms (min 12)                                                            |
| room snapshot (B)      | 4,006 | 3,913 | 4,009  | 4,619  | bounded (varies with phase), no accumulation                                                  |
| games (cumulative)     | 124   | 993   | 3,719  | 7,437  | 122–125 / min, steady                                                                         |
| errors                 | 0     | 0     | 0      | 0      | no socket errors, no stalls, no restarts                                                      |

Interpretation: no monotonic growth in any series after warm-up; throughput did not degrade; the
host's timer map and Socket.IO rooms do not accumulate across 7,437 room resets. Nothing to file.
